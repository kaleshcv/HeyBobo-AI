import { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Tooltip, Chip, useTheme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
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

import { useAuth } from '@/hooks/useAuth';
import { useAIBrainStore } from '@/store/aiBrainStore';
import { useWearablesStore, type HealthReading } from '@/store/wearablesStore';
import { useActivityTrackingStore } from '@/store/activityTrackingStore';
import { useWorkoutSystemStore } from '@/store/workoutSystemStore';
import { useLiveWorkoutStore } from '@/store/liveWorkoutStore';
import { useCourseStore } from '@/store/courseStore';
import { useShoppingListStore } from '@/store/shoppingListStore';
import { useInjuryStore } from '@/store/injuryStore';

/* ═══════════════════════════════════════════════════════════════════
   CSS KEYFRAMES — injected once into <head>
   ═══════════════════════════════════════════════════════════════════ */
const STYLE_ID = 'bobo-dash-keyframes';
function ensureKeyframes() {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes bd-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    @keyframes bd-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
    @keyframes bd-glow{0%,100%{box-shadow:0 0 15px rgba(201,168,76,.25)}50%{box-shadow:0 0 35px rgba(201,168,76,.5),0 0 60px rgba(201,168,76,.15)}}
    @keyframes bd-shimmer{0%{left:-40%}100%{left:140%}}
    @keyframes bd-slide-up{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    @keyframes bd-bounce{0%,100%{transform:translateY(0) scale(1)}30%{transform:translateY(-10px) scale(1.04)}50%{transform:translateY(-4px) scale(1.02)}}
    @keyframes bd-fire{0%,100%{transform:scaleY(1) scaleX(1);opacity:.9}25%{transform:scaleY(1.12) scaleX(.92);opacity:1}50%{transform:scaleY(.96) scaleX(1.08);opacity:.85}75%{transform:scaleY(1.08) scaleX(.96);opacity:1}}
    @keyframes bd-ring{from{stroke-dashoffset:314}}
    @keyframes bd-confetti{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(-70px) rotate(720deg);opacity:0}}
    @keyframes bd-badge-pop{0%{transform:scale(0) rotate(-180deg);opacity:0}60%{transform:scale(1.15) rotate(8deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:1}}
    @keyframes bd-particle{0%{transform:translateY(0) scale(1);opacity:.7}100%{transform:translateY(-80px) scale(0);opacity:0}}
    @keyframes bd-wave{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
    @keyframes bd-bob{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-5px) rotate(2deg)}}
    @keyframes bd-breathe{0%,100%{opacity:.04}50%{opacity:.08}}
    @keyframes bd-live-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}
  `;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════ */
function todayStr() { return new Date().toISOString().slice(0, 10); }
function clamp(v: number, min = 0, max = 100) { return Math.min(max, Math.max(min, v)); }

/* ═══════════════════════════════════════════════════════════════════
   SUB‑COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

/* ── Floating background particle ── */
function Particle({ delay, left, color, size = 5 }: { delay: number; left: string; color: string; size?: number }) {
  return (
    <Box sx={{
      position: 'absolute', bottom: 0, left, width: size, height: size,
      borderRadius: '50%', bgcolor: color, opacity: 0,
      animation: `bd-particle 4s ${delay}s ease-out infinite`, pointerEvents: 'none',
    }} />
  );
}

/* ── SVG ring progress ── */
function Ring({
  score, size = 140, stroke = 8, color, children,
}: { score: number; size?: number; stroke?: number; color: string; children?: React.ReactNode }) {
  const { ringTrack } = useDk();
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (clamp(score) / 100) * circ;
  return (
    <Box sx={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={ringTrack} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 8px ${color}80)`, transition: 'stroke-dashoffset 1.2s ease', animation: 'bd-ring 1.2s ease forwards' }} />
      </svg>
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </Box>
    </Box>
  );
}

