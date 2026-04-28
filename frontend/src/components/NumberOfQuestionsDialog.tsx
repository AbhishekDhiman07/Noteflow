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
import { ClipboardList } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function NumberOfQuestionsDialog({ topic }: { topic: string }) {
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState("medium");
  const navigate = useNavigate();

  const handleGenerateQuiz = () => {
    navigate(`/quiz/take/${topic}/${count}/${difficulty}`);
  };

  const difficulties = [
    { value: "easy", label: "Easy", color: "text-emerald-400" },
    { value: "medium", label: "Medium", color: "text-amber-400" },
    { value: "hard", label: "Hard", color: "text-red-400" },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-sm transition-all border border-slate-700 hover:border-slate-600">
          <ClipboardList className="w-3.5 h-3.5" />
          Generate Quiz
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm bg-slate-900 border-slate-800 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Generate Quiz</DialogTitle>
          <DialogDescription className="text-slate-500">
            Configure your quiz for{" "}
            <span className="text-amber-400 font-medium">"{topic}"</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          {/* Count */}
          <div className="grid gap-2">
            <Label className="text-slate-300 text-sm">
              Number of Questions
            </Label>
            <Input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="bg-slate-800 border-slate-700 text-slate-100 focus:border-amber-500/50"
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-slate-300 text-sm">Difficulty</Label>
            <div className="grid grid-cols-3 gap-2">
              {difficulties.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDifficulty(d.value)}
                  className={[
                    "px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                    difficulty === d.value
                      ? `${d.color} border-current bg-current/10`
                      : "text-slate-500 border-slate-700 hover:border-slate-600 hover:text-slate-300",
                  ].join(" ")}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <button className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-sm transition-all">
              Cancel
            </button>
          </DialogClose>
          <button
            onClick={handleGenerateQuiz}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold transition-colors"
          >
            Generate
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
