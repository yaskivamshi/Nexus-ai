# backend/app/api/routes/search.py
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.services.search_service import search_service

router = APIRouter()


class SearchRequest(BaseModel):
    query: str
    model: str = "llama3"


@router.post("/stream")
async def web_search(request: SearchRequest):
    """Search the web and stream a Perplexity-style summarized answer."""
    if not request.query.strip():
        raise HTTPException(400, "Query cannot be empty.")

    async def generate():
        try:
            async for token in search_service.search_and_summarize(
                request.query, request.model
            ):
                yield f"data: {token}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: Error: {str(e)}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.get("/raw")
async def raw_search(query: str, max_results: int = 5):
    """Return raw search results without LLM summarization."""
    results = search_service.search_web(query, max_results)
    return {"query": query, "results": results}