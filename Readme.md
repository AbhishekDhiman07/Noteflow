<div align="center">

# 📚 NoteFlow

### AI-Powered Intelligent Study Assistant

*Transform how you learn — chat with your PDFs, YouTube videos, and notes using AI*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![LangChain](https://img.shields.io/badge/LangChain-latest-1C3C3C?style=flat-square&logo=langchain&logoColor=white)](https://langchain.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [API Reference](#-api-reference) • [Project Structure](#-project-structure) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### 📝 AI Note Generation — Three Pipelines
- **From Topic** — Type any topic and get a structured, detailed Markdown note in seconds
- **From PDF** — Upload a PDF and let AI extract and synthesise it into clean notes
- **From YouTube** — Paste a YouTube URL and generate notes from the video transcript

### 💬 RAG-Based Conversational Chat
- **Chat with PDF** — Ask questions about any uploaded PDF document
- **Chat with YouTube** — Have a conversation with any YouTube video
- **Chat with Notes** — Query your own notes with semantic search

### 🧠 Adaptive Quiz Engine
- Generate multiple-choice quizzes on any topic
- Configurable difficulty: Easy / Medium / Hard
- Detailed per-question explanations and score breakdown
- Full quiz history with review

### 📁 Folder-Based Organisation
- Organise notes into folders
- Responsive grid layout across all screen sizes
- Inline note editing with Markdown preview

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **FastAPI** (Python 3.11) | REST API + SSE streaming |
| **SQLAlchemy + Alembic** | ORM and database migrations |
| **PostgreSQL 15** | Primary relational database |
| **PGVector** | Vector similarity search |
| **LangChain** | LLM orchestration and RAG pipeline |
| **HuggingFace** (`all-mpnet-base-v2`) | Text embeddings (768-dim) |
| **Groq** (LLaMA 3 70B) | LLM inference with streaming |
| **PyPDFLoader** | PDF text extraction |
| **youtube-transcript-api** | YouTube transcript extraction |
| **Pydantic v2** | Request validation and serialisation |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18 + TypeScript** | UI framework |
| **React Router v6** | Client-side routing |
| **Tailwind CSS** | Utility-first styling |
| **Axios** | REST API calls |
| **Fetch API** | SSE streaming responses |
| **ReactMarkdown** | Markdown rendering |
| **Lucide React** | Icon library |

---

## 🚀 Getting Started

### Prerequisites

- Python **3.11+**
- Node.js **18+** and npm
- PostgreSQL **15+** with the `pgvector` extension
- A **Groq API key** — free at [console.groq.com](https://console.groq.com)

### 1. Clone the Repository

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your values (see Environment Variables below)

# Enable pgvector in PostgreSQL
psql -U postgres -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Run database migrations
alembic upgrade head

# Start the development server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`  
Interactive docs at `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
bun install

# Configure backend URL
# Edit src/utils/backendUrl.ts:
# export const backendUrl = 'http://localhost:8000/api/v1';

# Start development server
bun run dev
```

The app will be available at `http://localhost:5173`

### 4. Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database
POSTGRES_URI=postgresql://username:password@localhost:5432/noteflow

# AI / LLM
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Authentication
SECRET_KEY=your-256-bit-random-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

> **Generate a secure SECRET_KEY:**
> ```bash
> openssl rand -hex 32
> ```

---

## 📁 Project Structure

```
noteflow/
├── backend/
│   ├── app/
│   │   ├── db/
│   │   │   ├── db.py                  # SQLAlchemy engine & session factory
│   │   │   ├── models.py              # ORM models
│   │   │   └── base.py                # Base class + TimestampMixin
│   │   ├── routers/
│   │   │   ├── auth.py                # /auth — register, login, JWT
│   │   │   ├── folder.py              # /folder — CRUD
│   │   │   ├── note.py                # /note — CRUD + AI generation
│   │   │   ├── quiz.py                # /quiz — generate + results
│   │   │   ├── chat.py                # /chat — PDF RAG chat
│   │   │   ├── yt_chat_router.py      # /yt-chat — YouTube RAG chat
│   │   │   ├── note_chat_router.py    # /note-chat — Notes RAG chat
│   │   │   └── yt.py                  # /yt — YouTube note generation
│   │   └── main.py                    # App factory, CORS, router registration
│   ├── uploads/                       # Temporary PDF storage (auto-cleaned)
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── context/
    │   │   │   ├── userContext.tsx     # Auth state + JWT management
    │   │   │   └── folderContext.tsx   # Folder list state
    │   │   ├── sidebar/
    │   │   │   └── AppSidebar.tsx      # Navigation sidebar
    │   │   ├── ui/                     # shadcn/ui components
    │   │   ├── Layout.tsx              # Sidebar + Outlet shell
    │   │   ├── DialogButton.tsx        # Create folder dialog
    │   │   ├── NoteType.tsx            # Note creation picker
    │   │   └── NumberOfQuestionsDialog.tsx
    │   ├── pages/
    │   │   ├── HomePage.tsx            # Folder grid
    │   │   ├── Notes.tsx               # Note grid
    │   │   ├── NoteDetailPage.tsx      # Note view + edit + quiz
    │   │   ├── CreateFromTopic.tsx     # AI topic → note
    │   │   ├── CreateFromPDF.tsx       # PDF → note
    │   │   ├── CreateFromYouTube.tsx   # YouTube → note
    │   │   ├── Chat.tsx                # PDF chat
    │   │   ├── ChatWithYouTube.tsx     # YouTube chat
    │   │   ├── ChatWithNotes.tsx       # Notes chat
    │   │   ├── TakeQuizPage.tsx        # Interactive quiz
    │   │   └── QuizResult.tsx          # Quiz results
    │   ├── utils/
    │   │   └── backendUrl.ts
    │   ├── types/                      # TypeScript interfaces
    │   ├── App.tsx                     # Route definitions
    │   └── main.tsx                    # Vite entry point
    ├── tailwind.config.js
    ├── vite.config.ts
    └── package.json
```

---

## 📡 API Reference

All endpoints are prefixed with `/api/v1/`.  
Authenticated endpoints require `Authorization: Bearer <token>` header.

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login and receive JWT token |

### Folders
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/folder/all-folders/{user_id}` | List all folders for a user |
| `POST` | `/folder/create` | Create a new folder |
| `DELETE` | `/folder/delete/{folder_id}` | Delete a folder |

### Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/note/all-notes/{folder_id}` | List notes in a folder |
| `GET` | `/note/note/{note_id}` | Get a single note |
| `POST` | `/note/create/` | Save a note |
| `PUT` | `/note/update-note` | Update a note |
| `DELETE` | `/note/delete-note/{note_id}` | Delete a note |
| `POST` | `/note/generate-note/` | Generate note from topic via LLM |

### PDF Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/upload-pdf/` | Upload and embed a PDF |
| `POST` | `/generate-note/` | Generate note from embedded PDF |
| `POST` | `/upload-chat-pdf/` | Upload PDF for chat |
| `POST` | `/chat-with-pdf/` | RAG chat over PDF *(SSE stream)* |
| `GET` | `/get-uploaded-files/{user_id}` | List uploaded PDFs |

### YouTube
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/yt/generate-yt-note/` | Generate note from YouTube video |
| `POST` | `/yt-chat/process-video` | Embed YouTube transcript |
| `POST` | `/yt-chat/chat` | RAG chat over video transcript *(SSE stream)* |
| `GET` | `/yt-chat/videos/{user_id}` | List processed videos |

### Notes Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/note-chat/embed/` | Embed a note for chat (idempotent) |
| `POST` | `/note-chat/chat/` | RAG chat over a note *(SSE stream)* |
| `GET` | `/note-chat/notes/{user_id}` | List all user notes |

### Quiz
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/quiz/generate-quiz/` | Generate quiz questions via LLM |
| `POST` | `/quiz/store-result/` | Persist a quiz attempt |
| `GET` | `/quiz/quiz/{quiz_id}` | Fetch a quiz result |
| `GET` | `/quiz/attempted` | List all quiz attempts for a user |

---

## 🗄 Database Schema

```
users
├── id (UUID, PK)
├── email (unique)
├── hashed_password
└── created_at

folders
├── id (UUID, PK)
├── name
├── user_id (FK → users)
└── created_at

notes
├── id (UUID, PK)
├── title
├── summary
├── content (Markdown)
├── folder_id (FK → folders)
├── user_id (FK → users)
├── created_at
└── updated_at

embedded_docs
├── id (UUID, PK)
├── doc_name
├── doc_id (unique — maps to PGVector collection)
├── user_id (FK → users)
├── source_type  (pdf | youtube | note)
├── source_url   (YouTube URL, if applicable)
├── source_note_id (note UUID, if applicable)
└── created_at

quiz_results
├── id (UUID, PK)
├── topic
├── difficulty
├── score
├── total_questions
├── questions (JSONB — full Q&A breakdown)
├── user_id (FK → users)
└── created_at
```

---

## ⚙️ How RAG Works in NoteFlow

```
User Question
      │
      ▼
 Embed question           ← all-mpnet-base-v2 (768-dim)
      │
      ▼
 PGVector similarity      ← filter: { doc_id: selectedDoc }
 search (top-5 chunks)
      │
      ▼
 Build system prompt      ← inject retrieved chunks as context
      │
      ▼
 Groq LLaMA 3 70B         ← streaming inference
      │
      ▼
 SSE stream to frontend   ← token-by-token typewriter effect
```

Every chat request is **strictly scoped** to the selected document via the `doc_id` metadata filter — no cross-user or cross-document leakage.

---

## 🗺 Roadmap

- [ ] Multi-turn chat memory (conversation history in RAG)
- [ ] Note versioning with rollback
- [ ] Bulk PDF upload
- [ ] Collaborative folders with shared access
- [ ] React Native mobile app
- [ ] WYSIWYG Markdown editor (TipTap)
- [ ] Spaced repetition quiz scheduler
- [ ] Knowledge graph — visualise note connections
- [ ] LMS integration (Canvas, Moodle via LTI)
- [ ] Voice input via Web Speech API

---

## 🤝 Contributing

Contributions are welcome!

```bash
# 1. Fork the repo and create a feature branch
git checkout -b feature/your-feature-name

# 2. Make your changes and commit
git commit -m "feat: add your feature description"

# 3. Push and open a Pull Request
git push origin feature/your-feature-name
```

Please follow the existing code style and make sure your changes don't break existing functionality before opening a PR.
