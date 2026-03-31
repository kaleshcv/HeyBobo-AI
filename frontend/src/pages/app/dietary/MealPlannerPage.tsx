import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tabs,
  Tab,
  LinearProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Tooltip,
  CircularProgress,
  Autocomplete,
  useTheme,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SportsIcon from '@mui/icons-material/Sports';
import TuneIcon from '@mui/icons-material/Tune';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BreakfastDiningIcon from '@mui/icons-material/BreakfastDining';
import LunchDiningIcon from '@mui/icons-material/LunchDining';
import DinnerDiningIcon from '@mui/icons-material/DinnerDining';
import CookieIcon from '@mui/icons-material/Cookie';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import HistoryIcon from '@mui/icons-material/History';
import StarIcon from '@mui/icons-material/Star';
import ReactMarkdown from 'react-markdown';
import { dietaryApi } from '@/lib/api';
import { errorLogger } from '@/lib/errorLogger';
import { useAuthStore } from '@/store/authStore';
import {
  generateMealPlan,
  generateMealSubstitution,
  adjustMealPlanAI,
  type MealPlanInput,
  type PlannedMealItemAI,
  type DayPlanAI,
  type GeneratedMealPlan,
} from '@/lib/gemini';

// ─── Types ──────────────────────────────────────────────

interface MealPlan {
  _id: string;
  title: string;
  planType: string;
  category: string;
  startDate?: string;
  endDate?: string;
  fitnessGoal?: string;
  activityLevel?: string;
  dietType?: string;
  healthConditions: string[];
  allergies: string[];
  preferences: string[];
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  days: DayPlanAI[];
  prepGuide?: string;
  shoppingList: string[];
  aiNotes?: string;
  active: boolean;
  createdAt: string;
}

type PlanCategory = 'general' | 'health_condition' | 'athlete_performance' | 'gym_nutrition' | 'custom';

const categoryConfig: Record<PlanCategory, { label: string; icon: JSX.Element; color: string; desc: string }> = {
  general: { label: 'General', icon: <RestaurantIcon />, color: '#4caf50', desc: 'Balanced, healthy meal plan' },
  health_condition: { label: 'Health Condition', icon: <LocalHospitalIcon />, color: '#f44336', desc: 'Optimized for health conditions' },
  athlete_performance: { label: 'Athlete', icon: <SportsIcon />, color: '#ff9800', desc: 'Peak performance nutrition' },
  gym_nutrition: { label: 'Gym & Fitness', icon: <FitnessCenterIcon />, color: '#2196f3', desc: 'Muscle gain & body recomposition' },
  custom: { label: 'Custom', icon: <TuneIcon />, color: '#9c27b0', desc: 'Your specific preferences' },
};

const HEALTH_CONDITIONS = [
  'Diabetes (Type 2)', 'Hypertension', 'Heart Disease', 'PCOS', 'Thyroid (Hypothyroid)',
  'Thyroid (Hyperthyroid)', 'IBS', 'Celiac Disease', 'Kidney Disease', 'Fatty Liver',
  'High Cholesterol', 'Anemia', 'Gout', 'Arthritis', 'Osteoporosis',
];

const COMMON_ALLERGIES = [
  'Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Wheat', 'Soy', 'Fish', 'Shellfish',
  'Sesame', 'Gluten', 'Lactose',
];

const CUISINES = [
  'Indian', 'Mediterranean', 'Asian', 'Mexican', 'American', 'Italian',
  'Japanese', 'Korean', 'Middle Eastern', 'Thai', 'Chinese', 'French',
];

const mealTypeIcon: Record<string, JSX.Element> = {
  breakfast: <BreakfastDiningIcon fontSize="small" />,
  lunch: <LunchDiningIcon fontSize="small" />,
  dinner: <DinnerDiningIcon fontSize="small" />,
  snacks: <CookieIcon fontSize="small" />,
};

const mealTypeColor: Record<string, string> = {
  breakfast: '#ff9800',
  lunch: '#4caf50',
  dinner: '#2196f3',
  snacks: '#9c27b0',
};

