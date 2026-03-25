import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Typography,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TimelineIcon from '@mui/icons-material/Timeline';
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics';
import VideocamIcon from '@mui/icons-material/Videocam';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {
  CATEGORY_META,
  DIFFICULTY_META,
  EXERCISE_DATABASE,
  GOAL_META,
  PRESET_PLANS,
  useWorkoutSystemStore,
} from '@/store/workoutSystemStore';
import { LIVE_CATEGORIES, LIVE_EXERCISES, useLiveWorkoutStore } from '@/store/liveWorkoutStore';

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function formatRelativeTime(iso?: string | null) {
  if (!iso) return 'Never used';
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
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
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 1.5, alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: 3,
        display: 'flex',
        gap: 1.5,
        alignItems: 'flex-start',
        ...(onClick && {
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
        }),
      }}
    >
      <Avatar sx={{ bgcolor: '#f5f5f5', color: color, width: 42, height: 42 }}>{icon}</Avatar>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {sub}
        </Typography>
      </Box>
    </Paper>
  );
}

export default function FitnessDashboardPage() {
  const navigate = useNavigate();

  const customWorkouts = useWorkoutSystemStore((s) => s.customWorkouts);
  const activePlanId = useWorkoutSystemStore((s) => s.activePlanId);
  const workoutLogs = useWorkoutSystemStore((s) => s.workoutLogs);
  const getExercise = useWorkoutSystemStore((s) => s.getExercise);

  const liveSessions = useLiveWorkoutStore((s) => s.sessions);
  const totalReps = useLiveWorkoutStore((s) => s.totalReps);
  const totalWorkoutSeconds = useLiveWorkoutStore((s) => s.totalWorkoutSeconds);

  const activePlan = PRESET_PLANS.find((plan) => plan.id === activePlanId) ?? null;

  const weeklyLogs = workoutLogs.filter((log) => Date.now() - new Date(log.date).getTime() <= 7 * 24 * 60 * 60 * 1000);
  const weeklyMinutes = weeklyLogs.reduce((sum, log) => sum + log.durationMinutes, 0);
  const monthlyLogs = workoutLogs.filter((log) => Date.now() - new Date(log.date).getTime() <= 30 * 24 * 60 * 60 * 1000);
  const avgDuration = workoutLogs.length > 0 ? Math.round(workoutLogs.reduce((sum, log) => sum + log.durationMinutes, 0) / workoutLogs.length) : 0;
  const avgFormScore = liveSessions.length > 0 ? average(liveSessions.map((session) => Math.round(session.avgFormScore * 100))) : 0;

  const trainingLoadScore = clamp(
    average([
      clamp((weeklyLogs.length / Math.max(activePlan?.daysPerWeek ?? 3, 1)) * 100),
      clamp((weeklyMinutes / 180) * 100),
      liveSessions.length > 0 ? clamp((avgFormScore / 100) * 100) : 60,
    ]),
  );

  const categoryDistribution = Object.entries(CATEGORY_META).map(([key, meta]) => ({
    key,
    ...meta,
    count: EXERCISE_DATABASE.filter((exercise) => exercise.category === key).length,
  }));

  const difficultyDistribution = Object.entries(DIFFICULTY_META).map(([key, meta]) => ({
    key,
    ...meta,
    count: EXERCISE_DATABASE.filter((exercise) => exercise.difficulty === key).length,
  }));

  const planGoalDistribution = Object.entries(GOAL_META).map(([key, meta]) => ({
    key,
    ...meta,
    count: PRESET_PLANS.filter((plan) => plan.goal === key).length,
  }));

  const topLoggedExercises = useMemo(() => {
    const counts = new Map<string, { exerciseId: string; uses: number; reps: number }>();
    workoutLogs.forEach((log) => {
      log.exercises.forEach((exercise) => {
        const current = counts.get(exercise.exerciseId) ?? { exerciseId: exercise.exerciseId, uses: 0, reps: 0 };
        counts.set(exercise.exerciseId, {
          exerciseId: exercise.exerciseId,
          uses: current.uses + 1,
          reps: current.reps + exercise.reps,
        });
      });
    });
    return [...counts.values()].sort((a, b) => b.uses - a.uses || b.reps - a.reps).slice(0, 5);
  }, [workoutLogs]);

  const recentLiveSessions = liveSessions.slice(0, 5);
  const popularCustomWorkouts = [...customWorkouts].sort((a, b) => b.timesUsed - a.timesUsed).slice(0, 4);

  const recentFeelings = weeklyLogs.map((log) => log.feeling);
  const recoverySignal = average(
    recentFeelings.map((feeling) => {
      if (feeling === 'great') return 100;
      if (feeling === 'good') return 85;
      if (feeling === 'okay') return 65;
      if (feeling === 'tired') return 45;
      return 25;
    }),
  );

  const insights = useMemo(() => {
    const items: { title: string; body: string; tone: 'success' | 'warning' | 'info' }[] = [];

    if (!activePlan) {
      items.push({
        title: 'No active plan selected',
        body: 'Choose a workout plan to give your training week more structure and make the dashboard recommendations more meaningful.',
        tone: 'info',
      });
    } else {
      items.push({
        title: 'Active plan is driving the week',
        body: `${activePlan.name} is set as your current plan with a ${activePlan.daysPerWeek}-day cadence over ${activePlan.durationWeeks} weeks.`,
        tone: 'success',
      });
    }

    if (weeklyLogs.length === 0) {
      items.push({
        title: 'No workouts logged this week',
        body: 'Your fitness dashboard is ready, but it needs workout logs or live sessions to surface momentum and progress trends.',
        tone: 'warning',
      });
    } else if (weeklyLogs.length >= (activePlan?.daysPerWeek ?? 3)) {
      items.push({
        title: 'Weekly consistency target is being met',
        body: `${weeklyLogs.length} workouts are logged in the last 7 days, which is on pace with your current fitness plan.`,
        tone: 'success',
      });
    } else {
      items.push({
        title: 'Consistency can improve',
        body: `${weeklyLogs.length} workouts are logged this week. One more session would materially improve training rhythm.`,
        tone: 'warning',
      });
    }

    if (liveSessions.length > 0) {
      items.push({
        title: 'Live workout data is active',
        body: `${liveSessions.length} live session${liveSessions.length !== 1 ? 's' : ''} recorded with an average form score of ${avgFormScore}%.`,
        tone: avgFormScore >= 75 ? 'success' : 'info',
      });
    }

    if (customWorkouts.length > 0) {
      items.push({
        title: 'Custom programming is being used',
        body: `${customWorkouts.length} custom workout${customWorkouts.length !== 1 ? 's are' : ' is'} saved, with ${popularCustomWorkouts[0]?.name ?? 'your templates'} leading usage.`,
        tone: 'info',
      });
    }

    if (recoverySignal > 0) {
      items.push({
        title: 'Recent training feel matters',
        body: `Your last-week workout feeling trend scores ${recoverySignal}%. Use it to balance intensity before pushing volume higher.`,
        tone: recoverySignal >= 70 ? 'success' : 'warning',
      });
    }

    return items.slice(0, 5);
  }, [activePlan, avgFormScore, customWorkouts.length, liveSessions.length, popularCustomWorkouts, recoverySignal, weeklyLogs.length]);

  return (
    <Box sx={{ flex: 1, px: 3, py: 3, overflow: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            Fitness Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Standalone training overview built only from Fitness module data: plans, logs, custom workouts, library coverage, and live workout sessions.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<SportsGymnasticsIcon />} onClick={() => navigate('/app/fitness/workouts')}>
            Exercise Library
          </Button>
          <Button variant="outlined" startIcon={<CalendarMonthIcon />} onClick={() => navigate('/app/fitness/workouts')}>
            Workout Plans
          </Button>
          <Button variant="contained" startIcon={<VideocamIcon />} sx={{ bgcolor: '#2e7d32' }} onClick={() => navigate('/app/fitness/workouts')}>
            Live Workout
          </Button>
        </Box>
      </Box>

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<FitnessCenterIcon sx={{ color: '#fff', fontSize: 20 }} />}
            label="Training Load"
            value={`${trainingLoadScore}%`}
            sub={`${weeklyLogs.length} workouts · ${weeklyMinutes} min this week`}
            color="#455a64"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CalendarMonthIcon sx={{ color: '#fff', fontSize: 20 }} />}
            label="Active Plan"
            value={activePlan ? activePlan.daysPerWeek : 0}
            sub={activePlan ? `${activePlan.name}` : 'No plan selected'}
            color="#1e88e5"
            onClick={() => navigate('/app/fitness/workouts')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<AutoFixHighIcon sx={{ color: '#fff', fontSize: 20 }} />}
            label="Custom Workouts"
            value={customWorkouts.length}
            sub={customWorkouts.length > 0 ? `${customWorkouts.reduce((sum, workout) => sum + workout.timesUsed, 0)} total uses` : 'Build your own templates'}
            color="#8e24aa"
            onClick={() => navigate('/app/fitness/workouts')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PlayArrowIcon sx={{ color: '#fff', fontSize: 20 }} />}
            label="Live Sessions"
            value={liveSessions.length}
            sub={`${totalReps} reps · ${Math.round(totalWorkoutSeconds / 60)} min total`}
            color="#2e7d32"
            onClick={() => navigate('/app/fitness/workouts')}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} lg={7}>
          <SectionCard
            title="Plan execution"
            subtitle="This section uses only workout plans and workout logs from the Fitness module"
            action={activePlan ? <Chip label={GOAL_META[activePlan.goal].label} size="small" color="primary" variant="outlined" /> : undefined}
          >
            {activePlan ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 1.5 }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {GOAL_META[activePlan.goal].emoji} {activePlan.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activePlan.description}
                    </Typography>
                  </Box>
                  <Chip label={DIFFICULTY_META[activePlan.difficulty].label} size="small" sx={{ color: DIFFICULTY_META[activePlan.difficulty].color, borderColor: DIFFICULTY_META[activePlan.difficulty].color }} variant="outlined" />
                </Box>

                <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                  <Grid item xs={4}>
                    <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">Duration</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>{activePlan.durationWeeks} weeks</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">Days / week</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>{activePlan.daysPerWeek}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">Work days seeded</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>{activePlan.workoutsPerDay.length}</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>
                  Weekly adherence
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={clamp((weeklyLogs.length / Math.max(activePlan.daysPerWeek, 1)) * 100)}
                  sx={{ height: 8, borderRadius: 4, bgcolor: '#eeeeee', mb: 0.5 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {weeklyLogs.length} logged workout{weeklyLogs.length !== 1 ? 's' : ''} against a target of {activePlan.daysPerWeek} this week.
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>
                  Plan tags
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                  {activePlan.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
              </>
            ) : (
              <Alert severity="info">No workout plan is active. Pick one from the Workout Plans tab to anchor your fitness week.</Alert>
            )}
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={5}>
          <SectionCard
            title="Workout history snapshot"
            subtitle="Recent log volume, time spent, and how sessions felt"
            action={<Chip icon={<AccessTimeIcon />} label={avgDuration > 0 ? `${avgDuration} min avg` : 'No logs'} size="small" variant="outlined" />}
          >
            <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
              <Grid item xs={4}>
                <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Last 7 days</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{weeklyLogs.length}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Last 30 days</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{monthlyLogs.length}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Recovery signal</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{recoverySignal || '--'}%</Typography>
                </Paper>
              </Grid>
            </Grid>

            {workoutLogs.length === 0 ? (
              <Alert severity="info">No workout logs yet. Once you start logging sessions, this dashboard will surface recent training history and trend signals.</Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {workoutLogs.slice(0, 5).map((log) => (
                  <Paper key={log.id} variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {log.workoutName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {log.date} · {log.durationMinutes} min · {log.exercises.length} exercise{log.exercises.length !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                      <Chip label={log.feeling} size="small" color={log.feeling === 'great' || log.feeling === 'good' ? 'success' : log.feeling === 'okay' ? 'warning' : 'default'} />
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </SectionCard>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} lg={6}>
          <SectionCard
            title="Exercise library coverage"
            subtitle="Inventory from the Fitness module’s exercise database only"
            action={<Chip icon={<FitnessCenterIcon />} label={`${EXERCISE_DATABASE.length} exercises`} size="small" color="primary" variant="outlined" />}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Category mix
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1.5 }}>
              {categoryDistribution.map((category) => {
                const pct = clamp((category.count / Math.max(EXERCISE_DATABASE.length, 1)) * 100);
                return (
                  <Box key={category.key}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                      <Typography variant="body2">{category.emoji} {category.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{category.count}</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={pct} sx={{ height: 7, borderRadius: 4, bgcolor: '#eeeeee', '& .MuiLinearProgress-bar': { bgcolor: category.color } }} />
                  </Box>
                );
              })}
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>
                  Difficulty mix
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                  {difficultyDistribution.map((item) => (
                    <Chip key={item.key} label={`${item.label}: ${item.count}`} size="small" sx={{ color: item.color, borderColor: item.color }} variant="outlined" />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>
                  Plan goal coverage
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                  {planGoalDistribution.map((item) => (
                    <Chip key={item.key} label={`${item.emoji} ${item.label}: ${item.count}`} size="small" variant="outlined" />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={6}>
          <SectionCard
            title="Custom workouts and favorite movements"
            subtitle="Frequently used templates and the most repeated exercises from workout logs"
            action={<Chip icon={<EmojiEventsIcon />} label={popularCustomWorkouts.length > 0 ? 'Usage ranked' : 'No usage yet'} size="small" variant="outlined" />}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>
              Top custom workouts
            </Typography>
            {popularCustomWorkouts.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                No custom workouts created yet.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1.5 }}>
                {popularCustomWorkouts.map((workout) => (
                  <Paper key={workout.id} variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{workout.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {workout.exercises.length} exercises · last used {formatRelativeTime(workout.lastUsedAt)}
                        </Typography>
                      </Box>
                      <Chip label={`${workout.timesUsed} uses`} size="small" color={workout.timesUsed > 0 ? 'success' : 'default'} />
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}

            <Divider sx={{ my: 1.5 }} />

            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>
              Most logged exercises
            </Typography>
            {topLoggedExercises.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Start logging workouts to reveal your most trained movements.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {topLoggedExercises.map((item) => {
                  const exercise = getExercise(item.exerciseId);
                  return (
                    <Paper key={item.exerciseId} variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {exercise?.name ?? item.exerciseId}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.uses} log entries · {item.reps} total reps
                          </Typography>
                        </Box>
                        {exercise && (
                          <Chip label={CATEGORY_META[exercise.category].label} size="small" variant="outlined" />
                        )}
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            )}
          </SectionCard>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} lg={6}>
          <SectionCard
            title="Live workout performance"
            subtitle="Camera-based workout sessions tracked by the Live Workout store"
            action={<Chip icon={<VideocamIcon />} label={`${recentLiveSessions.length} recent`} size="small" variant="outlined" />}
          >
            <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
              <Grid item xs={4}>
                <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Form score</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{avgFormScore || '--'}%</Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Total reps</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{totalReps}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Camera minutes</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{Math.round(totalWorkoutSeconds / 60)}</Typography>
                </Paper>
              </Grid>
            </Grid>

            {recentLiveSessions.length === 0 ? (
              <Alert severity="info">No live workout sessions recorded yet. Launch a live workout to track reps, duration, and form score.</Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {recentLiveSessions.map((session) => {
                  const liveExercise = LIVE_EXERCISES.find((exercise) => exercise.id === session.exerciseId);
                  const categoryMeta = liveExercise ? LIVE_CATEGORIES[liveExercise.category] : null;
                  return (
                    <Paper key={session.id} variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {liveExercise?.name ?? session.exerciseId}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {session.reps} reps · {Math.round(session.durationSeconds / 60)} min · {formatRelativeTime(session.startedAt)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          <Chip label={`${Math.round(session.avgFormScore * 100)}% form`} size="small" color={session.avgFormScore >= 0.8 ? 'success' : session.avgFormScore >= 0.6 ? 'warning' : 'default'} />
                          {categoryMeta && <Chip label={categoryMeta.label} size="small" variant="outlined" />}
                        </Box>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            )}
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={6}>
          <SectionCard
            title="Fitness insights"
            subtitle="Actionable observations generated only from fitness workout data"
            action={<Chip icon={<TimelineIcon />} label="Fitness-only" size="small" color="primary" variant="outlined" />}
          >
            <Grid container spacing={1.5}>
              {insights.map((insight) => (
                <Grid item xs={12} key={insight.title}>
                  <Alert severity={insight.tone}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}>
                      {insight.title}
                    </Typography>
                    <Typography variant="caption">{insight.body}</Typography>
                  </Alert>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 1.5 }} />

            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>
              Fast navigation
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[
                { label: 'Open Exercise Library', icon: <FitnessCenterIcon fontSize="small" /> },
                { label: 'Review Workout Plans', icon: <CalendarMonthIcon fontSize="small" /> },
                { label: 'Manage Custom Workouts', icon: <AutoFixHighIcon fontSize="small" /> },
                { label: 'Start Live Workout', icon: <VideocamIcon fontSize="small" /> },
              ].map((item) => (
                <Button key={item.label} variant="outlined" size="small" startIcon={item.icon} onClick={() => navigate('/app/fitness/workouts')}>
                  {item.label}
                </Button>
              ))}
            </Box>
          </SectionCard>
        </Grid>
      </Grid>

      <SectionCard
        title="Fitness inventory snapshot"
        subtitle="What the module currently contains before you add more personal workout data"
      >
        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
              <Typography variant="caption" color="text.secondary">Preset plans</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{PRESET_PLANS.length}</Typography>
              <Typography variant="body2" color="text.secondary">Structured programs covering fat loss, muscle gain, flexibility, and athletic performance.</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
              <Typography variant="caption" color="text.secondary">Exercise database</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{EXERCISE_DATABASE.length}</Typography>
              <Typography variant="body2" color="text.secondary">Exercises across strength, cardio, yoga, HIIT, stretching, and mobility.</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
              <Typography variant="caption" color="text.secondary">Live exercise modes</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{LIVE_EXERCISES.length}</Typography>
              <Typography variant="body2" color="text.secondary">Camera-detected exercise modes spanning upper body, lower body, core, full-body, cardio, yoga, and stretch.</Typography>
            </Paper>
          </Grid>
        </Grid>
      </SectionCard>
    </Box>
  );
}