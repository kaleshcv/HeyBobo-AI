import { useMemo, useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Chip, LinearProgress, IconButton, Tooltip,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import BoltIcon from '@mui/icons-material/Bolt';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SchoolIcon from '@mui/icons-material/School';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import GroupsIcon from '@mui/icons-material/Groups';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded';
import UmbrellaRoundedIcon from '@mui/icons-material/UmbrellaRounded';
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded';
import AcUnitRoundedIcon from '@mui/icons-material/AcUnitRounded';
import AirRoundedIcon from '@mui/icons-material/AirRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';

import { useAuth } from '@/hooks/useAuth';
import { useAIBrainStore } from '@/store/aiBrainStore';
import { useWearablesStore, type HealthReading } from '@/store/wearablesStore';
import { useActivityTrackingStore } from '@/store/activityTrackingStore';
import { useWorkoutSystemStore } from '@/store/workoutSystemStore';
import { useLiveWorkoutStore } from '@/store/liveWorkoutStore';
import { useCourseStore } from '@/store/courseStore';
import { useShoppingListStore } from '@/store/shoppingListStore';
import { useInjuryStore } from '@/store/injuryStore';
import { useUIStore } from '@/store/uiStore';
import { t as tr } from '@/lib/translations';

/* ═══════════════════════════════════════════════════════════════════
   CSS KEYFRAMES
   ═══════════════════════════════════════════════════════════════════ */
const STYLE_ID = 'bobo-hybrid-keyframes';
function ensureKeyframes() {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes hb-slide-up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes hb-shimmer{0%{left:-40%}100%{left:140%}}
    @keyframes hb-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.02)}}
    @keyframes hb-glow{0%,100%{box-shadow:0 0 8px rgba(201,168,76,.15)}50%{box-shadow:0 0 20px rgba(201,168,76,.3)}}
    @keyframes hb-ring{from{stroke-dashoffset:251}}
    @keyframes hb-badge-pop{0%{transform:scale(0) rotate(-90deg);opacity:0}60%{transform:scale(1.1) rotate(4deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:1}}
    @keyframes hb-live-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}
  `;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════ */
function todayStr() { return new Date().toISOString().slice(0, 10); }
function clamp(v: number, min = 0, max = 100) { return Math.min(max, Math.max(min, v)); }

/* ═══════════════════════════════════════════════════════════════════
   PALETTE & CONTEXT
   ═══════════════════════════════════════════════════════════════════ */
type HBPal = { text: string; ts: string; tm: string; td: string; td2: string; td3: string; td4: string; div: string; trk: string; brd: string; hov: string; sub: string; cardBg: string; cardBrd: string; rnTrk: string; iconGrad: string; shadow: string; isDark: boolean };
const HB_DARK: HBPal = { isDark:true, text:'#F5F0E8', ts:'rgba(255,255,255,.4)', tm:'rgba(255,255,255,.35)', td:'rgba(255,255,255,.3)', td2:'rgba(255,255,255,.25)', td3:'rgba(255,255,255,.2)', td4:'rgba(255,255,255,.15)', div:'rgba(255,255,255,.04)', trk:'rgba(255,255,255,.06)', brd:'rgba(255,255,255,.08)', hov:'rgba(255,255,255,.03)', sub:'rgba(255,255,255,.04)', cardBg:'linear-gradient(135deg,rgba(255,255,255,.055),rgba(255,255,255,.025))', cardBrd:'rgba(255,255,255,.08)', rnTrk:'rgba(255,255,255,.06)', iconGrad:'linear-gradient(135deg,rgba(201,168,76,.2),rgba(201,168,76,.08))', shadow:'none' };
const HB_LIGHT: HBPal = { isDark:false, text:'#1a1a2e', ts:'rgba(0,0,0,.7)', tm:'rgba(0,0,0,.6)', td:'rgba(0,0,0,.5)', td2:'rgba(0,0,0,.4)', td3:'rgba(0,0,0,.32)', td4:'rgba(0,0,0,.22)', div:'rgba(0,0,0,.1)', trk:'rgba(0,0,0,.12)', brd:'rgba(0,0,0,.15)', hov:'rgba(0,0,0,.06)', sub:'rgba(0,0,0,.06)', cardBg:'linear-gradient(135deg,rgba(255,255,255,.95),rgba(255,255,255,.82))', cardBrd:'rgba(0,0,0,.13)', rnTrk:'rgba(0,0,0,.12)', iconGrad:'linear-gradient(135deg,rgba(160,120,30,.16),rgba(160,120,30,.06))', shadow:'0 2px 16px rgba(0,0,0,.08)' };
const PalCtx = createContext<HBPal>(HB_DARK);
const usePal = () => useContext(PalCtx);

/* ═══════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

/* ── SVG ring (smaller, for header/scores) ── */
function Ring({
  score, size = 80, stroke = 6, color, children,
}: { score: number; size?: number; stroke?: number; color: string; children?: React.ReactNode }) {
  const t = usePal();
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (clamp(score) / 100) * circ;
  return (
    <Box sx={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.rnTrk} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 4px ${color}60)`, transition: 'stroke-dashoffset 1s ease', animation: 'hb-ring 1s ease forwards' }} />
      </svg>
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </Box>
    </Box>
  );
}

/* ── Card with subtle glass effect ── */
function Card({ children, delay = 0, sx }: { children: React.ReactNode; delay?: number; sx?: object }) {
  const t = usePal();
  return (
    <Box sx={{
      p: 2.5, borderRadius: 3,
      background: t.cardBg,
      border: `1px solid ${t.cardBrd}`,
      backdropFilter: 'blur(8px)',
      boxShadow: t.shadow,
      animation: `hb-slide-up .45s ${delay}s ease both`,
      ...sx,
    }}>{children}</Box>
  );
}

/* ── Section title ── */
function SectionTitle({ icon, title, right }: { icon: React.ReactNode; title: string; right?: React.ReactNode }) {
  const t = usePal();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: .75, mb: 1.5 }}>
      <Box sx={{
        width: 28, height: 28, borderRadius: 2,
        background: t.iconGrad,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{icon}</Box>
      <Typography sx={{ fontWeight: 700, fontSize: 14, color: t.text, flex: 1 }}>{title}</Typography>
      {right}
    </Box>
  );
}

/* ── Stat pill (horizontal) ── */
function StatPill({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) {
  const t = usePal();
  const bgOp = t.isDark ? '12' : '18';
  const brOp = t.isDark ? '20' : '30';
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1.25, px: 1.5, py: 1,
      borderRadius: 2.5, background: `${color}${bgOp}`, border: `1px solid ${color}${brOp}`,
      flex: 1, minWidth: 0,
    }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color, flexShrink: 0, boxShadow: `0 0 6px ${color}50` }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 10, color: t.ts, textTransform: 'uppercase', letterSpacing: .5 }}>{label}</Typography>
        <Typography sx={{ fontWeight: 800, fontSize: 16, color, lineHeight: 1 }}>{value}</Typography>
        {sub && <Typography sx={{ fontSize: 9, color: t.td, mt: .15 }}>{sub}</Typography>}
      </Box>
    </Box>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MODULE CONSTANTS
   ═══════════════════════════════════════════════════════════════════ */
