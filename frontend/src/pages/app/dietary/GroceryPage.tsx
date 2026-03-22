import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  IconButton,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Grid,
  Collapse,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import { dietaryApi } from '@/lib/api';
import { errorLogger } from '@/lib/errorLogger';
import { generateGroceryList } from '@/lib/gemini';
import { useAuthStore } from '@/store/authStore';

const CATEGORIES = [
  'produce', 'dairy', 'meat', 'seafood', 'grains', 'bakery',
  'frozen', 'canned', 'snacks', 'beverages', 'condiments',
  'spices', 'oils', 'supplements', 'other',
];

const CATEGORY_COLORS: Record<string, string> = {
  produce: '#4caf50', dairy: '#2196f3', meat: '#f44336', seafood: '#00bcd4',
  grains: '#ff9800', bakery: '#795548', frozen: '#9c27b0', canned: '#607d8b',
  snacks: '#ff5722', beverages: '#03a9f4', condiments: '#ffc107', spices: '#e91e63',
  oils: '#cddc39', supplements: '#673ab7', other: '#9e9e9e',
};

function getCategoryColor(cat: string) {
  return CATEGORY_COLORS[cat] || '#9e9e9e';
}

export default function GroceryPage() {
  const userId = useAuthStore.getState().user?.id || 'demo-user';
  const [tab, setTab] = useState(0);
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [detailList, setDetailList] = useState<any | null>(null);
  const [addItemOpen, setAddItemOpen] = useState(false);

  // Create form
  const [newTitle, setNewTitle] = useState('');

  // Generate from meal plan
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [generating, setGenerating] = useState(false);

  // Add item form
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, unit: '', category: 'other', estimatedPrice: 0, calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });

  // Category collapse state
  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({});

  const fetchLists = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dietaryApi.getGroceryLists(userId);
      setLists(res.data?.data ?? res.data ?? []);
    } catch (e) {
      errorLogger.error('Failed to load grocery lists', 'GroceryPage', { meta: { error: String(e) } });
      setError('Failed to load grocery lists');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchMealPlans = useCallback(async () => {
    try {
      const res = await dietaryApi.getMealPlans(userId);
      setMealPlans(res.data?.data ?? res.data ?? []);
    } catch (e) { errorLogger.warn('Failed to load meal plans', 'GroceryPage', { meta: { error: String(e) } }); }
  }, [userId]);

  useEffect(() => { fetchLists(); }, [fetchLists]);

  // ─── Handlers ─────────────────────────────────
  const handleCreateList = async () => {
    if (!newTitle.trim()) return;
    try {
      await dietaryApi.createGroceryList({ title: newTitle, status: 'draft' }, userId);
      setNewTitle('');
      setCreateOpen(false);
      fetchLists();
    } catch (e) { errorLogger.error('Failed to create grocery list', 'GroceryPage', { meta: { error: String(e) } }); setError('Failed to create list'); }
  };

  const handleDeleteList = async (id: string) => {
    try {
      await dietaryApi.deleteGroceryList(id, userId);
      if (detailList?._id === id) setDetailList(null);
      fetchLists();
    } catch (e) { errorLogger.error('Failed to delete grocery list', 'GroceryPage', { meta: { error: String(e), id } }); setError('Failed to delete list'); }
  };

  const handleOpenDetail = async (id: string) => {
    try {
      const res = await dietaryApi.getGroceryList(id, userId);
      setDetailList(res.data?.data ?? res.data);
      setTab(1);
    } catch (e) { errorLogger.error('Failed to load grocery list', 'GroceryPage', { meta: { error: String(e), id } }); setError('Failed to load grocery list'); }
  };

  const handleToggleItem = async (itemIndex: number) => {
    if (!detailList) return;
    try {
      const res = await dietaryApi.toggleGroceryItem(detailList._id, itemIndex, userId);
      setDetailList(res.data?.data ?? res.data);
      fetchLists();
    } catch (e) { errorLogger.error('Failed to toggle grocery item', 'GroceryPage', { meta: { error: String(e) } }); setError('Failed to update item'); }
  };

  const handleAddItem = async () => {
    if (!detailList || !newItem.name.trim()) return;
    try {
      const res = await dietaryApi.addGroceryItems(detailList._id, [newItem], userId);
      setDetailList(res.data?.data ?? res.data);
      setNewItem({ name: '', quantity: 1, unit: '', category: 'other', estimatedPrice: 0, calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });
      setAddItemOpen(false);
      fetchLists();
    } catch (e) { errorLogger.error('Failed to add grocery item', 'GroceryPage', { meta: { error: String(e) } }); setError('Failed to add item'); }
  };

  const handleGenerateFromPlan = async () => {
    if (!selectedPlanId) return;
    setGenerating(true);
    setError('');
    try {
      const plan = mealPlans.find((p: any) => p._id === selectedPlanId);
      if (!plan) throw new Error('Plan not found');

      const aiResult = await generateGroceryList(plan);

      const listData = {
        title: `Grocery for: ${plan.title || 'Meal Plan'}`,
        mealPlanId: selectedPlanId,
        status: 'active',
        items: aiResult.items || [],
        notes: (aiResult.optimizationTips || []).join('\n'),
      };

      await dietaryApi.createGroceryList(listData, userId);
      setGenerateOpen(false);
      setSelectedPlanId('');
      fetchLists();
    } catch (e: any) {
      errorLogger.error(e?.message || 'Failed to generate grocery list', 'GroceryPage', { stack: e?.stack, meta: { action: 'generateFromPlan' } });
      setError(e.message || 'Failed to generate grocery list');
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!detailList) return;
    try {
      const res = await dietaryApi.updateGroceryList(detailList._id, { status }, userId);
      setDetailList(res.data?.data ?? res.data);
      fetchLists();
    } catch (e) { errorLogger.warn('Failed to update grocery list status', 'GroceryPage', { meta: { error: String(e), status } }); setError('Failed to update status'); }
  };

  // ─── Grouped items by category ────────────────
  const groupedItems = useMemo(() => {
    if (!detailList?.items) return {};
    const groups: Record<string, { item: any; index: number }[]> = {};
    detailList.items.forEach((item: any, idx: number) => {
      const cat = item.category || 'other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push({ item, index: idx });
    });
    return groups;
  }, [detailList]);

  // ─── Computed nutrition totals from items ──────
  const computedTotals = useMemo(() => {
    if (!detailList?.items) return { calories: 0, protein: 0, carbs: 0, fat: 0, cost: 0, count: 0, purchased: 0 };
    const items = detailList.items as any[];
    return {
      calories: items.reduce((s: number, i: any) => s + (i.calories || 0), 0),
      protein: items.reduce((s: number, i: any) => s + (i.proteinG || 0), 0),
      carbs: items.reduce((s: number, i: any) => s + (i.carbsG || 0), 0),
      fat: items.reduce((s: number, i: any) => s + (i.fatG || 0), 0),
      cost: items.reduce((s: number, i: any) => s + (i.estimatedPrice || 0), 0),
      count: items.length,
      purchased: items.filter((i: any) => i.purchased).length,
    };
  }, [detailList]);

  const toggleCategory = (cat: string) => {
    setCollapsedCats((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Active/shopping lists
  const activeLists = lists.filter((l) => l.status !== 'completed');
  const completedLists = lists.filter((l) => l.status === 'completed');

  const statusColor = (s: string) => s === 'active' ? '#4caf50' : s === 'shopping' ? '#ff9800' : s === 'completed' ? '#2196f3' : '#9e9e9e';

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ShoppingCartIcon sx={{ fontSize: 28, color: '#ff9800' }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Grocery & Food Ecosystem</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AutoAwesomeIcon />}
            onClick={() => { setGenerateOpen(true); fetchMealPlans(); }}
          >
            AI Generate
          </Button>
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            New List
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, '& .MuiTab-root': { minHeight: 40, textTransform: 'none' } }}>
        <Tab label="My Lists" />
        <Tab label="Shopping View" disabled={!detailList} />
        <Tab label="Nutrition Summary" disabled={!detailList} />
      </Tabs>

      {/* ─── TAB 0: My Lists ─── */}
      {tab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {activeLists.length === 0 && !loading && (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed', borderRadius: 2 }}>
              <LocalGroceryStoreIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
              <Typography color="text.secondary">
                No grocery lists yet. Create one manually or generate from a meal plan.
              </Typography>
              <Button variant="outlined" onClick={() => setCreateOpen(true)} startIcon={<AddIcon />} sx={{ mt: 2 }}>
                Create First List
              </Button>
            </Paper>
          )}

          <Grid container spacing={2}>
            {activeLists.map((list: any) => {
              const sc = statusColor(list.status);
              return (
                <Grid item xs={12} sm={6} md={4} key={list._id}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2, borderRadius: 2, cursor: 'pointer',
                      borderColor: `${sc}30`,
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: sc, bgcolor: `${sc}05` },
                    }}
                    onClick={() => handleOpenDetail(list._id)}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }} noWrap>
                        {list.title}
                      </Typography>
                      <Chip
                        size="small"
                        label={list.status}
                        sx={{ bgcolor: `${sc}15`, color: sc, fontWeight: 600 }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {list.itemCount || 0} items · {list.purchasedCount || 0} purchased
                    </Typography>
                    {(list.itemCount || 0) > 0 && (
                      <LinearProgress
                        variant="determinate"
                        value={((list.purchasedCount || 0) / (list.itemCount || 1)) * 100}
                        sx={{ mt: 1.5, mb: 1, borderRadius: 2, height: 6, bgcolor: `${sc}15`, '& .MuiLinearProgress-bar': { bgcolor: sc } }}
                      />
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      {list.totalEstimatedCost > 0 ? (
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#4caf50' }}>
                          Est. ${list.totalEstimatedCost.toFixed(2)}
                        </Typography>
                      ) : <Box />}
                      <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteList(list._id); }}>
                        <DeleteIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          {completedLists.length > 0 && (
            <>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2 }} color="text.secondary">
                Completed Lists
              </Typography>
              <Grid container spacing={2}>
                {completedLists.map((list: any) => (
                  <Grid item xs={12} sm={6} md={4} key={list._id}>
                    <Paper
                      variant="outlined"
                      sx={{ p: 2, borderRadius: 2, cursor: 'pointer', opacity: 0.7, borderColor: '#4caf5030', '&:hover': { opacity: 1 } }}
                      onClick={() => handleOpenDetail(list._id)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontWeight: 600 }}>{list.title}</Typography>
                        <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {list.itemCount} items · ${(list.totalEstimatedCost || 0).toFixed(2)}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Box>
      )}

      {/* ─── TAB 1: Shopping View ─── */}
      {tab === 1 && detailList && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{detailList.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {computedTotals.purchased} / {computedTotals.count} items purchased
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={detailList.status}
                  sx={{ bgcolor: `${statusColor(detailList.status)}15`, color: statusColor(detailList.status), fontWeight: 600 }}
                />
                {detailList.status === 'active' && (
                  <Button size="small" variant="outlined" color="warning" onClick={() => handleUpdateStatus('shopping')}>
                    Start Shopping
                  </Button>
                )}
                {detailList.status === 'shopping' && (
                  <Button size="small" variant="outlined" color="success" onClick={() => handleUpdateStatus('completed')}>
                    Complete
                  </Button>
                )}
                <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => setAddItemOpen(true)}>
                  Add Item
                </Button>
              </Box>
            </Box>
            {computedTotals.count > 0 && (
              <LinearProgress
                variant="determinate"
                value={(computedTotals.purchased / (computedTotals.count || 1)) * 100}
                sx={{ mt: 2, height: 6, borderRadius: 4 }}
              />
            )}
          </Paper>

          {/* Optimization Tips */}
          {detailList.notes && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: '#2196f330', bgcolor: '#2196f308' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TipsAndUpdatesIcon sx={{ color: '#2196f3' }} />
                <Typography sx={{ fontWeight: 700, color: '#2196f3' }}>Shopping Tips</Typography>
              </Box>
              {detailList.notes.split('\n').filter(Boolean).map((tip: string, i: number) => (
                <Typography key={i} variant="body2" sx={{ ml: 4, mb: 0.5 }}>• {tip}</Typography>
              ))}
            </Paper>
          )}

          {/* Grouped Items by Category */}
          {Object.entries(groupedItems).sort(([a], [b]) => a.localeCompare(b)).map(([category, items]) => {
            const catColor = getCategoryColor(category);
            const purchased = items.filter((i) => i.item.purchased).length;
            const isCollapsed = collapsedCats[category];
            return (
              <Paper key={category} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', borderColor: `${catColor}30` }}>
                <Box
                  sx={{ p: 1.5, display: 'flex', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { bgcolor: `${catColor}05` } }}
                  onClick={() => toggleCategory(category)}
                >
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: catColor, mr: 1.5 }} />
                  <Typography sx={{ fontWeight: 600, flex: 1, textTransform: 'capitalize' }}>
                    {category}
                  </Typography>
                  <Chip label={`${purchased}/${items.length}`} size="small" sx={{ mr: 1, bgcolor: `${catColor}15`, color: catColor, fontWeight: 600 }} />
                  {isCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                </Box>
                <Collapse in={!isCollapsed}>
                  <List dense disablePadding>
                    {items.map(({ item, index }) => (
                      <ListItem key={index} sx={{ pl: 4, opacity: item.purchased ? 0.5 : 1 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Checkbox
                            edge="start"
                            checked={!!item.purchased}
                            onChange={() => handleToggleItem(index)}
                            size="small"
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography sx={{ textDecoration: item.purchased ? 'line-through' : 'none' }}>
                              {item.name}
                            </Typography>
                          }
                          secondary={`${item.quantity} ${item.unit}${item.estimatedPrice ? ` · $${item.estimatedPrice.toFixed(2)}` : ''}`}
                        />
                        {item.calories > 0 && (
                          <Typography variant="caption" sx={{ fontWeight: 600, color: '#f44336' }}>
                            {item.calories} cal
                          </Typography>
                        )}
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </Paper>
            );
          })}

          {computedTotals.count === 0 && (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed', borderRadius: 2 }}>
              <ShoppingCartIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
              <Typography color="text.secondary">No items yet. Add items manually or generate from a meal plan.</Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* ─── TAB 2: Nutrition Summary ─── */}
      {tab === 2 && detailList && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Cart Nutrition Summary</Typography>
            <Grid container spacing={2}>
              {[
                { label: 'Total Calories', value: computedTotals.calories, unit: '', color: '#f44336' },
                { label: 'Protein', value: `${computedTotals.protein.toFixed(0)}`, unit: 'g', color: '#2196f3' },
                { label: 'Carbs', value: `${computedTotals.carbs.toFixed(0)}`, unit: 'g', color: '#ff9800' },
                { label: 'Fat', value: `${computedTotals.fat.toFixed(0)}`, unit: 'g', color: '#9c27b0' },
              ].map((s) => (
                <Grid item xs={6} sm={3} key={s.label}>
                  <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 2, borderColor: `${s.color}30` }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: s.color }}>
                      {s.value}{s.unit}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Cost Breakdown</Typography>
            <Grid container spacing={2}>
              {[
                { label: 'Estimated Total', value: `$${computedTotals.cost.toFixed(2)}`, color: '#4caf50' },
                { label: 'Total Items', value: `${computedTotals.count}`, color: '#2196f3' },
                { label: 'Avg Cost/Item', value: `$${computedTotals.count ? (computedTotals.cost / computedTotals.count).toFixed(2) : '0.00'}`, color: '#ff9800' },
              ].map((s) => (
                <Grid item xs={4} key={s.label}>
                  <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 2, borderColor: `${s.color}30` }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: s.color }}>
                      {s.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Per-Category Breakdown */}
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Category Breakdown</Typography>
            {Object.entries(groupedItems).sort(([a], [b]) => a.localeCompare(b)).map(([category, items]) => {
              const catColor = getCategoryColor(category);
              const catCal = items.reduce((s, i) => s + (i.item.calories || 0), 0);
              const catCost = items.reduce((s, i) => s + (i.item.estimatedPrice || 0), 0);
              return (
                <Box key={category} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 0.75 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: catColor }} />
                  <Typography sx={{ flex: 1, textTransform: 'capitalize', fontWeight: 500 }}>{category}</Typography>
                  <Chip label={`${items.length} items`} size="small" sx={{ bgcolor: `${catColor}15`, color: catColor, fontWeight: 600 }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#f44336' }}>{catCal} cal</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#4caf50' }}>${catCost.toFixed(2)}</Typography>
                </Box>
              );
            })}
          </Paper>
        </Box>
      )}

      {/* ─── Create List Dialog ─── */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Create Grocery List</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="List Name"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            sx={{ mt: 1 }}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateList} disabled={!newTitle.trim()}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* ─── AI Generate Dialog ─── */}
      <Dialog open={generateOpen} onClose={() => !generating && setGenerateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon sx={{ color: '#ff9800' }} />
            Generate Grocery List from Meal Plan
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            AI will analyze your meal plan, combine ingredients, optimize quantities, and estimate costs.
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Select Meal Plan</InputLabel>
            <Select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              label="Select Meal Plan"
            >
              {mealPlans.map((plan: any) => (
                <MenuItem key={plan._id} value={plan._id}>
                  {plan.title || 'Untitled Plan'} — {plan.days?.length || 0} days
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {mealPlans.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No meal plans found. Create a meal plan first in the Meal Planner.
            </Alert>
          )}
          {generating && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2">AI is generating your optimized grocery list...</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setGenerateOpen(false)} disabled={generating}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleGenerateFromPlan}
            disabled={!selectedPlanId || generating}
            startIcon={generating ? <CircularProgress size={16} /> : <AutoAwesomeIcon />}
          >
            Generate
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Add Item Dialog ─── */}
      <Dialog open={addItemOpen} onClose={() => setAddItemOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Grocery Item</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              autoFocus fullWidth label="Item Name" value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Qty" type="number" value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 1 })}
                sx={{ width: 100 }}
              />
              <TextField
                label="Unit" value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                placeholder="kg, lbs, pcs..."
                sx={{ flex: 1 }}
              />
            </Box>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                label="Category"
              >
                {CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c} sx={{ textTransform: 'capitalize' }}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth label="Est. Price ($)" type="number" value={newItem.estimatedPrice}
              onChange={(e) => setNewItem({ ...newItem, estimatedPrice: parseFloat(e.target.value) || 0 })}
            />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Nutrition (optional)</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Calories" type="number" value={newItem.calories}
                onChange={(e) => setNewItem({ ...newItem, calories: parseFloat(e.target.value) || 0 })}
                size="small" sx={{ flex: 1 }}
              />
              <TextField
                label="Protein (g)" type="number" value={newItem.proteinG}
                onChange={(e) => setNewItem({ ...newItem, proteinG: parseFloat(e.target.value) || 0 })}
                size="small" sx={{ flex: 1 }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Carbs (g)" type="number" value={newItem.carbsG}
                onChange={(e) => setNewItem({ ...newItem, carbsG: parseFloat(e.target.value) || 0 })}
                size="small" sx={{ flex: 1 }}
              />
              <TextField
                label="Fat (g)" type="number" value={newItem.fatG}
                onChange={(e) => setNewItem({ ...newItem, fatG: parseFloat(e.target.value) || 0 })}
                size="small" sx={{ flex: 1 }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setAddItemOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddItem} disabled={!newItem.name.trim()}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
