

# backend/app/api/routes/resume.py
import json
import io
import logging
import asyncio
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel
from typing import List
from app.services.resume_service import resume_service

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Request Schemas ───────────────────────────────────────────────────────────

class ResumeAnalyzeRequest(BaseModel):
    resume_text: str
    job_description: str
    model: str = "openrouter/free"  # Default tracking target


class ResumeExportRequest(BaseModel):
    resume_content: str
    format: str = "pdf"   # "pdf" or "docx"


# ── Helper: Safe SSE Emit ─────────────────────────────────────────────────────

def sse_token(token: str) -> str:
    """
    ROOT CAUSE FIX 2:
    SSE format relies strictly on 'data: <content>\n\n'.
    If a token from an LLM contains a raw newline character (\n), the browser's 
    SSE parser reads it as a new line block without the 'data:' prefix, crashing the parser.
    
    Fix: First serialize the token token into an escaped JSON packet structure, 
    then ensure any internal newline characters are safely handled within the payload boundary.
    """
    packet = json.dumps({"content": token})
    return f"data: {packet}\n\n"


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/parse")
async def parse_resume(file: UploadFile = File(...)):
    """Upload a resume PDF and extract its text layout."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are supported.")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(413, "File must be under 10MB.")

    try:
        text = resume_service.extract_text_from_pdf(contents)
        if not text.strip():
            raise HTTPException(422, "Could not extract text — is this a scanned PDF?")
        return {"text": text, "char_count": len(text)}
    except Exception as e:
        logger.error(f"[Route/parse] Resume text parsing failure: {e}", exc_info=True)
        raise HTTPException(500, f"Parsing failed: {str(e)}")


@router.post("/analyze")
async def analyze_resume(request: ResumeAnalyzeRequest):
    """
    Score the resume against the job description instantly.
    Returns ATS score, matched keywords, and missing keywords (no LLM latency).
    """
    try:
        jd_keywords = resume_service.extract_keywords(request.job_description)
        score, matched, missing = resume_service.calculate_ats_score(
            request.resume_text, jd_keywords
        )
        return {
            "ats_score": score,
            "matched_keywords": matched[:30],
            "missing_keywords": missing[:30],
            "total_jd_keywords": len(jd_keywords),
        }
    except Exception as e:
        logger.error(f"[Route/analyze] Statistical scoring failure: {e}", exc_info=True)
        raise HTTPException(500, f"Analysis failed: {str(e)}")


@router.post("/rewrite/stream")
async def rewrite_resume_endpoint(request: ResumeAnalyzeRequest):
    """
    Stream the AI-rewritten resume optimized for ATS via Server-Sent Events.
    
    ROOT CAUSE FIX 3:
    Wrap the entire generation stream in a defensive try/except block.
    When a timeout or network drop occurs in a raw FastAPI generator, it terminates
    silently, leaving the frontend stuck. Catching it explicitly lets us emit an 
    [ERROR] state so the frontend UI can notify the user gracefully.
    """
    jd_keywords = resume_service.extract_keywords(request.job_description)
    score, matched, missing = resume_service.calculate_ats_score(
        request.resume_text, jd_keywords
    )

    async def generate():
        token_count = 0
        try:
            logger.info(f"[Route/rewrite] Stream started via model: {request.model}")
            
            async for token in resume_service.rewrite_resume(
                resume_text=request.resume_text,
                job_description=request.job_description,
                missing_keywords=missing,
                matched_keywords=matched,
                ats_score=score,
                model=request.model,
            ):
                if token:
                    # ROOT CAUSE FIX 2: Process token through safe line escaping utility
                    yield sse_token(token)
                    token_count += 1
                    
                    # Yield control back to the async event loop to ensure heartbeat continuity
                    if token_count % 30 == 0:
                        await asyncio.sleep(0)
            
            yield sse_token("[DONE]")
            logger.info(f"[Route/rewrite] Stream completed successfully. Emitted {token_count} tokens.")
            
        except Exception as e:
            logger.error(f"Critical exception intercepted inside rewrite text generation loop: {str(e)}", exc_info=True)
            yield sse_token(f"[ERROR] Optimization stream interrupted: {str(e)}")
            yield sse_token("[DONE]")

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            # These 4 headers together completely disable intermediary proxy caching/buffering
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
            "Transfer-Encoding": "chunked"
        },
    )


@router.post("/suggestions/stream")
async def get_suggestions(request: ResumeAnalyzeRequest):
    """Stream actionable improvement suggestions safely protected from line-break clipping."""
    jd_keywords = resume_service.extract_keywords(request.job_description)
    score, _, _ = resume_service.calculate_ats_score(
        request.resume_text, jd_keywords
    )

    async def generate():
        token_count = 0
        try:
            async for token in resume_service.generate_suggestions(
                request.resume_text, request.job_description, score, request.model
            ):
                if token:
                    yield sse_token(token)
                    token_count += 1
                    if token_count % 30 == 0:
                        await asyncio.sleep(0)
                        
            yield sse_token("[DONE]")
        except Exception as e:
            logger.error(f"Exception encountered inside suggestions route generator: {str(e)}", exc_info=True)
            yield sse_token(f"[ERROR] Suggestions stream cut: {str(e)}")
            yield sse_token("[DONE]")

    return StreamingResponse(
        generate(), 
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-store, must-revalidate", 
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
            "Transfer-Encoding": "chunked"
        }
    )


@router.post("/export")
async def export_resume(request: ResumeExportRequest):
    """Export the rewritten resume as PDF or DOCX using the updated formatting-recovery engine."""
    try:
        if request.format == "pdf":
            file_bytes = resume_service.export_to_pdf(request.resume_content)
            return Response(
                content=file_bytes,
                media_type="application/pdf",
                headers={"Content-Disposition": "attachment; filename=optimized_resume.pdf"},
            )
        elif request.format == "docx":
            file_bytes = resume_service.export_to_docx(request.resume_content)
            return Response(
                content=file_bytes,
                media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                headers={"Content-Disposition": "attachment; filename=optimized_resume.docx"},
            )
        else:
            raise HTTPException(400, "Format must be 'pdf' or 'docx'.")
    except Exception as e:
        logger.error(f"Document binary compilation failure: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Export failed: {str(e)}")