const MODULE_NAV_BASE: { icon: React.ReactNode; key: 'navLearn' | 'navFitness' | 'navHealth' | 'navDiet' | 'navShop' | 'navGroups'; color: string; path: string; emoji: string }[] = [
  { icon: <SchoolIcon sx={{ fontSize: 20 }} />,         key: 'navLearn',   color: '#38bdf8', path: '/app/education',  emoji: '📚' },
  { icon: <FitnessCenterIcon sx={{ fontSize: 20 }} />,  key: 'navFitness', color: '#10b981', path: '/app/fitness',    emoji: '🏋️' },
  { icon: <MonitorHeartIcon sx={{ fontSize: 20 }} />,   key: 'navHealth',  color: '#f43f5e', path: '/app/health',     emoji: '❤️' },
  { icon: <RestaurantIcon sx={{ fontSize: 20 }} />,     key: 'navDiet',    color: '#f59e0b', path: '/app/dietary',    emoji: '🍎' },
  { icon: <ShoppingCartIcon sx={{ fontSize: 20 }} />,   key: 'navShop',    color: '#a78bfa', path: '/app/shopping',   emoji: '🛒' },
  { icon: <GroupsIcon sx={{ fontSize: 20 }} />,         key: 'navGroups',  color: '#ec4899', path: '/app/groups',     emoji: '👥' },
];

