import api from './client'
import type {
  Course, CourseSection, Lesson, LessonProgress, Enrollment,
  Quiz, QuizAttempt, Assignment, AssignmentSubmission,
  Certificate, Review, Category, PaginatedResponse, CourseFilter,
  LearningStats, EnrollmentStats,
} from '@/types'

export const educationApi = {
  // ── Courses ────────────────────────────────────────
  getCourses: (filter?: CourseFilter) =>
    api.get<PaginatedResponse<Course>>('/education/courses', { params: filter }).then((r) => r.data),

  getCourse: (courseId: string) =>
    api.get<Course>(`/education/courses/${courseId}`).then((r) => r.data),

  getCourseContent: (courseId: string) =>
    api.get<CourseSection[]>(`/education/courses/${courseId}/content`).then((r) => r.data),

  getFeaturedCourses: () =>
    api.get<Course[]>('/education/courses/featured').then((r) => r.data),

  searchCourses: (query: string, filter?: CourseFilter) =>
    api.get<PaginatedResponse<Course>>('/education/courses/search', {
      params: { q: query, ...filter },
    }).then((r) => r.data),

  // ── Enrollments ────────────────────────────────────
  getEnrollments: () =>
    api.get<Enrollment[]>('/education/enrollments').then((r) => r.data),

  getEnrollment: (courseId: string) =>
    api.get<Enrollment>(`/education/enrollments/${courseId}`).then((r) => r.data),

  enroll: (courseId: string) =>
    api.post<Enrollment>(`/education/courses/${courseId}/enroll`).then((r) => r.data),

  getEnrollmentStats: () =>
    api.get<EnrollmentStats>('/education/enrollments/stats').then((r) => r.data),

  // ── Lessons & Progress ─────────────────────────────
  getLesson: (lessonId: string) =>
    api.get<Lesson>(`/education/lessons/${lessonId}`).then((r) => r.data),

  updateLessonProgress: (lessonId: string, watchedSeconds: number, totalSeconds: number) =>
    api.patch<LessonProgress>(`/education/lessons/${lessonId}/progress`, {
      watchedSeconds, totalSeconds,
    }).then((r) => r.data),

  completeLesson: (lessonId: string) =>
    api.post<LessonProgress>(`/education/lessons/${lessonId}/complete`).then((r) => r.data),

  toggleBookmark: (lessonId: string) =>
    api.post(`/education/lessons/${lessonId}/bookmark`).then((r) => r.data),

  // ── Quiz ────────────────────────────────────────────
  getQuiz: (quizId: string) =>
    api.get<Quiz>(`/education/quizzes/${quizId}`).then((r) => r.data),

  submitQuiz: (quizId: string, answers: Record<string, string | string[]>) =>
    api.post<QuizAttempt>(`/education/quizzes/${quizId}/submit`, { answers }).then((r) => r.data),

  getQuizAttempts: (quizId: string) =>
    api.get<QuizAttempt[]>(`/education/quizzes/${quizId}/attempts`).then((r) => r.data),

  // ── Assignments ────────────────────────────────────
  getAssignment: (assignmentId: string) =>
    api.get<Assignment>(`/education/assignments/${assignmentId}`).then((r) => r.data),

  submitAssignment: (assignmentId: string, formData: FormData) =>
    api.post<AssignmentSubmission>(`/education/assignments/${assignmentId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  // ── Certificates ───────────────────────────────────
  getCertificates: () =>
    api.get<Certificate[]>('/education/certificates').then((r) => r.data),

  getCertificate: (certificateId: string) =>
    api.get<Certificate>(`/education/certificates/${certificateId}`).then((r) => r.data),

  // ── Reviews ────────────────────────────────────────
  getCourseReviews: (courseId: string) =>
    api.get<Review[]>(`/education/courses/${courseId}/reviews`).then((r) => r.data),

  addReview: (courseId: string, rating: number, comment?: string) =>
    api.post<Review>(`/education/courses/${courseId}/reviews`, { rating, comment }).then((r) => r.data),

  // ── Categories ─────────────────────────────────────
  getCategories: () =>
    api.get<Category[]>('/education/categories').then((r) => r.data),

  // ── Learning Stats ─────────────────────────────────
  getLearningStats: () =>
    api.get<LearningStats>('/education/stats').then((r) => r.data),

  // ── Teacher endpoints ──────────────────────────────
  createCourse: (data: Partial<Course>) =>
    api.post<Course>('/education/courses', data).then((r) => r.data),

  updateCourse: (courseId: string, data: Partial<Course>) =>
    api.patch<Course>(`/education/courses/${courseId}`, data).then((r) => r.data),

  publishCourse: (courseId: string) =>
    api.post(`/education/courses/${courseId}/publish`).then((r) => r.data),

  uploadThumbnail: (courseId: string, formData: FormData) =>
    api.post(`/education/courses/${courseId}/thumbnail`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  createSection: (courseId: string, data: { title: string; description?: string }) =>
    api.post<CourseSection>(`/education/courses/${courseId}/sections`, data).then((r) => r.data),

  updateSection: (sectionId: string, data: Partial<CourseSection>) =>
    api.patch<CourseSection>(`/education/sections/${sectionId}`, data).then((r) => r.data),

  deleteSection: (sectionId: string) =>
    api.delete(`/education/sections/${sectionId}`).then((r) => r.data),

  createLesson: (sectionId: string, data: Partial<Lesson>) =>
    api.post<Lesson>(`/education/sections/${sectionId}/lessons`, data).then((r) => r.data),

  updateLesson: (lessonId: string, data: Partial<Lesson>) =>
    api.patch<Lesson>(`/education/lessons/${lessonId}`, data).then((r) => r.data),

  deleteLesson: (lessonId: string) =>
    api.delete(`/education/lessons/${lessonId}`).then((r) => r.data),
}
