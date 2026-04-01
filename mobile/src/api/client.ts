import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import Constants from 'expo-constants'

function resolveApiUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL
  // In production or if env points to a real domain, use it as-is
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('10.0.2.2')) {
    return envUrl
  }
  // In dev on Android, get the dev machine IP from Expo's debugger host
  if (__DEV__ && Platform.OS === 'android') {
    const debuggerHost =
      Constants.expoConfig?.hostUri ??
      (Constants as any).manifest?.debuggerHost
    if (debuggerHost) {
      const host = debuggerHost.split(':')[0]
      return `http://${host}:3001/api/v1`
    }
  }
  return envUrl ?? 'http://localhost:3001/api/v1'
}

const API_URL = resolveApiUrl()
if (__DEV__) console.log('[API] Using base URL:', API_URL)

let isRefreshing = false
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = []

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
  isRefreshing = false
  failedQueue = []
}

const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  })

  // ── Request: attach JWT ──────────────────────────────
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await SecureStore.getItemAsync('access_token')
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    },
    (error) => Promise.reject(error),
  )

  // ── Response: unwrap backend { success, data, message } envelope ──
  instance.interceptors.response.use(
    (response) => {
      // Backend wraps all responses in { success, data, message }
      if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
        response.data = response.data.data
      }
      return response
    },
    async (error) => {
      const originalRequest = error.config

      // Skip token refresh for auth endpoints (login, register, etc.)
      const isAuthEndpoint = originalRequest?.url?.includes('/auth/')
      if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          }).then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return instance(originalRequest)
          })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const refreshToken = await SecureStore.getItemAsync('refresh_token')
          if (!refreshToken) throw new Error('No refresh token')

          const resp = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          })
          // Unwrap backend envelope if present
          const data = resp.data?.data ?? resp.data

          await SecureStore.setItemAsync('access_token', data.accessToken)
          if (data.refreshToken) {
            await SecureStore.setItemAsync('refresh_token', data.refreshToken)
          }

          processQueue(null, data.accessToken)
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
          return instance(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError as Error, null)
          await SecureStore.deleteItemAsync('access_token')
          await SecureStore.deleteItemAsync('refresh_token')
          // Emit logout event for the auth store to pick up
          authEventEmitter.emit('logout')
          return Promise.reject(refreshError)
        }
      }

      return Promise.reject(error)
    },
  )

  return instance
}

// Simple event emitter for cross-module logout signaling
class AuthEventEmitter {
  private listeners: Record<string, (() => void)[]> = {}
  emit(event: string) { this.listeners[event]?.forEach((fn) => fn()) }
  on(event: string, fn: () => void) {
    this.listeners[event] = [...(this.listeners[event] ?? []), fn]
  }
  off(event: string, fn: () => void) {
    this.listeners[event] = (this.listeners[event] ?? []).filter((l) => l !== fn)
  }
}

export const authEventEmitter = new AuthEventEmitter()
export const apiClient = createApiClient()
export default apiClient
