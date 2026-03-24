import { useEffect, useMemo, useState } from 'react';
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
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ScaleIcon from '@mui/icons-material/Scale';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import { dietaryApi } from '@/lib/api';
import { errorLogger } from '@/lib/errorLogger';
import { useAuthStore } from '@/store/authStore';
import { useDietaryProfileStore } from '@/store/dietaryProfileStore';

interface DailyNutrition {
  date: string;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalFiberG?: number;
  waterMl: number;
  mealsLogged: number;
}

interface MealLog {
  _id: string;
  mealType: string;
  name: string;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  loggedAt: string;
}

interface Supplement {
  _id: string;
  name: string;
  taken: boolean;
  timeOfDay?: string;
}

interface MealPlan {
  _id: string;
  title: string;
  planType?: string;
  category?: string;
  dietType?: string;
  targetCalories?: number;
  targetProteinG?: number;
  targetCarbsG?: number;
  targetFatG?: number;
  shoppingList?: string[];
  healthConditions?: string[];
  allergies?: string[];
  preferences?: string[];
  days?: Array<{ meals?: unknown[] }>;
  active?: boolean;
  createdAt?: string;
}

interface GroceryItem {
  checked?: boolean;
  completed?: boolean;
  estimatedPrice?: number;
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
}

interface GroceryList {
  _id: string;
  title: string;
  status?: string;
  items?: GroceryItem[];
  mealPlanId?: string;
  updatedAt?: string;
}

interface DietaryProfileApi {
  dailyCalorieTarget?: number;
  dailyProteinTargetG?: number;
  dailyCarbsTargetG?: number;
  dailyFatTargetG?: number;
  dailyWaterTargetMl?: number;
  goal?: string;
  dietType?: string;
  allergies?: string[];
  restrictions?: string[];
  preferredCuisines?: string[];
  mealsPerDay?: number;
}

interface DietaryGoal {
  _id?: string;
  title?: string;
  name?: string;
  current?: number;
  target?: number;
  completed?: boolean;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function formatDateLabel(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getWeekAgo() {
  return new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
}

function mealTypeLabel(type: string) {
  const labels: Record<string, string> = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
    snacks: 'Snacks',
  };
  return labels[type] ?? type;
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
        borderColor: 'divider',
        ...(onClick && {
          cursor: 'pointer',
          '&:hover': { borderColor: '#bdbdbd', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
        }),
      }}
    >
      <Avatar sx={{ bgcolor: color, width: 42, height: 42 }}>{icon}</Avatar>
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

function ProgressRow({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const pct = target > 0 ? clamp((value / target) * 100) : 0;
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {Math.round(value)} / {Math.round(target)}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 8,
          borderRadius: 999,
          bgcolor: 'rgba(0,0,0,0.06)',
          '& .MuiLinearProgress-bar': { bgcolor: color },
        }}
      />
    </Box>
  );
}

