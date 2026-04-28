from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import List


class User(BaseModel):
    name: str
    email: str
    password: str


class UserCreate(User):
    pass


class UserLogin(BaseModel):
    email: str
    password: str


class UserLogout(BaseModel):
    email: str


class UserResponse(BaseModel):
    id: UUID
    email: str

    class Config:
        from_attributes = True


class AccessToken(BaseModel):
    access_token: str


class RefreshToken(BaseModel):
    refresh_token: str


class GeneratedNote(BaseModel):
    """Note according to the topic"""

    title: str = Field(description="Give me best title according to the topic given")
    content: str = Field(
        description="Give me the detailed structured description according to the topic"
    )
    summary: str = Field(description="Give me summary of the whole content of the note")


class Topic(BaseModel):
    topic: str


class NoteCreate(BaseModel):
    folder_id: UUID
    user_id: UUID
    title: str
    content: str
    summary: str


class NoteUpdate(BaseModel):
    id: UUID
    title: str
    content: str
    summary: str


class FolderCreate(BaseModel):
    name: str
    user_id: UUID


class FolderUpdate(BaseModel):
    folder_id: UUID
    name: str


class FolderResponse(BaseModel):
    id: UUID
    name: str
    created_at: datetime

    class Config:
        from_attributes = True


class PDFNote(BaseModel):
    id: str


class YoutubeNoteGenerate(BaseModel):
    url: str


class QuizGenerate(BaseModel):
    topic: str
    number_of_questions: int
    difficulty: str


class OptionSchema(BaseModel):
    text: str
    is_correct: bool


class QuestionSchema(BaseModel):
    id: int
    question: str
    explanation: str
    options: List[OptionSchema]


class QuizResponseSchema(BaseModel):
    questions: List[QuestionSchema]


class QuestionResultSchema(BaseModel):
    question: str
    explanation: str
    options: List[OptionSchema]
    selected_option: str
    correct_option: str
    is_correct: bool


class QuizResultSchema(BaseModel):
    topic: str
    difficulty: str
    score: int
    user_id: UUID
    total_questions: int
    questions: List[QuestionResultSchema]


class OptionResponse(BaseModel):
    id: UUID
    option_text: str
    is_correct: bool

    class Config:
        from_attributes = True


class QuestionResponse(BaseModel):
    id: UUID
    question: str
    correct_option: str
    selected_option: str
    explanation: str
    is_correct: bool
    options: List[OptionResponse]

    class Config:
        from_attributes = True


class QuizResultResponse(BaseModel):
    id: UUID
    topic: str
    difficulty: str
    score: int
    total_questions: int
    created_at: datetime
    questions: List[QuestionResponse]

    class Config:
        from_attributes = True
