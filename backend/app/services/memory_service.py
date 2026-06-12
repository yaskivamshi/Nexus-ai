# backend/app/services/memory_service.py
#
# Persistent AI memory using Supabase.
# Stores key facts, preferences, and notes the AI should always remember.
# Injected into every chat as a system prompt prefix.
#
import logging
from typing import List, Optional
from supabase import create_client
from app.core.config import settings
from app.services.ai_service import ai_service
from app.models.schemas import Message

logger = logging.getLogger(__name__)

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


class MemoryService:

    def get_memories(self, user_id: str) -> List[dict]:
        """Fetch all memory entries for a user."""
        try:
            result = supabase.table("ai_memories") \
                .select("*") \
                .eq("user_id", user_id) \
                .order("importance", desc=True) \
                .limit(20) \
                .execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Failed to fetch memories: {e}")
            return []

    def add_memory(self, user_id: str, content: str, importance: int = 5) -> dict:
        """Add a new memory entry."""
        try:
            result = supabase.table("ai_memories").insert({
                "user_id": user_id,
                "content": content,
                "importance": min(max(importance, 1), 10),
            }).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            logger.error(f"Failed to add memory: {e}")
            return {}

    def delete_memory(self, memory_id: str, user_id: str) -> bool:
        """Delete a specific memory entry."""
        try:
            supabase.table("ai_memories") \
                .delete() \
                .eq("id", memory_id) \
                .eq("user_id", user_id) \
                .execute()
            return True
        except Exception as e:
            logger.error(f"Failed to delete memory: {e}")
            return False

    def build_memory_context(self, memories: List[dict]) -> str:
        """
        Format memories as a system prompt prefix.
        This gets prepended to every chat so the AI always knows this info.
        """
        if not memories:
            return ""

        lines = ["## What you remember about this user:"]
        for m in memories:
            lines.append(f"- {m['content']}")
        lines.append("")
        return "\n".join(lines)

    async def extract_and_save_memories(
        self,
        user_id: str,
        conversation: List[dict],
        model: str = "llama3",
    ) -> List[str]:
        """
        After a conversation, ask the AI to extract memorable facts
        and automatically save them to the memory store.
        """
        if len(conversation) < 2:
            return []

        conversation_text = "\n".join(
            f"{m['role'].upper()}: {m['content']}"
            for m in conversation[-10:]  # analyze last 10 messages
        )

        extraction_prompt = f"""Analyze this conversation and extract any facts worth remembering about the user.
Only extract genuinely useful, long-term information (not one-time requests).

Conversation:
{conversation_text}

Extract facts in this format (one per line):
MEMORY: [fact about the user] | IMPORTANCE: [1-10]

Examples:
MEMORY: Prefers Python over JavaScript | IMPORTANCE: 8
MEMORY: Works as a senior backend engineer | IMPORTANCE: 9
MEMORY: Learning machine learning, specifically transformers | IMPORTANCE: 7

Only output MEMORY lines. If nothing notable, output: NONE"""

        messages = [Message(role="user", content=extraction_prompt)]
        full_response = ""
        async for token in ai_service.stream_response(messages, model):
            full_response += token

        # Parse the extracted memories
        saved = []
        for line in full_response.split("\n"):
            if line.startswith("MEMORY:") and "| IMPORTANCE:" in line:
                try:
                    parts = line.split("| IMPORTANCE:")
                    content = parts[0].replace("MEMORY:", "").strip()
                    importance = int(parts[1].strip())

                    # Don't save if we already know this
                    existing = self.get_memories(user_id)
                    already_known = any(
                        content.lower() in m["content"].lower()
                        for m in existing
                    )

                    if not already_known and content:
                        self.add_memory(user_id, content, importance)
                        saved.append(content)
                except (ValueError, IndexError):
                    continue

        return saved


memory_service = MemoryService()