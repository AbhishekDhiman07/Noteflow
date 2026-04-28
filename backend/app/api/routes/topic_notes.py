from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from langchain.messages import HumanMessage, SystemMessage
from app.db.schemas import GeneratedNote, Topic, NoteCreate, NoteUpdate
from app.db.models import Note
from app.db.db import get_db
from uuid import UUID
from langchain_groq import ChatGroq
from app.utils.note_prompt import topic_note_prompt

router = APIRouter(tags=["topic_notes"], prefix="/note")


@router.post("/generate-note/")
def create_note(body: Topic):
    llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.2)

    agent = llm.with_structured_output(GeneratedNote)

    res = agent.invoke(
        [
            SystemMessage(content=topic_note_prompt),
            HumanMessage(content=body.topic),
        ]
    )

    return res


@router.post("/create/")
def create(note: NoteCreate, db: Session = Depends(get_db)):
    db_note = Note(
        title=note.title,
        content=note.content,
        summary=note.summary,
        folder_id=note.folder_id,
        user_id=note.user_id,
    )
    if not db_note:
        raise HTTPException(status_code=402, detail="Unable to create note")
    db.add(db_note)
    db.commit()
    db.refresh(db_note)

    return {"message": "Note created Successfully"}


@router.get("/note/{id}")
def read_note(id: UUID, db: Session = Depends(get_db)):
    db_note = db.query(Note).filter(Note.id == id).first()

    if not db_note:
        raise HTTPException(status_code=402, detail="Note not found")

    return db_note


@router.put("/update-note/")
def update_note(note: NoteUpdate, db: Session = Depends(get_db)):
    db_note = db.query(Note).filter(Note.id == note.id).first()

    if not db_note:
        raise HTTPException(status_code=402, detail="Note not found")

    if note.title != None and note.content != None and note.summary != None:
        db_note.title = note.title
        db_note.content = note.content
        db_note.summary = note.summary

    db.commit()
    db.refresh(db_note)

    return {"message": "Note Updated Successfully", "updated_at": db_note.updated_at}


@router.delete("/delete-note/{id}")
def delete_note(id: UUID, db: Session = Depends(get_db)):
    db_note = db.query(Note).filter(Note.id == id).first()

    if not db_note:
        raise HTTPException(status_code=402, detail="Note not found")

    db.delete(db_note)
    db.commit()

    return {"message": "Note Deleted Successfully"}


@router.get("/all-notes/{folder_id}")
def all_notes(folder_id: UUID, db: Session = Depends(get_db)):
    notes = db.query(Note).filter(Note.folder_id == folder_id).all()

    return notes
