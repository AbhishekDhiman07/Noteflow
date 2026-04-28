from app.db.db import get_db
from app.db.models import Folder
from fastapi import APIRouter, Depends, HTTPException
from app.db.schemas import FolderCreate, FolderUpdate, FolderResponse
from sqlalchemy.orm import Session
from uuid import UUID

router = APIRouter(tags=["folder"], prefix="/folder")


@router.post("/create/")
def create(folder: FolderCreate, db: Session = Depends(get_db)):
    existing_folder = (
        db.query(Folder)
        .filter(
            Folder.user_id == folder.user_id,
            Folder.name == folder.name
        )
        .first()
    )

    if existing_folder:
        raise HTTPException(
            status_code=402, detail="Folder with this name already exist"
        )

    db_folder = Folder(name=folder.name, user_id=folder.user_id)

    db.add(db_folder)
    db.commit()
    db.refresh(db_folder)

    return {"status_code": 200, "message": "Folder Created","folder":db_folder}


@router.get("/all-folders/{user_id}", response_model=list[FolderResponse])
def get_all_folders(user_id: UUID, db: Session = Depends(get_db)):
    db_folders = db.query(Folder).filter(Folder.user_id == user_id).all()

    return db_folders


@router.put("/update/")
def update(folder: FolderUpdate, db: Session = Depends(get_db)):
    db_folder = db.query(Folder).filter(Folder.id == folder.folder_id).first()

    if not db_folder:
        raise HTTPException(status_code=402, detail="Folder not found")

    if folder.name != None:
        db_folder.name = folder.name

    db.commit()
    db.refresh(db_folder)

    return {"status_code": 200, "message": "Folder Updated", "folder": db_folder}


@router.delete("/delete/{folder_id}")
def delete(folder_id: UUID, db: Session = Depends(get_db)):
    db_folder = db.query(Folder).filter(Folder.id == folder_id).first()

    if not db_folder:
        raise HTTPException(status_code=402, detail="Folder not found")

    db.delete(db_folder)
    db.commit()

    return {"status_code": 200, "message": "Folder Deleted"}
