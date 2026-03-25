import { useState, useMemo, lazy, Suspense } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Avatar,
  Divider,
  Alert,
  LinearProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SpeedIcon from '@mui/icons-material/Speed';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import BoltIcon from '@mui/icons-material/Bolt';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics';
import {
  useWorkoutSystemStore,
  EXERCISE_DATABASE,
  PRESET_PLANS,
  CATEGORY_META,
  GOAL_META,
  DIFFICULTY_META,
  MUSCLE_LABELS,
  type ExerciseCategory,
  type Exercise,
  type PlanGoal,
  type DifficultyLevel,
  type WorkoutExercise,
} from '@/store/workoutSystemStore';
import toast from 'react-hot-toast';

const LiveWorkoutTab = lazy(() => import('@/components/LiveWorkoutTab'));

// ─── Category / Goal icon maps ──────────────────────────
function getCatIcon(category: ExerciseCategory, fontSize = 18, color?: string) {
  const sx = { fontSize, ...(color ? { color } : {}) };
  switch (category) {
    case 'strength':   return <FitnessCenterIcon sx={sx} />;
    case 'cardio':     return <DirectionsRunIcon sx={sx} />;
    case 'yoga':       return <SelfImprovementIcon sx={sx} />;
    case 'hiit':       return <BoltIcon sx={sx} />;
    case 'stretching': return <AccessibilityNewIcon sx={sx} />;
    case 'mobility':   return <AutorenewIcon sx={sx} />;
  }
}

function getGoalIcon(goal: PlanGoal, fontSize = 22, color?: string) {
  const sx = { fontSize, ...(color ? { color } : {}) };
  switch (goal) {
    case 'fat-loss':              return <LocalFireDepartmentIcon sx={sx} />;
    case 'muscle-gain':           return <SportsMartialArtsIcon sx={sx} />;
    case 'flexibility':           return <SelfImprovementIcon sx={sx} />;
    case 'athletic-performance':  return <SportsGymnasticsIcon sx={sx} />;
  }
}

