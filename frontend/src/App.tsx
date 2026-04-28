import HomePage from "./components/pages/HomePage";
import FolderProvider from "./components/context/FolderProvider";
import { Routes, Route } from "react-router-dom";
import Folder from "./components/pages/Notes";
import AuthPage from "./components/pages/AuthPage";
import Layout from "./components/pages/Layout";
import { CreateFromTopic } from "./components/create/CreateFromTopic";
import { CreateFromPDF } from "./components/create/CreateFromPDF";
import { CreateFromYouTube } from "./components/create/CreateFromYouTube";
import { NoteDetailPage } from "./components/pages/NoteDetails";
import { TakeQuizPage } from "./components/pages/TakeQuizPage";
import { QuizResult } from "./components/pages/QuizResult";
import AttemptedQuizes from "./components/pages/AttemptedQuizes";
import { ChatWithPDF } from "./components/pages/ChatWithPDF";
import ProtectedRoute from "./components/ProtectedRoute";
import { ChatWithYouTube } from "./components/pages/ChatWithYouTube";
import { ChatWithNotes } from "./components/pages/ChatWithNotes";
export default function App() {
  return (
    <FolderProvider>
      <Routes>
        <Route path="/auth/" element={<AuthPage />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/folder/:id" element={<Folder />} />
          <Route path="/create/topic/:id" element={<CreateFromTopic />} />
          <Route path="/create/pdf/:id" element={<CreateFromPDF />} />
          <Route path="/create/youtube/:id" element={<CreateFromYouTube />} />
          <Route path="/note/:noteId/:folderId" element={<NoteDetailPage />} />
          <Route
            path="/quiz/take/:topic/:count/:difficulty"
            element={<TakeQuizPage />}
          />
          <Route path="/quiz/result/:quizId" element={<QuizResult />} />
          <Route path="/quiz/attempted" element={<AttemptedQuizes />} />
          <Route path="/chat/pdf" element={<ChatWithPDF />} />
          <Route path="/chat/youtube" element={<ChatWithYouTube />} />
          <Route path="/chat/notes" element={<ChatWithNotes />} />
        </Route>
      </Routes>
    </FolderProvider>
  );
}
