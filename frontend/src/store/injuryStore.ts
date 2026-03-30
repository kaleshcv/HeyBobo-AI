import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createUserStorage } from '@/lib/userStorage';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const genId = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

// ─── Types ────────────────────────────────────────────────────────────────────
export type InjuryType =
  | 'muscle-strain'
  | 'ligament-sprain'
  | 'fracture'
  | 'joint-pain'
  | 'tendinitis'
  | 'bruise'
  | 'nerve-pain'
  | 'posture-related'
  | 'overuse'
  | 'other';

export type BodyPart =
  | 'head'
  | 'neck'
  | 'shoulder-left'
  | 'shoulder-right'
  | 'upper-back'
  | 'lower-back'
  | 'chest'
  | 'elbow-left'
  | 'elbow-right'
  | 'wrist-left'
  | 'wrist-right'
  | 'hip-left'
  | 'hip-right'
  | 'knee-left'
  | 'knee-right'
  | 'ankle-left'
  | 'ankle-right'
  | 'foot-left'
  | 'foot-right'
  | 'abdomen'
  | 'hamstring-left'
  | 'hamstring-right'
  | 'calf-left'
  | 'calf-right';

export type Severity = 'mild' | 'moderate' | 'severe';
export type InjuryStatus = 'active' | 'recovering' | 'healed' | 'chronic';

export interface Injury {
  id: string;
  name: string;
  type: InjuryType;
  bodyPart: BodyPart;
  severity: Severity;
  painScale: number; // 1–10
  dateOfOccurrence: string;
  cause: string;
  status: InjuryStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyPainLog {
  id: string;
  injuryId: string;
  date: string; // YYYY-MM-DD
  painLevel: number; // 1–10
  stiffness: number; // 1–10
  mobilityLevel: number; // 1–10 (10 = full mobility)
  mood: number; // 1–5
  notes: string;
  createdAt: string;
}

export type RehabCategory =
  | 'stretching'
  | 'strengthening'
  | 'mobility'
  | 'balance'
  | 'cardio'
  | 'breathing';

export interface RehabExercise {
  id: string;
  name: string;
  category: RehabCategory;
  description: string;
  sets?: number;
  reps?: number;
  durationSeconds?: number;
  safeFor: BodyPart[];
  avoidFor: BodyPart[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  videoUrl?: string;
  imageUrl?: string;
}

export interface RehabProgram {
  id: string;
  injuryId: string;
  name: string;
  startDate: string;
  endDate?: string;
  exerciseIds: string[];
  frequency: string; // e.g. "3x per week"
  notes: string;
  completedSessions: string[]; // ISO date strings
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
}

export interface RecoveryMilestone {
  id: string;
  injuryId: string;
  title: string;
  description: string;
  achievedAt: string;
  icon: string;
}

export type MedicalDocType = 'prescription' | 'scan' | 'report' | 'referral' | 'other';

export interface MedicalDocument {
  id: string;
  injuryId: string;
  title: string;
  type: MedicalDocType;
  fileName: string;
  previewUrl?: string; // base64 or blob URL
  uploadedAt: string;
  notes: string;
}

export interface WorkoutAdaptation {
  id: string;
  injuryId: string;
  originalExercise: string;
  adaptedExercise: string;
  reason: string;
  createdAt: string;
}

export interface DietRecommendation {
  id: string;
  category: 'anti-inflammatory' | 'protein' | 'vitamin' | 'mineral' | 'hydration';
  food: string;
  benefit: string;
  frequency: string;
}

export interface WearableAlert {
  id: string;
  type: 'abnormal-hr' | 'low-hrv' | 'excessive-movement' | 'poor-sleep' | 'inactivity';
  message: string;
  detectedAt: string;
  relatedInjuryId?: string;
  dismissed: boolean;
}

export type ChatRole = 'user' | 'coach';

export interface CoachMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export type NotificationType =
  | 'pain-log-reminder'
  | 'rehab-reminder'
  | 'milestone'
  | 'wearable-alert'
  | 'appointment'
  | 'doctor-followup';

export interface InjuryNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  injuryId?: string;
  createdAt: string;
}

export interface RecoveryBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string; // if undefined, not yet unlocked
}

