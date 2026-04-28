import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, FileText, ArrowLeft } from "lucide-react";
import axios from "axios";
import { backendUrl } from "@/utils/backendUrl";
import { useCurrentUser } from "../context/userContext";

export function CreateFromTopic() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedContent, setGeneratedContent] = useState({
    title: "",
    content: "",
    summary: "",
  });
  const { id } = useParams();
  const { user } = useCurrentUser();

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    try {
      const res = await axios.post(`${backendUrl}/note/generate-note/`, {
        topic,
      });
      setGeneratedContent({
        title: res.data.title,
        content: res.data.content,
        summary: res.data.summary,
      });
      setPreviewMode(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveNote = async () => {
    setIsSaving(true);
    try {
      await axios.post(`${backendUrl}/note/create/`, {
        ...generatedContent,
        user_id: user?.id,
        folder_id: id,
      });
      navigate(`/folder/${id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const tips = [
    "Be specific — 'React Hooks' over 'React'",
    "Add context like 'for beginners' or 'advanced'",
    "Specify depth — 'brief overview' or 'deep dive'",
  ];

  return (
    <div className="min-h-full bg-slate-950 px-4 sm:px-8 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(`/folder/${id}`)}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors mr-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Create from Topic
            </h1>
            <p className="text-slate-500 text-sm">
              AI-generated notes on any subject
            </p>
          </div>
        </div>

        {!previewMode ? (
          <div className="space-y-5">
            {/* Input card */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 block">
                  Topic
                </label>
                <Input
                  placeholder="e.g. Quantum Computing, Machine Learning, World War II…"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    !isGenerating &&
                    topic.trim() &&
                    handleGenerate()
                  }
                  className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-600 text-base focus:border-cyan-500/50 h-11"
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-sm font-semibold transition-colors"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Generating
                    Notes…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Generate Note
                  </>
                )}
              </button>
            </div>

            {/* Tips */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5">
              <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                <FileText className="w-3.5 h-3.5" />
                Tips for Better Notes
              </h3>
              <ul className="space-y-2">
                {tips.map((tip, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <span className="text-cyan-600 mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* AI badge */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full">
                <Sparkles className="w-3 h-3" />
                AI Generated Preview
              </span>
              <button
                onClick={() => setPreviewMode(false)}
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
              >
                ← Back to topic
              </button>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-5">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                  Title
                </label>
                <Input
                  value={generatedContent.title}
                  onChange={(e) =>
                    setGeneratedContent({
                      ...generatedContent,
                      title: e.target.value,
                    })
                  }
                  className="bg-slate-800 border-slate-700 text-slate-100 focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                  Summary
                </label>
                <Textarea
                  value={generatedContent.summary}
                  onChange={(e) =>
                    setGeneratedContent({
                      ...generatedContent,
                      summary: e.target.value,
                    })
                  }
                  className="bg-slate-800 border-slate-700 text-slate-100 resize-none min-h-[80px] focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                  Content (Markdown)
                </label>
                <Textarea
                  value={generatedContent.content}
                  onChange={(e) =>
                    setGeneratedContent({
                      ...generatedContent,
                      content: e.target.value,
                    })
                  }
                  className="bg-slate-800 border-slate-700 text-slate-100 font-mono text-sm resize-none min-h-[320px] focus:border-cyan-500/50"
                />
              </div>
            </div>

            <button
              onClick={handleSaveNote}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-sm font-semibold transition-colors"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                </>
              ) : (
                "Save Note"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
