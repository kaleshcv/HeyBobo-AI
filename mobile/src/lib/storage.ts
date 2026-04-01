/**
 * Storage layer — uses AsyncStorage for persistent data across app restarts.
 * Auth tokens are handled separately via expo-secure-store in the auth store.
 */

import AsyncStorage from '@react-native-async-storage/async-storage'

export const Storage = {
  get: async <T>(key: string): Promise<T | null> => {
    const raw = await AsyncStorage.getItem(key)
    if (!raw) return null
    try { return JSON.parse(raw) as T } catch { return null }
  },
  set: async (key: string, value: unknown): Promise<void> => {
    await AsyncStorage.setItem(key, JSON.stringify(value))
  },
  delete: async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(key)
  },
  clearAll: async (): Promise<void> => {
    await AsyncStorage.clear()
  },
}

// Async wrapper — used by React Query persister & Zustand persist middleware
export const asyncStorage = {
  getItem:    (key: string): Promise<string | null> =>
    AsyncStorage.getItem(key),
  setItem:    (key: string, value: string): Promise<void> =>
    AsyncStorage.setItem(key, value),
  removeItem: (key: string): Promise<void> =>
    AsyncStorage.removeItem(key),
}
