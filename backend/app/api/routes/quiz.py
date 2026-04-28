from fastapi import APIRouter, Depends, HTTPException
from langchain_groq import ChatGroq
from langchain.messages import HumanMessage, SystemMessage
from app.db.db import get_db
from sqlalchemy.orm import Session
from app.db.schemas import (
    QuizGenerate,
    OptionSchema,
    QuizResponseSchema,
    QuizResultSchema,
    QuizResultResponse,
)
from app.db.models import QuizResult, Question, Option
from typing import List
from uuid import UUID


router = APIRouter(tags=["quiz"], prefix="/quiz")


@router.post("/generate-quiz/")
def generate_quiz(body: QuizGenerate):
    llm = ChatGroq(
        model="openai/gpt-oss-120b",
        temperature=0.2,
    )

    structured_llm = llm.with_structured_output(QuizResponseSchema)

    result = structured_llm.invoke(
        [
            SystemMessage(
                f"""
                Generate exactly {body.number_of_questions} MCQ questions according to the Topic.
                Difficulty: {body.difficulty}
                Each question must have:
                - id (id should be like 1, 2, 3 ...)
                - question
                - explanation
                - 4 options
                - only ONE correct option
                """
            ),
            HumanMessage(f"Topic: {body.topic}"),
        ]
    )

    return result


@router.post("/store-result/")
def store_result(quiz_result: QuizResultSchema, db: Session = Depends(get_db)):
    quiz = QuizResult(
        topic=quiz_result.topic,
        difficulty=quiz_result.difficulty,
        score=quiz_result.score,
        total_questions=quiz_result.total_questions,
        user_id=quiz_result.user_id,
    )

    for q in quiz_result.questions:
        question = Question(
            question=q.question,
            correct_option=q.correct_option,
            selected_option=q.selected_option,
            explanation=q.explanation,
            is_correct=q.is_correct,
        )

        for opt in q.options:
            option = Option(
                option_text=opt.text,
                is_correct=opt.is_correct,
            )
            question.options.append(option)

        quiz.questions.append(question)

    db.add(quiz)
    db.commit()
    db.refresh(quiz)

    return {"quiz_id": quiz.id}


@router.get("/quiz-result/{user_id}", response_model=List[QuizResultResponse])
def get_user_quizzes(user_id: UUID, db: Session = Depends(get_db)):
    quizzes = (
        db.query(QuizResult)
        .filter(QuizResult.user_id == user_id)
        .order_by(QuizResult.created_at.desc())
        .all()
    )

    if not quizzes:
        return []

    return quizzes

@router.get("/quiz/{quiz_id}", response_model=QuizResultResponse)
def get_quiz_by_id(quiz_id: UUID, db: Session = Depends(get_db)):
    quiz = db.query(QuizResult).filter(QuizResult.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    return quiz
