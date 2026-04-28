import React, { useEffect, useState } from "react";
import { useCurrentUser } from "../context/userContext";
import axios from "axios";
import { backendUrl } from "@/utils/backendUrl";
import { Link } from "react-router-dom";
import type { AttemptQuizes } from "@/types";
import { Spinner } from "../ui/spinner";

function AttemptedQuizes() {
  const [quizes, setQuizes] = useState<AttemptQuizes[]>([]);
  const { user } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString();
  };
  useEffect(() => {
    setLoading(true);
    const displayResult = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/quiz/quiz-result/${user?.id}`,
        );
        setQuizes(data);
      } catch (error) {
        console.error("Failed to fetch quizzes:", error);
      } finally {
        setLoading(false);
      }
    };
    displayResult();
  }, [user?.id]);
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 p-10 text-white">
      <div className="flex justify-center items-center w-full">
        <h1 className="text-3xl font-bold text-indigo-400">
          Attempted Quizzes 📊
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <div className="mt-10">
          {quizes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quizes.map((quiz) => (
                <Link
                  key={quiz.id}
                  to={`/quiz/result/${quiz.id}`}
                  className="group rounded-2xl p-5 bg-white/5 border border-white/10 backdrop-blur-lg hover:scale-[1.02] hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs text-gray-400">
                      {formatDate(quiz.created_at)}
                    </span>

                    <span
                      className={`text-sm font-bold ${
                        quiz.difficulty === "easy"
                          ? "text-green-400"
                          : quiz.difficulty === "medium"
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      {quiz.difficulty}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold group-hover:text-indigo-400 transition-colors">
                    {quiz.topic}
                  </h3>
                </Link>
              ))}
            </div>
          ) : (
            <h1 className="text-center text-gray-400 mt-10">
              No Quiz Attempted 😕
            </h1>
          )}
        </div>
      )}
    </div>
  );
}

export default AttemptedQuizes;