export default function DietaryDashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const userId = user?.id || 'anonymous';

  const storedGoal = useDietaryProfileStore((s) => s.goal);
  const storedDietType = useDietaryProfileStore((s) => s.dietType);
  const storedCalorieTarget = useDietaryProfileStore((s) => s.dailyCalorieTarget);
  const storedProteinTarget = useDietaryProfileStore((s) => s.dailyProteinTargetG);
  const storedCarbsTarget = useDietaryProfileStore((s) => s.dailyCarbsTargetG);
  const storedFatTarget = useDietaryProfileStore((s) => s.dailyFatTargetG);
  const storedWaterTarget = useDietaryProfileStore((s) => s.dailyWaterTargetMl);
  const storedAllergies = useDietaryProfileStore((s) => s.allergies);
  const storedRestrictions = useDietaryProfileStore((s) => s.restrictions);
  const storedPreferredCuisines = useDietaryProfileStore((s) => s.preferredCuisines);
  const storedMealsPerDay = useDietaryProfileStore((s) => s.mealsPerDay);
  const onboardingComplete = useDietaryProfileStore((s) => s.onboardingComplete);

  const [loading, setLoading] = useState(true);
  const [todayNutrition, setTodayNutrition] = useState<DailyNutrition | null>(null);
  const [weeklyData, setWeeklyData] = useState<DailyNutrition[]>([]);
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [activePlan, setActivePlan] = useState<MealPlan | null>(null);
  const [groceryLists, setGroceryLists] = useState<GroceryList[]>([]);
  const [profileApi, setProfileApi] = useState<DietaryProfileApi | null>(null);
  const [goals, setGoals] = useState<DietaryGoal[]>([]);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    let active = true;

    const fetchDashboard = async () => {
      setLoading(true);
      const today = getToday();
      const weekStart = getWeekAgo();

      try {
        const [
          todayRes,
          weekRes,
          mealsRes,
          supplementsRes,
          mealPlansRes,
          activePlanRes,
          groceryRes,
          profileRes,
          goalsRes,
          statsRes,
        ] = await Promise.all([
          dietaryApi.getDailyNutrition(today, userId),
          dietaryApi.getDailyNutritionRange(weekStart, today, userId),
          dietaryApi.getMealLogs({ startDate: today, endDate: today, limit: 100 }, userId),
          dietaryApi.getSupplements({ startDate: today, endDate: today }, userId),
          dietaryApi.getMealPlans(userId),
          dietaryApi.getActivePlan(userId).catch(() => ({ data: null })),
          dietaryApi.getGroceryLists(userId),
          dietaryApi.getProfile(userId).catch(() => ({ data: null })),
          dietaryApi.getGoals(userId).catch(() => ({ data: null })),
          dietaryApi.getStats(userId).catch(() => ({ data: null })),
        ]);

        if (!active) return;

        setTodayNutrition((todayRes.data?.data ?? todayRes.data ?? null) as DailyNutrition | null);
        setWeeklyData((weekRes.data?.data ?? weekRes.data ?? []) as DailyNutrition[]);
        setMeals((mealsRes.data?.data?.meals ?? mealsRes.data?.meals ?? []) as MealLog[]);
        setSupplements((supplementsRes.data?.data?.supplements ?? supplementsRes.data?.supplements ?? []) as Supplement[]);
        setMealPlans((mealPlansRes.data?.data ?? mealPlansRes.data ?? []) as MealPlan[]);
        setActivePlan((activePlanRes.data?.data ?? activePlanRes.data ?? null) as MealPlan | null);
        setGroceryLists((groceryRes.data?.data ?? groceryRes.data ?? []) as GroceryList[]);
        setProfileApi((profileRes.data?.data ?? profileRes.data ?? null) as DietaryProfileApi | null);
        setGoals((goalsRes.data?.data ?? goalsRes.data ?? []) as DietaryGoal[]);
        setStats((statsRes.data?.data ?? statsRes.data ?? null) as Record<string, unknown> | null);
      } catch (error) {
        errorLogger.error('Failed to load dietary dashboard', 'DietaryDashboard', {
          meta: { error: String(error), userId },
        });
        if (!active) return;
        setTodayNutrition(null);
        setWeeklyData([]);
        setMeals([]);
        setSupplements([]);
        setMealPlans([]);
        setActivePlan(null);
        setGroceryLists([]);
        setGoals([]);
        setStats(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDashboard();
    return () => {
      active = false;
    };
  }, [userId]);

  const targets = {
    calories: profileApi?.dailyCalorieTarget || storedCalorieTarget || 2000,
    protein: profileApi?.dailyProteinTargetG || storedProteinTarget || 150,
    carbs: profileApi?.dailyCarbsTargetG || storedCarbsTarget || 250,
    fat: profileApi?.dailyFatTargetG || storedFatTarget || 65,
    water: profileApi?.dailyWaterTargetMl || storedWaterTarget || 2500,
    mealsPerDay: profileApi?.mealsPerDay || storedMealsPerDay || 3,
  };

  const today = todayNutrition || {
    date: getToday(),
    totalCalories: 0,
    totalProteinG: 0,
    totalCarbsG: 0,
    totalFatG: 0,
    totalFiberG: 0,
    waterMl: 0,
    mealsLogged: meals.length,
  };

  const calorieProgress = clamp((today.totalCalories / Math.max(targets.calories, 1)) * 100);
  const proteinProgress = clamp((today.totalProteinG / Math.max(targets.protein, 1)) * 100);
  const carbProgress = clamp((today.totalCarbsG / Math.max(targets.carbs, 1)) * 100);
  const fatProgress = clamp((today.totalFatG / Math.max(targets.fat, 1)) * 100);
  const waterProgress = clamp((today.waterMl / Math.max(targets.water, 1)) * 100);
  const mealCadenceProgress = clamp((Math.max(today.mealsLogged, meals.length) / Math.max(targets.mealsPerDay, 1)) * 100);

  const dailyScore = average([
    calorieProgress,
    proteinProgress,
    carbProgress,
    fatProgress,
    waterProgress,
    mealCadenceProgress,
  ]);

  const weeklyAverage = useMemo(() => {
    if (weeklyData.length === 0) {
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        water: 0,
        mealsLogged: 0,
      };
    }
    return {
      calories: Math.round(weeklyData.reduce((sum, day) => sum + (day.totalCalories || 0), 0) / weeklyData.length),
      protein: Math.round(weeklyData.reduce((sum, day) => sum + (day.totalProteinG || 0), 0) / weeklyData.length),
      carbs: Math.round(weeklyData.reduce((sum, day) => sum + (day.totalCarbsG || 0), 0) / weeklyData.length),
      fat: Math.round(weeklyData.reduce((sum, day) => sum + (day.totalFatG || 0), 0) / weeklyData.length),
      water: Math.round(weeklyData.reduce((sum, day) => sum + (day.waterMl || 0), 0) / weeklyData.length),
      mealsLogged: Math.round(weeklyData.reduce((sum, day) => sum + (day.mealsLogged || 0), 0) / weeklyData.length),
    };
  }, [weeklyData]);

  const weeklyConsistencyScore = average([
    clamp((weeklyAverage.calories / Math.max(targets.calories, 1)) * 100),
    clamp((weeklyAverage.protein / Math.max(targets.protein, 1)) * 100),
    clamp((weeklyAverage.carbs / Math.max(targets.carbs, 1)) * 100),
    clamp((weeklyAverage.fat / Math.max(targets.fat, 1)) * 100),
    clamp((weeklyAverage.water / Math.max(targets.water, 1)) * 100),
  ]);

  const weeklyMomentum = weeklyData.length >= 2
    ? weeklyData[weeklyData.length - 1].totalCalories - weeklyData[0].totalCalories
    : 0;

  const mealTypeDistribution = ['breakfast', 'lunch', 'dinner', 'snack'].map((type) => ({
    type,
    count: meals.filter((meal) => meal.mealType === type).length,
  }));

  const mostDenseMeal = [...meals].sort((a, b) => (b.totalCalories || 0) - (a.totalCalories || 0))[0] ?? null;
  const highestProteinMeal = [...meals].sort((a, b) => (b.totalProteinG || 0) - (a.totalProteinG || 0))[0] ?? null;

  const supplementTakenCount = supplements.filter((supplement) => supplement.taken).length;
  const supplementAdherence = supplements.length > 0 ? clamp((supplementTakenCount / supplements.length) * 100) : 0;

  const grocerySummary = useMemo(() => {
    const activeLists = groceryLists.filter((list) => list.status !== 'completed');
    const totalItems = groceryLists.reduce((sum, list) => sum + (list.items?.length ?? 0), 0);
    const completedItems = groceryLists.reduce(
      (sum, list) =>
        sum +
        (list.items?.filter((item) => item.checked || item.completed).length ?? 0),
      0,
    );
    const estimatedCost = groceryLists.reduce(
      (sum, list) => sum + (list.items?.reduce((itemSum, item) => itemSum + (item.estimatedPrice || 0), 0) ?? 0),
      0,
    );
    const calories = groceryLists.reduce(
      (sum, list) => sum + (list.items?.reduce((itemSum, item) => itemSum + (item.calories || 0), 0) ?? 0),
      0,
    );
    return {
      activeLists,
      totalItems,
      completedItems,
      estimatedCost,
      calories,
      completionRate: totalItems > 0 ? clamp((completedItems / totalItems) * 100) : 0,
    };
  }, [groceryLists]);

  const activePlanMealCount = activePlan?.days?.reduce((sum, day) => sum + (day.meals?.length ?? 0), 0) ?? 0;
  const planCoverageScore = activePlan
    ? average([
        clamp((((activePlan.targetCalories ?? targets.calories) / Math.max(targets.calories, 1)) * 100)),
        clamp((((activePlan.targetProteinG ?? targets.protein) / Math.max(targets.protein, 1)) * 100)),
        clamp((((activePlan.targetCarbsG ?? targets.carbs) / Math.max(targets.carbs, 1)) * 100)),
        clamp((((activePlan.targetFatG ?? targets.fat) / Math.max(targets.fat, 1)) * 100)),
      ])
    : 0;

  const preferenceSignals = [
    (profileApi?.goal || storedGoal) ? 1 : 0,
    (profileApi?.dietType || storedDietType) ? 1 : 0,
    (profileApi?.allergies?.length || storedAllergies.length) > 0 ? 1 : 0,
    (profileApi?.restrictions?.length || storedRestrictions.length) > 0 ? 1 : 0,
    (profileApi?.preferredCuisines?.length || storedPreferredCuisines.length) > 0 ? 1 : 0,
    onboardingComplete ? 1 : 0,
  ];
  const profileReadiness = Math.round((preferenceSignals.reduce((sum, value) => sum + value, 0) / preferenceSignals.length) * 100);

  const completedGoals = goals.filter((goal) => goal.completed).length;
  const goalCompletionRate = goals.length > 0 ? clamp((completedGoals / goals.length) * 100) : 0;

  const insightCards = useMemo(() => {
    const items: { title: string; body: string; tone: 'success' | 'warning' | 'info' }[] = [];

    if (dailyScore >= 80) {
      items.push({
        title: 'Daily nutrition is well aligned',
        body: `Today scores ${dailyScore}% against your calorie, macro, hydration, and meal cadence targets.`,
        tone: 'success',
      });
    } else if (dailyScore < 55) {
      items.push({
        title: 'Today is under target',
        body: `The current daily nutrition score is ${dailyScore}%. Meal completion or hydration is the fastest lever to improve it.`,
        tone: 'warning',
      });
    }

    if (!activePlan) {
      items.push({
        title: 'No active meal plan is guiding execution',
        body: 'Generate or activate a meal plan so calories, macros, and grocery preparation stay coordinated through the week.',
        tone: 'info',
      });
    } else {
      items.push({
        title: 'Meal plan is active',
        body: `${activePlan.title} is active with ${activePlan.days?.length ?? 0} day${(activePlan.days?.length ?? 0) !== 1 ? 's' : ''} planned and ${activePlanMealCount} scheduled meals.`,
        tone: 'success',
      });
    }

    if (supplements.length > 0) {
      items.push({
        title: 'Supplement compliance is visible',
        body: `${supplementTakenCount} of ${supplements.length} supplements are marked taken today, for ${formatPercent(supplementAdherence)} adherence.`,
        tone: supplementAdherence >= 75 ? 'success' : 'warning',
      });
    }

    if (grocerySummary.activeLists.length > 0) {
      items.push({
        title: 'Grocery execution is in progress',
        body: `${grocerySummary.completedItems} of ${grocerySummary.totalItems} grocery items are complete across ${grocerySummary.activeLists.length} active list${grocerySummary.activeLists.length !== 1 ? 's' : ''}.`,
        tone: grocerySummary.completionRate >= 60 ? 'success' : 'info',
      });
    }

    if (profileReadiness < 70) {
      items.push({
        title: 'Profile depth can improve personalization',
        body: `Your dietary profile readiness is ${profileReadiness}%. Add goals, diet type, allergies, and cuisine preferences to sharpen planning quality.`,
        tone: 'info',
      });
    }

    return items.slice(0, 5);
  }, [activePlan, activePlanMealCount, dailyScore, grocerySummary.activeLists.length, grocerySummary.completedItems, grocerySummary.completionRate, grocerySummary.totalItems, profileReadiness, supplementAdherence, supplementTakenCount, supplements.length]);

  const weeklyBars = weeklyData.map((day) => ({
    ...day,
    label: formatDateLabel(day.date),
    pct: clamp((day.totalCalories / Math.max(targets.calories, 1)) * 100),
  }));

  const profileChips = [
    profileApi?.goal || storedGoal,
    profileApi?.dietType || storedDietType,
    ...(profileApi?.allergies ?? storedAllergies),
    ...(profileApi?.restrictions ?? storedRestrictions),
  ].filter(Boolean) as string[];

  const totalMealsLoggedThisWeek = weeklyData.reduce((sum, day) => sum + (day.mealsLogged || 0), 0);
  const statsScore = typeof stats?.score === 'number' ? Math.round(stats.score as number) : null;

  return (
    <Box sx={{ flex: 1, px: 3, py: 3, overflow: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            Dietary Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cross-module dietary overview built from meal logs, nutrition tracking, supplements, active meal plans, grocery execution, and your dietary profile.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<RestaurantMenuIcon />} onClick={() => navigate('/app/dietary/meals')}>
            Meal Log
          </Button>
          <Button variant="outlined" startIcon={<TrackChangesIcon />} onClick={() => navigate('/app/dietary/nutrition')}>
            Nutrition Tracker
          </Button>
          <Button variant="outlined" startIcon={<AutoAwesomeIcon />} onClick={() => navigate('/app/dietary/meal-planner')}>
            Meal Planner
          </Button>
          <Button variant="contained" startIcon={<ShoppingCartIcon />} sx={{ bgcolor: '#2e7d32' }} onClick={() => navigate('/app/dietary/grocery')}>
            Grocery
          </Button>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 999, height: 6 }} />}

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<DashboardIcon sx={{ color: '#fff', fontSize: 20 }} />}
            label="Daily Nutrition Score"
            value={formatPercent(dailyScore)}
            sub={`${today.totalCalories} kcal · ${today.mealsLogged || meals.length} meals today`}
            color="#455a64"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingUpIcon sx={{ color: '#fff', fontSize: 20 }} />}
            label="Weekly Consistency"
            value={formatPercent(weeklyConsistencyScore)}
            sub={`${totalMealsLoggedThisWeek} meals logged across 7 days`}
            color="#1e88e5"
            onClick={() => navigate('/app/dietary/nutrition')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<EventNoteIcon sx={{ color: '#fff', fontSize: 20 }} />}
            label="Meal Plans"
            value={mealPlans.length}
            sub={activePlan ? `${activePlan.title}` : 'No active plan'}
            color="#ef6c00"
            onClick={() => navigate('/app/dietary/meal-planner')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<ShoppingCartIcon sx={{ color: '#fff', fontSize: 20 }} />}
            label="Grocery Readiness"
            value={formatPercent(grocerySummary.completionRate)}
            sub={`${grocerySummary.completedItems}/${grocerySummary.totalItems} items done`}
            color="#2e7d32"
            onClick={() => navigate('/app/dietary/grocery')}
          />
        </Grid>
      </Grid>

      <Grid container spacing={1.5}>
        <Grid item xs={12} lg={8}>
          <Grid container spacing={1.5}>
            <Grid item xs={12}>
              <SectionCard
                title="Daily Target Alignment"
                subtitle="Calories, macros, hydration, and meal cadence against profile targets"
                action={<Chip size="small" label={`${today.totalCalories} kcal logged`} color={dailyScore >= 80 ? 'success' : dailyScore >= 55 ? 'warning' : 'default'} />}
              >
                <ProgressRow label="Calories" value={today.totalCalories} target={targets.calories} color="#ef6c00" />
                <ProgressRow label="Protein (g)" value={today.totalProteinG} target={targets.protein} color="#1e88e5" />
                <ProgressRow label="Carbs (g)" value={today.totalCarbsG} target={targets.carbs} color="#8e24aa" />
                <ProgressRow label="Fat (g)" value={today.totalFatG} target={targets.fat} color="#00897b" />
                <ProgressRow label="Water (ml)" value={today.waterMl} target={targets.water} color="#039be5" />
                <ProgressRow label="Meals logged" value={today.mealsLogged || meals.length} target={targets.mealsPerDay} color="#6d4c41" />
              </SectionCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <SectionCard
                title="Meal Logging Insights"
                subtitle="How today is distributed across meal moments"
                action={<Button size="small" onClick={() => navigate('/app/dietary/meals')}>Open</Button>}
              >
                {mealTypeDistribution.map((entry) => {
                  const pct = meals.length > 0 ? clamp((entry.count / meals.length) * 100) : 0;
                  return (
                    <Box key={entry.type} sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          {mealTypeLabel(entry.type)}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {entry.count}
                        </Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: 999 }} />
                    </Box>
                  );
                })}

                <Divider sx={{ my: 1.5 }} />

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Highest-calorie meal
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {mostDenseMeal ? `${mostDenseMeal.name} · ${mostDenseMeal.totalCalories} kcal` : 'No meals logged today'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, mb: 1 }}>
                  Highest-protein meal
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {highestProteinMeal ? `${highestProteinMeal.name} · ${highestProteinMeal.totalProteinG}g protein` : 'No protein data yet'}
                </Typography>
              </SectionCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <SectionCard
                title="Weekly Trend"
                subtitle="Calories tracked over the last 7 days"
                action={<Chip size="small" label={weeklyMomentum >= 0 ? `+${weeklyMomentum} kcal` : `${weeklyMomentum} kcal`} />}
              >
                {weeklyBars.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Weekly nutrition history will appear after meal and nutrition logs are created.
                  </Typography>
                ) : (
                  weeklyBars.map((day) => (
                    <Box key={day.date} sx={{ mb: 1.25 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, gap: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {day.label}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {day.totalCalories} kcal
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={day.pct}
                        sx={{
                          height: 10,
                          borderRadius: 999,
                          bgcolor: 'rgba(0,0,0,0.06)',
                          '& .MuiLinearProgress-bar': { bgcolor: '#fb8c00' },
                        }}
                      />
                    </Box>
                  ))
                )}
              </SectionCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <SectionCard
                title="Meal Planning Control"
                subtitle="How well active planning maps to your targets"
                action={<Button size="small" onClick={() => navigate('/app/dietary/meal-planner')}>Manage</Button>}
              >
                {activePlan ? (
                  <>
                    <Typography variant="body1" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {activePlan.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      {(activePlan.days?.length ?? 0)} planned days · {activePlanMealCount} scheduled meals · {formatPercent(planCoverageScore)} target fit
                    </Typography>
                    <ProgressRow label="Plan calories" value={activePlan.targetCalories ?? 0} target={targets.calories} color="#ef6c00" />
                    <ProgressRow label="Plan protein" value={activePlan.targetProteinG ?? 0} target={targets.protein} color="#1e88e5" />
                    <ProgressRow label="Plan carbs" value={activePlan.targetCarbsG ?? 0} target={targets.carbs} color="#8e24aa" />
                    <ProgressRow label="Plan fat" value={activePlan.targetFatG ?? 0} target={targets.fat} color="#00897b" />
                  </>
                ) : (
                  <Alert severity="info">No active meal plan. Generate one to connect nutrition targets with grocery execution.</Alert>
                )}
              </SectionCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <SectionCard
                title="Grocery Pipeline"
                subtitle="Shopping completion, cost, and inventory momentum"
                action={<Button size="small" onClick={() => navigate('/app/dietary/grocery')}>Review</Button>}
              >
                <ProgressRow label="Items completed" value={grocerySummary.completedItems} target={Math.max(grocerySummary.totalItems, 1)} color="#2e7d32" />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  <Chip size="small" icon={<ShoppingCartIcon />} label={`${groceryLists.length} lists`} />
                  <Chip size="small" icon={<CheckCircleIcon />} label={`${grocerySummary.activeLists.length} active`} />
                  <Chip size="small" icon={<ScaleIcon />} label={`$${grocerySummary.estimatedCost.toFixed(0)} est.`} />
                  <Chip size="small" icon={<RestaurantIcon />} label={`${Math.round(grocerySummary.calories)} kcal stocked`} />
                </Box>
              </SectionCard>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Grid container spacing={1.5}>
            <Grid item xs={12}>
              <SectionCard
                title="AI Dietary Insights"
                subtitle="Priority signals synthesized from the submodules"
                action={statsScore !== null ? <Chip size="small" label={`Stats ${statsScore}`} /> : undefined}
              >
                {insightCards.length === 0 ? (
                  <Alert severity="info">Start logging meals or activating plans to unlock dietary insights.</Alert>
                ) : (
                  insightCards.map((insight) => (
                    <Alert key={insight.title} severity={insight.tone} sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.25 }}>
                        {insight.title}
                      </Typography>
                      <Typography variant="body2">{insight.body}</Typography>
                    </Alert>
                  ))
                )}
              </SectionCard>
            </Grid>

            <Grid item xs={12}>
              <SectionCard
                title="Supplement Adherence"
                subtitle="Tracked directly from today’s supplement entries"
                action={<Chip size="small" label={formatPercent(supplementAdherence)} color={supplementAdherence >= 75 ? 'success' : 'default'} />}
              >
                <ProgressRow label="Taken today" value={supplementTakenCount} target={Math.max(supplements.length, 1)} color="#7b1fa2" />
                {supplements.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No supplements are tracked for today.
                  </Typography>
                ) : (
                  supplements.slice(0, 4).map((supplement) => (
                    <Box key={supplement._id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.75 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {supplement.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {supplement.timeOfDay || 'Scheduled today'}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        icon={supplement.taken ? <CheckCircleIcon /> : <WarningAmberIcon />}
                        label={supplement.taken ? 'Taken' : 'Pending'}
                        color={supplement.taken ? 'success' : 'default'}
                      />
                    </Box>
                  ))
                )}
              </SectionCard>
            </Grid>

            <Grid item xs={12}>
              <SectionCard
                title="Profile And Goals"
                subtitle="Personalization quality and goal tracking depth"
                action={<Chip size="small" label={formatPercent(profileReadiness)} />}
              >
                <ProgressRow label="Profile readiness" value={profileReadiness} target={100} color="#546e7a" />
                <ProgressRow label="Goal completion" value={goalCompletionRate} target={100} color="#00897b" />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  {profileChips.length > 0 ? (
                    profileChips.slice(0, 6).map((chip) => <Chip key={chip} size="small" label={chip} />)
                  ) : (
                    <Chip size="small" label="Profile details missing" />
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                  <Button size="small" variant="outlined" onClick={() => navigate('/app/dietary/profile')}>
                    Dietary Profile
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => navigate('/app/dietary/goals')}>
                    Goals
                  </Button>
                </Box>
              </SectionCard>
            </Grid>

            <Grid item xs={12}>
              <SectionCard title="Target Snapshot" subtitle="Current baseline used by the dashboard">
                <Box sx={{ display: 'grid', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">Calories</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{targets.calories} kcal</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">Protein</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{targets.protein} g</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">Carbs</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{targets.carbs} g</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">Fat</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{targets.fat} g</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">Water</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{targets.water} ml</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">Meals per day</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{targets.mealsPerDay}</Typography>
                  </Box>
                </Box>
              </SectionCard>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
