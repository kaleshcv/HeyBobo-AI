/**
 * Fitness API sync utilities.
 * Provides background sync from frontend Zustand stores to the backend MongoDB.
 * Offline-first: localStorage remains primary, API is secondary sync.
 */
import { fitnessApi } from '../lib/api';
import { useAuthStore } from './authStore';
import { errorLogger } from '../lib/errorLogger';

function getUserId(): string {
  return useAuthStore.getState().user?.id || 'anonymous';
}

// Debounce sync calls so we don't flood the server
const pending = new Map<string, ReturnType<typeof setTimeout>>();
function debouncedSync(key: string, fn: () => void, delay = 1500) {
  const existing = pending.get(key);
  if (existing) clearTimeout(existing);
  pending.set(key, setTimeout(() => { fn(); pending.delete(key); }, delay));
}

// ─── Workout Session Sync ───────────────────────────────
export async function syncWorkoutSession(session: {
  exerciseId?: string;
  name: string;
  startedAt: string;
  endedAt?: string | null;
  reps?: number;
  durationSeconds?: number;
  caloriesBurned?: number;
  avgFormScore?: number;
  source: string;
  category?: string;
  exercises?: any[];
}) {
  try {
    const userId = getUserId();
    const payload: Record<string, any> = {
      name: session.name,
      source: session.source,
      startedAt: session.startedAt,
    };
    if (session.endedAt) payload.endedAt = session.endedAt;
    if (session.category) payload.category = session.category;
    if (session.durationSeconds) payload.durationSeconds = session.durationSeconds;
    if (session.reps) payload.totalReps = session.reps;
    if (session.caloriesBurned) payload.caloriesBurned = session.caloriesBurned;
    if (session.exercises && session.exercises.length > 0) {
      payload.totalSets = session.exercises.length;
      payload.exercises = session.exercises.map((e: any) => ({
        exerciseId: e.exerciseId || 'unknown',
        exerciseName: e.name || e.exerciseId || 'Exercise',
        sets: e.sets,
        reps: e.reps,
      }));
    }
    if (session.avgFormScore) {
      payload.formAnalysis = { avgFormScore: session.avgFormScore };
    }
    await fitnessApi.createSession(payload, userId);
  } catch (err) {
    errorLogger.warn('Failed to sync workout session', 'FitnessSync', { meta: { error: String(err) } });
  }
}

// ─── Daily Metrics Sync ─────────────────────────────────
export function syncDailyMetrics(date: string, metrics: {
  steps?: number;
  distanceKm?: number;
  caloriesBurned?: number;
  activeMinutes?: number;
  floorsClimbed?: number;
}) {
  debouncedSync(`daily-metrics-${date}`, async () => {
    try {
      const userId = getUserId();
      await fitnessApi.updateDailyMetrics({ date, ...metrics }, userId);
    } catch (err) {
      errorLogger.warn('Failed to sync daily metrics', 'FitnessSync', { meta: { error: String(err), date } });
    }
  });
}

// ─── Fitness Profile Sync ───────────────────────────────
export function syncFitnessProfile(profile: Record<string, any>) {
  debouncedSync('fitness-profile', async () => {
    try {
      const userId = getUserId();
      await fitnessApi.saveProfile(profile, userId);
    } catch (err) {
      errorLogger.warn('Failed to sync fitness profile', 'FitnessSync', { meta: { error: String(err) } });
    }
  });
}

// ─── Load from server (for initial hydration on login) ──
export async function loadFitnessDataFromServer() {
  try {
    const userId = getUserId();
    if (userId === 'anonymous') return null;
    const [profileRes, statsRes] = await Promise.all([
      fitnessApi.getProfile(userId),
      fitnessApi.getStats(userId),
    ]);
    return {
      profile: profileRes.data?.data,
      stats: statsRes.data?.data,
    };
  } catch (err) {
    errorLogger.warn('Failed to load fitness data from server', 'FitnessSync', { meta: { error: String(err) } });
    return null;
  }
}
