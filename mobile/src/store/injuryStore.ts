import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { asyncStorage } from '@/lib/storage'

export type InjuryType = 'muscle-strain' | 'ligament-sprain' | 'fracture' | 'joint-pain' | 'tendinitis' | 'bruise' | 'nerve-pain' | 'posture-related' | 'overuse' | 'other'

export type BodyPart = 'head' | 'neck' | 'shoulder-left' | 'shoulder-right' | 'upper-back' | 'lower-back' | 'chest' | 'elbow-left' | 'elbow-right' | 'wrist-left' | 'wrist-right' | 'hip-left' | 'hip-right' | 'knee-left' | 'knee-right' | 'ankle-left' | 'ankle-right' | 'foot-left' | 'foot-right'

export type Severity = 'mild' | 'moderate' | 'severe'

export type InjuryStatus = 'active' | 'recovering' | 'healed'

export interface InjuryLog {
  id: string
  type: InjuryType
  bodyPart: BodyPart
  severity: Severity
  description: string
  dateOccurred: string
  status: InjuryStatus
  painLevel: number
  notes: string[]
  healingDays: number | null
  affectsWorkout: boolean
}

interface InjuryState {
  injuries: InjuryLog[]

  addInjury: (injury: InjuryLog) => void
  updateInjury: (id: string, data: Partial<InjuryLog>) => void
  removeInjury: (id: string) => void
  addNote: (id: string, note: string) => void
  updateStatus: (id: string, status: InjuryStatus) => void
  updatePainLevel: (id: string, level: number) => void
  activeInjuries: () => InjuryLog[]
}

export const useInjuryStore = create<InjuryState>()(
  persist(
    (set, get) => ({
      injuries: [],

      addInjury: (injury) =>
        set((s) => ({
          injuries: [...s.injuries, injury],
        })),

      updateInjury: (id, data) =>
        set((s) => ({
          injuries: s.injuries.map((i) =>
            i.id === id ? { ...i, ...data } : i
          ),
        })),

      removeInjury: (id) =>
        set((s) => ({
          injuries: s.injuries.filter((i) => i.id !== id),
        })),

      addNote: (id, note) =>
        set((s) => ({
          injuries: s.injuries.map((i) =>
            i.id === id ? { ...i, notes: [...i.notes, note] } : i
          ),
        })),

      updateStatus: (id, status) =>
        set((s) => ({
          injuries: s.injuries.map((i) =>
            i.id === id ? { ...i, status } : i
          ),
        })),

      updatePainLevel: (id, painLevel) =>
        set((s) => ({
          injuries: s.injuries.map((i) =>
            i.id === id ? { ...i, painLevel } : i
          ),
        })),

      activeInjuries: () => {
        const state = get()
        return state.injuries.filter((i) => i.status === 'active' || i.status === 'recovering')
      },
    }),
    {
      name: 'injury-store',
      storage: createJSONStorage(() => asyncStorage),
    }
  )
)
