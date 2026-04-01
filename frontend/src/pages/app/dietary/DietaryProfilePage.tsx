import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Slider,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import FlagIcon from '@mui/icons-material/Flag';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import {
  useDietaryProfileStore,
  DietGoal,
  DietType,
} from '@/store/dietaryProfileStore';
import { dietaryApi } from '@/lib/api';
import { errorLogger } from '@/lib/errorLogger';
import { useAuthStore } from '@/store/authStore';

// ─── Constants ──────────────────────────────────────────
const DIET_GOALS: { value: DietGoal; label: string }[] = [
  { value: DietGoal.LOSE_WEIGHT, label: 'Lose Weight' },
  { value: DietGoal.GAIN_WEIGHT, label: 'Gain Weight' },
  { value: DietGoal.MAINTAIN, label: 'Maintain Weight' },
  { value: DietGoal.BUILD_MUSCLE, label: 'Build Muscle' },
  { value: DietGoal.IMPROVE_HEALTH, label: 'Improve Health' },
];

const DIET_TYPES: { value: DietType; label: string }[] = [
  { value: DietType.STANDARD, label: 'Standard' },
  { value: DietType.VEGETARIAN, label: 'Vegetarian' },
  { value: DietType.VEGAN, label: 'Vegan' },
  { value: DietType.KETO, label: 'Keto' },
  { value: DietType.PALEO, label: 'Paleo' },
  { value: DietType.MEDITERRANEAN, label: 'Mediterranean' },
  { value: DietType.LOW_CARB, label: 'Low Carb' },
  { value: DietType.HIGH_PROTEIN, label: 'High Protein' },
  { value: DietType.GLUTEN_FREE, label: 'Gluten Free' },
  { value: DietType.DAIRY_FREE, label: 'Dairy Free' },
  { value: DietType.CUSTOM, label: 'Custom' },
];

const COMMON_ALLERGIES = [
  'Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Wheat', 'Soy',
  'Fish', 'Shellfish', 'Sesame', 'Gluten', 'Lactose',
];

const COMMON_RESTRICTIONS = [
  'No Pork', 'No Beef', 'No Alcohol', 'No Caffeine', 'No Sugar',
  'No Processed Foods', 'No Red Meat', 'Halal', 'Kosher',
];

const COMMON_CUISINES = [
  'Indian', 'Italian', 'Mexican', 'Chinese', 'Japanese', 'Thai',
  'Mediterranean', 'Korean', 'American', 'French', 'Middle Eastern',
  'Vietnamese', 'Greek', 'Spanish', 'Ethiopian',
];

// ─── Types ──────────────────────────────────────────────
interface DietaryGoal {
  _id?: string;
  title?: string;
  name?: string;
  current?: number;
  target?: number;
  completed?: boolean;
}

// ─── Helpers ────────────────────────────────────────────
function SectionCard({
  title,
  subtitle,
  icon,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2, alignItems: 'flex-start' }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          {icon}
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
        </Box>
        {action}
      </Box>
      {children}
    </Paper>
  );
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

