import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Loader2, Sparkles, ArrowLeft, CheckCircle2 } from "lucide-react";
import axios from "axios";
import { useCurrentUser } from "../context/userContext";
import { backendUrl } from "@/utils/backendUrl";

export function CreateFromPDF() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const { id } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [generatedContent, setGeneratedContent] = useState({ title: "", content: "", summary: "" });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f?.type === "application/pdf") setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f?.type === "application/pdf") setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_id", user!.id);
      const res = await axios.post("http://localhost:8000/api/v1/upload-pdf/", formData);
      localStorage.setItem("docId", res.data.result.doc_id);
      setIsProcessed(true);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateNotes = async () => {
    setIsGenerating(true);
    try {
      const docId = localStorage.getItem("docId");
      const { data } = await axios.post(`${backendUrl}/generate-note/`, { id: docId });
      setGeneratedContent({ title: data.title, content: data.content, summary: data.summary });
      setPreviewMode(true);
      localStorage.removeItem("docId");
    } finally {
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
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <Upload className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">Upload PDF</h1>
            <p className="text-slate-500 text-sm">Generate structured notes from a PDF</p>
          </div>
        </div>

        {!isProcessed ? (
          /* Upload section */
          <div className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={[
                "rounded-xl border-2 border-dashed p-12 text-center cursor-pointer transition-all",
                dragOver
                  ? "border-violet-500/50 bg-violet-500/5"
                  : file
                  ? "border-violet-500/30 bg-violet-500/5"
                  : "border-slate-800 hover:border-slate-700 bg-slate-900/30",
              ].join(" ")}
            >
              <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
              {file ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-violet-500/10 border border-violet-500/20 mx-auto">
                    <FileText className="w-7 h-7 text-violet-400" />
                  </div>
                  <p className="font-medium text-slate-200 text-sm">{file.name}</p>
                  <p className="text-xs text-slate-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-slate-800 mx-auto">
                    <Upload className="w-7 h-7 text-slate-600" />
                  </div>
                  <p className="font-medium text-slate-300 text-sm">Click to upload PDF</p>
                  <p className="text-xs text-slate-600">or drag & drop your file here</p>
                </div>
              )}
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-violet-500 hover:bg-violet-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
            >
              {isUploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing PDF…</>
              ) : (
                <><Upload className="w-4 h-4" /> Upload & Process</>
              )}
            </button>
          </div>
        ) : !previewMode ? (
          /* Processed state */
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 flex flex-col items-center gap-6 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-200 text-base">{file?.name}</p>
              <p className="text-sm text-slate-500 mt-1">PDF processed and ready</p>
            </div>
            <button
              onClick={handleGenerateNotes}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-sm font-semibold transition-colors"
            >
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating Notes…</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Generate Note</>
              )}
            </button>
          </div>
        ) : (
          /* Preview mode */
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-medium text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-full">
                <Sparkles className="w-3 h-3" />
                AI Generated from PDF
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-5">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Title</label>
                <Input
                  value={generatedContent.title}
                  onChange={(e) => setGeneratedContent({ ...generatedContent, title: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-100 focus:border-violet-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Summary</label>
                <Textarea
                  value={generatedContent.summary}
                  onChange={(e) => setGeneratedContent({ ...generatedContent, summary: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-100 resize-none min-h-[80px] focus:border-violet-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                  Content (Markdown)
                </label>
                <Textarea
                  value={generatedContent.content}
                  onChange={(e) => setGeneratedContent({ ...generatedContent, content: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-100 font-mono text-sm resize-none min-h-[320px] focus:border-violet-500/50"
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