import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'
import { errorLogger } from '@/lib/errorLogger'
import {
  User,
  UserProfile,
  Course,
  CourseFilter,
  Enrollment,
  LessonProgress,
  Quiz,
  QuizAttempt,
  Assignment,
  AssignmentSubmission,
  Certificate,
  Notification,
  Review,
  PaginatedResponse,
  ApiResponse,
  Category,
  CourseSection,
  Lesson,
  AIConversation,
  AIMessage,
  CourseAnalytics,
  PlatformAnalytics,
  TeacherStudents,
  LearningStats,
  EnrollmentStats,
} from '@/types/index'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  isRefreshing = false
  failedQueue = []
}

const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const { accessToken } = useAuthStore.getState()
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // Response interceptor
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              return instance(originalRequest)
            })
            .catch((err) => Promise.reject(err))
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
            withCredentials: true,
          })
          const { accessToken } = response.data.data

          useAuthStore.getState().setToken(accessToken)
          originalRequest.headers.Authorization = `Bearer ${accessToken}`

          processQueue(null, accessToken)
          return instance(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError as Error, null)
          useAuthStore.getState().logout()
          window.location.href = '/auth/login'
          return Promise.reject(refreshError)
        }
      }

      // Log all API errors
      const status = error.response?.status
      const msg = error.response?.data?.message || error.message
      const url = error.config?.url || 'unknown'
      const method = error.config?.method?.toUpperCase() || 'UNKNOWN'
      if (status && status >= 500) {
        errorLogger.error(`API ${method} ${url} → ${status}: ${msg}`, 'ApiClient')
      } else if (status && status >= 400) {
        errorLogger.warn(`API ${method} ${url} → ${status}: ${msg}`, 'ApiClient')
      }

      return Promise.reject(error)
    }
  )

  return instance
}

const api = createApiInstance()

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/login', {
      email,
      password,
    }),

  register: (email: string, password: string, firstName: string, lastName: string, role: string) =>
    api.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/register', {
      email,
      password,
      firstName,
      lastName,
      role,
    }),

  logout: () => api.post('/auth/logout'),

  refreshToken: () => api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh'),

  googleAuth: (token: string) =>
    api.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/google', { token }),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<null>>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post<ApiResponse<null>>('/auth/reset-password', { token, password }),
}

// User API
export const userApi = {
  getMe: () => api.get<ApiResponse<UserProfile>>('/users/me'),

  updateProfile: (data: Partial<User>) =>
    api.put<ApiResponse<User>>('/users/me', data),

  getDashboard: () =>
    api.get<ApiResponse<{
      user: UserProfile
      stats: LearningStats
      recentCourses: Enrollment[]
      recommendedCourses: Course[]
    }>>('/users/dashboard'),

  getLearningStats: () =>
    api.get<ApiResponse<LearningStats>>('/users/learning-stats'),
}

