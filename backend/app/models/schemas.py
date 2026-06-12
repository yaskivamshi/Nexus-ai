# app/models/schemas.py
# Pydantic models validate and type-check all request/response data
from pydantic import BaseModel
from typing import List, Optional

class Message(BaseModel):
    role: str          # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    model: str = "llama3"  # Default to local Llama
    stream: bool = True

class PdfUploadResponse(BaseModel):
    session_id: str
    filename: str
    page_count: int
    message: str

class PdfChatRequest(BaseModel):
    session_id: str
    question: str
    model: str = "llama3"

class ResumeRequest(BaseModel):
    resume_text: str
    job_description: str
    model: str = "llama3"

class ResumeResponse(BaseModel):
    ats_score: int
    missing_keywords: List[str]
    suggestions: List[str]
    rewritten_resume: str
    professional_summary: str