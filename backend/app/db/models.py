from sqlalchemy import (
    Column,
    String,
    ForeignKey,
    Text,
    DateTime,
    func,
    Enum,
    Integer,
    Boolean,
)
from .db import Base
from sqlalchemy.orm import relationship
import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import UniqueConstraint
import enum


class Difficulty(enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class TimestampMixin:
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    refresh_token = Column(String, nullable=True)

    folders = relationship("Folder", back_populates="created_by", cascade="all, delete")
    notes = relationship("Note", back_populates="created_by", cascade="all, delete")
    embedded_docs = relationship(
        "EmbeddedDocs", back_populates="created_by", cascade="all, delete"
    )
    quiz = relationship(
        "QuizResult", back_populates="created_by", cascade="all, delete"
    )


class EmbeddedDocs(Base, TimestampMixin):
    __tablename__ = "embedded_docs"
 
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    doc_name = Column(String, nullable=False)
    doc_id = Column(String, nullable=False, unique=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    source_type = Column(String, nullable=True, default="pdf")

    source_url = Column(String, nullable=True)

    source_note_id = Column(String, nullable=True)
 
    created_by = relationship("User", back_populates="embedded_docs")


class Note(Base, TimestampMixin):
    __tablename__ = "notes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String)
    summary = Column(Text)
    content = Column(Text)
    folder_id = Column(UUID(as_uuid=True), ForeignKey("folders.id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    folder = relationship("Folder", back_populates="notes")
    created_by = relationship("User", back_populates="notes")


class Folder(Base, TimestampMixin):
    __tablename__ = "folders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    created_by = relationship("User", back_populates="folders")
    notes = relationship("Note", back_populates="folder", cascade="all, delete")

    __table_args__ = (UniqueConstraint("user_id", "name", name="unique_user_folder"),)


class QuizResult(Base, TimestampMixin):
    __tablename__ = "quizzes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    topic = Column(String)
    difficulty = Column(Enum(Difficulty))
    score = Column(Integer)
    total_questions = Column(Integer)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    questions = relationship("Question", back_populates="quiz", cascade="all, delete")
    created_by = relationship("User", back_populates="quiz")


class Question(Base):
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quiz_id = Column(UUID(as_uuid=True), ForeignKey("quizzes.id"))
    question = Column(Text)
    correct_option = Column(Text)
    selected_option = Column(Text)
    explanation = Column(Text)
    is_correct = Column(Boolean)

    quiz = relationship("QuizResult", back_populates="questions", cascade="all, delete")
    options = relationship(
        "Option", back_populates="question", cascade="all, delete"
    )


class Option(Base):
    __tablename__ = "options"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id"))
    option_text = Column(Text)
    is_correct = Column(Boolean)

    question = relationship("Question", back_populates="options")
