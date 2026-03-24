import { create } from 'zustand'
import { User, UserRole } from '@/types/index'

interface StoredUser extends User {
  password: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setAuth: (user: User, token: string) => void
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  hasRole: (role: UserRole | UserRole[]) => boolean
  registerLocal: (email: string, password: string, firstName: string, lastName: string, role: UserRole) => { success: boolean; error?: string }
  loginLocal: (email: string, password: string) => { success: boolean; error?: string }
}

function getStoredUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem('heybobo_users') || '[]')
  } catch { return [] }
}

function saveStoredUsers(users: StoredUser[]) {
  localStorage.setItem('heybobo_users', JSON.stringify(users))
}

// Seed a test user on first load
;(() => {
  const users = getStoredUsers()
  if (!users.some((u) => u.email === 'test@heybobo.ai')) {
    const now = new Date().toISOString()
    saveStoredUsers([...users, {
      id: 'user-test-1',
      email: 'test@heybobo.ai',
      password: 'test123',
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.STUDENT,
      createdAt: now,
      updatedAt: now,
    }])
  }
})()

export const useAuthStore = create<AuthState>((set, get) => {
  const savedUser = localStorage.getItem('auth_user')
  const initialUser = savedUser ? JSON.parse(savedUser) : null

  return {
    user: initialUser,
    accessToken: null,
    isAuthenticated: !!initialUser,
    isLoading: false,

    setAuth: (user: User, token: string) => {
      localStorage.setItem('auth_user', JSON.stringify(user))
      set({ user, accessToken: token, isAuthenticated: true })
    },

    setUser: (user: User) => {
      localStorage.setItem('auth_user', JSON.stringify(user))
      set({ user })
    },

    setToken: (token: string) => {
      set({ accessToken: token })
    },

    logout: () => {
      localStorage.removeItem('auth_user')
      set({ user: null, accessToken: null, isAuthenticated: false })
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

    registerLocal: (email, password, firstName, lastName, role) => {
      const users = getStoredUsers()
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: 'An account with this email already exists' }
      }
      const now = new Date().toISOString()
      const newUser: StoredUser = {
        id: `user-${Date.now()}`,
        email: email.toLowerCase(),
        password,
        firstName,
        lastName,
        role,
        createdAt: now,
        updatedAt: now,
      }
      saveStoredUsers([...users, newUser])
      const { password: _, ...safeUser } = newUser
      localStorage.setItem('auth_user', JSON.stringify(safeUser))
      set({ user: safeUser, accessToken: `local-${Date.now()}`, isAuthenticated: true })
      return { success: true }
    },

    loginLocal: (email, password) => {
      const users = getStoredUsers()
      const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
      if (!found) {
        return { success: false, error: 'No account found with this email' }
      }
      if (found.password !== password) {
        return { success: false, error: 'Incorrect password' }
      }
      const { password: _, ...safeUser } = found
      localStorage.setItem('auth_user', JSON.stringify(safeUser))
      set({ user: safeUser, accessToken: `local-${Date.now()}`, isAuthenticated: true })
      return { success: true }
    },
  }
})
