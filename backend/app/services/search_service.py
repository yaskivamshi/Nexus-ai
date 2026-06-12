# backend/app/services/search_service.py
#
# Perplexity-style search: search the web, summarize results with citations.
# Uses DuckDuckGo (completely free, no API key needed).
#
import logging
from typing import List, AsyncGenerator
from duckduckgo_search import DDGS

from app.services.ai_service import ai_service
from app.models.schemas import Message

logger = logging.getLogger(__name__)


class SearchService:

    def search_web(self, query: str, max_results: int = 6) -> List[dict]:
        """
        Searches DuckDuckGo and returns results.
        Each result: { title, href, body }
        No API key, no rate limits for reasonable usage.
        """
        try:
            with DDGS() as ddgs:
                results = list(ddgs.text(
                    query,
                    max_results=max_results,
                    region="wt-wt",
                    safesearch="off",
                ))
            return results
        except Exception as e:
            logger.error(f"DuckDuckGo search failed: {e}")
            return []

    async def search_and_summarize(
        self,
        query: str,
        model: str = "llama3",
    ) -> AsyncGenerator[str, None]:
        """
        Full Perplexity-style search pipeline:
          1. Search the web for the query
          2. Format results as numbered sources
          3. Ask LLM to synthesize a comprehensive answer with citations
          4. Stream the result
        """

        # Step 1: Fetch search results
        results = self.search_web(query, max_results=6)

        if not results:
            yield "I couldn't find any web results for that query. Try rephrasing."
            return

        # Step 2: Format results as numbered context
        sources_block = ""
        for i, r in enumerate(results, start=1):
            title = r.get("title", "Unknown")
            body = r.get("body", "")[:400]   # truncate snippets
            href = r.get("href", "")
            sources_block += f"[{i}] {title}\n{body}\nURL: {href}\n\n"

        # Step 3: Build the synthesis prompt
        prompt = f"""You are a research assistant. A user asked: "{query}"

Here are {len(results)} web search results to base your answer on:

{sources_block}

Instructions:
- Write a comprehensive, well-structured answer
- Cite sources using [1], [2], etc. inline wherever you use information from them
- Be factual and stick to what the sources say
- If sources conflict, note the disagreement
- End with a "Sources" section listing the URLs

Answer:"""

        messages = [Message(role="user", content=prompt)]

        # Stream the answer
        async for token in ai_service.stream_response(messages, model):
            yield token

        # Always append the source list at the end
        yield "\n\n---\n**Sources**\n"
        for i, r in enumerate(results, start=1):
            title = r.get("title", "Unknown")
            href = r.get("href", "#")
            yield f"\n[{i}] [{title}]({href})"


search_service = SearchService()