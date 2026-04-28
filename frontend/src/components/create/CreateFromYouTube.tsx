import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Youtube, Loader2, Sparkles, Play, ArrowLeft, CheckCircle2 } from "lucide-react";
import axios from "axios";
import { backendUrl } from "@/utils/backendUrl";
import { useCurrentUser } from "../context/userContext";

export function CreateFromYouTube() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useCurrentUser();

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [videoInfo, setVideoInfo] = useState({ title: "", thumbnail: "" });
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedContent, setGeneratedContent] = useState({ title: "", content: "", summary: "" });

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleProcessVideo = async () => {
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) return;
    setIsProcessing(true);
    setVideoInfo({
      title: "Video ready for processing",
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    });
    setIsProcessed(true);
    setIsProcessing(false);
  };

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    setProgress(0);
    const interval = setInterval(() => setProgress((p) => (p < 90 ? p + 10 : p)), 500);
    try {
      const { data } = await axios.post(`${backendUrl}/yt/generate-yt-note/`, { url: youtubeUrl });
      clearInterval(interval);
      setProgress(100);
      setGeneratedContent(data.note);
      setPreviewMode(true);
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  const handleSaveNote = async () => {
    setIsSaving(true);
    try {
      await axios.post(`${backendUrl}/note/create/`, { ...generatedContent, user_id: user?.id, folder_id: id });
      navigate(`/folder/${id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

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
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20">
            <Youtube className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">YouTube Notes</h1>
            <p className="text-slate-500 text-sm">Generate notes from any YouTube video</p>
          </div>
        </div>

        {!isProcessed ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 block">
                YouTube URL
              </label>
              <Input
                placeholder="https://youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && youtubeUrl.trim() && handleProcessVideo()}
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-600 text-base focus:border-red-500/50 h-11"
              />
            </div>
            <button
              onClick={handleProcessVideo}
              disabled={!youtubeUrl.trim() || isProcessing}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-red-500 hover:bg-red-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
            >
              {isProcessing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing Video…</>
              ) : (
                <><Play className="w-4 h-4" /> Process Video</>
              )}
            </button>
          </div>
        ) : !previewMode ? (
          <div className="space-y-4">
            {/* Video card */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
              {videoInfo.thumbnail && (
                <div className="aspect-video w-full bg-slate-800 relative">
                  <img
                    src={videoInfo.thumbnail}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-emerald-400 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Video processed and ready
                </div>
                <p className="text-slate-400 text-sm line-clamp-2">{youtubeUrl}</p>
              </div>
            </div>

            <button
              onClick={handleGenerateContent}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-sm font-semibold transition-colors"
            >
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating Notes ({progress}%)…</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Generate Notes</>
              )}
            </button>
          </div>
        ) : (
          /* Preview mode */
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full">
                <Sparkles className="w-3 h-3" />
                AI Generated from YouTube
              </span>
              <button
                onClick={() => setPreviewMode(false)}
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
              >
                ← Back to video
              </button>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-5">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Title</label>
                <Input
                  value={generatedContent.title}
                  onChange={(e) => setGeneratedContent({ ...generatedContent, title: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-100 focus:border-red-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Summary</label>
                <Textarea
                  value={generatedContent.summary}
                  onChange={(e) => setGeneratedContent({ ...generatedContent, summary: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-100 resize-none min-h-[80px] focus:border-red-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                  Content (Markdown)
                </label>
                <Textarea
                  value={generatedContent.content}
                  onChange={(e) => setGeneratedContent({ ...generatedContent, content: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-100 font-mono text-sm resize-none min-h-[320px] focus:border-red-500/50"
                />
              </div>
            </div>

            <button
              onClick={handleSaveNote}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-sm font-semibold transition-colors"
            >
              {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : "Save Note"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}