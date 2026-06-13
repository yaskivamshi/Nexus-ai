# backend/app/services/rag_service.py
#
# This service handles everything RAG:
#   1. Ingest: extract PDF text → chunk → embed → store in ChromaDB
#   2. Query:  embed question → find similar chunks → build prompt → stream answer
#
import os
import uuid
import logging
from typing import List, AsyncGenerator
from pathlib import Path

import chromadb
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddingsfrom pypdf import PdfReader

from app.core.config import settings
from app.services.ai_service import ai_service
from app.models.schemas import Message

logger = logging.getLogger(__name__)

# ── Embedding model ──────────────────────────────────────────────────────────
# "all-MiniLM-L6-v2" is a small, fast, high-quality model.
# Downloads ~90MB on first run, then cached locally.
# No API key needed — runs 100% on your machine.
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# Where ChromaDB stores its files on disk (persists between restarts)
CHROMA_PERSIST_DIR = Path("./chroma_db")
CHROMA_PERSIST_DIR.mkdir(exist_ok=True)


class RAGService:
    def __init__(self):
        # Shared embedding model — loaded once, reused for every request
        self.embeddings = HuggingFaceEmbeddings(
            model_name=EMBEDDING_MODEL,
            model_kwargs={"device": "cpu"},   # change to "cuda" if you have a GPU
            encode_kwargs={"normalize_embeddings": True},
        )

        # Persistent ChromaDB client — data survives server restarts
        self.chroma_client = chromadb.PersistentClient(
            path=str(CHROMA_PERSIST_DIR)
        )

        # Text splitter — breaks PDF text into overlapping chunks
        # chunk_size=800 tokens ≈ ~1 paragraph
        # chunk_overlap=100 ensures context isn't cut off at boundaries
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=100,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""],
        )

    # ─────────────────────────────────────────────────────────────────────────
    # INGESTION: process a PDF file and store embeddings in ChromaDB
    # ─────────────────────────────────────────────────────────────────────────

    async def ingest_pdf(
        self,
        file_path: str,
        collection_name: str,
    ) -> dict:
        """
        Full ingestion pipeline:
          1. Read PDF and extract text per page
          2. Split text into overlapping chunks
          3. Generate embeddings for each chunk
          4. Store everything in ChromaDB

        Returns stats: page_count, chunk_count
        """
        logger.info(f"Ingesting PDF: {file_path} → collection: {collection_name}")

        # Step 1: Extract text from each page
        pages = self._extract_pdf_pages(file_path)
        logger.info(f"Extracted {len(pages)} pages")

        # Step 2: Chunk the text
        # Each chunk gets metadata: which page it came from
        chunks, metadatas = self._chunk_pages(pages)
        logger.info(f"Created {len(chunks)} chunks")

        if not chunks:
            raise ValueError("No text could be extracted from this PDF.")

        # Step 3 + 4: Embed and store in ChromaDB
        # Chroma.from_texts() handles embedding generation and storage
        vectorstore = Chroma.from_texts(
            texts=chunks,
            embedding=self.embeddings,
            metadatas=metadatas,
            collection_name=collection_name,
            persist_directory=str(CHROMA_PERSIST_DIR),
        )

        logger.info(f"Stored {len(chunks)} vectors in ChromaDB collection: {collection_name}")

        return {
            "page_count": len(pages),
            "chunk_count": len(chunks),
        }

    def _extract_pdf_pages(self, file_path: str) -> List[dict]:
        """
        Opens a PDF and returns a list of {page_number, text} dicts.
        Skips pages with no extractable text (scanned images).
        """
        reader = PdfReader(file_path)
        pages = []

        for page_num, page in enumerate(reader.pages, start=1):
            text = page.extract_text()
            if text and text.strip():
                pages.append({
                    "page_number": page_num,
                    "text": text.strip(),
                })

        return pages

    def _chunk_pages(self, pages: List[dict]) -> tuple[List[str], List[dict]]:
        """
        Splits page text into smaller chunks.
        Keeps page_number in metadata so we can cite sources later.
        """
        all_chunks = []
        all_metadatas = []

        for page in pages:
            # Split this page's text into chunks
            page_chunks = self.text_splitter.split_text(page["text"])

            for chunk_idx, chunk in enumerate(page_chunks):
                all_chunks.append(chunk)
                all_metadatas.append({
                    "page_number": page["page_number"],
                    "chunk_index": chunk_idx,
                    "source": f"Page {page['page_number']}",
                })

        return all_chunks, all_metadatas

    # ─────────────────────────────────────────────────────────────────────────
    # QUERY: answer a question using retrieved PDF context
    # ─────────────────────────────────────────────────────────────────────────

    async def query_pdf(
        self,
        collection_name: str,
        question: str,
        chat_history: List[dict],
        model: str = "llama3",
        k: int = 4,          # how many chunks to retrieve
    ) -> AsyncGenerator[str, None]:
        """
        Full query pipeline:
          1. Embed the question
          2. Find the k most similar chunks in ChromaDB
          3. Build a prompt: context + conversation history + question
          4. Stream the LLM answer

        Yields: tokens as they stream from the LLM
        """

        # Step 1 + 2: Retrieve relevant chunks
        retriever = self._get_retriever(collection_name, k=k)
        relevant_docs = retriever.invoke(question)

        if not relevant_docs:
            yield "I couldn't find relevant information in this PDF to answer your question."
            return

        # Step 3: Build the context block from retrieved chunks
        context_parts = []
        seen_pages = set()

        for doc in relevant_docs:
            page_num = doc.metadata.get("page_number", "?")
            seen_pages.add(page_num)
            context_parts.append(
                f"[Page {page_num}]\n{doc.page_content}"
            )

        context = "\n\n---\n\n".join(context_parts)
        pages_used = sorted(seen_pages)

        # Step 4: Build the full prompt
        # We inject:
        #   - The retrieved PDF context (grounding)
        #   - Previous messages (conversation history)
        #   - The current question
        system_prompt = f"""You are a helpful AI assistant answering questions about a PDF document.

Use ONLY the following extracted context from the document to answer the question.
If the answer is not in the context, say so honestly — do not make up information.
Always cite the page number(s) you used, like: (see page 3).

--- PDF CONTEXT ---
{context}
--- END CONTEXT ---

Important rules:
- Cite page numbers in your answer like (page 5) or (pages 3, 7)
- Be concise but thorough
- If you quote directly, use quotation marks
- If asked to summarize, provide a structured summary with key points"""

        # Build message list: system + history + current question
        messages = [Message(role="system", content=system_prompt)]

        # Add conversation history (last 6 messages to keep context manageable)
        for msg in chat_history[-6:]:
            messages.append(Message(role=msg["role"], content=msg["content"]))

        # Add the current question
        messages.append(Message(role="user", content=question))

        # Step 5: Stream the response
        # First emit source metadata as a special marker the frontend can parse
        source_info = f"\n\n---\n*Sources: pages {', '.join(str(p) for p in pages_used)}*"

        async for token in ai_service.stream_response(messages, model):
            yield token

        # Append the source citation after the main response
        yield source_info

    def _get_retriever(self, collection_name: str, k: int = 4):
        """
        Creates a LangChain retriever that searches ChromaDB
        for the k most semantically similar chunks.
        """
        vectorstore = Chroma(
            collection_name=collection_name,
            embedding_function=self.embeddings,
            persist_directory=str(CHROMA_PERSIST_DIR),
        )
        # MMR = Maximum Marginal Relevance: balances relevance + diversity
        # Avoids returning 4 chunks that all say the same thing
        return vectorstore.as_retriever(
            search_type="mmr",
            search_kwargs={"k": k, "fetch_k": k * 3},
        )

    # ─────────────────────────────────────────────────────────────────────────
    # SPECIAL QUERIES: summarize, extract skills, generate interview Qs
    # ─────────────────────────────────────────────────────────────────────────

    async def summarize_pdf(
        self,
        collection_name: str,
        model: str = "llama3",
    ) -> AsyncGenerator[str, None]:
        """Summarize the entire PDF using its most representative chunks."""

        # Retrieve more chunks for a full summary
        retriever = self._get_retriever(collection_name, k=10)
        # Use a broad query to get representative chunks from across the doc
        docs = retriever.invoke("main topics key points summary overview")

        if not docs:
            yield "Could not retrieve content from this PDF for summarization."
            return

        context = "\n\n---\n\n".join(
            f"[Page {d.metadata.get('page_number', '?')}]\n{d.page_content}"
            for d in docs
        )

        prompt = f"""Summarize the following document content in a clear, structured format.

{context}

Provide:
1. A 2-3 sentence executive summary
2. Key topics covered (as bullet points)
3. Important facts, figures, or conclusions
4. Any action items or recommendations mentioned"""

        messages = [Message(role="user", content=prompt)]
        async for token in ai_service.stream_response(messages, model):
            yield token

    async def extract_skills(
        self,
        collection_name: str,
        model: str = "llama3",
    ) -> AsyncGenerator[str, None]:
        """Extract technical and soft skills from a resume PDF."""

        retriever = self._get_retriever(collection_name, k=8)
        docs = retriever.invoke("skills experience technologies tools programming")

        context = "\n\n".join(d.page_content for d in docs)

        prompt = f"""Extract all skills from this resume content.

{context}

List them in these categories:
**Technical Skills:** (programming languages, frameworks, tools, platforms)
**Soft Skills:** (communication, leadership, teamwork, etc.)
**Domain Knowledge:** (industries, methodologies, certifications)
**Years of Experience:** (estimate if mentioned)"""

        messages = [Message(role="user", content=prompt)]
        async for token in ai_service.stream_response(messages, model):
            yield token

    async def generate_interview_questions(
        self,
        collection_name: str,
        model: str = "llama3",
    ) -> AsyncGenerator[str, None]:
        """Generate interview questions based on a resume PDF."""

        retriever = self._get_retriever(collection_name, k=8)
        docs = retriever.invoke("experience projects achievements skills background")

        context = "\n\n".join(d.page_content for d in docs)

        prompt = f"""Based on this resume, generate 10 targeted interview questions.

{context}

Generate:
- 3 technical questions (based on their specific tech stack)
- 3 behavioral questions (based on their experience/projects)
- 2 situational questions (based on their role history)
- 2 culture fit questions (based on their background)

For each question, add a brief note on what to look for in the answer."""

        messages = [Message(role="user", content=prompt)]
        async for token in ai_service.stream_response(messages, model):
            yield token

    def delete_collection(self, collection_name: str):
        """Delete a ChromaDB collection (called when user deletes a PDF session)."""
        try:
            self.chroma_client.delete_collection(collection_name)
            logger.info(f"Deleted ChromaDB collection: {collection_name}")
        except Exception as e:
            logger.warning(f"Could not delete collection {collection_name}: {e}")


# Single instance shared across the app
rag_service = RAGService()