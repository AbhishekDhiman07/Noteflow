import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { AppSidebar } from "../sidebar/AppSidebar";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-950">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <div className="sticky top-0 z-10 flex items-center h-12 px-4 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm">
            <SidebarTrigger className="text-slate-400 hover:text-amber-400 transition-colors" />
          </div>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default Layout;
