import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FileText,
  Edit3,
  Trash2,
  Save,
  X,
  Clock,
  ArrowLeft,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Note } from "@/types";
import axios from "axios";
import { backendUrl } from "@/utils/backendUrl";
import { Spinner } from "../ui/spinner";
import { NumberOfQuestionsDialog } from "../NumberOfQuestionsDialog";

export function NoteDetailPage() {
  const { noteId, folderId } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [note, setNote] = useState<Note>({
    id: "",
    title: "",
    content: "",
    summary: "",
    created_at: "",
    updated_at: "",
  });
  const [editedNote, setEditedNote] = useState({
    title: "",
    summary: "",
    content: "",
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const getNote = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(`${backendUrl}/note/note/${noteId}`);
        setNote(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    getNote();
  }, []);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`${backendUrl}/note/delete-note/${note.id}`);
      navigate(`/folder/${folderId}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStartEdit = () => {
    setEditedNote({
      title: note.title,
      summary: note.summary,
      content: note.content,
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editedNote.title.trim() || !editedNote.content.trim()) return;
    setIsSaving(true);
    try {
      const { data } = await axios.put(`${backendUrl}/note/update-note`, {
        id: note.id,
        ...editedNote,
      });
      setNote((prev) => ({
        ...prev,
        ...editedNote,
        updated_at: data.updated_at ?? prev.updated_at,
      }));
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedNote({
      title: note.title,
      summary: note.summary,
      content: note.content,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-slate-950">
        <Spinner className="h-7 w-7 text-amber-400" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-950 px-4 sm:px-8 py-8">
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-100">
              Delete Note
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete{" "}
              <span className="font-medium text-slate-200">"{note.title}"</span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-500 text-white border-0"
            >
              {isDeleting ? <Spinner className="w-4 h-4" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8 gap-4">
          <button
            onClick={() => navigate(`/folder/${folderId}`)}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-sm transition-all"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-sm font-semibold transition-colors"
                >
                  {isSaving ? (
                    <Spinner className="w-3.5 h-3.5" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  {isSaving ? "Saving…" : "Save"}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleStartEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-sm transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <NumberOfQuestionsDialog topic={note.title} />
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
        {!isEditing && (
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight leading-tight">
              {note.title}
            </h1>
            <p className="text-slate-600 text-sm mt-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Last updated{" "}
              {new Date(note.updated_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        )}

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 mb-6">
          <h3 className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">
            <FileText className="w-3.5 h-3.5" />
            Summary
          </h3>
          {isEditing ? (
            <Textarea
              value={editedNote.summary}
              onChange={(e) =>
                setEditedNote({ ...editedNote, summary: e.target.value })
              }
              className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-600 resize-none focus:border-amber-500/50 min-h-[80px]"
            />
          ) : (
            <p className="text-slate-400 text-sm leading-relaxed">
              {note.summary}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 sm:p-8">
          {isEditing ? (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Content (Markdown)
              </label>
              <Textarea
                value={editedNote.content}
                onChange={(e) =>
                  setEditedNote({ ...editedNote, content: e.target.value })
                }
                className="bg-slate-800 border-slate-700 text-slate-200 font-mono text-sm resize-none min-h-[400px] focus:border-amber-500/50"
              />
            </div>
          ) : (
            <article className="prose-slate">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-slate-100 mb-4 mt-6 first:mt-0 leading-tight">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-semibold text-slate-100 mb-3 mt-8 leading-tight">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-semibold text-slate-200 mb-2 mt-5">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-slate-400 mb-4 leading-relaxed text-sm">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-none mb-4 space-y-1.5 ml-0">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-slate-400 mb-4 space-y-1.5 text-sm">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-slate-400 text-sm flex gap-2 items-start">
                      <span className="text-amber-500 mt-1 flex-shrink-0">
                        •
                      </span>
                      <span>{children}</span>
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-slate-200">
                      {children}
                    </strong>
                  ),
                  code: ({ children }) => (
                    <code className="bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-xs font-mono text-amber-300">
                      {children}
                    </code>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-amber-500/50 pl-4 italic text-slate-500 my-4 text-sm">
                      {children}
                    </blockquote>
                  ),
                  hr: () => <hr className="border-slate-800 my-6" />,
                }}
              >
                {note.content}
              </ReactMarkdown>
            </article>
          )}
        </div>
      </div>
    </div>
  );
}
