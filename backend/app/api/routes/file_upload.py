from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from pathlib import Path
import uuid
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain_postgres import PGVector
from dotenv import load_dotenv
from app.db.models import EmbeddedDocs
from sqlalchemy.orm import Session
from app.db.db import get_db
from app.db.schemas import GeneratedNote, PDFNote
from langchain_groq import ChatGroq
from langchain.messages import HumanMessage
from langchain.tools import tool
from langchain.agents import create_agent
import os
from app.utils.note_prompt import topic_note_prompt


load_dotenv()

router = APIRouter(tags=["file_upload"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


def load_and_split_pdf(pdf_path: str):
    loader = PyPDFLoader(pdf_path)
    docs = loader.load()

    doc_id = str(uuid.uuid4())

    for doc in docs:
        doc.metadata["doc_id"] = doc_id
        doc.metadata["source"] = str(pdf_path)

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(docs)

    for split in splits:
        split.metadata["doc_id"] = doc_id
        split.metadata["source"] = str(pdf_path)

    return splits, doc_id


embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")

vectorstore = PGVector(
    embeddings=embeddings, collection_name="my_docs", connection=os.environ.get("POSTGRES_URI")
)


def store_embeddings(pdf_path: str):
    docs, doc_id = load_and_split_pdf(pdf_path)

    vectorstore.add_documents(docs)

    return doc_id


@tool
def pdf_search(id: str) -> str:
    """
    Use this tool to answer ANY question about the Context.
    The tool searches the similar context from the docs and give responses.
    ALWAYS use this tool before answering questions about the video.
    """
    res_docs = vectorstore.similarity_search(query=topic_note_prompt, k=3, id=id)
    return "\n\n".join(doc.page_content for doc in res_docs)


@router.post("/upload-pdf/")
async def file_upload(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    db: Session = Depends(get_db),
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    contents = await file.read()

    file_path = UPLOAD_DIR / file.filename
    with open(file_path, "wb") as f:
        f.write(contents)

    doc_id = store_embeddings(file_path)

    Path.unlink(file_path)

    db_doc = EmbeddedDocs(doc_name=file.filename, doc_id=doc_id, user_id=user_id)
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)

    return {"message": "File Uploaded", "result": db_doc}


@router.post("/generate-note/")
def generate_note(body: PDFNote):
    llm = ChatGroq(
        model="openai/gpt-oss-120b",
        temperature=0.2,
    )

    agent = create_agent(
        model=llm,
        tools=[pdf_search],
    )

    agent_result = agent.invoke(
        {
            "messages": [
                HumanMessage(
                    f"""
                    Generate detailed structured note from the context
                    Use the document with id: {body.id}
                    """
                )
            ]
        }
    )

    raw_content = agent_result["messages"][-1].content

    structured_response = llm.invoke(
        f"""
        Convert the following text into STRICT JSON.
        Make sure don't give document_id in the schema.

        JSON Schema:
        {{
          "title": string,
          "summary": string,
          "content": string
        }}

        Rules:
        - Return ONLY valid JSON
        - No markdown
        - No explanations
        - No extra text

        Text:
        {raw_content}
        """
    )

    return GeneratedNote.model_validate_json(structured_response.content)
