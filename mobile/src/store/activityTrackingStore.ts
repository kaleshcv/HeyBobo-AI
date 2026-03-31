import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { asyncStorage } from '@/lib/storage'

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

  getDailyMetrics: (date: string) => DailyMetrics
  updateDailyMetrics: (date: string, partial: Partial<DailyMetrics>) => void

  addWorkout: (workout: Omit<WorkoutEntry, 'id' | 'createdAt'>) => void
  removeWorkout: (id: string) => void

  addCustomActivity: (activity: Omit<CustomActivity, 'id' | 'createdAt'>) => void
  removeCustomActivity: (id: string) => void

  connectDevice: (type: SyncDevice, name: string) => void
  disconnectDevice: (type: SyncDevice) => void
  syncDevice: (type: SyncDevice) => void

  setGoals: (goals: Partial<DailyGoals>) => void
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

export const useActivityTrackingStore = create<ActivityTrackingState>()(
  persist(
    (set, get) => ({
      dailyMetrics: {},
      workouts: [],
      customActivities: [],
      connectedDevices: [],
      goals: DEFAULT_GOALS,

      getDailyMetrics: (date) => {
        return get().dailyMetrics[date] ?? emptyMetrics(date)
      },

      updateDailyMetrics: (date, partial) => {
        const dm = get().dailyMetrics[date] ?? emptyMetrics(date)
        const updated = { ...dm, ...partial }
        set((s) => ({ dailyMetrics: { ...s.dailyMetrics, [date]: updated } }))
      },

      addWorkout: (workout) => {
        const entry: WorkoutEntry = {
          ...workout,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }
        set((s) => {
          const workouts = [entry, ...s.workouts]
          const dm = s.dailyMetrics[workout.date] ?? emptyMetrics(workout.date)
          const updated: DailyMetrics = {
            ...dm,
            caloriesBurned: dm.caloriesBurned + workout.caloriesBurned,
            activeMinutes: dm.activeMinutes + workout.durationMinutes,
          }
          return {
            workouts,
            dailyMetrics: { ...s.dailyMetrics, [workout.date]: updated },
          }
        })
      },

      removeWorkout: (id) => {
        set((s) => ({ workouts: s.workouts.filter((w) => w.id !== id) }))
      },

      addCustomActivity: (activity) => {
        const entry: CustomActivity = {
          ...activity,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }
        set((s) => {
          const customActivities = [entry, ...s.customActivities]
          const dm = s.dailyMetrics[activity.date] ?? emptyMetrics(activity.date)
          const updated: DailyMetrics = {
            ...dm,
            caloriesBurned: dm.caloriesBurned + activity.caloriesBurned,
            activeMinutes: dm.activeMinutes + activity.durationMinutes,
          }
          return {
            customActivities,
            dailyMetrics: { ...s.dailyMetrics, [activity.date]: updated },
          }
        })
      },

      removeCustomActivity: (id) => {
        set((s) => ({ customActivities: s.customActivities.filter((a) => a.id !== id) }))
      },

      connectDevice: (type, name) => {
        const now = new Date().toISOString()
        set((s) => {
          const existing = s.connectedDevices.filter((d) => d.type !== type)
          return {
            connectedDevices: [
              ...existing,
              { type, name, connectedAt: now, lastSyncedAt: now, isActive: true },
            ],
          }
        })
      },

      disconnectDevice: (type) => {
        set((s) => ({
          connectedDevices: s.connectedDevices.filter((d) => d.type !== type),
        }))
      },

      syncDevice: (type) => {
        set((s) => {
          const connectedDevices = s.connectedDevices.map((d) =>
            d.type === type ? { ...d, lastSyncedAt: new Date().toISOString() } : d,
          )
          const today = toDateStr(new Date())
          const dm = s.dailyMetrics[today] ?? emptyMetrics(today)
          const updated: DailyMetrics = {
            ...dm,
            steps: dm.steps + Math.floor(200 + Math.random() * 800),
            distanceKm: Math.round((dm.distanceKm + 0.1 + Math.random() * 0.5) * 10) / 10,
            caloriesBurned: dm.caloriesBurned + Math.floor(20 + Math.random() * 80),
            activeMinutes: dm.activeMinutes + Math.floor(2 + Math.random() * 10),
            floorsClimbed: dm.floorsClimbed + Math.floor(Math.random() * 3),
          }
          return {
            connectedDevices,
            dailyMetrics: { ...s.dailyMetrics, [today]: updated },
          }
        })
      },

      setGoals: (partial) => {
        set((s) => ({ goals: { ...s.goals, ...partial } }))
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
    }),
    {
      name: 'heybobo_activity_tracking',
      storage: createJSONStorage(() => asyncStorage),
    },
  ),
)

export const WORKOUT_TYPES: { id: WorkoutType; label: string; emoji: string }[] = [
  { id: 'running',  label: 'Running',  emoji: '🏃' },
  { id: 'walking',  label: 'Walking',  emoji: '🚶' },
  { id: 'cycling',  label: 'Cycling',  emoji: '🚴' },
  { id: 'swimming', label: 'Swimming', emoji: '🏊' },
  { id: 'strength', label: 'Strength', emoji: '🏋️' },
  { id: 'yoga',     label: 'Yoga',     emoji: '🧘' },
  { id: 'hiit',     label: 'HIIT',     emoji: '⚡' },
  { id: 'sports',   label: 'Sports',   emoji: '⚽' },
  { id: 'dance',    label: 'Dance',    emoji: '💃' },
  { id: 'other',    label: 'Other',    emoji: '🎯' },
]
