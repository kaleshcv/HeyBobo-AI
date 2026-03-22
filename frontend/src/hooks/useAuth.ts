import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export const useAuth = () => {
  const navigate = useNavigate()
  const {
    user,
    isAuthenticated,
    isLoading,
    loginLocal,
    registerLocal,
    logout: logoutStore,
    hasRole,
  } = useAuthStore()

  const login = useCallback(
    (email: string, password: string) => {
      const result = loginLocal(email, password)
      if (result.success) {
        toast.success('Welcome back!')
        navigate('/app')
      } else {
        toast.error(result.error || 'Login failed')
      }
      return result
    },
    [loginLocal, navigate]
  )

  const register = useCallback(
    (email: string, password: string, firstName: string, lastName: string, role: string) => {
      const result = registerLocal(email, password, firstName, lastName, role as any)
      if (result.success) {
        toast.success('Account created successfully!')
        navigate('/app')
      } else {
        toast.error(result.error || 'Registration failed')
      }
      return result
    },
    [registerLocal, navigate]
  )

  const logout = useCallback(() => {
    logoutStore()
    toast.success('Logged out successfully')
    navigate('/auth/login')
  }, [logoutStore, navigate])

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    hasRole,
    loginLoading: false,
    registerLoading: false,
    logoutLoading: false,
    forgotPassword: (_email?: string) => {},
    resetPassword: (_token?: string, _password?: string) => {},
    googleAuth: (_token?: string) => {},
  }
}
