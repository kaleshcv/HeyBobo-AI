/**
 * User-scoped localStorage utility.
 * All user data is stored under `{userId}:{key}` so different users never see each other's data.
 */
import type { PersistStorage, StorageValue } from 'zustand/middleware'

// All known persisted store keys
const ALL_STORE_KEYS = [
  // zustand persist stores
  'heybobo-ai-brain',
  'heybobo-ai-tutor',
  'budget-tracker',
  'heybobo-courses',
  'eduplatform-dietary-profile',
  'heybobo-groups',
  'heybobo-injury',
  'live-workout-store',
  'heybobo_meetings',
  'campus-marketplace',
  'orders-reviews',
  // manual localStorage stores
  'heybobo_activity_tracking',
  'heybobo_fitness_profile',
  'heybobo_wearables',
  'heybobo_workout_system',
]

/** Read the current authenticated user's ID without creating a circular import */
function getUserId(): string {
  try {
    const raw = localStorage.getItem('auth_user')
    if (raw) {
      const user = JSON.parse(raw)
      if (user?.id) return user.id
    }
  } catch { /* ignore */ }
  return 'guest'
}

/** Build a user-scoped localStorage key */
export function getUserScopedKey(baseKey: string): string {
  return `${getUserId()}:${baseKey}`
}

/**
 * Creates a zustand-compatible PersistStorage that automatically scopes
 * all reads and writes to the currently authenticated user.
 */
export function createUserStorage<T>(): PersistStorage<T> {
  return {
    getItem: (name: string): StorageValue<T> | null => {
      try {
        const raw = localStorage.getItem(getUserScopedKey(name))
        if (!raw) return null
        return JSON.parse(raw) as StorageValue<T>
      } catch {
        return null
      }
    },
    setItem: (name: string, value: StorageValue<T>): void => {
      try {
        localStorage.setItem(getUserScopedKey(name), JSON.stringify(value))
      } catch { /* ignore quota errors */ }
    },
    removeItem: (name: string): void => {
      localStorage.removeItem(getUserScopedKey(name))
    },
  }
}

/**
 * Remove all persisted data for a given userId from localStorage.
 * Call this on logout before clearing the auth session.
 */
export function clearAllUserData(userId: string): void {
  ALL_STORE_KEYS.forEach((key) => {
    localStorage.removeItem(`${userId}:${key}`)
  })
}
