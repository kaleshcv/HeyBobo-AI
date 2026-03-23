import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { asyncStorage } from '@/lib/storage'
import { DietGoal, DietType } from '@/types'

interface DietaryProfile {
  goal:          DietGoal | null
  dietType:      DietType
  targetCalories:number
  targetProtein: number
  targetCarbs:   number
  targetFat:     number
  allergies:     string[]
  waterGoalMl:   number
  currentWaterMl:number
}

interface DietaryProfileState {
  profile:       DietaryProfile
  isOnboarded:   boolean
  setProfile:    (p: Partial<DietaryProfile>) => void
  logWater:      (ml: number) => void
  resetWater:    () => void
  completeOnboarding: () => void
}

const DEFAULT: DietaryProfile = {
  goal:           null,
  dietType:       DietType.STANDARD,
  targetCalories: 2000,
  targetProtein:  150,
  targetCarbs:    200,
  targetFat:      65,
  allergies:      [],
  waterGoalMl:    2500,
  currentWaterMl: 0,
}

export const useDietaryProfileStore = create<DietaryProfileState>()(
  persist(
    (set) => ({
      profile:     DEFAULT,
      isOnboarded: false,

      setProfile: (partial) =>
        set((s) => ({ profile: { ...s.profile, ...partial } })),

      logWater: (ml) =>
        set((s) => ({ profile: { ...s.profile, currentWaterMl: s.profile.currentWaterMl + ml } })),

      resetWater: () =>
        set((s) => ({ profile: { ...s.profile, currentWaterMl: 0 } })),

      completeOnboarding: () => set({ isOnboarded: true }),
    }),
    { name: 'dietary-profile', storage: createJSONStorage(() => asyncStorage) },
  ),
)