export interface ExpertConsult {
  id: string;
  injuryId: string;
  expertName: string;
  specialty: string;
  scheduledAt: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
  meetingLink?: string;
}

// ─── Store State ──────────────────────────────────────────────────────────────
export interface InjuryStore {
  injuries: Injury[];
  painLogs: DailyPainLog[];
  rehabExercises: RehabExercise[];
  rehabPrograms: RehabProgram[];
  milestones: RecoveryMilestone[];
  medicalDocs: MedicalDocument[];
  workoutAdaptations: WorkoutAdaptation[];
  wearableAlerts: WearableAlert[];
  coachMessages: CoachMessage[];
  notifications: InjuryNotification[];
  badges: RecoveryBadge[];
  expertConsults: ExpertConsult[];
  currentStreak: number;
  longestStreak: number;

  // Injury CRUD
  logInjury: (data: Omit<Injury, 'id' | 'createdAt' | 'updatedAt'>) => Injury;
  updateInjury: (id: string, updates: Partial<Injury>) => void;
  deleteInjury: (id: string) => void;
  markInjuryHealed: (id: string) => void;

  // Pain Logs
  logDailyPain: (data: Omit<DailyPainLog, 'id' | 'createdAt'>) => DailyPainLog;
  deletePainLog: (id: string) => void;
  getPainLogsForInjury: (injuryId: string) => DailyPainLog[];

  // Rehab
  addRehabExercise: (data: Omit<RehabExercise, 'id'>) => RehabExercise;
  createRehabProgram: (data: Omit<RehabProgram, 'id' | 'createdAt' | 'completedSessions'>) => RehabProgram;
  completeRehabSession: (programId: string) => void;
  updateRehabProgram: (id: string, updates: Partial<RehabProgram>) => void;

  // Milestones
  addMilestone: (data: Omit<RecoveryMilestone, 'id'>) => void;

  // Medical Documents
  uploadMedicalDoc: (data: Omit<MedicalDocument, 'id' | 'uploadedAt'>) => MedicalDocument;
  deleteMedicalDoc: (id: string) => void;

  // Workout Adaptations
  addWorkoutAdaptation: (data: Omit<WorkoutAdaptation, 'id' | 'createdAt'>) => void;
  removeWorkoutAdaptation: (id: string) => void;
  getAdaptationsForInjury: (injuryId: string) => WorkoutAdaptation[];

  // Wearable Alerts
  addWearableAlert: (data: Omit<WearableAlert, 'id' | 'dismissed'>) => void;
  dismissWearableAlert: (id: string) => void;

  // Coach / AI Chat
  sendCoachMessage: (content: string) => void;
  receiveCoachMessage: (content: string) => void;
  clearCoachChat: () => void;

