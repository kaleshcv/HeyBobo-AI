import api from './client'
import type { User, Course, Category, Certificate, PaginatedResponse, PlatformAnalytics } from '@/types'

export const adminApi = {
  // Users
  getUsers: (params?: { page?: number; limit?: number; role?: string; search?: string }) =>
    api.get<PaginatedResponse<User>>('/admin/users', { params }).then((r) => r.data),

  updateUserRole: (userId: string, role: string) =>
    api.patch(`/admin/users/${userId}/role`, { role }).then((r) => r.data),

  toggleUserStatus: (userId: string) =>
    api.patch(`/admin/users/${userId}/toggle-status`).then((r) => r.data),

  deleteUser: (userId: string) =>
    api.delete(`/admin/users/${userId}`).then((r) => r.data),

  // Teachers
  getPendingTeachers: () =>
    api.get<User[]>('/admin/teachers/pending').then((r) => r.data),

  approveTeacher: (userId: string) =>
    api.post(`/admin/teachers/${userId}/approve`).then((r) => r.data),

  rejectTeacher: (userId: string) =>
    api.post(`/admin/teachers/${userId}/reject`).then((r) => r.data),

  // Courses
  getAllCourses: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<PaginatedResponse<Course>>('/admin/courses', { params }).then((r) => r.data),

  toggleCourseStatus: (courseId: string) =>
    api.patch(`/admin/courses/${courseId}/toggle-status`).then((r) => r.data),

  // Categories
  getCategories: () =>
    api.get<Category[]>('/admin/categories').then((r) => r.data),

  createCategory: (data: Partial<Category>) =>
    api.post<Category>('/admin/categories', data).then((r) => r.data),

  updateCategory: (id: string, data: Partial<Category>) =>
    api.patch<Category>(`/admin/categories/${id}`, data).then((r) => r.data),

  deleteCategory: (id: string) =>
    api.delete(`/admin/categories/${id}`).then((r) => r.data),

  // Analytics
  getPlatformAnalytics: () =>
    api.get<PlatformAnalytics>('/admin/analytics').then((r) => r.data),

  // Certificates
  getCertificates: (params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Certificate>>('/admin/certificates', { params }).then((r) => r.data),
}
