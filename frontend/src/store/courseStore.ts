import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- Types ---

export interface LocalVideo {
  id: string;
  title: string;
  youtubeUrl: string;
  duration: string; // e.g. "12:34"
}

export interface LocalCourse {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  videos: LocalVideo[];
  createdAt: string;
}

export interface VideoProgress {
  videoId: string;
  courseId: string;
  completed: boolean;
  watchedAt?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
}

export interface QuizProgress {
  courseId: string;
  videoId: string;
  score: number;
  total: number;
  completedAt: string;
}

export interface StudentGroup {
  id: string;
  name: string;
  description: string;
  courseIds: string[];
  members: { name: string; email: string }[];
  createdAt: string;
}

// --- Dummy quiz generator (rotate through question sets per video) ---
const QUIZ_POOL: QuizQuestion[][] = [
  [
    { id: 'q1', question: 'What is the primary concept covered in this video?', options: [{ id: 'a', text: 'The core topic explained in the lesson' }, { id: 'b', text: 'Advanced deployment pipelines' }, { id: 'c', text: 'Database sharding techniques' }, { id: 'd', text: 'Network security protocols' }], correctOptionId: 'a' },
    { id: 'q2', question: 'Which practice helps reinforce learning?', options: [{ id: 'a', text: 'Skipping all exercises' }, { id: 'b', text: 'Coding along with the video' }, { id: 'c', text: 'Only watching without practice' }, { id: 'd', text: 'Reading unrelated material' }], correctOptionId: 'b' },
    { id: 'q3', question: 'What should you do if you encounter an error?', options: [{ id: 'a', text: 'Give up immediately' }, { id: 'b', text: 'Delete everything and start over' }, { id: 'c', text: 'Read the error message and debug step by step' }, { id: 'd', text: 'Ignore it and move on' }], correctOptionId: 'c' },
  ],
  [
    { id: 'q1', question: 'Why is understanding fundamentals important?', options: [{ id: 'a', text: 'It is not important at all' }, { id: 'b', text: 'It builds a strong foundation for advanced topics' }, { id: 'c', text: 'Only to pass exams' }, { id: 'd', text: 'Fundamentals are outdated' }], correctOptionId: 'b' },
    { id: 'q2', question: 'What is the best way to retain what you learned?', options: [{ id: 'a', text: 'Watch the video once and never revisit' }, { id: 'b', text: 'Practice regularly and build projects' }, { id: 'c', text: 'Memorize everything word for word' }, { id: 'd', text: 'Avoid taking notes' }], correctOptionId: 'b' },
    { id: 'q3', question: 'How can you test your understanding of a concept?', options: [{ id: 'a', text: 'Explain it to someone else' }, { id: 'b', text: 'Assume you know it without verifying' }, { id: 'c', text: 'Skip the exercises' }, { id: 'd', text: 'Only read the comments' }], correctOptionId: 'a' },
  ],
  [
    { id: 'q1', question: 'What is a good habit when following a tutorial?', options: [{ id: 'a', text: 'Copy-paste everything without reading' }, { id: 'b', text: 'Type the code yourself and experiment' }, { id: 'c', text: 'Skip to the end' }, { id: 'd', text: 'Watch at 4x speed' }], correctOptionId: 'b' },
    { id: 'q2', question: 'Which resource is most helpful alongside video tutorials?', options: [{ id: 'a', text: 'Official documentation' }, { id: 'b', text: 'Random social media posts' }, { id: 'c', text: 'Unverified blog comments' }, { id: 'd', text: 'Nothing else is needed' }], correctOptionId: 'a' },
    { id: 'q3', question: 'What should you do after completing a lesson?', options: [{ id: 'a', text: 'Immediately forget everything' }, { id: 'b', text: 'Never look back' }, { id: 'c', text: 'Review key points and try a small exercise' }, { id: 'd', text: 'Skip to an unrelated topic' }], correctOptionId: 'c' },
  ],
];

