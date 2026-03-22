export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  CREATOR = 'creator',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  COLLEGE_ADMIN = 'college_admin',
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  profileImage?: string
  bio?: string
  createdAt: string
  updatedAt: string
}

export interface UserProfile extends User {
  totalEnrolled: number
  totalCompleted: number
  totalCertificates: number
  hoursWatched: number
  currentStreak: number
  lastActivityAt?: string
}

export interface Course {
  id: string
  title: string
  slug: string
  description: string
  thumbnail: string
  instructor: User
  category: Category
  level: 'beginner' | 'intermediate' | 'advanced'
  language: string
  price: number
  currency: string
  rating: number
  ratingCount: number
  enrollmentCount: number
  lessonCount: number
  sectionCount: number
  totalDuration: number
  publishedAt?: string
  createdAt: string
  updatedAt: string
  certificateEnabled: boolean
  isPublished: boolean
  whatYouWillLearn: string[]
}

export interface CourseSection {
  id: string
  courseId: string
  title: string
  description?: string
  order: number
  lessons: Lesson[]
  createdAt: string
  updatedAt: string
}

export interface Lesson {
  id: string
  sectionId: string
  title: string
  description?: string
  type: 'video' | 'article' | 'quiz' | 'assignment' | 'practice'
  content?: string
  videoUrl?: string
  duration: number
  order: number
  isPreview: boolean
  resources: Resource[]
  createdAt: string
  updatedAt: string
}

export interface Resource {
  id: string
  lessonId: string
  title: string
  type: 'pdf' | 'document' | 'link' | 'code' | 'file'
  url: string
  fileSize?: number
  createdAt: string
}

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  course?: Course
  status: 'active' | 'completed' | 'dropped'
  progressPercentage: number
  enrolledAt: string
  completedAt?: string
  certificateId?: string
}

export interface LessonProgress {
  id: string
  enrollmentId: string
  lessonId: string
  lesson?: Lesson
  status: 'not_started' | 'in_progress' | 'completed'
  watchedSeconds: number
  totalSeconds: number
  completedAt?: string
  lastAccessedAt: string
  isBookmarked: boolean
}

export interface Quiz {
  id: string
  lessonId: string
  title: string
  description?: string
  passingScore: number
  timeLimit?: number
  attemptsAllowed: number
  questions: QuizQuestion[]
  createdAt: string
  updatedAt: string
}

export interface QuizQuestion {
  id: string
  quizId: string
  text: string
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay'
  options?: QuizOption[]
  correctAnswer?: string
  explanation?: string
  points: number
  order: number
}

export interface QuizOption {
  id: string
  text: string
  isCorrect: boolean
}

export interface QuizAttempt {
  id: string
  userId: string
  quizId: string
  quiz?: Quiz
  score: number
  maxScore: number
  percentage: number
  status: 'completed' | 'submitted'
  answers: QuizAnswer[]
  startedAt: string
  submittedAt: string
}

export interface QuizAnswer {
  questionId: string
  selectedAnswer: string
  isCorrect: boolean
  points: number
}

export interface Assignment {
  id: string
  lessonId: string
  title: string
  description: string
  rubric?: string
  dueDate?: string
  maxScore: number
  createdAt: string
  updatedAt: string
}

export interface AssignmentSubmission {
  id: string
  assignmentId: string
  userId: string
  content: string
  attachments: string[]
  score?: number
  feedback?: string
  submittedAt: string
  gradedAt?: string
}

export interface Certificate {
  id: string
  enrollmentId: string
  enrollment?: Enrollment
  courseId: string
  course?: Course
  userId: string
  user?: User
  certificateCode: string
  issuedAt: string
  expiresAt?: string
}

export interface Notification {
  id: string
  userId: string
  type: 'enrollment' | 'quiz' | 'assignment' | 'lesson' | 'certificate' | 'message' | 'system'
  title: string
  message: string
  actionUrl?: string
  isRead: boolean
  createdAt: string
}

export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface AIConversation {
  id: string
  userId: string
  courseId?: string
  lessonId?: string
  title: string
  messages: AIMessage[]
  createdAt: string
  updatedAt: string
}

export interface AIDocument {
  id: string
  _id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  pageCount: number
  createdAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  courseCount: number
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: string
  courseId: string
  userId: string
  user?: User
  rating: number
  title: string
  content: string
  helpful: number
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  error?: string
}

// Filter and query types
export interface CourseFilter {
  categoryId?: string
  level?: string
  language?: string
  priceMin?: number
  priceMax?: number
  ratingMin?: number
  durationMin?: number
  durationMax?: number
  sortBy?: 'newest' | 'popular' | 'rating' | 'price_low' | 'price_high'
  page?: number
  pageSize?: number
  search?: string
}

export interface EnrollmentStats {
  total: number
  active: number
  completed: number
  dropped: number
}

export interface LearningStats {
  totalEnrolled: number
  totalCompleted: number
  hoursWatched: number
  currentStreak: number
  certificatesEarned: number
  coursesInProgress: number
}

export interface CourseAnalytics {
  courseId: string
  enrollmentCount: number
  completionRate: number
  avgRating: number
  revenue: number
  lessonCompletion: Record<string, number>
  quizPerformance: Record<string, number>
}

export interface PlatformAnalytics {
  totalUsers: number
  totalEnrollments: number
  totalCourses: number
  totalRevenue: number
  signupTrend: Array<{ date: string; count: number }>
  enrollmentTrend: Array<{ date: string; count: number }>
}

export interface TeacherStudents {
  courseId: string
  students: Array<{
    userId: string
    email: string
    firstName: string
    lastName: string
    profileImage?: string
    enrolledAt: string
    progressPercentage: number
    status: 'active' | 'completed' | 'dropped'
  }>
}
