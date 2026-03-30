import { create } from 'zustand'
import { User, UserRole } from '@/types/index'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  hasRole: (role: UserRole | UserRole[]) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => {
  const savedUser = localStorage.getItem('auth_user')
  const savedToken = localStorage.getItem('auth_access_token')
  const savedRefreshToken = localStorage.getItem('auth_refresh_token')
  const initialUser = savedUser ? JSON.parse(savedUser) : null

  return {
    user: initialUser,
    accessToken: savedToken || null,
    refreshToken: savedRefreshToken || null,
    isAuthenticated: !!initialUser && !!savedToken,
    isLoading: false,

    setAuth: (user: User, accessToken: string, refreshToken: string) => {
      localStorage.setItem('auth_user', JSON.stringify(user))
      localStorage.setItem('auth_access_token', accessToken)
      localStorage.setItem('auth_refresh_token', refreshToken)
      set({ user, accessToken, refreshToken, isAuthenticated: true })
    },

    setUser: (user: User) => {
      localStorage.setItem('auth_user', JSON.stringify(user))
      set({ user })
    },

    setToken: (token: string) => {
      localStorage.setItem('auth_access_token', token)
      set({ accessToken: token })
    },

    logout: () => {
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_access_token')
      localStorage.removeItem('auth_refresh_token')
      set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
    },

    setLoading: (loading: boolean) => {
      set({ isLoading: loading })
    },

    hasRole: (roles: UserRole | UserRole[]) => {
      const { user } = get()
      if (!user) return false
      const roleArray = Array.isArray(roles) ? roles : [roles]
      return roleArray.includes(user.role)
    },
  }
})
