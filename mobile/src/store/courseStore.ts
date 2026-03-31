import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { asyncStorage } from '@/lib/storage'

// --- Types ---
export interface LocalVideo {
  id: string
  title: string
  youtubeUrl: string
  duration: string
}

export interface LocalCourse {
  id: string
  title: string
  description: string
  thumbnail: string
  instructor: string
  level: 'beginner' | 'intermediate' | 'advanced'
  videos: LocalVideo[]
  createdAt: string
}

export interface VideoProgress {
  videoId: string
  courseId: string
  completed: boolean
  watchedAt?: string
}

// --- YouTube helpers ---
export function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

export function getYouTubeThumbnail(url: string): string {
  const id = getYouTubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : ''
}

// --- Default courses (same as web) ---
export const DEFAULT_COURSES: LocalCourse[] = [
  {
    id: 'default-web-dev',
    title: 'Complete Web Development Bootcamp',
    description: 'Master HTML, CSS, JavaScript, and React. Build real-world projects and become a job-ready full-stack developer.',
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
    description: 'Start your programming journey with Python. Learn syntax, data structures, functions, OOP, and build practical projects.',
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
    description: 'Deep-dive into modern React with hooks, context, TypeScript integration, and state management.',
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
    description: 'Build strength, endurance, and flexibility with science-backed workout programs.',
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
    description: 'Understand macros, build balanced meal plans, and develop sustainable healthy eating habits.',
    thumbnail: 'https://img.youtube.com/vi/lXz_1_FEEUw/hqdefault.jpg',
    instructor: 'Dr. Andrew Huberman',
    level: 'beginner',
    createdAt: '2024-01-09T00:00:00.000Z',
    videos: [
      { id: 'dnt-v1', title: 'Understanding Macronutrients', youtubeUrl: 'https://www.youtube.com/watch?v=lXz_1_FEEUw', duration: '34:20' },
      { id: 'dnt-v2', title: 'How to Build a Balanced Meal', youtubeUrl: 'https://www.youtube.com/watch?v=6P3hqbJLBsA', duration: '28:15' },
      { id: 'dnt-v3', title: 'Meal Prep for the Week — Beginners Guide', youtubeUrl: 'https://www.youtube.com/watch?v=P5mJ2qmdMSw', duration: '45:10' },
      { id: 'dnt-v4', title: 'Reading Nutrition Labels & Calorie Counting', youtubeUrl: 'https://www.youtube.com/watch?v=dtPNVnBGz2Q', duration: '22:00' },
      { id: 'dnt-v5', title: 'Healthy Snacking & Mindful Eating', youtubeUrl: 'https://www.youtube.com/watch?v=ChoZMuFHSmg', duration: '18:45' },
    ],
  },
  {
    id: 'default-data-science',
    title: 'Data Science with Python',
    description: 'From data wrangling to machine learning — learn Pandas, NumPy, Matplotlib, and Scikit-learn.',
    thumbnail: 'https://img.youtube.com/vi/LHBE6Q9XlzI/hqdefault.jpg',
    instructor: 'freeCodeCamp',
    level: 'intermediate',
    createdAt: '2024-01-11T00:00:00.000Z',
    videos: [
      { id: 'dds-v1', title: 'Data Science Full Course — Python', youtubeUrl: 'https://www.youtube.com/watch?v=LHBE6Q9XlzI', duration: '12:09:04' },
      { id: 'dds-v2', title: 'Pandas for Data Analysis', youtubeUrl: 'https://www.youtube.com/watch?v=vmEHCJofslg', duration: '3:50:00' },
      { id: 'dds-v3', title: 'Data Visualization with Matplotlib', youtubeUrl: 'https://www.youtube.com/watch?v=GPVsHOlRBBI', duration: '2:00:00' },
      { id: 'dds-v4', title: 'Machine Learning with Scikit-Learn', youtubeUrl: 'https://www.youtube.com/watch?v=pqNCD_5r0IU', duration: '3:10:00' },
      { id: 'dds-v5', title: 'Deep Learning Crash Course', youtubeUrl: 'https://www.youtube.com/watch?v=VyWAvY2CF9c', duration: '2:14:00' },
    ],
  },
  {
    id: 'default-ui-ux',
    title: 'UI/UX Design Fundamentals',
    description: 'Learn design principles, wireframing, prototyping, and user research. Master Figma.',
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
    description: 'Understand ML algorithms, neural networks, and AI concepts. Build models with Python and TensorFlow.',
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
]

// --- Store ---
interface CourseStore {
  courses: LocalCourse[]
  progress: VideoProgress[]
  addCourse: (course: Omit<LocalCourse, 'id' | 'createdAt'>) => void
  deleteCourse: (courseId: string) => void
  markVideoCompleted: (courseId: string, videoId: string) => void
  getCourseProgress: (courseId: string) => { completed: number; total: number; percent: number }
  updateProgress: (lessonId: string, data: any) => void
}

export const useCourseStore = create<CourseStore>()(
  persist(
    (set, get) => ({
      courses: DEFAULT_COURSES,
      progress: [],

      addCourse: (courseData) => {
        const course: LocalCourse = {
          ...courseData,
          id: `course-${Date.now()}`,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ courses: [course, ...s.courses] }))
      },

      deleteCourse: (courseId) => {
        set((s) => ({
          courses:  s.courses.filter((c) => c.id !== courseId),
          progress: s.progress.filter((p) => p.courseId !== courseId),
        }))
      },

      markVideoCompleted: (courseId, videoId) => {
        set((s) => {
          const exists = s.progress.find((p) => p.courseId === courseId && p.videoId === videoId)
          if (exists?.completed) return s
          return {
            progress: [
              ...s.progress.filter((p) => !(p.courseId === courseId && p.videoId === videoId)),
              { courseId, videoId, completed: true, watchedAt: new Date().toISOString() },
            ],
          }
        })
      },

      updateProgress: (_lessonId, _data) => {
        // No-op for local YouTube courses; used by legacy API-based progress hook
      },

      getCourseProgress: (courseId) => {
        const course = get().courses.find((c) => c.id === courseId)
        if (!course) return { completed: 0, total: 0, percent: 0 }
        const total     = course.videos.length
        const completed = get().progress.filter((p) => p.courseId === courseId && p.completed).length
        return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 }
      },
    }),
    {
      name:    'heybobo-courses',
      storage: createJSONStorage(() => asyncStorage),
    },
  ),
)
