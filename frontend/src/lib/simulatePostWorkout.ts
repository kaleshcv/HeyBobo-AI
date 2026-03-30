/**
 * ─── DEV / DEMO SIMULATION ───────────────────────────────────────────────────
 * Populates the AI Brain dashboard with a realistic post-workout state,
 * including supplement recommendations (creatine, magnesium, vitamins).
 *
 * Call runPostWorkoutSimulation() from any component.  It writes directly
 * into the Zustand stores — no localStorage or network access needed.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useAIBrainStore } from '@/store/aiBrainStore';
import { useWorkoutSystemStore } from '@/store/workoutSystemStore';

export function runPostWorkoutSimulation(): void {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 5);   // e.g. "18:34"
  const isoNow  = now.toISOString();

  // ── 1. Log the workout ─────────────────────────────────────────────────────
  try {
    const { logWorkout } = useWorkoutSystemStore.getState();
    logWorkout({
      date: todayStr,
      workoutName: 'Heavy Upper Body — Bench Press PB',
      exercises: [
        { exerciseId: 'ex-1', sets: 5, reps: 5,  note: '110 kg — personal best 🏆' },
        { exerciseId: 'ex-7', sets: 4, reps: 10, note: '80 kg barbell row' },
        { exerciseId: 'ex-5', sets: 4, reps: 8,  note: '30 kg dumbbells' },
        { exerciseId: 'ex-4', sets: 3, reps: 10, note: 'Bodyweight pull-ups' },
        { exerciseId: 'ex-6', sets: 3, reps: 15, note: 'Burnout push-ups' },
      ],
      durationMinutes: 72,
      feeling: 'tired',
    });
  } catch {
    // logWorkout may throw if syncWorkoutSession errors — ignore for simulation
  }

  // ── 2. Populate AI Brain dashboard ────────────────────────────────────────
  const { setBrainData } = useAIBrainStore.getState();

  setBrainData({

    // ── Today's Focus ──────────────────────────────────────────────────────
    todayFocus: {
      headline: 'Post-Workout Recovery Mode 🏋️',
      body: 'You just crushed a 72-minute heavy upper-body session and hit a bench press personal best at 110 kg. Your muscles are in the anabolic window — the next 60 minutes are critical for recovery. Energy is low; protect it.',
      energyLevel: 'low',
      suggestedFocus: [
        '💊 Take your supplement stack now (creatine + magnesium + vitamin C)',
        '🥩 Eat 40 g protein within the next hour',
        '💧 Drink at least 500 ml water immediately',
        '🧘 Light stretching for 10 minutes — chest & shoulders',
        '🌙 Target 8 hours of sleep tonight to maximise muscle repair',
      ],
      shoppingNudge: 'Running low on Creatine Monohydrate — reorder on the Shopping page',
    },

    // ── Nudge banner ────────────────────────────────────────────────────────
    nudge: '🚨 Anabolic window closing — take your supplement stack now!',

    // ── Priorities ──────────────────────────────────────────────────────────
    priorities: [
      {
        id: 'sim-p1',
        title: 'Take Supplement Stack Now',
        description: 'Creatine 5 g + Magnesium Glycinate 300 mg + Vitamin C 1000 mg + Omega-3 2 g — anabolic window is open for ~45 min.',
        module: 'dietary',
        level: 'critical',
        icon: 'MedicationIcon',
        actionLabel: 'Go to Dietary',
        actionPath: '/app/dietary',
        dueTime: 'Next 45 min',
      },
      {
        id: 'sim-p2',
        title: 'Rehydrate — Drink 500 ml Water',
        description: 'You lost significant fluid during the 72-min session. Dehydration slows protein synthesis.',
        module: 'health',
        level: 'high',
        icon: 'WaterDropIcon',
        dueTime: 'Right now',
      },
      {
        id: 'sim-p3',
        title: 'High-Protein Meal Within 1 Hour',
        description: 'Target 40 g protein — chicken, eggs or Greek yogurt. Pair with fast carbs to spike insulin and drive nutrients into muscles.',
        module: 'dietary',
        level: 'high',
        icon: 'RestaurantIcon',
        actionLabel: 'Log Meal',
        actionPath: '/app/dietary',
        dueTime: '1 hour',
      },
      {
        id: 'sim-p4',
        title: 'Sleep 8 Hours Tonight',
        description: 'HGH peaks during deep sleep — critical for muscle repair after a PB effort. Avoid screens 1 hr before bed.',
        module: 'health',
        level: 'medium',
        icon: 'BedtimeIcon',
        dueTime: 'Tonight',
      },
    ],

    // ── Alerts ──────────────────────────────────────────────────────────────
    alerts: [
      {
        id: 'sim-a1',
        title: '⏱ Anabolic Window Active',
        description: 'Post-workout anabolic window is open. Muscles are primed to absorb creatine, amino acids and carbs. Act within 45 minutes.',
        module: 'fitness',
        severity: 'error',
        icon: 'TimerIcon',
        timestamp: isoNow,
        dismissed: false,
      },
      {
        id: 'sim-a2',
        title: '🏆 Personal Best Detected — DOMS Warning',
        description: 'Bench press PB at 110 kg! Expect delayed-onset muscle soreness (DOMS) in chest and triceps over the next 24–48 hours. Avoid re-training chest tomorrow.',
        module: 'fitness',
        severity: 'warning',
        icon: 'EmojiEventsIcon',
        timestamp: isoNow,
        dismissed: false,
      },
      {
        id: 'sim-a3',
        title: '📈 Cortisol Elevated Post-Session',
        description: 'Intense strength training spikes cortisol. Vitamin C and magnesium help suppress excess cortisol and support testosterone recovery.',
        module: 'health',
        severity: 'warning',
        icon: 'MonitorHeartIcon',
        timestamp: isoNow,
        dismissed: false,
      },
    ],

    // ── Schedule ────────────────────────────────────────────────────────────
    schedule: [
      {
        id: 'sim-s1',
        title: 'Creatine 5 g + Magnesium 300 mg',
        time: timeStr,
        module: 'dietary',
        icon: 'MedicationIcon',
        color: '#d32f2f',
        completed: false,
      },
      {
        id: 'sim-s2',
        title: 'Protein Meal (40 g protein + carbs)',
        time: (() => {
          const d = new Date(now.getTime() + 60 * 60 * 1000);
          return d.toTimeString().slice(0, 5);
        })(),
        module: 'dietary',
        icon: 'RestaurantIcon',
        color: '#2e7d32',
        completed: false,
      },
      {
        id: 'sim-s3',
        title: 'Magnesium Glycinate 300 mg (second dose)',
        time: '21:30',
        module: 'dietary',
        icon: 'NightlightIcon',
        color: '#5e35b1',
        completed: false,
      },
      {
        id: 'sim-s4',
        title: 'Vitamin D3 + K2 (with dinner)',
        time: '19:30',
        module: 'dietary',
        icon: 'WbSunnyIcon',
        color: '#f57c00',
        completed: false,
      },
    ],

    // ── Module Insights ─────────────────────────────────────────────────────
    moduleInsights: [
      {
        module: 'fitness',
        label: 'Fitness',
        score: 88,
        trend: 'up',
        summary: 'Outstanding session — bench press PB at 110 kg',
        details: [
          '72-minute heavy upper body session completed',
          'New personal best: Bench Press 110 kg (5×5)',
          'Volume: chest, back, shoulders, biceps covered',
          'Streak maintained — 4 consecutive training days',
        ],
      },
      {
        module: 'health',
        label: 'Health',
        score: 62,
        trend: 'down',
        summary: 'Recovery deficit — cortisol high, rehydration needed',
        details: [
          'Post-exercise cortisol elevated — supplement stack will help',
          'Hydration status low — 500 ml water needed immediately',
          'Sleep target: 8 hours tonight for full muscle repair',
          'DOMS expected in chest/triceps for 24–48 hours',
        ],
      },
      {
        module: 'dietary',
        label: 'Dietary',
        score: 55,
        trend: 'down',
        summary: 'Supplement and nutrition window open — act now',
        details: [
          'Creatine monohydrate: 5 g due now (post-workout)',
          'Magnesium glycinate: 300 mg now + 300 mg at bedtime',
          'Vitamin C: 1000 mg — antioxidant + cortisol suppression',
          'Omega-3: 2 g — reduces muscle inflammation',
          'Vitamin D3 + K2: take with fat-containing dinner',
          'Protein meal: 40 g within 1 hour',
        ],
      },
    ],

    // ── Cross-Module Insights ────────────────────────────────────────────────
    crossInsights: [
      {
        id: 'sim-ci1',
        title: 'Fitness × Dietary: Supplement Stack Critical',
        description: 'Your heavy bench press session has opened the anabolic window. Creatine replenishes ATP stores; magnesium reduces DOMS and improves sleep quality; vitamin C and omega-3 fight inflammation. All 5 supplements are needed within the next hour.',
        modules: ['fitness', 'dietary'],
        type: 'opportunity',
        timestamp: isoNow,
      },
      {
        id: 'sim-ci2',
        title: 'Health × Shopping: Creatine Running Low',
        description: 'Based on your supplement schedule, creatine monohydrate stock is likely running low. Add it to your shopping list to avoid missing doses — consistency is essential for creatine saturation.',
        modules: ['health', 'shopping'],
        type: 'risk',
        timestamp: isoNow,
      },
    ],

    // ── Smart Recommendations ────────────────────────────────────────────────
    recommendations: [
      {
        id: 'sim-r1',
        title: 'Take Creatine Monohydrate 5 g',
        description: 'Post-workout creatine replenishes phosphocreatine stores faster than resting supplementation. Mix with warm water or your protein shake.',
        type: 'do-now',
        module: 'dietary',
        actionLabel: 'Log Supplement',
        actionPath: '/app/dietary',
      },
      {
        id: 'sim-r2',
        title: 'Take Magnesium Glycinate 300 mg',
        description: 'Magnesium reduces post-exercise muscle soreness, supports deep sleep (critical tonight), and helps regulate cortisol. Take now and repeat at bedtime.',
        type: 'do-now',
        module: 'dietary',
        actionLabel: 'Log Supplement',
        actionPath: '/app/dietary',
      },
      {
        id: 'sim-r3',
        title: 'Take Vitamin C 1000 mg + Omega-3 2 g',
        description: 'Vitamin C neutralises free radicals generated during heavy lifting and blunts excess cortisol. Omega-3 fatty acids reduce muscle inflammation and accelerate repair.',
        type: 'do-now',
        module: 'dietary',
        actionLabel: 'Log Supplements',
        actionPath: '/app/dietary',
      },
      {
        id: 'sim-r4',
        title: 'Eat 40 g Protein + Fast Carbs',
        description: 'Chicken breast + white rice is ideal. Protein drives muscle protein synthesis; fast carbs spike insulin which shuttles nutrients into depleted muscle tissue.',
        type: 'do-now',
        module: 'dietary',
        actionLabel: 'Log Meal',
        actionPath: '/app/dietary',
      },
      {
        id: 'sim-r5',
        title: 'Take Vitamin D3 5000 IU + K2 100 µg (with dinner)',
        description: 'Vitamin D3 supports testosterone production and calcium absorption. K2 directs calcium into bones (not arteries). Take with a fat-containing meal for absorption.',
        type: 'plan',
        module: 'dietary',
        actionLabel: 'Set Reminder',
        actionPath: '/app/dietary',
      },
      {
        id: 'sim-r6',
        title: 'Deload Tomorrow — No Chest Training',
        description: 'After a personal best effort, DOMS will peak 24–48 h later. Train legs or do active recovery tomorrow. Re-hit chest in 72 hours for optimal super-compensation.',
        type: 'recover',
        module: 'fitness',
        actionLabel: 'View Fitness',
        actionPath: '/app/fitness',
      },
    ],

    // ── Weekly Summary ───────────────────────────────────────────────────────
    weeklySummary: {
      wins: [
        'Bench press personal best — 110 kg (5×5) 🏆',
        '4-day training streak maintained',
        'All scheduled workouts completed this week',
      ],
      risks: [
        'Post-workout supplement stack often skipped — act now',
        'Sleep quality has been inconsistent — address tonight',
        'Hydration levels lower than optimal on training days',
      ],
      missedItems: [
        'Creatine dose missed yesterday',
        'Post-workout protein meal delayed by 2+ hours on Tuesday',
      ],
      adherence: {
        fitness:   92,
        dietary:   58,
        health:    71,
        education: 45,
        shopping:  80,
      },
      predictedPriorities: [
        'Chest DOMS management tomorrow',
        'Sleep 8+ hours tonight',
        'Replenish creatine stock',
        'Leg day or active recovery tomorrow',
      ],
    },

  });
}