export function getVideoQuiz(videoId: string): QuizQuestion[] {
  // Simple hash to pick a question set for variety
  let hash = 0;
  for (let i = 0; i < videoId.length; i++) {
    hash = ((hash << 5) - hash + videoId.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % QUIZ_POOL.length;
  return QUIZ_POOL[index];
}

// --- Helper: extract YouTube video ID ---
export function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export function getYouTubeThumbnail(url: string): string {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
}

// --- Sample data ---

const SAMPLE_COURSES: LocalCourse[] = [
  {
    id: 'course-react-crash',
    title: 'React Crash Course 2024',
    description: 'Learn React fundamentals in short, focused videos. Covers components, hooks, state management, and building real projects.',
    thumbnail: 'https://img.youtube.com/vi/SqcY0GlETPk/hqdefault.jpg',
    instructor: 'Programming with Mosh',
    level: 'beginner',
    createdAt: new Date().toISOString(),
    videos: [
      { id: 'v-react-1', title: 'What is React?', youtubeUrl: 'https://www.youtube.com/watch?v=SqcY0GlETPk', duration: '12:08' },
      { id: 'v-react-2', title: 'Setting Up the Environment', youtubeUrl: 'https://www.youtube.com/watch?v=Ke90Tje7VS0', duration: '8:45' },
      { id: 'v-react-3', title: 'Creating a React App', youtubeUrl: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8', duration: '15:22' },
      { id: 'v-react-4', title: 'React Components', youtubeUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM', duration: '10:17' },
      { id: 'v-react-5', title: 'React Hooks Explained', youtubeUrl: 'https://www.youtube.com/watch?v=TNhaISOUy6Q', duration: '14:33' },
    ],
  },
  {
    id: 'course-js-essentials',
    title: 'JavaScript Essentials',
    description: 'Master JavaScript from the basics to advanced concepts. Perfect for beginners who want to build a strong foundation.',
    thumbnail: 'https://img.youtube.com/vi/hdI2bqOjy3c/hqdefault.jpg',
    instructor: 'Traversy Media',
    level: 'beginner',
    createdAt: new Date().toISOString(),
    videos: [
      { id: 'v-js-1', title: 'JavaScript Crash Course', youtubeUrl: 'https://www.youtube.com/watch?v=hdI2bqOjy3c', duration: '11:55' },
      { id: 'v-js-2', title: 'Variables & Data Types', youtubeUrl: 'https://www.youtube.com/watch?v=edlFjlzxkSI', duration: '9:30' },
      { id: 'v-js-3', title: 'Functions & Scope', youtubeUrl: 'https://www.youtube.com/watch?v=xUI5Tsl2JpY', duration: '13:12' },
      { id: 'v-js-4', title: 'DOM Manipulation', youtubeUrl: 'https://www.youtube.com/watch?v=y17RuWkWdn8', duration: '16:44' },
    ],
  },
  {
    id: 'course-python-beginners',
    title: 'Python for Beginners',
    description: 'A comprehensive introduction to Python programming. Learn syntax, data structures, functions, and object-oriented programming.',
    thumbnail: 'https://img.youtube.com/vi/kqtD5dpn9C8/hqdefault.jpg',
    instructor: 'Programming with Mosh',
    level: 'beginner',
    createdAt: new Date().toISOString(),
    videos: [
      { id: 'v-py-1', title: 'Python Tutorial for Beginners', youtubeUrl: 'https://www.youtube.com/watch?v=kqtD5dpn9C8', duration: '10:25' },
      { id: 'v-py-2', title: 'Variables in Python', youtubeUrl: 'https://www.youtube.com/watch?v=cQT33yu9pY8', duration: '8:15' },
      { id: 'v-py-3', title: 'Python Data Structures', youtubeUrl: 'https://www.youtube.com/watch?v=W8KRzm-HUcc', duration: '14:50' },
      { id: 'v-py-4', title: 'Functions in Python', youtubeUrl: 'https://www.youtube.com/watch?v=u-OmVr_fT4s', duration: '11:33' },
      { id: 'v-py-5', title: 'Classes & Objects', youtubeUrl: 'https://www.youtube.com/watch?v=JeznW_7DlB0', duration: '13:22' },
      { id: 'v-py-6', title: 'Python Projects for Practice', youtubeUrl: 'https://www.youtube.com/watch?v=8ext9G7xspg', duration: '18:05' },
    ],
  },
  {
    id: 'course-typescript',
    title: 'TypeScript Complete Guide',
    description: 'Deep dive into TypeScript — types, interfaces, generics, and best practices for scalable applications.',
    thumbnail: 'https://img.youtube.com/vi/BwuLxPH8IDs/hqdefault.jpg',
    instructor: 'Academind',
    level: 'intermediate',
    createdAt: new Date().toISOString(),
    videos: [
      { id: 'v-ts-1', title: 'TypeScript Introduction', youtubeUrl: 'https://www.youtube.com/watch?v=BwuLxPH8IDs', duration: '15:10' },
      { id: 'v-ts-2', title: 'TypeScript Types', youtubeUrl: 'https://www.youtube.com/watch?v=ahCwqrYpIuM', duration: '12:40' },
      { id: 'v-ts-3', title: 'Interfaces & Type Aliases', youtubeUrl: 'https://www.youtube.com/watch?v=crjIq7LEAYw', duration: '11:28' },
      { id: 'v-ts-4', title: 'Generics in TypeScript', youtubeUrl: 'https://www.youtube.com/watch?v=nViEqpgwxHE', duration: '14:15' },
    ],
  },
  {
    id: 'course-node-api',
    title: 'Node.js REST API from Scratch',
    description: 'Build production-ready REST APIs with Node.js, Express, and MongoDB. Covers authentication, validation, and deployment.',
    thumbnail: 'https://img.youtube.com/vi/fgTGADljAeg/hqdefault.jpg',
    instructor: 'Dev Ed',
    level: 'intermediate',
    createdAt: new Date().toISOString(),
    videos: [
      { id: 'v-node-1', title: 'Node.js & Express Setup', youtubeUrl: 'https://www.youtube.com/watch?v=fgTGADljAeg', duration: '13:40' },
      { id: 'v-node-2', title: 'REST API Routes', youtubeUrl: 'https://www.youtube.com/watch?v=vjf774RKrLc', duration: '10:55' },
      { id: 'v-node-3', title: 'MongoDB & Mongoose', youtubeUrl: 'https://www.youtube.com/watch?v=DZBGEVgL2eE', duration: '16:10' },
      { id: 'v-node-4', title: 'Authentication with JWT', youtubeUrl: 'https://www.youtube.com/watch?v=mbsmsi7l3r4', duration: '18:22' },
      { id: 'v-node-5', title: 'Error Handling & Validation', youtubeUrl: 'https://www.youtube.com/watch?v=DRLrdDSJoVY', duration: '12:30' },
    ],
  },
  {
    id: 'course-css-layout',
    title: 'CSS Flexbox & Grid Mastery',
    description: 'Master modern CSS layout techniques with Flexbox and Grid. Build responsive layouts from scratch.',
    thumbnail: 'https://img.youtube.com/vi/JJSoEo8JSnc/hqdefault.jpg',
    instructor: 'Kevin Powell',
    level: 'beginner',
    createdAt: new Date().toISOString(),
    videos: [
      { id: 'v-css-1', title: 'Flexbox Crash Course', youtubeUrl: 'https://www.youtube.com/watch?v=JJSoEo8JSnc', duration: '10:40' },
      { id: 'v-css-2', title: 'CSS Grid in 20 Minutes', youtubeUrl: 'https://www.youtube.com/watch?v=9zBsdzdE4sM', duration: '11:15' },
      { id: 'v-css-3', title: 'Responsive Design Patterns', youtubeUrl: 'https://www.youtube.com/watch?v=srvUrASNj0s', duration: '14:30' },
    ],
  },
];

// --- Store ---

interface CourseStore {
  courses: LocalCourse[];
  progress: VideoProgress[];
  quizProgress: QuizProgress[];
  groups: StudentGroup[];
  addCourse: (course: Omit<LocalCourse, 'id' | 'createdAt'>) => void;
  deleteCourse: (courseId: string) => void;
  markVideoCompleted: (courseId: string, videoId: string) => void;
  getVideoProgress: (courseId: string, videoId: string) => VideoProgress | undefined;
  getCourseProgress: (courseId: string) => { completed: number; total: number; percent: number };
  completeQuiz: (courseId: string, videoId: string, score: number, total: number) => void;
  getQuizProgress: (courseId: string, videoId: string) => QuizProgress | undefined;
  addGroup: (group: Omit<StudentGroup, 'id' | 'createdAt'>) => void;
  deleteGroup: (groupId: string) => void;
  updateGroup: (groupId: string, updates: Partial<Pick<StudentGroup, 'name' | 'description' | 'courseIds' | 'members'>>) => void;
  assignCoursesToGroup: (groupId: string, courseIds: string[]) => void;
  removeCourseFromGroup: (groupId: string, courseId: string) => void;
  addMemberToGroup: (groupId: string, member: { name: string; email: string }) => void;
  removeMemberFromGroup: (groupId: string, email: string) => void;
}

export const useCourseStore = create<CourseStore>()(
  persist(
    (set, get) => ({
      courses: SAMPLE_COURSES,
      progress: [],
      quizProgress: [],
      groups: [],

      addCourse: (courseData) => {
        const course: LocalCourse = {
          ...courseData,
          id: `course-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ courses: [course, ...state.courses] }));
      },

      deleteCourse: (courseId) => {
        set((state) => ({
          courses: state.courses.filter((c) => c.id !== courseId),
          progress: state.progress.filter((p) => p.courseId !== courseId),
          quizProgress: state.quizProgress.filter((q) => q.courseId !== courseId),
        }));
      },

      markVideoCompleted: (courseId, videoId) => {
        set((state) => {
          const existing = state.progress.find(
            (p) => p.courseId === courseId && p.videoId === videoId
          );
          if (existing?.completed) return state;
          return {
            progress: [
              ...state.progress.filter(
                (p) => !(p.courseId === courseId && p.videoId === videoId)
              ),
              { courseId, videoId, completed: true, watchedAt: new Date().toISOString() },
            ],
          };
        });
      },

      getVideoProgress: (courseId, videoId) => {
        return get().progress.find(
          (p) => p.courseId === courseId && p.videoId === videoId
        );
      },

      getCourseProgress: (courseId) => {
        const course = get().courses.find((c) => c.id === courseId);
        if (!course) return { completed: 0, total: 0, percent: 0 };
        const total = course.videos.length;
        const completed = get().progress.filter(
          (p) => p.courseId === courseId && p.completed
        ).length;
        return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
      },

      completeQuiz: (courseId, videoId, score, total) => {
        set((state) => ({
          quizProgress: [
            ...state.quizProgress.filter(
              (q) => !(q.courseId === courseId && q.videoId === videoId)
            ),
            { courseId, videoId, score, total, completedAt: new Date().toISOString() },
          ],
        }));
      },

      getQuizProgress: (courseId, videoId) => {
        return get().quizProgress.find(
          (q) => q.courseId === courseId && q.videoId === videoId
        );
      },

      addGroup: (groupData) => {
        const group: StudentGroup = {
          ...groupData,
          id: `group-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ groups: [group, ...state.groups] }));
      },

      deleteGroup: (groupId) => {
        set((state) => ({ groups: state.groups.filter((g) => g.id !== groupId) }));
      },

      updateGroup: (groupId, updates) => {
        set((state) => ({
          groups: state.groups.map((g) => (g.id === groupId ? { ...g, ...updates } : g)),
        }));
      },

      assignCoursesToGroup: (groupId, courseIds) => {
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? { ...g, courseIds: [...new Set([...g.courseIds, ...courseIds])] }
              : g
          ),
        }));
      },

      removeCourseFromGroup: (groupId, courseId) => {
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? { ...g, courseIds: g.courseIds.filter((id) => id !== courseId) }
              : g
          ),
        }));
      },

      addMemberToGroup: (groupId, member) => {
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId && !g.members.some((m) => m.email === member.email)
              ? { ...g, members: [...g.members, member] }
              : g
          ),
        }));
      },

      removeMemberFromGroup: (groupId, email) => {
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? { ...g, members: g.members.filter((m) => m.email !== email) }
              : g
          ),
        }));
      },
    }),
    { name: 'heybobo-courses' }
  )
);
