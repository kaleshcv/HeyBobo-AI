import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { asyncStorage } from '@/lib/storage'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SkinType = 'Normal' | 'Dry' | 'Oily' | 'Combination' | 'Sensitive'
export type HairType = 'Straight' | 'Wavy' | 'Curly' | 'Coily'
export type FaceShape = 'Oval' | 'Round' | 'Square' | 'Heart' | 'Diamond'
export type RecommendationCategory = 'Skincare' | 'Haircare' | 'Lifestyle' | 'Grooming'
export type Priority = 'High' | 'Medium' | 'Low'

export interface GroomingProfile {
  skinType: SkinType
  hairType: HairType
  faceShape: FaceShape
  concerns: string[]
  stylePrefs: string[]
  routineCompleted: { morning: boolean; evening: boolean }
}

export interface Recommendation {
  id: string
  category: RecommendationCategory
  title: string
  description: string
  priority: Priority
  products: string[]
  saved: boolean
  addedAt: string
}

export interface AnalysisResult {
  id: string
  date: string
  skinType: SkinType
  skinScore: number
  concerns: string[]
  recommendations: string[]
}

export interface RoutineStep {
  id: string
  label: string
  period: 'morning' | 'evening'
  done: boolean
}

// ─── Seed data ─────────────────────────────────────────────────────────────────

const SEED_RECOMMENDATIONS: Recommendation[] = [
  {
    id: '1',
    category: 'Skincare',
    title: 'Daily Moisturizer',
    description: 'Use a lightweight, non-comedogenic moisturizer twice daily to maintain skin barrier.',
    priority: 'High',
    products: ['CeraVe Facial Moisturizing Lotion', 'Cetaphil Daily Facial Cleanser'],
    saved: true,
    addedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '2',
    category: 'Skincare',
    title: 'Sunscreen SPF 30+',
    description: 'Apply broad-spectrum SPF 30+ every morning and reapply every 2 hours outdoors.',
    priority: 'High',
    products: ['La Roche-Posay Anthelios', 'Neutrogena Ultra Sheer'],
    saved: true,
    addedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: '3',
    category: 'Skincare',
    title: 'Vitamin C Serum',
    description: 'Use Vitamin C serum in the morning to brighten skin and reduce dark spots.',
    priority: 'Medium',
    products: ['TruSkin Vitamin C Serum', 'Skinceuticals CE Ferulic'],
    saved: false,
    addedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: '4',
    category: 'Haircare',
    title: 'Deep Conditioning Mask',
    description: 'Use a deep conditioning hair mask once a week to restore moisture and shine.',
    priority: 'Medium',
    products: ['Olaplex No. 3 Hair Perfector', 'Kerastase Masque Therapiste'],
    saved: false,
    addedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: '5',
    category: 'Haircare',
    title: 'Scalp Massage',
    description: 'Massage your scalp for 5 minutes daily to stimulate blood flow and hair growth.',
    priority: 'Low',
    products: [],
    saved: false,
    addedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: '6',
    category: 'Lifestyle',
    title: 'Stay Hydrated',
    description: 'Drink at least 8 glasses of water daily. Hydration directly impacts skin clarity and elasticity.',
    priority: 'High',
    products: [],
    saved: true,
    addedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: '7',
    category: 'Lifestyle',
    title: 'Beauty Sleep',
    description: 'Aim for 7-9 hours of sleep. Skin repairs itself during sleep cycles.',
    priority: 'Medium',
    products: ['Silk Pillowcase', 'Overnight Hydrating Mask'],
    saved: false,
    addedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: '8',
    category: 'Grooming',
    title: 'Eyebrow Shaping',
    description: 'Define your brows with light grooming every 2-3 weeks to frame your face shape.',
    priority: 'Low',
    products: ['Benefit Precisely My Brow Pencil'],
    saved: false,
    addedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
]

const SEED_ANALYSIS: AnalysisResult = {
  id: 'a1',
  date: new Date(Date.now() - 2 * 86400000).toISOString(),
  skinType: 'Combination',
  skinScore: 72,
  concerns: ['Oiliness', 'Dryness', 'Uneven Tone'],
  recommendations: [
    'Use lightweight non-comedogenic moisturizer',
    'Apply sunscreen daily',
    'Exfoliate 2-3 times per week',
    'Use a gentle toner to balance pH',
  ],
}

const SEED_ROUTINE: RoutineStep[] = [
  { id: 'r1', label: 'Cleanse face', period: 'morning', done: false },
  { id: 'r2', label: 'Apply toner', period: 'morning', done: false },
  { id: 'r3', label: 'Vitamin C serum', period: 'morning', done: false },
  { id: 'r4', label: 'Moisturize', period: 'morning', done: true },
  { id: 'r5', label: 'Sunscreen SPF 30+', period: 'morning', done: true },
  { id: 'r6', label: 'Cleanser', period: 'evening', done: false },
  { id: 'r7', label: 'Exfoliate (2x/week)', period: 'evening', done: false },
  { id: 'r8', label: 'Night serum', period: 'evening', done: false },
  { id: 'r9', label: 'Eye cream', period: 'evening', done: false },
  { id: 'r10', label: 'Night moisturizer', period: 'evening', done: false },
]

// ─── Store ──────────────────────────────────────────────────────────────────

interface GroomingState {
  profile: GroomingProfile
  recommendations: Recommendation[]
  analysisHistory: AnalysisResult[]
  routine: RoutineStep[]
  isOnboarded: boolean

  // Actions
  updateProfile: (p: Partial<GroomingProfile>) => void
  toggleSaveRecommendation: (id: string) => void
  addRecommendation: (rec: Recommendation) => void
  addAnalysisResult: (result: AnalysisResult) => void
  toggleRoutineStep: (id: string) => void
  resetRoutine: () => void
  completeOnboarding: () => void
}

export const useGroomingStore = create<GroomingState>()(
  persist(
    (set) => ({
      profile: {
        skinType: 'Combination',
        hairType: 'Wavy',
        faceShape: 'Oval',
        concerns: ['Oiliness', 'Dryness', 'Uneven Tone'],
        stylePrefs: ['Casual', 'Professional'],
        routineCompleted: { morning: false, evening: false },
      },
      recommendations: SEED_RECOMMENDATIONS,
      analysisHistory: [SEED_ANALYSIS],
      routine: SEED_ROUTINE,
      isOnboarded: false,

      updateProfile: (partial) =>
        set((s) => ({ profile: { ...s.profile, ...partial } })),

      toggleSaveRecommendation: (id) =>
        set((s) => ({
          recommendations: s.recommendations.map((r) =>
            r.id === id ? { ...r, saved: !r.saved } : r,
          ),
        })),

      addRecommendation: (rec) =>
        set((s) => ({ recommendations: [rec, ...s.recommendations] })),

      addAnalysisResult: (result) =>
        set((s) => ({ analysisHistory: [result, ...s.analysisHistory] })),

      toggleRoutineStep: (id) =>
        set((s) => ({
          routine: s.routine.map((step) =>
            step.id === id ? { ...step, done: !step.done } : step,
          ),
        })),

      resetRoutine: () =>
        set((s) => ({
          routine: s.routine.map((step) => ({ ...step, done: false })),
        })),

      completeOnboarding: () => set({ isOnboarded: true }),
    }),
    { name: 'grooming-store', storage: createJSONStorage(() => asyncStorage) },
  ),
)
