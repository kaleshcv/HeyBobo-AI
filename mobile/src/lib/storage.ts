/**
 * Storage layer — in-memory implementation for Expo Go compatibility.
 * react-native-mmkv requires a native build (npx expo run:android).
 * For Expo Go dev testing, we use a simple Map-based store.
 */

const memStore = new Map<string, string>()

export const Storage = {
  get: <T>(key: string): T | null => {
    const raw = memStore.get(key)
    if (!raw) return null
    try { return JSON.parse(raw) as T } catch { return null }
  },
  set: (key: string, value: unknown): void => {
    memStore.set(key, JSON.stringify(value))
  },
  delete: (key: string): void => {
    memStore.delete(key)
  },
  clearAll: (): void => {
    memStore.clear()
  },
}

// Async wrapper — used by React Query persister & Zustand persist middleware
export const asyncStorage = {
  getItem:    (key: string): Promise<string | null> =>
    Promise.resolve(memStore.get(key) ?? null),
  setItem:    (key: string, value: string): Promise<void> => {
    memStore.set(key, value)
    return Promise.resolve()
  },
  removeItem: (key: string): Promise<void> => {
    memStore.delete(key)
    return Promise.resolve()
  },
}
