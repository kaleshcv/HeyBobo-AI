import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api'
import { queryKeys } from '@/lib/queryClient'
import type { LoginDto, RegisterDto } from '@/types'

WebBrowser.maybeCompleteAuthSession()

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: (dto: LoginDto) => authApi.login(dto),
    onSuccess: (data) => setAuth(data.user, data.accessToken, data.refreshToken),
  })
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: (dto: RegisterDto) => authApi.register(dto),
    onSuccess: (data) => setAuth(data.user, data.accessToken, data.refreshToken),
  })
}

export function useLogout() {
  const qc = useQueryClient()
  const logout = useAuthStore((s) => s.logout)
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: async () => {
      await logout()
      qc.clear()
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authApi.resetPassword(token, password),
  })
}

export function useProfile() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn:  authApi.getProfile,
    enabled:  isAuthenticated,
    staleTime: 1000 * 60 * 10,
  })
}

export function useGoogleOAuth() {
  const setAuth = useAuthStore((s) => s.setAuth)

  const startOAuth = async () => {
    const redirectUri = Linking.createURL('auth/callback')
    const oauthUrl = `${process.env.EXPO_PUBLIC_API_URL}/auth/google?redirectUri=${encodeURIComponent(redirectUri)}`

    const result = await WebBrowser.openAuthSessionAsync(oauthUrl, redirectUri)
    if (result.type !== 'success') return

    const url = new URL(result.url)
    const accessToken  = url.searchParams.get('access_token')
    const refreshToken = url.searchParams.get('refresh_token')

    if (accessToken && refreshToken) {
      const user = await authApi.getProfile()
      await setAuth(user, accessToken, refreshToken)
    }
  }

  return { startOAuth }
}
