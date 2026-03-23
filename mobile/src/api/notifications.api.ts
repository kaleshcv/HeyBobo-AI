import api from './client'
import type { Notification } from '@/types'

export const notificationsApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get<{ notifications: Notification[]; unreadCount: number }>('/notifications', { params }).then((r) => r.data),

  markRead: (id: string) =>
    api.patch(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () =>
    api.patch('/notifications/read-all').then((r) => r.data),

  deleteNotification: (id: string) =>
    api.delete(`/notifications/${id}`).then((r) => r.data),

  getPreferences: () =>
    api.get('/notifications/preferences').then((r) => r.data),

  updatePreferences: (prefs: Record<string, boolean>) =>
    api.patch('/notifications/preferences', prefs).then((r) => r.data),
}