const MODULE_SCORE_META: Record<string, { emoji: string; color: string }> = {
  education:    { emoji: '📚', color: '#38bdf8' },
  fitness:      { emoji: '🏋️', color: '#10b981' },
  health:       { emoji: '❤️', color: '#f43f5e' },
  dietary:      { emoji: '🍎', color: '#f59e0b' },
  wellness:     { emoji: '✨', color: '#a78bfa' },
  injury:       { emoji: '🩹', color: '#fb923c' },
  shopping:     { emoji: '🛒', color: '#a78bfa' },
  groups:       { emoji: '👥', color: '#ec4899' },
  productivity: { emoji: '⚡', color: '#fbbf24' },
  social:       { emoji: '👥', color: '#ec4899' },
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function HybridDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => { ensureKeyframes(); }, []);

  /* ── live sync tick ── */
  const [syncTick, setSyncTick] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => { setSyncTick(t => t + 1); setLastSyncTime(new Date()); }, 30000);
    return () => clearInterval(id);
  }, []);
  void syncTick;

  /* ── theme mode (from global store) ── */
  const hbMode = useUIStore((s) => s.theme);
  const toggleMode = useUIStore((s) => s.toggleTheme);
  const lang = useUIStore((s) => s.language);
  const t = hbMode === 'dark' ? HB_DARK : HB_LIGHT;

  const MODULE_NAV = useMemo(() =>
    MODULE_NAV_BASE.map(m => ({ ...m, label: tr(lang, m.key) })),
  [lang]);

  /* ── store reads ── */
  const { schedule, moduleInsights, alerts: brainAlerts, recommendations, crossInsights } = useAIBrainStore();
  const wearableReadings = useWearablesStore((s) => s.readings);
  const todayMetrics = useActivityTrackingStore((s) => s.getDailyMetrics(todayStr()));
  const activityGoals = useActivityTrackingStore((s) => s.goals);
  const workoutLogs = useWorkoutSystemStore((s) => s.workoutLogs);
  const liveSessions = useLiveWorkoutStore((s) => s.sessions);
  const videoProgress = useCourseStore((s) => s.progress);
  const quizProgress = useCourseStore((s) => s.quizProgress);
  const courses = useCourseStore((s) => s.courses);
  const getCourseProgress = useCourseStore((s) => s.getCourseProgress);
  const shoppingLists = useShoppingListStore((s) => s.lists);
  const activeInjuries = useInjuryStore((s) => s.getActiveInjuries());
  const wearableAlerts = useWearablesStore((s) => s.alerts);
  const rehabPrograms = useInjuryStore((s) => s.rehabPrograms);

  /* ── derived ── */
  const latestReading = useCallback((metric: string) => {
    const r = wearableReadings
      .filter((x: HealthReading) => x.metric === metric)
      .sort((a: HealthReading, b: HealthReading) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    return r?.value ?? 0;
  }, [wearableReadings]);

  const sleepHours = latestReading('sleep-duration');
  const stressScore = latestReading('stress-level');
  const heartRate = latestReading('heart-rate') || latestReading('resting-hr');
  const recoveryScore = latestReading('readiness-score') || latestReading('recovery-score');

  const stepPct = clamp(Math.round((todayMetrics.steps / Math.max(activityGoals.steps, 1)) * 100));
  const calPct = clamp(Math.round((todayMetrics.caloriesBurned / Math.max(activityGoals.caloriesBurned, 1)) * 100));
  const activePct = clamp(Math.round((todayMetrics.activeMinutes / Math.max(activityGoals.activeMinutes, 1)) * 100));

  // XP & level
  const xpData = useMemo(() => {
    const lectXP = videoProgress.filter(p => p.completed).length * 50;
    const quizXP = quizProgress.reduce((s, q) => s + Math.round((q.score / q.total) * 100), 0);
    const wkXP = workoutLogs.length * 80;
    const liveXP = liveSessions.length * 100;
    const total = lectXP + quizXP + wkXP + liveXP;
    return { total, level: Math.floor(total / 500) + 1, inLevel: total % 500, forLevel: 500 };
  }, [videoProgress, quizProgress, workoutLogs, liveSessions]);

  // Streak
  const streak = useMemo(() => {
    if (workoutLogs.length === 0) return 0;
    const dates = [...new Set(workoutLogs.map(l => l.date))].sort().reverse();
    let s = 0;
    const cur = new Date(); cur.setHours(0, 0, 0, 0);
    for (const d of dates) {
      const dt = new Date(d); dt.setHours(0, 0, 0, 0);
      if (Math.round((cur.getTime() - dt.getTime()) / 86400000) <= 1) { s++; cur.setTime(dt.getTime()); } else break;
    }
    return s;
  }, [workoutLogs]);

  // Life score
  const lifeScore = useMemo(() => {
    if (moduleInsights.length === 0) return 0;
    return Math.round(moduleInsights.reduce((s, m) => s + m.score, 0) / moduleInsights.length);
  }, [moduleInsights]);

  const lifeScoreTrend = useMemo(() => {
    const trends = moduleInsights.map(m => m.trend);
    const ups = trends.filter(t => t === 'up').length;
    const downs = trends.filter(t => t === 'down').length;
    if (ups > downs) return { text: tr(lang, 'trendImproving'), arrow: '↑', color: '#10b981' };
    if (downs > ups) return { text: tr(lang, 'trendDeclining'), arrow: '↓', color: '#ef4444' };
    return { text: tr(lang, 'trendStable'), arrow: '→', color: t.tm };
  }, [moduleInsights, t.tm, lang]);

  // Module scores
  const MODULE_LABEL_KEY: Record<string, Parameters<typeof tr>[1]> = {
    education: 'modEducation', fitness: 'modFitness', health: 'modHealth',
    dietary: 'modDiet', shopping: 'modShopping', groups: 'modGroups',
    grooming: 'modGrooming', injury: 'modInjury', rehab: 'modRehab', wellness: 'modWellness',
  };
  const moduleScores = useMemo(() =>
    moduleInsights.map(m => ({
      label: MODULE_LABEL_KEY[m.module] ? tr(lang, MODULE_LABEL_KEY[m.module]!) : m.label,
      score: m.score, trend: m.trend,
      emoji: MODULE_SCORE_META[m.module]?.emoji ?? '📊',
      color: MODULE_SCORE_META[m.module]?.color ?? '#64748b',
    })),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [moduleInsights, lang]);

  // Grade
  const grade = lifeScore >= 90 ? 'S' : lifeScore >= 75 ? 'A' : lifeScore >= 60 ? 'B' : lifeScore >= 40 ? 'C' : 'D';
  const gradeColor: Record<string, string> = { S: '#C9A84C', A: '#10b981', B: '#38bdf8', C: '#f59e0b', D: '#ef4444' };

  // Top alert
  const topAlert = useMemo(() => {
    const active = brainAlerts.filter(a => !a.dismissed);
    return active.find(a => a.severity === 'error') || active.find(a => a.severity === 'warning') || active[0] || null;
  }, [brainAlerts]);

  // Quests
  const [questDone, setQuestDone] = useState<Set<string>>(new Set());
  const toggleQuest = useCallback((id: string) => {
    setQuestDone(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);
  const quests = useMemo(() =>
    recommendations.slice(0, 6).map((r, i) => ({ id: r.id, label: r.title, xp: [100, 75, 50, 60, 50, 80][i % 6] })),
  [recommendations]);

  // Today's plan
  const plan = useMemo(() =>
    schedule.map(s => ({ id: s.id, title: s.title, time: s.time, module: s.module, color: s.color ?? '#00897b', done: s.completed, note: s.note })),
  [schedule]);

  // Suggestions (richer text-based)
  type Sug = { emoji: string; title: string; sub: string; tag: string; tagColor: string; tagBg: string; path?: string };
  const suggestions = useMemo(() => {
    const items: Sug[] = [];
    if (sleepHours > 0 && sleepHours < 6)
      items.push({ emoji: '😴', title: tr(lang, 'sugImprSleep'), sub: `${sleepHours.toFixed(1)}${tr(lang, 'sugSleepSub')}`, tag: `${sleepHours.toFixed(1)}h`, tagColor: '#ef4444', tagBg: 'rgba(239,68,68,.12)', path: '/app/health' });
    if (stressScore > 50)
      items.push({ emoji: '🧘', title: tr(lang, 'sugManageStress'), sub: stressScore > 70 ? tr(lang, 'sugHighStress') : tr(lang, 'sugElevStress'), tag: `${stressScore}/100`, tagColor: '#f59e0b', tagBg: 'rgba(245,158,11,.12)', path: '/app/fitness' });

    wearableAlerts.filter(a => !a.dismissed).slice(0, 1).forEach(a =>
      items.push({ emoji: '⌚', title: a.deviceName, sub: a.message, tag: a.severity, tagColor: a.severity === 'critical' ? '#ef4444' : '#f59e0b', tagBg: a.severity === 'critical' ? 'rgba(239,68,68,.12)' : 'rgba(245,158,11,.12)', path: '/app/wearables' }));

    const stepsGap = activityGoals.steps - todayMetrics.steps;
    if (stepsGap > 1000)
      items.push({ emoji: '🚶', title: `${stepsGap.toLocaleString()} ${tr(lang, 'sugStepsToGo')}`, sub: `${todayMetrics.steps.toLocaleString()} of ${activityGoals.steps.toLocaleString()} ${tr(lang, 'sugStepsGoal')}`, tag: tr(lang, 'modFitness'), tagColor: '#10b981', tagBg: 'rgba(16,185,129,.12)', path: '/app/fitness' });
    activeInjuries.slice(0, 1).forEach(inj =>
      items.push({ emoji: '🩹', title: `${inj.bodyPart} ${tr(lang, 'modRehab')}`, sub: `Status: ${inj.status} — severity: ${inj.severity}`, tag: tr(lang, 'modInjury'), tagColor: '#fb923c', tagBg: 'rgba(251,146,60,.12)', path: '/app/health/injury' }));
    rehabPrograms.filter(p => p.status === 'active').slice(0, 1).forEach(p =>
      items.push({ emoji: '🏥', title: p.name, sub: `${p.frequency} — ${p.completedSessions.length} sessions done`, tag: tr(lang, 'modRehab'), tagColor: '#fb923c', tagBg: 'rgba(251,146,60,.12)', path: '/app/health/injury' }));
    courses.slice(0, 2).forEach(c => {
      const p = getCourseProgress(c.id);
      if (p.percent > 0 && p.percent < 100)
        items.push({ emoji: '📚', title: c.title, sub: `${p.percent}% complete — ${p.total - p.completed} ${tr(lang, 'sugLectLeft')}`, tag: tr(lang, 'modEducation'), tagColor: '#38bdf8', tagBg: 'rgba(56,189,248,.12)', path: '/app/education' });
    });
    shoppingLists.forEach(list => {
      const unchecked = list.items.filter(i => !i.checked);
      if (unchecked.length > 0)
        items.push({ emoji: '🛒', title: `${list.emoji} ${list.name}`, sub: `${unchecked.length} ${tr(lang, 'sugItemsPend')}`, tag: tr(lang, 'modShopping'), tagColor: '#a78bfa', tagBg: 'rgba(167,139,250,.12)', path: '/app/shopping' });
    });
    return items.slice(0, 6);
  }, [sleepHours, stressScore, wearableAlerts, activityGoals, todayMetrics, activeInjuries, rehabPrograms, courses, getCourseProgress, shoppingLists]);

  // Bobo cards
  const [dismissedCards, setDismissedCards] = useState<Set<string>>(new Set());
  const dismissCard = (id: string) => setDismissedCards(prev => new Set([...prev, id]));
  const boboCards = useMemo(() =>
    crossInsights.filter(ci => !dismissedCards.has(ci.id)).slice(0, 3),
  [crossInsights, dismissedCards]);

  // Achievements
  const achievements = useMemo(() => [
    { id: 'first', icon: <DirectionsRunIcon sx={{ fontSize: 18, color: '#0D1B2A' }} />, title: tr(lang, 'achFirstSteps'), desc: tr(lang, 'achFirstStepsDesc'), unlocked: todayMetrics.steps > 0 || workoutLogs.length > 0 },
    { id: 'goals', icon: <EmojiEventsIcon sx={{ fontSize: 18, color: '#0D1B2A' }} />, title: tr(lang, 'achGoalCrusher'), desc: tr(lang, 'achGoalCrusherDesc'), unlocked: stepPct >= 100 && calPct >= 100 && activePct >= 100 },
    { id: 'streak3', icon: <LocalFireDepartmentIcon sx={{ fontSize: 18, color: '#0D1B2A' }} />, title: tr(lang, 'achOnFire'), desc: tr(lang, 'achOnFireDesc'), unlocked: streak >= 3 },
    { id: 'learner', icon: <SchoolIcon sx={{ fontSize: 18, color: '#0D1B2A' }} />, title: tr(lang, 'achScholar'), desc: tr(lang, 'achScholarDesc'), unlocked: courses.some(c => getCourseProgress(c.id).percent >= 100) },
    { id: 'level5', icon: <StarIcon sx={{ fontSize: 18, color: '#0D1B2A' }} />, title: tr(lang, 'achLevel5'), desc: tr(lang, 'achLevel5Desc'), unlocked: xpData.level >= 5 },
  ], [lang, todayMetrics.steps, workoutLogs.length, stepPct, calPct, activePct, streak, courses, getCourseProgress, xpData.level]);

  /* ── Weather data ── */
  type WeatherData = { temp: number; feelsLike: number; humidity: number; windSpeed: number; uvIndex: number; weatherCode: number; precip: number };
  const [weather, setWeather] = useState<WeatherData | null>(null);
  useEffect(() => {
    const cached = sessionStorage.getItem('bobo_weather');
    if (cached) {
      try { const d = JSON.parse(cached); if (Date.now() - d._ts < 1800000) { setWeather(d); return; } } catch { /* ignore */ }
    }
    // Open-Meteo free API — Dubai coords by default
    fetch('https://api.open-meteo.com/v1/forecast?latitude=25.276987&longitude=55.296249&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,uv_index,weather_code,precipitation&timezone=auto')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d?.current) return;
        const w: WeatherData = {
          temp: Math.round(d.current.temperature_2m),
          feelsLike: Math.round(d.current.apparent_temperature),
          humidity: d.current.relative_humidity_2m,
          windSpeed: Math.round(d.current.wind_speed_10m),
          uvIndex: Math.round(d.current.uv_index),
          weatherCode: d.current.weather_code,
          precip: d.current.precipitation,
        };
        sessionStorage.setItem('bobo_weather', JSON.stringify({ ...w, _ts: Date.now() }));
        setWeather(w);
      })
      .catch(() => {});
  }, []);

  const weatherLabel = useMemo(() => {
    if (!weather) return null;
    const c = weather.weatherCode;
    if (c <= 1) return { text: tr(lang, 'weatherClear'), emoji: '☀️', icon: <WbSunnyRoundedIcon sx={{ fontSize: 22, color: '#f59e0b' }} /> };
    if (c <= 3) return { text: tr(lang, 'weatherPartlyCloudy'), emoji: '⛅', icon: <WbSunnyRoundedIcon sx={{ fontSize: 22, color: '#fbbf24' }} /> };
    if (c <= 48) return { text: tr(lang, 'weatherCloudy'), emoji: '☁️', icon: <AirRoundedIcon sx={{ fontSize: 22, color: '#94a3b8' }} /> };
    if (c <= 67) return { text: tr(lang, 'weatherRainy'), emoji: '🌧️', icon: <UmbrellaRoundedIcon sx={{ fontSize: 22, color: '#60a5fa' }} /> };
    if (c <= 77) return { text: tr(lang, 'weatherSnowy'), emoji: '❄️', icon: <AcUnitRoundedIcon sx={{ fontSize: 22, color: '#93c5fd' }} /> };
    if (c <= 82) return { text: tr(lang, 'weatherHeavyRain'), emoji: '⛈️', icon: <UmbrellaRoundedIcon sx={{ fontSize: 22, color: '#3b82f6' }} /> };
    return { text: tr(lang, 'weatherStormy'), emoji: '⛈️', icon: <UmbrellaRoundedIcon sx={{ fontSize: 22, color: '#6366f1' }} /> };
  }, [weather, lang]);

  // Protection recommendations based on weather + health data
  const protectionTips = useMemo(() => {
    if (!weather) return [];
    const tips: { icon: React.ReactNode; title: string; sub: string; color: string }[] = [];
    // UV protection
    if (weather.uvIndex >= 6) {
      tips.push({ icon: <ShieldRoundedIcon sx={{ fontSize: 16 }} />, title: tr(lang, 'tipHighUV'), sub: `UV Index ${weather.uvIndex}. Reapply sunscreen every 2 hours if outdoors.`, color: '#ef4444' });
    } else if (weather.uvIndex >= 3) {
      tips.push({ icon: <ShieldRoundedIcon sx={{ fontSize: 16 }} />, title: tr(lang, 'tipModerateUV'), sub: `UV Index ${weather.uvIndex}. SPF 30+ recommended for outdoor activities.`, color: '#f59e0b' });
    }
    // Heat advisory
    if (weather.temp >= 38) {
      tips.push({ icon: <WbSunnyRoundedIcon sx={{ fontSize: 16 }} />, title: tr(lang, 'tipExtremeHeat'), sub: `${weather.temp}°C — Avoid outdoor exercise between 10 AM–4 PM. Stay hydrated.`, color: '#ef4444' });
    } else if (weather.temp >= 33) {
      tips.push({ icon: <WbSunnyRoundedIcon sx={{ fontSize: 16 }} />, title: tr(lang, 'tipHotDay'), sub: `${weather.temp}°C feels like ${weather.feelsLike}°C. Drink 3–4L water today.`, color: '#f59e0b' });
    }
    // Rain
    if (weather.precip > 0 || (weather.weatherCode >= 51 && weather.weatherCode <= 82)) {
      tips.push({ icon: <UmbrellaRoundedIcon sx={{ fontSize: 16 }} />, title: tr(lang, 'tipRain'), sub: 'Consider indoor workouts instead. Roads may be slippery.', color: '#60a5fa' });
    }
    // Humidity
    if (weather.humidity >= 75) {
      tips.push({ icon: <WaterDropRoundedIcon sx={{ fontSize: 16 }} />, title: tr(lang, 'tipHighHumidity'), sub: `${weather.humidity}% humidity. Wear moisture-wicking fabrics. Electrolytes helpful.`, color: '#06b6d4' });
    }
    // Wind
    if (weather.windSpeed >= 35) {
      tips.push({ icon: <AirRoundedIcon sx={{ fontSize: 16 }} />, title: tr(lang, 'tipStrongWind'), sub: `${weather.windSpeed} km/h gusts. Avoid cycling or running outdoors.`, color: '#94a3b8' });
    }
    // Cold (unlikely in Dubai but covers all locations)
    if (weather.temp <= 12) {
      tips.push({ icon: <AcUnitRoundedIcon sx={{ fontSize: 16 }} />, title: tr(lang, 'tipCold'), sub: `${weather.temp}°C. Warm up properly before exercising. Protect extremities.`, color: '#818cf8' });
    }
    return tips;
  }, [weather, lang]);

  // Daily smart nudges — time-aware contextual reminders
  const nudges = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    const items: { emoji: string; text: string; color: string }[] = [];

    // Hydration nudge
    const waterGoalL = weather && weather.temp >= 33 ? 4 : 3;
    const glassesPerHour = Math.ceil((waterGoalL * 4) / 14); // glasses across waking hours
    if (hour >= 7 && hour <= 22) {
      const glassesToNow = Math.max(1, (hour - 7) * glassesPerHour);
      items.push({ emoji: '💧', text: `${tr(lang, 'nudgeHydration')} — ${glassesToNow}+ ${lang === 'ar' ? 'كأساً' : 'glasses'} ${lang === 'ar' ? 'حتى الآن' : 'by now'} (${lang === 'ar' ? 'الهدف' : 'aim for'} ${waterGoalL}L ${lang === 'ar' ? 'اليوم' : 'today'})`, color: '#06b6d4' });
    }

    // Posture / screen-break nudge
    if (hour >= 9 && hour <= 18) {
      items.push({ emoji: '🧍', text: tr(lang, 'nudgeStretch'), color: '#8b5cf6' });
    }

    // Morning supplements
    if (hour >= 6 && hour < 10) {
      items.push({ emoji: '💊', text: tr(lang, 'nudgeSupplements'), color: '#f59e0b' });
    }

    // Evening wind-down
    if (hour >= 20) {
      items.push({ emoji: '🌙', text: tr(lang, 'nudgeWindDown'), color: '#818cf8' });
      if (sleepHours > 0 && sleepHours < 6) {
        items.push({ emoji: '😴', text: lang === 'ar' ? `الليلة الماضية كانت ${sleepHours.toFixed(1)}س فقط — حاول النوم مبكراً بـ 30 دقيقة الليلة` : `Last night was only ${sleepHours.toFixed(1)}h — try sleeping 30 min earlier tonight`, color: '#ef4444' });
      }
    }

    // Steps nudge based on time of day
    if (hour >= 12 && stepPct < 40) {
      items.push({ emoji: '🚶', text: lang === 'ar' ? `${stepPct}% فقط من هدف الخطوات — امشِ 15 دقيقة بعد الغداء` : `Only ${stepPct}% of step goal by afternoon — take a 15-min walk after lunch`, color: '#10b981' });
    } else if (hour >= 17 && stepPct < 70) {
      items.push({ emoji: '🏃', text: lang === 'ar' ? `${100 - stepPct}% من الخطوات متبقٍ — يُنصح بالمشي المسائي` : `${100 - stepPct}% of steps remaining — evening walk or light jog recommended`, color: '#10b981' });
    }

    // Grooming / skincare
    if (hour >= 6 && hour < 9) {
      items.push({ emoji: '🧴', text: weather && weather.uvIndex >= 3 ? (lang === 'ar' ? `ضع واقي شمس (UV ${weather.uvIndex}) + مرطب قبل الخروج` : `Apply sunscreen (UV ${weather.uvIndex}) + moisturizer before heading out`) : tr(lang, 'nudgeSkincareMorning'), color: '#ec4899' });
    }
    if (hour >= 20 && hour <= 23) {
      items.push({ emoji: '🧴', text: tr(lang, 'nudgeSkincareEvening'), color: '#ec4899' });
    }

    // Calorie check
    if (hour >= 14 && calPct < 30) {
      items.push({ emoji: '🔥', text: tr(lang, 'nudgeLowCalories'), color: '#ef4444' });
    }

    return items.slice(0, 5);
  }, [weather, sleepHours, stepPct, calPct, lang]);

  // Greeting
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? tr(lang, 'goodMorning') : h < 17 ? tr(lang, 'goodAfternoon') : tr(lang, 'goodEvening');
  }, [lang]);
  const firstName = user?.firstName ?? 'there';
  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  return (
    <PalCtx.Provider value={t}>
    <Box sx={{
      flex: 1, overflow: 'auto', position: 'relative',
      background: hbMode === 'dark'
        ? 'linear-gradient(180deg, #0f1923 0%, #131f2e 50%, #0D1B2A 100%)'
        : 'linear-gradient(180deg, #ffffff 0%, #f0f2f5 50%, #e8ebf0 100%)',
      minHeight: '100vh',
      transition: 'background .4s ease',
    }}>
      <Box sx={{ maxWidth: { xs: '100%', md: 1200, lg: 1440 }, mx: 'auto', px: { xs: 2.5, md: 4, lg: 5 }, py: 3 }}>

        {/* ─────── HEADER ─────── */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2.5, animation: 'hb-slide-up .4s ease both' }}>
          {/* Left: greeting + badges */}
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 11, color: t.tm, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
              {todayDate}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: t.text, mt: .25, mb: 1 }}>
              {greeting}, {firstName}
            </Typography>
            <Box sx={{ display: 'flex', gap: .75, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Live sync indicator */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: .5, mr: .5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981', animation: 'hb-live-dot 2s ease infinite' }} />
                <Typography sx={{ fontSize: 9, color: t.td }}>{tr(lang, 'liveSync')} {lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
              </Box>
              {/* Theme toggle */}
              <IconButton onClick={toggleMode} size="small" sx={{
                width: 26, height: 26, bgcolor: t.sub,
                border: `1px solid ${t.brd}`, transition: 'all .2s',
                '&:hover': { bgcolor: t.hov, transform: 'rotate(30deg)' },
              }}>
                {hbMode === 'dark'
                  ? <LightModeRoundedIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
                  : <DarkModeRoundedIcon sx={{ fontSize: 14, color: '#6366f1' }} />}
              </IconButton>
              {streak > 0 && (
                <Chip size="small" icon={<LocalFireDepartmentIcon sx={{ fontSize: '14px !important', color: '#ef4444 !important' }} />}
                  label={`${streak} day${streak !== 1 ? 's' : ''}`}
                  sx={{ bgcolor: 'rgba(239,68,68,.12)', color: '#ef4444', fontWeight: 700, height: 24, fontSize: 11, border: '1px solid rgba(239,68,68,.2)' }} />
              )}
              <Chip size="small" icon={<BoltIcon sx={{ fontSize: '14px !important', color: '#C9A84C !important' }} />}
                label={`Level ${xpData.level}`}
                sx={{ bgcolor: 'rgba(201,168,76,.12)', color: '#C9A84C', fontWeight: 700, height: 24, fontSize: 11, border: '1px solid rgba(201,168,76,.2)' }} />
              <Chip size="small" label={`${xpData.total} XP`}
                sx={{ bgcolor: t.sub, color: t.ts, fontWeight: 600, height: 24, fontSize: 11, border: `1px solid ${t.trk}` }} />
            </Box>
            {/* XP progress bar */}
            <Box sx={{ mt: 1.25 }}>
              <Box sx={{ height: 6, borderRadius: 3, background: t.trk, overflow: 'hidden', position: 'relative' }}>
                <Box sx={{
                  height: '100%', width: `${(xpData.inLevel / xpData.forLevel) * 100}%`, borderRadius: 3,
                  background: 'linear-gradient(90deg,#A8862A,#C9A84C,#E5B84E)', transition: 'width 1s ease',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <Box sx={{ position: 'absolute', top: 0, left: '-40%', width: '40%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent)', animation: 'hb-shimmer 3s ease infinite' }} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: .3 }}>
                <Typography sx={{ fontSize: 9, color: t.td2 }}>{tr(lang, 'nextLevel')}</Typography>
                <Typography sx={{ fontSize: 9, color: '#C9A84C', fontWeight: 700 }}>{xpData.inLevel}/{xpData.forLevel} XP</Typography>
              </Box>
            </Box>
          </Box>

          {/* Right: Life Score ring */}
          {lifeScore > 0 && (
            <Box sx={{ textAlign: 'center', animation: 'hb-pulse 5s ease infinite', flexShrink: 0 }}>
              <Ring score={lifeScore} size={90} stroke={7} color="#C9A84C">
                <Typography sx={{ fontWeight: 900, fontSize: 22, color: t.text, lineHeight: 1 }}>{lifeScore}</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: 8, color: gradeColor[grade], letterSpacing: 1, mt: .15 }}>
                  RANK {grade}
                </Typography>
              </Ring>
              <Typography sx={{ fontSize: 9, color: lifeScoreTrend.color, fontWeight: 600, mt: .5 }}>
                {lifeScoreTrend.arrow} {lifeScoreTrend.text}
              </Typography>
            </Box>
          )}
        </Box>

        {/* ─────── ALERT ─────── */}
        {topAlert && (
          <Box sx={{
            mb: 2, px: 2, py: 1.25, borderRadius: 2.5, animation: 'hb-slide-up .4s .05s ease both',
            background: topAlert.severity === 'error' ? 'linear-gradient(135deg,rgba(239,68,68,.1),rgba(239,68,68,.04))' : 'linear-gradient(135deg,rgba(245,158,11,.1),rgba(245,158,11,.04))',
            border: '1px solid', borderColor: topAlert.severity === 'error' ? 'rgba(239,68,68,.18)' : 'rgba(245,158,11,.18)',
            display: 'flex', alignItems: 'flex-start', gap: 1,
          }}>
            <WarningAmberIcon sx={{ fontSize: 16, color: topAlert.severity === 'error' ? '#ef4444' : '#f59e0b', mt: .2 }} />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 13, color: t.text }}>{topAlert.title}</Typography>
              <Typography sx={{ fontSize: 11, color: t.ts, lineHeight: 1.4 }}>{topAlert.description}</Typography>
            </Box>
          </Box>
        )}

        {/* ─────── ACTIVITY STATS (horizontal pills) ─────── */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: heartRate > 0 ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)' }, gap: 1, mb: 2, animation: 'hb-slide-up .4s .1s ease both' }}>
          <StatPill label={tr(lang, 'statSteps')} value={todayMetrics.steps.toLocaleString()} color="#10b981" sub={`${stepPct}% ${tr(lang, 'ofGoalLabel')}`} />
          <StatPill label={tr(lang, 'statCalories')} value={`${todayMetrics.caloriesBurned}`} color="#ef4444" sub={`${calPct}% ${tr(lang, 'ofGoalLabel')}`} />
          <StatPill label={tr(lang, 'statActive')} value={`${todayMetrics.activeMinutes}m`} color="#f59e0b" sub={`${activePct}% ${tr(lang, 'ofGoalLabel')}`} />
          {heartRate > 0 && <StatPill label={tr(lang, 'statBPM')} value={`${heartRate}`} color="#f43f5e" />}
        </Box>

        {/* ─────── WEATHER + PROTECTION ─────── */}
        {weather && weatherLabel && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: protectionTips.length > 0 ? '1fr 1fr' : '1fr' }, gap: 2, mb: 2, animation: 'hb-slide-up .4s .12s ease both' }}>
            {/* Current weather */}
            <Card delay={.12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 56, height: 56, borderRadius: 3,
                  background: t.isDark ? 'linear-gradient(135deg,rgba(251,191,36,.12),rgba(251,191,36,.04))' : 'linear-gradient(135deg,rgba(251,191,36,.18),rgba(251,191,36,.06))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>{weatherLabel.icon}</Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: 26, color: t.text, lineHeight: 1 }}>{weather.temp}°C</Typography>
                  <Typography sx={{ fontSize: 12, color: t.ts, mt: .25 }}>{weatherLabel.text} · {tr(lang, 'feelsLike')} {weather.feelsLike}°C</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <WaterDropRoundedIcon sx={{ fontSize: 14, color: '#06b6d4' }} />
                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: t.text }}>{weather.humidity}%</Typography>
                    <Typography sx={{ fontSize: 8, color: t.td }}>{tr(lang, 'humidityLabel')}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <AirRoundedIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: t.text }}>{weather.windSpeed}</Typography>
                    <Typography sx={{ fontSize: 8, color: t.td }}>{tr(lang, 'windSpeedLabel')}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <WbSunnyRoundedIcon sx={{ fontSize: 14, color: weather.uvIndex >= 6 ? '#ef4444' : weather.uvIndex >= 3 ? '#f59e0b' : '#10b981' }} />
                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: t.text }}>{weather.uvIndex}</Typography>
                    <Typography sx={{ fontSize: 8, color: t.td }}>{tr(lang, 'uvIndexLabel')}</Typography>
                  </Box>
                </Box>
              </Box>
            </Card>

            {/* Protection tips */}
            {protectionTips.length > 0 && (
              <Card delay={.15}>
                <SectionTitle icon={<ShieldRoundedIcon sx={{ fontSize: 14, color: '#f43f5e' }} />} title={tr(lang, 'dailyProtection')} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: .75 }}>
                  {protectionTips.map((tip, i) => (
                    <Box key={i} sx={{
                      display: 'flex', alignItems: 'flex-start', gap: 1, px: 1.25, py: .75,
                      borderRadius: 2, background: `${tip.color}${t.isDark ? '10' : '14'}`,
                      border: `1px solid ${tip.color}${t.isDark ? '18' : '22'}`,
                    }}>
                      <Box sx={{ color: tip.color, mt: .2, flexShrink: 0 }}>{tip.icon}</Box>
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: 12, color: t.text }}>{tip.title}</Typography>
                        <Typography sx={{ fontSize: 10, color: t.ts, lineHeight: 1.4 }}>{tip.sub}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Card>
            )}
          </Box>
        )}

        {/* ─────── VITALS ROW ─────── */}
        {(sleepHours > 0 || stressScore > 0 || recoveryScore > 0) && (
          <Card delay={.15} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2.5, justifyContent: 'center' }}>
              {sleepHours > 0 && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 9, color: t.tm, textTransform: 'uppercase', letterSpacing: .5 }}>{tr(lang, 'vitalSleep')}</Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: 18, color: sleepHours >= 7 ? '#10b981' : sleepHours >= 5 ? '#f59e0b' : '#ef4444' }}>
                    {sleepHours.toFixed(1)}h
                  </Typography>
                </Box>
              )}
              {stressScore > 0 && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 9, color: t.tm, textTransform: 'uppercase', letterSpacing: .5 }}>{tr(lang, 'vitalStress')}</Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: 18, color: stressScore <= 30 ? '#10b981' : stressScore <= 60 ? '#f59e0b' : '#ef4444' }}>{stressScore}</Typography>
                </Box>
              )}
              {recoveryScore > 0 && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 9, color: t.tm, textTransform: 'uppercase', letterSpacing: .5 }}>{tr(lang, 'vitalRecovery')}</Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: 18, color: recoveryScore >= 70 ? '#10b981' : recoveryScore >= 40 ? '#f59e0b' : '#ef4444' }}>{recoveryScore}</Typography>
                </Box>
              )}
            </Box>
          </Card>
        )}

        {/* ─────── MODULE QUICK NAV (horizontal scroll) ─────── */}
        <Box sx={{
          display: 'flex', gap: 1, mb: 2.5, overflowX: 'auto', pb: .5, animation: 'hb-slide-up .4s .2s ease both',
          '&::-webkit-scrollbar': { height: 3 },
          '&::-webkit-scrollbar-thumb': { bgcolor: t.trk, borderRadius: 2 },
        }}>
          {MODULE_NAV.map((mod) => (
            <Box key={mod.label} onClick={() => navigate(mod.path)} sx={{
              display: 'flex', alignItems: 'center', gap: .75, px: 1.5, py: .75,
              borderRadius: 2.5, flexShrink: 0,
              background: `${mod.color}${t.isDark ? '10' : '18'}`, border: `1px solid ${mod.color}${t.isDark ? '18' : '28'}`,
              cursor: 'pointer', transition: 'all .2s',
              '&:hover': { background: `${mod.color}${t.isDark ? '18' : '28'}`, borderColor: `${mod.color}35`, transform: 'translateY(-1px)' },
              '&:active': { transform: 'scale(.97)' },
            }}>
              <Box sx={{ color: mod.color, display: 'flex' }}>{mod.icon}</Box>
              <Typography sx={{ fontWeight: 700, fontSize: 12, color: t.text }}>{mod.label}</Typography>
            </Box>
          ))}
        </Box>

        {/* ─────── TWO-COLUMN LAYOUT: Plan + Scores ─────── */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>

          {/* Left: Today's Plan */}
          <Card delay={.25}>
            <SectionTitle
              icon={<AccessTimeIcon sx={{ fontSize: 14, color: '#38bdf8' }} />}
              title={tr(lang, 'todaysPlan')}
              right={<Typography sx={{ fontSize: 10, color: t.td }}>{plan.filter(p => p.done).length}/{plan.length}</Typography>}
            />
            {plan.length === 0 ? (
              <Typography sx={{ fontSize: 12, color: t.td }}>{tr(lang, 'noPlanYet')}</Typography>
            ) : plan.map((item, i) => (
              <Box key={item.id} sx={{
                display: 'flex', gap: 1, py: .75, borderBottom: i < plan.length - 1 ? `1px solid ${t.div}` : 'none',
                opacity: item.done ? .4 : 1,
              }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 16, pt: .15 }}>
                  <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: item.done ? t.td4 : item.color, boxShadow: item.done ? 'none' : `0 0 6px ${item.color}50` }} />
                  {i < plan.length - 1 && <Box sx={{ width: 1, flex: 1, bgcolor: t.div, minHeight: 16 }} />}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 12, color: t.text, textDecoration: item.done ? 'line-through' : 'none' }}>{item.title}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: .5, mt: .15 }}>
                    <Typography sx={{ fontSize: 10, color: t.td }}>{item.time}</Typography>
                    <Chip label={item.module} size="small" sx={{ height: 14, fontSize: 8, bgcolor: t.sub, color: t.td, fontWeight: 600 }} />
                  </Box>
                  {item.note && <Typography sx={{ fontSize: 10, color: t.td2, mt: .2, lineHeight: 1.3 }}>{item.note}</Typography>}
                </Box>
              </Box>
            ))}
          </Card>

          {/* Right: Module Scores */}
          {moduleScores.length > 0 ? (
            <Card delay={.3}>
              <SectionTitle
                icon={<TrendingUpIcon sx={{ fontSize: 14, color: '#C9A84C' }} />}
                title={tr(lang, 'moduleScoresLabel')}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {moduleScores.map((s) => (
                  <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Ring score={s.score} size={38} stroke={3.5} color={s.color}>
                      <Typography sx={{ fontWeight: 800, fontSize: 10, color: t.text }}>{s.score}</Typography>
                    </Ring>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 12, color: t.text }}>{s.emoji} {s.label}</Typography>
                      <LinearProgress variant="determinate" value={s.score} sx={{
                        height: 3, borderRadius: 2, bgcolor: t.div, mt: .3,
                        '& .MuiLinearProgress-bar': { bgcolor: s.color, borderRadius: 2 },
                      }} />
                    </Box>
                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: s.trend === 'up' ? '#10b981' : s.trend === 'down' ? '#ef4444' : t.td3 }}>
                      {s.trend === 'up' ? '↑' : s.trend === 'down' ? '↓' : '→'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Card>
          ) : (
            <Card delay={.3}>
              <SectionTitle
                icon={<TrendingUpIcon sx={{ fontSize: 14, color: '#C9A84C' }} />}
                title={tr(lang, 'quickActions')}
              />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: .75 }}>
                {MODULE_NAV.slice(0, 4).map((mod) => (
                  <Box key={mod.label} onClick={() => navigate(mod.path)} sx={{
                    textAlign: 'center', py: 1.25, borderRadius: 2.5, cursor: 'pointer',
                    background: `${mod.color}${t.isDark ? '06' : '12'}`, border: `1px solid ${mod.color}${t.isDark ? '12' : '20'}`,
                    transition: 'all .2s', '&:hover': { background: `${mod.color}${t.isDark ? '12' : '20'}` },
                  }}>
                    <Typography sx={{ fontSize: 18, mb: .25 }}>{mod.emoji}</Typography>
                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: t.text }}>{mod.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Card>
          )}
        </Box>

        {/* ─────── DESKTOP 2-COL: Quests + Suggestions ─────── */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: { xs: 0, md: 2 } }}>

        {/* ─────── DAILY QUESTS ─────── */}
        {quests.length > 0 && (
          <Card delay={.35} sx={{ mb: { xs: 2, md: 0 } }}>
            <SectionTitle
              icon={<StarIcon sx={{ fontSize: 14, color: '#f59e0b' }} />}
              title={tr(lang, 'dailyQuests')}
              right={<Typography sx={{ fontSize: 10, color: t.td }}>{quests.filter(q => questDone.has(q.id)).length}/{quests.length}</Typography>}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: .5 }}>
              {quests.map((q) => {
                const done = questDone.has(q.id);
                return (
                  <Box key={q.id} onClick={() => toggleQuest(q.id)} sx={{
                    display: 'flex', alignItems: 'center', gap: 1, px: 1.25, py: .75,
                    borderRadius: 2, cursor: 'pointer', transition: 'all .2s',
                    background: done ? 'rgba(16,185,129,.08)' : 'transparent',
                    '&:hover': { background: done ? 'rgba(16,185,129,.12)' : t.hov },
                  }}>
                    {done
                      ? <CheckCircleIcon sx={{ color: '#10b981', fontSize: 18 }} />
                      : <RadioButtonUncheckedIcon sx={{ color: t.td4, fontSize: 18 }} />}
                    <Typography sx={{
                      flex: 1, fontSize: 13, fontWeight: 600, color: done ? t.tm : t.text,
                      textDecoration: done ? 'line-through' : 'none',
                    }}>{q.label}</Typography>
                    <Chip label={`+${q.xp} XP`} size="small" sx={{
                      height: 18, fontSize: 9, fontWeight: 700,
                      bgcolor: done ? 'rgba(16,185,129,.12)' : 'rgba(201,168,76,.1)',
                      color: done ? '#10b981' : '#C9A84C',
                      border: '1px solid', borderColor: done ? 'rgba(16,185,129,.2)' : 'rgba(201,168,76,.18)',
                    }} />
                  </Box>
                );
              })}
            </Box>
          </Card>
        )}

        {/* ─────── SUGGESTIONS ─────── */}
        {suggestions.length > 0 && (
          <Card delay={.4} sx={{ mb: { xs: 2, md: 0 } }}>
            <Typography sx={{ fontWeight: 700, fontSize: 14, color: t.text, mb: 1.5 }}>{tr(lang, 'suggestedForYou')}</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: .75 }}>
              {suggestions.map((s, i) => (
                <Box key={i} onClick={() => s.path && navigate(s.path)} sx={{
                  display: 'flex', alignItems: 'center', gap: 1.25, px: 1.25, py: 1,
                  borderRadius: 2.5, cursor: s.path ? 'pointer' : 'default', transition: 'all .2s',
                  '&:hover': s.path ? { background: t.hov, transform: 'translateX(2px)' } : {},
                }}>
                  <Box sx={{
                    width: 34, height: 34, borderRadius: 2, flexShrink: 0, fontSize: 16,
                    background: s.tagBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{s.emoji}</Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 13, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</Typography>
                    <Typography sx={{ fontSize: 11, color: t.ts, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.sub}</Typography>
                  </Box>
                  <Chip label={s.tag} size="small" sx={{
                    height: 18, fontSize: 9, fontWeight: 700, flexShrink: 0,
                    bgcolor: s.tagBg, color: s.tagColor, border: `1px solid ${s.tagColor}25`,
                  }} />
                </Box>
              ))}
            </Box>
          </Card>
        )}

        </Box>{/* end 2-col grid */}

        {/* ─────── BOBO INSIGHTS ─────── */}
        {boboCards.length > 0 && (
          <Card delay={.45} sx={{ mb: 2 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 14, color: t.text, mb: 1.5 }}>{tr(lang, 'boboSays')}</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {boboCards.map((ci) => (
                <Box key={ci.id} sx={{
                  p: 1.5, borderRadius: 2.5,
                  background: 'linear-gradient(135deg,rgba(201,168,76,.06),rgba(201,168,76,.02))',
                  border: '1px solid rgba(201,168,76,.1)',
                  position: 'relative',
                }}>
                  <IconButton size="small" onClick={() => dismissCard(ci.id)}
                      sx={{ position: 'absolute', top: 4, right: 4, color: t.td3, '&:hover': { color: t.ts } }}>
                    <CloseIcon sx={{ fontSize: 13 }} />
                  </IconButton>
                    <Typography sx={{ fontWeight: 700, fontSize: 13, color: t.text, pr: 3, mb: .25 }}>{ci.title}</Typography>
                    <Typography sx={{ fontSize: 11, color: t.ts, lineHeight: 1.4, mb: .75 }}>{ci.description}</Typography>
                  <Box sx={{ display: 'flex', gap: .5 }}>
                    {ci.modules.map(m => {
                      const meta = MODULE_SCORE_META[m];
                      return <Chip key={m} label={`${meta?.emoji ?? ''} ${m}`} size="small" sx={{ height: 18, fontSize: 8, fontWeight: 600, bgcolor: `${meta?.color ?? '#64748b'}12`, color: meta?.color ?? '#64748b', border: `1px solid ${meta?.color ?? '#64748b'}20` }} />;
                    })}
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>
        )}

        {/* ─────── SMART NUDGES ─────── */}
        {nudges.length > 0 && (
          <Card delay={.48} sx={{ mb: 2 }}>
            <SectionTitle icon={<BoltIcon sx={{ fontSize: 14, color: '#fbbf24' }} />} title={lang === 'ar' ? 'تنبيهات ذكية' : 'Smart Nudges'} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: .75 }}>
              {nudges.map((n, i) => (
                <Box key={i} sx={{
                  display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1,
                  borderRadius: 2.5,
                  background: `${n.color}${t.isDark ? '0a' : '10'}`,
                  border: `1px solid ${n.color}${t.isDark ? '15' : '20'}`,
                }}>
                  <Typography sx={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{n.emoji}</Typography>
                  <Typography sx={{ fontSize: 12, color: t.text, lineHeight: 1.4 }}>{n.text}</Typography>
                </Box>
              ))}
            </Box>
          </Card>
        )}

        {/* ─────── ACHIEVEMENTS (compact row) ─────── */}
        <Card delay={.5} sx={{ mb: 3 }}>
          <SectionTitle
            icon={<EmojiEventsIcon sx={{ fontSize: 14, color: '#C9A84C' }} />}
            title={lang === 'ar' ? 'الإنجازات' : 'Achievements'}
              right={<Typography sx={{ fontSize: 10, color: t.td }}>{achievements.filter(a => a.unlocked).length}/{achievements.length}</Typography>}
          />
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
            {achievements.map((a, i) => (
              <Tooltip key={a.id} title={a.desc} arrow placement="top">
                <Box sx={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: .3, cursor: 'pointer',
                  animation: a.unlocked ? `hb-badge-pop .5s ${.55 + i * .06}s ease both` : `hb-slide-up .4s ${.55 + i * .06}s ease both`,
                  '&:active': { transform: 'scale(.9)' }, transition: 'transform .15s',
                }}>
                  <Box sx={{
                    width: 40, height: 40, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: a.unlocked ? 'linear-gradient(135deg,#C9A84C,#E5B84E,#A8862A)' : t.hov,
                    border: '2px solid', borderColor: a.unlocked ? '#C9A84C' : t.trk,
                    boxShadow: a.unlocked ? '0 3px 12px rgba(201,168,76,.3)' : 'none',
                    animation: a.unlocked ? 'hb-glow 3.5s ease infinite' : 'none',
                    opacity: a.unlocked ? 1 : .25,
                  }}>{a.icon}</Box>
                  <Typography sx={{ fontSize: 8, textAlign: 'center', color: a.unlocked ? t.text : t.td3, fontWeight: 600, lineHeight: 1.2 }}>{a.title}</Typography>
                </Box>
              </Tooltip>
            ))}
          </Box>
        </Card>

      </Box>
    </Box>
    </PalCtx.Provider>
  );
}
