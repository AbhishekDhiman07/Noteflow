import {
  Home,
  LogOutIcon,
  ClipboardCheck,
  MessageCircle,
  BookOpen,
  Youtube,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useCurrentUser } from "../context/userContext";

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Attempted Quizzes", url: "/quiz/attempted", icon: ClipboardCheck },
  { title: "Chat with PDF", url: "/chat/pdf", icon: MessageCircle },
  { title: "Chat with YouTube", url: "/chat/youtube", icon: Youtube },
  { title: "Chat with Notes", url: "/chat/notes", icon: BookOpen },
];

export function AppSidebar() {
  const { logout } = useCurrentUser();
  return (
    <Sidebar className="border-r border-slate-800/60 bg-slate-950">
      <SidebarContent className="bg-slate-950">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800/60">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <BookOpen className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-semibold text-slate-100 tracking-tight">
            NoteFlow
          </span>
        </div>

        <SidebarGroup className="pt-4">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5 px-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-all duration-150 text-sm font-medium group"
                    >
                      <item.icon className="w-4 h-4 group-hover:text-amber-400 transition-colors" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto px-4 pb-5 border-t border-slate-800/60 pt-4">
          <button
            onClick={logout}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-150 text-sm font-medium"
          >
            <LogOutIcon className="w-4 h-4" />
            Logout
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
