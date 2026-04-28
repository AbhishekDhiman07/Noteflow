import { createContext, useContext } from "react";
import type { Folder } from "@/types";

export const FolderContext = createContext({
  folders: [] as Folder[],
  addFolders: (data: Folder[]) => {},
  addFolder: (folder: Folder) => {},
});

export const useFolder = () => {
  return useContext(FolderContext);
};
