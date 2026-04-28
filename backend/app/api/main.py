from fastapi import APIRouter
from app.api.routes import file_upload,topic_notes, folder, youtube_notes, quiz, pdf_chat, youtube_chat, note_chat
from app.api.routes import user

api_router = APIRouter()

api_router.include_router(user.router)
api_router.include_router(file_upload.router)
api_router.include_router(topic_notes.router)
api_router.include_router(folder.router)
api_router.include_router(youtube_notes.router)
api_router.include_router(quiz.router)
api_router.include_router(pdf_chat.router)
api_router.include_router(youtube_chat.router)
api_router.include_router(note_chat.router)