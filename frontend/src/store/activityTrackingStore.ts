import { create } from 'zustand'
import { getUserScopedKey } from '@/lib/userStorage'
import { syncDailyMetrics, syncWorkoutSession } from './fitnessSyncService'

export interface DailyMetrics {
  date: string // YYYY-MM-DD
  steps: number
  distanceKm: number
  caloriesBurned: number
  activeMinutes: number
  floorsClimbed: number
}

export type WorkoutType =
  | 'running'
  | 'walking'
  | 'cycling'
  | 'swimming'
  | 'strength'
  | 'yoga'
  | 'hiit'
  | 'sports'
  | 'dance'
  | 'other'

export interface WorkoutEntry {
  id: string
  date: string
  type: WorkoutType
  name: string
  durationMinutes: number
  caloriesBurned: number
  notes: string
  createdAt: string
}

export interface CustomActivity {
  id: string
  date: string
  name: string
  durationMinutes: number
  caloriesBurned: number
  createdAt: string
}

export type SyncDevice = 'smart-watch' | 'smart-ring' | 'phone-sensors'

export interface ConnectedDevice {
  type: SyncDevice
  name: string
  connectedAt: string
  lastSyncedAt: string
  isActive: boolean
}

export interface DailyGoals {
  steps: number
  distanceKm: number
  caloriesBurned: number
  activeMinutes: number
  floorsClimbed: number
}

interface ActivityTrackingState {
  dailyMetrics: Record<string, DailyMetrics>
  workouts: WorkoutEntry[]
  customActivities: CustomActivity[]
  connectedDevices: ConnectedDevice[]
  goals: DailyGoals

  // Daily metrics
  getDailyMetrics: (date: string) => DailyMetrics
  updateDailyMetrics: (date: string, partial: Partial<DailyMetrics>) => void

  // Workouts
  addWorkout: (workout: Omit<WorkoutEntry, 'id' | 'createdAt'>) => void
  removeWorkout: (id: string) => void

  // Custom activities
  addCustomActivity: (activity: Omit<CustomActivity, 'id' | 'createdAt'>) => void
  removeCustomActivity: (id: string) => void

  // Devices
  connectDevice: (type: SyncDevice, name: string) => void
  disconnectDevice: (type: SyncDevice) => void
  syncDevice: (type: SyncDevice) => void

  // Goals
  setGoals: (goals: Partial<DailyGoals>) => void

  // Helpers
  getWeeklyMetrics: (endDate: string) => DailyMetrics[]
}

const DEFAULT_GOALS: DailyGoals = {
  steps: 10000,
  distanceKm: 5,
  caloriesBurned: 500,
  activeMinutes: 30,
  floorsClimbed: 10,
}

