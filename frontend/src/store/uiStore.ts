import { create } from 'zustand'

interface UIState {
  isSidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  isMobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
}

export const useUIStore = create<UIState>((set) => {
  const savedTheme = localStorage.getItem('ui_theme') as 'light' | 'dark' | null

  return {
    isSidebarOpen: true,
    toggleSidebar: () => {
      set((state) => ({ isSidebarOpen: !state.isSidebarOpen }))
    },
    setSidebarOpen: (open: boolean) => {
      set({ isSidebarOpen: open })
    },

    isMobileMenuOpen: false,
    setMobileMenuOpen: (open: boolean) => {
      set({ isMobileMenuOpen: open })
    },

    theme: savedTheme || 'light',
    setTheme: (theme: 'light' | 'dark') => {
      localStorage.setItem('ui_theme', theme)
      set({ theme })
    },
  }
})
