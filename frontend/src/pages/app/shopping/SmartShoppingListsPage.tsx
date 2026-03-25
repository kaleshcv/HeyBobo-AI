import { useState } from 'react';
import {
  Box, Typography, Paper, Button, Chip, IconButton, TextField, Checkbox,
  LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Tabs, Tab, Alert, InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import HealingIcon from '@mui/icons-material/Healing';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { useShoppingListStore } from '@/store/shoppingListStore';
import { useCourseStore } from '@/store/courseStore';
import { EXERCISE_DATABASE, PRESET_PLANS, useWorkoutSystemStore } from '@/store/workoutSystemStore';
import { useDietaryProfileStore } from '@/store/dietaryProfileStore';
import { useInjuryStore } from '@/store/injuryStore';

const SOURCE_COLORS: Record<string, string> = {
  course: '#5c6bc0',
  fitness: '#26a69a',
  dietary: '#ff7043',
  injury: '#ef5350',
  grooming: '#ab47bc',
  manual: '#78909c',
};

export default function SmartShoppingListsPage() {
  const lists = useShoppingListStore((s) => s.lists);
  const createList = useShoppingListStore((s) => s.createList);
  const deleteList = useShoppingListStore((s) => s.deleteList);
  const addItem = useShoppingListStore((s) => s.addItem);
  const removeItem = useShoppingListStore((s) => s.removeItem);
  const toggleItem = useShoppingListStore((s) => s.toggleItem);
  const updateItemQuantity = useShoppingListStore((s) => s.updateItemQuantity);
  const clearChecked = useShoppingListStore((s) => s.clearChecked);
  const setBudget = useShoppingListStore((s) => s.setBudget);
  const getListTotal = useShoppingListStore((s) => s.getListTotal);
  const getListProgress = useShoppingListStore((s) => s.getListProgress);
  const generateFromCourses = useShoppingListStore((s) => s.generateFromCourses);
  const generateFromWorkouts = useShoppingListStore((s) => s.generateFromWorkouts);
  const generateFromDiet = useShoppingListStore((s) => s.generateFromDiet);
  const generateFromInjuries = useShoppingListStore((s) => s.generateFromInjuries);

  // Other module data
  const courses = useCourseStore((s) => s.courses);
  const activePlanId = useWorkoutSystemStore((s) => s.activePlanId);
  const dietaryProfile = useDietaryProfileStore((s) => s);
  const injuries = useInjuryStore((s) => s.injuries);

  const [selectedListId, setSelectedListId] = useState<string | null>(lists[0]?.id ?? null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [customListDialogOpen, setCustomListDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [customListName, setCustomListName] = useState('');
  const [tab, setTab] = useState(0);

  const selectedList = lists.find((l) => l.id === selectedListId);
  const progress = selectedList ? getListProgress(selectedList.id) : { checked: 0, total: 0 };
  const total = selectedList ? getListTotal(selectedList.id) : 0;

  // ─── Auto-generate handlers ─────────────────────────────
  const handleGenerateCourses = () => {
    if (!courses.length) return;
    const id = generateFromCourses(courses.map((c) => ({ id: c.id, title: c.title })));
    setSelectedListId(id);
  };

  const handleGenerateWorkouts = () => {
    const plan = PRESET_PLANS.find((p) => p.id === activePlanId);
    if (!plan) return;
    const allEquipment = plan.workoutsPerDay
      .flat()
      .map((we) => EXERCISE_DATABASE.find((ex) => ex.id === we.exerciseId))
      .filter(Boolean)
      .flatMap((ex) => ex!.equipmentNeeded);
    if (!allEquipment.length) return;
    const id = generateFromWorkouts(allEquipment);
    setSelectedListId(id);
  };

  const handleGenerateDiet = () => {
    const dt = dietaryProfile.dietType || 'standard';
    const id = generateFromDiet(dt);
    setSelectedListId(id);
  };

  const handleGenerateInjuries = () => {
    const active = injuries.filter((i) => i.status === 'active' || i.status === 'recovering');
    if (!active.length) return;
    const id = generateFromInjuries(active.map((i) => ({ name: i.name, bodyPart: i.bodyPart })));
    setSelectedListId(id);
  };

  const handleAddCustomItem = () => {
    if (!selectedList || !newItemName.trim()) return;
    addItem(selectedList.id, {
      name: newItemName.trim(),
      quantity: parseInt(newItemQty) || 1,
      unit: 'pc',
      estimatedPrice: parseFloat(newItemPrice) || 0,
      checked: false,
      source: 'manual',
      sourceDetail: 'Added manually',
      category: 'custom',
      note: '',
    });
    setNewItemName('');
    setNewItemPrice('');
    setNewItemQty('1');
    setAddDialogOpen(false);
  };

  const handleCreateCustomList = () => {
    if (!customListName.trim()) return;
    const id = createList(customListName.trim(), 'custom', '📝');
    setSelectedListId(id);
    setCustomListName('');
    setCustomListDialogOpen(false);
  };

  return (
    <Box sx={{ flex: 1, px: 3, py: 3, overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>Smart Shopping Lists</Typography>
          <Typography variant="body2" color="text.secondary">
            Auto-generate shopping lists from your courses, workouts, meal plans &amp; injuries — or create your own.
          </Typography>
        </Box>
      </Box>

      {/* Auto-generate buttons */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3, display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography variant="subtitle2" sx={{ mr: 1 }}>Generate from:</Typography>
        <Button variant="outlined" size="small" startIcon={<SchoolIcon />}
          onClick={handleGenerateCourses} disabled={!courses.length}
          sx={{ textTransform: 'none', borderColor: SOURCE_COLORS.course, color: SOURCE_COLORS.course }}>
          Courses ({courses.length})
        </Button>
        <Button variant="outlined" size="small" startIcon={<FitnessCenterIcon />}
          onClick={handleGenerateWorkouts} disabled={!activePlanId}
          sx={{ textTransform: 'none', borderColor: SOURCE_COLORS.fitness, color: SOURCE_COLORS.fitness }}>
          Workout Plan
        </Button>
        <Button variant="outlined" size="small" startIcon={<RestaurantIcon />}
          onClick={handleGenerateDiet}
          sx={{ textTransform: 'none', borderColor: SOURCE_COLORS.dietary, color: SOURCE_COLORS.dietary }}>
          Diet ({dietaryProfile.dietType || 'Standard'})
        </Button>
        <Button variant="outlined" size="small" startIcon={<HealingIcon />}
          onClick={handleGenerateInjuries}
          disabled={!injuries.filter((i) => i.status === 'active' || i.status === 'recovering').length}
          sx={{ textTransform: 'none', borderColor: SOURCE_COLORS.injury, color: SOURCE_COLORS.injury }}>
          Injuries ({injuries.filter((i) => i.status === 'active' || i.status === 'recovering').length})
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" size="small" startIcon={<AddIcon />}
          onClick={() => setCustomListDialogOpen(true)} sx={{ textTransform: 'none' }}>
          Custom List
        </Button>
      </Paper>

      {lists.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No shopping lists yet. Click one of the generate buttons above or create a custom list to get started!
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Left: list selector */}
          <Paper variant="outlined" sx={{ width: 280, p: 0, flexShrink: 0, borderRadius: 3 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab label={`All (${lists.length})`} sx={{ textTransform: 'none' }} />
            </Tabs>
            <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
              {lists.map((l) => {
                const lp = getListProgress(l.id);
                const isActive = l.id === selectedListId;
                return (
                  <Box
                    key={l.id}
                    onClick={() => setSelectedListId(l.id)}
                    sx={{
                      px: 2, py: 1.5, cursor: 'pointer', borderLeft: 3,
                      borderColor: isActive ? 'primary.main' : 'transparent',
                      bgcolor: isActive ? 'action.selected' : 'transparent',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontSize: 18 }}>{l.emoji}</Typography>
                      <Typography variant="subtitle2" noWrap sx={{ flex: 1 }}>{l.name}</Typography>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); deleteList(l.id); if (selectedListId === l.id) setSelectedListId(lists.find((x) => x.id !== l.id)?.id ?? null); }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <LinearProgress variant="determinate" value={lp.total > 0 ? (lp.checked / lp.total) * 100 : 0} sx={{ flex: 1, height: 4, borderRadius: 2 }} />
                      <Typography variant="caption" color="text.secondary">{lp.checked}/{lp.total}</Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Paper>

          {/* Right: list detail */}
          {selectedList ? (
            <Paper variant="outlined" sx={{ flex: 1, p: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography sx={{ fontSize: 24 }}>{selectedList.emoji}</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>{selectedList.name}</Typography>
                <Chip
                  label={`$${total.toFixed(0)} est.`}
                  size="small"
                  sx={{ fontWeight: 600 }}
                  color={selectedList.budget && total > selectedList.budget ? 'error' : 'default'}
                />
                {selectedList.budget && (
                  <Chip label={`Budget: $${selectedList.budget}`} size="small" variant="outlined" />
                )}
              </Box>

              {/* Progress */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption">Progress</Typography>
                  <Typography variant="caption">{progress.checked} of {progress.total} items</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress.total > 0 ? (progress.checked / progress.total) * 100 : 0}
                  sx={{ height: 8, borderRadius: 4 }}
                  color={progress.checked === progress.total && progress.total > 0 ? 'success' : 'primary'}
                />
              </Box>

              {/* Action bar */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Button size="small" variant="contained" startIcon={<AddIcon />}
                  onClick={() => setAddDialogOpen(true)} sx={{ textTransform: 'none' }}>
                  Add Item
                </Button>
                <Button size="small" variant="outlined" startIcon={<CheckCircleIcon />}
                  onClick={() => clearChecked(selectedList.id)} disabled={progress.checked === 0}
                  sx={{ textTransform: 'none' }}>
                  Clear Checked ({progress.checked})
                </Button>
                <Box sx={{ flex: 1 }} />
                <TextField
                  size="small" type="number" label="Set Budget"
                  value={selectedList.budget ?? ''}
                  onChange={(e) => setBudget(selectedList.id, e.target.value ? Number(e.target.value) : null)}
                  sx={{ width: 130 }}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                />
              </Box>

              {/* Items list */}
              {selectedList.items.length === 0 ? (
                <Alert severity="info">This list is empty. Add items manually or regenerate from a module.</Alert>
              ) : (
                <Box>
                  {selectedList.items.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 1, py: 1, px: 1,
                        borderBottom: '1px solid', borderColor: 'divider',
                        opacity: item.checked ? 0.5 : 1,
                        textDecoration: item.checked ? 'line-through' : 'none',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Checkbox
                        checked={item.checked}
                        onChange={() => toggleItem(selectedList.id, item.id)}
                        size="small"
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.3 }}>
                          <Chip
                            label={item.source}
                            size="small"
                            sx={{ height: 18, fontSize: 10, bgcolor: SOURCE_COLORS[item.source] + '22', color: SOURCE_COLORS[item.source] }}
                          />
                          {item.sourceDetail && (
                            <Typography variant="caption" color="text.secondary">{item.sourceDetail}</Typography>
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          size="small" type="number" value={item.quantity}
                          onChange={(e) => updateItemQuantity(selectedList.id, item.id, Math.max(1, parseInt(e.target.value) || 1))}
                          sx={{ width: 60 }}
                          inputProps={{ min: 1, style: { textAlign: 'center', padding: '4px' } }}
                        />
                        <Typography variant="body2" sx={{ width: 60, textAlign: 'right', fontWeight: 600 }}>
                          ${(item.estimatedPrice * item.quantity).toFixed(0)}
                        </Typography>
                        <IconButton size="small" onClick={() => removeItem(selectedList.id, item.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          ) : (
            <Paper variant="outlined" sx={{ flex: 1, p: 4, textAlign: 'center', borderRadius: 3 }}>
              <Typography color="text.secondary">Select a list from the left panel</Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Add item dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Add Item</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label="Item Name" fullWidth size="small" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} autoFocus />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Quantity" type="number" size="small" value={newItemQty} onChange={(e) => setNewItemQty(e.target.value)} sx={{ flex: 1 }} inputProps={{ min: 1 }} />
            <TextField label="Est. Price" type="number" size="small" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} sx={{ flex: 1 }} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddDialogOpen(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddCustomItem} disabled={!newItemName.trim()} sx={{ textTransform: 'none' }}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Custom list dialog */}
      <Dialog open={customListDialogOpen} onClose={() => setCustomListDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Create Custom List</DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <TextField label="List Name" fullWidth size="small" value={customListName} onChange={(e) => setCustomListName(e.target.value)} autoFocus placeholder="e.g. Dorm Room Essentials" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCustomListDialogOpen(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateCustomList} disabled={!customListName.trim()} sx={{ textTransform: 'none' }}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
