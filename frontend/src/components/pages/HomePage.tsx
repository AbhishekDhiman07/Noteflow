import { useEffect, useState } from "react";
import { DialogButton } from "../DialogButton";
import { FolderOpen, Trash2, Calendar, FileText } from "lucide-react";
import axios from "axios";
import { backendUrl } from "@/utils/backendUrl";
import { useFolder } from "../context/folderContext";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../context/userContext";
import { Spinner } from "@/components/ui/spinner";

function HomePage() {
  const { folders, addFolders } = useFolder();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useCurrentUser();

  const getFolders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${backendUrl}/folder/all-folders/${user?.id}`,
      );
      addFolders(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, folder_id: string) => {
    e.stopPropagation();
    await axios.delete(`${backendUrl}/folder/delete/${folder_id}`);
    getFolders();
  };

  useEffect(() => {
    if (user?.id) getFolders();
  }, [user?.id]);

  return (
    <div className="min-h-full bg-slate-950 px-4 sm:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            My Folders
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {folders.length} folder{folders.length !== 1 ? "s" : ""}
          </p>
        </div>
        <DialogButton />
      </div>

      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner className="h-7 w-7 text-amber-400" />
          </div>
        ) : folders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {folders.map((folder) => (
              <div
                key={folder.id}
                onClick={() => navigate(`/folder/${folder.id}`)}
                className="group relative rounded-xl border border-slate-800 bg-slate-900/50 p-5 cursor-pointer transition-all duration-200 hover:border-amber-500/40 hover:bg-slate-900 hover:shadow-lg hover:shadow-amber-500/5"
              >
                <button
                  onClick={(e) => handleDelete(e, folder.id)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4 group-hover:bg-amber-500/15 transition-colors">
                  <FolderOpen className="w-5 h-5 text-amber-400" />
                </div>

                <h3 className="font-semibold text-slate-200 text-sm mb-1 group-hover:text-amber-300 transition-colors truncate pr-6">
                  {folder.name}
                </h3>
                <p className="text-xs text-slate-600 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  {new Date(folder.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-slate-700 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  Double-click to open →
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 py-24 px-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800/60 mb-5">
              <FolderOpen className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-slate-300 font-semibold text-lg mb-2">
              No folders yet
            </h3>
            <p className="text-slate-600 text-sm max-w-xs mb-6">
              Create your first folder to start organising your notes and
              quizzes.
            </p>
            <DialogButton />
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
