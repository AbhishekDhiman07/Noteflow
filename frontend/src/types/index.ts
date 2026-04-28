export interface Folder {
  id: string;
  name: string;
  created_at: string;
}

export interface CurrentUser {
  id: string;
  email: string;
}

export interface Note {
  id: string;
  title: string;
  summary: string;
  content: string;
  updated_at: string;
  created_at: string;
}

interface Options {
  text: string;
  is_correct: boolean;
}

export interface QuizQuestion {
  id: number;
  question: string;
  explanation: string;
  options: Options[];
}

interface ResultQuestion {
  question: string;
  options: { option_text: string }[];
  selected_option: string;
  correct_option: string;
  explanation: string;
  is_correct: boolean;
}

export interface QuizResultProps {
  topic: string;
  score: number;
  difficulty: string;
  total_questions: number;
  questions: ResultQuestion[];
}

export interface AttemptQuizes {
  id: string;
  topic: string;
  difficulty: string;
  created_at: string;
}
