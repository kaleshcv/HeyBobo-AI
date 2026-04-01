import { create } from 'zustand'
import { syncFitnessProfile } from './fitnessSyncService'

export type FitnessGoal = 'weight-loss' | 'muscle-gain' | 'general-fitness' | 'endurance' | 'rehab-mobility'
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced'
export type ActivityLevel = 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extremely-active'
export type HeightUnit = 'cm' | 'ft'
export type WeightUnit = 'kg' | 'lbs'

export interface FitnessProfile {
  // Goals
  goals: FitnessGoal[]

  // Baseline data
  heightCm: number | null
  weightKg: number | null
  heightUnit: HeightUnit
  weightUnit: WeightUnit
  activityLevel: ActivityLevel | null
  injuries: string

  // Fitness level
  fitnessLevel: FitnessLevel | null

  // Time availability
  daysPerWeek: number
  minutesPerDay: number
}

interface FitnessProfileState {
  profile: FitnessProfile
  isOnboarded: boolean
  setProfile: (profile: Partial<FitnessProfile>) => void
  completeOnboarding: () => void
  resetProfile: () => void
}

const DEFAULT_PROFILE: FitnessProfile = {
  goals: [],
  heightCm: null,
  weightKg: null,
  heightUnit: 'cm',
  weightUnit: 'kg',
  activityLevel: null,
  injuries: '',
  fitnessLevel: null,
  daysPerWeek: 3,
  minutesPerDay: 30,
}

// Data is synced to backend via API — no localStorage
// Zustand stores data in-memory only (ephemeral per session)

export const useFitnessProfileStore = create<FitnessProfileState>((set, get) => {
  return {
    profile: DEFAULT_PROFILE,
    isOnboarded: false,
    setProfile: (partial) => {
      const updated = { ...get().profile, ...partial }
      set({ profile: updated })
      syncFitnessProfile(updated)
    },
    completeOnboarding: () => {
      set({ isOnboarded: true })
      syncFitnessProfile({ ...get().profile, isOnboarded: true })
    },
    resetProfile: () => {
      set({ profile: DEFAULT_PROFILE, isOnboarded: false })
    },
  }
})

export function calcBMI(heightCm: number | null, weightKg: number | null): number | null {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return null
  const heightM = heightCm / 100
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10
}

export function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}

export function cmToFeetInches(cm: number): string {
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return `${feet}'${inches}"`
}

export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10
}

export function lbsToKg(lbs: number): number {
  return Math.round(lbs / 2.20462 * 10) / 10
}

export function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54 * 10) / 10
}
