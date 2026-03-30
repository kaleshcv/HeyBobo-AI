import { create } from 'zustand'
import { getUserScopedKey } from '@/lib/userStorage'
import { syncWorkoutSession } from './fitnessSyncService'

// ─── Types ──────────────────────────────────────────────
export type ExerciseCategory = 'strength' | 'cardio' | 'yoga' | 'hiit' | 'stretching' | 'mobility'
export type MuscleGroup =
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'core'
  | 'quads' | 'hamstrings' | 'glutes' | 'calves' | 'full-body' | 'hip-flexors'
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
  durationSeconds: number | null   // null = rep-based
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
  durationWeeks: number
  daysPerWeek: number
  workoutsPerDay: WorkoutExercise[][]  // array of day routines
  isAdaptive: boolean
  tags: string[]
}

export interface CustomWorkout {
  id: string
  name: string
  description: string
  exercises: WorkoutExercise[]
  createdAt: string
  lastUsedAt: string | null
  timesUsed: number
}

export interface WorkoutLog {
  id: string
  date: string
  workoutName: string
  exercises: { exerciseId: string; sets: number; reps: number; note: string }[]
  durationMinutes: number
  feeling: 'great' | 'good' | 'okay' | 'tired' | 'exhausted'
  createdAt: string
}

// ─── Exercise Database (Seed) ───────────────────────────
export const EXERCISE_DATABASE: Exercise[] = [
  // STRENGTH
  { id: 'ex-1', name: 'Barbell Bench Press', category: 'strength', muscles: ['chest', 'triceps', 'shoulders'], difficulty: 'intermediate', instructions: ['Lie flat on bench', 'Grip bar slightly wider than shoulder width', 'Lower bar to mid-chest', 'Press up to full extension'], videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg', imageUrl: '', durationSeconds: null, defaultReps: 10, defaultSets: 4, equipmentNeeded: ['barbell', 'bench'] },
  { id: 'ex-2', name: 'Deadlift', category: 'strength', muscles: ['back', 'hamstrings', 'glutes', 'core'], difficulty: 'advanced', instructions: ['Stand with feet hip-width apart', 'Grip bar just outside knees', 'Keep back flat, chest up', 'Drive through heels to stand', 'Lock out hips at top'], videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q', imageUrl: '', durationSeconds: null, defaultReps: 5, defaultSets: 5, equipmentNeeded: ['barbell'] },
  { id: 'ex-3', name: 'Barbell Squat', category: 'strength', muscles: ['quads', 'glutes', 'hamstrings', 'core'], difficulty: 'intermediate', instructions: ['Bar on upper back', 'Feet shoulder-width apart', 'Squat until thighs parallel', 'Drive up through heels'], videoUrl: 'https://www.youtube.com/watch?v=ultWZbUMPL8', imageUrl: '', durationSeconds: null, defaultReps: 8, defaultSets: 4, equipmentNeeded: ['barbell', 'squat rack'] },
  { id: 'ex-4', name: 'Pull-ups', category: 'strength', muscles: ['back', 'biceps'], difficulty: 'intermediate', instructions: ['Hang from bar with overhand grip', 'Pull chin above bar', 'Lower with control'], videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g', imageUrl: '', durationSeconds: null, defaultReps: 8, defaultSets: 3, equipmentNeeded: ['pull-up bar'] },
  { id: 'ex-5', name: 'Dumbbell Shoulder Press', category: 'strength', muscles: ['shoulders', 'triceps'], difficulty: 'beginner', instructions: ['Sit or stand with dumbbells at shoulder height', 'Press up overhead', 'Lower with control'], videoUrl: 'https://www.youtube.com/watch?v=qEwKCR5JCog', imageUrl: '', durationSeconds: null, defaultReps: 12, defaultSets: 3, equipmentNeeded: ['dumbbells'] },
  { id: 'ex-6', name: 'Push-ups', category: 'strength', muscles: ['chest', 'triceps', 'shoulders', 'core'], difficulty: 'beginner', instructions: ['Hands shoulder-width apart', 'Body in straight line', 'Lower chest to floor', 'Push back up'], videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4', imageUrl: '', durationSeconds: null, defaultReps: 15, defaultSets: 3, equipmentNeeded: [] },
  { id: 'ex-7', name: 'Barbell Row', category: 'strength', muscles: ['back', 'biceps', 'core'], difficulty: 'intermediate', instructions: ['Bend at hips, back flat', 'Pull bar to lower chest', 'Squeeze shoulder blades', 'Lower with control'], videoUrl: 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ', imageUrl: '', durationSeconds: null, defaultReps: 10, defaultSets: 4, equipmentNeeded: ['barbell'] },
  { id: 'ex-8', name: 'Dumbbell Lunges', category: 'strength', muscles: ['quads', 'glutes', 'hamstrings'], difficulty: 'beginner', instructions: ['Hold dumbbells at sides', 'Step forward into lunge', 'Lower back knee toward floor', 'Push back to start'], videoUrl: 'https://www.youtube.com/watch?v=D7KaRcUTQeE', imageUrl: '', durationSeconds: null, defaultReps: 12, defaultSets: 3, equipmentNeeded: ['dumbbells'] },

  // CARDIO
  { id: 'ex-9', name: 'Treadmill Run', category: 'cardio', muscles: ['quads', 'hamstrings', 'calves', 'core'], difficulty: 'beginner', instructions: ['Set comfortable pace', 'Maintain upright posture', 'Land midfoot', 'Swing arms naturally'], videoUrl: 'https://www.youtube.com/watch?v=8_HbVpCVGPw', imageUrl: '', durationSeconds: 1800, defaultReps: null, defaultSets: 1, equipmentNeeded: ['treadmill'] },
  { id: 'ex-10', name: 'Jump Rope', category: 'cardio', muscles: ['calves', 'shoulders', 'core'], difficulty: 'beginner', instructions: ['Hold handles at hip height', 'Use wrist to turn rope', 'Jump just high enough to clear', 'Land softly on balls of feet'], videoUrl: 'https://www.youtube.com/watch?v=FJmRQ5iTXKE', imageUrl: '', durationSeconds: 600, defaultReps: null, defaultSets: 3, equipmentNeeded: ['jump rope'] },
  { id: 'ex-11', name: 'Rowing Machine', category: 'cardio', muscles: ['back', 'quads', 'core', 'biceps'], difficulty: 'intermediate', instructions: ['Sit with feet strapped in', 'Drive with legs first', 'Pull handle to lower ribs', 'Return arms, then body, then legs'], videoUrl: 'https://www.youtube.com/watch?v=EqfRJDP1PSM', imageUrl: '', durationSeconds: 1200, defaultReps: null, defaultSets: 1, equipmentNeeded: ['rowing machine'] },
  { id: 'ex-12', name: 'Cycling', category: 'cardio', muscles: ['quads', 'hamstrings', 'calves', 'glutes'], difficulty: 'beginner', instructions: ['Adjust seat height', 'Keep cadence 70-90 RPM', 'Maintain steady effort', 'Keep core engaged'], videoUrl: 'https://www.youtube.com/watch?v=gW1uisn0M7A', imageUrl: '', durationSeconds: 1800, defaultReps: null, defaultSets: 1, equipmentNeeded: ['stationary bike'] },

  // YOGA
  { id: 'ex-13', name: 'Sun Salutation', category: 'yoga', muscles: ['full-body'], difficulty: 'beginner', instructions: ['Mountain pose', 'Forward fold', 'Half lift', 'Plank', 'Chaturanga', 'Upward dog', 'Downward dog', 'Step forward, fold, rise'], videoUrl: 'https://www.youtube.com/watch?v=73sjOu0g58M', imageUrl: '', durationSeconds: 300, defaultReps: null, defaultSets: 3, equipmentNeeded: ['yoga mat'] },
  { id: 'ex-14', name: 'Warrior Sequence', category: 'yoga', muscles: ['quads', 'core', 'shoulders', 'hip-flexors'], difficulty: 'beginner', instructions: ['Warrior I: front knee bent, arms up', 'Warrior II: arms parallel to ground', 'Warrior III: balance on one leg'], videoUrl: 'https://www.youtube.com/watch?v=k4qaVoAbeHM', imageUrl: '', durationSeconds: 600, defaultReps: null, defaultSets: 2, equipmentNeeded: ['yoga mat'] },
  { id: 'ex-15', name: 'Tree Pose', category: 'yoga', muscles: ['core', 'calves', 'quads'], difficulty: 'beginner', instructions: ['Stand on one leg', 'Place other foot on inner thigh', 'Hands at heart or overhead', 'Hold 30-60 seconds each side'], videoUrl: 'https://www.youtube.com/watch?v=wdln9qWYloU', imageUrl: '', durationSeconds: 120, defaultReps: null, defaultSets: 2, equipmentNeeded: ['yoga mat'] },

  // HIIT
  { id: 'ex-16', name: 'Burpees', category: 'hiit', muscles: ['full-body'], difficulty: 'intermediate', instructions: ['Stand tall', 'Drop to push-up', 'Perform push-up', 'Jump feet to hands', 'Jump up with arms overhead'], videoUrl: 'https://www.youtube.com/watch?v=auBLPXO8Fww', imageUrl: '', durationSeconds: null, defaultReps: 10, defaultSets: 4, equipmentNeeded: [] },
  { id: 'ex-17', name: 'Mountain Climbers', category: 'hiit', muscles: ['core', 'shoulders', 'quads'], difficulty: 'beginner', instructions: ['Start in plank position', 'Drive knees to chest alternately', 'Keep hips level', 'Move as fast as possible'], videoUrl: 'https://www.youtube.com/watch?v=nmwgirgXLYM', imageUrl: '', durationSeconds: 30, defaultReps: null, defaultSets: 4, equipmentNeeded: [] },
  { id: 'ex-18', name: 'Box Jumps', category: 'hiit', muscles: ['quads', 'glutes', 'calves'], difficulty: 'intermediate', instructions: ['Stand facing box', 'Swing arms and jump onto box', 'Land softly with both feet', 'Step down and repeat'], videoUrl: 'https://www.youtube.com/watch?v=52r_Ul5k03g', imageUrl: '', durationSeconds: null, defaultReps: 12, defaultSets: 3, equipmentNeeded: ['plyo box'] },
  { id: 'ex-19', name: 'Kettlebell Swings', category: 'hiit', muscles: ['glutes', 'hamstrings', 'core', 'shoulders'], difficulty: 'intermediate', instructions: ['Feet shoulder-width apart', 'Hinge at hips', 'Swing kettlebell between legs', 'Drive hips forward to swing up to shoulder height'], videoUrl: 'https://www.youtube.com/watch?v=YSxHifyI6s8', imageUrl: '', durationSeconds: null, defaultReps: 15, defaultSets: 4, equipmentNeeded: ['kettlebell'] },

  // STRETCHING
  { id: 'ex-20', name: 'Hamstring Stretch', category: 'stretching', muscles: ['hamstrings'], difficulty: 'beginner', instructions: ['Sit on floor, legs extended', 'Reach toward toes', 'Hold for 30 seconds', 'Keep back straight'], videoUrl: 'https://www.youtube.com/watch?v=FDwpEdxZ4H4', imageUrl: '', durationSeconds: 60, defaultReps: null, defaultSets: 2, equipmentNeeded: [] },
  { id: 'ex-21', name: 'Chest Stretch', category: 'stretching', muscles: ['chest', 'shoulders'], difficulty: 'beginner', instructions: ['Stand in doorway', 'Arms on frame at 90 degrees', 'Lean forward gently', 'Hold 30 seconds'], videoUrl: 'https://www.youtube.com/watch?v=g-7ZWPCWv0U', imageUrl: '', durationSeconds: 60, defaultReps: null, defaultSets: 2, equipmentNeeded: [] },
  { id: 'ex-22', name: 'Quad Stretch', category: 'stretching', muscles: ['quads', 'hip-flexors'], difficulty: 'beginner', instructions: ['Stand on one leg', 'Pull heel to glute', 'Keep knees together', 'Hold 30 seconds each side'], videoUrl: 'https://www.youtube.com/watch?v=zfKSrhvEWpI', imageUrl: '', durationSeconds: 60, defaultReps: null, defaultSets: 2, equipmentNeeded: [] },

  // MOBILITY
  { id: 'ex-23', name: 'Hip 90/90', category: 'mobility', muscles: ['hip-flexors', 'glutes'], difficulty: 'beginner', instructions: ['Sit with both legs at 90 degrees', 'Rotate from one side to other', 'Keep torso upright', 'Move slowly through range'], videoUrl: 'https://www.youtube.com/watch?v=lbozu0DPcYI', imageUrl: '', durationSeconds: 120, defaultReps: null, defaultSets: 3, equipmentNeeded: [] },
  { id: 'ex-24', name: 'Cat-Cow', category: 'mobility', muscles: ['back', 'core'], difficulty: 'beginner', instructions: ['Hands and knees position', 'Arch back (cow), look up', 'Round back (cat), chin to chest', 'Alternate slowly with breath'], videoUrl: 'https://www.youtube.com/watch?v=kqnua4rHVVA', imageUrl: '', durationSeconds: 120, defaultReps: null, defaultSets: 2, equipmentNeeded: ['yoga mat'] },
  { id: 'ex-25', name: 'Shoulder Dislocates', category: 'mobility', muscles: ['shoulders', 'chest'], difficulty: 'beginner', instructions: ['Hold band or stick wide', 'Raise overhead, rotate behind back', 'Return over head', 'Go slowly, widen grip if needed'], videoUrl: 'https://www.youtube.com/watch?v=02HdChcpyBs', imageUrl: '', durationSeconds: 90, defaultReps: null, defaultSets: 3, equipmentNeeded: ['resistance band'] },
  { id: 'ex-26', name: 'World\'s Greatest Stretch', category: 'mobility', muscles: ['hip-flexors', 'hamstrings', 'back', 'shoulders'], difficulty: 'intermediate', instructions: ['Lunge forward', 'Place opposite hand on floor', 'Rotate and reach to sky', 'Hold briefly, switch sides'], videoUrl: 'https://www.youtube.com/watch?v=p2sXGBByqJ0', imageUrl: '', durationSeconds: 180, defaultReps: null, defaultSets: 2, equipmentNeeded: [] },
]

// ─── Preset Workout Plans ───────────────────────────────
export const PRESET_PLANS: WorkoutPlan[] = [
  {
    id: 'plan-1',
    name: '8-Week Fat Burner',
    description: 'High-intensity circuit training combined with steady-state cardio to maximize fat loss while preserving muscle.',
    goal: 'fat-loss',
    difficulty: 'intermediate',
    durationWeeks: 8,
    daysPerWeek: 5,
    isAdaptive: true,
    tags: ['HIIT', 'Cardio', 'Circuit'],
    workoutsPerDay: [
      [{ exerciseId: 'ex-16', sets: 4, reps: 10, durationSeconds: null, restSeconds: 30 }, { exerciseId: 'ex-17', sets: 4, reps: null, durationSeconds: 30, restSeconds: 20 }, { exerciseId: 'ex-19', sets: 4, reps: 15, durationSeconds: null, restSeconds: 30 }, { exerciseId: 'ex-10', sets: 3, reps: null, durationSeconds: 120, restSeconds: 60 }],
      [{ exerciseId: 'ex-9', sets: 1, reps: null, durationSeconds: 1800, restSeconds: 0 }],
      [{ exerciseId: 'ex-3', sets: 4, reps: 12, durationSeconds: null, restSeconds: 45 }, { exerciseId: 'ex-6', sets: 3, reps: 15, durationSeconds: null, restSeconds: 30 }, { exerciseId: 'ex-18', sets: 3, reps: 12, durationSeconds: null, restSeconds: 30 }, { exerciseId: 'ex-8', sets: 3, reps: 12, durationSeconds: null, restSeconds: 30 }],
    ],
  },
  {
    id: 'plan-2',
    name: '12-Week Muscle Builder',
    description: 'Progressive overload program focusing on compound movements to build lean muscle mass across all major muscle groups.',
    goal: 'muscle-gain',
    difficulty: 'intermediate',
    durationWeeks: 12,
    daysPerWeek: 4,
    isAdaptive: true,
    tags: ['Strength', 'Hypertrophy', 'Compound'],
    workoutsPerDay: [
      [{ exerciseId: 'ex-1', sets: 4, reps: 8, durationSeconds: null, restSeconds: 90 }, { exerciseId: 'ex-5', sets: 3, reps: 10, durationSeconds: null, restSeconds: 60 }, { exerciseId: 'ex-6', sets: 3, reps: 15, durationSeconds: null, restSeconds: 45 }],
      [{ exerciseId: 'ex-3', sets: 5, reps: 5, durationSeconds: null, restSeconds: 120 }, { exerciseId: 'ex-8', sets: 3, reps: 12, durationSeconds: null, restSeconds: 60 }],
      [{ exerciseId: 'ex-2', sets: 5, reps: 5, durationSeconds: null, restSeconds: 120 }, { exerciseId: 'ex-7', sets: 4, reps: 10, durationSeconds: null, restSeconds: 60 }, { exerciseId: 'ex-4', sets: 3, reps: 8, durationSeconds: null, restSeconds: 60 }],
    ],
  },
  {
    id: 'plan-3',
    name: '6-Week Flexibility Flow',
    description: 'Yoga and stretching program designed to improve flexibility, reduce stiffness, and enhance range of motion.',
    goal: 'flexibility',
    difficulty: 'beginner',
    durationWeeks: 6,
    daysPerWeek: 5,
    isAdaptive: false,
    tags: ['Yoga', 'Stretching', 'Recovery'],
    workoutsPerDay: [
      [{ exerciseId: 'ex-13', sets: 3, reps: null, durationSeconds: 300, restSeconds: 30 }, { exerciseId: 'ex-14', sets: 2, reps: null, durationSeconds: 600, restSeconds: 30 }, { exerciseId: 'ex-15', sets: 2, reps: null, durationSeconds: 120, restSeconds: 15 }],
      [{ exerciseId: 'ex-20', sets: 2, reps: null, durationSeconds: 60, restSeconds: 15 }, { exerciseId: 'ex-21', sets: 2, reps: null, durationSeconds: 60, restSeconds: 15 }, { exerciseId: 'ex-22', sets: 2, reps: null, durationSeconds: 60, restSeconds: 15 }, { exerciseId: 'ex-24', sets: 2, reps: null, durationSeconds: 120, restSeconds: 15 }],
    ],
  },
  {
    id: 'plan-4',
    name: '10-Week Athletic Edge',
    description: 'Explosive power, agility, and endurance program for athletes looking to elevate their performance.',
    goal: 'athletic-performance',
    difficulty: 'advanced',
    durationWeeks: 10,
    daysPerWeek: 5,
    isAdaptive: true,
    tags: ['Power', 'Agility', 'Endurance'],
    workoutsPerDay: [
      [{ exerciseId: 'ex-3', sets: 5, reps: 5, durationSeconds: null, restSeconds: 120 }, { exerciseId: 'ex-18', sets: 4, reps: 10, durationSeconds: null, restSeconds: 60 }, { exerciseId: 'ex-19', sets: 4, reps: 15, durationSeconds: null, restSeconds: 45 }],
      [{ exerciseId: 'ex-9', sets: 1, reps: null, durationSeconds: 1200, restSeconds: 0 }, { exerciseId: 'ex-11', sets: 1, reps: null, durationSeconds: 1200, restSeconds: 0 }],
      [{ exerciseId: 'ex-2', sets: 5, reps: 3, durationSeconds: null, restSeconds: 180 }, { exerciseId: 'ex-16', sets: 4, reps: 8, durationSeconds: null, restSeconds: 45 }, { exerciseId: 'ex-26', sets: 2, reps: null, durationSeconds: 180, restSeconds: 30 }],
    ],
  },
]

// ─── Category & Goal Meta ───────────────────────────────
export const CATEGORY_META: Record<ExerciseCategory, { label: string; emoji: string; color: string }> = {
  strength: { label: 'Strength', emoji: '🏋️', color: '#42a5f5' },
  cardio: { label: 'Cardio', emoji: '🫀', color: '#ef5350' },
  yoga: { label: 'Yoga', emoji: '🧘', color: '#ab47bc' },
  hiit: { label: 'HIIT', emoji: '⚡', color: '#ffa726' },
  stretching: { label: 'Stretching', emoji: '🤸', color: '#66bb6a' },
  mobility: { label: 'Mobility', emoji: '🔄', color: '#26c6da' },
}

export const GOAL_META: Record<PlanGoal, { label: string; emoji: string; color: string }> = {
  'fat-loss': { label: 'Fat Loss', emoji: '🔥', color: '#ef5350' },
  'muscle-gain': { label: 'Muscle Gain', emoji: '💪', color: '#42a5f5' },
  'flexibility': { label: 'Flexibility', emoji: '🧘', color: '#ab47bc' },
  'athletic-performance': { label: 'Athletic Performance', emoji: '🏅', color: '#ffa726' },
}

export const DIFFICULTY_META: Record<DifficultyLevel, { label: string; color: string }> = {
  beginner: { label: 'Beginner', color: '#66bb6a' },
  intermediate: { label: 'Intermediate', color: '#ffa726' },
  advanced: { label: 'Advanced', color: '#ef5350' },
}

export const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: 'Chest', back: 'Back', shoulders: 'Shoulders', biceps: 'Biceps',
  triceps: 'Triceps', core: 'Core', quads: 'Quads', hamstrings: 'Hamstrings',
  glutes: 'Glutes', calves: 'Calves', 'full-body': 'Full Body', 'hip-flexors': 'Hip Flexors',
}

// ─── Store ──────────────────────────────────────────────
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function loadState(): { customWorkouts: CustomWorkout[]; activePlanId: string | null; workoutLogs: WorkoutLog[] } {
  try {
    const raw = localStorage.getItem(getUserScopedKey('heybobo_workout_system'))
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { customWorkouts: [], activePlanId: null, workoutLogs: [] }
}

function persist(state: { customWorkouts: CustomWorkout[]; activePlanId: string | null; workoutLogs: WorkoutLog[] }) {
  localStorage.setItem(getUserScopedKey('heybobo_workout_system'), JSON.stringify(state))
}

interface WorkoutSystemState {
  customWorkouts: CustomWorkout[]
  activePlanId: string | null
  workoutLogs: WorkoutLog[]

  createCustomWorkout: (name: string, description: string, exercises: WorkoutExercise[]) => void
  deleteCustomWorkout: (id: string) => void
  updateCustomWorkout: (id: string, partial: Partial<Pick<CustomWorkout, 'name' | 'description' | 'exercises'>>) => void
  useCustomWorkout: (id: string) => void

  setActivePlan: (planId: string | null) => void

  logWorkout: (log: Omit<WorkoutLog, 'id' | 'createdAt'>) => void
  clearLogs: () => void

  getExercise: (id: string) => Exercise | undefined
  getExercisesByCategory: (category: ExerciseCategory) => Exercise[]
}

export const useWorkoutSystemStore = create<WorkoutSystemState>((set, get) => {
  const saved = loadState()

  return {
    ...saved,

    createCustomWorkout: (name, description, exercises) => {
      const workout: CustomWorkout = {
        id: generateId(),
        name,
        description,
        exercises,
        createdAt: new Date().toISOString(),
        lastUsedAt: null,
        timesUsed: 0,
      }
      const customWorkouts = [workout, ...get().customWorkouts]
      set({ customWorkouts })
      persist({ ...get(), customWorkouts })
    },

    deleteCustomWorkout: (id) => {
      const customWorkouts = get().customWorkouts.filter((w) => w.id !== id)
      set({ customWorkouts })
      persist({ ...get(), customWorkouts })
    },

    updateCustomWorkout: (id, partial) => {
      const customWorkouts = get().customWorkouts.map((w) => (w.id === id ? { ...w, ...partial } : w))
      set({ customWorkouts })
      persist({ ...get(), customWorkouts })
    },

    useCustomWorkout: (id) => {
      const customWorkouts = get().customWorkouts.map((w) =>
        w.id === id ? { ...w, lastUsedAt: new Date().toISOString(), timesUsed: w.timesUsed + 1 } : w,
      )
      set({ customWorkouts })
      persist({ ...get(), customWorkouts })
    },

    setActivePlan: (planId) => {
      set({ activePlanId: planId })
      persist({ ...get(), activePlanId: planId })
    },

    logWorkout: (log) => {
      const entry: WorkoutLog = { ...log, id: generateId(), createdAt: new Date().toISOString() }
      const workoutLogs = [entry, ...get().workoutLogs]
      set({ workoutLogs })
      persist({ ...get(), workoutLogs })
      // Sync to backend
      syncWorkoutSession({
        name: log.workoutName,
        startedAt: entry.createdAt,
        durationSeconds: log.durationMinutes * 60,
        source: 'workout_plan',
        category: 'strength',
        exercises: log.exercises.map((e) => ({
          exerciseId: e.exerciseId,
          sets: e.sets,
          reps: e.reps,
          note: e.note,
        })),
      })
    },

    clearLogs: () => {
      set({ workoutLogs: [] })
      persist({ ...get(), workoutLogs: [] })
    },

    getExercise: (id) => EXERCISE_DATABASE.find((e) => e.id === id),

    getExercisesByCategory: (category) => EXERCISE_DATABASE.filter((e) => e.category === category),
  }
})