// ─── Component ──────────────────────────────────────────

export default function MealPlannerPage() {
  const dk = useTheme().palette.mode === 'dark';
  const user = useAuthStore((s) => s.user);
  const userId = user?.id || 'anonymous';

  // View state
  const [view, setView] = useState<'generator' | 'plan' | 'history'>('generator');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  // Generated plan
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedMealPlan | null>(null);
  const [activePlan, setActivePlan] = useState<MealPlan | null>(null);
  const [savedPlans, setSavedPlans] = useState<MealPlan[]>([]);
  const [viewingPlan, setViewingPlan] = useState<MealPlan | null>(null);
  const [planDayTab, setPlanDayTab] = useState(0);
  const [planViewTab, setPlanViewTab] = useState(0); // 0=Schedule, 1=Prep Guide, 2=Shopping List, 3=AI Notes

  // Generator form
  const [planType, setPlanType] = useState<'daily' | 'weekly'>('weekly');
  const [category, setCategory] = useState<PlanCategory>('general');
  const [fitnessGoal, setFitnessGoal] = useState('maintain');
  const [activityLevel, setActivityLevel] = useState('moderately_active');
  const [dietType, setDietType] = useState('standard');
  const [healthConditions, setHealthConditions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [targetCalories, setTargetCalories] = useState(2000);
  const [targetProtein, setTargetProtein] = useState(0);
  const [targetCarbs, setTargetCarbs] = useState(0);
  const [targetFat, setTargetFat] = useState(0);

  // Substitution dialog
  const [subDialogOpen, setSubDialogOpen] = useState(false);
  const [subMealName, setSubMealName] = useState('');
  const [subReason, setSubReason] = useState('preference');
  const [subLoading, setSubLoading] = useState(false);
  const [subResults, setSubResults] = useState<PlannedMealItemAI[]>([]);

  // AI adjust dialog
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [adjustContext, setAdjustContext] = useState('');
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustResult, setAdjustResult] = useState('');

  // ─── Fetch data ─────────────────────────────────────

  const fetchPlans = useCallback(async () => {
    try {
      const [plansRes, activeRes] = await Promise.all([
        dietaryApi.getMealPlans(userId),
        dietaryApi.getActivePlan(userId),
      ]);
      setSavedPlans(plansRes.data?.data ?? plansRes.data ?? []);
      const active = activeRes.data?.data ?? activeRes.data ?? null;
      setActivePlan(active);
    } catch (err) {
      errorLogger.error('Failed to fetch meal plans', 'MealPlanner', { meta: { error: String(err) } });
    }
  }, [userId]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // ─── Generate plan ─────────────────────────────────

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const input: MealPlanInput = {
        planType,
        category,
        fitnessGoal,
        activityLevel,
        dietType,
        healthConditions: category === 'health_condition' ? healthConditions : [],
        allergies,
        preferences,
        targetCalories: targetCalories || undefined,
        targetProteinG: targetProtein || undefined,
        targetCarbsG: targetCarbs || undefined,
        targetFatG: targetFat || undefined,
      };
      const plan = await generateMealPlan(input);
      setGeneratedPlan(plan);
      setPlanDayTab(0);
      setPlanViewTab(0);
      setView('plan');
      setSnackbar({ open: true, message: 'Meal plan generated!', severity: 'success' });
    } catch (err: any) {
      errorLogger.error(err?.message || 'Meal plan generation failed', 'MealPlanner', { stack: err?.stack, meta: { action: 'generate' } });
      setSnackbar({ open: true, message: `Generation failed: ${err.message || 'Unknown error'}`, severity: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  // ─── Save plan ─────────────────────────────────────

  const handleSavePlan = async (plan: GeneratedMealPlan) => {
    setSaving(true);
    try {
      const payload = {
        title: plan.title,
        planType,
        category,
        fitnessGoal,
        activityLevel,
        dietType,
        healthConditions: category === 'health_condition' ? healthConditions : [],
        allergies,
        preferences,
        targetCalories,
        targetProteinG: targetProtein,
        targetCarbsG: targetCarbs,
        targetFatG: targetFat,
        days: plan.days,
        prepGuide: plan.prepGuide,
        shoppingList: plan.shoppingList,
        aiNotes: plan.aiNotes,
        active: false,
      };
      await dietaryApi.saveMealPlan(payload, userId);
      await fetchPlans();
      setSnackbar({ open: true, message: 'Plan saved!', severity: 'success' });
    } catch (err) {
      errorLogger.error('Failed to save meal plan', 'MealPlanner', { meta: { error: String(err) } });
      setSnackbar({ open: true, message: 'Failed to save plan', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (planId: string) => {
    try {
      await dietaryApi.activatePlan(planId, userId);
      await fetchPlans();
      setSnackbar({ open: true, message: 'Plan activated!', severity: 'success' });
    } catch (err) {
      errorLogger.warn('Failed to activate meal plan', 'MealPlanner', { meta: { error: String(err), planId } });
      setSnackbar({ open: true, message: 'Failed to activate', severity: 'error' });
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      await dietaryApi.deleteMealPlan(planId, userId);
      await fetchPlans();
      if (viewingPlan?._id === planId) {
        setViewingPlan(null);
        setView('history');
      }
      setSnackbar({ open: true, message: 'Plan deleted', severity: 'success' });
    } catch (err) {
      errorLogger.warn('Failed to delete meal plan', 'MealPlanner', { meta: { error: String(err), planId } });
      setSnackbar({ open: true, message: 'Failed to delete', severity: 'error' });
    }
  };

  // ─── Substitution ──────────────────────────────────

  const handleSubstitute = async () => {
    setSubLoading(true);
    try {
      const results = await generateMealSubstitution(subMealName, subReason, allergies, dietType);
      setSubResults(results);
    } catch (err) {
      errorLogger.error('Meal substitution failed', 'MealPlanner', { meta: { error: String(err) } });
      setSnackbar({ open: true, message: 'Substitution failed', severity: 'error' });
    } finally {
      setSubLoading(false);
    }
  };

  // ─── AI Adjust ─────────────────────────────────────

  const handleAdjust = async () => {
    setAdjustLoading(true);
    try {
      const plan = viewingPlan || (generatedPlan ? { days: generatedPlan.days } : null);
      if (!plan) return;
      const result = await adjustMealPlanAI(plan, adjustContext);
      setAdjustResult(result);
    } catch (err) {
      errorLogger.error('Meal plan adjustment failed', 'MealPlanner', { meta: { error: String(err) } });
      setSnackbar({ open: true, message: 'Adjustment failed', severity: 'error' });
    } finally {
      setAdjustLoading(false);
    }
  };

  // ─── Render helpers ────────────────────────────────

  const currentPlanDays: DayPlanAI[] = viewingPlan?.days || generatedPlan?.days || [];
  const currentPlanTitle = viewingPlan?.title || generatedPlan?.title || 'Meal Plan';
  const currentPrepGuide = viewingPlan?.prepGuide || generatedPlan?.prepGuide || '';
  const currentShoppingList = viewingPlan?.shoppingList || generatedPlan?.shoppingList || [];
  const currentAiNotes = viewingPlan?.aiNotes || generatedPlan?.aiNotes || '';

  function renderMealSection(label: string, items: PlannedMealItemAI[], type: string) {
    if (!items || items.length === 0) return null;
    return (
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Box sx={{ color: mealTypeColor[type] }}>{mealTypeIcon[type]}</Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: mealTypeColor[type], textTransform: 'capitalize' }}>
            {label}
          </Typography>
        </Box>
        {items.map((item, idx) => (
          <Card key={idx} variant="outlined" sx={{ mb: 1.5, borderRadius: 2, borderColor: `${mealTypeColor[type]}30` }}>
            <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                  {item.description && (
                    <Typography variant="caption" color="text.secondary">{item.description}</Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                  <Chip label={`${item.calories} kcal`} size="small" sx={{ fontWeight: 600, fontSize: 11 }} />
                  <Tooltip title="Find substitution">
                    <IconButton size="small" onClick={() => { setSubMealName(item.name); setSubResults([]); setSubDialogOpen(true); }}>
                      <SwapHorizIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 1, mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#2196f3', fontWeight: 600 }}>P: {item.proteinG}g</Typography>
                <Typography variant="caption" sx={{ color: '#ff9800', fontWeight: 600 }}>C: {item.carbsG}g</Typography>
                <Typography variant="caption" sx={{ color: '#9c27b0', fontWeight: 600 }}>F: {item.fatG}g</Typography>
                {item.fiberG > 0 && <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 600 }}>Fiber: {item.fiberG}g</Typography>}
                <Typography variant="caption" color="text.secondary">{item.portionSize}</Typography>
                {item.prepTime && <Typography variant="caption" color="text.secondary">Prep: {item.prepTime}</Typography>}
              </Box>

              {item.ingredients && item.ingredients.length > 0 && (
                <Accordion disableGutters elevation={0} sx={{ mt: 0.5, '&:before': { display: 'none' }, bgcolor: 'transparent' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 16 }} />} sx={{ minHeight: 28, p: 0, '& .MuiAccordionSummary-content': { my: 0 } }}>
                    <Typography variant="caption" color="text.secondary">Ingredients · Substitutions</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0, pt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      <strong>Ingredients:</strong> {item.ingredients.join(', ')}
                    </Typography>
                    {item.substitutions && item.substitutions.length > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        <strong>Alternatives:</strong> {item.substitutions.join(' · ')}
                      </Typography>
                    )}
                  </AccordionDetails>
                </Accordion>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  // ─── RENDER ────────────────────────────────────────

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {view !== 'generator' && (
            <IconButton onClick={() => { setView('generator'); setViewingPlan(null); setGeneratedPlan(null); }}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#f59e0b20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AutoAwesomeIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {view === 'generator' ? 'AI Meal Planner' : view === 'history' ? 'Saved Plans' : currentPlanTitle}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {view === 'generator' && (
            <Button
              startIcon={<HistoryIcon />}
              variant="outlined"
              size="small"
              onClick={() => setView('history')}
            >
              Saved Plans ({savedPlans.length})
            </Button>
          )}
          {view === 'plan' && generatedPlan && !viewingPlan && (
            <Button
              startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
              variant="contained"
              size="small"
              onClick={() => handleSavePlan(generatedPlan)}
              disabled={saving}
            >
              Save Plan
            </Button>
          )}
        </Box>
      </Box>

      {/* Active plan banner */}
      {activePlan && view === 'generator' && (
        <Paper
          sx={{
            p: 2, mb: 3, borderRadius: 2,
            bgcolor: dk ? 'rgba(76,175,80,0.12)' : '#e8f5e9',
            border: `1px solid ${dk ? 'rgba(76,175,80,0.3)' : '#a5d6a7'}`,
            cursor: 'pointer',
          }}
          onClick={() => { setViewingPlan(activePlan); setPlanDayTab(0); setPlanViewTab(0); setView('plan'); }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StarIcon sx={{ color: '#4caf50' }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Active Plan: {activePlan.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                {activePlan.planType === 'weekly' ? '7-day plan' : 'Daily plan'} · {activePlan.targetCalories} kcal/day · Click to view
              </Typography>
            </Box>
            <Chip label={categoryConfig[activePlan.category as PlanCategory]?.label || activePlan.category} size="small" color="success" />
          </Box>
        </Paper>
      )}

      {generating && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress sx={{ borderRadius: 1 }} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
            AI is crafting your personalized meal plan...
          </Typography>
        </Box>
      )}

      {/* ═══════════ GENERATOR VIEW ═══════════ */}
      {view === 'generator' && !generating && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Category selection */}
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Choose Plan Type</Typography>
            <Grid container spacing={2}>
              {(Object.entries(categoryConfig) as [PlanCategory, typeof categoryConfig[PlanCategory]][]).map(([key, cfg]) => (
                <Grid item xs={6} sm={4} md={2.4} key={key}>
                  <Paper
                    variant="outlined"
                    onClick={() => setCategory(key)}
                    sx={{
                      p: 2, textAlign: 'center', cursor: 'pointer', borderRadius: 2,
                      borderColor: category === key ? cfg.color : 'divider',
                      borderWidth: category === key ? 2 : 1,
                      bgcolor: category === key ? `${cfg.color}08` : 'transparent',
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: cfg.color, bgcolor: `${cfg.color}05` },
                    }}
                  >
                    <Box sx={{ color: cfg.color, mb: 0.5 }}>{cfg.icon}</Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>{cfg.label}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>{cfg.desc}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Personalization */}
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Personalization</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Plan Duration</InputLabel>
                  <Select value={planType} onChange={(e) => setPlanType(e.target.value as any)} label="Plan Duration">
                    <MenuItem value="daily">Daily (1 day)</MenuItem>
                    <MenuItem value="weekly">Weekly (7 days)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Fitness Goal</InputLabel>
                  <Select value={fitnessGoal} onChange={(e) => setFitnessGoal(e.target.value)} label="Fitness Goal">
                    <MenuItem value="lose_weight">Lose Weight</MenuItem>
                    <MenuItem value="gain_weight">Gain Weight</MenuItem>
                    <MenuItem value="maintain">Maintain Weight</MenuItem>
                    <MenuItem value="build_muscle">Build Muscle</MenuItem>
                    <MenuItem value="improve_health">Improve Health</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Activity Level</InputLabel>
                  <Select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} label="Activity Level">
                    <MenuItem value="sedentary">Sedentary</MenuItem>
                    <MenuItem value="lightly_active">Lightly Active</MenuItem>
                    <MenuItem value="moderately_active">Moderately Active</MenuItem>
                    <MenuItem value="very_active">Very Active</MenuItem>
                    <MenuItem value="athlete">Athlete</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Diet Type</InputLabel>
                  <Select value={dietType} onChange={(e) => setDietType(e.target.value)} label="Diet Type">
                    <MenuItem value="standard">Standard</MenuItem>
                    <MenuItem value="vegetarian">Vegetarian</MenuItem>
                    <MenuItem value="vegan">Vegan</MenuItem>
                    <MenuItem value="keto">Keto</MenuItem>
                    <MenuItem value="paleo">Paleo</MenuItem>
                    <MenuItem value="mediterranean">Mediterranean</MenuItem>
                    <MenuItem value="low_carb">Low Carb</MenuItem>
                    <MenuItem value="high_protein">High Protein</MenuItem>
                    <MenuItem value="gluten_free">Gluten Free</MenuItem>
                    <MenuItem value="dairy_free">Dairy Free</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Health conditions (shown only for health_condition category) */}
            {category === 'health_condition' && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Health Conditions</Typography>
                <Autocomplete
                  multiple
                  options={HEALTH_CONDITIONS}
                  value={healthConditions}
                  onChange={(_, v) => setHealthConditions(v)}
                  size="small"
                  renderInput={(params) => <TextField {...params} placeholder="Select or type conditions" />}
                  freeSolo
                />
              </Box>
            )}

            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    multiple
                    options={COMMON_ALLERGIES}
                    value={allergies}
                    onChange={(_, v) => setAllergies(v)}
                    size="small"
                    renderInput={(params) => <TextField {...params} label="Allergies & Intolerances" placeholder="Add allergy" />}
                    freeSolo
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    multiple
                    options={CUISINES}
                    value={preferences}
                    onChange={(_, v) => setPreferences(v)}
                    size="small"
                    renderInput={(params) => <TextField {...params} label="Cuisine Preferences" placeholder="Add preference" />}
                    freeSolo
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Calorie & Macro Targets */}
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Calorie & Macro Targets</Typography>
              <Tooltip title="Leave at 0 to let AI calculate optimal values based on your goals">
                <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              </Tooltip>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth size="small" type="number" label="Daily Calories"
                  value={targetCalories} onChange={(e) => setTargetCalories(+e.target.value)}
                  inputProps={{ min: 0, step: 50 }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth size="small" type="number" label="Protein (g)"
                  value={targetProtein} onChange={(e) => setTargetProtein(+e.target.value)}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth size="small" type="number" label="Carbs (g)"
                  value={targetCarbs} onChange={(e) => setTargetCarbs(+e.target.value)}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth size="small" type="number" label="Fat (g)"
                  value={targetFat} onChange={(e) => setTargetFat(+e.target.value)}
                  inputProps={{ min: 0 }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Generate button */}
          <Button
            variant="contained"
            size="large"
            startIcon={<AutoAwesomeIcon />}
            onClick={handleGenerate}
            disabled={generating}
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontWeight: 700,
              fontSize: 16,
              background: '#f57c00',
              '&:hover': { background: '#ef6c00' },
            }}
          >
            Generate {planType === 'weekly' ? 'Weekly' : 'Daily'} Meal Plan with AI
          </Button>
        </Box>
      )}

      {/* ═══════════ PLAN VIEW ═══════════ */}
      {view === 'plan' && currentPlanDays.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Plan header actions */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            {viewingPlan && !viewingPlan.active && (
              <Button size="small" variant="outlined" color="success" startIcon={<CheckCircleIcon />} onClick={() => handleActivate(viewingPlan._id)}>
                Set as Active
              </Button>
            )}
            {viewingPlan?.active && (
              <Chip icon={<StarIcon />} label="Active Plan" color="success" size="small" />
            )}
            <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={() => { setAdjustContext(''); setAdjustResult(''); setAdjustDialogOpen(true); }}>
              AI Adjust
            </Button>
            <Button size="small" variant="outlined" startIcon={<AutoAwesomeIcon />} onClick={() => { setView('generator'); setViewingPlan(null); setGeneratedPlan(null); }}>
              Generate New
            </Button>
          </Box>

          {/* Plan view tabs */}
          <Paper variant="outlined" sx={{ borderRadius: 2 }}>
            <Tabs
              value={planViewTab}
              onChange={(_, v) => setPlanViewTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider', px: 1 }}
            >
              <Tab icon={<CalendarTodayIcon sx={{ fontSize: 16, color: '#f59e0b' }} />} iconPosition="start" label="Meal Schedule" sx={{ fontSize: 13 }} />
              <Tab icon={<MenuBookIcon sx={{ fontSize: 16, color: '#38bdf8' }} />} iconPosition="start" label="Prep Guide" sx={{ fontSize: 13 }} />
              <Tab icon={<ShoppingCartIcon sx={{ fontSize: 16, color: '#a78bfa' }} />} iconPosition="start" label="Shopping List" sx={{ fontSize: 13 }} />
              <Tab icon={<AutoAwesomeIcon sx={{ fontSize: 16, color: '#7c4dff' }} />} iconPosition="start" label="AI Insights" sx={{ fontSize: 13 }} />
            </Tabs>

            <Box sx={{ p: 2 }}>
              {/* TAB 0: Meal Schedule */}
              {planViewTab === 0 && (
                <>
                  {/* Day tabs */}
                  {currentPlanDays.length > 1 && (
                    <Tabs
                      value={planDayTab}
                      onChange={(_, v) => setPlanDayTab(v)}
                      variant="scrollable"
                      scrollButtons="auto"
                      sx={{ mb: 2, bgcolor: 'action.hover', borderRadius: 1, minHeight: 36 }}
                    >
                      {currentPlanDays.map((day, i) => (
                        <Tab key={i} label={day.day} sx={{ fontSize: 12, minHeight: 36, py: 0.5 }} />
                      ))}
                    </Tabs>
                  )}

                  {currentPlanDays[planDayTab] && (() => {
                    const day = currentPlanDays[planDayTab];
                    return (
                      <>
                        {/* Day summary */}
                        <Grid container spacing={1.5} sx={{ mb: 2 }}>
                          {[
                            { label: 'Calories', value: day.totalCalories, unit: 'kcal', color: '#f44336' },
                            { label: 'Protein', value: day.totalProteinG, unit: 'g', color: '#2196f3' },
                            { label: 'Carbs', value: day.totalCarbsG, unit: 'g', color: '#ff9800' },
                            { label: 'Fat', value: day.totalFatG, unit: 'g', color: '#9c27b0' },
                          ].map((s) => (
                            <Grid item xs={3} key={s.label}>
                              <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 2, borderColor: `${s.color}30` }}>
                                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: s.color, lineHeight: 1.2 }}>
                                  {Math.round(s.value)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">{s.unit}</Typography>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>

                        {/* Meals */}
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            {renderMealSection('Breakfast', day.breakfast, 'breakfast')}
                            {renderMealSection('Lunch', day.lunch, 'lunch')}
                          </Grid>
                          <Grid item xs={12} md={6}>
                            {renderMealSection('Dinner', day.dinner, 'dinner')}
                            {renderMealSection('Snacks', day.snacks, 'snacks')}
                          </Grid>
                        </Grid>
                      </>
                    );
                  })()}
                </>
              )}

              {/* TAB 1: Prep Guide */}
              {planViewTab === 1 && (
                <Box sx={{ '& h1,& h2,& h3': { fontWeight: 700 }, '& p': { mb: 1 }, '& ul,& ol': { pl: 2 } }}>
                  {currentPrepGuide ? (
                    <ReactMarkdown>{currentPrepGuide}</ReactMarkdown>
                  ) : (
                    <Typography color="text.secondary">No prep guide available for this plan.</Typography>
                  )}
                </Box>
              )}

              {/* TAB 2: Shopping List */}
              {planViewTab === 2 && (
                <Box>
                  {currentShoppingList.length > 0 ? (
                    <FormGroup>
                      {currentShoppingList.map((item, i) => (
                        <FormControlLabel
                          key={i}
                          control={<Checkbox size="small" />}
                          label={<Typography variant="body2">{item}</Typography>}
                          sx={{ '& .MuiFormControlLabel-label': { fontSize: 14 } }}
                        />
                      ))}
                    </FormGroup>
                  ) : (
                    <Typography color="text.secondary">No shopping list available.</Typography>
                  )}
                </Box>
              )}

              {/* TAB 3: AI Notes */}
              {planViewTab === 3 && (
                <Box sx={{ '& h1,& h2,& h3': { fontWeight: 700 }, '& p': { mb: 1 } }}>
                  {currentAiNotes ? (
                    <ReactMarkdown>{currentAiNotes}</ReactMarkdown>
                  ) : (
                    <Typography color="text.secondary">No AI notes for this plan.</Typography>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Box>
      )}

      {/* ═══════════ HISTORY VIEW ═══════════ */}
      {view === 'history' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {savedPlans.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed', borderRadius: 2 }}>
              <MenuBookIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
              <Typography color="text.secondary">No saved meal plans yet</Typography>
              <Typography variant="caption" color="text.secondary">Generate your first plan with AI</Typography>
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" size="small" startIcon={<AutoAwesomeIcon />} onClick={() => setView('generator')}>
                  Create Plan
                </Button>
              </Box>
            </Paper>
          ) : (
            savedPlans.map((plan) => (
              <Paper key={plan._id} variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: plan.active ? '#4caf50' : 'divider', borderWidth: plan.active ? 2 : 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box
                    sx={{ flex: 1, cursor: 'pointer' }}
                    onClick={() => { setViewingPlan(plan); setPlanDayTab(0); setPlanViewTab(0); setView('plan'); }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{plan.title}</Typography>
                      {plan.active && <Chip icon={<StarIcon />} label="Active" color="success" size="small" />}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label={categoryConfig[plan.category as PlanCategory]?.label || plan.category} size="small" variant="outlined" />
                      <Chip label={plan.planType === 'weekly' ? '7 days' : '1 day'} size="small" variant="outlined" />
                      <Chip label={`${plan.targetCalories || '?'} kcal`} size="small" variant="outlined" />
                      <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                        Created {new Date(plan.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {!plan.active && (
                      <Tooltip title="Set as active">
                        <IconButton size="small" color="success" onClick={() => handleActivate(plan._id)}>
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete plan">
                      <IconButton size="small" color="error" onClick={() => handleDeletePlan(plan._id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Paper>
            ))
          )}
        </Box>
      )}

      {/* ═══════════ SUBSTITUTION DIALOG ═══════════ */}
      <Dialog open={subDialogOpen} onClose={() => setSubDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SwapHorizIcon sx={{ color: '#ff9800' }} />
            Meal Substitution
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Find alternatives for: <strong>{subMealName}</strong>
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Reason</InputLabel>
            <Select value={subReason} onChange={(e) => setSubReason(e.target.value)} label="Reason">
              <MenuItem value="preference">Taste preference</MenuItem>
              <MenuItem value="allergy">Allergy / intolerance</MenuItem>
              <MenuItem value="unavailable">Ingredients unavailable</MenuItem>
              <MenuItem value="budget">Budget-friendly option</MenuItem>
              <MenuItem value="quicker">Quicker to prepare</MenuItem>
            </Select>
          </FormControl>

          {!subLoading && subResults.length === 0 && (
            <Button fullWidth variant="contained" startIcon={<AutoAwesomeIcon />} onClick={handleSubstitute}>
              Find Alternatives
            </Button>
          )}

          {subLoading && <LinearProgress sx={{ my: 2 }} />}

          {subResults.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Alternatives:</Typography>
              {subResults.map((alt, i) => (
                <Card key={i} variant="outlined" sx={{ mb: 1.5, borderRadius: 2 }}>
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{alt.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{alt.description}</Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
                      <Chip label={`${alt.calories} kcal`} size="small" />
                      <Typography variant="caption" sx={{ color: '#2196f3' }}>P: {alt.proteinG}g</Typography>
                      <Typography variant="caption" sx={{ color: '#ff9800' }}>C: {alt.carbsG}g</Typography>
                      <Typography variant="caption" sx={{ color: '#9c27b0' }}>F: {alt.fatG}g</Typography>
                    </Box>
                    {alt.ingredients?.length > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {alt.portionSize} · {alt.prepTime} · {alt.ingredients.join(', ')}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ═══════════ AI ADJUST DIALOG ═══════════ */}
      <Dialog open={adjustDialogOpen} onClose={() => setAdjustDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon sx={{ color: '#2196f3' }} />
            AI Plan Adjustment
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Tell the AI what changed and get adjusted recommendations.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            size="small"
            label="What should the AI adjust for?"
            placeholder="e.g., I missed breakfast today, had an intense leg workout, slept poorly last night, lost 2kg this week..."
            value={adjustContext}
            onChange={(e) => setAdjustContext(e.target.value)}
            sx={{ mb: 2 }}
          />

          {!adjustLoading && !adjustResult && (
            <Button
              fullWidth variant="contained" startIcon={<AutoAwesomeIcon />}
              onClick={handleAdjust} disabled={!adjustContext.trim()}
            >
              Get AI Recommendations
            </Button>
          )}

          {adjustLoading && <LinearProgress sx={{ my: 2 }} />}

          {adjustResult && (
            <Paper variant="outlined" sx={{ p: 2, mt: 1, borderRadius: 2, maxHeight: 300, overflow: 'auto', '& h1,& h2,& h3': { fontWeight: 700 }, '& p': { mb: 1 } }}>
              <ReactMarkdown>{adjustResult}</ReactMarkdown>
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdjustDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
