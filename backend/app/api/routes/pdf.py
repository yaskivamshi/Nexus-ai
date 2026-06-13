# app/api/routes/pdf.py
import os
import uuid
import tempfile
import logging
import json
from typing import Optional

from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

#from app.services.rag_service import rag_service

logger = logging.getLogger(__name__)
router = APIRouter()

# ── Request / Response schemas ────────────────────────────────────────────────

class PdfChatRequest(BaseModel):
    collection_name: str        # links to the ChromaDB collection
    question: str
    chat_history: list = []     # previous messages for context
    model: str = "llama3"

class SpecialQueryRequest(BaseModel):
    collection_name: str
    model: str = "llama3"
    query_type: str             # "summarize" | "skills" | "interview_questions"

# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    model: str = Form(default="llama3"),
):
    """
    Upload a PDF and run the full ingestion pipeline.
    Returns a collection_name the frontend uses for all subsequent queries.
    """
    # Validate it's actually a PDF
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # File size check (20MB limit)
    MAX_SIZE = 20 * 1024 * 1024  # 20MB
    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=413, detail="PDF must be under 20MB.")

    # Generate a unique collection name for ChromaDB
    safe_name = "".join(c if c.isalnum() else "_" for c in file.filename[:-4])
    collection_name = f"pdf_{safe_name[:30]}_{uuid.uuid4().hex[:8]}"

    # Write to a temp file so pypdf can read it
    try:
        with tempfile.NamedTemporaryFile(
            delete=False, suffix=".pdf", prefix="nexus_"
        ) as tmp:
            tmp.write(contents)
            tmp_path = tmp.name

        # Run ingestion (extract → chunk → embed → store)
        stats = await rag_service.ingest_pdf(
            file_path=tmp_path,
            collection_name=collection_name,
        )

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Ingestion failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
    finally:
        # Always clean up the temp file
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

    return {
        "collection_name": collection_name,
        "filename": file.filename,
        "page_count": stats["page_count"],
        "chunk_count": stats["chunk_count"],
        "message": f"Successfully processed {stats['page_count']} pages into {stats['chunk_count']} chunks.",
    }


@router.post("/chat/stream")
async def chat_with_pdf(request: PdfChatRequest):
    """
    Stream an answer to a question about the uploaded PDF.
    """
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    # 🦺 HARDWARE RAM SECURITY OVERRIDE
    if "/" not in request.model:
        request.model = "qwen2.5:1.5b"

    async def generate():
        try:
            async_generator = rag_service.query_pdf(
                collection_name=request.collection_name,
                question=request.question,
                chat_history=request.chat_history,
                model=request.model,
            )
            async for token in async_generator:
                if token:
                    # Wrapped in JSON layout payload to guarantee spaces are protected during network transfer
                    yield f"data: {json.dumps({'content': token})}\n\n"
            
            yield f"data: {json.dumps({'content': '[DONE]'})}\n\n"
        except Exception as e:
            logger.error(f"PDF chat error: {e}", exc_info=True)
            yield f"data: {json.dumps({'content': f'[ERROR] RAG loop failed: {str(e)}'})}\n\n"
            yield f"data: {json.dumps({'content': '[DONE]'})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@router.post("/special-query/stream")
async def special_query(request: SpecialQueryRequest):
    """
    Run one of the pre-built special queries: summarize, skills, or interview questions.
    """
    query_map = {
        "summarize": rag_service.summarize_pdf,
        "skills": rag_service.extract_skills,
        "interview_questions": rag_service.generate_interview_questions,
    }

    fn = query_map.get(request.query_type)
    if not fn:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown query type. Choose from: {list(query_map.keys())}"
        )

    # 🦺 HARDWARE RAM SECURITY OVERRIDE
    if "/" not in request.model:
        request.model = "qwen2.5:1.5b"

    async def generate():
        try:
            async_generator = fn(
                collection_name=request.collection_name,
                model=request.model,
            )
            async for token in async_generator:
                if token:
                    yield f"data: {json.dumps({'content': token})}\n\n"
            
            yield f"data: {json.dumps({'content': '[DONE]'})}\n\n"
        except Exception as e:
            logger.error(f"Special query error: {e}", exc_info=True)
            yield f"data: {json.dumps({'content': f'[ERROR] Analysis loop failed: {str(e)}'})}\n\n"
            yield f"data: {json.dumps({'content': '[DONE]'})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@router.delete("/{collection_name}")
async def delete_pdf_session(collection_name: str):
    """Delete a PDF session and its ChromaDB vectors."""
    rag_service.delete_collection(collection_name)
    return {"message": "Session deleted."}