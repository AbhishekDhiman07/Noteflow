import { ArrowRight, Sparkles, Upload, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

function NoteType({ id }: { id: string }) {
  const quickActions = [
    {
      path: "/create/topic",
      label: "From Topic",
      description: "AI-generated notes",
      icon: Sparkles,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/20",
      hover: "hover:border-cyan-500/40 hover:bg-cyan-500/10",
    },
    {
      path: "/create/pdf",
      label: "From PDF",
      description: "Upload & extract",
      icon: Upload,
      color: "text-violet-400",
      bg: "bg-violet-500/10 border-violet-500/20",
      hover: "hover:border-violet-500/40 hover:bg-violet-500/10",
    },
    {
      path: "/create/youtube",
      label: "YouTube",
      description: "From any video",
      icon: Youtube,
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
      hover: "hover:border-red-500/40 hover:bg-red-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:w-auto">
      {quickActions.map((action) => (
        <Link
          key={action.path}
          to={`${action.path}/${id}`}
          className={`group flex flex-col items-start gap-3 rounded-xl border border-slate-800 bg-slate-800/40 p-4 transition-all duration-200 ${action.hover} min-w-[140px]`}
        >
          <div className={`flex items-center justify-center w-9 h-9 rounded-lg border ${action.bg}`}>
            <action.icon className={`w-4 h-4 ${action.color}`} />
          </div>
          <div>
            <p className="font-semibold text-slate-200 text-sm">{action.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{action.description}</p>
          </div>
          <ArrowRight className={`w-3.5 h-3.5 ${action.color} opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5`} />
        </Link>
      ))}
    </div>
  );
}

export default NoteType;