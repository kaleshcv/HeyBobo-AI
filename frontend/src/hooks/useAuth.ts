import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/lib/api'
import toast from 'react-hot-toast'

// Map backend technical errors to human-readable messages
const ERROR_MAP: Record<string, string> = {
  'Email already registered': 'An account with this email address already exists. Try signing in instead.',
  'Username already taken': 'That username is already taken. Please choose a different one.',
  'Invalid credentials': 'Incorrect email/username or password. Please try again.',
  'User account is suspended': 'Your account has been suspended. Please contact support.',
  'User account is pending': 'Your account is pending verification. Please check your email.',
  'Invalid or expired refresh token': 'Your session has expired. Please sign in again.',
  'Too many authentication attempts, please try again later.': 'Too many sign-in attempts. Please wait 15 minutes and try again.',
}

function extractApiError(err: any, fallback: string): string {
  // Network error (no response from server)
  if (!err.response) {
    return 'Unable to connect to the server. Please check your internet connection.'
  }

  const data = err.response?.data
  if (!data) return fallback

  // NestJS ValidationPipe returns message as an array
  if (Array.isArray(data.message)) {
    const first = data.message[0]
    return ERROR_MAP[first] || formatValidationMessage(first)
  }

  if (typeof data.message === 'string' && data.message) {
    return ERROR_MAP[data.message] || data.message
  }

  return fallback
}

function formatValidationMessage(msg: string): string {
  // Convert class-validator messages to readable form
  return msg.charAt(0).toUpperCase() + msg.slice(1)
}

export const useAuth = () => {
  const navigate = useNavigate()
  const {
    user,
    isAuthenticated,
    isLoading,
    setAuth,
    logout: logoutStore,
    hasRole,
    refreshToken,
  } = useAuthStore()

  const [loginLoading, setLoginLoading] = useState(false)
  const [registerLoading, setRegisterLoading] = useState(false)

  const login = useCallback(
    async (identifier: string, password: string) => {
      setLoginLoading(true)
      try {
        const res = await authApi.login(identifier, password)
        // TransformInterceptor wraps response: { success, data: { accessToken, refreshToken, user }, message }
        const inner = (res.data as any)?.data ?? res.data
        const u = inner.user as any
        setAuth(
          {
            id: u.id,
            email: u.email,
            username: u.username || '',
            firstName: u.firstName || u.name?.split(' ')[0] || '',
            lastName: u.lastName || u.name?.split(' ').slice(1).join(' ') || '',
            role: u.role as any,
            createdAt: u.createdAt || '',
            updatedAt: u.updatedAt || '',
          },
          inner.accessToken,
          inner.refreshToken,
        )
        toast.success('Welcome back!')
        navigate('/app')
        return { success: true }
      } catch (err: any) {
        const msg = extractApiError(err, 'Incorrect email/username or password')
        toast.error(msg)
        return { success: false, error: msg }
      } finally {
        setLoginLoading(false)
      }
    },
    [setAuth, navigate]
  )

  const register = useCallback(
    async (data: {
      email: string
      password: string
      firstName: string
      lastName: string
      username: string
      role: string
    }) => {
      setRegisterLoading(true)
      try {
        const res = await authApi.register(data)
        // TransformInterceptor wraps response: { success, data: { accessToken, refreshToken, user }, message }
        const inner = (res.data as any)?.data ?? res.data
        const u = inner.user as any
        setAuth(
          {
            id: u.id,
            email: u.email,
            username: u.username || data.username,
            firstName: u.firstName || data.firstName,
            lastName: u.lastName || data.lastName,
            role: u.role as any,
            createdAt: u.createdAt || '',
            updatedAt: u.updatedAt || '',
          },
          inner.accessToken,
          inner.refreshToken,
        )
        toast.success('Account created! Welcome to HeyBobo.')
        navigate('/app')
        return { success: true }
      } catch (err: any) {
        const msg = extractApiError(err, 'Registration failed. Please try again.')
        toast.error(msg, { duration: 5000 })
        return { success: false, error: msg }
      } finally {
        setRegisterLoading(false)
      }
    },
    [setAuth, navigate]
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout(refreshToken || undefined)
    } catch {
      // Logout even if API call fails
    }
    // Clear auth tokens from store
    logoutStore()
    toast.success('Logged out successfully')
    // Full page reload clears all in-memory Zustand state
    window.location.href = '/auth/login'
  }, [logoutStore, refreshToken])

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    hasRole,
    loginLoading,
    registerLoading,
    logoutLoading: false,
    forgotPassword: (_email?: string) => {},
    resetPassword: (_token?: string, _password?: string) => {},
    googleAuth: (_token?: string) => {},
  }
}
