import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Checkbox,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { useAIBrainStore } from '@/store/aiBrainStore';
import { useWearablesStore, type HealthReading } from '@/store/wearablesStore';
import { useActivityTrackingStore } from '@/store/activityTrackingStore';
import { useWorkoutSystemStore } from '@/store/workoutSystemStore';
import { useLiveWorkoutStore } from '@/store/liveWorkoutStore';
import { useCourseStore } from '@/store/courseStore';
import { useShoppingListStore } from '@/store/shoppingListStore';
import { useInjuryStore } from '@/store/injuryStore';

// ── helpers ──────────────────────────────────────────────────────────────────
function todayStr() { return new Date().toISOString().slice(0, 10); }

function stressLabel(score: number): { value: string; color: string } {
  if (score <= 0)  return { value: '—', color: '#9e9e9e' };
  if (score <= 30) return { value: 'Low', color: '#43a047' };
  if (score <= 60) return { value: 'Medium', color: '#e65100' };
  return { value: 'High', color: '#d32f2f' };
}

function recoveryLabel(score: number): { value: string; color: string } {
  if (score <= 0)  return { value: '—', color: '#9e9e9e' };
  if (score >= 70) return { value: 'Good', color: '#43a047' };
  if (score >= 40) return { value: 'Medium', color: '#e65100' };
  return { value: 'Low', color: '#d32f2f' };
}

function workoutIntensity(minutes: number): { value: string; color: string } {
  if (minutes <= 0)  return { value: 'None', color: '#9e9e9e' };
  if (minutes <= 20) return { value: 'Light', color: '#0288d1' };
  if (minutes <= 45) return { value: 'Moderate', color: '#e65100' };
  return { value: 'Heavy', color: '#d32f2f' };
}

const QUICK_ACTIONS = [
  { emoji: '🏃', label: 'Workout',  path: '/app/fitness' },
  { emoji: '🍎', label: 'Log Meal', path: '/app/dietary' },
  { emoji: '🧘', label: 'Meditate', path: '/app/fitness' },
  { emoji: '🛒', label: 'Shop',     path: '/app/shopping' },
];

const MODULE_SCORE_META: Record<string, { emoji: string; color: string }> = {
  education:    { emoji: '📚', color: '#1976d2' },
  fitness:      { emoji: '🏋️', color: '#ef5350' },
  health:       { emoji: '❤️', color: '#d32f2f' },
  dietary:      { emoji: '🍎', color: '#2e7d32' },
  wellness:     { emoji: '👤', color: '#9c27b0' },
  injury:       { emoji: '🩹', color: '#f57c00' },
  shopping:     { emoji: '🛒', color: '#7b1fa2' },
  groups:       { emoji: '👥', color: '#e91e63' },
  productivity: { emoji: '⚡', color: '#ffa000' },
  social:       { emoji: '👥', color: '#e91e63' },
};

function ScoreCircle({ score, color, emoji, label }: { score: number; color: string; emoji: string; label: string }) {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box sx={{ position: 'relative', display: 'inline-flex', mb: 0.25 }}>
        <CircularProgress variant="determinate" value={100} size={42} thickness={3.5}
          sx={{ color: '#eeeeee', position: 'absolute' }} />
        <CircularProgress variant="determinate" value={score} size={42} thickness={3.5}
          sx={{ color }} />
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ fontWeight: 700, fontSize: 12 }}>{score}</Typography>
        </Box>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: 10 }}>
        {emoji} {label}
      </Typography>
    </Box>
  );
}

function Section({ children, sx }: { children: React.ReactNode; sx?: object }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, p: 1.5, height: '100%', ...sx }}>
      {children}
    </Paper>
  );
}

