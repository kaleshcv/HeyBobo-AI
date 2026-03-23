import { create } from 'zustand'
import type { WorkoutExercise } from '@/types'

export interface PoseKeypoint {
  name: string
  x: number
  y: number
  score: number
}

interface LiveWorkoutState {
  isActive:          boolean
  currentExerciseIdx:number
  exercises:         WorkoutExercise[]
  elapsedSeconds:    number
  repCount:          number
  heartRate:         number | null
  poseKeypoints:     PoseKeypoint[]
  caloriesBurned:    number

  startWorkout:   (exercises: WorkoutExercise[]) => void
  stopWorkout:    () => void
  nextExercise:   () => void
  incrementRep:   () => void
  setHeartRate:   (bpm: number) => void
  setPose:        (keypoints: PoseKeypoint[]) => void
  tick:           () => void
}

export const useLiveWorkoutStore = create<LiveWorkoutState>((set, get) => ({
  isActive:          false,
  currentExerciseIdx:0,
  exercises:         [],
  elapsedSeconds:    0,
  repCount:          0,
  heartRate:         null,
  poseKeypoints:     [],
  caloriesBurned:    0,

  startWorkout: (exercises) => set({ exercises, isActive: true, currentExerciseIdx: 0, elapsedSeconds: 0, repCount: 0 }),

  stopWorkout: () => set({ isActive: false }),

  nextExercise: () => set((s) => ({
    currentExerciseIdx: Math.min(s.currentExerciseIdx + 1, s.exercises.length - 1),
    repCount: 0,
  })),

  incrementRep: () => set((s) => ({ repCount: s.repCount + 1 })),

  setHeartRate: (heartRate) => set({ heartRate }),

  setPose: (poseKeypoints) => set({ poseKeypoints }),

  tick: () => set((s) => ({
    elapsedSeconds: s.elapsedSeconds + 1,
    // rough calorie estimation: 0.1 cal/sec for moderate exercise
    caloriesBurned: Math.round((s.elapsedSeconds + 1) * 0.1),
  })),
}))
