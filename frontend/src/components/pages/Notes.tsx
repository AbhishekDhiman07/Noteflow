import { backendUrl } from "@/utils/backendUrl";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Plus, FileText, Clock } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import NoteType from "./NoteType";
import type { Note } from "@/types";
import { Spinner } from "../ui/spinner";

function Notes() {
  const { id } = useParams();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  useEffect(() => {
    const getNotes = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${backendUrl}/note/all-notes/${id}`);
        setNotes(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    getNotes();
  }, []);

  return (
    <div className="min-h-full bg-slate-950 px-4 sm:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Notes</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {notes.length} note{notes.length !== 1 ? "s" : ""}
          </p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold transition-colors">
              <Plus className="w-4 h-4" />
              Create Note
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-4 bg-slate-900 border-slate-800"
            align="end"
          >
            <NoteType id={id as string} />
          </PopoverContent>
        </Popover>
      </div>

      <div className="max-w-5xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner className="h-7 w-7 text-amber-400" />
          </div>
        ) : notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {notes.map((note) => (
              <Link
                key={note.id}
                to={`/note/${note.id}/${id}`}
                className="group flex flex-col rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition-all duration-200 hover:border-amber-500/40 hover:bg-slate-900 hover:shadow-lg hover:shadow-amber-500/5"
              >
                <div className="flex items-center gap-1.5 text-slate-600 text-xs mb-3">
                  <Clock className="w-3 h-3" />
                  {formatDate(note.updated_at)}
                </div>
                <h3 className="font-semibold text-slate-200 text-sm mb-2 group-hover:text-amber-300 transition-colors line-clamp-2">
                  {note.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed flex-1">
                  {note.summary}
                </p>
                <div className="flex items-center gap-1.5 mt-4 text-xs text-slate-700 group-hover:text-amber-500/60 transition-colors">
                  <FileText className="w-3 h-3" />
                  Open note →
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 py-24 px-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800/60 mb-5">
              <FileText className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-slate-300 font-semibold text-lg mb-2">No notes yet</h3>
            <p className="text-slate-600 text-sm max-w-xs">
              Create your first note using AI, a PDF, or a YouTube video.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notes;