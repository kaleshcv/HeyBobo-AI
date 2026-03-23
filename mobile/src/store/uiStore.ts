import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { asyncStorage } from '@/lib/storage'

interface UIState {
  theme:        'light' | 'dark' | 'system'
  unreadCount:  number

  setTheme:      (t: UIState['theme']) => void
  setUnread:     (n: number) => void
  incrementUnread: () => void
  clearUnread:   () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme:       'system',
      unreadCount: 0,

      setTheme:        (theme) => set({ theme }),
      setUnread:       (unreadCount) => set({ unreadCount }),
      incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
      clearUnread:     () => set({ unreadCount: 0 }),
    }),
    { name: 'ui-prefs', storage: createJSONStorage(() => asyncStorage) },
  ),
)
