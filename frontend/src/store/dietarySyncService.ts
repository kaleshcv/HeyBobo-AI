import { dietaryApi } from '@/lib/api';
import { errorLogger } from '@/lib/errorLogger';

let syncTimeout: ReturnType<typeof setTimeout> | null = null;

export async function syncDietaryProfile(profile: Record<string, any>, userId: string): Promise<void> {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    try {
      await dietaryApi.saveProfile(profile, userId);
    } catch (err) {
      errorLogger.error('Failed to sync dietary profile', 'DietarySync', { meta: { error: String(err) } });
    }
  }, 1000);
}

export async function loadDietaryDataFromServer(userId: string) {
  try {
    const [profileRes, goalsRes, statsRes] = await Promise.all([
      dietaryApi.getProfile(userId),
      dietaryApi.getGoals(userId),
      dietaryApi.getStats(userId),
    ]);
    return {
      profile: profileRes.data?.data,
      goals: goalsRes.data?.data,
      stats: statsRes.data?.data,
    };
  } catch (err) {
    errorLogger.error('Failed to load dietary data from server', 'DietarySync', { meta: { error: String(err) } });
    return null;
  }
}
