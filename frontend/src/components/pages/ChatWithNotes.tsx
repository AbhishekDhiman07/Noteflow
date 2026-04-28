import { useState, useRef, useEffect } from "react";
import {
  FileText,
  Send,
  Loader2,
  Bot,
  User,
  Search,
  ChevronDown,
  Clock,
  BookOpen,
  Sparkles,
} from "lucide-react";
import axios from "axios";
import { backendUrl } from "@/utils/backendUrl";
import { useCurrentUser } from "../context/userContext";

type Message = { role: "user" | "assistant"; content: string };

type NoteItem = {
  id: string;
  title: string;
  summary: string;
  updated_at: string;
};

type EmbedStatus = "idle" | "embedding" | "ready" | "error";

export function ChatWithNotes() {
  const { user } = useCurrentUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const [docId, setDocId] = useState("");
  const [embedStatus, setEmbedStatus] = useState<EmbedStatus>("idle");

  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchNotes = async () => {
    setLoadingNotes(true);
    try {
      const { data } = await axios.get(
        `${backendUrl}/note-chat/notes/${user?.id}`,
      );
      setNotes(data);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleSelectNote = async (note: NoteItem) => {
    if (selectedNote?.id === note.id) return;
    setSelectedNote(note);
    setMessages([]);
    setDocId("");
    setEmbedStatus("embedding");

    try {
      const { data } = await axios.post(`${backendUrl}/note-chat/embed/`, {
        note_id: note.id,
        user_id: user!.id,
      });
      setDocId(data.doc_id);
      setEmbedStatus("ready");
    } catch {
      setEmbedStatus("error");
    }
  };

  const handleSend = async () => {
    if (!question.trim() || !docId || isStreaming || embedStatus !== "ready")
      return;

    const userMsg: Message = { role: "user", content: question };
    setMessages((prev) => [
      ...prev,
      userMsg,
      { role: "assistant", content: "" },
    ]);
    setQuestion("");
    setIsStreaming(true);

    try {
      const formData = new FormData();
      formData.append("question", userMsg.content);
      formData.append("user_id", user!.id);
      formData.append("doc_id", docId);

      const response = await fetch(`${backendUrl}/note-chat/chat/`, {
        method: "POST",
        body: formData,
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6);
          if (raw === "[DONE]") break;
          try {
            const { content } = JSON.parse(raw);
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1].content += content;
              return updated;
            });
          } catch {}
        }
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.summary?.toLowerCase().includes(search.toLowerCase()),
  );

  const suggestions = [
    "Summarise this note",
    "What are the key concepts?",
    "Quiz me on this topic",
    "Explain the most important part",
  ];

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className="flex h-screen bg-slate-950 max-w-5xl mx-auto">
      {/* ── Left panel: Note selector ── */}
      <div className="w-64 flex-shrink-0 border-r border-slate-800 flex flex-col">
        {/* Panel header */}
        <div className="px-4 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-slate-200">My Notes</h2>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes…"
              className="w-full bg-slate-800 border border-slate-700 text-slate-300 placeholder:text-slate-600 text-xs pl-8 pr-3 py-2 rounded-lg outline-none focus:border-amber-500/40 transition-colors"
            />
          </div>
        </div>

        {/* Note list */}
        <div className="flex-1 overflow-y-auto py-2">
          {loadingNotes ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <FileText className="w-8 h-8 text-slate-800 mx-auto mb-2" />
              <p className="text-xs text-slate-600">No notes found</p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isSelected = selectedNote?.id === note.id;
              return (
                <button
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={[
                    "w-full text-left px-4 py-3 border-b border-slate-800/50 transition-colors",
                    isSelected
                      ? "bg-amber-500/10 border-l-2 border-l-amber-500"
                      : "hover:bg-slate-900/60 border-l-2 border-l-transparent",
                  ].join(" ")}
                >
                  <p
                    className={`text-xs font-medium truncate ${isSelected ? "text-amber-300" : "text-slate-300"}`}
                  >
                    {note.title}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                    {note.summary}
                  </p>
                  <p className="text-[10px] text-slate-700 mt-1.5 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {formatDate(note.updated_at)}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right panel: Chat ── */}
      <div className="flex-1 flex flex-col px-4 py-6 gap-4 min-w-0">
        {/* Chat header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex-shrink-0">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </span>
            <div>
              <h1 className="text-base font-semibold text-slate-100 leading-none truncate max-w-xs">
                {selectedNote ? selectedNote.title : "Chat with Notes"}
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                {embedStatus === "embedding"
                  ? "Preparing note…"
                  : embedStatus === "ready"
                    ? "Ready to chat"
                    : embedStatus === "error"
                      ? "Failed to prepare note"
                      : "Select a note to start"}
              </p>
            </div>
          </div>

          {/* Embed status indicator */}
          {embedStatus === "embedding" && (
            <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
              <Loader2 className="w-3 h-3 animate-spin" />
              Indexing…
            </div>
          )}
          {embedStatus === "ready" && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Ready
            </div>
          )}
          {embedStatus === "error" && (
            <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              Error
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-5 pr-1 min-h-0">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-12 text-slate-600">
              {!selectedNote ? (
                <>
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800">
                    <BookOpen className="w-7 h-7 text-slate-700" />
                  </div>
                  <p className="text-base font-medium text-slate-500">
                    Select a note to begin
                  </p>
                  <p className="text-sm text-center max-w-xs text-slate-600 leading-relaxed">
                    Pick a note from the left panel and ask anything about it.
                  </p>
                </>
              ) : embedStatus === "embedding" ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                  <p className="text-sm text-slate-500">Indexing your note…</p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800">
                    <FileText className="w-7 h-7 text-slate-700" />
                  </div>
                  <p className="text-base font-medium text-slate-500">
                    Ready to chat about "{selectedNote.title}"
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mt-1">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuestion(s)}
                        className="text-xs text-slate-500 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-slate-300 px-3.5 py-1.5 rounded-full transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 items-start ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={[
                    "flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg mt-0.5",
                    msg.role === "assistant"
                      ? "bg-amber-950/40 border border-amber-600/20"
                      : "bg-slate-800 border border-slate-700",
                  ].join(" ")}
                >
                  {msg.role === "assistant" ? (
                    <Bot className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </div>
                <div
                  className={[
                    "max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                    msg.role === "user"
                      ? "bg-slate-800 border border-slate-700 text-slate-200 rounded-tr-sm"
                      : "bg-slate-900/80 border border-slate-800 text-slate-200 rounded-tl-sm",
                  ].join(" ")}
                >
                  {msg.content === "" &&
                  msg.role === "assistant" &&
                  isStreaming ? (
                    <div className="flex items-center gap-1 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 animate-bounce [animation-delay:300ms]" />
                    </div>
                  ) : (
                    <>
                      {msg.content}
                      {msg.role === "assistant" &&
                        isStreaming &&
                        i === messages.length - 1 &&
                        msg.content && (
                          <span className="inline-block w-0.5 h-3.5 bg-amber-500 ml-0.5 align-middle rounded-sm animate-pulse" />
                        )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 flex items-end gap-2 bg-slate-900 border border-slate-800 focus-within:border-amber-600/30 rounded-2xl px-4 py-3 transition-colors">
          <textarea
            value={question}
            rows={1}
            onChange={(e) => {
              setQuestion(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height =
                Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              embedStatus === "ready"
                ? `Ask about "${selectedNote?.title}"…`
                : selectedNote
                  ? "Waiting for note to be indexed…"
                  : "Select a note from the left panel"
            }
            disabled={embedStatus !== "ready" || isStreaming}
            className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-slate-100 placeholder:text-slate-600 leading-relaxed min-h-[22px] max-h-[120px] caret-amber-500 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={
              !question.trim() || embedStatus !== "ready" || isStreaming
            }
            className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 hover:opacity-90 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 text-amber-950 animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-amber-950" />
            )}
          </button>
        </div>

        <p className="flex-shrink-0 text-center text-[11px] text-slate-700 -mt-2">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
