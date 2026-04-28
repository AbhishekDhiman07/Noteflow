import { type ReactNode } from "react";
import { useState } from "react";
import type { Folder } from "@/types";
import { FolderContext } from "./folderContext";

function FolderProvider({ children }: { children: ReactNode }) {
  const [folders, setFolders] = useState<Folder[]>([]);

  const addFolders = (data: Folder[]) => {
    setFolders(data);
  };

  const addFolder = (folder: Folder) => {
    setFolders((prev) => [...prev, folder]);
  };
  return (
    <FolderContext.Provider value={{ folders, addFolders, addFolder }}>
      {children}
    </FolderContext.Provider>
  );
}

export default FolderProvider;
