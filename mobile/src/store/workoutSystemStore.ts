import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { asyncStorage } from '@/lib/storage'

export type ExerciseCategory = 'strength' | 'cardio' | 'yoga' | 'hiit' | 'stretching' | 'mobility'
export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'core' | 'quads' | 'hamstrings' | 'glutes' | 'calves' | 'full-body' | 'hip-flexors'
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'
export type PlanGoal = 'fat-loss' | 'muscle-gain' | 'flexibility' | 'athletic-performance'

export interface Exercise {
  id: string
  name: string
  category: ExerciseCategory
  muscles: MuscleGroup[]
  difficulty: DifficultyLevel
  instructions: string[]
  videoUrl: string
  imageUrl: string
  durationSeconds: number | null
  defaultReps: number | null
  defaultSets: number | null
  equipmentNeeded: string[]
}

export interface WorkoutExercise {
  exerciseId: string
  sets: number
  reps: number | null
  durationSeconds: number | null
  restSeconds: number
}

export interface WorkoutPlan {
  id: string
  name: string
  description: string
  goal: PlanGoal
  difficulty: DifficultyLevel
  daysPerWeek: number
  weeklySchedule: Record<string, WorkoutExercise[]>
  createdAt: string
  lastUsedAt: string | null
  completedSessions: number
}

export interface ExerciseLogEntry {
  date: string
  reps: number
  sets: number
  weight: number
}

interface WorkoutSystemState {
  plans: WorkoutPlan[]
  activePlanId: string | null
  exerciseHistory: Record<string, ExerciseLogEntry[]>

  addPlan: (plan: WorkoutPlan) => void
  removePlan: (id: string) => void
  setActivePlan: (id: string | null) => void
  logExercise: (exerciseId: string, entry: ExerciseLogEntry) => void
  markSessionComplete: (planId: string) => void
}

export const EXERCISE_DATABASE: Exercise[] = [
  {
    id: '1',
    name: 'Push-ups',
    category: 'strength',
    muscles: ['chest', 'triceps', 'shoulders'],
    difficulty: 'beginner',
    instructions: ['Get into plank position', 'Lower body until chest nearly touches floor', 'Push back to starting position'],
    videoUrl: 'https://example.com/pushups',
    imageUrl: 'https://example.com/pushups.jpg',
    durationSeconds: null,
    defaultReps: 12,
    defaultSets: 3,
    equipmentNeeded: [],
  },
  {
    id: '2',
    name: 'Squats',
    category: 'strength',
    muscles: ['quads', 'glutes', 'hamstrings'],
    difficulty: 'beginner',
    instructions: ['Stand with feet shoulder-width apart', 'Lower hips back and down', 'Return to standing position'],
    videoUrl: 'https://example.com/squats',
    imageUrl: 'https://example.com/squats.jpg',
    durationSeconds: null,
    defaultReps: 15,
    defaultSets: 3,
    equipmentNeeded: [],
  },
  {
    id: '3',
    name: 'Running',
    category: 'cardio',
    muscles: ['full-body'],
    difficulty: 'beginner',
    instructions: ['Maintain steady pace', 'Keep breathing rhythmic', 'Run for target duration'],
    videoUrl: 'https://example.com/running',
    imageUrl: 'https://example.com/running.jpg',
    durationSeconds: 1200,
    defaultReps: null,
    defaultSets: null,
    equipmentNeeded: [],
  },
  {
    id: '4',
    name: 'Plank',
    category: 'strength',
    muscles: ['core', 'chest', 'shoulders'],
    difficulty: 'intermediate',
    instructions: ['Get into forearm plank position', 'Keep body straight', 'Hold for time'],
    videoUrl: 'https://example.com/plank',
    imageUrl: 'https://example.com/plank.jpg',
    durationSeconds: 60,
    defaultReps: null,
    defaultSets: 3,
    equipmentNeeded: [],
  },
  {
    id: '5',
    name: 'Yoga - Downward Dog',
    category: 'yoga',
    muscles: ['full-body'],
    difficulty: 'beginner',
    instructions: ['Hands and knees on ground', 'Lift hips toward ceiling', 'Hold stretch'],
    videoUrl: 'https://example.com/yoga-downdog',
    imageUrl: 'https://example.com/yoga-downdog.jpg',
    durationSeconds: 45,
    defaultReps: null,
    defaultSets: 3,
    equipmentNeeded: [],
  },
  {
    id: '6',
    name: 'Burpees',
    category: 'hiit',
    muscles: ['full-body'],
    difficulty: 'advanced',
    instructions: ['Start standing', 'Drop to plank', 'Do pushup', 'Jump back to standing', 'Jump up'],
    videoUrl: 'https://example.com/burpees',
    imageUrl: 'https://example.com/burpees.jpg',
    durationSeconds: null,
    defaultReps: 10,
    defaultSets: 3,
    equipmentNeeded: [],
  },
  {
    id: '7',
    name: 'Deadlift',
    category: 'strength',
    muscles: ['back', 'hamstrings', 'glutes'],
    difficulty: 'intermediate',
    instructions: ['Stand with feet hip-width apart', 'Bend hips and knees', 'Lift weight off ground'],
    videoUrl: 'https://example.com/deadlift',
    imageUrl: 'https://example.com/deadlift.jpg',
    durationSeconds: null,
    defaultReps: 8,
    defaultSets: 5,
    equipmentNeeded: ['barbell'],
  },
  {
    id: '8',
    name: 'Hamstring Stretch',
    category: 'stretching',
    muscles: ['hamstrings'],
    difficulty: 'beginner',
    instructions: ['Sit with one leg extended', 'Bend forward at hips', 'Hold stretch'],
    videoUrl: 'https://example.com/stretch',
    imageUrl: 'https://example.com/stretch.jpg',
    durationSeconds: 30,
    defaultReps: null,
    defaultSets: 2,
    equipmentNeeded: [],
  },
  {
    id: '9',
    name: 'Bicep Curls',
    category: 'strength',
    muscles: ['biceps'],
    difficulty: 'beginner',
    instructions: ['Hold dumbbells at sides', 'Curl weight up to shoulders', 'Lower back down'],
    videoUrl: 'https://example.com/biceps',
    imageUrl: 'https://example.com/biceps.jpg',
    durationSeconds: null,
    defaultReps: 12,
    defaultSets: 3,
    equipmentNeeded: ['dumbbells'],
  },
  {
    id: '10',
    name: 'Cat-Cow Stretch',
    category: 'mobility',
    muscles: ['back'],
    difficulty: 'beginner',
    instructions: ['Hands and knees', 'Arch back', 'Round spine', 'Repeat slowly'],
    videoUrl: 'https://example.com/catcow',
    imageUrl: 'https://example.com/catcow.jpg',
    durationSeconds: 60,
    defaultReps: null,
    defaultSets: 2,
    equipmentNeeded: [],
  },
]

