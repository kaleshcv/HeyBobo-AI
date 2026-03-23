import api from './client'
import type { GroomingProfile, GroomingRecommendation, VisualAnalysisResult } from '@/types'

export const groomingApi = {
  getProfile: () =>
    api.get<GroomingProfile>('/grooming/profile').then((r) => r.data),

  updateProfile: (data: Partial<GroomingProfile>) =>
    api.patch<GroomingProfile>('/grooming/profile', data).then((r) => r.data),

  getRecommendations: () =>
    api.get<GroomingRecommendation[]>('/grooming/recommendations').then((r) => r.data),

  submitVisualAnalysis: (formData: FormData) =>
    api.post<VisualAnalysisResult>('/grooming/visual-analysis', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  getAnalysisHistory: () =>
    api.get<VisualAnalysisResult[]>('/grooming/analysis-history').then((r) => r.data),
}