function emptyMetrics(date: string): DailyMetrics {
  return { date, steps: 0, distanceKm: 0, caloriesBurned: 0, activeMinutes: 0, floorsClimbed: 0 }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function loadState() {
  try {
    const raw = localStorage.getItem(getUserScopedKey('heybobo_activity_tracking'))
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

function persist(state: Pick<ActivityTrackingState, 'dailyMetrics' | 'workouts' | 'customActivities' | 'connectedDevices' | 'goals'>) {
  localStorage.setItem(
    getUserScopedKey('heybobo_activity_tracking'),
    JSON.stringify({
      dailyMetrics: state.dailyMetrics,
      workouts: state.workouts,
      customActivities: state.customActivities,
      connectedDevices: state.connectedDevices,
      goals: state.goals,
    }),
  )
}

export const useActivityTrackingStore = create<ActivityTrackingState>((set, get) => {
  const saved = loadState()

  const initial = {
    dailyMetrics: saved?.dailyMetrics ?? {},
    workouts: saved?.workouts ?? [],
    customActivities: saved?.customActivities ?? [],
    connectedDevices: saved?.connectedDevices ?? [],
    goals: saved?.goals ?? DEFAULT_GOALS,
  }

  return {
    ...initial,

    getDailyMetrics: (date) => get().dailyMetrics[date] ?? emptyMetrics(date),

    updateDailyMetrics: (date, partial) => {
      const current = get().dailyMetrics[date] ?? emptyMetrics(date)
      const updated = { ...current, ...partial, date }
      const newMetrics = { ...get().dailyMetrics, [date]: updated }
      set({ dailyMetrics: newMetrics })
      persist({ ...get(), dailyMetrics: newMetrics })
      syncDailyMetrics(date, updated)
    },

    addWorkout: (workout) => {
      const entry: WorkoutEntry = { ...workout, id: generateId(), createdAt: new Date().toISOString() }
      const workouts = [entry, ...get().workouts]
      set({ workouts })
      // Also add calories & active minutes to daily metrics
      const dm = get().dailyMetrics[workout.date] ?? emptyMetrics(workout.date)
      const updated = {
        ...dm,
        caloriesBurned: dm.caloriesBurned + workout.caloriesBurned,
        activeMinutes: dm.activeMinutes + workout.durationMinutes,
      }
      const newMetrics = { ...get().dailyMetrics, [workout.date]: updated }
      set({ dailyMetrics: newMetrics })
      persist({ ...get(), workouts, dailyMetrics: newMetrics })
      // Sync workout to backend
      syncWorkoutSession({
        name: workout.name,
        startedAt: entry.createdAt,
        durationSeconds: workout.durationMinutes * 60,
        caloriesBurned: workout.caloriesBurned,
        source: 'activity_tracking',
        category: workout.type,
      })
      syncDailyMetrics(workout.date, updated)
    },

    removeWorkout: (id) => {
      const workouts = get().workouts.filter((w) => w.id !== id)
      set({ workouts })
      persist({ ...get(), workouts })
    },

    addCustomActivity: (activity) => {
      const entry: CustomActivity = { ...activity, id: generateId(), createdAt: new Date().toISOString() }
      const customActivities = [entry, ...get().customActivities]
      set({ customActivities })
      const dm = get().dailyMetrics[activity.date] ?? emptyMetrics(activity.date)
      const updated = {
        ...dm,
        caloriesBurned: dm.caloriesBurned + activity.caloriesBurned,
        activeMinutes: dm.activeMinutes + activity.durationMinutes,
      }
      const newMetrics = { ...get().dailyMetrics, [activity.date]: updated }
      set({ dailyMetrics: newMetrics })
      persist({ ...get(), customActivities, dailyMetrics: newMetrics })
    },

    removeCustomActivity: (id) => {
      const customActivities = get().customActivities.filter((a) => a.id !== id)
      set({ customActivities })
      persist({ ...get(), customActivities })
    },

    connectDevice: (type, name) => {
      const now = new Date().toISOString()
      const existing = get().connectedDevices.filter((d) => d.type !== type)
      const connectedDevices = [...existing, { type, name, connectedAt: now, lastSyncedAt: now, isActive: true }]
      set({ connectedDevices })
      persist({ ...get(), connectedDevices })
    },

    disconnectDevice: (type) => {
      const connectedDevices = get().connectedDevices.filter((d) => d.type !== type)
      set({ connectedDevices })
      persist({ ...get(), connectedDevices })
    },

    syncDevice: (type) => {
      const connectedDevices = get().connectedDevices.map((d) =>
        d.type === type ? { ...d, lastSyncedAt: new Date().toISOString() } : d,
      )
      set({ connectedDevices })
      persist({ ...get(), connectedDevices })
    },

    setGoals: (partial) => {
      const goals = { ...get().goals, ...partial }
      set({ goals })
      persist({ ...get(), goals })
    },

    getWeeklyMetrics: (endDate) => {
      const end = new Date(endDate)
      const result: DailyMetrics[] = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(end)
        d.setDate(d.getDate() - i)
        const ds = toDateStr(d)
        result.push(get().dailyMetrics[ds] ?? emptyMetrics(ds))
      }
      return result
    },
  }
})

export const WORKOUT_TYPES: { id: WorkoutType; label: string; emoji: string }[] = [
  { id: 'running', label: 'Running', emoji: '🏃' },
  { id: 'walking', label: 'Walking', emoji: '🚶' },
  { id: 'cycling', label: 'Cycling', emoji: '🚴' },
  { id: 'swimming', label: 'Swimming', emoji: '🏊' },
  { id: 'strength', label: 'Strength', emoji: '🏋️' },
  { id: 'yoga', label: 'Yoga', emoji: '🧘' },
  { id: 'hiit', label: 'HIIT', emoji: '⚡' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'dance', label: 'Dance', emoji: '💃' },
  { id: 'other', label: 'Other', emoji: '🎯' },
]