// ─── Exercise Detail Dialog ─────────────────────────────
function ExerciseDetailDialog({ exercise, open, onClose }: { exercise: Exercise | null; open: boolean; onClose: () => void }) {
  if (!exercise) return null;
  const cat = CATEGORY_META[exercise.category];
  const diff = DIFFICULTY_META[exercise.difficulty];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 6 }}>
        {getCatIcon(exercise.category, 26, cat.color)}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{exercise.name}</Typography>
          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
            <Chip label={cat.label} size="small" sx={{ fontSize: 11, bgcolor: `${cat.color}14`, color: cat.color, fontWeight: 600 }} />
            <Chip label={diff.label} size="small" sx={{ fontSize: 11, bgcolor: `${diff.color}14`, color: diff.color, fontWeight: 600 }} />
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 12, top: 12 }}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {/* Video embed */}
        {exercise.videoUrl && (
          <Box sx={{ mb: 2.5, borderRadius: 2, overflow: 'hidden', bgcolor: '#000', aspectRatio: '16/9' }}>
            <iframe
              width="100%"
              height="100%"
              src={exercise.videoUrl.replace('watch?v=', 'embed/')}
              title={exercise.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 'none', display: 'block' }}
            />
          </Box>
        )}

        {/* Muscles */}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Muscles Targeted</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          {exercise.muscles.map((m) => (
            <Chip key={m} label={MUSCLE_LABELS[m]} size="small" variant="outlined" sx={{ fontSize: 11 }} />
          ))}
        </Box>

        {/* Defaults */}
        <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
          {exercise.defaultSets && (
            <Box>
              <Typography variant="caption" color="text.secondary">Sets</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>{exercise.defaultSets}</Typography>
            </Box>
          )}
          {exercise.defaultReps && (
            <Box>
              <Typography variant="caption" color="text.secondary">Reps</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>{exercise.defaultReps}</Typography>
            </Box>
          )}
          {exercise.durationSeconds && (
            <Box>
              <Typography variant="caption" color="text.secondary">Duration</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>{exercise.durationSeconds >= 60 ? `${Math.floor(exercise.durationSeconds / 60)}m` : `${exercise.durationSeconds}s`}</Typography>
            </Box>
          )}
        </Box>

        {/* Equipment */}
        {exercise.equipmentNeeded.length > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Equipment</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
              {exercise.equipmentNeeded.map((e) => (
                <Chip key={e} label={e} size="small" sx={{ fontSize: 11, textTransform: 'capitalize' }} />
              ))}
            </Box>
          </>
        )}

        {/* Instructions */}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Instructions</Typography>
        <Box component="ol" sx={{ pl: 2.5, m: 0, '& li': { mb: 0.5, fontSize: 14, color: 'text.secondary' } }}>
          {exercise.instructions.map((inst, i) => (
            <li key={i}>{inst}</li>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// ─── A. Workout Library ─────────────────────────────────
function WorkoutLibrary() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null);

  const filtered = useMemo(() => {
    return EXERCISE_DATABASE.filter((ex) => {
      if (selectedCategory !== 'all' && ex.category !== selectedCategory) return false;
      if (selectedDifficulty !== 'all' && ex.difficulty !== selectedDifficulty) return false;
      if (search && !ex.name.toLowerCase().includes(search.toLowerCase()) && !ex.muscles.some((m) => MUSCLE_LABELS[m].toLowerCase().includes(search.toLowerCase()))) return false;
      return true;
    });
  }, [search, selectedCategory, selectedDifficulty]);

  const categories: (ExerciseCategory | 'all')[] = ['all', 'strength', 'cardio', 'yoga', 'hiit', 'stretching', 'mobility'];

  return (
    <Box>
      {/* Search + Filters */}
      <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Search exercises or muscles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ flex: 1, minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          InputProps={{ startAdornment: <SearchIcon sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} /> }}
        />
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Difficulty</InputLabel>
          <Select
            label="Difficulty"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as any)}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="all">All Levels</MenuItem>
            <MenuItem value="beginner">Beginner</MenuItem>
            <MenuItem value="intermediate">Intermediate</MenuItem>
            <MenuItem value="advanced">Advanced</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Category Chips */}
      <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
        {categories.map((cat) => {
          const isAll = cat === 'all';
          const meta = isAll ? null : CATEGORY_META[cat];
          const active = selectedCategory === cat;
          return (
            <Chip
              key={cat}
              label={isAll ? 'All' : `${meta!.emoji} ${meta!.label}`}
              onClick={() => setSelectedCategory(cat)}
              variant={active ? 'filled' : 'outlined'}
              sx={{
                fontWeight: active ? 600 : 400,
                bgcolor: active ? (isAll ? '#424242' : `${meta!.color}14`) : 'transparent',
                color: active ? (isAll ? '#fff' : meta!.color) : 'text.primary',
                borderColor: active ? (isAll ? '#424242' : meta!.color) : '#bdbdbd',
                '&:hover': { bgcolor: active ? undefined : '#f5f5f5' },
              }}
            />
          );
        })}
      </Box>

      {/* Exercise Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 1 }}>
        {filtered.map((ex) => {
          const cat = CATEGORY_META[ex.category];
          const diff = DIFFICULTY_META[ex.difficulty];
          return (
            <Paper
              key={ex.id}
              elevation={0}
              onClick={() => setDetailExercise(ex)}
              sx={{
                p: 2,
                borderRadius: 2.5,
                border: '1px solid #e0e0e0',
                cursor: 'pointer',
                transition: 'all 0.15s',
                '&:hover': { borderColor: cat.color, boxShadow: `0 0 0 1px ${cat.color}30` },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Avatar sx={{ bgcolor: `${cat.color}14`, width: 32, height: 32 }}>
                  {getCatIcon(ex.category, 18, cat.color)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>{ex.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{cat.label}</Typography>
                </Box>
                <Chip label={diff.label} size="small" sx={{ fontSize: 10, bgcolor: `${diff.color}14`, color: diff.color, fontWeight: 600, height: 20 }} />
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {ex.muscles.slice(0, 3).map((m) => (
                  <Chip key={m} label={MUSCLE_LABELS[m]} size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
                ))}
                {ex.muscles.length > 3 && <Chip label={`+${ex.muscles.length - 3}`} size="small" sx={{ fontSize: 10, height: 20 }} />}
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                {ex.defaultSets && <Typography variant="caption" color="text.secondary">{ex.defaultSets} sets</Typography>}
                {ex.defaultReps && <Typography variant="caption" color="text.secondary">{ex.defaultReps} reps</Typography>}
                {ex.durationSeconds && <Typography variant="caption" color="text.secondary">{ex.durationSeconds >= 60 ? `${Math.floor(ex.durationSeconds / 60)}m` : `${ex.durationSeconds}s`}</Typography>}
              </Box>
            </Paper>
          );
        })}
      </Box>

      {filtered.length === 0 && (
        <Alert severity="info" sx={{ borderRadius: 2, mt: 1 }}>No exercises match your filters.</Alert>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        {filtered.length} of {EXERCISE_DATABASE.length} exercises
      </Typography>

      <ExerciseDetailDialog exercise={detailExercise} open={!!detailExercise} onClose={() => setDetailExercise(null)} />
    </Box>
  );
}

// ─── B. Workout Plans ───────────────────────────────────
function WorkoutPlans() {
  const { activePlanId, setActivePlan, getExercise } = useWorkoutSystemStore();
  const [goalFilter, setGoalFilter] = useState<PlanGoal | 'all'>('all');
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  const plans = useMemo(
    () => (goalFilter === 'all' ? PRESET_PLANS : PRESET_PLANS.filter((p) => p.goal === goalFilter)),
    [goalFilter],
  );

  return (
    <Box>
      {/* Goal filter */}
      <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
        {(['all', 'fat-loss', 'muscle-gain', 'flexibility', 'athletic-performance'] as const).map((g) => {
          const isAll = g === 'all';
          const meta = isAll ? null : GOAL_META[g];
          const active = goalFilter === g;
          return (
            <Chip
              key={g}
              label={isAll ? 'All Plans' : `${meta!.emoji} ${meta!.label}`}
              onClick={() => setGoalFilter(g)}
              variant={active ? 'filled' : 'outlined'}
              sx={{
                fontWeight: active ? 600 : 400,
                bgcolor: active ? (isAll ? '#424242' : `${meta!.color}14`) : 'transparent',
                color: active ? (isAll ? '#fff' : meta!.color) : 'text.primary',
                borderColor: active ? (isAll ? '#424242' : meta!.color) : '#bdbdbd',
              }}
            />
          );
        })}
      </Box>

      {/* Plan Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {plans.map((plan) => {
          const goalMeta = GOAL_META[plan.goal];
          const diffMeta = DIFFICULTY_META[plan.difficulty];
          const isActive = activePlanId === plan.id;
          const isExpanded = expandedPlan === plan.id;

          return (
            <Paper
              key={plan.id}
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '2px solid',
                borderColor: isActive ? goalMeta.color : '#e0e0e0',
                bgcolor: isActive ? `${goalMeta.color}06` : '#fff',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ p: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Avatar sx={{ bgcolor: `${goalMeta.color}18`, width: 38, height: 38 }}>
                    {getGoalIcon(plan.goal, 22, goalMeta.color)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{plan.name}</Typography>
                      {isActive && <Chip label="Active" size="small" sx={{ bgcolor: goalMeta.color, color: '#fff', fontWeight: 600, fontSize: 11, height: 22 }} />}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, fontSize: 13 }}>{plan.description}</Typography>

                    <Box sx={{ display: 'flex', gap: 0.75, mt: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Chip icon={<CalendarMonthIcon sx={{ fontSize: 14 }} />} label={`${plan.durationWeeks} weeks`} size="small" variant="outlined" sx={{ fontSize: 11, height: 24 }} />
                      <Chip icon={<SpeedIcon sx={{ fontSize: 14 }} />} label={`${plan.daysPerWeek} days/week`} size="small" variant="outlined" sx={{ fontSize: 11, height: 24 }} />
                      <Chip label={diffMeta.label} size="small" sx={{ fontSize: 11, height: 24, bgcolor: `${diffMeta.color}14`, color: diffMeta.color, fontWeight: 600 }} />
                      {plan.isAdaptive && <Chip icon={<AutoFixHighIcon sx={{ fontSize: 14 }} />} label="Adaptive" size="small" sx={{ fontSize: 11, height: 24, bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600 }} />}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                      {plan.tags.map((t) => <Chip key={t} label={t} size="small" variant="outlined" sx={{ fontSize: 10, height: 20, borderColor: '#e0e0e0' }} />)}
                    </Box>
                  </Box>
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1, mt: 1.5, alignItems: 'center' }}>
                  {isActive ? (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setActivePlan(null)}
                      sx={{ textTransform: 'none', borderRadius: 2, borderColor: '#bdbdbd', color: 'text.primary', fontSize: 12 }}
                    >
                      Deactivate Plan
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<PlayArrowIcon />}
                      onClick={() => { setActivePlan(plan.id); toast.success(`Started: ${plan.name}`); }}
                      sx={{ textTransform: 'none', borderRadius: 2, bgcolor: goalMeta.color, '&:hover': { bgcolor: goalMeta.color, filter: 'brightness(0.9)' }, fontSize: 12, fontWeight: 600 }}
                    >
                      Start Plan
                    </Button>
                  )}
                  <Button
                    size="small"
                    onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                    endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    sx={{ textTransform: 'none', fontSize: 12, color: 'text.secondary', ml: 'auto' }}
                  >
                    {isExpanded ? 'Hide' : 'View'} Exercises
                  </Button>
                </Box>
              </Box>

              {/* Expanded exercise list */}
              {isExpanded && (
                <Box sx={{ borderTop: '1px solid #e0e0e0', p: 1.5, bgcolor: '#fafafa' }}>
                  {plan.workoutsPerDay.map((dayExercises, dayIdx) => (
                    <Box key={dayIdx} sx={{ mb: dayIdx < plan.workoutsPerDay.length - 1 ? 2 : 0 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.5, mb: 0.5, display: 'block' }}>
                        Day {dayIdx + 1}
                      </Typography>
                      {dayExercises.map((we, i) => {
                        const ex = getExercise(we.exerciseId);
                        if (!ex) return null;
                        const cat = CATEGORY_META[ex.category];
                        return (
                          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                            {getCatIcon(ex.category, 18, cat.color)}
                            <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>{ex.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {we.sets}×{we.reps ? `${we.reps} reps` : `${we.durationSeconds! >= 60 ? `${Math.floor(we.durationSeconds! / 60)}m` : `${we.durationSeconds}s`}`}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}

// ─── C. Custom Workouts ─────────────────────────────────
function CreateWorkoutDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { createCustomWorkout } = useWorkoutSystemStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState<(WorkoutExercise & { _name?: string })[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerCategory, setPickerCategory] = useState<ExerciseCategory | 'all'>('all');
  const [pickerSearch, setPickerSearch] = useState('');

  const pickerExercises = useMemo(() => {
    return EXERCISE_DATABASE.filter((ex) => {
      if (pickerCategory !== 'all' && ex.category !== pickerCategory) return false;
      if (pickerSearch && !ex.name.toLowerCase().includes(pickerSearch.toLowerCase())) return false;
      return true;
    });
  }, [pickerCategory, pickerSearch]);

  const addExercise = (ex: Exercise) => {
    setExercises([...exercises, {
      exerciseId: ex.id,
      sets: ex.defaultSets ?? 3,
      reps: ex.defaultReps,
      durationSeconds: ex.durationSeconds,
      restSeconds: 60,
      _name: ex.name,
    }]);
    setShowPicker(false);
    setPickerSearch('');
  };

  const removeExercise = (idx: number) => setExercises(exercises.filter((_, i) => i !== idx));

  const updateExercise = (idx: number, field: string, value: number) => {
    setExercises(exercises.map((e, i) => (i === idx ? { ...e, [field]: value } : e)));
  };

  const handleSave = () => {
    if (!name.trim() || exercises.length === 0) return;
    createCustomWorkout(
      name.trim(),
      description.trim(),
      exercises.map(({ _name, ...rest }) => rest),
    );
    toast.success('Workout created!');
    onClose();
    setName('');
    setDescription('');
    setExercises([]);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Create Custom Workout
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Workout Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="small"
            fullWidth
            placeholder="E.g., Morning Full Body"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            size="small"
            fullWidth
            multiline
            rows={2}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          {/* Exercise list */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: -0.5 }}>Exercises</Typography>
          {exercises.length === 0 && (
            <Alert severity="info" sx={{ borderRadius: 2, fontSize: 13 }}>Add exercises to build your workout.</Alert>
          )}
          {exercises.map((ex, idx) => {
            const dbEx = EXERCISE_DATABASE.find((e) => e.id === ex.exerciseId);
            const cat = dbEx ? CATEGORY_META[dbEx.category] : null;
            return (
              <Paper key={idx} elevation={0} sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {cat && dbEx && getCatIcon(dbEx.category, 16, cat.color)}
                  <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>{ex._name ?? dbEx?.name}</Typography>
                  <IconButton size="small" onClick={() => removeExercise(idx)}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <TextField
                    label="Sets"
                    type="number"
                    value={ex.sets}
                    onChange={(e) => updateExercise(idx, 'sets', Number(e.target.value))}
                    size="small"
                    sx={{ width: 70, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    inputProps={{ min: 1 }}
                  />
                  {ex.reps !== null ? (
                    <TextField
                      label="Reps"
                      type="number"
                      value={ex.reps ?? ''}
                      onChange={(e) => updateExercise(idx, 'reps', Number(e.target.value))}
                      size="small"
                      sx={{ width: 70, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                      inputProps={{ min: 1 }}
                    />
                  ) : (
                    <TextField
                      label="Seconds"
                      type="number"
                      value={ex.durationSeconds ?? ''}
                      onChange={(e) => updateExercise(idx, 'durationSeconds', Number(e.target.value))}
                      size="small"
                      sx={{ width: 90, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                      inputProps={{ min: 1 }}
                    />
                  )}
                  <TextField
                    label="Rest (s)"
                    type="number"
                    value={ex.restSeconds}
                    onChange={(e) => updateExercise(idx, 'restSeconds', Number(e.target.value))}
                    size="small"
                    sx={{ width: 80, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    inputProps={{ min: 0 }}
                  />
                </Box>
              </Paper>
            );
          })}

          {/* Add exercise button / picker */}
          {!showPicker ? (
            <Button
              startIcon={<AddIcon />}
              onClick={() => setShowPicker(true)}
              sx={{ textTransform: 'none', borderRadius: 2, border: '1px dashed #bdbdbd', color: 'text.secondary', py: 1 }}
            >
              Add Exercise
            </Button>
          ) : (
            <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 1.5, maxHeight: 300, overflow: 'auto' }}>
              <TextField
                placeholder="Search..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                size="small"
                fullWidth
                sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
              <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                {(['all', 'strength', 'cardio', 'yoga', 'hiit', 'stretching', 'mobility'] as const).map((c) => (
                  <Chip
                    key={c}
                    label={c === 'all' ? 'All' : CATEGORY_META[c].emoji}
                    size="small"
                    onClick={() => setPickerCategory(c)}
                    variant={pickerCategory === c ? 'filled' : 'outlined'}
                    sx={{ height: 24, fontSize: 11, bgcolor: pickerCategory === c ? '#424242' : undefined, color: pickerCategory === c ? '#fff' : undefined }}
                  />
                ))}
              </Box>
              {pickerExercises.map((ex) => (
                <Box
                  key={ex.id}
                  onClick={() => addExercise(ex)}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.75, px: 1, borderRadius: 1.5, cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }}
                >
                  {getCatIcon(ex.category, 16, CATEGORY_META[ex.category].color)}
                  <Typography variant="body2" sx={{ flex: 1 }}>{ex.name}</Typography>
                  <AddIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </Box>
              ))}
              <Button size="small" onClick={() => setShowPicker(false)} sx={{ textTransform: 'none', mt: 0.5 }}>Close</Button>
            </Paper>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!name.trim() || exercises.length === 0}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, bgcolor: '#424242', '&:hover': { bgcolor: '#212121' } }}
        >
          Save Workout
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function CustomWorkouts() {
  const { customWorkouts, deleteCustomWorkout, useCustomWorkout, getExercise } = useWorkoutSystemStore();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Your Custom Workouts</Typography>
          <Typography variant="caption" color="text.secondary">Create and save reusable workout routines</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, bgcolor: '#424242', '&:hover': { bgcolor: '#212121' } }}
        >
          Create Workout
        </Button>
      </Box>

      {customWorkouts.length === 0 ? (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px dashed #bdbdbd', textAlign: 'center' }}>
          <FitnessCenterIcon sx={{ fontSize: 40, color: '#e0e0e0', mb: 0.5 }} />
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>No custom workouts yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Build your own workout routine from the exercise library.</Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{ textTransform: 'none', borderRadius: 2, border: '1px solid #bdbdbd', color: 'text.primary' }}
          >
            Create Your First Workout
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 1 }}>
          {customWorkouts.map((cw) => (
            <Paper
              key={cw.id}
              elevation={0}
              sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e0e0e0' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{cw.name}</Typography>
                  {cw.description && <Typography variant="caption" color="text.secondary">{cw.description}</Typography>}
                </Box>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => { deleteCustomWorkout(cw.id); toast.success('Deleted'); }}>
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ mb: 1.5 }}>
                {cw.exercises.map((we, i) => {
                  const ex = getExercise(we.exerciseId);
                  if (!ex) return null;
                  return (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, py: 0.3 }}>
                      {getCatIcon(ex.category, 16, CATEGORY_META[ex.category].color)}
                      <Typography variant="caption" sx={{ flex: 1 }}>{ex.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {we.sets}×{we.reps ?? `${we.durationSeconds}s`}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              <Divider sx={{ mb: 1.5 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {cw.exercises.length} exercises · Used {cw.timesUsed}×
                </Typography>
                <Button
                  size="small"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => { useCustomWorkout(cw.id); toast.success(`Starting: ${cw.name}`); }}
                  sx={{ textTransform: 'none', fontSize: 12, fontWeight: 600, borderRadius: 1.5, bgcolor: '#f5f5f5' }}
                >
                  Start
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      <CreateWorkoutDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </Box>
  );
}

// ═══════════════════ MAIN PAGE ═══════════════════════════
export default function WorkoutsPage() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ py: 1.5, px: 1.5 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.25, fontSize: 20 }}>Workouts</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: 13 }}>
        Browse exercises, follow plans, or build your own routines.
      </Typography>

      <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            borderBottom: '1px solid #e0e0e0',
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: 14 },
          }}
        >
          <Tab label="🏋️ Exercise Library" />
          <Tab label="📋 Workout Plans" />
          <Tab label="✏️ Custom Workouts" />
          <Tab label="📹 Live Workout" sx={{ color: tab === 3 ? '#00c853' : undefined }} />
        </Tabs>

        <Box sx={{ p: 1.5 }}>
          {tab === 0 && <WorkoutLibrary />}
          {tab === 1 && <WorkoutPlans />}
          {tab === 2 && <CustomWorkouts />}
          {tab === 3 && (
            <Suspense fallback={<Box sx={{ py: 4, textAlign: 'center' }}><LinearProgress sx={{ maxWidth: 300, mx: 'auto' }} /></Box>}>
              <LiveWorkoutTab />
            </Suspense>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
