import api from './client'
import type { AuthResponse, LoginDto, RegisterDto, User } from '@/types'

export const authApi = {
  login: (dto: LoginDto) =>
    api.post<AuthResponse>('/auth/login', dto).then((r) => r.data),

  register: (dto: RegisterDto) =>
    api.post<AuthResponse>('/auth/register', dto).then((r) => r.data),

  logout: () =>
    api.post('/auth/logout').then((r) => r.data),

  refresh: (refreshToken: string) =>
    api.post<AuthResponse>('/auth/refresh', { refreshToken }).then((r) => r.data),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }).then((r) => r.data),

  getProfile: () =>
    api.get<User>('/auth/me').then((r) => r.data),

  updatePushToken: (expoPushToken: string) =>
    api.patch('/users/push-token', { expoPushToken }).then((r) => r.data),

  googleOAuthUrl: () =>
    `${process.env.EXPO_PUBLIC_API_URL}/auth/google`,
}
