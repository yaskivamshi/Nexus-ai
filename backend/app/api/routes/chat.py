# backend/app/api/routes/chat.py
import json
import logging
import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.models.schemas import ChatRequest
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

# ─────────────────────────────────────────────────────────────────────────────
# 1. NEW: DYNAMIC MODEL DISCOVERY LOGIC (NVIDIA & Hugging Face Auto-Discovery)
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/live-catalog")
async def get_live_catalog():
    """
    Dynamically fetches and unifies active open-access/free models from
    both NVIDIA API Catalog and Hugging Face Serverless Hub.
    """
    unified_catalog = []
    timeout = httpx.Timeout(10.0)

    async with httpx.AsyncClient(timeout=timeout) as client:
        # A. Fetch Dynamic NVIDIA NIM Clusters
        if settings.NVIDIA_API_KEY and "your_" not in settings.NVIDIA_API_KEY:
            try:
                nv_res = await client.get(
                    "https://integrate.api.nvidia.com/v1/models",
                    headers={"Authorization": f"Bearer {settings.NVIDIA_API_KEY}"}
                )
                if nv_res.status_code == 200:
                    nv_data = nv_res.json()
                    for model in nv_data.get("data", []):
                        mid = model.get("id", "")
                        
                        # Filter to capture text-generation and chat structures cleanly
                        if any(x in mid.lower() for x in ["instruct", "chat", "nemotron", "llama"]):
                            unified_catalog.append({
                                # Using "nvidia-nim/" prefix lets our streaming router catch it seamlessly
                                "id": f"nvidia-nim/{mid}", 
                                "name": mid.split('/')[-1].replace('-', ' ').upper(),
                                "provider": "nvidia",
                                "desc": "NVIDIA Accelerated Logic NIM Cluster"
                            })
            except Exception as e:
                logger.error(f"Dynamic NVIDIA Catalog Sync Failed: {str(e)}")

        # B. Fetch Top Trending/Free Text Models from Hugging Face Hub
        if settings.HUGGINGFACE_API_KEY and "your_" not in settings.HUGGINGFACE_API_KEY:
            try:
                hf_res = await client.get(
                    "https://huggingface.co/api/models?filter=text-generation&sort=downloads&direction=-1&limit=12",
                    headers={"Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}"}
                )
                if hf_res.status_code == 200:
                    hf_models = hf_res.json()
                    for m in hf_models:
                        mid = m.get("modelId", "")
                        unified_catalog.append({
                            "id": f"huggingface/{mid}",
                            "name": mid.split('/')[-1].replace('-', ' '),
                            "provider": "huggingface",
                            "desc": f"HF Open Weight ({int(m.get('downloads', 0)/1000)}k downloads/wk)"
                        })
            except Exception as e:
                logger.error(f"Dynamic Hugging Face Catalog Sync Failed: {str(e)}")

    # System Fallbacks array if external networks fail or keys are unconfigured
    if not unified_catalog:
        unified_catalog = [
            {"id": "nvidia-nim/meta/llama-3.1-405b-instruct", "name": "LLAMA 3.1 405B (NVIDIA)", "provider": "nvidia", "desc": "Fallback NIM"},
            {"id": "huggingface/mistralai/Mistral-7B-Instruct-v0.3", "name": "Mistral 7B v0.3 (HF)", "provider": "huggingface", "desc": "Fallback HF"}
        ]

    return {"success": True, "models": unified_catalog}

# ─────────────────────────────────────────────────────────────────────────────
# 2. NEW: NVIDIA NIM CLUSTER STREAMING WORKER
# ─────────────────────────────────────────────────────────────────────────────
async def stream_nvidia(payload: ChatRequest):
    if not settings.NVIDIA_API_KEY or "your_" in settings.NVIDIA_API_KEY:
        yield f"data: {json.dumps({'content': '[ERROR] NVIDIA API key missing in backend/.env configuration file!'})}\n\n"
        yield f"data: {json.dumps({'content': '[DONE]'})}\n\n"
        return

    # Strip our internal routing identifier before hitting production API
    target_model = payload.model.replace("nvidia-nim/", "")
    nv_url = "https://integrate.api.nvidia.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.NVIDIA_API_KEY}",
        "Content-Type": "application/json"
    }
    nv_payload = {
        "model": target_model,
        "messages": [msg.model_dump() if hasattr(msg, "model_dump") else msg for msg in payload.messages],
        "temperature": 0.2,
        "max_tokens": 1024,
        "stream": True
    }

    async with httpx.AsyncClient(timeout=45.0) as client:
        try:
            async with client.stream("POST", nv_url, headers=headers, json=nv_payload) as response:
                if response.status_code != 200:
                    yield f"data: {json.dumps({'content': f'[ERROR] NVIDIA NIM cluster rejected connection with state: {response.status_code}'})}\n\n"
                    return
                async for line in response.aiter_lines():
                    if not line or not line.strip(): continue
                    clean_line = line.strip()
                    if clean_line.startswith("data: "): clean_line = clean_line[6:]
                    if clean_line == "[DONE]":
                        yield f"data: {json.dumps({'content': '[DONE]'})}\n\n"
                        break
                    try:
                        data = json.loads(clean_line)
                        token = data.get("choices", [{}])[0].get("delta", {}).get("content", "")
                        if token: yield f"data: {json.dumps({'content': token})}\n\n"
                    except json.JSONDecodeError: continue
        except Exception as e:
            yield f"data: {json.dumps({'content': f'[ERROR] NVIDIA Streaming pipeline crash: {str(e)}'})}\n\n"

