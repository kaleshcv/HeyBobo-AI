import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
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
  Grid,
  Paper,
  Divider,
  LinearProgress,
  Snackbar,
  Alert,
  Fab,
  Tabs,
  Tab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import BreakfastDiningIcon from '@mui/icons-material/BreakfastDining';
import LunchDiningIcon from '@mui/icons-material/LunchDining';
import DinnerDiningIcon from '@mui/icons-material/DinnerDining';
import CookieIcon from '@mui/icons-material/Cookie';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { dietaryApi } from '@/lib/api';
import { errorLogger } from '@/lib/errorLogger';
import { useAuthStore } from '@/store/authStore';
import { analyzeFoodImage } from '@/lib/gemini';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface FoodItem {
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  servingSize: number;
  servingUnit: string;
  quantity: number;
}

interface MealLog {
  _id: string;
  mealType: MealType;
  date: string;
  name: string;
  notes: string;
  foods: FoodItem[];
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalFiberG: number;
  photoUrl?: string;
  loggedAt: string;
  createdAt: string;
}

const mealTypeConfig: Record<MealType, { label: string; icon: JSX.Element; color: string }> = {
  breakfast: { label: 'Breakfast', icon: <BreakfastDiningIcon />, color: '#ff9800' },
  lunch: { label: 'Lunch', icon: <LunchDiningIcon />, color: '#4caf50' },
  dinner: { label: 'Dinner', icon: <DinnerDiningIcon />, color: '#2196f3' },
  snack: { label: 'Snack', icon: <CookieIcon />, color: '#9c27b0' },
};

