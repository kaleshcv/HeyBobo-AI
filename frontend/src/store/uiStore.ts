import { create } from 'zustand'

interface UIState {
  isSidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  isMobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  isChatEnabled: boolean
  toggleChat: () => void
  language: 'en' | 'ar'
  setLanguage: (lang: 'en' | 'ar') => void
  toggleLanguage: () => void
  isRTL: boolean
}

export const useUIStore = create<UIState>((set) => {
  const savedTheme    = localStorage.getItem('ui_theme')    as 'light' | 'dark' | null
  const savedChat     = localStorage.getItem('ui_chat_enabled')
  const savedLang     = localStorage.getItem('ui_language') as 'en' | 'ar' | null

  const initialLang = savedLang || 'en'

  return {
    isSidebarOpen: true,
    toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
    setSidebarOpen: (open) => set({ isSidebarOpen: open }),

    isMobileMenuOpen: false,
    setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),

    theme: savedTheme || 'light',
    setTheme: (theme) => {
      localStorage.setItem('ui_theme', theme)
      set({ theme })
    },
    toggleTheme: () => {
      set((s) => {
        const next = s.theme === 'light' ? 'dark' : 'light'
        localStorage.setItem('ui_theme', next)
        return { theme: next }
      })
    },

    isChatEnabled: savedChat === 'true',
    toggleChat: () => {
      set((s) => {
        const next = !s.isChatEnabled
        localStorage.setItem('ui_chat_enabled', String(next))
        return { isChatEnabled: next }
      })
    },

    language: initialLang,
    isRTL: initialLang === 'ar',
    setLanguage: (lang) => {
      localStorage.setItem('ui_language', lang)
      set({ language: lang, isRTL: lang === 'ar' })
    },
    toggleLanguage: () => {
      set((s) => {
        const next = s.language === 'en' ? 'ar' : 'en'
        localStorage.setItem('ui_language', next)
        return { language: next, isRTL: next === 'ar' }
      })
    },
  }
})
