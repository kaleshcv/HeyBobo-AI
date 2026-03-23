import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import * as SecureStore from 'expo-secure-store'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'

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

  // ── Response: auto-refresh on 401 ───────────────────
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      if (error.response?.status === 401 && !originalRequest._retry) {
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

          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          })

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