# ─────────────────────────────────────────────────────────────────────────────
# 3. NEW: HUGGING FACE INFERENCE ROUTER STREAMING WORKER
# ─────────────────────────────────────────────────────────────────────────────
async def stream_huggingface(payload: ChatRequest):
    if not settings.HUGGINGFACE_API_KEY or "your_" in settings.HUGGINGFACE_API_KEY:
        yield f"data: {json.dumps({'content': '[ERROR] Hugging Face API token missing in backend/.env file!'})}\n\n"
        yield f"data: {json.dumps({'content': '[DONE]'})}\n\n"
        return

    target_model = payload.model.replace("huggingface/", "")
    hf_url = "https://router.huggingface.co/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}",
        "Content-Type": "application/json"
    }
    hf_payload = {
        "model": target_model,
        "messages": [msg.model_dump() if hasattr(msg, "model_dump") else msg for msg in payload.messages],
        "temperature": 0.3,
        "max_tokens": 1024,
        "stream": True
    }

    async with httpx.AsyncClient(timeout=45.0) as client:
        try:
            async with client.stream("POST", hf_url, headers=headers, json=hf_payload) as response:
                if response.status_code != 200:
                    yield f"data: {json.dumps({'content': f'[ERROR] Hugging Face Hub inference exception returned state: {response.status_code}'})}\n\n"
                    return
                async for line in response.aiter_lines():
                    if not line or not line.strip(): continue
                    clean_line = line.strip()
                    if clean_line.startswith("data: "): clean_line = clean_line[6:]
                    if clean_line == "[DONE]":
                        yield f"data: {json.dumps({'content': '[DONE]'})}\n\n"
                        break
                    try:
                        data = json.loads(clean_line)
                        token = data.get("choices", [{}])[0].get("delta", {}).get("content", "")
                        if token: yield f"data: {json.dumps({'content': token})}\n\n"
                    except json.JSONDecodeError: continue
        except Exception as e:
            yield f"data: {json.dumps({'content': f'[ERROR] Hugging Face Gateway pipeline crash: {str(e)}'})}\n\n"

