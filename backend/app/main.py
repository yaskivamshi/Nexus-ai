# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
#from app.api.routes import chat, pdf, resume, search, memory
from app.api.routes import chat, resume, search, memory


app = FastAPI(
    title="Nexus AI API",
    description="AI assistant backend — chat, PDF, resume, search, dynamic model catalogs",
    version="1.0.0",
    docs_url="/docs",
)

# Explicitly authorized domain origins list for production deployment match
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://nexus-ai-orr3.vercel.app",  # Your production frontend domain link
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
#app.include_router(pdf.router, prefix="/api/pdf", tags=["pdf"])
app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(memory.router, prefix="/api/memory", tags=["memory"])

@app.get("/")
def health_check():
    return {"status": "ok", "app": "Nexus AI", "version": "1.0.0"}