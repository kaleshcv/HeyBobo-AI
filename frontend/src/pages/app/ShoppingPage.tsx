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
import ListAltIcon from '@mui/icons-material/ListAlt';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalMallIcon from '@mui/icons-material/LocalMall';

import { useShoppingListStore } from '@/store/shoppingListStore';
import { useCampusMarketplaceStore } from '@/store/campusMarketplaceStore';
import { useBudgetStore, CATEGORY_COLORS, CATEGORY_LABELS } from '@/store/budgetStore';
import { useOrdersReviewsStore, STATUS_LABELS } from '@/store/ordersReviewsStore';

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
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
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2, alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
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

function ProgressRow({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const pct = target > 0 ? clamp((value / target) * 100) : 0;
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          ${Math.round(value)} / ${Math.round(target)}
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

export default function ShoppingPage() {
  const navigate = useNavigate();

  const lists = useShoppingListStore((s) => s.lists);
  const listings = useCampusMarketplaceStore((s) => s.listings);
  const monthlyBudget = useBudgetStore((s) => s.monthlyBudget);
  const expenses = useBudgetStore((s) => s.expenses);
  const getTotalSpent = useBudgetStore((s) => s.getTotalSpent);
  const getSpentByCategory = useBudgetStore((s) => s.getSpentByCategory);
  const categoryLimits = useBudgetStore((s) => s.categoryLimits);
  const orders = useOrdersReviewsStore((s) => s.orders);
  const reviews = useOrdersReviewsStore((s) => s.reviews);
  const getActiveOrders = useOrdersReviewsStore((s) => s.getActiveOrders);

  const totalListItems = lists.reduce((s, l) => s + l.items.length, 0);
  const checkedItems = lists.reduce((s, l) => s + l.items.filter((i) => i.checked).length, 0);
  const listCompletionRate = totalListItems > 0 ? clamp((checkedItems / totalListItems) * 100) : 0;
  const listsBySource = useMemo(() => {
    const counts: Record<string, number> = {};
    lists.forEach((l) => l.items.forEach((i) => { counts[i.source] = (counts[i.source] ?? 0) + 1; }));
    return counts;
  }, [lists]);

  const totalSpent = getTotalSpent();
  const remaining = monthlyBudget - totalSpent;
  const budgetPct = monthlyBudget > 0 ? clamp((totalSpent / monthlyBudget) * 100) : 0;
  const spentByCategory = getSpentByCategory();
  const recentExpenses = [...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const availableListings = listings.filter((l) => l.status === 'available');
  const wishlistedCount = listings.filter((l) => l.wishlisted).length;
  const avgDiscount = useMemo(() => {
    const withOriginal = availableListings.filter((l) => l.originalPrice && l.originalPrice > 0);
    if (withOriginal.length === 0) return 0;
    return Math.round(withOriginal.reduce((sum, l) => sum + (1 - l.price / l.originalPrice!) * 100, 0) / withOriginal.length);
  }, [availableListings]);

  const activeOrders = getActiveOrders();
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const totalOrderValue = orders.reduce((sum, o) => sum + o.total, 0);

  const insights = useMemo(() => {
    const items: { title: string; body: string; tone: 'success' | 'warning' | 'info' }[] = [];

    if (budgetPct >= 90) {
      items.push({ title: 'Monthly budget nearly exhausted', body: `$${totalSpent.toFixed(0)} of $${monthlyBudget} used (${Math.round(budgetPct)}%). Remaining: $${remaining.toFixed(0)}.`, tone: 'warning' });
    } else if (budgetPct >= 70) {
      items.push({ title: 'Budget on track', body: `$${totalSpent.toFixed(0)} spent of $${monthlyBudget} budget. $${remaining.toFixed(0)} remaining for the rest of the month.`, tone: 'info' });
    } else {
      items.push({ title: 'Good budget headroom this month', body: `Only ${Math.round(budgetPct)}% of the monthly budget has been used. $${remaining.toFixed(0)} remains available.`, tone: 'success' });
    }

    if (activeOrders.length > 0) {
      items.push({ title: `${activeOrders.length} order${activeOrders.length !== 1 ? 's' : ''} in progress`, body: `${activeOrders.map((o) => STATUS_LABELS[o.status]).join(', ')} — check Orders & Reviews to track delivery.`, tone: 'info' });
    }

    if (listCompletionRate > 0) {
      items.push({ title: 'Shopping list progress is active', body: `${checkedItems} of ${totalListItems} items checked off across ${lists.length} list${lists.length !== 1 ? 's' : ''} (${Math.round(listCompletionRate)}% done).`, tone: listCompletionRate >= 80 ? 'success' : 'info' });
    }

    if (availableListings.length > 0) {
      items.push({ title: 'Marketplace listings available', body: `${availableListings.length} item${availableListings.length !== 1 ? 's' : ''} available at an average ${avgDiscount}% below original price.`, tone: 'success' });
    }

    if (wishlistedCount > 0) {
      items.push({ title: 'Wishlisted items awaiting action', body: `${wishlistedCount} marketplace item${wishlistedCount !== 1 ? 's are' : ' is'} wishlisted. Visit the Campus Marketplace to review and purchase.`, tone: 'info' });
    }

    return items.slice(0, 5);
  }, [activeOrders, avgDiscount, availableListings.length, budgetPct, checkedItems, listCompletionRate, lists.length, monthlyBudget, remaining, totalListItems, totalSpent, wishlistedCount]);

  return (
    <Box sx={{ flex: 1, px: 3, py: 3, overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            Shopping Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Unified overview of shopping lists, campus marketplace, budget tracking, and order management.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<ListAltIcon />} onClick={() => navigate('/app/shopping/lists')}>
            Shopping Lists
          </Button>
          <Button variant="outlined" startIcon={<StorefrontIcon />} onClick={() => navigate('/app/shopping/marketplace')}>
            Marketplace
          </Button>
          <Button variant="outlined" startIcon={<AccountBalanceWalletIcon />} onClick={() => navigate('/app/shopping/budget')}>
            Budget
          </Button>
          <Button variant="contained" startIcon={<ReceiptLongIcon />} sx={{ bgcolor: '#5c6bc0' }} onClick={() => navigate('/app/shopping/orders')}>
            Orders
          </Button>
        </Box>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<AccountBalanceWalletIcon sx={{ color: '#fff', fontSize: 20 }} />}
            label="Monthly Budget Used"
            value={`${Math.round(budgetPct)}%`}
            sub={`$${totalSpent.toFixed(0)} spent · $${remaining.toFixed(0)} left`}
            color="#455a64"
            onClick={() => navigate('/app/shopping/budget')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<ListAltIcon sx={{ color: '#fff', fontSize: 20 }} />}
            label="Shopping Lists"
            value={lists.length}
            sub={`${checkedItems}/${totalListItems} items checked · ${Math.round(listCompletionRate)}% done`}
            color="#5c6bc0"
            onClick={() => navigate('/app/shopping/lists')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<StorefrontIcon sx={{ color: '#fff', fontSize: 20 }} />}
            label="Marketplace"
            value={availableListings.length}
            sub={`listings available · avg ${avgDiscount}% off`}
            color="#26a69a"
            onClick={() => navigate('/app/shopping/marketplace')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<ReceiptLongIcon sx={{ color: '#fff', fontSize: 20 }} />}
            label="Active Orders"
            value={activeOrders.length}
            sub={`${deliveredOrders.length} delivered · $${totalOrderValue.toFixed(0)} total`}
            color="#ab47bc"
            onClick={() => navigate('/app/shopping/orders')}
          />
        </Grid>
      </Grid>

      {/* Main Grid */}
      <Grid container spacing={2}>
        {/* Left 8 cols */}
        <Grid item xs={12} lg={8}>
          <Grid container spacing={2}>
            {/* Budget overview */}
            <Grid item xs={12}>
              <SectionCard
                title="Budget Overview"
                subtitle="Monthly spending against category limits"
                action={
                  <Chip
                    size="small"
                    label={`$${totalSpent.toFixed(0)} / $${monthlyBudget}`}
                    color={budgetPct >= 90 ? 'error' : budgetPct >= 70 ? 'warning' : 'success'}
                  />
                }
              >
                <Box sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">Total this month</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>${totalSpent.toFixed(0)} / ${monthlyBudget}</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={budgetPct}
                    sx={{
                      height: 10,
                      borderRadius: 999,
                      bgcolor: 'rgba(0,0,0,0.06)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: budgetPct >= 90 ? '#e53935' : budgetPct >= 70 ? '#ff9800' : '#43a047',
                      },
                    }}
                  />
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>By category</Typography>
                {Object.entries(spentByCategory)
                  .filter(([, spent]) => spent > 0)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, spent]) => (
                    <ProgressRow
                      key={cat}
                      label={CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}
                      value={spent}
                      target={categoryLimits[cat as keyof typeof categoryLimits] || 1}
                      color={CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS]}
                    />
                  ))}
                {Object.values(spentByCategory).every((v) => v === 0) && (
                  <Typography variant="body2" color="text.secondary">No expenses recorded this month.</Typography>
                )}
              </SectionCard>
            </Grid>

            {/* Shopping Lists + Recent Expenses */}
            <Grid item xs={12} md={6}>
              <SectionCard
                title="Shopping Lists"
                subtitle="Active lists and item completion"
                action={<Button size="small" onClick={() => navigate('/app/shopping/lists')}>Open</Button>}
              >
                <Box sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">Items completed</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{checkedItems}/{totalListItems}</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={listCompletionRate}
                    sx={{ height: 8, borderRadius: 999, bgcolor: 'rgba(0,0,0,0.06)', '& .MuiLinearProgress-bar': { bgcolor: '#5c6bc0' } }}
                  />
                </Box>
                <Divider sx={{ my: 1.5 }} />
                {lists.length === 0 ? (
                  <Alert severity="info">No shopping lists yet. Create one or generate from your courses, workouts, or dietary plans.</Alert>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {lists.slice(0, 4).map((list) => {
                      const done = list.items.filter((i) => i.checked).length;
                      const pct = list.items.length > 0 ? clamp((done / list.items.length) * 100) : 0;
                      return (
                        <Paper key={list.id} variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{list.emoji} {list.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{done}/{list.items.length}</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={pct}
                            sx={{ height: 5, borderRadius: 999, bgcolor: 'rgba(0,0,0,0.06)', '& .MuiLinearProgress-bar': { bgcolor: '#5c6bc0' } }}
                          />
                        </Paper>
                      );
                    })}
                  </Box>
                )}
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Items by source</Typography>
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                  {Object.entries(listsBySource).map(([source, count]) => (
                    <Chip key={source} size="small" label={`${source}: ${count}`} />
                  ))}
                  {Object.keys(listsBySource).length === 0 && (
                    <Typography variant="caption" color="text.secondary">No items added yet.</Typography>
                  )}
                </Box>
              </SectionCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <SectionCard
                title="Recent Expenses"
                subtitle="Latest spending entries this month"
                action={<Button size="small" onClick={() => navigate('/app/shopping/budget')}>Details</Button>}
              >
                {recentExpenses.length === 0 ? (
                  <Alert severity="info">No expenses logged yet. Add expenses to track your monthly budget.</Alert>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {recentExpenses.map((expense) => (
                      <Box key={expense.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.75 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: CATEGORY_COLORS[expense.category], flexShrink: 0 }} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{expense.description}</Typography>
                            <Typography variant="caption" color="text.secondary">{CATEGORY_LABELS[expense.category]} · {expense.date}</Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, ml: 1, flexShrink: 0 }}>${expense.amount.toFixed(0)}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </SectionCard>
            </Grid>

            {/* Orders */}
            <Grid item xs={12}>
              <SectionCard
                title="Order Tracking"
                subtitle="Active and recent orders at a glance"
                action={<Button size="small" onClick={() => navigate('/app/shopping/orders')}>All Orders</Button>}
              >
                {orders.length === 0 ? (
                  <Alert severity="info">No orders yet. Place orders from your shopping lists or campus marketplace.</Alert>
                ) : (
                  <Grid container spacing={1.5}>
                    {orders.slice(0, 6).map((order) => {
                      const title = order.items.map((i) => i.name).join(', ');
                      return (
                        <Grid item xs={12} sm={6} key={order.id}>
                          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                                {title.length > 30 ? `${title.slice(0, 30)}…` : title}
                              </Typography>
                              <Chip
                                size="small"
                                label={STATUS_LABELS[order.status]}
                                color={order.status === 'delivered' ? 'success' : order.status === 'shipped' ? 'primary' : order.status === 'cancelled' ? 'error' : 'default'}
                              />
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              ${order.total.toFixed(0)} · ETA: {order.estimatedDelivery}
                            </Typography>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </SectionCard>
            </Grid>
          </Grid>
        </Grid>

        {/* Right 4 cols */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={2}>
            {/* Insights */}
            <Grid item xs={12}>
              <SectionCard title="Shopping Insights" subtitle="Key signals across all shopping sub-modules">
                {insights.length === 0 ? (
                  <Alert severity="info">Start using shopping lists, budget tracking, or orders to see insights.</Alert>
                ) : (
                  insights.map((insight) => (
                    <Alert key={insight.title} severity={insight.tone} sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.25 }}>{insight.title}</Typography>
                      <Typography variant="body2">{insight.body}</Typography>
                    </Alert>
                  ))
                )}
              </SectionCard>
            </Grid>

            {/* Marketplace */}
            <Grid item xs={12}>
              <SectionCard
                title="Campus Marketplace"
                subtitle="Top available listings"
                action={<Button size="small" onClick={() => navigate('/app/shopping/marketplace')}>Browse</Button>}
              >
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                  <Chip size="small" icon={<StorefrontIcon />} label={`${availableListings.length} available`} />
                  <Chip size="small" icon={<TrendingUpIcon />} label={`${avgDiscount}% avg off`} />
                  <Chip size="small" icon={<LocalMallIcon />} label={`${wishlistedCount} wishlisted`} />
                </Box>
                {availableListings.length === 0 ? (
                  <Alert severity="info">No active listings on the campus marketplace right now.</Alert>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {availableListings.slice(0, 4).map((listing) => (
                      <Box key={listing.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.5 }}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{listing.title}</Typography>
                          <Typography variant="caption" color="text.secondary">{listing.category} · {listing.condition}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right', flexShrink: 0, ml: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>${listing.price}</Typography>
                          {listing.originalPrice && (
                            <Typography variant="caption" color="text.disabled" sx={{ textDecoration: 'line-through' }}>${listing.originalPrice}</Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </SectionCard>
            </Grid>

            {/* Reviews */}
            <Grid item xs={12}>
              <SectionCard
                title="Recent Reviews"
                subtitle="Product feedback from your orders"
                action={<Button size="small" onClick={() => navigate('/app/shopping/orders')}>All</Button>}
              >
                {reviews.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No reviews written yet.</Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {reviews.slice(0, 3).map((review) => (
                      <Paper key={review.id} variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{review.productName}</Typography>
                          <Box sx={{ display: 'flex', gap: 0.25 }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <CheckCircleIcon key={i} sx={{ fontSize: 12, color: i < review.rating ? '#ffc107' : '#e0e0e0' }} />
                            ))}
                          </Box>
                        </Box>
                        <Typography variant="caption" color="text.secondary">{review.title}</Typography>
                      </Paper>
                    ))}
                  </Box>
                )}
              </SectionCard>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}