import api from './client'
import type { AIConversation, AIMessage } from '@/types'

export const aiApi = {
  getConversations: () =>
    api.get<AIConversation[]>('/ai/conversations').then((r) => r.data),

  getConversation: (id: string) =>
    api.get<AIConversation>(`/ai/conversations/${id}`).then((r) => r.data),

  createConversation: (courseId?: string, lessonId?: string) =>
    api.post<AIConversation>('/ai/conversations', { courseId, lessonId }).then((r) => r.data),

  sendMessage: (conversationId: string, message: string) =>
    api.post<AIMessage>(`/ai/conversations/${conversationId}/messages`, { content: message }).then((r) => r.data),

  deleteConversation: (id: string) =>
    api.delete(`/ai/conversations/${id}`).then((r) => r.data),

  generateLessonSummary: (lessonId: string) =>
    api.post<{ summary: string }>(`/ai/lessons/${lessonId}/summary`).then((r) => r.data),

  generateStudyPlan: (courseId: string) =>
    api.post<{ plan: string }>(`/ai/courses/${courseId}/study-plan`).then((r) => r.data),

  generateQuizHints: (quizId: string, questionId: string) =>
    api.post<{ hint: string }>(`/ai/quizzes/${quizId}/hints/${questionId}`).then((r) => r.data),
}
