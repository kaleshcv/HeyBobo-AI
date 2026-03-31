// ─── Roles ───────────────────────────────────────────────
export enum UserRole {
  STUDENT       = 'student',
  TEACHER       = 'teacher',
  CREATOR       = 'creator',
  ADMIN         = 'admin',
  MODERATOR     = 'moderator',
  COLLEGE_ADMIN = 'college_admin',
}

// ─── User ─────────────────────────────────────────────────
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  profileImage?: string
  bio?: string
  expoPushToken?: string
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

// ─── Course / Education ────────────────────────────────────
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  courseCount: number
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

// ─── Quiz ─────────────────────────────────────────────────
export interface Quiz {
  id: string
  lessonId: string
  courseId: string
  title: string
  description?: string
  timeLimit?: number
  passingScore: number
  questions: QuizQuestion[]
  createdAt: string
  updatedAt: string
}

export interface QuizQuestion {
  id: string
  quizId: string
  question: string
  type: 'multiple_choice' | 'true_false' | 'short_answer'
  options?: string[]
  correctAnswer: string | string[]
  explanation?: string
  points: number
  order: number
}

export interface QuizAttempt {
  id: string
  quizId: string
  userId: string
  answers: Record<string, string | string[]>
  score: number
  passed: boolean
  timeTaken: number
  completedAt: string
}

// ─── Assignment ────────────────────────────────────────────
export interface Assignment {
  id: string
  courseId: string
  lessonId?: string
  title: string
  description: string
  dueDate?: string
  maxScore: number
  instructions: string
  attachments: Resource[]
  createdAt: string
  updatedAt: string
}

export interface AssignmentSubmission {
  id: string
  assignmentId: string
  userId: string
  content: string
  attachments: Resource[]
  score?: number
  feedback?: string
  status: 'submitted' | 'graded' | 'returned'
  submittedAt: string
  gradedAt?: string
}

// ─── Certificate ───────────────────────────────────────────
export interface Certificate {
  id: string
  userId: string
  courseId: string
  course?: Course
  user?: User
  certificateNumber: string
  issuedAt: string
  verificationUrl: string
}

// ─── Notifications ─────────────────────────────────────────
export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'course' | 'achievement'
  isRead: boolean
  data?: Record<string, any>
  createdAt: string
}

// ─── Review ────────────────────────────────────────────────
export interface Review {
  id: string
  courseId: string
  userId: string
  user?: User
  rating: number
  comment?: string
  createdAt: string
  updatedAt: string
}

// ─── AI ────────────────────────────────────────────────────
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

export interface AIMessage {
  id: string
  conversationId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

// ─── Analytics ─────────────────────────────────────────────
export interface CourseAnalytics {
  courseId: string
  totalEnrollments: number
  completionRate: number
  averageRating: number
  averageProgress: number
  revenueTotal: number
  weeklyEnrollments: { date: string; count: number }[]
  lessonCompletionRates: { lessonId: string; title: string; rate: number }[]
}

export interface PlatformAnalytics {
  totalUsers: number
  totalCourses: number
  totalEnrollments: number
  totalRevenue: number
  activeUsers: number
  newUsersThisMonth: number
  dailyActiveUsers: { date: string; count: number }[]
}

export interface LearningStats {
  totalCoursesEnrolled: number
  totalCoursesCompleted: number
  totalHoursWatched: number
  currentStreak: number
  longestStreak: number
  totalCertificates: number
  weeklyProgress: { date: string; minutesWatched: number }[]
}

export interface EnrollmentStats {
  total: number
  active: number
  completed: number
  dropped: number
}

export interface TeacherStudents {
  students: UserProfile[]
  total: number
  byEnrollment: {
    courseId: string
    courseTitle: string
    studentCount: number
  }[]
}

// ─── Fitness ───────────────────────────────────────────────
export type FitnessGoal = 'weight-loss' | 'muscle-gain' | 'general-fitness' | 'endurance' | 'rehab-mobility'
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced'
export type ActivityLevel = 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extremely-active'

export interface FitnessProfile {
  goals: FitnessGoal[]
  heightCm: number | null
  weightKg: number | null
  activityLevel: ActivityLevel | null
  fitnessLevel: FitnessLevel | null
  injuries: string
  daysPerWeek: number
  minutesPerDay: number
}

export interface Exercise {
  id: string
  name: string
  category: string
  muscleGroups: string[]
  equipment: string[]
  difficulty: FitnessLevel
  instructions: string[]
  videoUrl?: string
  imageUrl?: string
  caloriesPerMinute: number
}

export interface WorkoutPlan {
  id: string
  userId: string
  title: string
  description?: string
  goal: FitnessGoal
  level: FitnessLevel
  durationWeeks: number
  daysPerWeek: number
  exercises: WorkoutExercise[]
  createdAt: string
}

export interface WorkoutExercise {
  exerciseId: string
  exercise: Exercise
  sets: number
  reps?: number
  durationSeconds?: number
  restSeconds: number
  order: number
}

export interface WorkoutSession {
  id: string
  userId: string
  workoutPlanId?: string
  title: string
  durationSeconds: number
  caloriesBurned: number
  exercisesCompleted: number
  heartRateAvg?: number
  notes?: string
  completedAt: string
}

export interface ActivityLog {
  id: string
  userId: string
  date: string
  steps: number
  caloriesBurned: number
  activeMinutes: number
  distance: number
  heartRateResting?: number
  heartRateAvg?: number
  sleepHours?: number
}

// ─── Dietary ──────────────────────────────────────────────
export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH     = 'lunch',
  DINNER    = 'dinner',
  SNACK     = 'snack',
}