// ── Main component — ALL data from stores ────────────────────────────────────
export default function SimpleLifeDashboard() {
  const navigate = useNavigate();

  // ── Store reads ───────────────────────────────────────────────────
  const { schedule, moduleInsights, alerts: brainAlerts, recommendations, crossInsights } = useAIBrainStore();

  const wearableReadings = useWearablesStore((s) => s.readings);
  const todayMetrics = useActivityTrackingStore((s) => s.getDailyMetrics(todayStr()));

  const workoutLogs = useWorkoutSystemStore((s) => s.workoutLogs);
  const liveSessions = useLiveWorkoutStore((s) => s.sessions);

  const videoProgress = useCourseStore((s) => s.progress);
  const quizProgress = useCourseStore((s) => s.quizProgress);

  const shoppingLists = useShoppingListStore((s) => s.lists);

  const activityGoals = useActivityTrackingStore((s) => s.goals);
  const courses = useCourseStore((s) => s.courses);
  const getCourseProgress = useCourseStore((s) => s.getCourseProgress);
  const activeInjuries = useInjuryStore((s) => s.getActiveInjuries());
  const rehabPrograms = useInjuryStore((s) => s.rehabPrograms);
  const wearableAlerts = useWearablesStore((s) => s.alerts);

  // ── Local UI state ────────────────────────────────────────────────
  const [missionsDone, setMissionsDone] = useState<Set<number>>(new Set());
  const [dismissedCards, setDismissedCards] = useState<Set<string>>(new Set());

  const toggleMission = (i: number) =>
    setMissionsDone(prev => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; });
  const dismissCard = (id: string) =>
    setDismissedCards(prev => new Set([...prev, id]));

  // ── Derived data ──────────────────────────────────────────────────

  const latestReading = (metric: string): number => {
    const reading = wearableReadings
      .filter((r: HealthReading) => r.metric === metric)
      .sort((a: HealthReading, b: HealthReading) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];
    return reading?.value ?? 0;
  };

  const sleepHours = latestReading('sleep-duration');
  const stressScore = latestReading('stress-level');
  const recoveryScore = latestReading('readiness-score') || latestReading('recovery-score');
  const todayWorkoutMinutes = todayMetrics.activeMinutes;

  const stress = stressLabel(stressScore);
  const recovery = recoveryLabel(recoveryScore);
  const workout = workoutIntensity(todayWorkoutMinutes);

  const vitals = [
    { label: 'Sleep', value: sleepHours > 0 ? `${sleepHours.toFixed(1)}h` : '—', color: sleepHours > 0 && sleepHours < 6 ? '#e65100' : sleepHours >= 7 ? '#43a047' : '#9e9e9e' },
    { label: 'Stress', value: stress.value, color: stress.color },
    { label: 'Recovery', value: recovery.value, color: recovery.color },
    { label: 'Workout', value: workout.value, color: workout.color },
  ];

  const vitalsSummary = useMemo(() => {
    if (sleepHours > 0 && sleepHours < 6) return `😴 Only ${sleepHours.toFixed(1)}h sleep — light stretching recommended`;
    if (stressScore > 60) return '😰 Stress is elevated — consider a break or light activity';
    if (todayWorkoutMinutes > 45) return '🏋️ Heavy workout — remember to stretch and hydrate';
    if (sleepHours >= 7) return '🌟 Good sleep — ready for a productive day!';
    return '📊 Tracking your vitals throughout the day';
  }, [sleepHours, stressScore, todayWorkoutMinutes]);

  // Streak from workout logs
  const streakDays = useMemo(() => {
    if (workoutLogs.length === 0) return 0;
    const uniqueDates = [...new Set(workoutLogs.map(l => l.date))].sort().reverse();
    let streak = 0;
    const cursor = new Date(); cursor.setHours(0, 0, 0, 0);
    for (const dateStr of uniqueDates) {
      const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
      const diff = Math.round((cursor.getTime() - d.getTime()) / 86400000);
      if (diff <= 1) { streak++; cursor.setTime(d.getTime()); } else break;
    }
    return streak;
  }, [workoutLogs]);

  // XP computed from real progress
  const xpData = useMemo(() => {
    const lecturesXP = videoProgress.filter(p => p.completed).length * 50;
    const quizXP = quizProgress.reduce((s, q) => s + Math.round((q.score / q.total) * 100), 0);
    const workoutXP = workoutLogs.length * 80;
    const liveXP = liveSessions.length * 100;
    const totalXP = lecturesXP + quizXP + workoutXP + liveXP;
    const level = Math.floor(totalXP / 500) + 1;
    const xpInLevel = totalXP % 500;
    return { totalXP, level, xpInLevel, xpForLevel: 500 };
  }, [videoProgress, quizProgress, workoutLogs, liveSessions]);

  // Life Score = average of moduleInsight scores
  const lifeScore = useMemo(() => {
    if (moduleInsights.length === 0) return 0;
    return Math.round(moduleInsights.reduce((s, m) => s + m.score, 0) / moduleInsights.length);
  }, [moduleInsights]);

  const lifeScoreTrend = useMemo(() => {
    const trends = moduleInsights.map(m => m.trend);
    const ups = trends.filter(t => t === 'up').length;
    const downs = trends.filter(t => t === 'down').length;
    if (ups > downs) return '↑ improving';
    if (downs > ups) return '↓ declining';
    return '→ stable';
  }, [moduleInsights]);

  // Top alert from brain
  const topAlert = useMemo(() => {
    const active = brainAlerts.filter(a => !a.dismissed);
    return active.find(a => a.severity === 'error') || active.find(a => a.severity === 'warning') || active[0] || null;
  }, [brainAlerts]);

  // Today's plan from schedule
  const todayPlan = useMemo(() =>
    schedule.map(s => ({ id: s.id, title: s.title, time: s.time, module: s.module, completed: s.completed, color: s.color ?? '#00897b' })),
  [schedule]);
  const planDone = todayPlan.filter(p => p.completed).length;

  // Unified suggestions from ALL submodules
  type Suggestion = { emoji: string; title: string; subtitle: string; tag: string; tagColor: string; tagBg: string; path?: string };
  const suggestions = useMemo(() => {
    const items: Suggestion[] = [];

    // Health / Wearables: sleep & stress insights
    if (sleepHours > 0 && sleepHours < 6)
      items.push({ emoji: '😴', title: 'Improve Your Sleep', subtitle: `Only ${sleepHours.toFixed(1)}h — try magnesium or reduce screen time before bed`, tag: `${sleepHours.toFixed(1)}h sleep`, tagColor: '#e65100', tagBg: '#fff3e0', path: '/app/health' });
    if (stressScore > 50)
      items.push({ emoji: '🧘', title: 'Manage Stress', subtitle: stressScore > 70 ? 'High stress — try breathing exercises or a short walk' : 'Elevated stress — consider a mindfulness break', tag: `Stress: ${stressScore}/100`, tagColor: '#d32f2f', tagBg: '#fce4ec', path: '/app/fitness' });

    // Wearable device alerts
    wearableAlerts.filter(a => !a.dismissed).slice(0, 2).forEach(a =>
      items.push({ emoji: '⌚', title: a.deviceName, subtitle: a.message, tag: a.severity, tagColor: a.severity === 'critical' ? '#d32f2f' : '#e65100', tagBg: a.severity === 'critical' ? '#fce4ec' : '#fff3e0', path: '/app/wearables' })
    );

    // Fitness: activity goal gaps
    const stepsGap = activityGoals.steps - todayMetrics.steps;
    if (stepsGap > 1000)
      items.push({ emoji: '🚶', title: `${stepsGap.toLocaleString()} Steps to Go`, subtitle: `${todayMetrics.steps.toLocaleString()} of ${activityGoals.steps.toLocaleString()} daily goal`, tag: 'Fitness', tagColor: '#1565c0', tagBg: '#e3f2fd', path: '/app/fitness' });
    const calsGap = activityGoals.caloriesBurned - todayMetrics.caloriesBurned;
    if (calsGap > 100)
      items.push({ emoji: '🔥', title: `Burn ${calsGap} More Calories`, subtitle: `${todayMetrics.caloriesBurned} of ${activityGoals.caloriesBurned} daily target`, tag: 'Fitness', tagColor: '#1565c0', tagBg: '#e3f2fd', path: '/app/fitness' });

    // Injury: active injuries & rehab
    activeInjuries.slice(0, 2).forEach(inj =>
      items.push({ emoji: '🩹', title: `${inj.bodyPart} Recovery`, subtitle: `Status: ${inj.status} — severity: ${inj.severity}`, tag: 'Injury', tagColor: '#f57c00', tagBg: '#fff3e0', path: '/app/injury' })
    );
    rehabPrograms.filter(p => p.status === 'active').slice(0, 1).forEach(p =>
      items.push({ emoji: '🏥', title: p.name, subtitle: `${p.frequency} — ${p.completedSessions.length} sessions done`, tag: 'Rehab', tagColor: '#f57c00', tagBg: '#fff3e0', path: '/app/injury' })
    );

    // Education: incomplete courses
    courses.slice(0, 3).forEach(c => {
      const prog = getCourseProgress(c.id);
      if (prog.percent < 100 && prog.percent > 0)
        items.push({ emoji: '📚', title: c.title, subtitle: `${prog.percent}% complete — ${prog.total - prog.completed} lectures left`, tag: 'Education', tagColor: '#1976d2', tagBg: '#e3f2fd', path: '/app/education' });
    });

    // Shopping: unchecked items
    shoppingLists.forEach(list => {
      const unchecked = list.items.filter(i => !i.checked);
      if (unchecked.length > 0)
        items.push({ emoji: '🛒', title: `${list.emoji} ${list.name}`, subtitle: `${unchecked.length} item${unchecked.length !== 1 ? 's' : ''} pending`, tag: 'Shopping', tagColor: '#7b1fa2', tagBg: '#f3e5f5', path: '/app/shopping' });
    });

    // AI Brain recommendations that aren't already covered
    recommendations.filter(r => r.type === 'buy').slice(0, 2).forEach(r =>
      items.push({ emoji: '💡', title: r.title, subtitle: r.description, tag: r.module, tagColor: '#00695c', tagBg: '#e0f2f1', path: r.actionPath })
    );

    return items.slice(0, 8);
  }, [sleepHours, stressScore, wearableAlerts, activityGoals, todayMetrics, activeInjuries, rehabPrograms, courses, getCourseProgress, shoppingLists, recommendations]);

  // Daily missions from recommendations
  const missions = useMemo(() =>
    recommendations.slice(0, 6).map((r, i) => ({ id: r.id, task: r.title, module: r.module, xp: [100, 75, 50, 60, 50, 80][i % 6] })),
  [recommendations]);

  // Bobo cards from crossInsights
  const boboCards = useMemo(() =>
    crossInsights.map(ci => ({ id: ci.id, title: ci.title, message: ci.description, modules: ci.modules })),
  [crossInsights]);

  // Module scores
  const scores = useMemo(() =>
    moduleInsights.map(m => ({ label: m.label, score: m.score, emoji: MODULE_SCORE_META[m.module]?.emoji ?? '📊', color: MODULE_SCORE_META[m.module]?.color ?? '#757575' })),
  [moduleInsights]);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  // ── Render ────────────────────────────────────────────────────────

  return (
    <Box>

      {/* ── Row 0: Header ─────────────────────────────────────────── */}
      <Paper variant="outlined" sx={{ borderRadius: 2, p: 1.5, mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.75 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
              {today}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
              {streakDays > 0 && (
                <Chip label={`🔥 ${streakDays} day${streakDays !== 1 ? 's' : ''}`} size="small"
                  sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 700, height: 22, fontSize: 11 }} />
              )}
              <Chip label={`Lv.${xpData.level}`} size="small"
                sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2', fontWeight: 700, height: 22, fontSize: 11 }} />
            </Box>
          </Box>
          {lifeScore > 0 && (
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress variant="determinate" value={100} size={52} thickness={3.5}
                  sx={{ color: '#e0f7fa', position: 'absolute' }} />
                <CircularProgress variant="determinate" value={lifeScore} size={52} thickness={3.5}
                  sx={{ color: '#00bcd4' }} />
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#00bcd4' }}>{lifeScore}</Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: 10, lineHeight: 1.2 }}>
                Life Score
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', fontSize: 10, color: lifeScoreTrend.startsWith('↑') ? '#4caf50' : lifeScoreTrend.startsWith('↓') ? '#d32f2f' : '#757575', fontWeight: 600 }}>
                {lifeScoreTrend}
              </Typography>
            </Box>
          )}
        </Box>
        <LinearProgress variant="determinate" value={(xpData.xpInLevel / xpData.xpForLevel) * 100}
          sx={{ height: 5, borderRadius: 3, bgcolor: '#f5f5f5', mb: 0.25,
            '& .MuiLinearProgress-bar': { bgcolor: '#ffa000', borderRadius: 3 } }} />
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, display: 'block', textAlign: 'right' }}>
          {xpData.xpInLevel}/{xpData.xpForLevel} XP
        </Typography>
      </Paper>

      {/* ── Row 1: Vitals + Needs Attention ──────────────────────── */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 1.5, alignItems: 'flex-start' }}>
        <Paper variant="outlined" sx={{ borderRadius: 2, p: 1.5, width: 'fit-content' }}>
          <Box sx={{ display: 'flex', gap: 3, mb: 0.5 }}>
            {vitals.map(v => (
              <Box key={v.label}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: 10 }}>
                  {v.label}
                </Typography>
                <Typography sx={{ fontWeight: 700, color: v.color, fontSize: 13 }}>{v.value}</Typography>
              </Box>
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
            {vitalsSummary}
          </Typography>
        </Paper>
        {topAlert && (
          <Paper variant="outlined" sx={{ borderRadius: 2, p: 1.5, maxWidth: 460, bgcolor: '#fff8f8', borderColor: '#ffcdd2' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#d32f2f', fontSize: 12, mb: 0.5 }}>
              🔴 Needs Attention
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25, fontSize: 13 }}>
              {topAlert.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontSize: 11 }}>
              {topAlert.description}
            </Typography>
          </Paper>
        )}
      </Box>

      {/* ── Row 2: Today's Plan + Suggested for You ───────────── */}
      <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
        <Grid item xs={12} md={suggestions.length > 0 ? 8 : 12} lg={suggestions.length > 0 ? 8 : 12}>
          <Section>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.75 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 13 }}>🎯 Today's Plan</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                {planDone}/{todayPlan.length} done
              </Typography>
            </Box>
            {todayPlan.length === 0 ? (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                No schedule yet — hit Refresh on AI Brain to generate your daily plan.
              </Typography>
            ) : (
              todayPlan.map((item, i) => (
                <Box key={item.id} sx={{
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                  pl: 1.25, py: 0.75,
                  borderLeft: `3px solid ${item.color}`,
                  borderBottom: i < todayPlan.length - 1 ? '1px solid #f5f5f5' : 'none',
                  opacity: item.completed ? 0.5 : 1,
                }}>
                  <Box sx={{ flex: 1, pr: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 12.5, textDecoration: item.completed ? 'line-through' : 'none' }}>{item.title}</Typography>
                    <Chip label={item.module} size="small"
                      sx={{ height: 16, fontSize: 9, mt: 0.25, bgcolor: '#f5f5f5', fontWeight: 600 }} />
                  </Box>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10.5, whiteSpace: 'nowrap', pt: 0.25 }}>
                    {item.time}
                  </Typography>
                </Box>
              ))
            )}
          </Section>
        </Grid>
        {suggestions.length > 0 && (
          <Grid item xs={12} md={4} lg={4}>
            <Section>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25, fontSize: 13 }}>✨ Suggested for You</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75, fontSize: 11 }}>
                Based on your signals
              </Typography>
              {suggestions.map((s, i) => (
                <Box key={i} onClick={() => s.path && navigate(s.path)} sx={{
                  display: 'flex', alignItems: 'center', gap: 1, py: 0.75, cursor: s.path ? 'pointer' : 'default',
                  borderBottom: i < suggestions.length - 1 ? '1px solid #f5f5f5' : 'none',
                  '&:hover': s.path ? { bgcolor: '#fafafa' } : {},
                }}>
                  <Box sx={{ width: 32, height: 32, bgcolor: '#f5f5f5', borderRadius: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Typography sx={{ fontSize: 15 }}>{s.emoji}</Typography>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: 10.5, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.subtitle}</Typography>
                    <Chip label={s.tag} size="small"
                      sx={{ height: 16, fontSize: 9, mt: 0.25, bgcolor: s.tagBg, color: s.tagColor, fontWeight: 600 }} />
                  </Box>
                </Box>
              ))}
            </Section>
          </Grid>
        )}
      </Grid>

      {/* ── Row 3: Daily Missions + Bobo Cards ─────────────────────── */}
      <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
        <Grid item xs={12} md={boboCards.length > 0 ? 7 : 12} lg={boboCards.length > 0 ? 8 : 12}>
          <Section>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 13 }}>🎮 Daily Missions</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                {missionsDone.size}/{missions.length} complete
              </Typography>
            </Box>
            {missions.length === 0 ? (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                No missions yet — refresh AI Brain to get personalized recommendations.
              </Typography>
            ) : (
              missions.map((m, i) => (
                <Box key={m.id} sx={{
                  display: 'flex', alignItems: 'center', gap: 0.75, py: 0.5,
                  borderBottom: i < missions.length - 1 ? '1px solid #f5f5f5' : 'none',
                }}>
                  <Checkbox size="small" checked={missionsDone.has(i)} onChange={() => toggleMission(i)}
                    sx={{ p: 0.25, flexShrink: 0, '&.Mui-checked': { color: '#7b1fa2' } }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{
                      fontSize: 12,
                      textDecoration: missionsDone.has(i) ? 'line-through' : 'none',
                      color: missionsDone.has(i) ? 'text.disabled' : 'text.primary',
                    }}>
                      {m.task}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#ffa000', fontSize: 10, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    +{m.xp} XP
                  </Typography>
                </Box>
              ))
            )}
          </Section>
        </Grid>
        {boboCards.length > 0 && (
          <Grid item xs={12} md={4} lg={4}>
            <Section>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 13, mb: 0.75 }}>💬 Bobo Says</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {boboCards.map(card => dismissedCards.has(card.id) ? null : (
                  <Box key={card.id} sx={{
                    bgcolor: '#e0f7f4', borderRadius: 1.5, p: 1.25,
                    border: '1px solid #b2dfdb', position: 'relative',
                  }}>
                    <IconButton size="small" onClick={() => dismissCard(card.id)}
                      sx={{ position: 'absolute', top: 2, right: 2, color: 'text.secondary' }}>
                      <CloseIcon sx={{ fontSize: 13 }} />
                    </IconButton>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 12, pr: 2.5 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, lineHeight: 1.3, fontSize: 10.5 }}>
                      {card.message}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {card.modules.map(mod => (
                        <Chip key={mod} label={mod} size="small"
                          sx={{ height: 18, fontSize: 9, bgcolor: '#b2dfdb', color: '#00695c', fontWeight: 600 }} />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Section>
          </Grid>
        )}
      </Grid>

      {/* ── Row 4: Scores + Quick Actions ──────────────────────────── */}
      <Grid container spacing={1.5}>
        {scores.length > 0 && (
          <Grid item xs={12} md={8} lg={9}>
            <Section>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, fontSize: 13 }}>📊 Your Scores</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 1 }}>
                {scores.map(s => (
                  <ScoreCircle key={s.label} {...s} />
                ))}
              </Box>
            </Section>
          </Grid>
        )}
        <Grid item xs={12} md={scores.length > 0 ? 4 : 12} lg={scores.length > 0 ? 3 : 12}>
          <Section>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, fontSize: 13 }}>⚡ Quick Actions</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: scores.length > 0 ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 0.75 }}>
              {QUICK_ACTIONS.map((a, i) => (
                <Box key={i} onClick={() => navigate(a.path)} sx={{
                  textAlign: 'center', py: 1, cursor: 'pointer',
                  bgcolor: '#fafafa', borderRadius: 1.5,
                  '&:hover': { bgcolor: '#f0f0f0' },
                }}>
                  <Typography sx={{ fontSize: 20, mb: 0.25 }}>{a.emoji}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>{a.label}</Typography>
                </Box>
              ))}
            </Box>
          </Section>
        </Grid>
      </Grid>

    </Box>
  );
}
