import { MMKV } from 'react-native-mmkv'

export const storage = new MMKV({ id: 'eduplatform-storage' })

export const Storage = {
  get: <T>(key: string): T | null => {
    const raw = storage.getString(key)
    if (!raw) return null
    try { return JSON.parse(raw) as T } catch { return null }
  },
  set: (key: string, value: unknown): void => {
    storage.set(key, JSON.stringify(value))
  },
  delete: (key: string): void => {
    storage.delete(key)
  },
  clearAll: (): void => {
    storage.clearAll()
  },
}

// Async-compatible wrapper for React Query persister
export const asyncStorage = {
  getItem:    (key: string) => Promise.resolve(storage.getString(key) ?? null),
  setItem:    (key: string, value: string) => { storage.set(key, value); return Promise.resolve() },
  removeItem: (key: string) => { storage.delete(key); return Promise.resolve() },
}
