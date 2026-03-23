import api from './client'
import type { WorkoutPlan, WorkoutSession, Exercise, ActivityLog, FitnessProfile } from '@/types'

export const fitnessApi = {
  getProfile: () =>
    api.get<FitnessProfile>('/fitness/profile').then((r) => r.data),

  updateProfile: (data: Partial<FitnessProfile>) =>
    api.patch<FitnessProfile>('/fitness/profile', data).then((r) => r.data),

  getWorkoutPlans: () =>
    api.get<WorkoutPlan[]>('/fitness/plans').then((r) => r.data),

  getWorkoutPlan: (id: string) =>
    api.get<WorkoutPlan>(`/fitness/plans/${id}`).then((r) => r.data),

  generateWorkoutPlan: () =>
    api.post<WorkoutPlan>('/fitness/plans/generate').then((r) => r.data),

  getExercises: (params?: { category?: string; muscle?: string; difficulty?: string }) =>
    api.get<Exercise[]>('/fitness/exercises', { params }).then((r) => r.data),

  logSession: (session: Partial<WorkoutSession>) =>
    api.post<WorkoutSession>('/fitness/sessions', session).then((r) => r.data),

  getSessions: (params?: { limit?: number; offset?: number }) =>
    api.get<WorkoutSession[]>('/fitness/sessions', { params }).then((r) => r.data),

  getActivityLogs: (params?: { startDate?: string; endDate?: string }) =>
    api.get<ActivityLog[]>('/fitness/activity', { params }).then((r) => r.data),

  logActivity: (data: Partial<ActivityLog>) =>
    api.post<ActivityLog>('/fitness/activity', data).then((r) => r.data),

  getTodayActivity: () =>
    api.get<ActivityLog>('/fitness/activity/today').then((r) => r.data),
}
