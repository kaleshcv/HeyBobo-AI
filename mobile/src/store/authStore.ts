import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { Storage } from '@/lib/storage'
import type { User, UserRole } from '@/types'

interface AuthState {
  user:            User | null
  accessToken:     string | null
  isAuthenticated: boolean
  isLoading:       boolean
  isHydrated:      boolean

  setAuth:    (user: User, accessToken: string, refreshToken: string) => Promise<void>
  setUser:    (user: User) => void
  logout:     () => Promise<void>
  setLoading: (loading: boolean) => void
  hydrate:    () => Promise<void>
  hasRole:    (role: UserRole | UserRole[]) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user:            null,
  accessToken:     null,
  isAuthenticated: false,
  isLoading:       false,
  isHydrated:      false,

  hydrate: async () => {
    try {
      const [accessToken, userJson] = await Promise.all([
        SecureStore.getItemAsync('access_token'),
        Promise.resolve(Storage.get<User>('auth_user')),
      ])

      if (accessToken && userJson) {
        set({ user: userJson, accessToken, isAuthenticated: true })
      }
    } finally {
      set({ isHydrated: true })
    }
  },

  setAuth: async (user, accessToken, refreshToken) => {
    await Promise.all([
      SecureStore.setItemAsync('access_token', accessToken),
      SecureStore.setItemAsync('refresh_token', refreshToken),
    ])
    Storage.set('auth_user', user)
    set({ user, accessToken, isAuthenticated: true })
  },

  setUser: (user) => {
    Storage.set('auth_user', user)
    set({ user })
  },

  logout: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync('access_token'),
      SecureStore.deleteItemAsync('refresh_token'),
    ])
    Storage.delete('auth_user')
    set({ user: null, accessToken: null, isAuthenticated: false })
  },

  setLoading: (isLoading) => set({ isLoading }),

  hasRole: (role) => {
    const { user } = get()
    if (!user) return false
    if (Array.isArray(role)) return role.includes(user.role as UserRole)
    return user.role === role
  },
}))
