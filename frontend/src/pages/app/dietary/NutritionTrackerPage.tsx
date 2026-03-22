import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Tabs, Tab, Paper, Grid, Card, CardContent,
  Button, IconButton, TextField, LinearProgress, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, FormControl, InputLabel, Snackbar, Alert, Divider,
  Tooltip,
} from '@mui/material';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Legend,
} from 'recharts';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import MedicationIcon from '@mui/icons-material/Medication';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { dietaryApi } from '@/lib/api';
import { errorLogger } from '@/lib/errorLogger';
import { useAuthStore } from '@/store/authStore';
import { analyzeNutritionLabel } from '@/lib/gemini';

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}
function getWeekAgo(): string {
  return new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
}
function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

const MACRO_COLORS = { protein: '#2196f3', carbs: '#ff9800', fat: '#9c27b0' };

interface DailyData {
  date: string;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalFiberG: number;
  waterMl: number;
  mealsLogged: number;
}

interface Supplement {
  _id: string;
  name: string;
  brand: string;
  date: string;
  dosage: number;
  dosageUnit: string;
  timeOfDay: string;
  notes: string;
  taken: boolean;
}

interface MealEntry {
  _id: string;
  mealType: string;
  name: string;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalFiberG: number;
  foods: { name: string; calories: number; proteinG: number; carbsG: number; fatG: number; fiberG: number; quantity: number }[];
  photoUrl?: string;
  loggedAt: string;
}

interface Profile {
  dailyCalorieTarget: number;
  dailyProteinTargetG: number;
  dailyCarbsTargetG: number;
  dailyFatTargetG: number;
  dailyWaterTargetMl: number;
}

