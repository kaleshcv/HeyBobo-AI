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
  emoji: string
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
  isCustom?: boolean
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
  // ─── Strength ─────────────────────────────────────────────────────────────
  {
    id: 'e1', name: 'Barbell Bench Press', category: 'strength', emoji: '🏋️',
    muscles: ['chest', 'triceps', 'shoulders'], difficulty: 'intermediate',
    instructions: ['Lie flat on bench, grip bar shoulder-width apart', 'Lower bar slowly to mid-chest', 'Press bar up to full arm extension'],
    videoUrl: '', imageUrl: '', durationSeconds: null, defaultReps: 10, defaultSets: 4,
    equipmentNeeded: ['barbell', 'bench'],
  },
  {
    id: 'e2', name: 'Deadlift', category: 'strength', emoji: '🏋️',
    muscles: ['back', 'hamstrings', 'glutes'], difficulty: 'advanced',
    instructions: ['Stand with feet hip-width, bar over mid-foot', 'Hinge at hips, grip bar just outside legs', 'Drive through heels, keep back neutral, stand tall'],
    videoUrl: '', imageUrl: '', durationSeconds: null, defaultReps: 5, defaultSets: 5,
    equipmentNeeded: ['barbell'],
  },
  {
    id: 'e3', name: 'Barbell Squat', category: 'strength', emoji: '🏋️',
    muscles: ['quads', 'glutes', 'hamstrings'], difficulty: 'intermediate',
    instructions: ['Bar across upper traps, feet shoulder-width', 'Squat until thighs parallel to floor', 'Drive through heels to stand'],
    videoUrl: '', imageUrl: '', durationSeconds: null, defaultReps: 8, defaultSets: 4,
    equipmentNeeded: ['barbell', 'squat rack'],
  },
  {
    id: 'e4', name: 'Pull-ups', category: 'strength', emoji: '💪',
    muscles: ['back', 'biceps'], difficulty: 'intermediate',
    instructions: ['Hang from bar with overhand grip, shoulder-width', 'Pull chest to bar engaging lats', 'Lower with control to full hang'],
    videoUrl: '', imageUrl: '', durationSeconds: null, defaultReps: 8, defaultSets: 3,
    equipmentNeeded: ['pull-up bar'],
  },
  {
    id: 'e5', name: 'Dumbbell Shoulder Press', category: 'strength', emoji: '💪',
    muscles: ['shoulders', 'triceps'], difficulty: 'beginner',
    instructions: ['Hold dumbbells at shoulder height', 'Press overhead to full extension', 'Lower with control to start'],
    videoUrl: '', imageUrl: '', durationSeconds: null, defaultReps: 12, defaultSets: 3,
    equipmentNeeded: ['dumbbells'],
  },
  {
    id: 'e6', name: 'Push-ups', category: 'strength', emoji: '💪',
    muscles: ['chest', 'triceps', 'shoulders'], difficulty: 'beginner',
    instructions: ['Start in plank position, hands shoulder-width', 'Lower chest toward floor keeping body straight', 'Push back up to start'],
    videoUrl: '', imageUrl: '', durationSeconds: null, defaultReps: 15, defaultSets: 3,
    equipmentNeeded: [],
  },
  {
    id: 'e7', name: 'Barbell Row', category: 'strength', emoji: '🏋️',
    muscles: ['back', 'biceps', 'core'], difficulty: 'intermediate',
    instructions: ['Hinge forward 45°, grip bar shoulder-width', 'Row bar to lower chest, squeeze shoulder blades', 'Lower with control'],
    videoUrl: '', imageUrl: '', durationSeconds: null, defaultReps: 10, defaultSets: 4,
    equipmentNeeded: ['barbell'],
  },
  {
    id: 'e8', name: 'Dumbbell Lunges', category: 'strength', emoji: '💪',
    muscles: ['quads', 'glutes', 'hamstrings'], difficulty: 'beginner',
    instructions: ['Stand holding dumbbells at sides', 'Step forward into lunge, knee just above floor', 'Push back to start, alternate legs'],
    videoUrl: '', imageUrl: '', durationSeconds: null, defaultReps: 12, defaultSets: 3,
    equipmentNeeded: ['dumbbells'],
  },
  {
    id: 'e9', name: 'Dips', category: 'strength', emoji: '💪',
    muscles: ['chest', 'triceps', 'shoulders'], difficulty: 'intermediate',
    instructions: ['Grip parallel bars, arms straight', 'Lower until upper arms are parallel', 'Push back up to starting position'],
    videoUrl: '', imageUrl: '', durationSeconds: null, defaultReps: 10, defaultSets: 3,
    equipmentNeeded: ['dip bars'],
  },
  // ─── Cardio ───────────────────────────────────────────────────────────────
  {
    id: 'c1', name: 'Treadmill Run', category: 'cardio', emoji: '🏃',
    muscles: ['quads', 'hamstrings', 'calves'], difficulty: 'beginner',
    instructions: ['Set treadmill to comfortable pace', 'Maintain upright posture, relaxed arms', 'Breathe rhythmically'],
    videoUrl: '', imageUrl: '', durationSeconds: 1800, defaultReps: null, defaultSets: 1,
    equipmentNeeded: ['treadmill'],
  },
  {
    id: 'c2', name: 'Jump Rope', category: 'cardio', emoji: '🪢',
    muscles: ['calves', 'shoulders', 'core'], difficulty: 'beginner',
    instructions: ['Hold rope handles at hip level', 'Jump with both feet as rope passes underneath', 'Keep elbows close to body'],
    videoUrl: '', imageUrl: '', durationSeconds: 600, defaultReps: null, defaultSets: 3,
    equipmentNeeded: ['jump rope'],
  },
  {
    id: 'c3', name: 'Rowing Machine', category: 'cardio', emoji: '🚣',
    muscles: ['back', 'quads', 'core'], difficulty: 'intermediate',
    instructions: ['Sit on seat, feet strapped in, arms straight', 'Push through legs, lean back slightly, pull handle to chest', 'Reverse motion to return'],
    videoUrl: '', imageUrl: '', durationSeconds: 1200, defaultReps: null, defaultSets: 1,
    equipmentNeeded: ['rowing machine'],
  },
  {
    id: 'c4', name: 'Cycling', category: 'cardio', emoji: '🚴',
    muscles: ['quads', 'hamstrings', 'calves'], difficulty: 'beginner',
    instructions: ['Adjust seat to proper height', 'Maintain steady cadence', 'Keep core engaged'],
    videoUrl: '', imageUrl: '', durationSeconds: 1800, defaultReps: null, defaultSets: 1,
    equipmentNeeded: ['bike or stationary bike'],
  },
  // ─── Yoga ─────────────────────────────────────────────────────────────────
  {
    id: 'y1', name: 'Sun Salutation', category: 'yoga', emoji: '🧘',
    muscles: ['full-body'], difficulty: 'beginner',
    instructions: ['Stand in mountain pose, arms overhead', 'Forward fold, plank, cobra, downward dog', 'Step forward and rise to start'],
    videoUrl: '', imageUrl: '', durationSeconds: 300, defaultReps: null, defaultSets: 3,
    equipmentNeeded: ['yoga mat'],
  },
  {
    id: 'y2', name: 'Warrior Sequence', category: 'yoga', emoji: '🧘',
    muscles: ['quads', 'core', 'shoulders'], difficulty: 'beginner',
    instructions: ['Step into warrior I — front knee bent, arms overhead', 'Transition to warrior II — arms parallel to floor', 'Hold each pose for 5 breaths'],
    videoUrl: '', imageUrl: '', durationSeconds: 600, defaultReps: null, defaultSets: 2,
    equipmentNeeded: ['yoga mat'],
  },
  {
    id: 'y3', name: 'Tree Pose', category: 'yoga', emoji: '🌳',
    muscles: ['core', 'calves', 'quads'], difficulty: 'beginner',
    instructions: ['Stand tall, shift weight onto one foot', 'Place sole of other foot on inner thigh', 'Bring hands to prayer, hold steady'],
    videoUrl: '', imageUrl: '', durationSeconds: 120, defaultReps: null, defaultSets: 2,
    equipmentNeeded: [],
  },
  // ─── HIIT ─────────────────────────────────────────────────────────────────
  {
    id: 'h1', name: 'Burpees', category: 'hiit', emoji: '🔥',
    muscles: ['full-body'], difficulty: 'intermediate',
    instructions: ['Stand, drop to squat, kick feet to plank', 'Do a push-up, jump feet to hands', 'Explode upward with arms overhead'],
    videoUrl: '', imageUrl: '', durationSeconds: null, defaultReps: 10, defaultSets: 4,
    equipmentNeeded: [],
  },
  {
    id: 'h2', name: 'Mountain Climbers', category: 'hiit', emoji: '🔥',
    muscles: ['core', 'shoulders', 'quads'], difficulty: 'beginner',
    instructions: ['Start in high plank position', 'Drive knee toward chest alternately', 'Keep hips level, move at sprint pace'],
    videoUrl: '', imageUrl: '', durationSeconds: 30, defaultReps: null, defaultSets: 4,
    equipmentNeeded: [],
  },
  {
    id: 'h3', name: 'Box Jumps', category: 'hiit', emoji: '📦',
    muscles: ['quads', 'glutes', 'calves'], difficulty: 'intermediate',
    instructions: ['Stand facing box, feet hip-width', 'Bend knees, swing arms, jump explosively', 'Land softly on box, step down'],
    videoUrl: '', imageUrl: '', durationSeconds: null, defaultReps: 12, defaultSets: 3,
    equipmentNeeded: ['plyo box'],
  },
  {
    id: 'h4', name: 'Kettlebell Swings', category: 'hiit', emoji: '🏋️',
    muscles: ['glutes', 'hamstrings', 'core'], difficulty: 'intermediate',
    instructions: ['Hinge at hips, grip bell between legs', 'Drive hips forward, swing bell to shoulder height', 'Control descent, repeat fluidly'],
    videoUrl: '', imageUrl: '', durationSeconds: null, defaultReps: 15, defaultSets: 4,
    equipmentNeeded: ['kettlebell'],
  },
  // ─── Stretching ──────────────────────────────────────────────────────────
  {
    id: 's1', name: 'Hamstring Stretch', category: 'stretching', emoji: '🤸',
    muscles: ['hamstrings'], difficulty: 'beginner',
    instructions: ['Sit with legs straight in front', 'Reach toward toes keeping back flat', 'Hold 30 seconds each side'],
    videoUrl: '', imageUrl: '', durationSeconds: 60, defaultReps: null, defaultSets: 2,
    equipmentNeeded: [],
  },
  {
    id: 's2', name: 'Chest Stretch', category: 'stretching', emoji: '🤸',
    muscles: ['chest', 'shoulders'], difficulty: 'beginner',
    instructions: ['Stand in doorway, arms at 90°', 'Lean gently forward until chest opens', 'Hold 30 seconds'],
    videoUrl: '', imageUrl: '', durationSeconds: 60, defaultReps: null, defaultSets: 2,
    equipmentNeeded: [],
  },
  {
    id: 's3', name: 'Quad Stretch', category: 'stretching', emoji: '🤸',
    muscles: ['quads', 'hip-flexors'], difficulty: 'beginner',
    instructions: ['Stand on one leg, bend other knee behind you', 'Grip ankle, pull heel toward glutes', 'Hold 30 seconds, switch sides'],
    videoUrl: '', imageUrl: '', durationSeconds: 60, defaultReps: null, defaultSets: 2,
    equipmentNeeded: [],
  },
  {
    id: 's4', name: "World's Greatest Stretch", category: 'stretching', emoji: '🤸',
    muscles: ['quads', 'hip-flexors', 'back', 'shoulders'], difficulty: 'intermediate',
    instructions: ['Lunge forward, place same-side hand inside foot', 'Rotate upper body, reach arm to ceiling', 'Hold 2 breaths, repeat other side'],
    videoUrl: '', imageUrl: '', durationSeconds: 90, defaultReps: null, defaultSets: 2,
    equipmentNeeded: [],
  },
  // ─── Mobility ─────────────────────────────────────────────────────────────
  {
    id: 'm1', name: 'Hip 90/90', category: 'mobility', emoji: '🦵',
    muscles: ['hip-flexors', 'glutes'], difficulty: 'beginner',
    instructions: ['Sit with front leg at 90°, rear leg at 90°', 'Keep torso tall, rotate between sides', 'Spend 60 seconds per side'],
    videoUrl: '', imageUrl: '', durationSeconds: 120, defaultReps: null, defaultSets: 3,
    equipmentNeeded: [],
  },
  {
    id: 'm2', name: 'Cat-Cow', category: 'mobility', emoji: '🐱',
    muscles: ['back', 'core'], difficulty: 'beginner',
    instructions: ['On hands and knees, wrists under shoulders', 'Inhale — arch back, lift head (cow)', 'Exhale — round spine, tuck chin (cat)'],
    videoUrl: '', imageUrl: '', durationSeconds: 60, defaultReps: null, defaultSets: 2,
    equipmentNeeded: ['yoga mat'],
  },
  {
    id: 'm3', name: 'Shoulder Dislocates', category: 'mobility', emoji: '🔄',
    muscles: ['shoulders', 'chest'], difficulty: 'beginner',
    instructions: ['Hold band or dowel wide overhead', 'Pass over head to behind back in slow arc', 'Gradually reduce grip width over sessions'],
    videoUrl: '', imageUrl: '', durationSeconds: 60, defaultReps: null, defaultSets: 3,
    equipmentNeeded: ['resistance band'],
  },
]