export enum DietGoal {
  LOSE_WEIGHT    = 'lose_weight',
  GAIN_WEIGHT    = 'gain_weight',
  MAINTAIN       = 'maintain',
  BUILD_MUSCLE   = 'build_muscle',
  IMPROVE_HEALTH = 'improve_health',
}

export enum DietType {
  STANDARD       = 'standard',
  VEGETARIAN     = 'vegetarian',
  VEGAN          = 'vegan',
  KETO           = 'keto',
  PALEO          = 'paleo',
  MEDITERRANEAN  = 'mediterranean',
  LOW_CARB       = 'low_carb',
  HIGH_PROTEIN   = 'high_protein',
  GLUTEN_FREE    = 'gluten_free',
  DAIRY_FREE     = 'dairy_free',
}

export interface FoodItem {
  id: string
  name: string
  barcode?: string
  servingSize: number
  servingUnit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  sodium?: number
}

export interface MealLog {
  id: string
  userId: string
  date: string
  mealType: MealType
  foodItem: FoodItem
  quantity: number
  calories: number
  protein: number
  carbs: number
  fat: number
  loggedAt: string
}

export interface NutritionSummary {
  date: string
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  targetCalories: number
  targetProtein: number
  targetCarbs: number
  targetFat: number
  meals: MealLog[]
}

export interface MealPlan {
  id: string
  userId: string
  title: string
  startDate: string
  endDate: string
  days: MealPlanDay[]
  createdAt: string
}

export interface MealPlanDay {
  date: string
  meals: {
    breakfast?: FoodItem[]
    lunch?: FoodItem[]
    dinner?: FoodItem[]
    snacks?: FoodItem[]
  }
  totalCalories: number
}

export interface GroceryItem {
  id: string
  name: string
  quantity: string
  category: string
  checked: boolean
}

// ─── Grooming ─────────────────────────────────────────────
export interface GroomingProfile {
  skinType?: 'oily' | 'dry' | 'combination' | 'normal' | 'sensitive'
  skinConcerns: string[]
  hairType?: string
  hairConcerns: string[]
  routinePreference?: 'minimal' | 'moderate' | 'extensive'
}

export interface GroomingRecommendation {
  id: string
  category: 'skincare' | 'haircare' | 'fitness' | 'lifestyle'
  title: string
  description: string
  products?: { name: string; reason: string }[]
  routine?: string[]
  priority: 'high' | 'medium' | 'low'
}

export interface VisualAnalysisResult {
  skinCondition: string
  concerns: string[]
  recommendations: GroomingRecommendation[]
  overallScore: number
  analyzedAt: string
}

// ─── Groups & Meetings ────────────────────────────────────
export interface Group {
  id: string
  name: string
  description?: string
  avatar?: string
  courseId?: string
  memberCount: number
  isPublic: boolean
  createdAt: string
}

export interface Meeting {
  id: string
  title: string
  description?: string
  hostId: string
  host?: User
  participantIds: string[]
  courseId?: string
  scheduledAt: string
  durationMinutes: number
  meetingUrl?: string
  status: 'scheduled' | 'live' | 'ended' | 'cancelled'
  createdAt: string
}

// ─── API Responses ─────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CourseFilter {
  category?: string
  level?: string
  language?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  search?: string
  page?: number
  limit?: number
  sort?: 'newest' | 'popular' | 'rating' | 'price_asc' | 'price_desc'
}

// ─── Auth ─────────────────────────────────────────────────
export interface LoginDto {
  identifier: string
  password: string
}

export interface RegisterDto {
  email: string
  password: string
  firstName: string
  lastName: string
  username: string
  role?: UserRole
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}
