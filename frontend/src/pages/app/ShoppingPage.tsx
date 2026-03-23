import { Box, Typography, Paper, LinearProgress, Grid, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ListAltIcon from '@mui/icons-material/ListAlt';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

import { useShoppingListStore } from '@/store/shoppingListStore';
import { useCampusMarketplaceStore } from '@/store/campusMarketplaceStore';
import { useBudgetStore } from '@/store/budgetStore';
import { useOrdersReviewsStore } from '@/store/ordersReviewsStore';

export default function ShoppingPage() {
  const navigate = useNavigate();
  const lists = useShoppingListStore((s) => s.lists);
  const listings = useCampusMarketplaceStore((s) => s.listings);
  const monthlyBudget = useBudgetStore((s) => s.monthlyBudget);
  const getTotalSpent = useBudgetStore((s) => s.getTotalSpent);
  const getActiveOrders = useOrdersReviewsStore((s) => s.getActiveOrders);
  const reviews = useOrdersReviewsStore((s) => s.reviews);

  const totalSpent = getTotalSpent();
  const activeOrders = getActiveOrders();
  const remaining = monthlyBudget - totalSpent;
  const budgetPct = monthlyBudget > 0 ? Math.min((totalSpent / monthlyBudget) * 100, 100) : 0;
  const totalListItems = lists.reduce((s, l) => s + l.items.length, 0);
  const checkedItems = lists.reduce((s, l) => s + l.items.filter((i) => i.checked).length, 0);
  const availableListings = listings.filter((l) => l.status === 'available').length;

  const cards = [
    {
      title: 'Shopping Lists', icon: <ListAltIcon />, color: '#5c6bc0',
      stat: `${lists.length} lists · ${totalListItems} items`,
      sub: checkedItems > 0 ? `${checkedItems} items checked off` : 'Generate from courses, workouts, diet',
      path: '/app/shopping/lists',
    },
    {
      title: 'Campus Marketplace', icon: <StorefrontIcon />, color: '#26a69a',
      stat: `${availableListings} listings available`,
      sub: 'Buy & sell textbooks, gear, supplies',
      path: '/app/shopping/marketplace',
    },
    {
      title: 'Budget & Expenses', icon: <AccountBalanceWalletIcon />, color: '#ff7043',
      stat: `$${totalSpent.toFixed(0)} / $${monthlyBudget}`,
      sub: remaining >= 0 ? `$${remaining.toFixed(0)} remaining` : `$${Math.abs(remaining).toFixed(0)} over budget`,
      path: '/app/shopping/budget',
    },
    {
      title: 'Orders & Reviews', icon: <ReceiptLongIcon />, color: '#ab47bc',
      stat: `${activeOrders.length} active · ${reviews.length} reviews`,
      sub: 'Track orders, write reviews, reorder',
      path: '/app/shopping/orders',
    },
  ];

  return (
    <Box sx={{ flex: 1, px: 3, py: 3, overflow: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>Shopping</Typography>
          <Typography variant="body2" color="text.secondary">
            Auto-generated shopping lists, campus marketplace, budget tracking, and order management.
          </Typography>
        </Box>
      </Box>

      {/* Budget mini-summary */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2">Monthly Budget</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: remaining < 0 ? 'error.main' : 'success.main' }}>
            ${totalSpent.toFixed(0)} / ${monthlyBudget}
          </Typography>
        </Box>
        <LinearProgress variant="determinate" value={budgetPct}
          sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { bgcolor: remaining < 0 ? '#e53935' : remaining < monthlyBudget * 0.2 ? '#ff9800' : '#43a047' } }} />
      </Paper>

      {/* Feature cards */}
      <Grid container spacing={2}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} key={card.title}>
            <Paper
              variant="outlined"
              onClick={() => navigate(card.path)}
              sx={{ p: 2, borderRadius: 3, cursor: 'pointer', display: 'flex', gap: 1.5, alignItems: 'flex-start', '&:hover': { borderColor: '#bdbdbd', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' } }}
            >
              <Avatar sx={{ bgcolor: card.color, width: 42, height: 42 }}>{card.icon}</Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.3 }}>{card.title}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{card.stat}</Typography>
                <Typography variant="caption" color="text.secondary">{card.sub}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}