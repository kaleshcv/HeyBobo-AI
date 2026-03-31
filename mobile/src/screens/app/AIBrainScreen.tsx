import React, { useMemo, useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAppNavigation } from '@/navigation/useAppNavigation'
import { useAuthStore } from '@/store/authStore'
import { useAIBrainStore } from '@/store/aiBrainStore'
import { useActivityTrackingStore } from '@/store/activityTrackingStore'
import { useLearningStats } from '@/hooks/useCourses'
import { useWorkoutSessions, useTodayActivity } from '@/hooks/useFitness'
import T from '@/theme'

// ─── Dark theme colours matching web dashboard ─────────────────────────────
const C = {
  bg:           '#0f172a',
  surface:      T.text,
  surface2:     '#334155',
  border:       '#334155',
  primary:      T.primary2,
  primaryLight: T.primary,
  green:        '#22c55e',
  yellow:       '#eab308',
  red:          T.red,
  orange:       '#f97316',
  cyan:         '#06b6d4',
  white:        T.bg,
  muted:        T.muted2,
  muted2:       T.muted,
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const clamp = (v: number) => Math.max(0, Math.min(100, v))
const pad2   = (n: number) => String(n).padStart(2, '0')

function getGreeting(hour: number) {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getDateLabel() {
  const now  = new Date()
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const mons = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${days[now.getDay()]}, ${mons[now.getMonth()]} ${now.getDate()}`
}

function getLiveClock() {
  const now = new Date()
  const h = now.getHours()
  const m = now.getMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${pad2(h12)}:${pad2(m)} ${ampm}`
}

// ─── Module chips config ────────────────────────────────────────────────────
const MODULE_CHIPS = [
  { label: 'Learn',   icon: 'school-outline',      color: T.primary,  tab: 'Education', screen: 'CoursesList' },
  { label: 'Fitness', icon: 'barbell-outline',      color: T.green,    tab: 'Health',    screen: 'FitnessDashboard' },
  { label: 'Health',  icon: 'heart-outline',        color: T.red,      tab: 'Health',    screen: 'HealthHub' },
  { label: 'Diet',    icon: 'nutrition-outline',    color: T.yellow,   tab: 'Dietary',   screen: 'DietaryDashboard' },
  { label: 'Shop',    icon: 'cart-outline',         color: T.cyan,     tab: 'Dietary',   screen: 'ShoppingHub' },
  { label: 'Groups',  icon: 'people-outline',       color: T.orange,   tab: 'Education', screen: 'Groups' },
]

// ─── Quest XP mapping ───────────────────────────────────────────────────────
const QUEST_XP = [100, 75, 50, 60, 50, 80]

// ─── Static daily quests (web-matching) ─────────────────────────────────────
const DAILY_QUESTS = [
  { id: 'dq1', label: 'Kickstart Protein Intake',  xp: 100, icon: 'nutrition-outline',   color: '#f97316' },
  { id: 'dq2', label: 'Walk for Wellness',          xp: 75,  icon: 'walk-outline',         color: '#22c55e' },
  { id: 'dq3', label: 'Log Meals Consistently',     xp: 50,  icon: 'restaurant-outline',   color: '#eab308' },
  { id: 'dq4', label: 'Review Grocery Needs',       xp: 60,  icon: 'cart-outline',         color: '#06b6d4' },
]

// ─── Smart nudges ─────────────────────────────────────────────────────────────
const SMART_NUDGES = [
  { id: 'n1', emoji: '💧', text: 'Hydration check — 4+ glasses by now (aim for 3L today)' },
  { id: 'n2', emoji: '🧍', text: 'Stand up & stretch — 2 min break every hour reduces back strain by 40%' },
  { id: 'n3', emoji: '🌙', text: 'Wind-down in 1h — consistent sleep improves recovery by 30%' },
  { id: 'n4', emoji: '🧠', text: 'Quick review session now locks in long-term memory' },
]

// ─── Achievements ─────────────────────────────────────────────────────────────
const ACHIEVEMENTS_DEF = [
  { id: 'a1', label: 'First Steps',   icon: 'footsteps-outline', color: T.primary2, desc: 'Log first activity' },
  { id: 'a2', label: 'Goal Crusher',  icon: 'trophy-outline',    color: '#eab308', desc: 'Hit daily goal' },
  { id: 'a3', label: 'On Fire',       icon: 'flame-outline',     color: T.red, desc: '3-day streak' },
  { id: 'a4', label: 'Scholar',       icon: 'school-outline',    color: '#06b6d4', desc: 'Complete 5 lessons' },
  { id: 'a5', label: 'Level 5',       icon: 'star-outline',      color: '#a855f7', desc: 'Reach Level 5' },
]

// ─── Small sub-components ───────────────────────────────────────────────────

function Badge({ children, color = T.primary, textColor = '#fff' }: {
  children: React.ReactNode; color?: string; textColor?: string
}) {
  return (
    <View style={[styles.badge, { backgroundColor: `${color}33`, borderColor: `${color}66` }]}>
      <Text style={[styles.badgeText, { color }]}>{children}</Text>
    </View>
  )
}

function ProgressBar({ value, color = T.primary, height = 6 }: {
  value: number; color?: string; height?: number
}) {
  return (
    <View style={[styles.progressTrack, { height }]}>
      <View style={[styles.progressFill, { width: `${clamp(value)}%`, backgroundColor: color, height }]} />
    </View>
  )
}

function StatCard({ label, value, unit, pct, color }: {
  label: string; value: number | string; unit?: string; pct?: number; color: string
}) {
  return (
    <View style={[styles.statCard, { borderColor: `${color}33` }]}>
      <Text style={[styles.statLabel, { color: T.muted }]}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>
        {value}<Text style={styles.statUnit}>{unit}</Text>
      </Text>
      {pct !== undefined && (
        <>
          <ProgressBar value={pct} color={color} height={4} />
          <Text style={[styles.statPct, { color: T.muted }]}>{pct}% of goal</Text>
        </>
      )}
    </View>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
export function AIBrainScreen() {
  const insets     = useSafeAreaInsets()
  const navigation = useAppNavigation()
  const { user }   = useAuthStore()

  const { alerts, dismissAlert, scheduleEvents, moduleInsights, priorityItems } = useAIBrainStore()
  const { goals, workouts, getDailyMetrics } = useActivityTrackingStore()

  const { data: learningStats }  = useLearningStats()
  const { data: workoutSessions } = useWorkoutSessions()
  const { data: todayActivityApi } = useTodayActivity()

  const [clock, setClock] = useState(getLiveClock())
  useEffect(() => {
    const t = setInterval(() => setClock(getLiveClock()), 30000)
    return () => clearInterval(t)
  }, [])

  // ── Quest completion state ────────────────────────────────────────────────
  const [questDone, setQuestDone] = useState<Record<string, boolean>>({})
  const toggleQuest = (id: string) => setQuestDone((prev) => ({ ...prev, [id]: !prev[id] }))
  const questsCompleted = DAILY_QUESTS.filter((q) => questDone[q.id]).length

  // ── Bobo Says dismissal ───────────────────────────────────────────────────
  const [boboDismissed, setBoboDismissed] = useState(false)

  const firstName = user?.firstName ?? 'Student'
  const hour      = new Date().getHours()
  const greeting  = getGreeting(hour)
  const dateLabel = getDateLabel()

  // ── Today's activity metrics ──────────────────────────────────────────────
  const todayStr      = new Date().toISOString().slice(0, 10)
  const todayLocal    = getDailyMetrics(todayStr)
  const todayActivity = todayActivityApi ?? todayLocal

  const stepPct = clamp(Math.round((todayActivity.steps        / Math.max(goals.steps, 1)) * 100))
  const calPct  = clamp(Math.round((todayActivity.caloriesBurned / Math.max(goals.caloriesBurned, 1)) * 100))
  const actPct  = clamp(Math.round((todayActivity.activeMinutes  / Math.max(goals.activeMinutes, 1)) * 100))

  // ── XP / Level calculation ────────────────────────────────────────────────
  const xpData = useMemo(() => {
    const completedLessons = (learningStats as any)?.completedLessons ?? 0
    const quizScore        = (learningStats as any)?.avgQuizScore ?? 0
    const wkLogs           = workoutSessions?.length ?? workouts.length
    const lectXP  = completedLessons * 50
    const quizXP  = Math.round(quizScore)
    const wkXP    = wkLogs * 80
    const total   = lectXP + quizXP + wkXP
    const level   = Math.floor(total / 500) + 1
    const inLevel = total % 500
    return { total, level, inLevel, forLevel: 500 }
  }, [learningStats, workoutSessions, workouts])

  // ── Streak calculation ────────────────────────────────────────────────────
  const streak = useMemo(() => {
    const allWorkouts = workouts.map((w) => w.date).sort().reverse()
    if (allWorkouts.length === 0) return 0
    let count = 0
    let cursor = new Date()
    cursor.setHours(0, 0, 0, 0)
    for (const dateStr of allWorkouts) {
      const d = new Date(dateStr)
      d.setHours(0, 0, 0, 0)
      const diff = Math.round((cursor.getTime() - d.getTime()) / 86400000)
      if (diff === 0 || diff === count) {
        count++
        cursor = d
      } else {
        break
      }
    }
    return count
  }, [workouts])

  // ── Achievements unlock logic ─────────────────────────────────────────────
  const completedLessonsCount = (learningStats as any)?.completedLessons ?? 0
  const unlockedAchievements: Record<string, boolean> = {
    a1: todayActivity.steps > 0 || workouts.length > 0,
    a2: stepPct >= 100 || calPct >= 100,
    a3: streak >= 3,
    a4: completedLessonsCount >= 5,
    a5: xpData.level >= 5,
  }

  // ── Quests from priorityItems / scheduleEvents ────────────────────────────
  const quests = useMemo(() =>
    priorityItems.slice(0, 6).map((item, i) => ({
      id:    item.id,
      label: item.title,
      xp:    QUEST_XP[i % 6],
      done:  false,
    }))
  , [priorityItems])

  // ── Module scores from insights ───────────────────────────────────────────
  const moduleScores = useMemo(() => {
    const fitness  = moduleInsights.find((m) => m.module === 'Health')?.score    ?? 68
    const dietary  = moduleInsights.find((m) => m.module === 'Nutrition')?.score ?? 75
    const learning = moduleInsights.find((m) => m.module === 'Learning')?.score  ?? 82
    return [
      { label: 'Fitness',  score: fitness,  color: T.green },
      { label: 'Dietary',  score: dietary,  color: T.yellow },
      { label: 'Learning', score: learning, color: T.primary },
    ]
  }, [moduleInsights])

  // ── Today's plan ─────────────────────────────────────────────────────────
  const todayPlan = scheduleEvents.slice(0, 5)
  const planDone  = todayPlan.filter((e) => e.completed).length

  // ── Suggestions ───────────────────────────────────────────────────────────
  const suggestions = useMemo(() => {
    const list: { label: string; tag: string; color: string }[] = []
    if (stepPct < 50)  list.push({ label: 'Take a walk — steps below 50%',     tag: 'Activity', color: T.green })
    if (calPct < 40)   list.push({ label: 'Log your calories today',             tag: 'Diet',     color: T.yellow })
    if (actPct < 30)   list.push({ label: 'Try a 20-min workout session',        tag: 'Fitness',  color: T.primary })
    list.push({ label: 'Review today\'s lecture materials', tag: 'Learn', color: T.cyan })
    list.push({ label: 'Check your shopping list',          tag: 'Shop',  color: T.orange })
    return list.slice(0, 4)
  }, [stepPct, calPct, actPct])

  // ── Navigate helper ───────────────────────────────────────────────────────
  const goTo = (tab: string, screen: string) => {
    navigation.navigate(tab as any, { screen } as any)
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Header ───────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.dateLabel}>{dateLabel}</Text>
          <Text style={styles.greeting}>{greeting}, {firstName} 👋</Text>
        </View>

        {/* ── Status chips row ─────────────────────────────── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow} contentContainerStyle={styles.chipsContent}>
          <View style={[styles.chip, { borderColor: `${T.green}66` }]}>
            <View style={styles.liveDot} />
            <Text style={[styles.chipText, { color: T.green }]}>Live  {clock}</Text>
          </View>
          <View style={[styles.chip, { borderColor: `${T.orange}66` }]}>
            <Text style={[styles.chipText, { color: T.orange }]}>🔥 {streak} day streak</Text>
          </View>
          <View style={[styles.chip, { borderColor: `${T.primary}66` }]}>
            <Text style={[styles.chipText, { color: T.primary }]}>⚡ Level {xpData.level}</Text>
          </View>
          <View style={[styles.chip, { borderColor: `${T.yellow}66` }]}>
            <Text style={[styles.chipText, { color: T.yellow }]}>✨ {xpData.total} XP</Text>
          </View>
        </ScrollView>

        {/* ── XP progress bar ──────────────────────────────── */}
        <View style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpLabel}>Next Level</Text>
            <Text style={styles.xpCount}>{xpData.inLevel} / {xpData.forLevel} XP</Text>
          </View>
          <ProgressBar value={Math.round((xpData.inLevel / xpData.forLevel) * 100)} color={T.primary} height={8} />
        </View>

        {/* ── Alerts ───────────────────────────────────────── */}
        {alerts.filter((a) => !a.dismissed).slice(0, 3).map((alert) => {
          const col = alert.severity === 'error' ? T.red : alert.severity === 'warning' ? T.yellow : alert.severity === 'success' ? T.green : T.primary
          return (
            <View key={alert.id} style={[styles.alertCard, { borderLeftColor: col }]}>
              <Ionicons name={alert.icon as any} size={16} color={col} />
              <View style={styles.alertBody}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertDesc}>{alert.description}</Text>
              </View>
              <TouchableOpacity onPress={() => dismissAlert(alert.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={16} color={T.muted} />
              </TouchableOpacity>
            </View>
          )
        })}

        {/* ── Stats row ────────────────────────────────────── */}
        <View style={styles.statsRow}>
          <StatCard label="STEPS"    value={todayActivity.steps}         pct={stepPct} color={T.green}  />
          <StatCard label="CALORIES" value={todayActivity.caloriesBurned} unit=" kcal" pct={calPct} color={T.orange} />
          <StatCard label="ACTIVE"   value={todayActivity.activeMinutes}  unit=" min"  pct={actPct} color={T.primary} />
        </View>

        {/* ── Module chips ─────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Modules</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moduleChipsRow} contentContainerStyle={styles.moduleChipsContent}>
          {MODULE_CHIPS.map((chip) => (
            <TouchableOpacity
              key={chip.label}
              style={[styles.moduleChip, { borderColor: `${chip.color}55` }]}
              onPress={() => goTo(chip.tab, chip.screen)}
              activeOpacity={0.7}
            >
              <Ionicons name={chip.icon as any} size={18} color={chip.color} />
              <Text style={[styles.moduleChipText, { color: chip.color }]}>{chip.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Two-column: Today's Plan + Module Scores ─────── */}
        <View style={styles.twoCol}>
          {/* Today's Plan */}
          <View style={[styles.colCard, { flex: 1 }]}>
            <Text style={styles.colTitle}>Today's Plan</Text>
            <Text style={styles.colSubtitle}>{planDone}/{todayPlan.length} done</Text>
            {todayPlan.length === 0 ? (
              <Text style={styles.emptyText}>No events scheduled</Text>
            ) : (
              todayPlan.map((event) => (
                <View key={event.id} style={styles.planItem}>
                  <View style={[styles.planDot, { backgroundColor: event.completed ? T.green : T.muted2 }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.planTitle, event.completed && styles.strikethrough]} numberOfLines={1}>
                      {event.title}
                    </Text>
                    <Text style={styles.planTime}>{event.time}</Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Module Scores */}
          <View style={[styles.colCard, { flex: 1 }]}>
            <Text style={styles.colTitle}>Module Scores</Text>
            {moduleScores.map((m) => (
              <View key={m.label} style={styles.moduleScoreItem}>
                <View style={styles.moduleScoreHeader}>
                  <Text style={styles.moduleScoreLabel}>{m.label}</Text>
                  <Text style={[styles.moduleScoreValue, { color: m.color }]}>{m.score}</Text>
                </View>
                <ProgressBar value={m.score} color={m.color} height={5} />
              </View>
            ))}
          </View>
        </View>

        {/* ── Daily Quests (full-width) ─────────────────────── */}
        <View style={styles.fullCard}>
          <View style={styles.fullCardHeader}>
            <View style={styles.fullCardTitleRow}>
              <Text style={styles.fullCardIcon}>⭐</Text>
              <Text style={styles.fullCardTitle}>Daily Quests</Text>
            </View>
            <Text style={styles.fullCardCount}>{questsCompleted}/{DAILY_QUESTS.length}</Text>
          </View>
          {DAILY_QUESTS.map((quest) => {
            const done = questDone[quest.id] ?? false
            return (
              <TouchableOpacity
                key={quest.id}
                style={styles.questRow}
                onPress={() => toggleQuest(quest.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={done ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={done ? T.green : T.muted2}
                />
                <Text style={[styles.questRowLabel, done && styles.strikethrough]}>
                  {quest.label}
                </Text>
                <View style={[styles.xpPill, { backgroundColor: `${quest.color}22`, borderColor: `${quest.color}44` }]}>
                  <Text style={[styles.xpPillText, { color: quest.color }]}>+{quest.xp} XP</Text>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* ── Suggested for You (full-width) ───────────────── */}
        <View style={styles.fullCard}>
          <View style={styles.fullCardHeader}>
            <View style={styles.fullCardTitleRow}>
              <Text style={styles.fullCardIcon}>✨</Text>
              <Text style={styles.fullCardTitle}>Suggested for You</Text>
            </View>
          </View>
          {/* Step goal suggestion */}
          <View style={styles.suggRow}>
            <View style={[styles.suggIconBox, { backgroundColor: `${T.green}22` }]}>
              <Text style={styles.suggIconEmoji}>🏃</Text>
            </View>
            <View style={styles.suggInfo}>
              <Text style={styles.suggTitle}>
                {goals.steps - todayActivity.steps > 0
                  ? `${(goals.steps - todayActivity.steps).toLocaleString()} Steps to Go`
                  : 'Step Goal Reached! 🎉'}
              </Text>
              <Text style={styles.suggSub}>
                {todayActivity.steps.toLocaleString()} of {goals.steps.toLocaleString()} goal
              </Text>
            </View>
            <View style={[styles.suggTag, { backgroundColor: `${T.green}22` }]}>
              <Text style={[styles.suggTagText, { color: T.green }]}>Fitness</Text>
            </View>
          </View>
          {/* Shopping suggestion */}
          <View style={styles.suggRow}>
            <View style={[styles.suggIconBox, { backgroundColor: `${T.cyan}22` }]}>
              <Text style={styles.suggIconEmoji}>🛒</Text>
            </View>
            <View style={styles.suggInfo}>
              <Text style={styles.suggTitle}>Weekly Groceries</Text>
              <Text style={styles.suggSub}>Review your shopping list</Text>
            </View>
            <View style={[styles.suggTag, { backgroundColor: `${T.cyan}22` }]}>
              <Text style={[styles.suggTagText, { color: T.cyan }]}>Shopping</Text>
            </View>
          </View>
          {/* Calorie suggestion if low */}
          {calPct < 50 && (
            <View style={styles.suggRow}>
              <View style={[styles.suggIconBox, { backgroundColor: `${T.yellow}22` }]}>
                <Text style={styles.suggIconEmoji}>🍽️</Text>
              </View>
              <View style={styles.suggInfo}>
                <Text style={styles.suggTitle}>Log Your Meals</Text>
                <Text style={styles.suggSub}>Only {calPct}% of calorie goal logged</Text>
              </View>
              <View style={[styles.suggTag, { backgroundColor: `${T.yellow}22` }]}>
                <Text style={[styles.suggTagText, { color: T.yellow }]}>Diet</Text>
              </View>
            </View>
          )}
        </View>

        {/* ── Bobo Says ────────────────────────────────────── */}
        {!boboDismissed && (
          <View style={styles.fullCard}>
            <View style={styles.fullCardHeader}>
              <View style={styles.fullCardTitleRow}>
                <Text style={styles.fullCardIcon}>💬</Text>
                <Text style={styles.fullCardTitle}>Bobo Says</Text>
              </View>
            </View>
            <View style={styles.boboInsight}>
              <View style={styles.boboInsightHeader}>
                <Text style={styles.boboInsightTitle}>Foundational Habit Opportunity</Text>
                <TouchableOpacity onPress={() => setBoboDismissed(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close" size={16} color={T.muted} />
                </TouchableOpacity>
              </View>
              <Text style={styles.boboInsightDesc}>
                {todayActivity.steps === 0 && todayActivity.caloriesBurned === 0
                  ? 'With sleep and recovery data unknown, coupled with 0 logged activity and dietary intake, today presents a prime opportunity to establish strong foundational habits across fitness, dietary, and health modules.'
                  : `You've made a great start today with ${todayActivity.steps.toLocaleString()} steps and ${todayActivity.caloriesBurned} calories burned. Keep the momentum going — consistency is the key to long-term progress.`}
              </Text>
              <View style={styles.boboTags}>
                {[
                  { label: 'fitness',  color: T.green },
                  { label: 'dietary',  color: T.red },
                  { label: 'health',   color: T.red },
                ].map((t) => (
                  <View key={t.label} style={[styles.boboTag, { backgroundColor: `${t.color}22` }]}>
                    <Text style={[styles.boboTagText, { color: t.color }]}>{t.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ── Smart Nudges ─────────────────────────────────── */}
        <View style={styles.fullCard}>
          <View style={styles.fullCardHeader}>
            <View style={styles.fullCardTitleRow}>
              <Text style={styles.fullCardIcon}>⚡</Text>
              <Text style={styles.fullCardTitle}>Smart Nudges</Text>
            </View>
          </View>
          <View style={styles.nudgesGrid}>
            {SMART_NUDGES.slice(0, 4).map((nudge) => (
              <View key={nudge.id} style={styles.nudgeCard}>
                <Text style={styles.nudgeEmoji}>{nudge.emoji}</Text>
                <Text style={styles.nudgeText}>{nudge.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Achievements ─────────────────────────────────── */}
        <View style={styles.fullCard}>
          <View style={styles.fullCardHeader}>
            <View style={styles.fullCardTitleRow}>
              <Text style={styles.fullCardIcon}>🏆</Text>
              <Text style={styles.fullCardTitle}>Achievements</Text>
            </View>
            <Text style={styles.fullCardCount}>
              {Object.values(unlockedAchievements).filter(Boolean).length}/{ACHIEVEMENTS_DEF.length}
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achieveRow}>
            {ACHIEVEMENTS_DEF.map((a) => {
              const unlocked = unlockedAchievements[a.id] ?? false
              return (
                <View key={a.id} style={[styles.achieveCard, { opacity: unlocked ? 1 : 0.4 }]}>
                  <View style={[styles.achieveIconBox, { backgroundColor: `${a.color}22` }]}>
                    <Ionicons name={a.icon as any} size={22} color={unlocked ? a.color : T.muted2} />
                  </View>
                  <Text style={[styles.achieveLabel, { color: unlocked ? T.white : T.muted }]}>{a.label}</Text>
                  <Text style={styles.achieveDesc}>{a.desc}</Text>
                  {unlocked && (
                    <View style={styles.achieveUnlocked}>
                      <Text style={styles.achieveUnlockedText}>✓</Text>
                    </View>
                  )}
                </View>
              )
            })}
          </ScrollView>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // Header
  header: {
    marginBottom: 14,
  },
  dateLabel: {
    fontSize: 12,
    color: T.muted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: T.white,
  },

  // Status chips
  chipsRow: {
    marginBottom: 14,
  },
  chipsContent: {
    gap: 8,
    paddingRight: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: T.surface,
    gap: 5,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: T.green,
  },

  // XP card
  xpCard: {
    backgroundColor: T.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: T.border,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  xpLabel: {
    fontSize: 12,
    color: T.muted,
    fontWeight: '600',
  },
  xpCount: {
    fontSize: 12,
    color: T.white,
    fontWeight: '600',
  },

  // Alert
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    gap: 10,
    borderWidth: 1,
    borderColor: T.border,
  },
  alertBody: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: T.white,
  },
  alertDesc: {
    fontSize: 11,
    color: T.muted,
    marginTop: 2,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: T.surface,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    gap: 4,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
  },
  statUnit: {
    fontSize: 10,
    fontWeight: '400',
  },
  statPct: {
    fontSize: 9,
    marginTop: 2,
  },

  // Progress bar
  progressTrack: {
    backgroundColor: T.surface2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 4,
  },

  // Section title
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: T.white,
    marginBottom: 10,
  },

  // Module chips
  moduleChipsRow: {
    marginBottom: 18,
  },
  moduleChipsContent: {
    gap: 8,
    paddingRight: 8,
  },
  moduleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: T.surface,
    gap: 6,
  },
  moduleChipText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Two-col layout
  twoCol: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  colCard: {
    backgroundColor: T.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: T.border,
  },
  colTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: T.white,
    marginBottom: 2,
  },
  colSubtitle: {
    fontSize: 10,
    color: T.muted,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 11,
    color: T.muted2,
    fontStyle: 'italic',
  },

  // Today's plan
  planItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 6,
  },
  planDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  planTitle: {
    fontSize: 11,
    color: T.white,
    fontWeight: '500',
    flex: 1,
  },
  planTime: {
    fontSize: 10,
    color: T.muted,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: T.muted2,
  },

  // Module scores
  moduleScoreItem: {
    marginBottom: 9,
  },
  moduleScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  moduleScoreLabel: {
    fontSize: 11,
    color: T.muted,
  },
  moduleScoreValue: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Quests
  questItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 5,
  },
  questLabel: {
    flex: 1,
    fontSize: 11,
    color: T.white,
    lineHeight: 15,
  },
  xpBadge: {
    backgroundColor: `${T.yellow}22`,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  xpBadgeText: {
    fontSize: 9,
    color: T.yellow,
    fontWeight: '700',
  },

  // Suggestions
  suggestionItem: {
    marginBottom: 9,
  },
  suggestionLabel: {
    fontSize: 11,
    color: T.white,
    marginBottom: 3,
    lineHeight: 15,
  },
  suggestionTag: {
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  suggestionTagText: {
    fontSize: 9,
    fontWeight: '700',
  },

  // Badge
  badge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // ── Full-width card ──────────────────────────────────────────────────────
  fullCard: {
    backgroundColor: T.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: T.border,
  },
  fullCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  fullCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fullCardIcon: {
    fontSize: 16,
  },
  fullCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: T.white,
  },
  fullCardCount: {
    fontSize: 12,
    color: T.muted,
    fontWeight: '600',
  },

  // ── Quest rows ───────────────────────────────────────────────────────────
  questRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: T.border,
    gap: 10,
  },
  questRowLabel: {
    flex: 1,
    fontSize: 14,
    color: T.white,
    fontWeight: '500',
  },
  xpPill: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  xpPillText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // ── Suggested rows ───────────────────────────────────────────────────────
  suggRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: T.border,
    gap: 12,
  },
  suggIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggIconEmoji: {
    fontSize: 18,
  },
  suggInfo: {
    flex: 1,
  },
  suggTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: T.white,
    marginBottom: 2,
  },
  suggSub: {
    fontSize: 11,
    color: T.muted,
  },
  suggTag: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  suggTagText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // ── Bobo Says ────────────────────────────────────────────────────────────
  boboInsight: {
    backgroundColor: T.surface2,
    borderRadius: 10,
    padding: 14,
  },
  boboInsightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 10,
  },
  boboInsightTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: T.white,
    flex: 1,
  },
  boboInsightDesc: {
    fontSize: 12,
    color: T.muted,
    lineHeight: 18,
    marginBottom: 10,
  },
  boboTags: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  boboTag: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  boboTagText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // ── Smart Nudges ─────────────────────────────────────────────────────────
  nudgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  nudgeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: T.surface2,
    borderRadius: 10,
    padding: 12,
    gap: 8,
    width: '48%',
    flexGrow: 1,
  },
  nudgeEmoji: {
    fontSize: 16,
    marginTop: 1,
  },
  nudgeText: {
    flex: 1,
    fontSize: 12,
    color: T.white,
    lineHeight: 17,
  },

  // ── Achievements ─────────────────────────────────────────────────────────
  achieveRow: {
    gap: 10,
    paddingBottom: 4,
  },
  achieveCard: {
    backgroundColor: T.surface2,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    width: 100,
    gap: 6,
  },
  achieveIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  achieveLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  achieveDesc: {
    fontSize: 9,
    color: T.muted2,
    textAlign: 'center',
    lineHeight: 13,
  },
  achieveUnlocked: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: T.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achieveUnlockedText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '800',
  },
})