// ─── Main Component ─────────────────────────────────────
export default function DietaryProfilePage() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id || 'anonymous';

  // Store selectors
  const store = useDietaryProfileStore();

  // Local form state (initialized from store)
  const [goal, setGoal] = useState<DietGoal | ''>(store.goal);
  const [dietType, setDietType] = useState<DietType | ''>(store.dietType);
  const [calories, setCalories] = useState(store.dailyCalorieTarget);
  const [protein, setProtein] = useState(store.dailyProteinTargetG);
  const [carbs, setCarbs] = useState(store.dailyCarbsTargetG);
  const [fat, setFat] = useState(store.dailyFatTargetG);
  const [water, setWater] = useState(store.dailyWaterTargetMl);
  const [mealsPerDay, setMealsPerDay] = useState(store.mealsPerDay);
  const [allergies, setAllergies] = useState<string[]>(store.allergies);
  const [restrictions, setRestrictions] = useState<string[]>(store.restrictions);
  const [cuisines, setCuisines] = useState<string[]>(store.preferredCuisines);

  // Goals state
  const [goals, setGoals] = useState<DietaryGoal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');

  // UI state
  const [saving, setSaving] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [dirty, setDirty] = useState(false);

  // Fetch goals from API
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await dietaryApi.getGoals(userId);
        if (active) setGoals((res.data?.data ?? res.data ?? []) as DietaryGoal[]);
      } catch {
        // Goals may not exist yet
      } finally {
        if (active) setGoalsLoading(false);
      }
    })();
    return () => { active = false; };
  }, [userId]);

  // Sync from store on external changes
  useEffect(() => {
    setGoal(store.goal);
    setDietType(store.dietType);
    setCalories(store.dailyCalorieTarget);
    setProtein(store.dailyProteinTargetG);
    setCarbs(store.dailyCarbsTargetG);
    setFat(store.dailyFatTargetG);
    setWater(store.dailyWaterTargetMl);
    setMealsPerDay(store.mealsPerDay);
    setAllergies(store.allergies);
    setRestrictions(store.restrictions);
    setCuisines(store.preferredCuisines);
  }, [store.goal, store.dietType, store.dailyCalorieTarget, store.dailyProteinTargetG, store.dailyCarbsTargetG, store.dailyFatTargetG, store.dailyWaterTargetMl, store.mealsPerDay, store.allergies, store.restrictions, store.preferredCuisines]);

  // Profile readiness
  const readiness = useMemo(() => {
    const signals = [
      goal ? 1 : 0,
      dietType ? 1 : 0,
      allergies.length > 0 ? 1 : 0,
      restrictions.length > 0 ? 1 : 0,
      cuisines.length > 0 ? 1 : 0,
      store.onboardingComplete ? 1 : 0,
    ];
    return Math.round((signals.reduce((s, v) => s + v, 0) / signals.length) * 100);
  }, [goal, dietType, allergies, restrictions, cuisines, store.onboardingComplete]);

  // Goal completion
  const completedGoals = goals.filter((g) => g.completed).length;
  const goalCompletionRate = goals.length > 0 ? clamp((completedGoals / goals.length) * 100) : 0;

  // Macro total
  const macroTotal = protein * 4 + carbs * 4 + fat * 9;

  // Save
  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to Zustand store
      if (goal) store.setGoal(goal as DietGoal);
      if (dietType) store.setDietType(dietType as DietType);
      store.setCalorieTarget(calories);
      store.setMacroTargets(protein, carbs, fat);
      store.setWaterTarget(water);
      store.setMealsPerDay(mealsPerDay);
      store.setAllergies(allergies);
      store.setRestrictions(restrictions);
      store.setPreferredCuisines(cuisines);
      if (!store.onboardingComplete) store.completeOnboarding();

      // Sync to API
      await dietaryApi.saveProfile({
        dailyCalorieTarget: calories,
        dailyProteinTargetG: protein,
        dailyCarbsTargetG: carbs,
        dailyFatTargetG: fat,
        dailyWaterTargetMl: water,
        goal: goal || undefined,
        dietType: dietType || undefined,
        allergies,
        restrictions,
        preferredCuisines: cuisines,
        mealsPerDay,
      }, userId).catch(() => {});

      setDirty(false);
      setSnackMsg('Profile saved');
    } catch (err) {
      errorLogger.error('Failed to save dietary profile', 'DietaryProfile', { meta: { error: String(err) } });
      setSnackMsg('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // Reset
  const handleReset = () => {
    store.resetProfile();
    setDirty(false);
    setSnackMsg('Profile reset to defaults');
  };

  // Add goal
  const handleAddGoal = async () => {
    const title = newGoalTitle.trim();
    const target = Number(newGoalTarget);
    if (!title || !target || target <= 0) return;
    try {
      const res = await dietaryApi.createGoal({ title, target, current: 0 }, userId);
      const created = (res.data?.data ?? res.data) as DietaryGoal;
      setGoals((prev) => [...prev, created]);
      setNewGoalTitle('');
      setNewGoalTarget('');
      setSnackMsg('Goal added');
    } catch (err) {
      errorLogger.error('Failed to create goal', 'DietaryProfile', { meta: { error: String(err) } });
      setSnackMsg('Failed to create goal');
    }
  };

  // Mark field dirty on change
  const markDirty = () => { if (!dirty) setDirty(true); };

  return (
    <Box sx={{ flex: 1, px: { xs: 2.5, md: 4, lg: 5 }, py: 3, overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            Dietary Profile & Goals
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure your dietary preferences, nutritional targets, allergens, and track your dietary goals.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RestoreIcon />}
            onClick={handleReset}
            color="inherit"
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </Box>
      </Box>

      {/* Profile Readiness Bar */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Profile Readiness
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{readiness}%</Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={readiness}
          sx={{
            height: 10,
            borderRadius: 999,
            bgcolor: 'rgba(0,0,0,0.06)',
            '& .MuiLinearProgress-bar': { bgcolor: readiness >= 80 ? '#4caf50' : readiness >= 50 ? '#ff9800' : '#f44336' },
          }}
        />
        {readiness < 100 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Complete your goal, diet type, allergies, restrictions, and cuisine preferences to reach 100%.
          </Typography>
        )}
      </Paper>

      {dirty && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          You have unsaved changes. Click "Save Profile" to persist.
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* Left Column — Profile */}
        <Grid item xs={12} lg={8}>
          <Grid container spacing={2}>
            {/* Goal & Diet Type */}
            <Grid item xs={12}>
              <SectionCard
                title="Goal & Diet Type"
                subtitle="What are you trying to achieve?"
                icon={<PersonIcon sx={{ color: '#455a64' }} />}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Primary Goal"
                      value={goal}
                      onChange={(e) => { setGoal(e.target.value as DietGoal); markDirty(); }}
                      size="small"
                    >
                      <MenuItem value="">None selected</MenuItem>
                      {DIET_GOALS.map((g) => (
                        <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Diet Type"
                      value={dietType}
                      onChange={(e) => { setDietType(e.target.value as DietType); markDirty(); }}
                      size="small"
                    >
                      <MenuItem value="">None selected</MenuItem>
                      {DIET_TYPES.map((t) => (
                        <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </SectionCard>
            </Grid>

            {/* Daily Targets */}
            <Grid item xs={12}>
              <SectionCard
                title="Daily Nutritional Targets"
                subtitle="Set your calorie, macro, hydration, and meal frequency targets"
                icon={<FlagIcon sx={{ color: '#ef6c00' }} />}
              >
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Calories — {calories} kcal
                    </Typography>
                    <Slider
                      value={calories}
                      onChange={(_, v) => { setCalories(v as number); markDirty(); }}
                      min={800}
                      max={5000}
                      step={50}
                      valueLabelDisplay="auto"
                      sx={{ color: '#ef6c00' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Water — {water} ml
                    </Typography>
                    <Slider
                      value={water}
                      onChange={(_, v) => { setWater(v as number); markDirty(); }}
                      min={500}
                      max={5000}
                      step={100}
                      valueLabelDisplay="auto"
                      sx={{ color: '#039be5' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Protein — {protein}g
                    </Typography>
                    <Slider
                      value={protein}
                      onChange={(_, v) => { setProtein(v as number); markDirty(); }}
                      min={10}
                      max={400}
                      step={5}
                      valueLabelDisplay="auto"
                      sx={{ color: '#1e88e5' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Carbs — {carbs}g
                    </Typography>
                    <Slider
                      value={carbs}
                      onChange={(_, v) => { setCarbs(v as number); markDirty(); }}
                      min={10}
                      max={600}
                      step={5}
                      valueLabelDisplay="auto"
                      sx={{ color: '#8e24aa' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Fat — {fat}g
                    </Typography>
                    <Slider
                      value={fat}
                      onChange={(_, v) => { setFat(v as number); markDirty(); }}
                      min={10}
                      max={250}
                      step={5}
                      valueLabelDisplay="auto"
                      sx={{ color: '#00897b' }}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Meals per day</Typography>
                    <TextField
                      type="number"
                      value={mealsPerDay}
                      onChange={(e) => { setMealsPerDay(Math.max(1, Math.min(10, Number(e.target.value)))); markDirty(); }}
                      size="small"
                      sx={{ width: 80, mt: 0.5 }}
                      inputProps={{ min: 1, max: 10 }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Macro calories estimate
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {macroTotal} kcal
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      P {protein * 4} + C {carbs * 4} + F {fat * 9}
                    </Typography>
                  </Box>
                </Box>
              </SectionCard>
            </Grid>

            {/* Allergies & Restrictions */}
            <Grid item xs={12} md={6}>
              <SectionCard
                title="Allergies"
                subtitle="Select or type your food allergies"
              >
                <Autocomplete
                  multiple
                  freeSolo
                  value={allergies}
                  onChange={(_, v) => { setAllergies(v as string[]); markDirty(); }}
                  options={COMMON_ALLERGIES}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...rest } = getTagProps({ index });
                      return <Chip key={key} label={option} size="small" color="error" variant="outlined" {...rest} />;
                    })
                  }
                  renderInput={(params) => (
                    <TextField {...params} size="small" placeholder="Add allergy..." />
                  )}
                />
              </SectionCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <SectionCard
                title="Dietary Restrictions"
                subtitle="Select or type restrictions"
              >
                <Autocomplete
                  multiple
                  freeSolo
                  value={restrictions}
                  onChange={(_, v) => { setRestrictions(v as string[]); markDirty(); }}
                  options={COMMON_RESTRICTIONS}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...rest } = getTagProps({ index });
                      return <Chip key={key} label={option} size="small" color="warning" variant="outlined" {...rest} />;
                    })
                  }
                  renderInput={(params) => (
                    <TextField {...params} size="small" placeholder="Add restriction..." />
                  )}
                />
              </SectionCard>
            </Grid>

            {/* Preferred Cuisines */}
            <Grid item xs={12}>
              <SectionCard
                title="Preferred Cuisines"
                subtitle="Helps AI generate more relevant meal plans"
              >
                <Autocomplete
                  multiple
                  freeSolo
                  value={cuisines}
                  onChange={(_, v) => { setCuisines(v as string[]); markDirty(); }}
                  options={COMMON_CUISINES}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...rest } = getTagProps({ index });
                      return <Chip key={key} label={option} size="small" color="primary" variant="outlined" {...rest} />;
                    })
                  }
                  renderInput={(params) => (
                    <TextField {...params} size="small" placeholder="Add cuisine..." />
                  )}
                />
              </SectionCard>
            </Grid>
          </Grid>
        </Grid>

        {/* Right Column — Goals & Summary */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={2}>
            {/* Goal Tracker */}
            <Grid item xs={12}>
              <SectionCard
                title="Dietary Goals"
                subtitle={`${completedGoals}/${goals.length} completed`}
                icon={<FlagIcon sx={{ color: '#00897b' }} />}
                action={
                  goals.length > 0
                    ? <Chip size="small" label={`${Math.round(goalCompletionRate)}%`} color={goalCompletionRate >= 80 ? 'success' : 'default'} />
                    : undefined
                }
              >
                {goals.length > 0 && (
                  <LinearProgress
                    variant="determinate"
                    value={goalCompletionRate}
                    sx={{
                      height: 8,
                      borderRadius: 999,
                      mb: 2,
                      bgcolor: 'rgba(0,0,0,0.06)',
                      '& .MuiLinearProgress-bar': { bgcolor: '#00897b' },
                    }}
                  />
                )}

                {goalsLoading ? (
                  <LinearProgress sx={{ borderRadius: 999, mb: 1 }} />
                ) : goals.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    No dietary goals yet. Add one below.
                  </Typography>
                ) : (
                  goals.map((g) => (
                    <Box
                      key={g._id || g.title}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {g.title || g.name}
                        </Typography>
                        {g.target != null && (
                          <>
                            <Typography variant="caption" color="text.secondary">
                              {g.current ?? 0} / {g.target}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={g.target > 0 ? clamp(((g.current ?? 0) / g.target) * 100) : 0}
                              sx={{
                                height: 6,
                                borderRadius: 999,
                                mt: 0.5,
                                bgcolor: 'rgba(0,0,0,0.06)',
                                '& .MuiLinearProgress-bar': { bgcolor: g.completed ? '#4caf50' : '#1e88e5' },
                              }}
                            />
                          </>
                        )}
                      </Box>
                      {g.completed && (
                        <CheckCircleIcon sx={{ color: '#4caf50', ml: 1 }} />
                      )}
                    </Box>
                  ))
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Add New Goal</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <TextField
                    size="small"
                    placeholder="Goal title"
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    sx={{ flex: 1, minWidth: 120 }}
                  />
                  <TextField
                    size="small"
                    type="number"
                    placeholder="Target"
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(e.target.value)}
                    sx={{ width: 90 }}
                    inputProps={{ min: 1 }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddGoal}
                    disabled={!newGoalTitle.trim() || !newGoalTarget}
                  >
                    Add
                  </Button>
                </Box>
              </SectionCard>
            </Grid>

            {/* Current Profile Summary */}
            <Grid item xs={12}>
              <SectionCard
                title="Profile Summary"
                subtitle="Currently saved settings"
              >
                <Box sx={{ display: 'grid', gap: 1 }}>
                  {[
                    ['Goal', goal ? DIET_GOALS.find((g) => g.value === goal)?.label : 'Not set'],
                    ['Diet Type', dietType ? DIET_TYPES.find((t) => t.value === dietType)?.label : 'Not set'],
                    ['Calories', `${calories} kcal`],
                    ['Protein', `${protein}g`],
                    ['Carbs', `${carbs}g`],
                    ['Fat', `${fat}g`],
                    ['Water', `${water} ml`],
                    ['Meals/Day', mealsPerDay],
                  ].map(([label, value]) => (
                    <Box key={label as string} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">{label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>

                {(allergies.length > 0 || restrictions.length > 0 || cuisines.length > 0) && (
                  <>
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {allergies.map((a) => <Chip key={a} label={a} size="small" color="error" variant="outlined" />)}
                      {restrictions.map((r) => <Chip key={r} label={r} size="small" color="warning" variant="outlined" />)}
                      {cuisines.map((c) => <Chip key={c} label={c} size="small" color="primary" variant="outlined" />)}
                    </Box>
                  </>
                )}
              </SectionCard>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Snackbar
        open={!!snackMsg}
        autoHideDuration={3000}
        onClose={() => setSnackMsg('')}
        message={snackMsg}
      />
    </Box>
  );
}
