import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { QuizQuestion } from "@/types";
import {
  Loader2,
  Trophy,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { backendUrl } from "@/utils/backendUrl";
import { useCurrentUser } from "../context/userContext";

export function TakeQuizPage() {
  const navigate = useNavigate();
  const { topic, count, difficulty } = useParams();
  const { user } = useCurrentUser();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!topic || !count || !difficulty) return;
    const generateQuestions = async () => {
      const { data } = await axios.post(`${backendUrl}/quiz/generate-quiz/`, {
        topic: decodeURIComponent(topic),
        number_of_questions: Number(count),
        difficulty,
      });
      setQuestions(data.questions);
    };
    generateQuestions();
  }, []);

  const getCorrectOptionIndex = (q: QuizQuestion) =>
    q.options.findIndex((o) => o.is_correct);
  const getScore = () =>
    questions.filter((q) => answers[q.id] === getCorrectOptionIndex(q)).length;

  const handleAnswer = (optionIndex: number) => {
    setAnswers({ ...answers, [questions[currentIndex].id]: optionIndex });
  };

  const handleSubmit = async () => {
    const score = getScore();
    const result = {
      topic,
      difficulty,
      score,
      user_id: user?.id,
      total_questions: questions.length,
      questions: questions.map((q) => ({
        question: q.question,
        explanation: q.explanation,
        selected_option: q.options[answers[q.id]]?.text ?? "",
        correct_option: q.options[getCorrectOptionIndex(q)]?.text ?? "",
        is_correct: answers[q.id] === getCorrectOptionIndex(q),
        options: q.options.map((opt) => ({
          text: opt.text,
          is_correct: opt.is_correct,
        })),
      })),
    };
    await axios.post(`${backendUrl}/quiz/store-result/`, result);
    setIsComplete(true);
  };
  if (isComplete) {
    const score = getScore();
    const percentage = Math.round((score / questions.length) * 100);
    const grade =
      percentage >= 80
        ? { label: "Excellent!", color: "text-emerald-400" }
        : percentage >= 60
          ? { label: "Good job!", color: "text-amber-400" }
          : { label: "Keep practising", color: "text-red-400" };

    return (
      <div className="min-h-full bg-slate-950 px-4 sm:px-8 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Score card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mx-auto mb-5">
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className={`text-2xl font-bold mb-1 ${grade.color}`}>
              {grade.label}
            </h2>
            <p className="text-slate-500 text-sm mb-6 capitalize">
              {topic} · {difficulty}
            </p>
            <div className="flex items-center justify-center gap-6">
              <div>
                <p className="text-4xl font-bold text-slate-100">
                  {percentage}%
                </p>
                <p className="text-xs text-slate-600 mt-1">Score</p>
              </div>
              <div className="w-px h-12 bg-slate-800" />
              <div>
                <p className="text-4xl font-bold text-slate-100">
                  {score}/{questions.length}
                </p>
                <p className="text-xs text-slate-600 mt-1">Correct</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {questions.map((q, i) => {
              const isCorrect = answers[q.id] === getCorrectOptionIndex(q);
              return (
                <div
                  key={q.id}
                  className={cn(
                    "rounded-xl border p-4 space-y-2 transition-colors",
                    isCorrect
                      ? "border-emerald-800/50 bg-emerald-900/10"
                      : "border-red-800/50 bg-red-900/10",
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    )}
                    <p className="text-sm font-medium text-slate-200">
                      {i + 1}. {q.question}
                    </p>
                  </div>
                  <div className="pl-6.5 space-y-1 text-xs">
                    <p className="text-slate-500">
                      Your answer:{" "}
                      <span
                        className={
                          isCorrect ? "text-emerald-400" : "text-red-400"
                        }
                      >
                        {q.options[answers[q.id]]?.text}
                      </span>
                    </p>
                    {!isCorrect && (
                      <p className="text-slate-500">
                        Correct:{" "}
                        <span className="text-emerald-400">
                          {q.options[getCorrectOptionIndex(q)]?.text}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => navigate("/quiz/attempted")}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold transition-colors"
          >
            View All Attempts
          </button>
        </div>
      </div>
    );
  }
  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-slate-950 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
        <p className="text-slate-500 text-sm">Generating questions…</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isAnswered = answers[currentQuestion.id] !== undefined;
  const allAnswered = Object.keys(answers).length === questions.length;
  const selectedAnswer = answers[currentQuestion.id];

  return (
    <div className="min-h-full bg-slate-950 px-4 sm:px-8 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 capitalize">
              {topic} · {difficulty}
            </span>
            <span className="text-slate-400 font-medium">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
          <p className="text-sm font-medium text-amber-400 mb-4">
            Question {currentIndex + 1}
          </p>
          <h2 className="text-lg font-semibold text-slate-100 leading-relaxed mb-6">
            {currentQuestion.question}
          </h2>

          <div className="space-y-2.5">
            {currentQuestion.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-150",
                  selectedAnswer === idx
                    ? "border-amber-500/60 bg-amber-500/10 text-amber-200"
                    : "border-slate-800 bg-slate-800/30 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60",
                )}
              >
                <span
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full border text-xs mr-3 flex-shrink-0
                  border-current opacity-60"
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                {opt.text}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => i - 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-sm transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <div className="hidden sm:flex items-center gap-1">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  i === currentIndex
                    ? "bg-amber-500 w-4"
                    : answers[questions[i].id] !== undefined
                      ? "bg-slate-600"
                      : "bg-slate-800",
                )}
              />
            ))}
          </div>

          {currentIndex === questions.length - 1 ? (
            <button
              disabled={!allAnswered}
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-sm font-semibold transition-colors"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              disabled={!isAnswered}
              onClick={() => setCurrentIndex((i) => i + 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 text-sm transition-all"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