/* ── Module orb (small circular stat) ── */
function ModuleOrb({
  icon, value, label, color, percent, onClick, delay = 0,
}: { icon: React.ReactNode; value: string; label: string; color: string; percent: number; onClick?: () => void; delay?: number }) {
  const { txt, txtSub } = useDk();
  const [tapped, setTapped] = useState(false);
  const tap = () => { setTapped(true); setTimeout(() => setTapped(false), 500); onClick?.(); };
  return (
    <Box onClick={tap} sx={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5,
      cursor: 'pointer', animation: `bd-slide-up .5s ${delay}s ease both`,
      '&:active': { transform: 'scale(.92)' }, transition: 'transform .12s',
    }}>
      <Ring score={clamp(percent)} size={72} stroke={5} color={color}>
        <Box sx={{
          width: 40, height: 40, borderRadius: '50%',
          background: `linear-gradient(135deg, ${color}25, ${color}10)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: tapped ? 'bd-bounce .5s ease' : `bd-float 4s ${delay * .3}s ease-in-out infinite`,
          boxShadow: `0 4px 16px ${color}30`,
        }}>
          {icon}
        </Box>
      </Ring>
      <Typography sx={{ fontWeight: 800, color: txt, fontSize: 13, lineHeight: 1 }}>{value}</Typography>
      <Typography sx={{ color: txtSub, fontSize: 9, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</Typography>
    </Box>
  );
}

/* ── Quest row ── */
function Quest({ label, xp, done, onTap, delay = 0 }: { label: string; xp: number; done: boolean; onTap: () => void; delay?: number }) {
  const { txt, txtSub, txtGhost, glassBgLt, glassBorderLt, glassHover, accent, aA } = useDk();
  return (
    <Box onClick={onTap} sx={{
      display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1.25,
      borderRadius: 3,
      background: done ? 'linear-gradient(135deg,rgba(16,185,129,.12),rgba(16,185,129,.04))' : glassBgLt,
      border: '1px solid', borderColor: done ? 'rgba(16,185,129,.25)' : glassBorderLt,
      cursor: 'pointer', transition: 'all .25s', animation: `bd-slide-up .4s ${delay}s ease both`,
      '&:hover': { background: done ? 'rgba(16,185,129,.15)' : glassHover, transform: 'translateX(3px)' },
      '&:active': { transform: 'scale(.98)' },
    }}>
      {done
        ? <CheckCircleIcon sx={{ color: '#10b981', fontSize: 22, animation: 'bd-pulse 2.5s ease infinite' }} />
        : <RadioButtonUncheckedIcon sx={{ color: txtGhost, fontSize: 22 }} />}
      <Typography variant="body2" sx={{
        flex: 1, fontWeight: 600, fontSize: 13,
        color: done ? txtSub : txt,
        textDecoration: done ? 'line-through' : 'none',
      }}>{label}</Typography>
      <Box sx={{
        px: .8, py: .2, borderRadius: 2,
        background: done ? 'rgba(16,185,129,.18)' : aA(.12),
        display: 'flex', alignItems: 'center', gap: .4,
      }}>
        <StarIcon sx={{ fontSize: 12, color: done ? '#10b981' : accent }} />
        <Typography sx={{ fontWeight: 700, color: done ? '#10b981' : accent, fontSize: 10 }}>+{xp}</Typography>
      </Box>
    </Box>
  );
}

/* ── Schedule item (timeline) ── */
function TimelineItem({
  time, title, color, done, note, isLast, delay = 0,
}: { time: string; title: string; color: string; done: boolean; note?: string; isLast: boolean; delay?: number }) {
  const { txt, txtFaint, txtMuted, glassBorder } = useDk();
  return (
    <Box sx={{ display: 'flex', gap: 1.5, animation: `bd-slide-up .4s ${delay}s ease both` }}>
      {/* timeline dot + line */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, pt: .3 }}>
        <Box sx={{
          width: 10, height: 10, borderRadius: '50%',
          bgcolor: done ? txtMuted : color,
          boxShadow: done ? 'none' : `0 0 10px ${color}60`,
          transition: 'all .3s',
        }} />
        {!isLast && <Box sx={{ width: 1.5, flex: 1, bgcolor: glassBorder, minHeight: 24 }} />}
      </Box>
      {/* content */}
      <Box sx={{ flex: 1, pb: 1.5, opacity: done ? .4 : 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: .25 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 12, color: txt, textDecoration: done ? 'line-through' : 'none' }}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: .75 }}>
          <AccessTimeIcon sx={{ fontSize: 11, color: txtFaint }} />
          <Typography sx={{ fontSize: 10, color: txtFaint }}>{time}</Typography>
        </Box>
        {note && (
          <Typography sx={{ fontSize: 10, color: txtMuted, mt: .25, lineHeight: 1.3 }}>{note}</Typography>
        )}
      </Box>
    </Box>
  );
}

/* ── Suggestion card ── */
function SuggestionCard({
  emoji, title, sub, tag, tagColor, onClick, delay = 0,
}: { emoji: string; title: string; sub: string; tag: string; tagColor: string; onClick?: () => void; delay?: number }) {
  const { txt, txtDim, glassBgLt, glassBorderLt, glassHover } = useDk();
  return (
    <Box onClick={onClick} sx={{
      display: 'flex', alignItems: 'center', gap: 1.25, p: 1.25,
      borderRadius: 3, background: glassBgLt,
      border: `1px solid ${glassBorderLt}`, cursor: 'pointer',
      transition: 'all .25s', animation: `bd-slide-up .4s ${delay}s ease both`,
      '&:hover': { background: glassHover, transform: 'translateX(3px)', borderColor: `${tagColor}40` },
      '&:active': { transform: 'scale(.97)' },
    }}>
      <Box sx={{
        width: 36, height: 36, borderRadius: 2.5, flexShrink: 0,
        background: `${tagColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
      }}>{emoji}</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 12, color: txt, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</Typography>
        <Typography sx={{ fontSize: 10, color: txtDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</Typography>
      </Box>
      <Chip label={tag} size="small" sx={{ height: 18, fontSize: 8, fontWeight: 700, bgcolor: `${tagColor}18`, color: tagColor, border: '1px solid', borderColor: `${tagColor}30` }} />
    </Box>
  );
}

/* ── Achievement badge ── */
function Badge({
  icon, title, desc, unlocked, delay = 0,
}: { icon: React.ReactNode; title: string; desc: string; unlocked: boolean; delay?: number }) {
  const { dk, txt, txtMuted, accent, glassBg, glassBorder, aA } = useDk();
  return (
    <Tooltip title={desc} arrow placement="top">
      <Box sx={{
        width: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: .4,
        animation: unlocked ? `bd-badge-pop .5s ${delay}s ease both` : `bd-slide-up .4s ${delay}s ease both`,
        cursor: 'pointer', '&:active': { transform: 'scale(.9)' }, transition: 'transform .12s',
      }}>
        <Box sx={{
          width: 48, height: 48, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: unlocked
            ? (dk ? 'linear-gradient(135deg,#C9A84C,#E5B84E,#A8862A)' : 'linear-gradient(135deg,#00843D,#00A650,#006B32)')
            : glassBg,
          border: '2px solid', borderColor: unlocked ? accent : glassBorder,
          boxShadow: unlocked ? `0 4px 18px ${aA(.35)}` : 'none',
          animation: unlocked ? 'bd-glow 3.5s ease infinite' : 'none',
          opacity: unlocked ? 1 : .3,
        }}>{icon}</Box>
        <Typography sx={{ fontSize: 8, textAlign: 'center', color: unlocked ? txt : txtMuted, fontWeight: 600, lineHeight: 1.2 }}>{title}</Typography>
      </Box>
    </Tooltip>
  );
}

/* ── Section glass card ── */
function GlassCard({
  children, delay = 0, sx,
}: { children: React.ReactNode; delay?: number; sx?: object }) {
  const { glassBg, glassBorder } = useDk();
  return (
    <Box sx={{
      p: 2, borderRadius: 4,
      background: glassBg,
      border: `1px solid ${glassBorder}`,
      backdropFilter: 'blur(12px)',
      animation: `bd-slide-up .5s ${delay}s ease both`,
      ...sx,
    }}>{children}</Box>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MODULE‑LEVEL CONSTANTS
   ═══════════════════════════════════════════════════════════════════ */
const MODULE_NAV: { icon: React.ReactNode; label: string; color: string; path: string; emoji: string }[] = [
  { icon: <SchoolIcon sx={{ fontSize: 26 }} />,         label: 'Learn',     color: '#38bdf8', path: '/app/education',  emoji: '📚' },
  { icon: <FitnessCenterIcon sx={{ fontSize: 26 }} />,  label: 'Fitness',   color: '#10b981', path: '/app/fitness',    emoji: '🏋️' },
  { icon: <MonitorHeartIcon sx={{ fontSize: 26 }} />,   label: 'Health',    color: '#f43f5e', path: '/app/health',     emoji: '❤️' },
  { icon: <RestaurantIcon sx={{ fontSize: 26 }} />,     label: 'Diet',      color: '#f59e0b', path: '/app/dietary',    emoji: '🍎' },
  { icon: <ShoppingCartIcon sx={{ fontSize: 26 }} />,   label: 'Shop',      color: '#a78bfa', path: '/app/shopping',   emoji: '🛒' },
  { icon: <GroupsIcon sx={{ fontSize: 26 }} />,         label: 'Groups',    color: '#ec4899', path: '/app/groups',     emoji: '👥' },
];

const MODULE_SCORE_META: Record<string, { emoji: string; color: string }> = {
  education: { emoji: '📚', color: '#38bdf8' },
  fitness:   { emoji: '🏋️', color: '#10b981' },
  health:    { emoji: '❤️', color: '#f43f5e' },
  dietary:   { emoji: '🍎', color: '#f59e0b' },
  wellness:  { emoji: '✨', color: '#a78bfa' },
  injury:    { emoji: '🩹', color: '#fb923c' },
  shopping:  { emoji: '🛒', color: '#a78bfa' },
  groups:    { emoji: '👥', color: '#ec4899' },
  productivity: { emoji: '⚡', color: '#fbbf24' },
  social:    { emoji: '👥', color: '#ec4899' },
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
/* ── Palette hook for light/dark ── */
function useDk() {
  const t = useTheme();
  const dk = t.palette.mode === 'dark';
  return {
    dk,
    txt: dk ? '#F5F0E8' : '#1C1C1C',
    txtSub: dk ? 'rgba(255,255,255,.4)' : 'rgba(0,0,0,.5)',
    txtDim: dk ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.4)',
    txtFaint: dk ? 'rgba(255,255,255,.3)' : 'rgba(0,0,0,.3)',
    txtMuted: dk ? 'rgba(255,255,255,.25)' : 'rgba(0,0,0,.2)',
    txtGhost: dk ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.15)',
    accent: dk ? '#C9A84C' : '#00843D',
    accentLt: dk ? '#E5B84E' : '#00A650',
    accentBg: dk ? '#0D1B2A' : '#FFFFFF',
    glassBg: dk ? 'rgba(255,255,255,.03)' : 'rgba(0,132,61,.03)',
    glassBgLt: dk ? 'rgba(255,255,255,.025)' : 'rgba(0,132,61,.025)',
    glassBorder: dk ? 'rgba(255,255,255,.06)' : 'rgba(0,132,61,.08)',
    glassBorderLt: dk ? 'rgba(255,255,255,.05)' : 'rgba(0,132,61,.06)',
    glassHover: dk ? 'rgba(255,255,255,.05)' : 'rgba(0,132,61,.06)',
    ringTrack: dk ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)',
    aA: (a: number) => dk ? `rgba(201,168,76,${a})` : `rgba(0,132,61,${a})`,
  };
}

export default function GameDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const P = useDk();

  useEffect(() => { ensureKeyframes(); }, []);

  /* ── live sync tick ── */
  const [syncTick, setSyncTick] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => { setSyncTick(t => t + 1); setLastSyncTime(new Date()); }, 30000);
    return () => clearInterval(id);
  }, []);
  // syncTick forces re-read of store selectors on each tick
  void syncTick;

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

  // Module scores
  const moduleScores = useMemo(() =>
    moduleInsights.map(m => ({
      label: m.label, score: m.score, trend: m.trend,
      emoji: MODULE_SCORE_META[m.module]?.emoji ?? '📊',
      color: MODULE_SCORE_META[m.module]?.color ?? '#64748b',
    })),
  [moduleInsights]);

  // Grade
  const grade = lifeScore >= 90 ? 'S' : lifeScore >= 75 ? 'A' : lifeScore >= 60 ? 'B' : lifeScore >= 40 ? 'C' : 'D';
  const gradeColor: Record<string, string> = { S: '#C9A84C', A: '#10b981', B: '#38bdf8', C: '#f59e0b', D: '#ef4444' };

  // Top alert
  const topAlert = useMemo(() => {
    const active = brainAlerts.filter(a => !a.dismissed);
    return active.find(a => a.severity === 'error') || active.find(a => a.severity === 'warning') || active[0] || null;
  }, [brainAlerts]);

  // Quests from recommendations
  const [questDone, setQuestDone] = useState<Set<string>>(new Set());
  const toggleQuest = useCallback((id: string) => {
    setQuestDone(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);
  const quests = useMemo(() =>
    recommendations.slice(0, 6).map((r, i) => ({ id: r.id, label: r.title, xp: [100, 75, 50, 60, 50, 80][i % 6] })),
  [recommendations]);

  // Today's plan
  const plan = useMemo(() =>
    schedule.map(s => ({ id: s.id, title: s.title, time: s.time, color: s.color ?? '#00897b', done: s.completed, note: s.note })),
  [schedule]);

  // Suggestions
  type Sug = { emoji: string; title: string; sub: string; tag: string; tagColor: string; path?: string };
  const suggestions = useMemo(() => {
    const items: Sug[] = [];
    if (sleepHours > 0 && sleepHours < 6)
      items.push({ emoji: '😴', title: 'Improve Sleep', sub: `${sleepHours.toFixed(1)}h — try earlier bedtime`, tag: 'Health', tagColor: '#f43f5e', path: '/app/health' });
    if (stressScore > 50)
      items.push({ emoji: '🧘', title: 'Lower Stress', sub: stressScore > 70 ? 'Try breathing exercises' : 'Take a mindfulness break', tag: 'Wellness', tagColor: '#a78bfa', path: '/app/fitness' });
    const stepsGap = activityGoals.steps - todayMetrics.steps;
    if (stepsGap > 1000)
      items.push({ emoji: '🚶', title: `${stepsGap.toLocaleString()} Steps Left`, sub: `${todayMetrics.steps.toLocaleString()} / ${activityGoals.steps.toLocaleString()}`, tag: 'Fitness', tagColor: '#10b981', path: '/app/health/activity-tracking' });
    activeInjuries.slice(0, 1).forEach(inj =>
      items.push({ emoji: '🩹', title: `${inj.bodyPart} Recovery`, sub: `Status: ${inj.status}`, tag: 'Injury', tagColor: '#fb923c', path: '/app/health/injury' }));
    courses.slice(0, 2).forEach(c => {
      const p = getCourseProgress(c.id);
      if (p.percent > 0 && p.percent < 100)
        items.push({ emoji: '📚', title: c.title, sub: `${p.percent}% — ${p.total - p.completed} left`, tag: 'Learn', tagColor: '#38bdf8', path: '/app/education' });
    });
    shoppingLists.forEach(list => {
      const unchecked = list.items.filter(i => !i.checked);
      if (unchecked.length > 0)
        items.push({ emoji: '🛒', title: `${list.emoji} ${list.name}`, sub: `${unchecked.length} items left`, tag: 'Shop', tagColor: '#a78bfa', path: '/app/shopping' });
    });
    return items.slice(0, 6);
  }, [sleepHours, stressScore, activityGoals, todayMetrics, activeInjuries, courses, getCourseProgress, shoppingLists]);

  // Achievements
  const achievements = useMemo(() => [
    { id: 'first', icon: <DirectionsRunIcon sx={{ fontSize: 22, color: P.accentBg }} />, title: 'First Steps', desc: 'Log first activity', unlocked: todayMetrics.steps > 0 || workoutLogs.length > 0 },
    { id: 'goals', icon: <EmojiEventsIcon sx={{ fontSize: 22, color: P.accentBg }} />, title: 'Goal Crusher', desc: 'Hit all daily goals', unlocked: stepPct >= 100 && calPct >= 100 && activePct >= 100 },
    { id: 'streak3', icon: <LocalFireDepartmentIcon sx={{ fontSize: 22, color: P.accentBg }} />, title: 'On Fire', desc: '3-day streak', unlocked: streak >= 3 },
    { id: 'learner', icon: <SchoolIcon sx={{ fontSize: 22, color: P.accentBg }} />, title: 'Scholar', desc: 'Complete a course', unlocked: courses.some(c => getCourseProgress(c.id).percent >= 100) },
    { id: 'level5', icon: <StarIcon sx={{ fontSize: 22, color: P.accentBg }} />, title: 'Level 5', desc: 'Reach level 5', unlocked: xpData.level >= 5 },
    { id: 'social', icon: <GroupsIcon sx={{ fontSize: 22, color: P.accentBg }} />, title: 'Team Player', desc: 'Join a group', unlocked: false },
  ], [todayMetrics.steps, workoutLogs.length, stepPct, calPct, activePct, streak, courses, getCourseProgress, xpData.level]);

  // Greeting
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  }, []);
  const firstName = user?.firstName ?? 'there';
  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  return (
    <Box sx={{
      flex: 1, overflow: 'auto', position: 'relative',
      background: P.dk
        ? 'linear-gradient(180deg, #080e1a 0%, #0D1B2A 25%, #101d2e 100%)'
        : 'linear-gradient(180deg, #F0FAF5 0%, #F8F9FA 25%, #EDF5F0 100%)',
      minHeight: '100vh',
    }}>
      {/* ── ambient background ── */}
      <Box sx={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        {Array.from({ length: 16 }).map((_, i) => (
          <Particle key={i} delay={i * .8} left={`${3 + (i * 41) % 94}%`} color={['#C9A84C', '#10b981', '#38bdf8', '#f59e0b', '#f43f5e'][i % 5]} size={4 + (i % 3) * 2} />
        ))}
        <Box sx={{ position: 'absolute', top: '8%', left: '8%', width: 280, height: 280, borderRadius: '50%', background: `radial-gradient(circle,${P.aA(.05)},transparent 70%)`, animation: 'bd-breathe 6s ease infinite' }} />
        <Box sx={{ position: 'absolute', top: '45%', right: '3%', width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle,rgba(56,189,248,.04),transparent 70%)', animation: 'bd-breathe 8s 2s ease infinite' }} />
        <Box sx={{ position: 'absolute', bottom: '5%', left: '25%', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle,rgba(16,185,129,.04),transparent 70%)', animation: 'bd-breathe 7s 4s ease infinite' }} />
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: { xs: 520, md: 960, lg: 1100 }, mx: 'auto', px: { xs: 2, md: 4 }, py: 3 }}>

        {/* ─────── HEADER ─────── */}
        <Box sx={{ mb: 3, animation: 'bd-slide-up .5s ease both' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box>
              <Typography sx={{ fontSize: 11, color: P.txtFaint, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
                {todayDate}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: P.txt, mt: .25 }}>
                {greeting}, {firstName}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: .75, alignItems: 'center' }}>
              {/* Live sync indicator */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: .5, mr: .5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981', animation: 'bd-live-dot 2s ease infinite' }} />
                <Typography sx={{ fontSize: 9, color: P.txtFaint }}>
                  {lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
              {streak > 0 && (
                <Box sx={{
                  px: 1, py: .4, borderRadius: 2.5,
                  background: 'linear-gradient(135deg,rgba(239,68,68,.15),rgba(245,158,11,.1))',
                  border: '1px solid rgba(239,68,68,.25)',
                  display: 'flex', alignItems: 'center', gap: .5,
                }}>
                  <LocalFireDepartmentIcon sx={{ fontSize: 14, color: '#ef4444', animation: 'bd-fire 1.5s ease infinite' }} />
                  <Typography sx={{ fontWeight: 800, color: '#ef4444', fontSize: 11 }}>{streak}</Typography>
                </Box>
              )}
              <Box sx={{
                px: 1, py: .4, borderRadius: 2.5,
                background: `linear-gradient(135deg,${P.aA(.15)},${P.aA(.05)})`,
                border: `1px solid ${P.aA(.25)}`,
                display: 'flex', alignItems: 'center', gap: .5,
              }}>
                <BoltIcon sx={{ fontSize: 14, color: P.accent }} />
                <Typography sx={{ fontWeight: 800, color: P.accent, fontSize: 11 }}>LVL {xpData.level}</Typography>
              </Box>
            </Box>
          </Box>

          {/* XP bar */}
          <Box sx={{
            height: 8, borderRadius: 4, background: P.glassBorder,
            overflow: 'hidden', position: 'relative',
          }}>
            <Box sx={{
              height: '100%', width: `${(xpData.inLevel / xpData.forLevel) * 100}%`,
              borderRadius: 4,
              background: P.dk ? 'linear-gradient(90deg,#A8862A,#C9A84C,#E5B84E)' : 'linear-gradient(90deg,#006B32,#00843D,#00A650)',
              transition: 'width 1s ease', position: 'relative', overflow: 'hidden',
            }}>
              <Box sx={{ position: 'absolute', top: 0, left: '-40%', width: '40%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent)', animation: 'bd-shimmer 2.5s ease infinite' }} />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: .5 }}>
            <Typography sx={{ fontSize: 9, color: P.txtFaint, letterSpacing: .5 }}>{xpData.total} XP Total</Typography>
            <Typography sx={{ fontSize: 9, color: P.accent, fontWeight: 700 }}>{xpData.inLevel}/{xpData.forLevel}</Typography>
          </Box>
        </Box>

        {/* ─────── LIFE SCORE RING (centered on mobile, side-by-side on desktop) ─────── */}
        {lifeScore > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: { xs: 4, md: 3 }, animation: 'bd-slide-up .5s .1s ease both' }}>
            <Box sx={{ animation: 'bd-pulse 5s ease infinite', position: 'relative' }}>
              <Ring score={lifeScore} size={160} stroke={10} color={P.accent}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: P.txt, lineHeight: 1, textShadow: `0 0 25px ${P.aA(.25)}` }}>
                  {lifeScore}
                </Typography>
                <Box sx={{ px: 1.25, py: .2, borderRadius: 2, background: `${gradeColor[grade]}20`, border: `1px solid ${gradeColor[grade]}40`, mt: .5 }}>
                  <Typography sx={{ fontWeight: 900, color: gradeColor[grade], fontSize: 11, letterSpacing: 2 }}>
                    RANK {grade}
                  </Typography>
                </Box>
              </Ring>
              {streak > 0 && (
                <Box sx={{
                  position: 'absolute', bottom: -2, right: -2, width: 40, height: 40, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#ef4444,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '3px solid', borderColor: P.dk ? '#0D1B2A' : '#F0FAF5', animation: 'bd-fire 1.5s ease infinite', boxShadow: '0 4px 16px rgba(239,68,68,.35)',
                }}>
                  <LocalFireDepartmentIcon sx={{ fontSize: 16, color: '#fff' }} />
                </Box>
              )}
            </Box>
            <Typography sx={{ color: P.txtFaint, mt: 1.5, fontSize: 10, textTransform: 'uppercase', letterSpacing: 2 }}>
              Life Score
            </Typography>
          </Box>
        )}

        {/* ─────── ALERT BANNER ─────── */}
        {topAlert && (
          <Box sx={{
            mb: 2.5, p: 1.5, borderRadius: 3, animation: 'bd-slide-up .4s .15s ease both',
            background: topAlert.severity === 'error' ? 'linear-gradient(135deg,rgba(239,68,68,.12),rgba(239,68,68,.04))' : 'linear-gradient(135deg,rgba(245,158,11,.12),rgba(245,158,11,.04))',
            border: '1px solid', borderColor: topAlert.severity === 'error' ? 'rgba(239,68,68,.2)' : 'rgba(245,158,11,.2)',
            display: 'flex', alignItems: 'flex-start', gap: 1.25,
          }}>
            <WarningAmberIcon sx={{ fontSize: 18, color: topAlert.severity === 'error' ? '#ef4444' : '#f59e0b', mt: .15 }} />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 12, color: P.txt }}>{topAlert.title}</Typography>
              <Typography sx={{ fontSize: 10, color: P.txtSub, lineHeight: 1.3 }}>{topAlert.description}</Typography>
            </Box>
          </Box>
        )}

        {/* ─────── ACTIVITY ORBS ─────── */}
        <Box sx={{ display: 'flex', justifyContent: { xs: 'space-around', md: 'center' }, mb: 3, flexWrap: 'wrap', gap: { xs: 1.5, md: 4 } }}>
          <ModuleOrb icon={<DirectionsRunIcon sx={{ fontSize: 20, color: '#10b981' }} />}
            value={todayMetrics.steps.toLocaleString()} label="Steps" color="#10b981"
            percent={stepPct} delay={.15} onClick={() => navigate('/app/health/activity-tracking')} />
          <ModuleOrb icon={<LocalFireDepartmentIcon sx={{ fontSize: 20, color: '#ef4444' }} />}
            value={`${todayMetrics.caloriesBurned}`} label="Calories" color="#ef4444"
            percent={calPct} delay={.25} />
          <ModuleOrb icon={<BoltIcon sx={{ fontSize: 20, color: '#f59e0b' }} />}
            value={`${todayMetrics.activeMinutes}m`} label="Active" color="#f59e0b"
            percent={activePct} delay={.35} />
          {heartRate > 0 && (
            <ModuleOrb icon={<MonitorHeartIcon sx={{ fontSize: 20, color: '#f43f5e' }} />}
              value={`${heartRate}`} label="BPM" color="#f43f5e"
              percent={clamp(((heartRate - 40) / 80) * 100)} delay={.45} />
          )}
        </Box>

        {/* ─────── VITALS STRIP ─────── */}
        {(sleepHours > 0 || stressScore > 0 || recoveryScore > 0) && (
          <GlassCard delay={.3} sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
              {sleepHours > 0 && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 9, color: P.txtDim, textTransform: 'uppercase', letterSpacing: .5 }}>Sleep</Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: 16, color: sleepHours >= 7 ? '#10b981' : sleepHours >= 5 ? '#f59e0b' : '#ef4444' }}>{sleepHours.toFixed(1)}h</Typography>
                </Box>
              )}
              {stressScore > 0 && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 9, color: P.txtDim, textTransform: 'uppercase', letterSpacing: .5 }}>Stress</Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: 16, color: stressScore <= 30 ? '#10b981' : stressScore <= 60 ? '#f59e0b' : '#ef4444' }}>{stressScore}</Typography>
                </Box>
              )}
              {recoveryScore > 0 && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 9, color: P.txtDim, textTransform: 'uppercase', letterSpacing: .5 }}>Recovery</Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: 16, color: recoveryScore >= 70 ? '#10b981' : recoveryScore >= 40 ? '#f59e0b' : '#ef4444' }}>{recoveryScore}</Typography>
                </Box>
              )}
            </Box>
          </GlassCard>
        )}

        {/* ─────── MODULE NAV GRID ─────── */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' }, gap: { xs: 1.25, md: 1.5 }, mb: 3, animation: 'bd-slide-up .5s .35s ease both' }}>
          {MODULE_NAV.map((mod, idx) => (
            <Box key={mod.label} onClick={() => navigate(mod.path)} sx={{
              p: 2, borderRadius: 4, textAlign: 'center',
              background: `linear-gradient(135deg,${mod.color}12,${mod.color}04)`,
              border: '1px solid', borderColor: `${mod.color}18`,
              cursor: 'pointer', transition: 'all .25s',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 6px 24px ${mod.color}18`, borderColor: `${mod.color}40` },
              '&:active': { transform: 'scale(.95)' },
            }}>
              <Box sx={{ color: mod.color, animation: `bd-float 3.5s ${(idx * 0.35).toFixed(2)}s ease-in-out infinite`, mb: .5 }}>
                {mod.icon}
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: 11, color: P.txt }}>{mod.label}</Typography>
            </Box>
          ))}
        </Box>

        {/* ─────── MODULE SCORES (if AI has generated) ─────── */}
        {moduleScores.length > 0 && (
          <GlassCard delay={.4} sx={{ mb: 2.5 }}>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: 13, md: 15 }, color: P.txt, mb: 1.5, display: 'flex', alignItems: 'center', gap: .75 }}>
              <TrendingUpIcon sx={{ fontSize: 16, color: P.accent }} /> Module Scores
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: { xs: 1.5, md: 3 } }}>
              {moduleScores.map((s) => (
                <Box key={s.label} sx={{ textAlign: 'center' }}>
                  <Ring score={s.score} size={52} stroke={4} color={s.color}>
                    <Typography sx={{ fontWeight: 800, fontSize: 11, color: P.txt }}>{s.score}</Typography>
                  </Ring>
                  <Typography sx={{ fontSize: 8, color: P.txtDim, mt: .5 }}>{s.emoji} {s.label}</Typography>
                  <Typography sx={{ fontSize: 8, fontWeight: 700, color: s.trend === 'up' ? '#10b981' : s.trend === 'down' ? '#ef4444' : P.txtGhost }}>
                    {s.trend === 'up' ? '↑' : s.trend === 'down' ? '↓' : '→'}
                  </Typography>
                </Box>
              ))}
            </Box>
          </GlassCard>
        )}

        {/* ─────── DESKTOP 2-COL: Plan + Quests ─────── */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: { xs: 0, md: 2.5 } }}>

        {/* ─────── TODAY'S PLAN TIMELINE ─────── */}
        {plan.length > 0 && (
          <GlassCard delay={.45} sx={{ mb: { xs: 2.5, md: 0 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: .75, mb: 1.5 }}>
              <Box sx={{ width: 24, height: 24, borderRadius: 1.5, background: 'linear-gradient(135deg,#38bdf8,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AccessTimeIcon sx={{ fontSize: 14, color: '#fff' }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: 13, color: P.txt }}>Today's Plan</Typography>
              <Box sx={{ flex: 1 }} />
              <Typography sx={{ fontSize: 10, color: P.txtFaint }}>
                {plan.filter(p => p.done).length}/{plan.length}
              </Typography>
            </Box>
            {plan.map((item, i) => (
              <TimelineItem key={item.id} time={item.time} title={item.title}
                color={item.color} done={item.done} note={item.note}
                isLast={i === plan.length - 1} delay={.5 + i * .06} />
            ))}
          </GlassCard>
        )}

        {/* ─────── DAILY QUESTS ─────── */}
        {quests.length > 0 && (
          <GlassCard delay={.5} sx={{ mb: { xs: 2.5, md: 0 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: .75, mb: 1.5 }}>
              <Box sx={{ width: 24, height: 24, borderRadius: 1.5, background: 'linear-gradient(135deg,#f59e0b,#ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <StarIcon sx={{ fontSize: 14, color: '#fff' }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: 13, color: P.txt }}>Daily Quests</Typography>
              <Box sx={{ flex: 1 }} />
              <Typography sx={{ fontSize: 10, color: P.txtFaint }}>
                {quests.filter(q => questDone.has(q.id)).length}/{quests.length}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: .75 }}>
              {quests.map((q, i) => (
                <Quest key={q.id} label={q.label} xp={q.xp} done={questDone.has(q.id)}
                  onTap={() => toggleQuest(q.id)} delay={.55 + i * .06} />
              ))}
            </Box>
          </GlassCard>
        )}

        </Box>{/* end 2-col grid */}

        {/* ─────── DESKTOP 2-COL: Suggestions + Bobo ─────── */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: { xs: 0, md: 2.5 } }}>

        {/* ─────── SUGGESTIONS ─────── */}
        {suggestions.length > 0 && (
          <GlassCard delay={.6} sx={{ mb: { xs: 2.5, md: 0 } }}>
            <Typography sx={{ fontWeight: 800, fontSize: 13, color: P.txt, mb: 1.5 }}>✨ Suggested for You</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: .75 }}>
              {suggestions.map((s, i) => (
                <SuggestionCard key={i} emoji={s.emoji} title={s.title} sub={s.sub}
                  tag={s.tag} tagColor={s.tagColor} onClick={() => s.path && navigate(s.path)}
                  delay={.65 + i * .06} />
              ))}
            </Box>
          </GlassCard>
        )}

        {/* ─────── BOBO INSIGHT (from cross-insights) ─────── */}
        {crossInsights.length > 0 && (
          <GlassCard delay={.7} sx={{ mb: { xs: 2.5, md: 0 } }}>
            <Typography sx={{ fontWeight: 800, fontSize: 13, color: P.txt, mb: 1.5, display: 'flex', alignItems: 'center', gap: .75 }}>
              💬 Bobo Says
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {crossInsights.slice(0, 3).map((ci) => (
                <Box key={ci.id} sx={{
                  p: 1.5, borderRadius: 3,
                  background: `linear-gradient(135deg,${P.aA(.08)},${P.aA(.02)})`,
                  border: `1px solid ${P.aA(.12)}`,
                }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 12, color: P.txt, mb: .25 }}>{ci.title}</Typography>
                  <Typography sx={{ fontSize: 10, color: P.txtDim, lineHeight: 1.4 }}>{ci.description}</Typography>
                  <Box sx={{ display: 'flex', gap: .5, mt: .75 }}>
                    {ci.modules.map(m => {
                      const meta = MODULE_SCORE_META[m];
                      return <Chip key={m} label={`${meta?.emoji ?? ''} ${m}`} size="small" sx={{ height: 18, fontSize: 8, fontWeight: 600, bgcolor: `${meta?.color ?? '#64748b'}15`, color: meta?.color ?? '#64748b', border: '1px solid', borderColor: `${meta?.color ?? '#64748b'}25` }} />;
                    })}
                  </Box>
                </Box>
              ))}
            </Box>
          </GlassCard>
        )}

        </Box>{/* end 2-col grid */}

        {/* ─────── ACHIEVEMENTS ─────── */}
        <GlassCard delay={.75} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: .75, mb: 1.5 }}>
            <Box sx={{ width: 24, height: 24, borderRadius: 1.5, background: `linear-gradient(135deg,${P.accent},${P.accentLt})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmojiEventsIcon sx={{ fontSize: 14, color: P.accentBg }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: 13, color: P.txt }}>Achievements</Typography>
            <Box sx={{ flex: 1 }} />
            <Typography sx={{ fontSize: 10, color: P.txtFaint }}>
              {achievements.filter(a => a.unlocked).length}/{achievements.length}
            </Typography>
          </Box>
          <Box sx={{
            display: 'flex', gap: 1, overflowX: 'auto', pb: .5, px: .25,
            '&::-webkit-scrollbar': { height: 3 },
            '&::-webkit-scrollbar-thumb': { bgcolor: P.glassBorder, borderRadius: 2 },
          }}>
            {achievements.map((a, i) => (
              <Badge key={a.id} icon={a.icon} title={a.title} desc={a.desc}
                unlocked={a.unlocked} delay={.8 + i * .08} />
            ))}
          </Box>
        </GlassCard>

      </Box>
    </Box>
  );
}