export const PRESET_PLANS: WorkoutPlan[] = [
  {
    id: 'preset-1',
    name: 'Beginner Full Body',
    description: 'Perfect for getting started with fitness',
    goal: 'muscle-gain',
    difficulty: 'beginner',
    daysPerWeek: 3,
    weeklySchedule: {
      Monday: [
        { exerciseId: '1', sets: 3, reps: 12, durationSeconds: null, restSeconds: 60 },
        { exerciseId: '2', sets: 3, reps: 15, durationSeconds: null, restSeconds: 60 },
      ],
      Wednesday: [
        { exerciseId: '4', sets: 3, reps: null, durationSeconds: 60, restSeconds: 60 },
        { exerciseId: '3', sets: 1, reps: null, durationSeconds: 1200, restSeconds: 0 },
      ],
      Friday: [
        { exerciseId: '1', sets: 3, reps: 12, durationSeconds: null, restSeconds: 60 },
        { exerciseId: '9', sets: 3, reps: 12, durationSeconds: null, restSeconds: 60 },
      ],
    },
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
    completedSessions: 0,
  },
  {
    id: 'preset-2',
    name: 'Fat Loss HIIT',
    description: 'High intensity interval training for cardio',
    goal: 'fat-loss',
    difficulty: 'intermediate',
    daysPerWeek: 4,
    weeklySchedule: {
      Monday: [
        { exerciseId: '6', sets: 3, reps: 10, durationSeconds: null, restSeconds: 90 },
        { exerciseId: '3', sets: 1, reps: null, durationSeconds: 600, restSeconds: 0 },
      ],
      Wednesday: [
        { exerciseId: '3', sets: 1, reps: null, durationSeconds: 900, restSeconds: 0 },
      ],
      Friday: [
        { exerciseId: '6', sets: 4, reps: 8, durationSeconds: null, restSeconds: 120 },
      ],
      Sunday: [
        { exerciseId: '3', sets: 1, reps: null, durationSeconds: 1200, restSeconds: 0 },
      ],
    },
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
    completedSessions: 0,
  },
  {
    id: 'preset-3',
    name: 'Flexibility & Recovery',
    description: 'Focus on stretching and mobility',
    goal: 'flexibility',
    difficulty: 'beginner',
    daysPerWeek: 5,
    weeklySchedule: {
      Monday: [
        { exerciseId: '5', sets: 2, reps: null, durationSeconds: 45, restSeconds: 30 },
      ],
      Tuesday: [
        { exerciseId: '10', sets: 2, reps: null, durationSeconds: 60, restSeconds: 30 },
      ],
      Wednesday: [
        { exerciseId: '8', sets: 2, reps: null, durationSeconds: 30, restSeconds: 30 },
      ],
      Thursday: [
        { exerciseId: '5', sets: 2, reps: null, durationSeconds: 45, restSeconds: 30 },
      ],
      Friday: [
        { exerciseId: '10', sets: 2, reps: null, durationSeconds: 60, restSeconds: 30 },
      ],
    },
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
    completedSessions: 0,
  },
]

export const useWorkoutSystemStore = create<WorkoutSystemState>()(
  persist(
    (set) => ({
      plans: [],
      activePlanId: null,
      exerciseHistory: {},

      addPlan: (plan) =>
        set((s) => ({
          plans: [...s.plans, plan],
          activePlanId: plan.id,
        })),

      removePlan: (id) =>
        set((s) => ({
          plans: s.plans.filter((p) => p.id !== id),
          activePlanId: s.activePlanId === id ? null : s.activePlanId,
        })),

      setActivePlan: (activePlanId) => set({ activePlanId }),

      logExercise: (exerciseId, entry) =>
        set((s) => ({
          exerciseHistory: {
            ...s.exerciseHistory,
            [exerciseId]: [...(s.exerciseHistory[exerciseId] || []), entry],
          },
        })),

      markSessionComplete: (planId) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id === planId
              ? {
                  ...p,
                  completedSessions: p.completedSessions + 1,
                  lastUsedAt: new Date().toISOString(),
                }
              : p
          ),
        })),
    }),
    {
      name: 'workout-system-store',
      storage: createJSONStorage(() => asyncStorage),
    }
  )
)
