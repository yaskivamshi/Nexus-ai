# backend/app/api/routes/memory.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.memory_service import memory_service

router = APIRouter()


class AddMemoryRequest(BaseModel):
    user_id: str
    content: str
    importance: int = 5


class ExtractMemoryRequest(BaseModel):
    user_id: str
    conversation: list
    model: str = "llama3"


@router.get("/{user_id}")
def get_memories(user_id: str):
    return {"memories": memory_service.get_memories(user_id)}


@router.post("/")
def add_memory(request: AddMemoryRequest):
    result = memory_service.add_memory(
        request.user_id, request.content, request.importance
    )
    return result


@router.delete("/{memory_id}/{user_id}")
def delete_memory(memory_id: str, user_id: str):
    success = memory_service.delete_memory(memory_id, user_id)
    if not success:
        raise HTTPException(500, "Failed to delete memory.")
    return {"message": "Deleted."}


@router.post("/extract")
async def extract_memories(request: ExtractMemoryRequest):
    saved = await memory_service.extract_and_save_memories(
        request.user_id, request.conversation, request.model
    )
    return {"saved_memories": saved, "count": len(saved)}