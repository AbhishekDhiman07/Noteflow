from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv
from app.db.schemas import GeneratedNote, YoutubeNoteGenerate
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import NoTranscriptFound, TranscriptsDisabled
import re
import os

load_dotenv()

router = APIRouter(tags=["youtube_notes"], prefix="/yt")


def extract_video_id(url: str) -> str | None:
    patterns = [
        r"(?:v=)([A-Za-z0-9_-]{11})",
        r"(?:youtu\.be/)([A-Za-z0-9_-]{11})",
        r"(?:embed/)([A-Za-z0-9_-]{11})",
        r"(?:shorts/)([A-Za-z0-9_-]{11})",
    ]
    for p in patterns:
        m = re.search(p, url)
        if m:
            return m.group(1)
    return None


def fetch_transcript(video_id: str) -> str:
    """
    Fetch transcript using YouTubeTranscriptApi v1.x instance API.
    Tries manual captions first, falls back to auto-generated.
    No audio download, no Whisper — just the caption text.
    """
    ytt = YouTubeTranscriptApi()

    try:
        fetched = ytt.fetch(video_id, languages=["en", "en-US", "en-GB", "hi"])
    except NoTranscriptFound:
        try:
            tlist = ytt.list(video_id)
            transcript = tlist.find_generated_transcript(["en", "hi"])
            fetched = transcript.fetch()
        except Exception:
            raise HTTPException(
                status_code=422,
                detail="No captions found for this video. Make sure it has subtitles or auto-captions enabled.",
            )
    except TranscriptsDisabled:
        raise HTTPException(
            status_code=422,
            detail="Transcripts are disabled for this video.",
        )
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Could not fetch transcript: {str(e)}",
        )
    try:
        text = " ".join(snippet.text for snippet in fetched)
    except AttributeError:
        text = " ".join(seg["text"] for seg in fetched)

    if not text.strip():
        raise HTTPException(status_code=422, detail="Transcript is empty.")

    return text


@router.post("/generate-yt-note/")
async def youtube_video(body: YoutubeNoteGenerate):
    video_id = extract_video_id(body.url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL.")

    transcript = fetch_transcript(video_id)

    llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.2)
    agent = llm.with_structured_output(GeneratedNote)

    res = agent.invoke([
        SystemMessage(content="You are a helpful AI assistant that generates detailed, structured notes from video transcripts. Create comprehensive notes with a clear title, concise summary, and well-organised markdown content."),
        HumanMessage(content=f"Generate structured notes from this video transcript:\n\n{transcript}"),
    ])

    return {"note": res}