# ─────────────────────────────────────────────────────────────────────────────
# PIPELINE A: LOCAL OLLAMA STREAMING ENGINE (Offline/Local Memory)
# ─────────────────────────────────────────────────────────────────────────────
async def stream_ollama(payload: ChatRequest):
    ollama_url = f"{settings.OLLAMA_BASE_URL}/api/chat"
    ollama_payload = {
        "model": payload.model,
        "messages": [msg.model_dump() if hasattr(msg, "model_dump") else msg for msg in payload.messages],
        "stream": True
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            async with client.stream("POST", ollama_url, json=ollama_payload) as response:
                if response.status_code != 200:
                    yield f"data: {json.dumps({'content': 'Local Ollama model failed or ran out of memory.'})}\n\n"
                    return
                async for line in response.aiter_lines():
                    if not line or line.strip() == "": 
                        continue
                    try:
                        data = json.loads(line)
                        token = data.get("message", {}).get("content", "")
                        if token: 
                            yield f"data: {json.dumps({'content': token})}\n\n"
                        if data.get("done", False):
                            yield f"data: {json.dumps({'content': '[DONE]'})}\n\n"
                            break
                    except json.JSONDecodeError: 
                        continue
        except httpx.ConnectError:
            yield f"data: {json.dumps({'content': '[ERROR] Local Ollama service appears down. Run ollama serve!'})}\n\n"
            yield f"data: {json.dumps({'content': '[DONE]'})}\n\n"

# ─────────────────────────────────────────────────────────────────────────────
# PIPELINE B: OPENROUTER CLOUD STREAMING ENGINE (Online/High RAM Models)
# ─────────────────────────────────────────────────────────────────────────────
async def stream_openrouter(payload: ChatRequest):
    if not settings.OPENROUTER_API_KEY or "your_openrouter_key" in settings.OPENROUTER_API_KEY:
        yield f"data: {json.dumps({'content': '[ERROR] OpenRouter API key missing inside backend/.env file!'})}\n\n"
        yield f"data: {json.dumps({'content': '[DONE]'})}\n\n"
        return

    or_url = "https://openrouter.ai/api/v1/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": settings.FRONTEND_URL if settings.FRONTEND_URL else "http://localhost:5173",
        "X-Title": "Nexus AI"
    }
    
    target_model = payload.model
    if target_model.startswith("openrouter/"):
        target_model = target_model.replace("openrouter/", "")
        
    if target_model == "deepseek-chat":
        target_model = "deepseek/deepseek-chat"
    elif target_model == "free":
        target_model = "openrouter/free"

    or_payload = {
        "model": target_model,
        "messages": [msg.model_dump() if hasattr(msg, "model_dump") else msg for msg in payload.messages],
        "stream": True
    }
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            async with client.stream("POST", or_url, headers=headers, json=or_payload) as response:
                if response.status_code != 200:
                    yield f"data: {json.dumps({'content': f'OpenRouter Cloud rejected access with status code {response.status_code}.'})}\n\n"
                    return
                async for line in response.aiter_lines():
                    if not line or line.strip() == "": 
                        continue
                    clean_line = line.strip()
                    if clean_line.startswith("data: "): 
                        clean_line = clean_line[6:]
                    if clean_line == "[DONE]":
                        yield f"data: {json.dumps({'content': '[DONE]'})}\n\n"
                        break
                    try:
                        data = json.loads(clean_line)
                        token = data.get("choices", [{}])[0].get("delta", {}).get("content", "")
                        if token: 
                            yield f"data: {json.dumps({'content': token})}\n\n"
                    except json.JSONDecodeError: 
                        continue
        except Exception as e:
            yield f"data: {json.dumps({'content': f'[ERROR] Cloud streaming pipeline failure: {str(e)}'})}\n\n"
            yield f"data: {json.dumps({'content': '[DONE]'})}\n\n"

# ─────────────────────────────────────────────────────────────────────────────
# MAIN INTELLIGENT ROUTING INTERCEPTOR (With Active Cloud Switches)
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/stream")
async def chat_stream_endpoint(payload: ChatRequest):
    if not payload.messages:
        raise HTTPException(status_code=400, detail="No messages provided")

    # 1. Catch and Route NVIDIA NIM Strings
    if payload.model.startswith("nvidia-nim/"):
        logger.info(f"Routing query stream to NVIDIA NIM cluster: {payload.model}")
        return StreamingResponse(
            stream_nvidia(payload), 
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Connection": "keep-alive"}
        )

    # 2. Catch and Route Hugging Face Strings
    elif payload.model.startswith("huggingface/"):
        logger.info(f"Routing query stream to Hugging Face Hub: {payload.model}")
        return StreamingResponse(
            stream_huggingface(payload),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Connection": "keep-alive"}
        )

    # 3. Catch and Route OpenRouter Strings
    elif payload.model.startswith("openrouter/") or "/" in payload.model:
        logger.info(f"Routing request to cloud provider context path: {payload.model}")
        return StreamingResponse(
            stream_openrouter(payload), 
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Connection": "keep-alive"}
        )
    
    # 4. Fallback: Local Offline Ollama Engine Execution
    else:
        payload.model = "qwen2.5:1.5b"
        logger.info(f"Routing request to local offline engine layout context: {payload.model}")
        
        formatting_guard = (
            "CRITICAL FORMATTING RULE: You must write all software programming source code inside strict markdown blocks "
            "using standard triple backticks (e.g. ```python). Never collapse multiple statements or comments onto a single line. "
            "You must use clear vertical line breaks and standard structural indentation for lines."
        )
        
        if payload.messages[0].role == "system":
            payload.messages[0].content += f" {formatting_guard}"
        else:
            payload.messages.insert(0, {"role": "system", "content": formatting_guard})

        return StreamingResponse(
            stream_ollama(payload), 
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Connection": "keep-alive"}
        )