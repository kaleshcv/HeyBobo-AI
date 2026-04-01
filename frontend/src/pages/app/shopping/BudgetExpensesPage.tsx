import { useState } from 'react';
import {
  Box, Typography, Paper, Button, Chip, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
  InputAdornment, IconButton, LinearProgress, Alert, Tooltip,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarningIcon from '@mui/icons-material/Warning';
import EditIcon from '@mui/icons-material/Edit';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

import {
  useBudgetStore,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  type ExpenseCategory,
} from '@/store/budgetStore';

const ALL_CATEGORIES: ExpenseCategory[] = [
  'education', 'fitness', 'food', 'grooming', 'health', 'transport', 'entertainment', 'other',
];

export default function BudgetExpensesPage() {
  const monthlyBudget = useBudgetStore((s) => s.monthlyBudget);
  const categoryLimits = useBudgetStore((s) => s.categoryLimits);
  const priceAlerts = useBudgetStore((s) => s.priceAlerts);
  const setMonthlyBudget = useBudgetStore((s) => s.setMonthlyBudget);
  const setCategoryLimit = useBudgetStore((s) => s.setCategoryLimit);
  const addExpense = useBudgetStore((s) => s.addExpense);
  const removeExpense = useBudgetStore((s) => s.removeExpense);
  const addPriceAlert = useBudgetStore((s) => s.addPriceAlert);
  const removePriceAlert = useBudgetStore((s) => s.removePriceAlert);
  const togglePriceAlert = useBudgetStore((s) => s.togglePriceAlert);
  const getMonthExpenses = useBudgetStore((s) => s.getMonthExpenses);
  const getSpentByCategory = useBudgetStore((s) => s.getSpentByCategory);
  const getTotalSpent = useBudgetStore((s) => s.getTotalSpent);
  const getBudgetRemaining = useBudgetStore((s) => s.getBudgetRemaining);

  const totalSpent = getTotalSpent();
  const remaining = getBudgetRemaining();
  const spentByCategory = getSpentByCategory();
  const monthExpenses = getMonthExpenses();

  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [budgetEditMode, setBudgetEditMode] = useState(false);
  const [budgetInput, setBudgetInput] = useState(String(monthlyBudget));
  const [limitEditCat, setLimitEditCat] = useState<ExpenseCategory | null>(null);
  const [limitInput, setLimitInput] = useState('');

  // Expense form
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('food');
  const [expDesc, setExpDesc] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().slice(0, 10));

  // Alert form
  const [alertName, setAlertName] = useState('');
  const [alertTarget, setAlertTarget] = useState('');
  const [alertCurrent, setAlertCurrent] = useState('');

  const spentPercent = monthlyBudget > 0 ? Math.min((totalSpent / monthlyBudget) * 100, 100) : 0;
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const dayOfMonth = new Date().getDate();
  const daysLeft = daysInMonth - dayOfMonth;
  const avgDaily = dayOfMonth > 0 ? totalSpent / dayOfMonth : 0;

  // Find top category
  const topCategory = ALL_CATEGORIES.reduce((top, cat) =>
    (spentByCategory[cat] ?? 0) > (spentByCategory[top] ?? 0) ? cat : top, ALL_CATEGORIES[0]);

  const handleAddExpense = () => {
    if (!expAmount || !expDesc.trim()) return;
    addExpense({ amount: parseFloat(expAmount), category: expCategory, description: expDesc.trim(), date: expDate, source: 'Manual' });
    setExpAmount(''); setExpDesc(''); setExpenseDialogOpen(false);
  };

  const handleAddAlert = () => {
    if (!alertName.trim() || !alertTarget || !alertCurrent) return;
    addPriceAlert({ productName: alertName.trim(), targetPrice: parseFloat(alertTarget), currentPrice: parseFloat(alertCurrent), active: true });
    setAlertName(''); setAlertTarget(''); setAlertCurrent(''); setAlertDialogOpen(false);
  };

  const handleSaveBudget = () => {
    const val = parseFloat(budgetInput);
    if (val > 0) setMonthlyBudget(val);
    setBudgetEditMode(false);
  };

  const handleSaveLimit = () => {
    if (!limitEditCat) return;
    const val = parseFloat(limitInput);
    if (val >= 0) setCategoryLimit(limitEditCat, val);
    setLimitEditCat(null);
  };

  return (
    <Box sx={{ flex: 1, px: { xs: 2.5, md: 4, lg: 5 }, py: 3, overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#a78bfa20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AccountBalanceWalletIcon sx={{ fontSize: 20, color: '#a78bfa' }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>Budget &amp; Expenses</Typography>
            <Typography variant="body2" color="text.secondary">
              Track your monthly spending, set category limits, and get alerts when prices drop.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Budget overview card */}
      <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>${totalSpent.toFixed(0)}</Typography>
              <Typography variant="body2" color="text.secondary">of ${monthlyBudget} this month</Typography>
              {!budgetEditMode ? (
                <IconButton size="small" onClick={() => { setBudgetEditMode(true); setBudgetInput(String(monthlyBudget)); }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              ) : (
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                  <TextField size="small" type="number" value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)}
                    sx={{ width: 100 }} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                  <Button size="small" onClick={handleSaveBudget}>Save</Button>
                </Box>
              )}
            </Box>
            <LinearProgress
              variant="determinate" value={spentPercent}
              sx={{ height: 10, borderRadius: 5, mt: 1, bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': { bgcolor: remaining < 0 ? '#e53935' : remaining < monthlyBudget * 0.2 ? '#ff9800' : '#43a047' } }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">{spentPercent.toFixed(0)}% used</Typography>
              <Typography variant="caption" sx={{ color: remaining < 0 ? 'error.main' : 'success.main', fontWeight: 600 }}>
                {remaining >= 0 ? `$${remaining.toFixed(0)} remaining` : `$${Math.abs(remaining).toFixed(0)} over budget!`}
              </Typography>
            </Box>
          </Box>

          {/* Quick stats */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {[
              { label: 'Avg/day', value: `$${avgDaily.toFixed(0)}`, icon: <TrendingUpIcon fontSize="small" sx={{ color: '#10b981' }} /> },
              { label: 'Days left', value: `${daysLeft}`, icon: <TrendingDownIcon fontSize="small" sx={{ color: '#f43f5e' }} /> },
              { label: 'Top spend', value: CATEGORY_LABELS[topCategory], icon: <WarningIcon fontSize="small" sx={{ color: '#f59e0b' }} /> },
              { label: 'Expenses', value: `${monthExpenses.length}`, icon: <AccountBalanceWalletIcon fontSize="small" sx={{ color: '#a78bfa' }} /> },
            ].map((s) => (
              <Paper key={s.label} variant="outlined" sx={{ p: 1.5, minWidth: 100, textAlign: 'center', borderRadius: 3 }}>
                <Box sx={{ color: 'text.secondary', mb: 0.3 }}>{s.icon}</Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Left: Category breakdown */}
        <Paper variant="outlined" sx={{ p: 2, flex: 1, minWidth: 320, borderRadius: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Spending by Category</Typography>
          {ALL_CATEGORIES.map((cat) => {
            const spent = spentByCategory[cat] ?? 0;
            const limit = categoryLimits[cat] ?? 0;
            const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
            const isOver = spent > limit;
            return (
              <Box key={cat} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: CATEGORY_COLORS[cat] }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{CATEGORY_LABELS[cat]}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: isOver ? 'error.main' : 'text.primary' }}>
                      ${spent.toFixed(0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">/ ${limit}</Typography>
                    <IconButton size="small" onClick={() => { setLimitEditCat(cat); setLimitInput(String(limit)); }}>
                      <EditIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate" value={pct}
                  sx={{ height: 6, borderRadius: 3, bgcolor: CATEGORY_COLORS[cat] + '22',
                    '& .MuiLinearProgress-bar': { bgcolor: isOver ? '#e53935' : CATEGORY_COLORS[cat] } }}
                />
              </Box>
            );
          })}
        </Paper>

        {/* Right: Recent expenses + Actions */}
        <Box sx={{ flex: 1, minWidth: 320, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Action buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setExpenseDialogOpen(true)} sx={{ textTransform: 'none', flex: 1 }}>
              Add Expense
            </Button>
            <Button variant="outlined" startIcon={<NotificationsActiveIcon />} onClick={() => setAlertDialogOpen(true)} sx={{ textTransform: 'none', flex: 1 }}>
              Price Alert
            </Button>
          </Box>

          {/* Price Alerts */}
          {priceAlerts.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Price Alerts</Typography>
              {priceAlerts.map((a) => (
                <Box key={a.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <NotificationsActiveIcon sx={{ fontSize: 16, color: a.active ? 'primary.main' : 'text.disabled' }} />
                  <Typography variant="body2" sx={{ flex: 1, opacity: a.active ? 1 : 0.5 }}>{a.productName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Target: ${a.targetPrice} (Now: ${a.currentPrice})
                  </Typography>
                  {a.currentPrice <= a.targetPrice && (
                    <Chip label="Price dropped!" size="small" color="success" sx={{ height: 20, fontSize: 10 }} />
                  )}
                  <IconButton size="small" onClick={() => togglePriceAlert(a.id)}>
                    <Tooltip title={a.active ? 'Disable' : 'Enable'}>
                      <NotificationsActiveIcon sx={{ fontSize: 14, color: a.active ? 'primary.main' : 'text.disabled' }} />
                    </Tooltip>
                  </IconButton>
                  <IconButton size="small" onClick={() => removePriceAlert(a.id)}>
                    <DeleteIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              ))}
            </Paper>
          )}

          {/* Recent expenses */}
          <Paper variant="outlined" sx={{ p: 2, flex: 1, borderRadius: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Recent Expenses</Typography>
            {monthExpenses.length === 0 ? (
              <Alert severity="info" sx={{ mt: 1 }}>No expenses this month. Add one to start tracking!</Alert>
            ) : (
              <Box sx={{ maxHeight: 350, overflow: 'auto' }}>
                {monthExpenses.slice(0, 20).map((e) => (
                  <Box key={e.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.8, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: CATEGORY_COLORS[e.category], flexShrink: 0 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{e.description}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {CATEGORY_LABELS[e.category]} · {e.date} · {e.source}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>${e.amount.toFixed(0)}</Typography>
                    <IconButton size="small" onClick={() => removeExpense(e.id)}>
                      <DeleteIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Over-budget warning */}
      {remaining < 0 && (
        <Alert severity="error" sx={{ mt: 3 }}>
          You're ${Math.abs(remaining).toFixed(0)} over your monthly budget! Consider reducing spending in {CATEGORY_LABELS[topCategory]}.
        </Alert>
      )}

      {/* Add Expense Dialog */}
      <Dialog open={expenseDialogOpen} onClose={() => setExpenseDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Add Expense</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label="Description" fullWidth size="small" value={expDesc} onChange={(e) => setExpDesc(e.target.value)}
            placeholder="e.g. Textbooks, Lunch, Gym membership" autoFocus />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Amount" type="number" size="small" value={expAmount} onChange={(e) => setExpAmount(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} sx={{ flex: 1 }} />
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Category</InputLabel>
              <Select value={expCategory} label="Category" onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}>
                {ALL_CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>{CATEGORY_LABELS[c]}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <TextField label="Date" type="date" size="small" value={expDate} onChange={(e) => setExpDate(e.target.value)}
            InputLabelProps={{ shrink: true }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setExpenseDialogOpen(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddExpense} disabled={!expAmount || !expDesc.trim()} sx={{ textTransform: 'none' }}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Price Alert Dialog */}
      <Dialog open={alertDialogOpen} onClose={() => setAlertDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Set Price Alert</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label="Product Name" fullWidth size="small" value={alertName} onChange={(e) => setAlertName(e.target.value)}
            placeholder="e.g. Whey Protein 2lb" autoFocus />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Current Price" type="number" size="small" value={alertCurrent} onChange={(e) => setAlertCurrent(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} sx={{ flex: 1 }} />
            <TextField label="Alert when below" type="number" size="small" value={alertTarget} onChange={(e) => setAlertTarget(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} sx={{ flex: 1 }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAlertDialogOpen(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddAlert} disabled={!alertName.trim() || !alertTarget || !alertCurrent} sx={{ textTransform: 'none' }}>Set Alert</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Category Limit Dialog */}
      <Dialog open={!!limitEditCat} onClose={() => setLimitEditCat(null)} maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Edit {limitEditCat ? CATEGORY_LABELS[limitEditCat] : ''} Limit</DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <TextField label="Monthly Limit" type="number" size="small" fullWidth value={limitInput} onChange={(e) => setLimitInput(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} autoFocus />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setLimitEditCat(null)} sx={{ textTransform: 'none', color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveLimit} sx={{ textTransform: 'none' }}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
