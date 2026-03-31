import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createUserStorage } from '@/lib/userStorage';

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

// --- Default seed courses (visible to all users) ---
export const DEFAULT_COURSES: LocalCourse[] = [
  {
    id: 'default-web-dev',
    title: 'Complete Web Development Bootcamp',
    description: 'Master HTML, CSS, JavaScript, and React. Build real-world projects and become a job-ready full-stack developer from scratch.',
    thumbnail: 'https://img.youtube.com/vi/UB1O30fR-EE/hqdefault.jpg',
    instructor: 'Brad Traversy',
    level: 'beginner',
    createdAt: '2024-01-01T00:00:00.000Z',
    videos: [
      { id: 'dwd-v1', title: 'HTML Crash Course for Absolute Beginners', youtubeUrl: 'https://www.youtube.com/watch?v=UB1O30fR-EE', duration: '1:01:33' },
      { id: 'dwd-v2', title: 'CSS Crash Course for Absolute Beginners', youtubeUrl: 'https://www.youtube.com/watch?v=yfoY53QXEnI', duration: '1:25:08' },
      { id: 'dwd-v3', title: 'JavaScript Crash Course for Beginners', youtubeUrl: 'https://www.youtube.com/watch?v=hdI2bqOjy3c', duration: '1:40:29' },
      { id: 'dwd-v4', title: 'Flexbox & CSS Grid — Complete Guide', youtubeUrl: 'https://www.youtube.com/watch?v=FqmB-Zj2-PA', duration: '41:23' },
      { id: 'dwd-v5', title: 'React JS Crash Course', youtubeUrl: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8', duration: '1:47:25' },
      { id: 'dwd-v6', title: 'Node.js Crash Course', youtubeUrl: 'https://www.youtube.com/watch?v=fBNz5xF-Kx4', duration: '1:30:28' },
    ],
  },
  {
    id: 'default-python',
    title: 'Python Programming for Beginners',
    description: 'Start your programming journey with Python. Learn syntax, data structures, functions, OOP, and build practical real-world projects.',
    thumbnail: 'https://img.youtube.com/vi/rfscVS0vtbw/hqdefault.jpg',
    instructor: 'Dr. Chuck Severance',
    level: 'beginner',
    createdAt: '2024-01-03T00:00:00.000Z',
    videos: [
      { id: 'dpy-v1', title: 'Python for Everybody — Full University Course', youtubeUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw', duration: '13:37:10' },
      { id: 'dpy-v2', title: 'Python OOP — Object Oriented Programming', youtubeUrl: 'https://www.youtube.com/watch?v=ZDa-Z5JzLYM', duration: '1:02:30' },
      { id: 'dpy-v3', title: 'Python Data Structures & Algorithms', youtubeUrl: 'https://www.youtube.com/watch?v=pkYVOmU3MgA', duration: '1:55:00' },
      { id: 'dpy-v4', title: 'Python Functions, Modules & Packages', youtubeUrl: 'https://www.youtube.com/watch?v=9Os0o3wzS_I', duration: '45:20' },
      { id: 'dpy-v5', title: 'Build 5 Projects with Python', youtubeUrl: 'https://www.youtube.com/watch?v=8ext9G7xspg', duration: '1:00:00' },
    ],
  },
  {
    id: 'default-react',
    title: 'React & Modern JavaScript — Intermediate',
    description: 'Deep-dive into modern React with hooks, context, TypeScript integration, and state management. Build production-ready applications.',
    thumbnail: 'https://img.youtube.com/vi/bMknfKXIFA8/hqdefault.jpg',
    instructor: 'Maximilian Schwarzmüller',
    level: 'intermediate',
    createdAt: '2024-01-05T00:00:00.000Z',
    videos: [
      { id: 'drx-v1', title: 'React Full Course — Beginner to Advanced', youtubeUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8', duration: '11:55:27' },
      { id: 'drx-v2', title: 'React Hooks Deep Dive', youtubeUrl: 'https://www.youtube.com/watch?v=cF2lQ_gZeA8', duration: '1:05:00' },
      { id: 'drx-v3', title: 'React Router v6 Full Tutorial', youtubeUrl: 'https://www.youtube.com/watch?v=59IXY5IDrBA', duration: '52:01' },
      { id: 'drx-v4', title: 'React Context & State Management', youtubeUrl: 'https://www.youtube.com/watch?v=35lXWvCuM8o', duration: '1:10:00' },
      { id: 'drx-v5', title: 'TypeScript with React — Complete Guide', youtubeUrl: 'https://www.youtube.com/watch?v=FJDVKeh7RJI', duration: '1:22:00' },
    ],
  },
  {
    id: 'default-fitness',
    title: 'Fitness Training Fundamentals',
    description: 'Build strength, endurance, and flexibility with science-backed workout programs. From beginner bodyweight exercises to advanced training.',
    thumbnail: 'https://img.youtube.com/vi/IODxDxX7oi4/hqdefault.jpg',
    instructor: 'Jeff Nippard',
    level: 'beginner',
    createdAt: '2024-01-07T00:00:00.000Z',
    videos: [
      { id: 'dft-v1', title: 'Full Body Workout for Beginners', youtubeUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4', duration: '15:47' },
      { id: 'dft-v2', title: 'Science-Based Push Workout', youtubeUrl: 'https://www.youtube.com/watch?v=4y2ZDrDgmhk', duration: '12:30' },
      { id: 'dft-v3', title: '30-Minute HIIT Cardio — No Equipment', youtubeUrl: 'https://www.youtube.com/watch?v=ml6cT4AZdqI', duration: '31:05' },
      { id: 'dft-v4', title: 'Strength Training for Beginners', youtubeUrl: 'https://www.youtube.com/watch?v=ixkQaZXVQjs', duration: '20:00' },
      { id: 'dft-v5', title: 'Flexibility & Mobility Routine', youtubeUrl: 'https://www.youtube.com/watch?v=L_xrDAtykMI', duration: '33:22' },
    ],
  },
  {
    id: 'default-nutrition',
    title: 'Nutrition & Healthy Eating Guide',
    description: 'Understand macros, build balanced meal plans, learn meal prep, and develop sustainable healthy eating habits for life.',
    thumbnail: 'https://img.youtube.com/vi/lXz_1_FEEUw/hqdefault.jpg',
    instructor: 'Dr. Andrew Huberman',
    level: 'beginner',
    createdAt: '2024-01-09T00:00:00.000Z',
    videos: [
      { id: 'dnt-v1', title: 'Understanding Macronutrients — Protein, Carbs & Fats', youtubeUrl: 'https://www.youtube.com/watch?v=lXz_1_FEEUw', duration: '34:20' },
      { id: 'dnt-v2', title: 'How to Build a Balanced Meal', youtubeUrl: 'https://www.youtube.com/watch?v=6P3hqbJLBsA', duration: '28:15' },
      { id: 'dnt-v3', title: 'Meal Prep for the Week — Beginners Guide', youtubeUrl: 'https://www.youtube.com/watch?v=P5mJ2qmdMSw', duration: '45:10' },
      { id: 'dnt-v4', title: 'Reading Nutrition Labels & Calorie Counting', youtubeUrl: 'https://www.youtube.com/watch?v=dtPNVnBGz2Q', duration: '22:00' },
      { id: 'dnt-v5', title: 'Healthy Snacking & Mindful Eating', youtubeUrl: 'https://www.youtube.com/watch?v=ChoZMuFHSmg', duration: '18:45' },
    ],
  },
  {
    id: 'default-data-science',
    title: 'Data Science with Python',
    description: 'From data wrangling to machine learning — learn Pandas, NumPy, Matplotlib, Scikit-learn, and build real data science projects.',
    thumbnail: 'https://img.youtube.com/vi/LHBE6Q9XlzI/hqdefault.jpg',
    instructor: 'freeCodeCamp',
    level: 'intermediate',
    createdAt: '2024-01-11T00:00:00.000Z',
    videos: [
      { id: 'dds-v1', title: 'Data Science Full Course — Python', youtubeUrl: 'https://www.youtube.com/watch?v=LHBE6Q9XlzI', duration: '12:09:04' },
      { id: 'dds-v2', title: 'Pandas for Data Analysis — Full Tutorial', youtubeUrl: 'https://www.youtube.com/watch?v=vmEHCJofslg', duration: '3:50:00' },
      { id: 'dds-v3', title: 'Data Visualization with Matplotlib & Seaborn', youtubeUrl: 'https://www.youtube.com/watch?v=GPVsHOlRBBI', duration: '2:00:00' },
      { id: 'dds-v4', title: 'Machine Learning with Scikit-Learn', youtubeUrl: 'https://www.youtube.com/watch?v=pqNCD_5r0IU', duration: '3:10:00' },
      { id: 'dds-v5', title: 'Deep Learning & Neural Networks Crash Course', youtubeUrl: 'https://www.youtube.com/watch?v=VyWAvY2CF9c', duration: '2:14:00' },
    ],
  },
  {
    id: 'default-ui-ux',
    title: 'UI/UX Design Fundamentals',
    description: 'Learn design principles, wireframing, prototyping, and user research. Master Figma and create stunning, user-friendly interfaces.',
    thumbnail: 'https://img.youtube.com/vi/c9Wg6Cb_YlU/hqdefault.jpg',
    instructor: 'DesignCourse',
    level: 'beginner',
    createdAt: '2024-01-13T00:00:00.000Z',
    videos: [
      { id: 'dux-v1', title: 'UI Design for Beginners — Full Course', youtubeUrl: 'https://www.youtube.com/watch?v=c9Wg6Cb_YlU', duration: '1:20:00' },
      { id: 'dux-v2', title: 'Figma Crash Course for Beginners', youtubeUrl: 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', duration: '2:01:00' },
      { id: 'dux-v3', title: 'UX Research & User Interviews', youtubeUrl: 'https://www.youtube.com/watch?v=nYCJTea6AKo', duration: '38:00' },
      { id: 'dux-v4', title: 'Color Theory for UI Designers', youtubeUrl: 'https://www.youtube.com/watch?v=_2LLXnUdUIc', duration: '25:00' },
      { id: 'dux-v5', title: 'Responsive Design & Mobile-First', youtubeUrl: 'https://www.youtube.com/watch?v=srvUrASNj0s', duration: '58:00' },
    ],
  },
  {
    id: 'default-machine-learning',
    title: 'Machine Learning & AI Essentials',
    description: 'Understand machine learning algorithms, neural networks, and AI concepts. Build your first ML models using Python and TensorFlow.',
    thumbnail: 'https://img.youtube.com/vi/8mAITcNt710/hqdefault.jpg',
    instructor: 'freeCodeCamp',
    level: 'intermediate',
    createdAt: '2024-01-15T00:00:00.000Z',
    videos: [
      { id: 'dml-v1', title: 'Machine Learning with Python — Full Course', youtubeUrl: 'https://www.youtube.com/watch?v=8mAITcNt710', duration: '9:52:19' },
      { id: 'dml-v2', title: 'Introduction to Neural Networks', youtubeUrl: 'https://www.youtube.com/watch?v=aircAruvnKk', duration: '19:13' },
      { id: 'dml-v3', title: 'TensorFlow 2.0 Crash Course', youtubeUrl: 'https://www.youtube.com/watch?v=tPYj3fFJGjk', duration: '2:09:00' },
      { id: 'dml-v4', title: 'Natural Language Processing Tutorial', youtubeUrl: 'https://www.youtube.com/watch?v=8rXD5-xhemo', duration: '4:59:00' },
      { id: 'dml-v5', title: 'Computer Vision with Python', youtubeUrl: 'https://www.youtube.com/watch?v=01sAkU_NvOY', duration: '3:05:00' },
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
      courses: DEFAULT_COURSES,
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
    { 
      name: 'heybobo-courses', 
      storage: createUserStorage(),
      version: 2,
      migrate: (persistedState: any, version: number) => {
        // version < 2: add any missing default courses to existing users
        if (version < 2) {
          const existing: LocalCourse[] = persistedState?.courses || [];
          const existingIds = new Set(existing.map((c: LocalCourse) => c.id));
          const missing = DEFAULT_COURSES.filter((c) => !existingIds.has(c.id));
          return { ...persistedState, courses: [...missing, ...existing] };
        }
        return persistedState;
      },
    }
  )
);
