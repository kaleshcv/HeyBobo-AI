/**
 * useBrainData — central hook that aggregates real data from every module
 * (Zustand stores + backend APIs) and returns a fully-populated AIBrainInput.
 *
 * Used by:
 *  - AIBrainPage.tsx (replaces the inline brainInput useMemo)
 *  - BrainChatbot.tsx (self-contained — no props needed)
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAITutorStore } from '@/store/aiTutorStore';
import { useCourseStore } from '@/store/courseStore';
import { useWorkoutSystemStore, PRESET_PLANS } from '@/store/workoutSystemStore';
import { useFitnessProfileStore } from '@/store/fitnessProfileStore';
import { useLiveWorkoutStore } from '@/store/liveWorkoutStore';
import { useActivityTrackingStore } from '@/store/activityTrackingStore';
import { useInjuryStore } from '@/store/injuryStore';
import { useDietaryProfileStore } from '@/store/dietaryProfileStore';
import { useGroupStore } from '@/store/groupStore';
import { useMeetingStore } from '@/store/meetingStore';
import { useShoppingListStore } from '@/store/shoppingListStore';
import { useWearablesStore, type HealthReading } from '@/store/wearablesStore';
import { dietaryApi } from '@/lib/api';
import { type AIBrainInput } from '@/lib/gemini';

interface WeatherData {
  condition: string;   // e.g. "Partly Cloudy"
  tempC: number;
  feelsLikeC: number;
  humidity: number;
  isRaining: boolean;
  isHot: boolean;     // > 35°C
  location: string;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

interface DietaryApiData {
  caloriesConsumed: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatConsumed: number;
  mealsLogged: number;
  supplementsDue: number;
}

export function useBrainData(): AIBrainInput {
  const { user } = useAuth();
  const userId = user?.id ?? 'anonymous';

  // ─── Store reads ────────────────────────────────────────────────
  const textbooks = useAITutorStore((s) => s.textbooks);
  const studyPlans = useAITutorStore((s) => s.studyPlans);
  const quizAttempts = useAITutorStore((s) => s.quizAttempts);
  const lessons = useAITutorStore((s) => s.lessons);

  const courses = useCourseStore((s) => s.courses);
  const videoProgress = useCourseStore((s) => s.progress);
  const courseQuizProgress = useCourseStore((s) => s.quizProgress);

  const workoutLogs = useWorkoutSystemStore((s) => s.workoutLogs);
  const activePlanId = useWorkoutSystemStore((s) => s.activePlanId);
  const customWorkouts = useWorkoutSystemStore((s) => s.customWorkouts);

  const fitnessProfile = useFitnessProfileStore((s) => s.profile);
  const liveSessions = useLiveWorkoutStore((s) => s.sessions);

  const todayMetrics = useActivityTrackingStore((s) => s.getDailyMetrics(todayStr()));

  const injuries = useInjuryStore((s) => s.injuries);
  const painLogs = useInjuryStore((s) => s.painLogs);
  const rehabPrograms = useInjuryStore((s) => s.rehabPrograms);

  const calorieTarget = useDietaryProfileStore((s) => s.dailyCalorieTarget);
  const proteinTarget = useDietaryProfileStore((s) => s.dailyProteinTargetG);
  const carbsTarget = useDietaryProfileStore((s) => s.dailyCarbsTargetG);
  const fatTarget = useDietaryProfileStore((s) => s.dailyFatTargetG);
  const mealsPerDay = useDietaryProfileStore((s) => s.mealsPerDay);

  const groups = useGroupStore((s) => s.groups);
  const meetings = useMeetingStore((s) => s.meetings);
  const shoppingLists = useShoppingListStore((s) => s.lists);

  const wearableReadings = useWearablesStore((s) => s.readings);
  const wearableDevices = useWearablesStore((s) => s.devices);

  // ─── API data (dietary consumption — not in any Zustand store) ──
  const [dietaryApi_, setDietaryApi] = useState<DietaryApiData>({
    caloriesConsumed: 0,
    proteinConsumed: 0,
    carbsConsumed: 0,
    fatConsumed: 0,
    mealsLogged: 0,
    supplementsDue: 0,
  });
  const fetchedDateRef = useRef<string>('');

  // ─── Weather data ────────────────────────────────────────────────
  const [weather, setWeather] = useState<WeatherData>({
    condition: 'Unknown', tempC: 25, feelsLikeC: 25, humidity: 50,
    isRaining: false, isHot: false, location: 'Unknown',
  });
  const weatherFetchedRef = useRef(false);

  const fetchWeather = useCallback(async () => {
    if (weatherFetchedRef.current) return;
    weatherFetchedRef.current = true;
    try {
      const res = await fetch('https://wttr.in/?format=j1', { signal: AbortSignal.timeout(4000) });
      if (!res.ok) return;
      const data = await res.json();
      const cur = data.current_condition?.[0];
      const area = data.nearest_area?.[0];
      if (!cur) return;
      const tempC = Number(cur.temp_C);
      const feelsLikeC = Number(cur.FeelsLikeC);
      const humidity = Number(cur.humidity);
      const condition = cur.weatherDesc?.[0]?.value ?? 'Unknown';
      const isRaining = /rain|drizzle|shower|thunder|storm/i.test(condition);
      const isHot = tempC > 35;
      const location = area?.areaName?.[0]?.value ?? 'Unknown';
      setWeather({ condition, tempC, feelsLikeC, humidity, isRaining, isHot, location });
    } catch {
      // weather not available, keep defaults
    }
  }, []);

  useEffect(() => { fetchWeather(); }, [fetchWeather]);

  const fetchDietaryApi = useCallback(async () => {
    const today = todayStr();
    if (fetchedDateRef.current === today || userId === 'anonymous') return;
    fetchedDateRef.current = today;
    try {
      const [nutritionRes, suppsRes] = await Promise.all([
        dietaryApi.getDailyNutrition(today, userId),
        dietaryApi.getSupplements({ startDate: today, endDate: today }, userId),
      ]);

      const dn = nutritionRes.data?.data ?? nutritionRes.data ?? null;
      const supps: any[] = suppsRes.data?.data?.supplements ?? suppsRes.data?.supplements ?? [];
      const supplementsDue = supps.filter((s: any) => !s.taken).length;

      setDietaryApi({
        caloriesConsumed: dn?.totalCalories ?? 0,
        proteinConsumed: dn?.totalProteinG ?? 0,
        carbsConsumed: dn?.totalCarbsG ?? 0,
        fatConsumed: dn?.totalFatG ?? 0,
        mealsLogged: dn?.mealsLogged ?? 0,
        supplementsDue,
      });
    } catch {
      // API not available — keep zeros; chatbot handles gracefully
    }
  }, [userId]);

  useEffect(() => {
    fetchDietaryApi();
    // Re-fetch every 5 minutes to stay fresh
    const interval = setInterval(fetchDietaryApi, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDietaryApi]);

  // ─── Computed values (all from stores) ──────────────────────────
  const activePlan = PRESET_PLANS.find((p) => p.id === activePlanId) ?? null;

  const weeklyLogs = useMemo(
    () => workoutLogs.filter((l) => Date.now() - new Date(l.date).getTime() <= 7 * 86400000),
    [workoutLogs],
  );

  const avgFormScore = useMemo(() => {
    if (liveSessions.length === 0) return 0;
    return Math.round(
      liveSessions.reduce((s, sess) => s + Math.round(sess.avgFormScore * 100), 0) / liveSessions.length,
    );
  }, [liveSessions]);

  const activeInjuries = useMemo(
    () => injuries.filter((i) => i.status === 'active' || i.status === 'recovering'),
    [injuries],
  );

  const pendingShoppingItems = useMemo(
    () => shoppingLists.reduce((sum, list) => sum + list.items.filter((i: any) => !i.checked).length, 0),
    [shoppingLists],
  );

  const completedCourses = useMemo(
    () => courses.filter((c) => {
      const total = c.videos.length;
      if (total === 0) return false;
      return videoProgress.filter((p) => p.courseId === c.id && p.completed).length === total;
    }).length,
    [courses, videoProgress],
  );

  const lecturesCompleted = useMemo(
    () => videoProgress.filter((p) => p.completed).length,
    [videoProgress],
  );

  const totalLectures = useMemo(
    () => courses.reduce((sum, c) => sum + c.videos.length, 0),
    [courses],
  );

  const pendingAssignments = useMemo(
    () => groups.reduce((sum, g) => {
      const now = new Date();
      return sum + g.assignments.filter((a) =>
        a.submissions.length === 0 && new Date(a.deadline) > now,
      ).length;
    }, 0),
    [groups],
  );

  const streakDays = useMemo(() => {
    if (workoutLogs.length === 0) return 0;
    const uniqueDates = [...new Set(workoutLogs.map((l) => l.date))].sort().reverse();
    let streak = 0;
    let cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    for (const dateStr of uniqueDates) {
      const d = new Date(dateStr);
      d.setHours(0, 0, 0, 0);
      const diff = Math.round((cursor.getTime() - d.getTime()) / 86400000);
      if (diff <= 1) { streak++; cursor = d; } else break;
    }
    return streak;
  }, [workoutLogs]);

  const recentWorkoutCategories = useMemo(() => {
    // Last 5 workouts — what muscle groups / categories were hit
    const last5Logs = workoutLogs.slice(0, 5);
    const categories = new Set<string>();
    last5Logs.forEach((log) => {
      log.exercises?.forEach((ex: any) => {
        if (ex.category) categories.add(ex.category);
      });
    });
    return Array.from(categories);
  }, [workoutLogs]);

  const pendingGroupTasks = useMemo(
    () => groups.reduce((sum, g) => sum + g.assignments.filter((a) => a.submissions.length === 0).length, 0),
    [groups],
  );

  const completedGroupMeetings = useMemo(
    () => groups.reduce((sum, g) => sum + g.meetings.filter((m) => m.status === 'completed').length, 0),
    [groups],
  );

  const allRecentQuizScores = useMemo(() => {
    const aiScores = quizAttempts.slice(-5).map((a) => Math.round((a.score / a.total) * 100));
    const courseScores = courseQuizProgress.slice(-5).map((q) => Math.round((q.score / q.total) * 100));
    return [...aiScores, ...courseScores].slice(-10);
  }, [quizAttempts, courseQuizProgress]);

  const latestReading = useCallback((metric: string): number => {
    const reading = wearableReadings
      .filter((r: HealthReading) => r.metric === metric)
      .sort((a: HealthReading, b: HealthReading) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    return reading?.value ?? 0;
  }, [wearableReadings]);

  // ─── Assemble AIBrainInput ───────────────────────────────────────
  return useMemo<AIBrainInput>(() => ({
    userName: user?.firstName ?? 'User',
    currentTime: new Date().toLocaleString(),
    dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    weather: {
      condition: weather.condition,
      tempC: weather.tempC,
      feelsLikeC: weather.feelsLikeC,
      humidity: weather.humidity,
      isRaining: weather.isRaining,
      isHot: weather.isHot,
      location: weather.location,
    },
    context: {
      sleepHoursLastNight: latestReading('sleep-duration'),
      hrv: latestReading('hrv'),
      fitnessGoal: (fitnessProfile as any).goal ?? 'general-fitness',
      recentWorkoutCategories,
      workoutsCompletedToday: workoutLogs.filter((l) => l.date === todayStr()).length,
    },
    education: {
      enrolledCourses: courses.length,
      completedCourses,
      pendingAssignments,
      upcomingQuizzes: 0,
      recentQuizScores: allRecentQuizScores,
      studyPlansActive: studyPlans.length,
      textbooksUploaded: textbooks.length,
      lecturesCompleted,
      lecturesMissed: totalLectures - lecturesCompleted,
      groupsJoined: groups.length,
      meetingsScheduled: meetings.filter((m) => m.status === 'scheduled').length,
    },
    fitness: {
      workoutsThisWeek: weeklyLogs.length,
      weeklyGoal: activePlan?.daysPerWeek ?? fitnessProfile.daysPerWeek,
      totalMinutesThisWeek: weeklyLogs.reduce((s, l) => s + l.durationMinutes, 0),
      avgFormScore,
      activePlan: activePlan?.name ?? null,
      lastWorkoutDate: workoutLogs[0]?.date ?? null,
      streakDays,
      customWorkouts: customWorkouts.length,
    },
    health: {
      sleepScore: latestReading('sleep-score'),
      avgHeartRate: latestReading('heart-rate'),
      stressScore: latestReading('stress-level'),
      readinessScore: latestReading('readiness-score'),
      stepsToday: todayMetrics.steps,
      caloriesBurned: todayMetrics.caloriesBurned,
      hydrationLevel: 0,
      hasWearable: wearableDevices.some((d) => d.connectionStatus === 'connected'),
    },
    dietary: {
      caloriesConsumed: dietaryApi_.caloriesConsumed,
      calorieTarget,
      proteinConsumed: dietaryApi_.proteinConsumed,
      proteinTarget,
      carbsConsumed: dietaryApi_.carbsConsumed,
      carbsTarget,
      fatConsumed: dietaryApi_.fatConsumed,
      fatTarget,
      mealsLogged: dietaryApi_.mealsLogged,
      adherenceRate: calorieTarget > 0
        ? Math.round((dietaryApi_.caloriesConsumed / calorieTarget) * 100)
        : 0,
      activeMealPlan: false,
      groceryItemsPending: pendingShoppingItems,
      supplementsDue: dietaryApi_.supplementsDue,
      mealsPerDayTarget: mealsPerDay,
    },
    injury: {
      activeInjuries: activeInjuries.map((inj) => {
        const latestPain = painLogs
          .filter((l) => l.injuryId === inj.id)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        return {
          bodyPart: inj.bodyPart,
          painScore: latestPain?.painLevel ?? 0,
          daysSinceOnset: Math.ceil((Date.now() - new Date(inj.createdAt).getTime()) / 86400000),
        };
      }),
      rehabAdherence: rehabPrograms.length > 0
        ? Math.round(
          rehabPrograms
            .filter((p: any) => p.status === 'active')
            .reduce((s: number, p: any) => {
              const totalExpected = p.exerciseIds?.length ?? 0;
              const sessionsCompleted = p.completedSessions?.length ?? 0;
              return s + (totalExpected > 0 ? Math.min((sessionsCompleted / totalExpected) * 100, 100) : 0);
            }, 0) / Math.max(rehabPrograms.filter((p: any) => p.status === 'active').length, 1),
        )
        : 0,
      movementRestrictions: activeInjuries.flatMap((inj) => (inj as any).movementRestrictions ?? []),
    },
    shopping: {
      pendingItems: pendingShoppingItems,
      totalLists: shoppingLists.length,
      checkedItems: shoppingLists.reduce((sum, list) => sum + list.items.filter((i: any) => i.checked).length, 0),
      upcomingDeliveries: 0,
      lowStockItems: [],
    },
    groups: {
      activeGroups: groups.length,
      pendingTasks: pendingGroupTasks,
      upcomingMeetings: meetings.filter((m) => m.status === 'scheduled').length,
      missedSessions: completedGroupMeetings,
      totalAssignments: groups.reduce((sum, g) => sum + g.assignments.length, 0),
      totalMembers: groups.reduce((sum, g) => sum + g.members.length, 0),
    },
  }), [
    user, courses, completedCourses, pendingAssignments, allRecentQuizScores,
    studyPlans, textbooks, lecturesCompleted, totalLectures, groups, meetings,
    weeklyLogs, activePlan, fitnessProfile, avgFormScore, workoutLogs, streakDays,
    customWorkouts, latestReading, wearableDevices, todayMetrics,
    dietaryApi_, calorieTarget, proteinTarget, carbsTarget, fatTarget,
    mealsPerDay, pendingShoppingItems,
    activeInjuries, painLogs, rehabPrograms,
    shoppingLists, pendingGroupTasks, completedGroupMeetings, lessons,
    weather, recentWorkoutCategories,
  ]);
}