  // Notifications
  addNotification: (data: Omit<InjuryNotification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Badges
  unlockBadge: (id: string) => void;

  // Expert Consults
  scheduleConsult: (data: Omit<ExpertConsult, 'id'>) => ExpertConsult;
  updateConsult: (id: string, updates: Partial<ExpertConsult>) => void;

  // Computed / Analytics
  getActiveInjuries: () => Injury[];
  getRecoveryScore: (injuryId: string) => number; // 0–100
  getUnreadNotificationsCount: () => number;
  updateStreak: () => void;
}

// ─── Default Rehab Exercises ──────────────────────────────────────────────────
const DEFAULT_EXERCISES: RehabExercise[] = [
  {
    id: 'ex-1',
    name: 'Cat-Cow Stretch',
    category: 'stretching',
    description: 'On all fours, alternate between arching your back (cow) and rounding it (cat). Hold each position for 2 seconds.',
    sets: 3,
    reps: 10,
    safeFor: ['lower-back', 'upper-back', 'neck'],
    avoidFor: ['wrist-left', 'wrist-right'],
    difficulty: 'beginner',
  },
  {
    id: 'ex-2',
    name: 'Shoulder Pendulum',
    category: 'mobility',
    description: 'Lean forward slightly and let the affected arm hang free. Gently swing it in small circles.',
    durationSeconds: 60,
    safeFor: ['shoulder-left', 'shoulder-right'],
    avoidFor: [],
    difficulty: 'beginner',
  },
  {
    id: 'ex-3',
    name: 'Knee Extension',
    category: 'strengthening',
    description: 'Sit in a chair and straighten your leg slowly, hold 3 seconds, then lower.',
    sets: 3,
    reps: 15,
    safeFor: ['knee-left', 'knee-right'],
    avoidFor: [],
    difficulty: 'beginner',
  },
  {
    id: 'ex-4',
    name: 'Ankle Alphabet',
    category: 'mobility',
    description: 'Draw each letter of the alphabet with your foot. Improves ankle mobility and circulation.',
    durationSeconds: 120,
    safeFor: ['ankle-left', 'ankle-right'],
    avoidFor: [],
    difficulty: 'beginner',
  },
  {
    id: 'ex-5',
    name: 'Neck Chin Tuck',
    category: 'stretching',
    description: 'Gently pull your chin back to create a double chin. Hold 5 seconds, repeat.',
    sets: 3,
    reps: 10,
    safeFor: ['neck', 'upper-back'],
    avoidFor: [],
    difficulty: 'beginner',
  },
  {
    id: 'ex-6',
    name: 'Hip Bridge',
    category: 'strengthening',
    description: 'Lie on back with knees bent. Push hips up until body forms straight line. Hold 3 seconds.',
    sets: 3,
    reps: 12,
    safeFor: ['hip-left', 'hip-right', 'lower-back', 'hamstring-left', 'hamstring-right'],
    avoidFor: ['knee-left', 'knee-right'],
    difficulty: 'beginner',
  },
  {
    id: 'ex-7',
    name: 'Wrist Flexion & Extension',
    category: 'mobility',
    description: 'With arm extended, use other hand to gently flex wrist down and back. Hold 10s each direction.',
    durationSeconds: 60,
    safeFor: ['wrist-left', 'wrist-right', 'elbow-left', 'elbow-right'],
    avoidFor: [],
    difficulty: 'beginner',
  },
  {
    id: 'ex-8',
    name: 'Diaphragmatic Breathing',
    category: 'breathing',
    description: 'Breathe deeply into your belly, expanding the diaphragm. Helps with pain management and recovery.',
    durationSeconds: 300,
    safeFor: ['head', 'neck', 'chest', 'abdomen', 'lower-back', 'upper-back', 'shoulder-left', 'shoulder-right', 'hip-left', 'hip-right', 'knee-left', 'knee-right', 'ankle-left', 'ankle-right', 'foot-left', 'foot-right', 'elbow-left', 'elbow-right', 'wrist-left', 'wrist-right', 'hamstring-left', 'hamstring-right', 'calf-left', 'calf-right'],
    avoidFor: [],
    difficulty: 'beginner',
  },
];

// ─── Default Badges ────────────────────────────────────────────────────────────
const DEFAULT_BADGES: RecoveryBadge[] = [
  { id: 'badge-1', name: 'Pain Logger', description: 'Log pain for 3 consecutive days', icon: '📝' },
  { id: 'badge-2', name: 'Rehab Starter', description: 'Complete your first rehab session', icon: '🏃' },
  { id: 'badge-3', name: 'Week Warrior', description: 'Maintain 7-day logging streak', icon: '🔥' },
  { id: 'badge-4', name: 'Milestone Reached', description: 'Achieve your first recovery milestone', icon: '🎯' },
  { id: 'badge-5', name: 'Document Pro', description: 'Upload 3 medical documents', icon: '📋' },
  { id: 'badge-6', name: 'Recovery Champion', description: 'Fully heal an injury', icon: '🏆' },
  { id: 'badge-7', name: 'Consistent Carer', description: 'Log pain for 30 consecutive days', icon: '⭐' },
  { id: 'badge-8', name: 'Coach Chatter', description: 'Have 10 conversations with AI coach', icon: '🤖' },
];

// ─── Default Diet Recommendations ────────────────────────────────────────────
export const DIET_RECOMMENDATIONS: DietRecommendation[] = [
  { id: 'dr-1', category: 'anti-inflammatory', food: 'Turmeric', benefit: 'Contains curcumin — powerful anti-inflammatory compound', frequency: 'Daily (1/4 tsp in warm water or food)' },
  { id: 'dr-2', category: 'anti-inflammatory', food: 'Ginger', benefit: 'Reduces prostaglandins that trigger pain and inflammation', frequency: 'Daily (fresh or tea)' },
  { id: 'dr-3', category: 'anti-inflammatory', food: 'Fatty fish (salmon, sardines)', benefit: 'Omega-3 fatty acids reduce joint inflammation', frequency: '2–3 times per week' },
  { id: 'dr-4', category: 'anti-inflammatory', food: 'Blueberries', benefit: 'Anthocyanins reduce oxidative stress from injury', frequency: 'Daily (1/2 cup)' },
  { id: 'dr-5', category: 'protein', food: 'Eggs', benefit: 'Complete protein for tissue repair; collagen precursors', frequency: 'Daily (2 eggs)' },
  { id: 'dr-6', category: 'protein', food: 'Lean chicken breast', benefit: 'High protein to rebuild damaged muscle tissue', frequency: 'Daily' },
  { id: 'dr-7', category: 'protein', food: 'Greek yogurt', benefit: 'Protein + probiotics support healing and gut balance', frequency: 'Daily (1 cup)' },
  { id: 'dr-8', category: 'vitamin', food: 'Spinach', benefit: 'Vitamin K aids bone healing; antioxidants reduce swelling', frequency: 'Daily' },
  { id: 'dr-9', category: 'vitamin', food: 'Citrus fruits', benefit: 'Vitamin C is essential for collagen synthesis', frequency: 'Daily' },
  { id: 'dr-10', category: 'mineral', food: 'Dairy / fortified foods', benefit: 'Calcium for bone repair and muscle function', frequency: 'Daily' },
  { id: 'dr-11', category: 'mineral', food: 'Nuts & seeds', benefit: 'Magnesium helps muscle relaxation and sleep quality', frequency: 'Daily (small handful)' },
  { id: 'dr-12', category: 'hydration', food: 'Water', benefit: 'Essential for joint lubrication and toxin removal', frequency: '8–10 glasses per day' },
  { id: 'dr-13', category: 'hydration', food: 'Coconut water', benefit: 'Electrolytes support muscle function and healing', frequency: '1–2 cups after activity' },
];

// ─── Safety Prevention Tips ────────────────────────────────────────────────────
export const PREVENTION_TIPS = [
  { id: 'p-1', title: 'Warm Up Properly', description: 'Always spend 5–10 minutes warming up before exercise. Dynamic stretches prepare muscles for activity.', icon: '🔥', category: 'exercise' },
  { id: 'p-2', title: 'Progress Gradually', description: 'Increase intensity by no more than 10% per week. Sudden increases are the leading cause of overuse injuries.', icon: '📈', category: 'exercise' },
  { id: 'p-3', title: 'Rest & Recover', description: 'Schedule at least one full rest day per week. Muscles grow and repair during rest.', icon: '😴', category: 'recovery' },
  { id: 'p-4', title: 'Maintain Proper Form', description: 'Poor technique is the #1 cause of exercise injuries. Consider working with a trainer to check your form.', icon: '✅', category: 'exercise' },
  { id: 'p-5', title: 'Listen to Your Body', description: 'Sharp pain is always a stop signal. Distinguish between muscle fatigue and injury pain.', icon: '👂', category: 'awareness' },
  { id: 'p-6', title: 'Cross-Train', description: 'Vary your workout types to avoid repetitive strain. Mix strength, cardio and flexibility training.', icon: '🔄', category: 'exercise' },
  { id: 'p-7', title: 'Wear Proper Equipment', description: 'Use sport-appropriate footwear and protective gear for your activity.', icon: '👟', category: 'equipment' },
  { id: 'p-8', title: 'Hydrate Before & During', description: 'Dehydration increases injury risk. Drink water before, during and after activity.', icon: '💧', category: 'nutrition' },
  { id: 'p-9', title: 'Strengthen Supporting Muscles', description: 'Weak supporting muscles cause compensatory injuries. Include core and stability work in your routine.', icon: '💪', category: 'exercise' },
  { id: 'p-10', title: 'Sleep 7–9 Hours', description: 'Inadequate sleep impairs tissue repair, coordination, and reaction time — all leading to injuries.', icon: '🌙', category: 'recovery' },
];

// ─── AI Symptom → Injury Mapping ──────────────────────────────────────────────
export const SYMPTOM_INJURY_MAP: Record<string, { probable: string; caveat: string }> = {
  'sharp knee pain during exercise': { probable: 'Ligament strain or patella stress — consider patellofemoral syndrome', caveat: 'Consult a physiotherapist for accurate diagnosis.' },
  'lower back stiffness morning': { probable: 'Muscle stiffness or disc-related issue — common with sedentary habits', caveat: 'If pain radiates to legs, seek medical review.' },
  'shoulder clicking pain': { probable: 'Possible rotator cuff irritation or shoulder impingement', caveat: 'Avoid overhead pressing until evaluated by a professional.' },
  'ankle swelling after run': { probable: 'Ankle sprain or tendinitis — RICE protocol recommended', caveat: 'If weight-bearing is painful, rule out fracture with X-ray.' },
  'wrist pain typing': { probable: 'Repetitive strain injury or carpal tunnel syndrome', caveat: 'Ergonomic assessment and wrist splint recommended.' },
};

// ─── Workout Adaptations DB ───────────────────────────────────────────────────
export const WORKOUT_ADAPTATION_SUGGESTIONS: Record<string, string[]> = {
  'lower-back': ['Replace squats with leg press', 'Use seated cable rows instead of bent-over rows', 'Avoid deadlifts — use hip hinges with light weight only', 'Replace sit-ups with dead bugs'],
  'knee-left': ['Replace running with swimming or cycling', 'Use leg press with partial range of motion', 'Replace lunges with step-ups to box', 'Avoid deep squats'],
  'knee-right': ['Replace running with swimming or cycling', 'Use leg press with partial range of motion', 'Replace lunges with step-ups to box', 'Avoid deep squats'],
  'shoulder-left': ['Replace overhead press with lateral raises', 'Use cable face pulls for rear delt', 'Switch to neutral-grip pull-downs', 'Avoid behind-neck exercises'],
  'shoulder-right': ['Replace overhead press with lateral raises', 'Use cable face pulls for rear delt', 'Switch to neutral-grip pull-downs', 'Avoid behind-neck exercises'],
  'wrist-left': ['Use wrist wraps for support', 'Switch to dumbbell rows on elbows', 'Replace push-ups with fist push-ups', 'Avoid barbell curls — use rope curls'],
  'wrist-right': ['Use wrist wraps for support', 'Switch to dumbbell rows on elbows', 'Replace push-ups with fist push-ups', 'Avoid barbell curls — use rope curls'],
  'ankle-left': ['Replace running with upper-body conditioning', 'Use seated calf raises only', 'Replace box jumps with seated leg press', 'Swimming recommended for cardio'],
  'ankle-right': ['Replace running with upper-body conditioning', 'Use seated calf raises only', 'Replace box jumps with seated leg press', 'Swimming recommended for cardio'],
};

// ─── Store ────────────────────────────────────────────────────────────────────
export const useInjuryStore = create<InjuryStore>()(
  persist(
    (set, get) => ({
      injuries: [],
      painLogs: [],
      rehabExercises: DEFAULT_EXERCISES,
      rehabPrograms: [],
      milestones: [],
      medicalDocs: [],
      workoutAdaptations: [],
      wearableAlerts: [],
      coachMessages: [],
      notifications: [],
      badges: DEFAULT_BADGES,
      expertConsults: [],
      currentStreak: 0,
      longestStreak: 0,

      // ── Injury CRUD ─────────────────────────────────────────────────────────
      logInjury: (data) => {
        const injury: Injury = { ...data, id: genId(), createdAt: now(), updatedAt: now() };
        set((s) => ({ injuries: [injury, ...s.injuries] }));
        get().addNotification({ type: 'pain-log-reminder', title: 'Injury Logged', message: `${injury.name} has been recorded. Start tracking your recovery!`, injuryId: injury.id });
        return injury;
      },

      updateInjury: (id, updates) =>
        set((s) => ({
          injuries: s.injuries.map((i) => (i.id === id ? { ...i, ...updates, updatedAt: now() } : i)),
        })),

      deleteInjury: (id) =>
        set((s) => ({
          injuries: s.injuries.filter((i) => i.id !== id),
          painLogs: s.painLogs.filter((l) => l.injuryId !== id),
          rehabPrograms: s.rehabPrograms.filter((p) => p.injuryId !== id),
          milestones: s.milestones.filter((m) => m.injuryId !== id),
          medicalDocs: s.medicalDocs.filter((d) => d.injuryId !== id),
          workoutAdaptations: s.workoutAdaptations.filter((a) => a.injuryId !== id),
        })),

      markInjuryHealed: (id) => {
        get().updateInjury(id, { status: 'healed' });
        get().addMilestone({ injuryId: id, title: '🎉 Fully Healed!', description: 'You have successfully recovered from this injury.', achievedAt: now(), icon: '🏆' });
        get().unlockBadge('badge-6');
      },

      // ── Pain Logs ────────────────────────────────────────────────────────────
      logDailyPain: (data) => {
        const log: DailyPainLog = { ...data, id: genId(), createdAt: now() };
        set((s) => ({ painLogs: [log, ...s.painLogs] }));
        get().updateStreak();
        return log;
      },

      deletePainLog: (id) =>
        set((s) => ({ painLogs: s.painLogs.filter((l) => l.id !== id) })),

      getPainLogsForInjury: (injuryId) =>
        get().painLogs.filter((l) => l.injuryId === injuryId).sort((a, b) => a.date.localeCompare(b.date)),

      // ── Rehab ───────────────────────────────────────────────────────────────
      addRehabExercise: (data) => {
        const ex: RehabExercise = { ...data, id: genId() };
        set((s) => ({ rehabExercises: [...s.rehabExercises, ex] }));
        return ex;
      },

      createRehabProgram: (data) => {
        const program: RehabProgram = { ...data, id: genId(), createdAt: now(), completedSessions: [] };
        set((s) => ({ rehabPrograms: [...s.rehabPrograms, program] }));
        return program;
      },

      completeRehabSession: (programId) => {
        set((s) => ({
          rehabPrograms: s.rehabPrograms.map((p) =>
            p.id === programId ? { ...p, completedSessions: [...p.completedSessions, now()] } : p,
          ),
        }));
        get().unlockBadge('badge-2');
      },

      updateRehabProgram: (id, updates) =>
        set((s) => ({
          rehabPrograms: s.rehabPrograms.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),

      // ── Milestones ───────────────────────────────────────────────────────────
      addMilestone: (data) => {
        const milestone: RecoveryMilestone = { ...data, id: genId() };
        set((s) => ({ milestones: [...s.milestones, milestone] }));
        get().unlockBadge('badge-4');
      },

      // ── Medical Documents ────────────────────────────────────────────────────
      uploadMedicalDoc: (data) => {
        const doc: MedicalDocument = { ...data, id: genId(), uploadedAt: now() };
        set((s) => ({ medicalDocs: [...s.medicalDocs, doc] }));
        const docCount = get().medicalDocs.length;
        if (docCount >= 3) get().unlockBadge('badge-5');
        return doc;
      },

      deleteMedicalDoc: (id) =>
        set((s) => ({ medicalDocs: s.medicalDocs.filter((d) => d.id !== id) })),

      // ── Workout Adaptations ──────────────────────────────────────────────────
      addWorkoutAdaptation: (data) => {
        const adaptation: WorkoutAdaptation = { ...data, id: genId(), createdAt: now() };
        set((s) => ({ workoutAdaptations: [...s.workoutAdaptations, adaptation] }));
      },

      removeWorkoutAdaptation: (id) =>
        set((s) => ({ workoutAdaptations: s.workoutAdaptations.filter((a) => a.id !== id) })),

      getAdaptationsForInjury: (injuryId) =>
        get().workoutAdaptations.filter((a) => a.injuryId === injuryId),

      // ── Wearable Alerts ──────────────────────────────────────────────────────
      addWearableAlert: (data) => {
        const alert: WearableAlert = { ...data, id: genId(), dismissed: false };
        set((s) => ({ wearableAlerts: [alert, ...s.wearableAlerts] }));
        get().addNotification({ type: 'wearable-alert', title: 'Wearable Alert', message: data.message, injuryId: data.relatedInjuryId });
      },

      dismissWearableAlert: (id) =>
        set((s) => ({
          wearableAlerts: s.wearableAlerts.map((a) => (a.id === id ? { ...a, dismissed: true } : a)),
        })),

      // ── Coach / AI Chat ──────────────────────────────────────────────────────
      sendCoachMessage: (content) => {
        const msg: CoachMessage = { id: genId(), role: 'user', content, createdAt: now() };
        set((s) => ({ coachMessages: [...s.coachMessages, msg] }));
      },

      receiveCoachMessage: (content) => {
        const msg: CoachMessage = { id: genId(), role: 'coach', content, createdAt: now() };
        set((s) => ({ coachMessages: [...s.coachMessages, msg] }));
      },

      clearCoachChat: () => set({ coachMessages: [] }),

      // ── Notifications ────────────────────────────────────────────────────────
      addNotification: (data) => {
        const notif: InjuryNotification = { ...data, id: genId(), read: false, createdAt: now() };
        set((s) => ({ notifications: [notif, ...s.notifications] }));
      },

      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),

      markAllNotificationsRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

      // ── Badges ───────────────────────────────────────────────────────────────
      unlockBadge: (id) =>
        set((s) => ({
          badges: s.badges.map((b) => (b.id === id && !b.unlockedAt ? { ...b, unlockedAt: now() } : b)),
        })),

      // ── Expert Consults ──────────────────────────────────────────────────────
      scheduleConsult: (data) => {
        const consult: ExpertConsult = { ...data, id: genId() };
        set((s) => ({ expertConsults: [...s.expertConsults, consult] }));
        get().addNotification({ type: 'appointment', title: 'Consultation Scheduled', message: `Appointment with ${data.expertName} on ${new Date(data.scheduledAt).toLocaleDateString()}`, injuryId: data.injuryId });
        return consult;
      },

      updateConsult: (id, updates) =>
        set((s) => ({
          expertConsults: s.expertConsults.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      // ── Computed ─────────────────────────────────────────────────────────────
      getActiveInjuries: () => get().injuries.filter((i) => i.status === 'active' || i.status === 'recovering'),

      getRecoveryScore: (injuryId) => {
        const logs = get().getPainLogsForInjury(injuryId);
        if (logs.length === 0) return 0;
        const recent = logs.slice(-7);
        const avgPain = recent.reduce((s, l) => s + l.painLevel, 0) / recent.length;
        const avgMobility = recent.reduce((s, l) => s + l.mobilityLevel, 0) / recent.length;
        return Math.round(((10 - avgPain) / 10) * 50 + (avgMobility / 10) * 50);
      },

      getUnreadNotificationsCount: () => get().notifications.filter((n) => !n.read).length,

      updateStreak: () => {
        const logs = get().painLogs;
        const today = new Date().toISOString().slice(0, 10);
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        const loggedToday = logs.some((l) => l.date === today);
        const loggedYesterday = logs.some((l) => l.date === yesterday);

        set((s) => {
          const newStreak = loggedToday ? (loggedYesterday ? s.currentStreak + 1 : 1) : s.currentStreak;
          const longest = Math.max(newStreak, s.longestStreak);
          if (newStreak >= 7) get().unlockBadge('badge-3');
          if (newStreak >= 3) get().unlockBadge('badge-1');
          if (newStreak >= 30) get().unlockBadge('badge-7');
          return { currentStreak: newStreak, longestStreak: longest };
        });
      },
    }),
    { name: 'heybobo-injury', storage: createUserStorage() },
  ),
);
