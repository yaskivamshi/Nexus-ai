# backend/app/main.py
# FastAPI application entry point — cleanly structured imports
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import chat, pdf, resume, search, memory

app = FastAPI(
    title="Nexus AI API",
    description="AI assistant backend — chat, PDF, resume, search, dynamic model catalogs",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI at http://localhost:8000/docs
)

# CORS — allows the React frontend to call the backend safely
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",  # Local development fallback
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Register route modules — unified mounting lifecycle
# Note: chat.router contains both our /stream POST route and our new dynamic /live-catalog GET route!
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(pdf.router, prefix="/api/pdf", tags=["pdf"])
app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(memory.router, prefix="/api/memory", tags=["memory"])

@app.get("/")
def health_check():
    return {"status": "ok", "app": "Nexus AI", "version": "1.0.0"}