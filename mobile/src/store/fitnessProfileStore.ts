import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { asyncStorage } from '@/lib/storage'
import type { FitnessProfile } from '@/types'

interface FitnessProfileState {
  profile:      FitnessProfile
  isOnboarded:  boolean
  setProfile:   (p: Partial<FitnessProfile>) => void
  completeOnboarding: () => void
  resetProfile: () => void
}

const DEFAULT: FitnessProfile = {
  goals:         [],
  heightCm:      null,
  weightKg:      null,
  activityLevel: null,
  fitnessLevel:  null,
  injuries:      '',
  daysPerWeek:   3,
  minutesPerDay: 45,
}

export const useFitnessProfileStore = create<FitnessProfileState>()(
  persist(
    (set) => ({
      profile:     DEFAULT,
      isOnboarded: false,

      setProfile: (partial) =>
        set((s) => ({ profile: { ...s.profile, ...partial } })),

      completeOnboarding: () => set({ isOnboarded: true }),

      resetProfile: () => set({ profile: DEFAULT, isOnboarded: false }),
    }),
    { name: 'fitness-profile', storage: createJSONStorage(() => asyncStorage) },
  ),
)
