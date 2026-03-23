import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { asyncStorage } from '@/lib/storage'
import type { AIConversation, AIMessage } from '@/types'

interface AiTutorState {
  conversations:       AIConversation[]
  activeConversation:  AIConversation | null
  isStreaming:         boolean
  streamingText:       string

  setConversations:    (list: AIConversation[]) => void
  setActive:           (conv: AIConversation | null) => void
  addMessage:          (msg: AIMessage) => void
  appendStreamChunk:   (chunk: string) => void
  finaliseStream:      (fullText: string) => void
  setStreaming:        (v: boolean) => void
  clearActive:         () => void
}

export const useAiTutorStore = create<AiTutorState>()(
  persist(
    (set, get) => ({
      conversations:      [],
      activeConversation: null,
      isStreaming:        false,
      streamingText:      '',

      setConversations: (conversations) => set({ conversations }),

      setActive: (activeConversation) => set({ activeConversation }),

      addMessage: (msg) => {
        const { activeConversation } = get()
        if (!activeConversation) return
        set({
          activeConversation: {
            ...activeConversation,
            messages: [...activeConversation.messages, msg],
          },
        })
      },

      appendStreamChunk: (chunk) =>
        set((s) => ({ streamingText: s.streamingText + chunk })),

      finaliseStream: (fullText) => {
        const { activeConversation } = get()
        if (!activeConversation) return
        const assistantMsg: AIMessage = {
          id: Date.now().toString(),
          conversationId: activeConversation.id,
          role: 'assistant',
          content: fullText,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({
          isStreaming:   false,
          streamingText: '',
          activeConversation: s.activeConversation
            ? { ...s.activeConversation, messages: [...s.activeConversation.messages, assistantMsg] }
            : null,
        }))
      },

      setStreaming: (isStreaming) => set({ isStreaming, streamingText: isStreaming ? '' : get().streamingText }),

      clearActive: () => set({ activeConversation: null, isStreaming: false, streamingText: '' }),
    }),
    {
      name:    'ai-tutor',
      storage: createJSONStorage(() => asyncStorage),
      partialize: (s) => ({ conversations: s.conversations }),
    },
  ),
)
