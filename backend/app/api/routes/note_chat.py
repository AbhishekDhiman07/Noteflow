from fastapi import APIRouter, HTTPException, Depends, Form
from fastapi.responses import StreamingResponse
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain_postgres import PGVector
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from sqlalchemy.orm import Session
from app.db.db import get_db
from app.db.models import EmbeddedDocs, Note       # import your Note model
from dotenv import load_dotenv
import os
import uuid
import json
from uuid import UUID
from pydantic import BaseModel

load_dotenv()

router = APIRouter(tags=["chat-notes"])

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")

vectorstore = PGVector(
    embeddings=embeddings,
    collection_name="uploaded_file_data",
    connection=os.environ.get("POSTGRES_URI"),
)

llm = ChatGroq(model="llama-3.3-70b-versatile", streaming=True)


def embed_note(note_id: str, user_id: str, db: Session) -> str:
    """
    Fetch note from DB, split content, embed into PGVector.
    Returns doc_id (stable per note — reuses existing one if present).
    """
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found.")

    existing = (
        db.query(EmbeddedDocs)
        .filter(
            EmbeddedDocs.source_note_id == note_id,
            EmbeddedDocs.source_type == "note",
        )
        .first()
    )
    if existing:
        return existing.doc_id

    doc_id = str(uuid.uuid4())
    full_text = f"Title: {note.title}\n\nSummary: {note.summary}\n\n{note.content}"

    doc = Document(
        page_content=full_text,
        metadata={
            "doc_id": doc_id,
            "source_type": "note",
            "user_id": user_id,
            "note_id": note_id,
        },
    )

    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=150)
    splits = splitter.split_documents([doc])

    for split in splits:
        split.metadata["doc_id"] = doc_id
        split.metadata["source_type"] = "note"
        split.metadata["user_id"] = user_id

    vectorstore.add_documents(splits)

    db_doc = EmbeddedDocs(
        doc_name=note.title[:255],
        doc_id=doc_id,
        user_id=user_id,
        source_type="note",
        source_note_id=str(note_id), 
    )
    db.add(db_doc)
    db.commit()

    return doc_id


class EmbedNoteRequest(BaseModel):
    note_id: str
    user_id: str


@router.post("/note-chat/embed/")
async def embed_note_endpoint(req: EmbedNoteRequest, db: Session = Depends(get_db)):
    doc_id = embed_note(req.note_id, req.user_id, db)
    return {"doc_id": doc_id, "message": "Note embedded successfully"}



@router.post("/note-chat/chat/")
async def chat_with_note(
    question: str = Form(...),
    user_id: str = Form(...),
    doc_id: str = Form(...),
    db: Session = Depends(get_db),
):
    doc = (
        db.query(EmbeddedDocs)
        .filter(EmbeddedDocs.doc_id == doc_id, EmbeddedDocs.user_id == user_id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Note embedding not found.")

    results = vectorstore.similarity_search(
        question,
        k=5,
        filter={"doc_id": doc_id},
    )

    if not results:
        raise HTTPException(status_code=404, detail="No relevant content found in this note.")

    context = "\n\n".join([r.page_content for r in results])

    system_prompt = (
        "You are a helpful study assistant. Answer the user's question using ONLY "
        "the note content provided below. Be concise and clear. "
        "If the answer is not in the note, say so.\n\n"
        f"Note content:\n{context}"
    )

    async def generate():
        async for chunk in llm.astream([
            SystemMessage(content=system_prompt),
            HumanMessage(content=question),
        ]):
            if chunk.content:
                yield f"data: {json.dumps({'content': chunk.content})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")



@router.get("/note-chat/notes/{user_id}")
async def get_user_notes(user_id: UUID, db: Session = Depends(get_db)):
    notes = (
        db.query(Note)
        .filter(Note.user_id == user_id)
        .order_by(Note.updated_at.desc())
        .all()
    )
    return [
        {
            "id": str(n.id),
            "title": n.title,
            "summary": n.summary,
            "updated_at": n.updated_at,
        }
        for n in notes
    ]