const emptyFood: FoodItem = {
  name: '',
  calories: 0,
  proteinG: 0,
  carbsG: 0,
  fatG: 0,
  fiberG: 0,
  servingSize: 100,
  servingUnit: 'g',
  quantity: 1,
};

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function MealLogPage() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id || 'anonymous';

  const [meals, setMeals] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [filterTab, setFilterTab] = useState(0); // 0=All, 1=Breakfast, 2=Lunch, 3=Dinner, 4=Snack
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  // Form state
  const [formMealType, setFormMealType] = useState<MealType>('breakfast');
  const [formName, setFormName] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formFoods, setFormFoods] = useState<FoodItem[]>([{ ...emptyFood }]);
  const [formPhoto, setFormPhoto] = useState<File | null>(null);
  const [formPhotoPreview, setFormPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const fetchMeals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dietaryApi.getMealLogs(
        { startDate: selectedDate, endDate: selectedDate, limit: 100 },
        userId,
      );
      const mealsData = res.data?.data?.meals ?? res.data?.meals ?? [];
      setMeals(mealsData);
    } catch (err) {
      errorLogger.error('Failed to fetch meals', 'MealLog', { meta: { error: String(err), selectedDate } });
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, userId]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  // Computed totals
  const dayTotals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.totalCalories || 0),
      protein: acc.protein + (m.totalProteinG || 0),
      carbs: acc.carbs + (m.totalCarbsG || 0),
      fat: acc.fat + (m.totalFatG || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const mealTypes: (MealType | 'all')[] = ['all', 'breakfast', 'lunch', 'dinner', 'snack'];
  const activeFilter = mealTypes[filterTab];
  const filteredMeals = activeFilter === 'all' ? meals : meals.filter((m) => m.mealType === activeFilter);

  // Food item helpers
  const addFoodItem = () => setFormFoods((prev) => [...prev, { ...emptyFood }]);
  const removeFoodItem = (idx: number) => setFormFoods((prev) => prev.filter((_, i) => i !== idx));
  const updateFoodItem = (idx: number, field: keyof FoodItem, value: string | number) => {
    setFormFoods((prev) => prev.map((f, i) => (i === idx ? { ...f, [field]: value } : f)));
  };

  const formTotals = formFoods.reduce(
    (acc, f) => ({
      calories: acc.calories + (f.calories || 0) * (f.quantity || 1),
      protein: acc.protein + (f.proteinG || 0) * (f.quantity || 1),
      carbs: acc.carbs + (f.carbsG || 0) * (f.quantity || 1),
      fat: acc.fat + (f.fatG || 0) * (f.quantity || 1),
      fiber: acc.fiber + (f.fiberG || 0) * (f.quantity || 1),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormPhoto(file);
    const reader = new FileReader();
    reader.onload = () => setFormPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);

    // AI auto-fill: analyze food image with Gemini
    setAnalyzing(true);
    try {
      const foods = await analyzeFoodImage(file);
      if (foods.length > 0) {
        setFormFoods(foods);
        if (!formName) {
          setFormName(foods.map((f) => f.name).join(', '));
        }
        setSnackbar({ open: true, message: `AI detected ${foods.length} food item${foods.length > 1 ? 's' : ''} — review and adjust values`, severity: 'success' });
      }
    } catch (err) {
      errorLogger.warn('AI food analysis failed', 'MealLog', { meta: { error: String(err) } });
      setSnackbar({ open: true, message: 'AI analysis unavailable — fill in details manually', severity: 'error' });
    } finally {
      setAnalyzing(false);
    }
  };

  const resetForm = () => {
    setFormMealType('breakfast');
    setFormName('');
    setFormNotes('');
    setFormFoods([{ ...emptyFood }]);
    setFormPhoto(null);
    setFormPhotoPreview(null);
  };

  const handleSubmit = async () => {
    if (formFoods.every((f) => !f.name.trim())) {
      setSnackbar({ open: true, message: 'Add at least one food item', severity: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const validFoods = formFoods.filter((f) => f.name.trim());
      const payload = {
        mealType: formMealType,
        date: selectedDate,
        name: formName || validFoods.map((f) => f.name).join(', '),
        notes: formNotes,
        foods: validFoods,
        totalCalories: formTotals.calories,
        totalProteinG: formTotals.protein,
        totalCarbsG: formTotals.carbs,
        totalFatG: formTotals.fat,
        totalFiberG: formTotals.fiber,
      };

      const res = await dietaryApi.createMealLog(payload, userId);
      const mealId = res.data?.data?._id;

      // Upload photo if selected (non-blocking — meal is already saved)
      if (formPhoto && mealId) {
        try {
          await dietaryApi.uploadMealPhoto(mealId, formPhoto, userId);
        } catch (e) {
          errorLogger.warn('Photo upload failed, meal saved without photo', 'MealLog', { meta: { error: String(e), mealId } });
        }
      }

      setSnackbar({ open: true, message: 'Meal logged successfully!', severity: 'success' });
      setDialogOpen(false);
      resetForm();
      fetchMeals();
    } catch (e) {
      errorLogger.error('Failed to log meal', 'MealLog', { meta: { error: String(e) } });
      setSnackbar({ open: true, message: 'Failed to log meal', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (mealId: string) => {
    try {
      await dietaryApi.deleteMealLog(mealId, userId);
      setSnackbar({ open: true, message: 'Meal deleted', severity: 'success' });
      fetchMeals();
    } catch (e) {
      errorLogger.warn('Failed to delete meal', 'MealLog', { meta: { error: String(e), mealId } });
      setSnackbar({ open: true, message: 'Failed to delete meal', severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <RestaurantIcon sx={{ fontSize: 28, color: '#ff9800' }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Meal Log
          </Typography>
        </Box>
        <TextField
          type="date"
          size="small"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          sx={{ width: 160 }}
        />
      </Box>

      {/* Daily Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Calories', value: dayTotals.calories, unit: 'kcal', color: '#f44336' },
          { label: 'Protein', value: dayTotals.protein, unit: 'g', color: '#2196f3' },
          { label: 'Carbs', value: dayTotals.carbs, unit: 'g', color: '#ff9800' },
          { label: 'Fat', value: dayTotals.fat, unit: 'g', color: '#9c27b0' },
        ].map((item) => (
          <Grid item xs={6} sm={3} key={item.label}>
            <Paper
              variant="outlined"
              sx={{ p: 2, textAlign: 'center', borderRadius: 2, borderColor: `${item.color}30` }}
            >
              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: item.color }}>
                {Math.round(item.value)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.unit}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Filter Tabs */}
      <Tabs
        value={filterTab}
        onChange={(_, v) => setFilterTab(v)}
        sx={{ mb: 2, '& .MuiTab-root': { minHeight: 40, textTransform: 'none' } }}
      >
        <Tab label="All" />
        <Tab label="Breakfast" />
        <Tab label="Lunch" />
        <Tab label="Dinner" />
        <Tab label="Snack" />
      </Tabs>

      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Meal List */}
      {!loading && filteredMeals.length === 0 && (
        <Paper
          variant="outlined"
          sx={{ p: 4, textAlign: 'center', borderRadius: 2, borderStyle: 'dashed' }}
        >
          <RestaurantIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
          <Typography color="text.secondary">
            No meals logged{activeFilter !== 'all' ? ` for ${mealTypeConfig[activeFilter as MealType].label}` : ''} on this day
          </Typography>
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => setDialogOpen(true)}
          >
            Log a Meal
          </Button>
        </Paper>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filteredMeals.map((meal) => {
          const config = mealTypeConfig[meal.mealType];
          return (
            <Card key={meal._id} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ display: 'flex' }}>
                {meal.photoUrl && (
                  <CardMedia
                    component="img"
                    sx={{ width: 120, objectFit: 'cover' }}
                    image={`${API_BASE}${meal.photoUrl}`}
                    alt={meal.name}
                  />
                )}
                <CardContent sx={{ flex: 1, py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        icon={config.icon}
                        label={config.label}
                        size="small"
                        sx={{ bgcolor: `${config.color}15`, color: config.color, fontWeight: 600 }}
                      />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {meal.name || 'Unnamed meal'}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => handleDelete(meal._id)} sx={{ color: 'text.secondary' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* Food items */}
                  {meal.foods.length > 0 && (
                    <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {meal.foods.map((food, i) => (
                        <Chip
                          key={i}
                          label={`${food.name}${food.quantity > 1 ? ` x${food.quantity}` : ''}`}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  )}

                  {/* Macros row */}
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocalFireDepartmentIcon sx={{ fontSize: 14, color: '#f44336' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {meal.totalCalories} kcal
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      P: {meal.totalProteinG}g
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      C: {meal.totalCarbsG}g
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      F: {meal.totalFatG}g
                    </Typography>
                  </Box>

                  {meal.notes && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {meal.notes}
                    </Typography>
                  )}
                </CardContent>
              </Box>
            </Card>
          );
        })}
      </Box>

      {/* FAB to add meal */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 280 }}
        onClick={() => setDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* ═══════ Add Meal Dialog ═══════ */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Log a Meal</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {/* Meal type & name */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Meal Type</InputLabel>
                <Select
                  value={formMealType}
                  label="Meal Type"
                  onChange={(e) => setFormMealType(e.target.value as MealType)}
                >
                  {Object.entries(mealTypeConfig).map(([key, cfg]) => (
                    <MenuItem key={key} value={key}>
                      {cfg.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Meal Name (optional)"
                size="small"
                fullWidth
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Avocado Toast"
              />
            </Box>

            {/* Photo upload / capture */}
            <Box>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                onChange={handlePhotoChange}
              />
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handlePhotoChange}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<PhotoCameraIcon />}
                  onClick={() => cameraInputRef.current?.click()}
                  size="small"
                >
                  Take Photo
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<UploadFileIcon />}
                  onClick={() => photoInputRef.current?.click()}
                  size="small"
                >
                  Upload Photo
                </Button>
              </Box>
              {formPhotoPreview && (
                <Box
                  component="img"
                  src={formPhotoPreview}
                  sx={{ mt: 1, maxHeight: 150, borderRadius: 2, display: 'block' }}
                  alt="Preview"
                />
              )}
              {analyzing && (
                <Box sx={{ mt: 1 }}>
                  <LinearProgress sx={{ borderRadius: 1 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    AI is analyzing your food photo...
                  </Typography>
                </Box>
              )}
            </Box>

            <Divider />

            {/* Food items */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Food Items
            </Typography>

            {formFoods.map((food, idx) => (
              <Paper key={idx} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Item {idx + 1}
                  </Typography>
                  {formFoods.length > 1 && (
                    <IconButton size="small" onClick={() => removeFoodItem(idx)} color="error">
                      <RemoveCircleOutlineIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                <Grid container spacing={1}>
                  <Grid item xs={8}>
                    <TextField
                      label="Food Name"
                      size="small"
                      fullWidth
                      value={food.name}
                      onChange={(e) => updateFoodItem(idx, 'name', e.target.value)}
                      placeholder="e.g. Grilled Chicken"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Qty"
                      size="small"
                      type="number"
                      fullWidth
                      value={food.quantity}
                      onChange={(e) => updateFoodItem(idx, 'quantity', Number(e.target.value))}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Serving"
                      size="small"
                      type="number"
                      fullWidth
                      value={food.servingSize}
                      onChange={(e) => updateFoodItem(idx, 'servingSize', Number(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      label="Unit"
                      size="small"
                      fullWidth
                      value={food.servingUnit}
                      onChange={(e) => updateFoodItem(idx, 'servingUnit', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Calories"
                      size="small"
                      type="number"
                      fullWidth
                      value={food.calories}
                      onChange={(e) => updateFoodItem(idx, 'calories', Number(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="Protein (g)"
                      size="small"
                      type="number"
                      fullWidth
                      value={food.proteinG}
                      onChange={(e) => updateFoodItem(idx, 'proteinG', Number(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="Carbs (g)"
                      size="small"
                      type="number"
                      fullWidth
                      value={food.carbsG}
                      onChange={(e) => updateFoodItem(idx, 'carbsG', Number(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="Fat (g)"
                      size="small"
                      type="number"
                      fullWidth
                      value={food.fatG}
                      onChange={(e) => updateFoodItem(idx, 'fatG', Number(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="Fiber (g)"
                      size="small"
                      type="number"
                      fullWidth
                      value={food.fiberG}
                      onChange={(e) => updateFoodItem(idx, 'fiberG', Number(e.target.value))}
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}

            <Button
              startIcon={<AddCircleOutlineIcon />}
              onClick={addFoodItem}
              size="small"
              sx={{ alignSelf: 'flex-start' }}
            >
              Add Food Item
            </Button>

            <Divider />

            {/* Auto-calc totals preview */}
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                Meal Totals (auto-calculated)
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Typography variant="body2">
                  <strong>{Math.round(formTotals.calories)}</strong> kcal
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Protein: <strong>{Math.round(formTotals.protein)}g</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Carbs: <strong>{Math.round(formTotals.carbs)}g</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fat: <strong>{Math.round(formTotals.fat)}g</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fiber: <strong>{Math.round(formTotals.fiber)}g</strong>
                </Typography>
              </Box>
            </Paper>

            {/* Notes */}
            <TextField
              label="Notes (optional)"
              size="small"
              multiline
              rows={2}
              fullWidth
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Any additional notes..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : 'Log Meal'}
          </Button>
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