export const PRESET_PLANS: WorkoutPlan[] = [
  {
    id: 'preset-1', name: 'Beginner Full Body', description: 'Perfect start for new gym-goers',
    goal: 'muscle-gain', difficulty: 'beginner', daysPerWeek: 3,
    weeklySchedule: {
      Monday:    [{ exerciseId: 'e6', sets: 3, reps: 12, durationSeconds: null, restSeconds: 60 }, { exerciseId: 'e8', sets: 3, reps: 12, durationSeconds: null, restSeconds: 60 }],
      Wednesday: [{ exerciseId: 'e4', sets: 3, reps: 8, durationSeconds: null, restSeconds: 90 }, { exerciseId: 'c1', sets: 1, reps: null, durationSeconds: 1200, restSeconds: 0 }],
      Friday:    [{ exerciseId: 'e6', sets: 3, reps: 15, durationSeconds: null, restSeconds: 60 }, { exerciseId: 'e5', sets: 3, reps: 12, durationSeconds: null, restSeconds: 60 }],
    },
    createdAt: new Date().toISOString(), lastUsedAt: null, completedSessions: 0,
  },
  {
    id: 'preset-2', name: 'Fat Loss HIIT', description: 'High intensity cardio to burn maximum calories',
    goal: 'fat-loss', difficulty: 'intermediate', daysPerWeek: 4,
    weeklySchedule: {
      Monday:    [{ exerciseId: 'h1', sets: 4, reps: 10, durationSeconds: null, restSeconds: 90 }, { exerciseId: 'h2', sets: 4, reps: null, durationSeconds: 30, restSeconds: 30 }],
      Tuesday:   [{ exerciseId: 'c2', sets: 3, reps: null, durationSeconds: 600, restSeconds: 60 }],
      Thursday:  [{ exerciseId: 'h3', sets: 3, reps: 12, durationSeconds: null, restSeconds: 120 }, { exerciseId: 'h4', sets: 4, reps: 15, durationSeconds: null, restSeconds: 60 }],
      Saturday:  [{ exerciseId: 'c3', sets: 1, reps: null, durationSeconds: 1200, restSeconds: 0 }],
    },
    createdAt: new Date().toISOString(), lastUsedAt: null, completedSessions: 0,
  },
  {
    id: 'preset-3', name: 'Power Strength', description: 'Build serious strength with compound lifts',
    goal: 'muscle-gain', difficulty: 'advanced', daysPerWeek: 4,
    weeklySchedule: {
      Monday:    [{ exerciseId: 'e1', sets: 5, reps: 5, durationSeconds: null, restSeconds: 180 }, { exerciseId: 'e7', sets: 4, reps: 8, durationSeconds: null, restSeconds: 120 }],
      Wednesday: [{ exerciseId: 'e3', sets: 5, reps: 5, durationSeconds: null, restSeconds: 180 }, { exerciseId: 'e9', sets: 4, reps: 10, durationSeconds: null, restSeconds: 120 }],
      Friday:    [{ exerciseId: 'e2', sets: 5, reps: 5, durationSeconds: null, restSeconds: 180 }, { exerciseId: 'e4', sets: 4, reps: 8, durationSeconds: null, restSeconds: 120 }],
      Saturday:  [{ exerciseId: 'e5', sets: 4, reps: 12, durationSeconds: null, restSeconds: 90 }, { exerciseId: 'e8', sets: 3, reps: 12, durationSeconds: null, restSeconds: 60 }],
    },
    createdAt: new Date().toISOString(), lastUsedAt: null, completedSessions: 0,
  },
  {
    id: 'preset-4', name: 'Yoga & Flexibility', description: 'Improve flexibility, balance and mindfulness',
    goal: 'flexibility', difficulty: 'beginner', daysPerWeek: 5,
    weeklySchedule: {
      Monday:    [{ exerciseId: 'y1', sets: 3, reps: null, durationSeconds: 300, restSeconds: 30 }],
      Tuesday:   [{ exerciseId: 's1', sets: 2, reps: null, durationSeconds: 60, restSeconds: 20 }, { exerciseId: 's2', sets: 2, reps: null, durationSeconds: 60, restSeconds: 20 }],
      Wednesday: [{ exerciseId: 'y2', sets: 2, reps: null, durationSeconds: 600, restSeconds: 60 }],
      Thursday:  [{ exerciseId: 'm1', sets: 3, reps: null, durationSeconds: 120, restSeconds: 30 }, { exerciseId: 'm2', sets: 2, reps: null, durationSeconds: 60, restSeconds: 30 }],
      Friday:    [{ exerciseId: 'y3', sets: 2, reps: null, durationSeconds: 120, restSeconds: 30 }, { exerciseId: 's4', sets: 2, reps: null, durationSeconds: 90, restSeconds: 30 }],
    },
    createdAt: new Date().toISOString(), lastUsedAt: null, completedSessions: 0,
  },
]

export const useWorkoutSystemStore = create<WorkoutSystemState>()(
  persist(
    (set) => ({
      plans: [],
      activePlanId: null,
      exerciseHistory: {},

      addPlan: (plan) =>
        set((s) => ({ plans: [...s.plans, plan], activePlanId: plan.id })),

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
              ? { ...p, completedSessions: p.completedSessions + 1, lastUsedAt: new Date().toISOString() }
              : p
          ),
        })),
    }),
    { name: 'workout-system-store', storage: createJSONStorage(() => asyncStorage) }
  )
)
