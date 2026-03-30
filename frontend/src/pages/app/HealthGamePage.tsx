import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Tooltip, useTheme } from '@mui/material';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import BoltIcon from '@mui/icons-material/Bolt';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { useActivityTrackingStore } from '@/store/activityTrackingStore';
import { useWearablesStore } from '@/store/wearablesStore';
import { useInjuryStore } from '@/store/injuryStore';
import { useFitnessProfileStore } from '@/store/fitnessProfileStore';

/* ─── keyframe animations (injected once) ─── */
const STYLE_ID = 'health-game-keyframes';
function ensureKeyframes() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes hg-float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }
    @keyframes hg-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.06); }
    }
    @keyframes hg-glow {
      0%, 100% { box-shadow: 0 0 20px rgba(201,168,76,0.3); }
      50% { box-shadow: 0 0 40px rgba(201,168,76,0.6), 0 0 60px rgba(201,168,76,0.2); }
    }
    @keyframes hg-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes hg-shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes hg-bounce {
      0%, 100% { transform: translateY(0) scale(1); }
      30% { transform: translateY(-12px) scale(1.05); }
      50% { transform: translateY(-6px) scale(1.02); }
    }
    @keyframes hg-fire {
      0%, 100% { transform: scaleY(1) scaleX(1); opacity: 0.9; }
      25% { transform: scaleY(1.15) scaleX(0.9); opacity: 1; }
      50% { transform: scaleY(0.95) scaleX(1.1); opacity: 0.85; }
      75% { transform: scaleY(1.1) scaleX(0.95); opacity: 1; }
    }
    @keyframes hg-ring-fill {
      from { stroke-dashoffset: 314; }
    }
    @keyframes hg-particle {
      0% { transform: translateY(0) scale(1); opacity: 1; }
      100% { transform: translateY(-60px) scale(0); opacity: 0; }
    }
    @keyframes hg-slide-up {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes hg-confetti {
      0% { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(-80px) rotate(720deg); opacity: 0; }
    }
    @keyframes hg-badge-pop {
      0% { transform: scale(0) rotate(-180deg); opacity: 0; }
      60% { transform: scale(1.2) rotate(10deg); opacity: 1; }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    @keyframes hg-xp-shine {
      0% { left: -30%; }
      100% { left: 130%; }
    }
  `;
  document.head.appendChild(style);
}
/* ── palette hook for light/dark ── */
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
    glassBorder: dk ? 'rgba(255,255,255,.06)' : 'rgba(0,132,61,.08)',
    glassBorderLt: dk ? 'rgba(255,255,255,.08)' : 'rgba(0,132,61,.1)',
    glassHover: dk ? 'rgba(255,255,255,.06)' : 'rgba(0,132,61,.06)',
    ringTrack: dk ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)',
    aA: (a: number) => dk ? `rgba(201,168,76,${a})` : `rgba(0,132,61,${a})`,
  };
}
/* ─── animated radial progress ring ─── */
function ScoreRing({
  score,
  size = 180,
  stroke = 10,
  color,
  glowColor,
  children,
}: {
  score: number;
  size?: number;
  stroke?: number;
  color: string;
  glowColor: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <Box sx={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={useDk().ringTrack} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{
            filter: `drop-shadow(0 0 8px ${glowColor})`,
            transition: 'stroke-dashoffset 1.5s ease',
            animation: 'hg-ring-fill 1.5s ease forwards',
          }}
        />
      </svg>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

/* ─── floating particle ─── */
function Particle({ delay, left, color }: { delay: number; left: string; color: string }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        left,
        width: 6,
        height: 6,
        borderRadius: '50%',
        bgcolor: color,
        opacity: 0,
        animation: `hg-particle 3s ${delay}s ease-out infinite`,
        pointerEvents: 'none',
      }}
    />
  );
}

/* ─── stat orb (circular interactive badge) ─── */
function StatOrb({
  icon,
  value,
  label,
  color,
  glowColor,
  percent,
  onClick,
  delay = 0,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
  glowColor: string;
  percent: number;
  onClick?: () => void;
  delay?: number;
}) {
  const [tapped, setTapped] = useState(false);

  const handleTap = () => {
    setTapped(true);
    setTimeout(() => setTapped(false), 600);
    onClick?.();
  };

  return (
    <Box
      onClick={handleTap}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
        cursor: 'pointer',
        animation: `hg-slide-up 0.6s ${delay}s ease both`,
        '&:active': { transform: 'scale(0.92)' },
        transition: 'transform 0.15s',
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <ScoreRing score={Math.min(percent, 100)} size={90} stroke={6} color={color} glowColor={glowColor}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${color}30, ${color}10)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: tapped ? 'hg-bounce 0.6s ease' : 'hg-float 4s ease-in-out infinite',
              animationDelay: `${delay * 0.3}s`,
              boxShadow: `0 4px 20px ${glowColor}`,
            }}
          >
            {icon}
          </Box>
        </ScoreRing>
        {tapped && (
          <>
            {[0, 1, 2, 3, 4].map((i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: color,
                  animation: `hg-confetti 0.6s ${i * 0.05}s ease-out forwards`,
                  transform: `rotate(${i * 72}deg) translateX(20px)`,
                }}
              />
            ))}
          </>
        )}
      </Box>
      <Typography variant="body1" sx={{ fontWeight: 800, color: useDk().txt, lineHeight: 1, mt: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: useDk().txtSub, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </Typography>
    </Box>
  );
}

/* ─── quest item ─── */
function QuestItem({
  label,
  xp,
  completed,
  onToggle,
  delay = 0,
}: {
  label: string;
  xp: number;
  completed: boolean;
  onToggle: () => void;
  delay?: number;
}) {
  const P = useDk();
  return (
    <Box
      onClick={onToggle}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1.5,
        borderRadius: 3,
        background: completed
          ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))'
          : P.glassBg,
        border: '1px solid',
        borderColor: completed ? 'rgba(16,185,129,0.3)' : P.glassBorder,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        animation: `hg-slide-up 0.5s ${delay}s ease both`,
        '&:hover': {
          background: completed
            ? 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.1))'
            : P.glassHover,
          transform: 'translateX(4px)',
        },
        '&:active': { transform: 'scale(0.98)' },
        ...(completed && {
          textDecoration: 'none',
        }),
      }}
    >
      {completed ? (
        <CheckCircleIcon sx={{ color: '#10b981', fontSize: 24, animation: 'hg-pulse 2s ease infinite' }} />
      ) : (
        <RadioButtonUncheckedIcon sx={{ color: P.txtMuted, fontSize: 24 }} />
      )}
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: completed ? P.txtSub : P.txt,
            textDecoration: completed ? 'line-through' : 'none',
          }}
        >
          {label}
        </Typography>
      </Box>
      <Box
        sx={{
          px: 1,
          py: 0.25,
          borderRadius: 2,
          background: completed ? 'rgba(16,185,129,0.2)' : P.aA(0.15),
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        <StarIcon sx={{ fontSize: 14, color: completed ? '#10b981' : P.accent }} />
        <Typography variant="caption" sx={{ fontWeight: 700, color: completed ? '#10b981' : P.accent, fontSize: '0.7rem' }}>
          +{xp} XP
        </Typography>
      </Box>
    </Box>
  );
}

/* ─── achievement badge ─── */
function AchievementBadge({
  icon,
  title,
  desc,
  unlocked,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  unlocked: boolean;
  delay?: number;
}) {
  const [showDetail, setShowDetail] = useState(false);
  const P = useDk();

  return (
    <Tooltip title={desc} arrow placement="top">
      <Box
        onClick={() => setShowDetail(!showDetail)}
        sx={{
          width: 72,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5,
          cursor: 'pointer',
          animation: unlocked ? `hg-badge-pop 0.6s ${delay}s ease both` : `hg-slide-up 0.4s ${delay}s ease both`,
          '&:active': { transform: 'scale(0.9)' },
          transition: 'transform 0.15s',
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: unlocked
              ? (P.dk ? 'linear-gradient(135deg, #C9A84C, #E5B84E, #A8862A)' : 'linear-gradient(135deg, #00843D, #00A650, #006B32)')
              : P.glassBg,
            border: '2px solid',
            borderColor: unlocked ? P.accent : P.glassBorderLt,
            boxShadow: unlocked ? `0 4px 20px ${P.aA(0.4)}` : 'none',
            animation: unlocked ? 'hg-glow 3s ease infinite' : 'none',
            opacity: unlocked ? 1 : 0.35,
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.6rem',
            textAlign: 'center',
            color: unlocked ? P.txt : P.txtFaint,
            fontWeight: 600,
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
      </Box>
    </Tooltip>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/* ─── MAIN COMPONENT ─────────────────────────────────────────── */
/* ─────────────────────────────────────────────────────────────── */

export default function HealthGamePage() {
  const navigate = useNavigate();
  const P = useDk();

  useEffect(() => { ensureKeyframes(); }, []);

  // ── store data ──
  const getDailyMetrics = useActivityTrackingStore((s) => s.getDailyMetrics);
  const activityGoals = useActivityTrackingStore((s) => s.goals);
  const workouts = useActivityTrackingStore((s) => s.workouts);

  const devices = useWearablesStore((s) => s.devices);
  const readings = useWearablesStore((s) => s.readings);

  const getActiveInjuries = useInjuryStore((s) => s.getActiveInjuries);
  const getRecoveryScore = useInjuryStore((s) => s.getRecoveryScore);
  const currentStreak = useInjuryStore((s) => s.currentStreak);

  const isOnboarded = useFitnessProfileStore((s) => s.isOnboarded);

  const today = new Date().toISOString().slice(0, 10);
  const metrics = getDailyMetrics(today);
  const activeInjuries = getActiveInjuries();

  // ── computed scores ──
  const stepPercent = Math.round((metrics.steps / Math.max(activityGoals.steps, 1)) * 100);
  const calPercent = Math.round((metrics.caloriesBurned / Math.max(activityGoals.caloriesBurned, 1)) * 100);
  const activeMinPercent = Math.round((metrics.activeMinutes / Math.max(activityGoals.activeMinutes, 1)) * 100);
  const distancePercent = Math.round((metrics.distanceKm / Math.max(activityGoals.distanceKm, 0.1)) * 100);
  const floorPercent = Math.round((metrics.floorsClimbed / Math.max(activityGoals.floorsClimbed, 1)) * 100);

  const activityScore = Math.round(
    [stepPercent, calPercent, activeMinPercent, distancePercent, floorPercent]
      .map((v) => Math.min(v, 100))
      .reduce((a, b) => a + b, 0) / 5,
  );

  const recoveryScore = activeInjuries.length > 0
    ? Math.round(activeInjuries.map((i) => getRecoveryScore(i.id)).reduce((a, b) => a + b, 0) / activeInjuries.length)
    : 100;

  const latestReadings = useMemo(() => {
    const map: Record<string, number> = {};
    const tsMap: Record<string, string> = {};
    readings.forEach((r) => {
      if (!map[r.metric] || r.timestamp > (tsMap[r.metric] ?? '')) {
        map[r.metric] = r.value;
        tsMap[r.metric] = r.timestamp;
      }
    });
    return map;
  }, [readings]);

  const heartRate = latestReadings['heart-rate'] ?? latestReadings['resting-hr'] ?? null;
  const sleepScore = latestReadings['sleep-score'] ?? null;

  const overallScore = Math.round(
    [activityScore, recoveryScore].reduce((a, b) => a + b, 0) /
    [activityScore, recoveryScore].filter(() => true).length || 0,
  );

  // ── XP & level system ──
  const completedGoals = [stepPercent >= 100, calPercent >= 100, activeMinPercent >= 100, distancePercent >= 100, floorPercent >= 100].filter(Boolean).length;
  const weeklyWorkouts = workouts.filter((w) => Date.now() - new Date(w.date).getTime() <= 7 * 86400000).length;
  const totalXP = completedGoals * 50 + weeklyWorkouts * 100 + (isOnboarded ? 200 : 0) + devices.length * 75 + currentStreak * 30;
  const level = Math.floor(totalXP / 500) + 1;
  const xpInLevel = totalXP % 500;
  const xpForNext = 500;

  // ── daily quests (local toggle state) ──
  const [questStates, setQuestStates] = useState<Record<string, boolean>>({});
  const toggleQuest = useCallback((id: string) => {
    setQuestStates((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const quests = [
    { id: 'steps', label: `Walk ${activityGoals.steps.toLocaleString()} steps`, xp: 50, auto: stepPercent >= 100 },
    { id: 'calories', label: `Burn ${activityGoals.caloriesBurned} calories`, xp: 50, auto: calPercent >= 100 },
    { id: 'active', label: `${activityGoals.activeMinutes} active minutes`, xp: 50, auto: activeMinPercent >= 100 },
    { id: 'workout', label: 'Complete a workout session', xp: 100, auto: weeklyWorkouts > 0 },
    { id: 'water', label: 'Drink 8 glasses of water', xp: 30, auto: false },
    { id: 'stretch', label: 'Do a 5-min stretch routine', xp: 25, auto: false },
  ];

  // ── achievements ──
  const achievements = [
    { id: 'first-steps', icon: <DirectionsRunIcon sx={{ fontSize: 26, color: P.accentBg }} />, title: 'First Steps', desc: 'Log your first activity', unlocked: metrics.steps > 0 || workouts.length > 0 },
    { id: 'goal-crusher', icon: <EmojiEventsIcon sx={{ fontSize: 26, color: P.accentBg }} />, title: 'Goal Crusher', desc: 'Hit all 5 daily goals', unlocked: completedGoals >= 5 },
    { id: 'streak-3', icon: <LocalFireDepartmentIcon sx={{ fontSize: 26, color: P.accentBg }} />, title: 'On Fire', desc: '3-day recovery streak', unlocked: currentStreak >= 3 },
    { id: 'wearable', icon: <BoltIcon sx={{ fontSize: 26, color: P.accentBg }} />, title: 'Connected', desc: 'Pair a wearable device', unlocked: devices.length > 0 },
    { id: 'level5', icon: <StarIcon sx={{ fontSize: 26, color: P.accentBg }} />, title: 'Level 5', desc: 'Reach level 5', unlocked: level >= 5 },
    { id: 'profile', icon: <FitnessCenterIcon sx={{ fontSize: 26, color: P.accentBg }} />, title: 'Profiled', desc: 'Complete health profile', unlocked: isOnboarded },
  ];

  const scoreGrade = overallScore >= 90 ? 'S' : overallScore >= 75 ? 'A' : overallScore >= 60 ? 'B' : overallScore >= 40 ? 'C' : 'D';
  const gradeColors: Record<string, string> = { S: P.accent, A: '#10b981', B: '#38bdf8', C: '#f59e0b', D: '#ef4444' };

  return (
    <Box
      sx={{
        flex: 1,
        overflow: 'auto',
        background: P.dk
          ? 'linear-gradient(180deg, #0a1020 0%, #0D1B2A 30%, #111d2e 100%)'
          : 'linear-gradient(180deg, #F0FAF5 0%, #F8F9FA 30%, #EDF5F0 100%)',
        position: 'relative',
        minHeight: '100vh',
      }}
    >
      {/* ── background particles ── */}
      <Box sx={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <Particle
            key={i}
            delay={i * 0.7}
            left={`${5 + (i * 37) % 90}%`}
            color={['#C9A84C', '#10b981', '#38bdf8', '#f59e0b', '#ef4444'][i % 5]}
          />
        ))}
        {/* subtle gradient orbs */}
        <Box sx={{ position: 'absolute', top: '10%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${P.aA(0.06)}, transparent 70%)`, filter: 'blur(40px)' }} />
        <Box sx={{ position: 'absolute', top: '50%', right: '5%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.05), transparent 70%)', filter: 'blur(40px)' }} />
        <Box sx={{ position: 'absolute', bottom: '10%', left: '30%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.05), transparent 70%)', filter: 'blur(40px)' }} />
      </Box>

      {/* ── content ── */}
      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 480, mx: 'auto', px: 2, py: 3 }}>

        {/* ── header ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <IconButton onClick={() => navigate('/app/health')} sx={{ color: P.txtSub }}>
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${P.aA(0.2)}, ${P.aA(0.05)})`,
                border: `1px solid ${P.aA(0.3)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              <BoltIcon sx={{ fontSize: 16, color: P.accent }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: P.accent, fontSize: '0.75rem' }}>
                LVL {level}
              </Typography>
            </Box>
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 3,
                background: P.glassHover,
                border: `1px solid ${P.glassBorderLt}`,
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              <StarIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: P.txt, fontSize: '0.7rem' }}>
                {totalXP} XP
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ── XP bar ── */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography variant="caption" sx={{ color: P.txtSub, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1 }}>
              Level {level} Progress
            </Typography>
            <Typography variant="caption" sx={{ color: P.accent, fontWeight: 700, fontSize: '0.65rem' }}>
              {xpInLevel}/{xpForNext} XP
            </Typography>
          </Box>
          <Box
            sx={{
              height: 10,
              borderRadius: 5,
              background: P.glassBorder,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${(xpInLevel / xpForNext) * 100}%`,
                borderRadius: 5,
                background: P.dk ? 'linear-gradient(90deg, #A8862A, #C9A84C, #E5B84E)' : 'linear-gradient(90deg, #006B32, #00843D, #00A650)',
                transition: 'width 1s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* shimmer effect */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: '-30%',
                  width: '30%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  animation: 'hg-xp-shine 2s ease infinite',
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* ── main score ring ── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box sx={{ position: 'relative', animation: 'hg-pulse 4s ease infinite' }}>
            <ScoreRing score={overallScore} size={200} stroke={12} color={P.accent} glowColor={P.aA(0.5)}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  color: P.txt,
                  lineHeight: 1,
                  textShadow: `0 0 30px ${P.aA(0.3)}`,
                }}
              >
                {overallScore}
              </Typography>
              <Box
                sx={{
                  mt: 0.5,
                  px: 1.5,
                  py: 0.25,
                  borderRadius: 2,
                  background: `${gradeColors[scoreGrade]}25`,
                  border: `1px solid ${gradeColors[scoreGrade]}50`,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 900, color: gradeColors[scoreGrade], fontSize: '0.8rem', letterSpacing: 2 }}
                >
                  RANK {scoreGrade}
                </Typography>
              </Box>
            </ScoreRing>
            {/* streak fire badge */}
            {currentStreak > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '3px solid', borderColor: P.dk ? '#0D1B2A' : '#F0FAF5',
                  animation: 'hg-fire 1.5s ease infinite',
                  boxShadow: '0 4px 20px rgba(239,68,68,0.4)',
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <LocalFireDepartmentIcon sx={{ fontSize: 18, color: '#fff' }} />
                  <Typography sx={{ fontSize: '0.55rem', fontWeight: 900, color: '#fff', lineHeight: 1, mt: -0.25 }}>
                    {currentStreak}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
          <Typography variant="body2" sx={{ color: P.txtSub, mt: 2, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 2 }}>
            Health Power Score
          </Typography>
        </Box>

        {/* ── stat orbs row ── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <StatOrb
            icon={<DirectionsRunIcon sx={{ fontSize: 24, color: '#10b981' }} />}
            value={metrics.steps.toLocaleString()}
            label="Steps"
            color="#10b981"
            glowColor="rgba(16,185,129,0.3)"
            percent={stepPercent}
            delay={0.1}
            onClick={() => navigate('/app/health/activity-tracking')}
          />
          <StatOrb
            icon={<LocalFireDepartmentIcon sx={{ fontSize: 24, color: '#ef4444' }} />}
            value={`${metrics.caloriesBurned}`}
            label="Calories"
            color="#ef4444"
            glowColor="rgba(239,68,68,0.3)"
            percent={calPercent}
            delay={0.2}
          />
          <StatOrb
            icon={<BoltIcon sx={{ fontSize: 24, color: '#f59e0b' }} />}
            value={`${metrics.activeMinutes}m`}
            label="Active"
            color="#f59e0b"
            glowColor="rgba(245,158,11,0.3)"
            percent={activeMinPercent}
            delay={0.3}
          />
          {heartRate != null && (
            <StatOrb
              icon={<FavoriteIcon sx={{ fontSize: 24, color: '#f43f5e' }} />}
              value={`${heartRate}`}
              label="BPM"
              color="#f43f5e"
              glowColor="rgba(244,63,94,0.3)"
              percent={Math.min(100, Math.round(((heartRate - 40) / 80) * 100))}
              delay={0.4}
            />
          )}
          {sleepScore != null && (
            <StatOrb
              icon={<BedtimeIcon sx={{ fontSize: 24, color: '#818cf8' }} />}
              value={`${sleepScore}`}
              label="Sleep"
              color="#818cf8"
              glowColor="rgba(129,140,248,0.3)"
              percent={sleepScore}
              delay={0.5}
            />
          )}
        </Box>

        {/* ── daily quests ── */}
        <Box sx={{ mb: 4, animation: 'hg-slide-up 0.6s 0.4s ease both' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <StarIcon sx={{ fontSize: 16, color: '#fff' }} />
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 800, color: P.txt, fontSize: '0.95rem' }}>
              Daily Quests
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Typography variant="caption" sx={{ color: P.txtDim, fontWeight: 600 }}>
              {quests.filter((q) => q.auto || questStates[q.id]).length}/{quests.length}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {quests.map((quest, i) => (
              <QuestItem
                key={quest.id}
                label={quest.label}
                xp={quest.xp}
                completed={quest.auto || !!questStates[quest.id]}
                onToggle={() => !quest.auto && toggleQuest(quest.id)}
                delay={0.5 + i * 0.08}
              />
            ))}
          </Box>
        </Box>

        {/* ── quick action cards ── */}
        <Box sx={{ mb: 4, animation: 'hg-slide-up 0.6s 0.6s ease both' }}>
          <Typography variant="body1" sx={{ fontWeight: 800, color: P.txt, fontSize: '0.95rem', mb: 2 }}>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            {[
              { icon: <FitnessCenterIcon sx={{ fontSize: 28 }} />, label: 'Workouts', color: '#10b981', path: '/app/health/workouts' },
              { icon: <SelfImprovementIcon sx={{ fontSize: 28 }} />, label: 'Recovery', color: '#818cf8', path: '/app/health/injury' },
              { icon: <WaterDropIcon sx={{ fontSize: 28 }} />, label: 'Wearables', color: '#38bdf8', path: '/app/health/wearables' },
              { icon: <RestaurantIcon sx={{ fontSize: 28 }} />, label: 'Dietary', color: '#f59e0b', path: '/app/dietary/dashboard' },
            ].map((action) => (
              <Box
                key={action.label}
                onClick={() => navigate(action.path)}
                sx={{
                  p: 2.5,
                  borderRadius: 4,
                  background: `linear-gradient(135deg, ${action.color}15, ${action.color}05)`,
                  border: '1px solid',
                  borderColor: `${action.color}25`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 30px ${action.color}20`,
                    borderColor: `${action.color}50`,
                  },
                  '&:active': { transform: 'scale(0.95)' },
                }}
              >
                <Box
                  sx={{
                    color: action.color,
                    animation: 'hg-float 3s ease-in-out infinite',
                  }}
                >
                  {action.icon}
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: P.txt, fontSize: '0.75rem' }}>
                  {action.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── achievements ── */}
        <Box sx={{ mb: 4, animation: 'hg-slide-up 0.6s 0.8s ease both' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${P.accent}, ${P.accentLt})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <EmojiEventsIcon sx={{ fontSize: 16, color: P.accentBg }} />
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 800, color: P.txt, fontSize: '0.95rem' }}>
              Achievements
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Typography variant="caption" sx={{ color: P.txtDim, fontWeight: 600 }}>
              {achievements.filter((a) => a.unlocked).length}/{achievements.length}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 1,
              overflowX: 'auto',
              pb: 1,
              px: 0.5,
              '&::-webkit-scrollbar': { height: 4 },
              '&::-webkit-scrollbar-thumb': { bgcolor: P.glassBorderLt, borderRadius: 2 },
            }}
          >
            {achievements.map((badge, i) => (
              <AchievementBadge
                key={badge.id}
                icon={badge.icon}
                title={badge.title}
                desc={badge.desc}
                unlocked={badge.unlocked}
                delay={0.9 + i * 0.1}
              />
            ))}
          </Box>
        </Box>

        {/* ── today's snapshot ── */}
        <Box
          sx={{
            p: 2.5,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${P.aA(0.08)}, ${P.aA(0.02)})`,
            border: `1px solid ${P.aA(0.15)}`,
            mb: 4,
            animation: 'hg-slide-up 0.6s 1s ease both',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 800, color: P.accent, mb: 1.5, fontSize: '0.85rem' }}>
            Today&apos;s Snapshot
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            {[
              { label: 'Steps', value: metrics.steps.toLocaleString(), goal: activityGoals.steps.toLocaleString() },
              { label: 'Distance', value: `${metrics.distanceKm} km`, goal: `${activityGoals.distanceKm} km` },
              { label: 'Calories', value: `${metrics.caloriesBurned}`, goal: `${activityGoals.caloriesBurned}` },
              { label: 'Active Min', value: `${metrics.activeMinutes}`, goal: `${activityGoals.activeMinutes}` },
              { label: 'Floors', value: `${metrics.floorsClimbed}`, goal: `${activityGoals.floorsClimbed}` },
              { label: 'Recovery', value: `${recoveryScore}%`, goal: '100%' },
            ].map((item) => (
              <Box key={item.label}>
                <Typography variant="caption" sx={{ color: P.txtDim, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                  {item.label}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                  <Typography variant="body1" sx={{ fontWeight: 800, color: P.txt }}>
                    {item.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: P.txtMuted, fontSize: '0.6rem' }}>
                    / {item.goal}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
