import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import axios from "axios";
import { backendUrl } from "@/utils/backendUrl";
import { Spinner } from "./ui/spinner";
import { useCurrentUser } from "./context/userContext";
import { useFolder } from "./context/folderContext";

export function DialogButton() {
  const [folderName, setFolderName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const { user } = useCurrentUser();
  const { addFolder } = useFolder();

  const createFolder = async (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    setIsLoading(true);
    try {
      if (user?.id) {
        const res = await axios.post(`${backendUrl}/folder/create`, {
          name: folderName,
          user_id: user.id,
        });
        addFolder(res.data.folder);
        setFolderName("");
        setOpen(false);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold transition-colors">
          <FolderPlus className="w-4 h-4" />
          New Folder
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm bg-slate-900 border-slate-800 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Create Folder</DialogTitle>
          <DialogDescription className="text-slate-500">
            Give your folder a name to get started.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <Label htmlFor="folder-name" className="text-slate-300 text-sm">
            Folder Name
          </Label>
          <Input
            id="folder-name"
            placeholder="e.g. Physics Notes, CS50..."
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isLoading && folderName.trim() && createFolder(e as any)}
            className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-600 focus:border-amber-500/50 focus:ring-amber-500/20"
          />
        </div>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="ghost" className="text-slate-400 hover:text-slate-200 hover:bg-slate-800">
              Cancel
            </Button>
          </DialogClose>
          <button
            onClick={createFolder}
            disabled={isLoading || !folderName.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-sm font-semibold transition-colors"
          >
            {isLoading ? (
              <><Spinner className="w-4 h-4" /> Creating…</>
            ) : (
              "Create"
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}