// Course API
export const courseApi = {
  getCourses: (filters?: CourseFilter) =>
    api.get<ApiResponse<PaginatedResponse<Course>>>('/courses', { params: filters }),

  getCourse: (courseId: string) =>
    api.get<ApiResponse<Course & { sections: CourseSection[] }>>(`/courses/${courseId}`),

  getFeatured: () =>
    api.get<ApiResponse<Course[]>>('/courses/featured'),

  getRecommended: () =>
    api.get<ApiResponse<Course[]>>('/courses/recommended'),

  createCourse: (data: Partial<Course>) =>
    api.post<ApiResponse<Course>>('/courses', data),

  updateCourse: (courseId: string, data: Partial<Course>) =>
    api.put<ApiResponse<Course>>(`/courses/${courseId}`, data),

  publishCourse: (courseId: string) =>
    api.post<ApiResponse<Course>>(`/courses/${courseId}/publish`),

  // Teacher endpoints
  teacherGetCourses: () =>
    api.get<ApiResponse<Course[]>>('/teacher/courses'),

  teacherGetAnalytics: (courseId: string) =>
    api.get<ApiResponse<CourseAnalytics>>(`/teacher/courses/${courseId}/analytics`),

  // Course curriculum
  getSections: (courseId: string) =>
    api.get<ApiResponse<CourseSection[]>>(`/courses/${courseId}/sections`),

  createSection: (courseId: string, data: Partial<CourseSection>) =>
    api.post<ApiResponse<CourseSection>>(`/courses/${courseId}/sections`, data),

  updateSection: (courseId: string, sectionId: string, data: Partial<CourseSection>) =>
    api.put<ApiResponse<CourseSection>>(`/courses/${courseId}/sections/${sectionId}`, data),

  deleteSection: (courseId: string, sectionId: string) =>
    api.delete(`/courses/${courseId}/sections/${sectionId}`),

  createLesson: (courseId: string, sectionId: string, data: Partial<Lesson>) =>
    api.post<ApiResponse<Lesson>>(`/courses/${courseId}/sections/${sectionId}/lessons`, data),

  updateLesson: (courseId: string, sectionId: string, lessonId: string, data: Partial<Lesson>) =>
    api.put<ApiResponse<Lesson>>(
      `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
      data
    ),

  deleteLesson: (courseId: string, sectionId: string, lessonId: string) =>
    api.delete(`/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`),
}

// Enrollment API
export const enrollmentApi = {
  enroll: (courseId: string) =>
    api.post<ApiResponse<Enrollment>>('/enrollments', { courseId }),

  getMyEnrollments: (status?: string) =>
    api.get<ApiResponse<Enrollment[]>>('/enrollments/me', { params: { status } }),

  getEnrollment: (enrollmentId: string) =>
    api.get<ApiResponse<Enrollment>>(`/enrollments/${enrollmentId}`),

  getCourseEnrollment: (courseId: string) =>
    api.get<ApiResponse<Enrollment>>(`/enrollments/course/${courseId}`),

  getStats: () =>
    api.get<ApiResponse<EnrollmentStats>>('/enrollments/stats'),
}

// Lesson API
export const lessonApi = {
  getCourseLearn: (courseId: string) =>
    api.get<ApiResponse<{
      course: Course & { sections: CourseSection[] }
      enrollment: Enrollment
      progress: Record<string, LessonProgress>
      currentLesson?: Lesson
    }>>(`/lessons/course/${courseId}/learn`),

  getLessonProgress: (lessonId: string) =>
    api.get<ApiResponse<LessonProgress>>(`/lessons/${lessonId}/progress`),

  updateProgress: (lessonId: string, watchedSeconds: number, totalSeconds: number) =>
    api.post<ApiResponse<LessonProgress>>(`/lessons/${lessonId}/progress`, {
      watchedSeconds,
      totalSeconds,
    }),

  completeLesson: (lessonId: string) =>
    api.post<ApiResponse<LessonProgress>>(`/lessons/${lessonId}/complete`),

  addBookmark: (lessonId: string) =>
    api.post<ApiResponse<LessonProgress>>(`/lessons/${lessonId}/bookmark`),

  removeBookmark: (lessonId: string) =>
    api.delete<ApiResponse<LessonProgress>>(`/lessons/${lessonId}/bookmark`),

  getBookmarks: () =>
    api.get<ApiResponse<LessonProgress[]>>('/lessons/bookmarks'),

  getLesson: (lessonId: string) =>
    api.get<ApiResponse<Lesson>>(`/lessons/${lessonId}`),
}

// Quiz API
export const quizApi = {
  getQuiz: (quizId: string) =>
    api.get<ApiResponse<Quiz>>(`/quizzes/${quizId}`),

  startAttempt: (quizId: string) =>
    api.post<ApiResponse<QuizAttempt>>(`/quizzes/${quizId}/attempts`, {}),

  submitAttempt: (attemptId: string, answers: Record<string, string>) =>
    api.post<ApiResponse<QuizAttempt>>(`/quiz-attempts/${attemptId}/submit`, { answers }),

  getAttempts: (quizId: string) =>
    api.get<ApiResponse<QuizAttempt[]>>(`/quizzes/${quizId}/attempts`),

  getAttempt: (attemptId: string) =>
    api.get<ApiResponse<QuizAttempt>>(`/quiz-attempts/${attemptId}`),
}

// Assignment API
export const assignmentApi = {
  getAssignment: (assignmentId: string) =>
    api.get<ApiResponse<Assignment>>(`/assignments/${assignmentId}`),

  submitAssignment: (assignmentId: string, content: string, attachments?: string[]) =>
    api.post<ApiResponse<AssignmentSubmission>>(`/assignments/${assignmentId}/submit`, {
      content,
      attachments,
    }),

  getSubmission: (submissionId: string) =>
    api.get<ApiResponse<AssignmentSubmission>>(`/assignment-submissions/${submissionId}`),

  gradeSubmission: (submissionId: string, score: number, feedback: string) =>
    api.post<ApiResponse<AssignmentSubmission>>(`/assignment-submissions/${submissionId}/grade`, {
      score,
      feedback,
    }),
}

// Review API
export const reviewApi = {
  createReview: (courseId: string, rating: number, title: string, content: string) =>
    api.post<ApiResponse<Review>>('/reviews', {
      courseId,
      rating,
      title,
      content,
    }),

  getCourseReviews: (courseId: string, page = 1, pageSize = 10) =>
    api.get<ApiResponse<PaginatedResponse<Review>>>(`/courses/${courseId}/reviews`, {
      params: { page, pageSize },
    }),

  deleteReview: (reviewId: string) =>
    api.delete(`/reviews/${reviewId}`),

  updateReview: (reviewId: string, rating: number, title: string, content: string) =>
    api.put<ApiResponse<Review>>(`/reviews/${reviewId}`, {
      rating,
      title,
      content,
    }),
}

// AI API
export const aiApi = {
  chat: (conversationId: string | null, message: string, context?: { courseId?: string; lessonId?: string }, documentId?: string | null) =>
    api.post<ApiResponse<{ conversation: AIConversation; message: AIMessage }>>(
      '/ai/chat',
      {
        conversationId,
        message,
        ...context,
        documentId: documentId || undefined,
      }
    ),

  summarizeLesson: (lessonId: string) =>
    api.post<ApiResponse<{ summary: string }>>(`/ai/summarize/${lessonId}`, {}),

  getRevisionNotes: (lessonId: string) =>
    api.post<ApiResponse<{ notes: string }>>(`/ai/revision-notes/${lessonId}`, {}),

  getConversations: () =>
    api.get<ApiResponse<AIConversation[]>>('/ai/conversations'),

  getConversation: (conversationId: string) =>
    api.get<ApiResponse<AIConversation>>(`/ai/conversations/${conversationId}`),

  deleteConversation: (conversationId: string) =>
    api.delete(`/ai/conversations/${conversationId}`),

  uploadDocument: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<ApiResponse<{ id: string; filename: string; pageCount: number; size: number; extractedText: string; createdAt: string }>>(
      '/ai/documents/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
  },

  getDocuments: () =>
    api.get<ApiResponse<any[]>>('/ai/documents'),

  deleteDocument: (documentId: string) =>
    api.delete(`/ai/documents/${documentId}`),
}

// Notification API
export const notificationApi = {
  getNotifications: (page = 1, pageSize = 20) =>
    api.get<ApiResponse<PaginatedResponse<Notification>>>('/notifications', {
      params: { page, pageSize },
    }),

  markRead: (notificationId: string) =>
    api.put<ApiResponse<Notification>>(`/notifications/${notificationId}/read`, {}),

  markAllRead: () =>
    api.put<ApiResponse<null>>('/notifications/mark-all-read', {}),

  getUnreadCount: () =>
    api.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),

  deleteNotification: (notificationId: string) =>
    api.delete(`/notifications/${notificationId}`),
}

// Certificate API
export const certificateApi = {
  getMyCertificates: () =>
    api.get<ApiResponse<Certificate[]>>('/certificates/me'),

  getCertificate: (certificateId: string) =>
    api.get<ApiResponse<Certificate>>(`/certificates/${certificateId}`),

  verifyCertificate: (certificateCode: string) =>
    api.get<ApiResponse<Certificate & { isValid: boolean }>>(`/certificates/verify/${certificateCode}`),

  downloadCertificate: (certificateId: string) =>
    api.get(`/certificates/${certificateId}/download`, { responseType: 'blob' }),
}

// Media API
export const mediaApi = {
  getUploadUrl: (fileType: string) =>
    api.post<ApiResponse<{ uploadUrl: string; key: string }>>('/media/upload-url', { fileType }),

  getAsset: (key: string) =>
    api.get<ApiResponse<{ url: string }>>(`/media/asset/${key}`),
}

// Admin API
export const adminApi = {
  getUsers: (page = 1, pageSize = 20, role?: string) =>
    api.get<ApiResponse<PaginatedResponse<User>>>('/admin/users', {
      params: { page, pageSize, role },
    }),

  updateUserStatus: (userId: string, status: 'active' | 'suspended' | 'deleted') =>
    api.put<ApiResponse<User>>(`/admin/users/${userId}/status`, { status }),

  getCoursesPending: () =>
    api.get<ApiResponse<Course[]>>('/admin/courses/pending'),

  approveCourse: (courseId: string) =>
    api.post<ApiResponse<Course>>(`/admin/courses/${courseId}/approve`, {}),

  rejectCourse: (courseId: string, reason: string) =>
    api.post<ApiResponse<null>>(`/admin/courses/${courseId}/reject`, { reason }),

  getPlatformAnalytics: () =>
    api.get<ApiResponse<PlatformAnalytics>>('/admin/analytics'),

  getTeachers: (page = 1, pageSize = 20) =>
    api.get<ApiResponse<PaginatedResponse<User>>>('/admin/teachers', {
      params: { page, pageSize },
    }),

  updateTeacherStatus: (userId: string, approved: boolean) =>
    api.put<ApiResponse<User>>(`/admin/teachers/${userId}`, { approved }),
}

// Category API
export const categoryApi = {
  getCategories: () =>
    api.get<ApiResponse<Category[]>>('/categories'),

  createCategory: (name: string, description?: string, icon?: string) =>
    api.post<ApiResponse<Category>>('/categories', { name, description, icon }),

  updateCategory: (categoryId: string, data: Partial<Category>) =>
    api.put<ApiResponse<Category>>(`/categories/${categoryId}`, data),

  deleteCategory: (categoryId: string) =>
    api.delete(`/categories/${categoryId}`),
}

// Teacher API
export const teacherApi = {
  onboard: (data: { bio: string; expertise: string; targetAudience: string }) =>
    api.post<ApiResponse<User>>('/teacher/onboard', data),

  getStudents: (courseId: string) =>
    api.get<ApiResponse<TeacherStudents>>(`/teacher/courses/${courseId}/students`),

  getAssignmentSubmissions: (courseId: string, assignmentId: string) =>
    api.get<ApiResponse<AssignmentSubmission[]>>(
      `/teacher/courses/${courseId}/assignments/${assignmentId}/submissions`
    ),

  gradeSubmission: (submissionId: string, score: number, feedback: string) =>
    api.post<ApiResponse<AssignmentSubmission>>(`/teacher/submissions/${submissionId}/grade`, {
      score,
      feedback,
    }),
}

// Fitness API
export const fitnessApi = {
  // Workout Sessions
  createSession: (data: any, userId: string) =>
    api.post('/fitness/sessions', data, { headers: { 'x-user-id': userId } }),

  bulkCreateSessions: (sessions: any[], userId: string) =>
    api.post('/fitness/sessions/bulk', { sessions }, { headers: { 'x-user-id': userId } }),

  getSessions: (params: any, userId: string) =>
    api.get('/fitness/sessions', { params, headers: { 'x-user-id': userId } }),

  getSession: (id: string, userId: string) =>
    api.get(`/fitness/sessions/${id}`, { headers: { 'x-user-id': userId } }),

  deleteSession: (id: string, userId: string) =>
    api.delete(`/fitness/sessions/${id}`, { headers: { 'x-user-id': userId } }),

  // Daily Metrics
  getDailyMetrics: (date: string, userId: string) =>
    api.get(`/fitness/daily-metrics/${date}`, { headers: { 'x-user-id': userId } }),

  getDailyMetricsRange: (startDate: string, endDate: string, userId: string) =>
    api.get('/fitness/daily-metrics', { params: { startDate, endDate }, headers: { 'x-user-id': userId } }),

  updateDailyMetrics: (data: any, userId: string) =>
    api.put('/fitness/daily-metrics', data, { headers: { 'x-user-id': userId } }),

  // Fitness Profile
  getProfile: (userId: string) =>
    api.get('/fitness/profile', { headers: { 'x-user-id': userId } }),

  saveProfile: (data: any, userId: string) =>
    api.put('/fitness/profile', data, { headers: { 'x-user-id': userId } }),

  // Goals
  getGoals: (userId: string) =>
    api.get('/fitness/goals', { headers: { 'x-user-id': userId } }),

  createGoal: (data: any, userId: string) =>
    api.post('/fitness/goals', data, { headers: { 'x-user-id': userId } }),

  updateGoalProgress: (goalId: string, current: number, userId: string) =>
    api.put(`/fitness/goals/${goalId}/progress`, { current }, { headers: { 'x-user-id': userId } }),

  deleteGoal: (goalId: string, userId: string) =>
    api.delete(`/fitness/goals/${goalId}`, { headers: { 'x-user-id': userId } }),

  // Stats / Insights
  getStats: (userId: string) =>
    api.get('/fitness/stats', { headers: { 'x-user-id': userId } }),
}

// Dietary API
export const dietaryApi = {
  // Meal Logs
  createMealLog: (data: any, userId: string) =>
    api.post('/dietary/meals', data, { headers: { 'x-user-id': userId } }),

  getMealLogs: (params: any, userId: string) =>
    api.get('/dietary/meals', { params, headers: { 'x-user-id': userId } }),

  getMealLog: (id: string, userId: string) =>
    api.get(`/dietary/meals/${id}`, { headers: { 'x-user-id': userId } }),

  updateMealLog: (id: string, data: any, userId: string) =>
    api.put(`/dietary/meals/${id}`, data, { headers: { 'x-user-id': userId } }),

  uploadMealPhoto: (mealId: string, file: File, userId: string) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post(`/dietary/meals/${mealId}/photo`, formData, {
      headers: { 'x-user-id': userId },
    });
  },

  deleteMealLog: (id: string, userId: string) =>
    api.delete(`/dietary/meals/${id}`, { headers: { 'x-user-id': userId } }),

  // Daily Nutrition
  getDailyNutrition: (date: string, userId: string) =>
    api.get(`/dietary/daily-nutrition/${date}`, { headers: { 'x-user-id': userId } }),

  getDailyNutritionRange: (startDate: string, endDate: string, userId: string) =>
    api.get('/dietary/daily-nutrition', { params: { startDate, endDate }, headers: { 'x-user-id': userId } }),

  updateDailyNutrition: (data: any, userId: string) =>
    api.put('/dietary/daily-nutrition', data, { headers: { 'x-user-id': userId } }),

  // Dietary Profile
  getProfile: (userId: string) =>
    api.get('/dietary/profile', { headers: { 'x-user-id': userId } }),

  saveProfile: (data: any, userId: string) =>
    api.put('/dietary/profile', data, { headers: { 'x-user-id': userId } }),

  // Goals
  getGoals: (userId: string) =>
    api.get('/dietary/goals', { headers: { 'x-user-id': userId } }),

  createGoal: (data: any, userId: string) =>
    api.post('/dietary/goals', data, { headers: { 'x-user-id': userId } }),

  updateGoalProgress: (goalId: string, current: number, userId: string) =>
    api.put(`/dietary/goals/${goalId}/progress`, { current }, { headers: { 'x-user-id': userId } }),

  deleteGoal: (goalId: string, userId: string) =>
    api.delete(`/dietary/goals/${goalId}`, { headers: { 'x-user-id': userId } }),

  // Stats / Insights
  getStats: (userId: string) =>
    api.get('/dietary/stats', { headers: { 'x-user-id': userId } }),

  // Supplements
  createSupplement: (data: any, userId: string) =>
    api.post('/dietary/supplements', data, { headers: { 'x-user-id': userId } }),

  getSupplements: (params: any, userId: string) =>
    api.get('/dietary/supplements', { params, headers: { 'x-user-id': userId } }),

  updateSupplement: (id: string, data: any, userId: string) =>
    api.put(`/dietary/supplements/${id}`, data, { headers: { 'x-user-id': userId } }),

  toggleSupplement: (id: string, userId: string) =>
    api.patch(`/dietary/supplements/${id}/toggle`, {}, { headers: { 'x-user-id': userId } }),

  deleteSupplement: (id: string, userId: string) =>
    api.delete(`/dietary/supplements/${id}`, { headers: { 'x-user-id': userId } }),

  // Meal Plans
  saveMealPlan: (data: any, userId: string) =>
    api.post('/dietary/meal-plans', data, { headers: { 'x-user-id': userId } }),

  getMealPlans: (userId: string) =>
    api.get('/dietary/meal-plans', { headers: { 'x-user-id': userId } }),

  getActivePlan: (userId: string) =>
    api.get('/dietary/meal-plans/active', { headers: { 'x-user-id': userId } }),

  getMealPlan: (id: string, userId: string) =>
    api.get(`/dietary/meal-plans/${id}`, { headers: { 'x-user-id': userId } }),

  updateMealPlan: (id: string, data: any, userId: string) =>
    api.put(`/dietary/meal-plans/${id}`, data, { headers: { 'x-user-id': userId } }),

  activatePlan: (id: string, userId: string) =>
    api.patch(`/dietary/meal-plans/${id}/activate`, {}, { headers: { 'x-user-id': userId } }),

  deleteMealPlan: (id: string, userId: string) =>
    api.delete(`/dietary/meal-plans/${id}`, { headers: { 'x-user-id': userId } }),

  // Grocery Lists
  createGroceryList: (data: any, userId: string) =>
    api.post('/dietary/grocery-lists', data, { headers: { 'x-user-id': userId } }),

  getGroceryLists: (userId: string) =>
    api.get('/dietary/grocery-lists', { headers: { 'x-user-id': userId } }),

  getGroceryList: (id: string, userId: string) =>
    api.get(`/dietary/grocery-lists/${id}`, { headers: { 'x-user-id': userId } }),

  updateGroceryList: (id: string, data: any, userId: string) =>
    api.put(`/dietary/grocery-lists/${id}`, data, { headers: { 'x-user-id': userId } }),

  toggleGroceryItem: (listId: string, itemIndex: number, userId: string) =>
    api.patch(`/dietary/grocery-lists/${listId}/items/${itemIndex}/toggle`, {}, { headers: { 'x-user-id': userId } }),

  addGroceryItems: (listId: string, items: any[], userId: string) =>
    api.post(`/dietary/grocery-lists/${listId}/items`, { items }, { headers: { 'x-user-id': userId } }),

  deleteGroceryList: (id: string, userId: string) =>
    api.delete(`/dietary/grocery-lists/${id}`, { headers: { 'x-user-id': userId } }),
}

// Grooming API
export const groomingApi = {
  // Profile
  getProfile: (userId: string) =>
    api.get('/grooming/profile', { headers: { 'x-user-id': userId } }),

  saveProfile: (data: any, userId: string) =>
    api.put('/grooming/profile', data, { headers: { 'x-user-id': userId } }),

  // Recommendations
  saveRecommendation: (data: any, userId: string) =>
    api.post('/grooming/recommendations', data, { headers: { 'x-user-id': userId } }),

  getRecommendations: (params: any, userId: string) =>
    api.get('/grooming/recommendations', { params, headers: { 'x-user-id': userId } }),

  getRecommendation: (id: string, userId: string) =>
    api.get(`/grooming/recommendations/${id}`, { headers: { 'x-user-id': userId } }),

  getLatestByType: (type: string, userId: string) =>
    api.get(`/grooming/recommendations/latest/${type}`, { headers: { 'x-user-id': userId } }),

  toggleSaved: (id: string, userId: string) =>
    api.patch(`/grooming/recommendations/${id}/toggle-save`, {}, { headers: { 'x-user-id': userId } }),

  deleteRecommendation: (id: string, userId: string) =>
    api.delete(`/grooming/recommendations/${id}`, { headers: { 'x-user-id': userId } }),

  // Image upload
  uploadImage: (file: File, userId: string) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/grooming/analyze/upload', formData, {
      headers: { 'x-user-id': userId },
    });
  },

  // Visual Analysis
  saveVisualAnalysis: (data: any, userId: string) =>
    api.post('/grooming/visual-analysis', data, { headers: { 'x-user-id': userId } }),

  getVisualAnalyses: (params: any, userId: string) =>
    api.get('/grooming/visual-analysis', { params, headers: { 'x-user-id': userId } }),

  getVisualAnalysis: (id: string, userId: string) =>
    api.get(`/grooming/visual-analysis/${id}`, { headers: { 'x-user-id': userId } }),

  getProgressTimeline: (type: string, userId: string) =>
    api.get(`/grooming/visual-analysis/progress/${type}`, { headers: { 'x-user-id': userId } }),

  deleteVisualAnalysis: (id: string, userId: string) =>
    api.delete(`/grooming/visual-analysis/${id}`, { headers: { 'x-user-id': userId } }),
}

export default api
