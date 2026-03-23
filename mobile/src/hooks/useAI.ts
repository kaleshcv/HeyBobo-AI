import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aiApi } from '@/api'
import { queryKeys } from '@/lib/queryClient'
import { useAiTutorStore } from '@/store/aiTutorStore'
import { streamTutorMessage } from '@/lib/gemini'

export function useConversations() {
  const setConversations = useAiTutorStore((s) => s.setConversations)
  return useQuery({
    queryKey: queryKeys.ai.conversations,
    queryFn:  async () => {
      const list = await aiApi.getConversations()
      setConversations(list)
      return list
    },
  })
}

export function useConversation(id: string) {
  const setActive = useAiTutorStore((s) => s.setActive)
  return useQuery({
    queryKey: queryKeys.ai.detail(id),
    queryFn:  async () => {
      const conv = await aiApi.getConversation(id)
      setActive(conv)
      return conv
    },
    enabled: !!id,
  })
}

export function useCreateConversation() {
  const qc = useQueryClient()
  const setActive = useAiTutorStore((s) => s.setActive)
  return useMutation({
    mutationFn: ({ courseId, lessonId }: { courseId?: string; lessonId?: string }) =>
      aiApi.createConversation(courseId, lessonId),
    onSuccess: (conv) => {
      setActive(conv)
      qc.invalidateQueries({ queryKey: queryKeys.ai.conversations })
    },
  })
}

// Streams via Gemini client-side; falls back to backend for server-side history
export function useStreamMessage() {
  const { addMessage, setStreaming, finaliseStream, activeConversation } = useAiTutorStore()

  return useMutation({
    mutationFn: async (userMessage: string) => {
      if (!activeConversation) throw new Error('No active conversation')

      // Add user message immediately
      const userMsg = {
        id:             Date.now().toString(),
        conversationId: activeConversation.id,
        role:           'user' as const,
        content:        userMessage,
        createdAt:      new Date().toISOString(),
      }
      addMessage(userMsg)
      setStreaming(true)

      // Build history for Gemini
      const history = activeConversation.messages.map((m) => ({
        role:  m.role === 'user' ? 'user' : ('model' as 'user' | 'model'),
        parts: m.content,
      }))

      const fullText = await streamTutorMessage(history, userMessage, (chunk) => {
        useAiTutorStore.getState().appendStreamChunk(chunk)
      })

      finaliseStream(fullText)
      return fullText
    },
  })
}
