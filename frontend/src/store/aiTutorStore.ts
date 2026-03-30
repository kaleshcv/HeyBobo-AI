import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createUserStorage } from '@/lib/userStorage';

// --- Types ---
export interface Textbook {
  id: string;
  name: string;
  size: number;
  pageCount: number;
  extractedText: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  textbookId: string | null;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface StudyPlanChapter {
  id: string;
  title: string;
  description: string;
  days: number;
  topics: string[];
  objectives: string[];
  completed: boolean;
}

export interface StudyPlan {
  id: string;
  textbookId: string;
  title: string;
  totalDays: number;
  hoursPerDay: number;
  chapters: StudyPlanChapter[];
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  textbookId: string;
  title: string;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  textbookId: string;
  answers: Record<string, number>;
  score: number;
  total: number;
  completedAt: string;
}

export interface LessonRecord {
  id: string;
  textbookId: string;
  topic: string;
  content: string;
  completedAt: string;
}

export interface RevisionItem {
  topic: string;
  weakness: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

export interface RevisionPlan {
  id: string;
  quizAttemptId: string;
  textbookId: string;
  quizTitle: string;
  score: number;
  total: number;
  weakAreas: RevisionItem[];
  summary: string;
  createdAt: string;
  dismissed: boolean;
}

// --- Store ---
interface AITutorState {
  // Textbooks
  textbooks: Textbook[];
  setTextbooks: (books: Textbook[]) => void;
  addTextbook: (book: Textbook) => void;
  removeTextbook: (id: string) => void;

  // Conversations
  conversations: Conversation[];
  addConversation: (conv: Conversation) => void;
  updateConversation: (id: string, messages: ChatMessage[]) => void;
  removeConversation: (id: string) => void;

  // Study Plans
  studyPlans: StudyPlan[];
  addStudyPlan: (plan: StudyPlan) => void;
  removeStudyPlan: (id: string) => void;
  toggleChapterComplete: (planId: string, chapterId: string) => void;

  // Quizzes
  quizzes: Quiz[];
  addQuiz: (quiz: Quiz) => void;
  removeQuiz: (id: string) => void;

  // Quiz Attempts
  quizAttempts: QuizAttempt[];
  addQuizAttempt: (attempt: QuizAttempt) => void;

  // Lessons
  lessons: LessonRecord[];
  addLesson: (lesson: LessonRecord) => void;

  // Revision Plans
  revisionPlans: RevisionPlan[];
  addRevisionPlan: (plan: RevisionPlan) => void;
  dismissRevisionPlan: (id: string) => void;
}

export const useAITutorStore = create<AITutorState>()(
  persist(
    (set) => ({
      textbooks: [],
      setTextbooks: (books) => set({ textbooks: books }),
      addTextbook: (book) => set((s) => ({ textbooks: [book, ...s.textbooks] })),
      removeTextbook: (id) =>
        set((s) => ({
          textbooks: s.textbooks.filter((b) => b.id !== id),
          conversations: s.conversations.filter((c) => c.textbookId !== id),
          studyPlans: s.studyPlans.filter((p) => p.textbookId !== id),
          quizzes: s.quizzes.filter((q) => q.textbookId !== id),
          quizAttempts: s.quizAttempts.filter((a) => a.textbookId !== id),
          lessons: s.lessons.filter((l) => l.textbookId !== id),
          revisionPlans: s.revisionPlans.filter((r) => r.textbookId !== id),
        })),

      conversations: [],
      addConversation: (conv) => set((s) => ({ conversations: [conv, ...s.conversations] })),
      updateConversation: (id, messages) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, messages, updatedAt: new Date().toISOString() } : c,
          ),
        })),
      removeConversation: (id) =>
        set((s) => ({ conversations: s.conversations.filter((c) => c.id !== id) })),

      studyPlans: [],
      addStudyPlan: (plan) => set((s) => ({ studyPlans: [plan, ...s.studyPlans] })),
      removeStudyPlan: (id) => set((s) => ({ studyPlans: s.studyPlans.filter((p) => p.id !== id) })),
      toggleChapterComplete: (planId, chapterId) =>
        set((s) => ({
          studyPlans: s.studyPlans.map((p) =>
            p.id === planId
              ? {
                  ...p,
                  chapters: p.chapters.map((ch) =>
                    ch.id === chapterId ? { ...ch, completed: !ch.completed } : ch,
                  ),
                }
              : p,
          ),
        })),

      quizzes: [],
      addQuiz: (quiz) => set((s) => ({ quizzes: [quiz, ...s.quizzes] })),
      removeQuiz: (id) => set((s) => ({ quizzes: s.quizzes.filter((q) => q.id !== id) })),

      quizAttempts: [],
      addQuizAttempt: (attempt) => set((s) => ({ quizAttempts: [attempt, ...s.quizAttempts] })),

      lessons: [],
      addLesson: (lesson) => set((s) => ({ lessons: [lesson, ...s.lessons] })),

      revisionPlans: [],
      addRevisionPlan: (plan) => set((s) => ({ revisionPlans: [plan, ...s.revisionPlans] })),
      dismissRevisionPlan: (id) =>
        set((s) => ({
          revisionPlans: s.revisionPlans.map((r) =>
            r.id === id ? { ...r, dismissed: true } : r,
          ),
        })),
    }),
    {
      name: 'heybobo-ai-tutor',
      storage: createUserStorage(),
    },
  ),
);
