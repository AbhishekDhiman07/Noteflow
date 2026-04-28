import { backendUrl } from "@/utils/backendUrl";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { QuizResultProps } from "@/types";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function QuizResult() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState<QuizResultProps | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const displayQuiz = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/quiz/quiz/${quizId}`);
        setQuiz(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    displayQuiz();
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  if (!quiz) return null;

  const percentage = Math.round((quiz.score / quiz.total_questions) * 100);
  const grade =
    percentage >= 80
      ? {
          label: "Excellent!",
          color: "text-emerald-400",
          ring: "border-emerald-800/50",
        }
      : percentage >= 60
        ? {
            label: "Good work!",
            color: "text-amber-400",
            ring: "border-amber-800/50",
          }
        : {
            label: "Keep practising",
            color: "text-red-400",
            ring: "border-red-800/50",
          };

  const difficultyColors: Record<string, string> = {
    easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    hard: "text-red-400 bg-red-500/10 border-red-500/20",
  };

  return (
    <div className="min-h-full bg-slate-950 px-4 sm:px-8 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mx-auto mb-4">
            <Trophy className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1 tracking-tight">
            {quiz.topic}
          </h1>
          <div className="flex items-center justify-center gap-2 mb-6">
            <span
              className={cn(
                "text-xs font-medium px-2.5 py-1 rounded-full border capitalize",
                difficultyColors[quiz.difficulty ?? "medium"],
              )}
            >
              {quiz.difficulty}
            </span>
          </div>
          <div className="flex items-center justify-center gap-8">
            <div>
              <p className={`text-5xl font-bold ${grade.color}`}>
                {percentage}%
              </p>
              <p className="text-xs text-slate-600 mt-1">Score</p>
            </div>
            <div className="w-px h-14 bg-slate-800" />
            <div>
              <p className="text-5xl font-bold text-slate-100">
                {quiz.score}
                <span className="text-2xl text-slate-600">
                  /{quiz.total_questions}
                </span>
              </p>
              <p className="text-xs text-slate-600 mt-1">Correct</p>
            </div>
          </div>
          <p className={`text-sm font-medium mt-4 ${grade.color}`}>
            {grade.label}
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider px-1">
            Question Review
          </h2>
          {quiz.questions.map((q, index) => (
            <div
              key={index}
              className={cn(
                "rounded-xl border p-5 space-y-4",
                q.is_correct
                  ? "border-emerald-800/40 bg-emerald-900/5"
                  : "border-red-800/40 bg-red-900/5",
              )}
            >
              {/* Question header */}
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 mt-0.5",
                    q.is_correct ? "bg-emerald-500/10" : "bg-red-500/10",
                  )}
                >
                  {q.is_correct ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <p className="text-sm font-medium text-slate-200 leading-relaxed">
                  Q{index + 1}. {q.question}
                </p>
              </div>
              <div className="pl-9 space-y-2">
                {q.options?.map((opt, optIndex) => {
                  const isCorrect = opt.option_text === q.correct_option;
                  const isSelected = opt.option_text === q.selected_option;

                  return (
                    <div
                      key={optIndex}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs border",
                        isCorrect
                          ? "border-emerald-700/50 bg-emerald-900/20 text-emerald-300"
                          : isSelected && !q.is_correct
                            ? "border-red-700/50 bg-red-900/20 text-red-300"
                            : "border-slate-800 text-slate-500",
                      )}
                    >
                      <span className="font-bold flex-shrink-0">
                        {String.fromCharCode(65 + optIndex)}.
                      </span>
                      <span className="flex-1">{opt.option_text}</span>
                      <span className="ml-auto flex-shrink-0">
                        {isCorrect && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        {!isCorrect && isSelected && (
                          <XCircle className="w-3.5 h-3.5 text-red-400" />
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
              {q.explanation && (
                <div className="pl-9">
                  <div className="flex items-start gap-2 bg-blue-900/10 border border-blue-800/30 rounded-lg p-3">
                    <Lightbulb className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-blue-400 mb-1">
                        Explanation
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