export default function NutritionTrackerPage() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id || 'anonymous';

  const [tab, setTab] = useState(0);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  // Data
  const [todayNutrition, setTodayNutrition] = useState<DailyData | null>(null);
  const [weeklyData, setWeeklyData] = useState<DailyData[]>([]);
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Scan dialog
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);

  // Supplement dialog
  const [suppDialogOpen, setSuppDialogOpen] = useState(false);
  const [suppForm, setSuppForm] = useState({
    name: '', brand: '', dosage: 1, dosageUnit: 'capsule', timeOfDay: 'morning', notes: '',
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const weekStart = getWeekAgo();
      const [nutritionRes, weekRes, mealsRes, suppsRes, profileRes] = await Promise.all([
        dietaryApi.getDailyNutrition(selectedDate, userId),
        dietaryApi.getDailyNutritionRange(weekStart, getToday(), userId),
        dietaryApi.getMealLogs({ startDate: selectedDate, endDate: selectedDate, limit: 100 }, userId),
        dietaryApi.getSupplements({ startDate: selectedDate, endDate: selectedDate }, userId),
        dietaryApi.getProfile(userId),
      ]);
      setTodayNutrition(nutritionRes.data?.data ?? nutritionRes.data ?? null);
      setWeeklyData(weekRes.data?.data ?? weekRes.data ?? []);
      setMeals(mealsRes.data?.data?.meals ?? mealsRes.data?.meals ?? []);
      setSupplements(suppsRes.data?.data?.supplements ?? suppsRes.data?.supplements ?? []);
      setProfile(profileRes.data?.data ?? profileRes.data ?? null);
    } catch (err) {
      errorLogger.error('Failed to fetch nutrition data', 'NutritionTracker', { meta: { error: String(err), selectedDate } });
    } finally {
      setLoading(false);
    }
  }, [selectedDate, userId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Profile targets with defaults
  const targets: Profile = {
    dailyCalorieTarget: profile?.dailyCalorieTarget || 2000,
    dailyProteinTargetG: profile?.dailyProteinTargetG || 150,
    dailyCarbsTargetG: profile?.dailyCarbsTargetG || 250,
    dailyFatTargetG: profile?.dailyFatTargetG || 65,
    dailyWaterTargetMl: profile?.dailyWaterTargetMl || 2500,
  };

  const dn = todayNutrition || { totalCalories: 0, totalProteinG: 0, totalCarbsG: 0, totalFatG: 0, totalFiberG: 0, waterMl: 0, mealsLogged: 0 };
  const macroTotal = (dn.totalProteinG || 0) + (dn.totalCarbsG || 0) + (dn.totalFatG || 0);
  const macroSplit = macroTotal > 0
    ? [
        { name: 'Protein', value: Math.round((dn.totalProteinG / macroTotal) * 100), grams: dn.totalProteinG },
        { name: 'Carbs', value: Math.round((dn.totalCarbsG / macroTotal) * 100), grams: dn.totalCarbsG },
        { name: 'Fat', value: Math.round((dn.totalFatG / macroTotal) * 100), grams: dn.totalFatG },
      ]
    : [{ name: 'No data', value: 100, grams: 0 }];

  // Weekly aggregates
  const weekAvg = weeklyData.length > 0
    ? {
        calories: Math.round(weeklyData.reduce((s, d) => s + d.totalCalories, 0) / weeklyData.length),
        protein: Math.round(weeklyData.reduce((s, d) => s + d.totalProteinG, 0) / weeklyData.length),
        carbs: Math.round(weeklyData.reduce((s, d) => s + d.totalCarbsG, 0) / weeklyData.length),
        fat: Math.round(weeklyData.reduce((s, d) => s + d.totalFatG, 0) / weeklyData.length),
      }
    : null;

  // ─── Scan handler ───────────────────
  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true);
    setScanResult(null);
    try {
      const result = await analyzeNutritionLabel(file);
      setScanResult(result);
      setSnackbar({ open: true, message: `Detected: ${result?.productName || 'Unknown product'}`, severity: 'success' });
    } catch (err) {
      errorLogger.error('Nutrition label scan failed', 'NutritionTracker', { meta: { error: String(err) } });
      setSnackbar({ open: true, message: 'Scan failed — try a clearer image', severity: 'error' });
    } finally {
      setScanning(false);
    }
  };

  const logScannedItem = async () => {
    if (!scanResult) return;
    try {
      const payload = {
        mealType: 'snack',
        date: selectedDate,
        name: scanResult.productName || 'Scanned item',
        foods: [{
          name: scanResult.productName,
          calories: scanResult.calories || 0,
          proteinG: scanResult.proteinG || 0,
          carbsG: scanResult.carbsG || 0,
          fatG: scanResult.fatG || 0,
          fiberG: scanResult.fiberG || 0,
          servingSize: scanResult.servingSize || 100,
          servingUnit: scanResult.servingUnit || 'g',
          quantity: 1,
        }],
        totalCalories: scanResult.calories || 0,
        totalProteinG: scanResult.proteinG || 0,
        totalCarbsG: scanResult.carbsG || 0,
        totalFatG: scanResult.fatG || 0,
        totalFiberG: scanResult.fiberG || 0,
      };
      await dietaryApi.createMealLog(payload, userId);
      setSnackbar({ open: true, message: 'Logged from scan!', severity: 'success' });
      setScanDialogOpen(false);
      setScanResult(null);
      fetchAll();
    } catch (e) {
      errorLogger.error('Failed to log scanned item', 'NutritionTracker', { meta: { error: String(e) } });
      setSnackbar({ open: true, message: 'Failed to log', severity: 'error' });
    }
  };

  // ─── Supplement handlers ────────────
  const handleAddSupplement = async () => {
    if (!suppForm.name.trim()) return;
    try {
      await dietaryApi.createSupplement({ ...suppForm, date: selectedDate }, userId);
      setSuppDialogOpen(false);
      setSuppForm({ name: '', brand: '', dosage: 1, dosageUnit: 'capsule', timeOfDay: 'morning', notes: '' });
      setSnackbar({ open: true, message: 'Supplement added', severity: 'success' });
      fetchAll();
    } catch (e) {
      errorLogger.error('Failed to add supplement', 'NutritionTracker', { meta: { error: String(e) } });
      setSnackbar({ open: true, message: 'Failed to add supplement', severity: 'error' });
    }
  };

  const toggleSupplement = async (id: string) => {
    try {
      await dietaryApi.toggleSupplement(id, userId);
      setSupplements((prev) => prev.map((s) => s._id === id ? { ...s, taken: !s.taken } : s));
    } catch (e) {
      errorLogger.warn('Failed to toggle supplement', 'NutritionTracker', { meta: { error: String(e), id } });
      setSnackbar({ open: true, message: 'Failed to update', severity: 'error' });
    }
  };

  const deleteSupplement = async (id: string) => {
    try {
      await dietaryApi.deleteSupplement(id, userId);
      setSupplements((prev) => prev.filter((s) => s._id !== id));
    } catch (e) {
      errorLogger.warn('Failed to delete supplement', 'NutritionTracker', { meta: { error: String(e), id } });
      setSnackbar({ open: true, message: 'Failed to delete', severity: 'error' });
    }
  };

  // ─── Progress bar helper ────────────
  const ProgressBar = ({ value, max, color, label }: { value: number; max: number; color: string; label: string }) => {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
      <Box sx={{ mb: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>{label}</Typography>
          <Typography variant="caption" color="text.secondary">{Math.round(value)} / {max}</Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{ height: 8, borderRadius: 4, bgcolor: `${color}20`, '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 } }}
        />
      </Box>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <MonitorHeartIcon sx={{ fontSize: 28, color: '#4caf50' }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Nutrition Tracker</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField type="date" size="small" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} sx={{ width: 160 }} />
          <Tooltip title="Scan barcode / nutrition label">
            <IconButton color="primary" onClick={() => setScanDialogOpen(true)}>
              <QrCodeScannerIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, '& .MuiTab-root': { minHeight: 40, textTransform: 'none' } }}>
        <Tab icon={<TrendingUpIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Dashboard" />
        <Tab icon={<RestaurantIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Food Diary" />
        <Tab icon={<MedicationIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Supplements" />
      </Tabs>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* ═══════ TAB 0: DASHBOARD ═══════ */}
      {tab === 0 && !loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Top summary cards */}
          <Grid container spacing={2}>
            {[
              { label: 'Calories', value: dn.totalCalories, target: targets.dailyCalorieTarget, unit: 'kcal', color: '#f44336', icon: <LocalFireDepartmentIcon /> },
              { label: 'Protein', value: dn.totalProteinG, target: targets.dailyProteinTargetG, unit: 'g', color: '#2196f3' },
              { label: 'Carbs', value: dn.totalCarbsG, target: targets.dailyCarbsTargetG, unit: 'g', color: '#ff9800' },
              { label: 'Fat', value: dn.totalFatG, target: targets.dailyFatTargetG, unit: 'g', color: '#9c27b0' },
            ].map((item) => (
              <Grid item xs={6} sm={3} key={item.label}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2, borderColor: `${item.color}30` }}>
                  <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: item.color }}>{Math.round(item.value)}</Typography>
                  <Typography variant="caption" color="text.secondary">/ {item.target} {item.unit}</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((item.value / item.target) * 100, 100)}
                    sx={{ mt: 1, height: 4, borderRadius: 2, bgcolor: `${item.color}15`, '& .MuiLinearProgress-bar': { bgcolor: item.color } }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Goal vs Actual + Macro Pie */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Goal vs Actual</Typography>
                <ProgressBar label="Calories" value={dn.totalCalories} max={targets.dailyCalorieTarget} color="#f44336" />
                <ProgressBar label="Protein" value={dn.totalProteinG} max={targets.dailyProteinTargetG} color="#2196f3" />
                <ProgressBar label="Carbs" value={dn.totalCarbsG} max={targets.dailyCarbsTargetG} color="#ff9800" />
                <ProgressBar label="Fat" value={dn.totalFatG} max={targets.dailyFatTargetG} color="#9c27b0" />
                <ProgressBar label="Fiber" value={dn.totalFiberG || 0} max={30} color="#4caf50" />
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Macro Balance</Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={macroSplit}
                      cx="50%" cy="50%"
                      innerRadius={50} outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {macroSplit.map((_, i) => (
                        <Cell key={i} fill={[MACRO_COLORS.protein, MACRO_COLORS.carbs, MACRO_COLORS.fat, '#e0e0e0'][i]} />
                      ))}
                    </Pie>
                    <ReTooltip formatter={(v: number, n: string, p: any) => [`${v}% (${p.payload.grams}g)`, n]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>

          {/* Weekly Charts — side by side on wide screens */}
          <Grid container spacing={2}>
            <Grid item xs={12} lg={6}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Calorie Trend (7 Days)</Typography>
                  {weekAvg && (
                    <Chip label={`Avg: ${weekAvg.calories} kcal/day`} size="small" color="primary" variant="outlined" />
                  )}
                </Box>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={weeklyData.map((d) => ({ ...d, label: formatDate(d.date) }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <ReTooltip />
                    <Area type="monotone" dataKey="totalCalories" name="Calories" stroke="#f44336" fill="#f4433620" strokeWidth={2} />
                    {targets.dailyCalorieTarget > 0 && (
                      <Area type="monotone" dataKey={() => targets.dailyCalorieTarget} name="Target" stroke="#4caf50" fill="none" strokeDasharray="5 5" strokeWidth={1.5} />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Nutrient Trends (7 Days)</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyData.map((d) => ({ ...d, label: formatDate(d.date) }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <ReTooltip />
                    <Legend />
                    <Bar dataKey="totalProteinG" name="Protein (g)" fill={MACRO_COLORS.protein} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="totalCarbsG" name="Carbs (g)" fill={MACRO_COLORS.carbs} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="totalFatG" name="Fat (g)" fill={MACRO_COLORS.fat} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>

          {/* Weekly averages */}
          {weekAvg && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Weekly Averages</Typography>
              <Grid container spacing={2}>
                {[
                  { label: 'Avg Calories', value: `${weekAvg.calories} kcal`, color: '#f44336' },
                  { label: 'Avg Protein', value: `${weekAvg.protein}g`, color: '#2196f3' },
                  { label: 'Avg Carbs', value: `${weekAvg.carbs}g`, color: '#ff9800' },
                  { label: 'Avg Fat', value: `${weekAvg.fat}g`, color: '#9c27b0' },
                ].map((a) => (
                  <Grid item xs={6} sm={3} key={a.label}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">{a.label}</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: a.color }}>{a.value}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
        </Box>
      )}

      {/* ═══════ TAB 1: FOOD DIARY ═══════ */}
      {tab === 1 && !loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Food Diary — {formatDate(selectedDate)}
            </Typography>
            <Chip label={`${meals.length} meals · ${Math.round(dn.totalCalories)} kcal`} size="small" color="primary" variant="outlined" />
          </Box>

          {/* Daily intake summary card */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Daily Intake Summary</Typography>
            <Grid container spacing={2}>
              {[
                { label: 'Calories', value: dn.totalCalories, unit: 'kcal', color: '#f44336' },
                { label: 'Protein', value: dn.totalProteinG, unit: 'g', color: '#2196f3' },
                { label: 'Carbs', value: dn.totalCarbsG, unit: 'g', color: '#ff9800' },
                { label: 'Fat', value: dn.totalFatG, unit: 'g', color: '#9c27b0' },
                { label: 'Fiber', value: dn.totalFiberG || 0, unit: 'g', color: '#4caf50' },
                { label: 'Meals', value: dn.mealsLogged || meals.length, unit: '', color: '#607d8b' },
              ].map((item) => (
                <Grid item xs={4} sm={2} key={item.label}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: item.color }}>
                      {Math.round(item.value)}
                    </Typography>
                    {item.unit && <Typography variant="caption" color="text.secondary">{item.unit}</Typography>}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Meal entries */}
          {meals.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed', borderRadius: 2 }}>
              <RestaurantIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
              <Typography color="text.secondary">No meals logged on this day</Typography>
              <Typography variant="caption" color="text.secondary">Go to Meal Log to add meals, or scan a barcode above</Typography>
            </Paper>
          ) : (
            meals.map((meal) => (
              <Card key={meal._id} variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={meal.mealType} size="small" sx={{ textTransform: 'capitalize', fontWeight: 600 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{meal.name || 'Unnamed'}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(meal.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>

                  {/* Micro-nutrient breakdown per food */}
                  {meal.foods.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                      {meal.foods.map((f, i) => (
                        <Chip key={i} label={`${f.name} (${f.calories}cal)`} size="small" variant="outlined" />
                      ))}
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography variant="caption"><strong style={{ color: '#f44336' }}>{meal.totalCalories}</strong> kcal</Typography>
                    <Typography variant="caption">P: <strong>{meal.totalProteinG}g</strong></Typography>
                    <Typography variant="caption">C: <strong>{meal.totalCarbsG}g</strong></Typography>
                    <Typography variant="caption">F: <strong>{meal.totalFatG}g</strong></Typography>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}

      {/* ═══════ TAB 2: SUPPLEMENTS ═══════ */}
      {tab === 2 && !loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Supplements — {formatDate(selectedDate)}
            </Typography>
            <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={() => setSuppDialogOpen(true)}>
              Add Supplement
            </Button>
          </Box>

          {supplements.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed', borderRadius: 2 }}>
              <MedicationIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
              <Typography color="text.secondary">No supplements tracked for this day</Typography>
              <Button startIcon={<AddIcon />} variant="outlined" sx={{ mt: 2 }} size="small" onClick={() => setSuppDialogOpen(true)}>
                Add Supplement
              </Button>
            </Paper>
          ) : (
            supplements.map((supp) => (
              <Paper key={supp._id} variant="outlined" sx={{ p: 2, borderRadius: 2, opacity: supp.taken ? 0.7 : 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <IconButton size="small" onClick={() => toggleSupplement(supp._id)} color={supp.taken ? 'success' : 'default'}>
                      {supp.taken ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                    </IconButton>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, textDecoration: supp.taken ? 'line-through' : 'none' }}>
                        {supp.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {supp.dosage} {supp.dosageUnit} · {supp.timeOfDay}
                        {supp.brand ? ` · ${supp.brand}` : ''}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton size="small" onClick={() => deleteSupplement(supp._id)} color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
                {supp.notes && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 5.5, display: 'block', mt: 0.5 }}>
                    {supp.notes}
                  </Typography>
                )}
              </Paper>
            ))
          )}
        </Box>
      )}

      {/* ═══════ SCAN DIALOG ═══════ */}
      <Dialog open={scanDialogOpen} onClose={() => { setScanDialogOpen(false); setScanResult(null); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Scan Barcode / Nutrition Label</DialogTitle>
        <DialogContent dividers>
          <input ref={scanInputRef} type="file" accept="image/*" hidden onChange={handleScan} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', py: 2 }}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Take a photo of a barcode, nutrition label, or food package. AI will extract the nutritional data.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<PhotoCameraIcon />}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file'; input.accept = 'image/*'; input.capture = 'environment';
                  input.onchange = (e) => handleScan(e as any);
                  input.click();
                }}
              >
                Take Photo
              </Button>
              <Button variant="outlined" startIcon={<QrCodeScannerIcon />} onClick={() => scanInputRef.current?.click()}>
                Upload Image
              </Button>
            </Box>

            {scanning && (
              <Box sx={{ width: '100%', mt: 1 }}>
                <LinearProgress />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}>
                  AI is analyzing the image...
                </Typography>
              </Box>
            )}

            {scanResult && (
              <Paper variant="outlined" sx={{ p: 2, width: '100%', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  {scanResult.productName}
                  {scanResult.brand ? ` — ${scanResult.brand}` : ''}
                </Typography>
                <Grid container spacing={1}>
                  {[
                    { k: 'Calories', v: scanResult.calories, u: 'kcal' },
                    { k: 'Protein', v: scanResult.proteinG, u: 'g' },
                    { k: 'Carbs', v: scanResult.carbsG, u: 'g' },
                    { k: 'Fat', v: scanResult.fatG, u: 'g' },
                    { k: 'Fiber', v: scanResult.fiberG, u: 'g' },
                    { k: 'Sugar', v: scanResult.sugarG, u: 'g' },
                    { k: 'Sodium', v: scanResult.sodiumMg, u: 'mg' },
                    { k: 'Serving', v: scanResult.servingSize, u: scanResult.servingUnit },
                  ].map((item) => (
                    <Grid item xs={3} key={item.k}>
                      <Typography variant="caption" color="text.secondary">{item.k}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.v} {item.u}</Typography>
                    </Grid>
                  ))}
                </Grid>
                {(scanResult.vitaminA > 0 || scanResult.vitaminC > 0 || scanResult.calcium > 0 || scanResult.iron > 0) && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>Micronutrients (% DV)</Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                      {[
                        { k: 'Vit A', v: scanResult.vitaminA },
                        { k: 'Vit C', v: scanResult.vitaminC },
                        { k: 'Calcium', v: scanResult.calcium },
                        { k: 'Iron', v: scanResult.iron },
                      ].filter((i) => i.v > 0).map((item) => (
                        <Chip key={item.k} label={`${item.k}: ${item.v}%`} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </>
                )}
              </Paper>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => { setScanDialogOpen(false); setScanResult(null); }}>Cancel</Button>
          {scanResult && (
            <Button variant="contained" onClick={logScannedItem}>Log This Item</Button>
          )}
        </DialogActions>
      </Dialog>

      {/* ═══════ ADD SUPPLEMENT DIALOG ═══════ */}
      <Dialog open={suppDialogOpen} onClose={() => setSuppDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Supplement</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Supplement Name" size="small" fullWidth required
              value={suppForm.name} onChange={(e) => setSuppForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Vitamin D3, Omega-3, Creatine"
            />
            <TextField label="Brand (optional)" size="small" fullWidth
              value={suppForm.brand} onChange={(e) => setSuppForm((p) => ({ ...p, brand: e.target.value }))}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Dosage" size="small" type="number" sx={{ flex: 1 }}
                value={suppForm.dosage} onChange={(e) => setSuppForm((p) => ({ ...p, dosage: Number(e.target.value) }))}
                inputProps={{ min: 1 }}
              />
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Unit</InputLabel>
                <Select value={suppForm.dosageUnit} label="Unit"
                  onChange={(e) => setSuppForm((p) => ({ ...p, dosageUnit: e.target.value }))}>
                  {['capsule', 'tablet', 'ml', 'mg', 'mcg', 'scoop', 'drop'].map((u) => (
                    <MenuItem key={u} value={u}>{u}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <FormControl size="small" fullWidth>
              <InputLabel>Time of Day</InputLabel>
              <Select value={suppForm.timeOfDay} label="Time of Day"
                onChange={(e) => setSuppForm((p) => ({ ...p, timeOfDay: e.target.value }))}>
                {['morning', 'afternoon', 'evening', 'night', 'with meals'].map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Notes (optional)" size="small" multiline rows={2} fullWidth
              value={suppForm.notes} onChange={(e) => setSuppForm((p) => ({ ...p, notes: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setSuppDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddSupplement} disabled={!suppForm.name.trim()}>Add Supplement</Button>
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
