# backend/app/services/ai_service.py
# Unified service that routes to Ollama (local), OpenRouter (cloud), Groq (cloud), or Hugging Face (cloud)
#
# ROOT CAUSE FIX 1: httpx timeout was ~5s default.
# Resume rewrite with Llama 3 or cloud free-tiers can take 60-120s → stream cut.
# Fix: timeout=None on streaming calls, 300s on non-streaming.
#
# ROOT CAUSE FIX 2: Added Groq and Hugging Face routing channels alongside fallback layers.

import httpx
import json
import asyncio
import logging
from typing import AsyncGenerator, List
from app.core.config import settings
from app.models.schemas import Message

logger = logging.getLogger(__name__)


class AIService:

    async def stream_response(
        self,
        messages: List[Message],
        model: str,
    ) -> AsyncGenerator[str, None]:
        """
        Unified router distributing traffic directly between local engines,
        OpenRouter cloud layers, Groq's network topology, and Hugging Face Serverless tracks.
        Yields clean text tokens (no raw SSE formatting done here).
        """
        if model.startswith("groq/"):
            actual_model = model.replace("groq/", "")
            async for token in self._stream_groq(messages, actual_model):
                yield token
        elif model.startswith("openrouter/"):
            actual_model = model.replace("openrouter/", "")
            async for token in self._stream_openrouter(messages, actual_model):
                yield token
        elif model.startswith("huggingface/"):
            actual_model = model.replace("huggingface/", "")
            async for token in self._stream_huggingface(messages, actual_model):
                yield token
        else:
            # Local Ollama loop with automated OpenRouter production failover fallback
            try:
                async for token in self._stream_ollama(messages, model):
                    yield token
            except RuntimeError as e:
                # If local Ollama fails or is down (e.g., in production), failover seamlessly to OpenRouter Free
                if "Ollama" in str(e):
                    logger.warning("[AIService] Local Ollama down/missing. Falling back to OpenRouter free-tier Llama 3 track...")
                    async for token in self._stream_openrouter(messages, "meta-llama/llama-3-8b-instruct:free"):
                        yield token
                else:
                    raise

    async def _stream_ollama(
        self,
        messages: List[Message],
        model: str,
    ) -> AsyncGenerator[str, None]:
        """
        Stream from local Ollama footprint instance.
        KEY FIX: connect=5s so we know fast if Ollama is down,
        but read=None means NO timeout while tokens are streaming.
        """
        url = f"{settings.OLLAMA_BASE_URL}/api/chat"
        payload = {
            "model": model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "stream": True,
            "options": {
                "num_predict": 4096,    # max tokens to generate
                "temperature": 0.7,
                "top_p": 0.9,
            }
        }

        timeout = httpx.Timeout(
            connect=5.0,    # fail fast if Ollama isn't running (triggers cloud fallback instantly)
            read=None,      # NO read timeout — stream can take as long as needed
            write=30.0,
            pool=5.0,
        )

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                async with client.stream("POST", url, json=payload) as response:
                    response.raise_for_status()

                    async for line in response.aiter_lines():
                        if not line:
                            continue
                        try:
                            data = json.loads(line)
                            token = data.get("message", {}).get("content", "")
                            if token:
                                yield token

                            if data.get("done", False):
                                break

                        except json.JSONDecodeError:
                            logger.warning(f"[AIService] Skipping malformed Ollama line: {line[:80]}")
                            continue

        except (httpx.ConnectError, httpx.ConnectTimeout):
            logger.error("[AIService] Cannot connect to Ollama. Routing engine fallback engaged.")
            raise RuntimeError("Cannot connect to Ollama server locally.")
        except httpx.HTTPStatusError as e:
            logger.error(f"[AIService] Ollama HTTP error: {e.response.status_code}")
            raise RuntimeError("Ollama returned an unexpected HTTP state structure.")
        except Exception as e:
            logger.error(f"[AIService] Ollama stream error: {e}", exc_info=True)
            raise

    async def _stream_openrouter(
        self,
        messages: List[Message],
        model: str,
    ) -> AsyncGenerator[str, None]:
        """Stream from OpenRouter with comprehensive error interceptors and infinite read timeout bounds."""
        url = "https://openrouter.ai/api/v1/chat/completions"
        
        # Mapping Normalization Layer for legacy/free configurations
        if model == "free" or model == "openrouter/free":
            model = "openrouter/free"
        elif model == "deepseek-chat":
            model = "deepseek/deepseek-chat"

        if not settings.OPENROUTER_API_KEY:
            logger.error("OpenRouter Stream Aborted: OPENROUTER_API_KEY configuration is blank or missing.")
            yield "Error: OpenRouter API Key configuration is missing on the server backend."
            return

        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "HTTP-Referer": settings.FRONTEND_URL if settings.FRONTEND_URL else "http://localhost:5173",
            "X-Title": "Nexus AI",
            "Content-Type": "application/json",
        }
        payload = {
            "model": model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "stream": True,
        }

        # KEY FIX: read=None prevents slow free proxies or reasoning steps from snapping sockets
        timeout = httpx.Timeout(connect=10.0, read=None, write=30.0, pool=5.0)

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                async with client.stream("POST", url, headers=headers, json=payload) as response:
                    if response.status_code != 200:
                        error_body = await response.aread()
                        decoded_error = error_body.decode(errors="ignore")
                        logger.error(f"OpenRouter rejected payload with code {response.status_code}. Context: {decoded_error}")
                        
                        try:
                            error_json = json.loads(decoded_error)
                            error_msg = error_json.get("error", {}).get("message", "Malformed parameters.")
                        except Exception:
                            error_msg = "Cloud router handshake invalid."
                            
                        yield f"Error: OpenRouter API returned status code {response.status_code} ({error_msg})."
                        return

                    async for line in response.aiter_lines():
                        if not line.startswith("data: "):
                            continue
                        data_str = line[6:].strip()
                        if data_str == "[DONE]":
                            break
                        try:
                            data = json.loads(data_str)
                            token = data["choices"][0]["delta"].get("content", "")
                            if token:
                                yield token
                        except (json.JSONDecodeError, KeyError, IndexError):
                            continue
        except httpx.TimeoutException:
            logger.error("Network read timeout during OpenRouter completion stream request.")
            yield "Error: OpenRouter connection request timeout."
        except Exception as e:
            logger.error(f"Unhandled socket disconnect inside OpenRouter thread: {str(e)}")
            yield "Error: Internal processing failure while piping cloud tokens."

    async def _stream_groq(
        self,
        messages: List[Message],
        model: str
    ) -> AsyncGenerator[str, None]:
        """Streams text chunks straight from Groq's ultra-low-latency hardware channels."""
        url = "https://api.groq.com/openai/v1/chat/completions"
        
        if not settings.GROQ_API_KEY:
            logger.error("Groq Routing Interrupted: GROQ_API_KEY is missing in backend/.env file.")
            yield "Error: Groq credential key configuration missing on backend."
            return

        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "stream": True
        }

        timeout = httpx.Timeout(connect=10.0, read=None, write=30.0, pool=5.0)

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                async with client.stream("POST", url, headers=headers, json=payload) as response:
                    if response.status_code != 200:
                        error_bytes = await response.aread()
                        logger.error(f"Groq API error (Code {response.status_code}): {error_bytes.decode()}")
                        yield f"Error: Groq cloud returned an error status code {response.status_code}."
                        return

                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            data_str = line[6:].strip()
                            if data_str == "[DONE]":
                                break
                            try:
                                data = json.loads(data_str)
                                token = data["choices"][0]["delta"].get("content", "")
                                if token:
                                    yield token
                            except (json.JSONDecodeError, KeyError, IndexError):
                                continue
        except Exception as e:
            yield f"Error: Groq pipeline network transport failure: {str(e)}"

    async def _stream_huggingface(
        self,
        messages: List[Message],
        model: str
    ) -> AsyncGenerator[str, None]:
        """Streams response tokens straight from Hugging Face Serverless Inference APIs."""
        # Endpoint schema maps as: https://api-inference.huggingface.co/models/<model_id>
        url = f"https://api-inference.huggingface.co/models/{model}"

        if not settings.HUGGINGFACE_API_KEY:
            logger.error("Hugging Face Stream Aborted: HUGGINGFACE_API_KEY configuration is missing.")
            yield "Error: Hugging Face security token is missing on the backend server."
            return

        headers = {
            "Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # Pull the last query content cleanly to support HF serverless inputs format profiles
        prompt_content = messages[-1].content if messages else ""
        
        payload = {
            "inputs": prompt_content,
            "parameters": {
                "max_new_tokens": 1024,
                "return_full_text": False,
                "temperature": 0.7
            },
            "options": {
                "use_cache": False,
                "wait_for_model": True
            }
        }

        timeout = httpx.Timeout(connect=15.0, read=None, write=30.0, pool=5.0)

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                async with client.post(url, headers=headers, json=payload) as response:
                    if response.status_code != 200:
                        error_text = await response.aread()
                        logger.error(f"Hugging Face execution invalid (Code {response.status_code}): {error_text.decode()}")
                        yield f"Error: Hugging Face inference node returned status code {response.status_code}."
                        return

                    # Normalizing Hugging Face output format into direct streaming tokens
                    response_json = await response.json()
                    if isinstance(response_json, list) and len(response_json) > 0:
                        generated_text = response_json[0].get("generated_text", "")
                    else:
                        generated_text = response_json.get("generated_text", "")

                    if generated_text:
                        # Yield the response out in small chunks to preserve frontend token animation styling mechanics
                        chunks = [generated_text[i:i+4] for i in range(0, len(generated_text), 4)]
                        for chunk in chunks:
                            yield chunk
                            await asyncio.sleep(0.01) # Micro sleep simulates typing animation layout updates smoothly
        except Exception as e:
            logger.error(f"Hugging Face Transport Stream Exception: {str(e)}")
            yield f"Error: Hugging Face routing layer crashed: {str(e)}"

    async def complete(
        self,
        messages: List[Message],
        model: str,
    ) -> str:
        """
        Non-streaming version — returns full response packet strings.
        Use for swift calculations, keyword extraction, and scoring matrices.
        """
        full_response = ""
        async for token in self.stream_response(messages, model):
            full_response += token
        return full_response


# Single instance — imported across the app modules
ai_service = AIService()