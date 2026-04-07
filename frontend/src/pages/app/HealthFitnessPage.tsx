import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { AnimatedPage } from '@/components/animations';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import WatchIcon from '@mui/icons-material/Watch';
import HealingIcon from '@mui/icons-material/Healing';
import PersonIcon from '@mui/icons-material/Person';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NotificationsIcon from '@mui/icons-material/Notifications';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HotelIcon from '@mui/icons-material/Hotel';
import BoltIcon from '@mui/icons-material/Bolt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { useFitnessProfileStore, calcBMI, bmiCategory } from '@/store/fitnessProfileStore';
import { useTheme } from '@mui/material';
import { useUIStore } from '@/store/uiStore';
import { t } from '@/lib/translations';
import { useActivityTrackingStore } from '@/store/activityTrackingStore';
import { useWearablesStore } from '@/store/wearablesStore';
import { useInjuryStore } from '@/store/injuryStore';

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function formatRelativeTime(iso?: string | null) {
  if (!iso) return 'Never synced';
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

function scoreColor(score: number) {
  if (score >= 80) return 'success.main';
  if (score >= 55) return 'warning.main';
  return 'error.main';
}

function SectionCard({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Box>
      {children}
    </Paper>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  onClick,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
  color: string;
  onClick?: () => void;
  detail?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    if (detail) {
      setExpanded((prev) => !prev);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <Paper
      elevation={0}
      onClick={handleClick}
      sx={{
        p: 2.5,
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        border: '1px solid',
        borderColor: expanded ? color : 'divider',
        boxShadow: expanded
          ? '0 6px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)'
          : '0 2px 12px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
        cursor: (detail || onClick) ? 'pointer' : 'default',
        transition: 'all 0.25s ease',
        '&:hover': {
          boxShadow: '0 6px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
          transform: 'translateY(-2px)',
          borderColor: color,
        },
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Avatar
          sx={{
            bgcolor: `${color}15`,
            color: color,
            width: 52,
            height: 52,
            boxShadow: `0 4px 12px ${color}30`,
          }}
        >
          {icon}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
            {label}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1, mb: 0.5 }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.3 }}>
            {sub}
          </Typography>
        </Box>
        {detail && (
          <ExpandMoreIcon
            sx={{
              transition: 'transform 0.25s ease',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              color: 'text.secondary',
              mt: 0.5,
            }}
          />
        )}
      </Box>
      {detail && (
        <Collapse in={expanded}>
          <Divider sx={{ my: 1.5 }} />
          <Box sx={{ pt: 0.5 }}>{detail}</Box>
        </Collapse>
      )}
    </Paper>
  );
}

export default function HealthFitnessPage() {
  const dk = useTheme().palette.mode === 'dark';
  const navigate = useNavigate();
  const { language } = useUIStore();

  const profile = useFitnessProfileStore((s) => s.profile);
  const isOnboarded = useFitnessProfileStore((s) => s.isOnboarded);

  const getDailyMetrics = useActivityTrackingStore((s) => s.getDailyMetrics);
  const getWeeklyMetrics = useActivityTrackingStore((s) => s.getWeeklyMetrics);
  const activityGoals = useActivityTrackingStore((s) => s.goals);
  const workouts = useActivityTrackingStore((s) => s.workouts);
  const customActivities = useActivityTrackingStore((s) => s.customActivities);
  const connectedDevices = useActivityTrackingStore((s) => s.connectedDevices);

  const devices = useWearablesStore((s) => s.devices);
  const readings = useWearablesStore((s) => s.readings);
  const alerts = useWearablesStore((s) => s.alerts);

  const painLogs = useInjuryStore((s) => s.painLogs);
  const rehabPrograms = useInjuryStore((s) => s.rehabPrograms);
  const milestones = useInjuryStore((s) => s.milestones);
  const notifications = useInjuryStore((s) => s.notifications);
  const getActiveInjuries = useInjuryStore((s) => s.getActiveInjuries);
  const getRecoveryScore = useInjuryStore((s) => s.getRecoveryScore);
  const currentStreak = useInjuryStore((s) => s.currentStreak);

  const today = new Date().toISOString().slice(0, 10);
  const todayMetrics = getDailyMetrics(today);
  const weeklyMetrics = getWeeklyMetrics(today);
  const activeInjuries = getActiveInjuries();

  const bmi = calcBMI(profile.heightCm, profile.weightKg);

  const latestReadings = useMemo(() => {
    const map: Record<string, (typeof readings)[number]> = {};
    readings.forEach((reading) => {
      const current = map[reading.metric];
      if (!current || reading.timestamp > current.timestamp) {
        map[reading.metric] = reading;
      }
    });
    return map;
  }, [readings]);

  const latestSleepScore = latestReadings['sleep-score']?.value ?? null;
  const latestReadiness = latestReadings['readiness-score']?.value ?? latestReadings['recovery-score']?.value ?? null;
  const latestHeartRate = latestReadings['heart-rate']?.value ?? latestReadings['resting-hr']?.value ?? null;
  const latestBloodOxygen = latestReadings['blood-oxygen']?.value ?? null;
  const latestStress = latestReadings['stress-level']?.value ?? null;
  const latestHRV = latestReadings.hrv?.value ?? null;

  const activityScore = average([
    clamp((todayMetrics.steps / Math.max(activityGoals.steps, 1)) * 100),
    clamp((todayMetrics.distanceKm / Math.max(activityGoals.distanceKm, 0.1)) * 100),
    clamp((todayMetrics.caloriesBurned / Math.max(activityGoals.caloriesBurned, 1)) * 100),
    clamp((todayMetrics.activeMinutes / Math.max(activityGoals.activeMinutes, 1)) * 100),
    clamp((todayMetrics.floorsClimbed / Math.max(activityGoals.floorsClimbed, 1)) * 100),
  ]);

  const wearableScoreParts = [
    latestSleepScore,
    latestReadiness,
    latestStress !== null ? clamp(100 - latestStress) : null,
    latestBloodOxygen !== null ? clamp(((latestBloodOxygen - 90) / 10) * 100) : null,
  ].filter((value): value is number => value !== null);
  const wearableScore = wearableScoreParts.length > 0 ? average(wearableScoreParts) : 0;

  const recoveryScore =
    activeInjuries.length > 0
      ? average(activeInjuries.map((injury) => getRecoveryScore(injury.id)))
      : 100;

  const healthParts = [activityScore, recoveryScore];
  if (wearableScoreParts.length > 0) healthParts.push(wearableScore);
  const overallHealthScore = healthParts.some((p) => p > 0) ? average(healthParts) : 0;

  const weeklyAverages = {
    steps: average(weeklyMetrics.map((day) => Math.round((day.steps / Math.max(activityGoals.steps, 1)) * 100))),
    activeMinutes: average(weeklyMetrics.map((day) => Math.round((day.activeMinutes / Math.max(activityGoals.activeMinutes, 1)) * 100))),
    calories: average(weeklyMetrics.map((day) => Math.round((day.caloriesBurned / Math.max(activityGoals.caloriesBurned, 1)) * 100))),
  };

  const weeklyWorkoutCount = workouts.filter((workout) => {
    const workoutDate = new Date(workout.date);
    return Date.now() - workoutDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  const weeklyCustomActivityMinutes = customActivities
    .filter((activity) => Date.now() - new Date(activity.date).getTime() <= 7 * 24 * 60 * 60 * 1000)
    .reduce((sum, activity) => sum + activity.durationMinutes, 0);

  const weeklyRehabSessions = rehabPrograms.reduce(
    (sum, program) =>
      sum +
      program.completedSessions.filter(
        (session) => Date.now() - new Date(session).getTime() <= 7 * 24 * 60 * 60 * 1000,
      ).length,
    0,
  );

  const activeAlerts = alerts.filter((alert) => !alert.dismissed);
  const criticalAlerts = activeAlerts.filter((alert) => alert.severity === 'critical');
  const unreadRecoveryNotifications = notifications.filter((notification) => !notification.read).length;

  const profileSignals = [
    profile.heightCm ? 1 : 0,
    profile.weightKg ? 1 : 0,
    profile.activityLevel ? 1 : 0,
    profile.fitnessLevel ? 1 : 0,
    profile.goals.length > 0 ? 1 : 0,
  ];
  const profileCompletion = Math.round((profileSignals.reduce((sum, value) => sum + value, 0) / profileSignals.length) * 100);

  const recoveryPainAverage =
    activeInjuries.length > 0
      ? average(
          activeInjuries.map((injury) => {
            const recent = painLogs
              .filter((log) => log.injuryId === injury.id)
              .sort((a, b) => b.date.localeCompare(a.date))[0];
            return recent?.painLevel ?? injury.painScale;
          }),
        )
      : 0;

  const insights = useMemo(() => {
    const items: { title: string; body: string; tone: 'success' | 'warning' | 'info' }[] = [];

    if (!isOnboarded || profileCompletion < 80) {
      items.push({
        title: 'Complete your health profile',
        body: `Your profile is ${profileCompletion}% complete. Add baseline metrics and goals so recommendations are more accurate.`,
        tone: 'info',
      });
    }

    if (activityScore >= 85) {
      items.push({
        title: 'Activity goals are on track',
        body: `You are at ${activityScore}% of today's combined movement goals, with ${todayMetrics.activeMinutes} active minutes logged so far.`,
        tone: 'success',
      });
    } else if (activityScore < 55) {
      items.push({
        title: 'Movement is lagging today',
        body: `You are at ${activityScore}% of daily movement targets. A short walk or light activity session would close the gap quickly.`,
        tone: 'warning',
      });
    }

    if (latestSleepScore !== null && latestSleepScore < 70) {
      items.push({
        title: 'Recovery looks sleep-limited',
        body: `Your latest sleep score is ${latestSleepScore}/100. Consider lowering training intensity and prioritizing sleep tonight.`,
        tone: 'warning',
      });
    }

    if (criticalAlerts.length > 0) {
      items.push({
        title: 'Critical wearable alerts need attention',
        body: `${criticalAlerts.length} critical alert${criticalAlerts.length !== 1 ? 's are' : ' is'} active across connected devices. Review sync and abnormal readings now.`,
        tone: 'warning',
      });
    } else if (activeAlerts.length > 0) {
      items.push({
        title: 'Wearable maintenance required',
        body: `${activeAlerts.length} device alert${activeAlerts.length !== 1 ? 's are' : ' is'} active. Battery, sync status, or abnormal readings may affect data quality.`,
        tone: 'info',
      });
    }

    if (activeInjuries.length > 0) {
      items.push({
        title: 'Recovery workload is active',
        body: `${activeInjuries.length} active injur${activeInjuries.length !== 1 ? 'ies are' : 'y is'} being tracked. Average recovery score is ${recoveryScore}% with pain averaging ${recoveryPainAverage}/10.`,
        tone: recoveryScore >= 70 ? 'info' : 'warning',
      });
    }

    if (devices.length === 0) {
      items.push({
        title: 'No wearables connected',
        body: 'Connect a wearable to unlock vitals, sleep, readiness, and alert-driven insights on this dashboard.',
        tone: 'info',
      });
    }

    if (weeklyWorkoutCount >= profile.daysPerWeek && profile.daysPerWeek > 0) {
      items.push({
        title: 'Weekly consistency target reached',
        body: `You completed ${weeklyWorkoutCount} workout${weeklyWorkoutCount !== 1 ? 's' : ''} this week against a ${profile.daysPerWeek}-day plan.`,
        tone: 'success',
      });
    }

    return items.slice(0, 6);
  }, [
    activeAlerts.length,
    activeInjuries.length,
    activityScore,
    criticalAlerts.length,
    devices.length,
    isOnboarded,
    latestSleepScore,
    profile.daysPerWeek,
    profileCompletion,
    recoveryPainAverage,
    recoveryScore,
    todayMetrics.activeMinutes,
    weeklyWorkoutCount,
  ]);

  const vitals = [
    { key: 'heart-rate', label: 'Heart Rate', value: latestHeartRate, suffix: 'bpm', icon: <FavoriteIcon color="error" fontSize="small" /> },
    { key: 'sleep-score', label: 'Sleep Score', value: latestSleepScore, suffix: '/100', icon: <HotelIcon color="primary" fontSize="small" /> },
    { key: 'readiness-score', label: 'Readiness', value: latestReadiness, suffix: '/100', icon: <BoltIcon color="warning" fontSize="small" /> },
    { key: 'blood-oxygen', label: 'Blood Oxygen', value: latestBloodOxygen, suffix: '%', icon: <MonitorHeartIcon color="success" fontSize="small" /> },
    { key: 'stress-level', label: 'Stress', value: latestStress, suffix: '/100', icon: <TrendingUpIcon color="warning" fontSize="small" /> },
    { key: 'hrv', label: 'HRV', value: latestHRV, suffix: 'ms', icon: <FavoriteIcon color="secondary" fontSize="small" /> },
  ].filter((item) => item.value !== null);

  return (
    <AnimatedPage>
      <Box sx={{ flex: 1, px: { xs: 2.5, md: 4, lg: 5 }, py: 3, overflow: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#f43f5e20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MonitorHeartIcon sx={{ fontSize: 24, color: '#f43f5e' }} />
          </Box>
          <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            {t(language, 'healthDashboardTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t(language, 'healthDashboardSubtitle')}
          </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<PersonIcon />} onClick={() => navigate('/app/health/fitness-profile')}>
            {t(language, 'healthProfileBtn')}
          </Button>
          <Button variant="outlined" startIcon={<DirectionsWalkIcon />} onClick={() => navigate('/app/health/activity-tracking')}>
            {t(language, 'activityTrackingLink')}
          </Button>
          <Button variant="outlined" startIcon={<WatchIcon />} onClick={() => navigate('/app/health/wearables')}>
            {t(language, 'wearableLabel')}
          </Button>
          <Button variant="contained" color="error" startIcon={<HealingIcon />} onClick={() => navigate('/app/health/injury')}>
            {t(language, 'injuryTrackerLink')}
          </Button>
        </Box>
      </Box>

      {criticalAlerts.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {criticalAlerts.length} critical wearable alert{criticalAlerts.length !== 1 ? 's' : ''} detected. Review the wearables module before relying on recent readings.
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0 * 0.06, ease: 'easeOut' }}
          >
            <StatCard
              icon={<MonitorHeartIcon sx={{ fontSize: 24 }} />}
              label={t(language, 'overallHealthScore')}
              value={`${overallHealthScore}%`}
              sub={`Activity ${activityScore}% · Recovery ${recoveryScore}%`}
              color="#f43f5e"
            detail={
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Activity</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{activityScore}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={activityScore} sx={{ height: 6, borderRadius: 3, bgcolor: dk ? 'rgba(255,255,255,0.08)' : '#eee', '& .MuiLinearProgress-bar': { bgcolor: '#43a047', borderRadius: 3 } }} />
                </Box>
                {wearableScoreParts.length > 0 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">Wearable</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{wearableScore}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={wearableScore} sx={{ height: 6, borderRadius: 3, bgcolor: dk ? 'rgba(255,255,255,0.08)' : '#eee', '& .MuiLinearProgress-bar': { bgcolor: '#1e88e5', borderRadius: 3 } }} />
                  </Box>
                )}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Recovery</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{recoveryScore}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={recoveryScore} sx={{ height: 6, borderRadius: 3, bgcolor: dk ? 'rgba(255,255,255,0.08)' : '#eee', '& .MuiLinearProgress-bar': { bgcolor: '#fb8c00', borderRadius: 3 } }} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Combined score from activity tracking, wearable vitals, and injury recovery modules.
                </Typography>
              </Box>
            }
            />
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1 * 0.06, ease: 'easeOut' }}
          >
              <StatCard
                icon={<WatchIcon sx={{ fontSize: 24 }} />}
                label={t(language, 'connectedDevices')}
                value={devices.length}
                sub={`${activeAlerts.length} active alert${activeAlerts.length !== 1 ? 's' : ''}`}
                color="#22d3ee"
            detail={
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {devices.length > 0 ? devices.map((device) => (
                  <Box key={device.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{device.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{device.model}</Typography>
                    </Box>
                    <Chip
                      label={device.connectionStatus}
                      size="small"
                      color={device.connectionStatus === 'connected' ? 'success' : 'default'}
                      variant="outlined"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Box>
                )) : (
                  <Typography variant="body2" color="text.secondary">{t(language, 'noDevicesPaired')}</Typography>
                )}
                <Button size="small" variant="text" onClick={() => navigate('/app/health/wearables')} sx={{ alignSelf: 'flex-start', mt: 0.5 }}>
                  {t(language, 'manageDevices')} →
                </Button>
              </Box>
            }
            />
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 2 * 0.06, ease: 'easeOut' }}
          >
              <StatCard
                icon={<HealingIcon sx={{ fontSize: 24 }} />}
                label={t(language, 'activeInjuriesLabel')}
                value={activeInjuries.length}
                sub={activeInjuries.length > 0 ? `Avg recovery ${recoveryScore}%` : 'No active injury load'}
                color="#fb923c"
            detail={
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {activeInjuries.length > 0 ? activeInjuries.slice(0, 3).map((injury) => (
                  <Box key={injury.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{injury.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{injury.bodyPart.replace(/-/g, ' ')} · {injury.status}</Typography>
                    </Box>
                    <Chip label={`${getRecoveryScore(injury.id)}%`} size="small" color={getRecoveryScore(injury.id) >= 70 ? 'success' : 'warning'} variant="outlined" />
                  </Box>
                )) : (
                  <Typography variant="body2" color="text.secondary">{t(language, 'noActiveInjuries')}</Typography>
                )}
                <Button size="small" variant="text" onClick={() => navigate('/app/health/injury')} sx={{ alignSelf: 'flex-start', mt: 0.5 }}>
                  {t(language, 'injuryTrackerLink')} →
                </Button>
              </Box>
            }
            />
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 3 * 0.06, ease: 'easeOut' }}
          >
              <StatCard
                icon={<DirectionsWalkIcon sx={{ fontSize: 24 }} />}
                label={t(language, 'dailyActivityLabel')}
                value={`${activityScore}%`}
                sub={`${todayMetrics.steps.toLocaleString()} steps · ${todayMetrics.activeMinutes} active min`}
                color="#10b981"
            detail={
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[
                  { label: 'Steps', value: todayMetrics.steps, goal: activityGoals.steps },
                  { label: 'Distance', value: `${todayMetrics.distanceKm} km`, goal: `${activityGoals.distanceKm} km` },
                  { label: 'Calories', value: todayMetrics.caloriesBurned, goal: activityGoals.caloriesBurned },
                  { label: 'Active min', value: todayMetrics.activeMinutes, goal: activityGoals.activeMinutes },
                  { label: 'Floors', value: todayMetrics.floorsClimbed, goal: activityGoals.floorsClimbed },
                ].map((item) => (
                  <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">{item.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.value} / {item.goal}</Typography>
                  </Box>
                ))}
                <Button size="small" variant="text" onClick={() => navigate('/app/health/activity-tracking')} sx={{ alignSelf: 'flex-start', mt: 0.5 }}>
                  {t(language, 'activityTrackingLink')} →
                </Button>
              </Box>
            }
            />
          </motion.div>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} lg={7}>
          <SectionCard
            title="Today's movement progress"
            subtitle="Current progress against daily goals from Activity Tracking"
            action={<Chip label={`${weeklyWorkoutCount} workouts this week`} size="small" color="success" variant="outlined" />}
          >
            {[
              { label: 'Steps', value: todayMetrics.steps, goal: activityGoals.steps },
              { label: 'Distance (km)', value: todayMetrics.distanceKm, goal: activityGoals.distanceKm },
              { label: 'Calories burned', value: todayMetrics.caloriesBurned, goal: activityGoals.caloriesBurned },
              { label: 'Active minutes', value: todayMetrics.activeMinutes, goal: activityGoals.activeMinutes },
              { label: 'Floors climbed', value: todayMetrics.floorsClimbed, goal: activityGoals.floorsClimbed },
            ].map((item) => {
              const percent = clamp((item.value / Math.max(item.goal, 1)) * 100);
              return (
                <Box key={item.label} sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{item.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.value} / {item.goal}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={percent}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: dk ? 'rgba(255,255,255,0.08)' : '#eeeeee',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: percent >= 100 ? '#43a047' : percent >= 60 ? '#fb8c00' : (dk ? 'rgba(255,255,255,0.3)' : '#757575'),
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              );
            })}

            <Divider sx={{ my: 1.5 }} />

            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={4}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Weekly goal hit rate</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{weeklyAverages.steps}%</Typography>
                  <Typography variant="caption" color="text.secondary">steps target average</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Weekly active time</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{weeklyAverages.activeMinutes}%</Typography>
                  <Typography variant="caption" color="text.secondary">active minute target average</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Extra activity</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{weeklyCustomActivityMinutes} min</Typography>
                  <Typography variant="caption" color="text.secondary">custom activity minutes this week</Typography>
                </Paper>
              </Grid>
            </Grid>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={5}>
          <SectionCard
            title="Profile baseline"
            subtitle="The Health Profile module defines the baseline for your recommendations"
            action={
              <Chip
                label={isOnboarded ? `${profileCompletion}% complete` : 'Setup needed'}
                size="small"
                color={profileCompletion >= 80 ? 'success' : 'warning'}
                variant="outlined"
              />
            }
          >
            <Grid container spacing={1.5} sx={{ mb: 1 }}>
              <Grid item xs={6}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">BMI</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {bmi ?? '--'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {bmi ? bmiCategory(bmi) : 'Add height and weight'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Fitness level</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
                    {profile.fitnessLevel ? profile.fitnessLevel.replace('-', ' ') : '--'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {profile.activityLevel ? profile.activityLevel.replace(/-/g, ' ') : 'Activity level not set'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>
              Health goals
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}>
              {profile.goals.length > 0 ? (
                profile.goals.map((goal) => (
                  <Chip key={goal} label={goal.replace(/-/g, ' ')} size="small" variant="outlined" />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No health goals configured yet.
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Chip icon={<AccessTimeIcon />} label={`${profile.daysPerWeek} days/week`} size="small" />
              <Chip icon={<FitnessCenterIcon />} label={`${profile.minutesPerDay} min/day`} size="small" />
            </Box>

            {profile.injuries && (
              <Alert severity="warning" sx={{ mt: 1.5 }}>
                Stored injury notes: {profile.injuries}
              </Alert>
            )}
          </SectionCard>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} lg={7}>
          <SectionCard
            title="Wearable vitals and recovery"
            subtitle="Latest signals merged from connected wearable devices"
            action={<Chip label={`${devices.length} paired`} size="small" color="primary" variant="outlined" />}
          >
            {vitals.length === 0 ? (
              <Alert severity="info">No wearable readings yet. Pair a device to surface sleep, heart, stress, and recovery insights here.</Alert>
            ) : (
              <Grid container spacing={1.5}>
                {vitals.map((vital) => (
                  <Grid item xs={12} sm={6} md={4} key={vital.key}>
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                        {vital.icon}
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {vital.label}
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {vital.value}
                        {vital.suffix}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {latestReadings[vital.key]?.timestamp
                          ? `Updated ${formatRelativeTime(latestReadings[vital.key]?.timestamp)}`
                          : 'No recent reading'}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {devices.length > 0 ? (
                devices.map((device) => (
                  <Tooltip
                    key={device.id}
                    title={`${device.model} · Battery ${device.batteryLevel}% · Last sync ${formatRelativeTime(device.lastSyncedAt)}`}
                  >
                    <Chip
                      label={`${device.name} (${device.batteryLevel}%)`}
                      size="small"
                      color={device.connectionStatus === 'connected' ? 'success' : device.connectionStatus === 'syncing' ? 'warning' : 'default'}
                      variant={device.connectionStatus === 'connected' ? 'filled' : 'outlined'}
                    />
                  </Tooltip>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No wearable devices paired.
                </Typography>
              )}
            </Box>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={5}>
          <SectionCard
            title="Device and alert status"
            subtitle="Data quality and monitoring issues from the Wearables module"
            action={<Chip icon={<NotificationsIcon />} label={`${activeAlerts.length} active`} size="small" color={activeAlerts.length > 0 ? 'warning' : 'success'} />}
          >
            {activeAlerts.length === 0 ? (
              <Alert severity="success">No active wearable alerts. Device sync and latest readings look healthy.</Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {activeAlerts.slice(0, 5).map((alert) => (
                  <Paper key={alert.id} variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <WarningAmberIcon color={alert.severity === 'critical' ? 'error' : 'warning'} fontSize="small" sx={{ mt: 0.2 }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {alert.deviceName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {alert.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatRelativeTime(alert.timestamp)}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}

            <Divider sx={{ my: 1.5 }} />

            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Connected sync sources
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
              {connectedDevices.length > 0 ? (
                connectedDevices.map((device) => (
                  <Chip
                    key={device.type}
                    label={`${device.name} · ${formatRelativeTime(device.lastSyncedAt)}`}
                    size="small"
                    variant={device.isActive ? 'filled' : 'outlined'}
                    color={device.isActive ? 'success' : 'default'}
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No activity sync devices connected yet.
                </Typography>
              )}
            </Box>
          </SectionCard>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} lg={6}>
          <SectionCard
            title="Recovery and injury focus"
            subtitle="Recovery load merged from Injury Tracker, pain logs, rehab plans, and milestones"
            action={<Chip label={`${currentStreak} day recovery streak`} size="small" color={currentStreak > 0 ? 'warning' : 'default'} variant="outlined" />}
          >
            {activeInjuries.length === 0 ? (
              <Alert severity="success">No active injuries. Recovery score is clear and there are no rehab dependencies right now.</Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                {activeInjuries.slice(0, 4).map((injury) => {
                  const injuryRecovery = getRecoveryScore(injury.id);
                  const latestPain = painLogs
                    .filter((log) => log.injuryId === injury.id)
                    .sort((a, b) => b.date.localeCompare(a.date))[0];
                  return (
                    <Paper key={injury.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {injury.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {injury.bodyPart.replace(/-/g, ' ')} · {injury.type.replace(/-/g, ' ')} · {injury.status}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${injuryRecovery}%`}
                          size="small"
                          sx={{ color: scoreColor(injuryRecovery), borderColor: scoreColor(injuryRecovery) }}
                          variant="outlined"
                        />
                      </Box>
                      <LinearProgress variant="determinate" value={injuryRecovery} sx={{ my: 1, height: 6, borderRadius: 4 }} />
                      <Typography variant="caption" color="text.secondary">
                        Latest pain: {latestPain?.painLevel ?? injury.painScale}/10 · Mobility: {latestPain?.mobilityLevel ?? '--'}/10
                      </Typography>
                    </Paper>
                  );
                })}
              </Box>
            )}

            <Divider sx={{ my: 1.5 }} />

            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Rehab sessions this week</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{weeklyRehabSessions}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Recovery milestones</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{milestones.length}</Typography>
                </Paper>
              </Grid>
            </Grid>

            {unreadRecoveryNotifications > 0 && (
              <Alert severity="info" sx={{ mt: 1.5 }}>
                {unreadRecoveryNotifications} unread recovery notification{unreadRecoveryNotifications !== 1 ? 's' : ''} waiting in Injury Tracker.
              </Alert>
            )}
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={6}>
          <SectionCard
            title="Weekly momentum"
            subtitle="7-day pattern across steps, active minutes, and calorie burn"
            action={<Chip icon={<TrendingUpIcon />} label={`Average ${weeklyAverages.steps}% of step goal`} size="small" variant="outlined" />}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, minHeight: 160, mb: 1 }}>
              {weeklyMetrics.map((day) => {
                const stepPercent = clamp((day.steps / Math.max(activityGoals.steps, 1)) * 100);
                const minutePercent = clamp((day.activeMinutes / Math.max(activityGoals.activeMinutes, 1)) * 100);
                return (
                  <Box key={day.date} sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.35, height: 120, justifyContent: 'center' }}>
                      <Tooltip title={`${day.steps.toLocaleString()} steps`}>
                        <Box sx={{ width: 14, height: `${Math.max(12, stepPercent)}px`, bgcolor: dk ? '#C9A84C' : '#616161', borderRadius: '6px 6px 0 0' }} />
                      </Tooltip>
                      <Tooltip title={`${day.activeMinutes} active min`}>
                        <Box sx={{ width: 14, height: `${Math.max(12, minutePercent)}px`, bgcolor: '#42a5f5', borderRadius: '6px 6px 0 0' }} />
                      </Tooltip>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ width: 12, height: 12, bgcolor: dk ? '#C9A84C' : '#616161', borderRadius: 1 }} />
                <Typography variant="caption" color="text.secondary">Steps vs goal</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ width: 12, height: 12, bgcolor: '#42a5f5', borderRadius: 1 }} />
                <Typography variant="caption" color="text.secondary">Active minutes vs goal</Typography>
              </Box>
            </Box>

            <Grid container spacing={1.5}>
              <Grid item xs={4}>
                <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Avg steps/day</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {Math.round(weeklyMetrics.reduce((sum, day) => sum + day.steps, 0) / Math.max(weeklyMetrics.length, 1)).toLocaleString()}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Avg active min</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {Math.round(weeklyMetrics.reduce((sum, day) => sum + day.activeMinutes, 0) / Math.max(weeklyMetrics.length, 1))}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Avg kcal/day</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {Math.round(weeklyMetrics.reduce((sum, day) => sum + day.caloriesBurned, 0) / Math.max(weeklyMetrics.length, 1))}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </SectionCard>
        </Grid>
      </Grid>

      <SectionCard
        title="Cross-module insights"
        subtitle="Actions and patterns derived from Health Profile, Activity, Wearables, and Injury data"
      >
        {insights.length === 0 ? (
          <Alert severity="info">More insights will appear here as you complete your health profile and generate wearable or recovery data.</Alert>
        ) : (
          <Grid container spacing={1.5}>
            {insights.map((insight) => (
              <Grid item xs={12} md={6} key={insight.title}>
                <Alert severity={insight.tone} sx={{ height: '100%' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}>
                    {insight.title}
                  </Typography>
                  <Typography variant="caption">{insight.body}</Typography>
                </Alert>
              </Grid>
            ))}
          </Grid>
        )}
      </SectionCard>
      </Box>
    </AnimatedPage>
  );
}
