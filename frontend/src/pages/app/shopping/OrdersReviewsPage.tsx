import { useState } from 'react';
import {
  Box, Typography, Paper, Button, Chip, IconButton, TextField, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, Rating, Avatar,
  Stepper, Step, StepLabel, Alert, Tabs, Tab, Tooltip, InputAdornment,
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReplayIcon from '@mui/icons-material/Replay';
import CancelIcon from '@mui/icons-material/Cancel';
import RateReviewIcon from '@mui/icons-material/RateReview';
import DeleteIcon from '@mui/icons-material/Delete';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import AddIcon from '@mui/icons-material/Add';

import {
  useOrdersReviewsStore,
  STATUS_LABELS,
  type OrderStatus,
} from '@/store/ordersReviewsStore';

const STATUS_COLORS: Record<OrderStatus, string> = {
  placed: '#42a5f5',
  confirmed: '#66bb6a',
  shipped: '#ffa726',
  delivered: '#43a047',
  cancelled: '#ef5350',
};

export default function OrdersReviewsPage() {
  const orders = useOrdersReviewsStore((s) => s.orders);
  const reviews = useOrdersReviewsStore((s) => s.reviews);
  const cancelOrder = useOrdersReviewsStore((s) => s.cancelOrder);
  const advanceOrder = useOrdersReviewsStore((s) => s.advanceOrder);
  const reorder = useOrdersReviewsStore((s) => s.reorder);
  const placeOrder = useOrdersReviewsStore((s) => s.placeOrder);
  const addReview = useOrdersReviewsStore((s) => s.addReview);
  const deleteReview = useOrdersReviewsStore((s) => s.deleteReview);
  const markHelpful = useOrdersReviewsStore((s) => s.markHelpful);
  const getActiveOrders = useOrdersReviewsStore((s) => s.getActiveOrders);
  const getOrderHistory = useOrdersReviewsStore((s) => s.getOrderHistory);

  const activeOrders = getActiveOrders();
  const orderHistory = getOrderHistory();

  const [tab, setTab] = useState(0);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [reviewOrderId, setReviewOrderId] = useState('');
  const [reviewProductName, setReviewProductName] = useState('');
  const [reviewRating, setReviewRating] = useState<number | null>(4);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');

  // Manual order form
  const [orderItemName, setOrderItemName] = useState('');
  const [orderItemQty, setOrderItemQty] = useState('1');
  const [orderItemPrice, setOrderItemPrice] = useState('');

  const handleSubmitReview = () => {
    if (!reviewProductName.trim() || !reviewRating || !reviewTitle.trim()) return;
    addReview({
      productName: reviewProductName.trim(),
      rating: reviewRating,
      title: reviewTitle.trim(),
      body: reviewBody.trim(),
      orderId: reviewOrderId,
    });
    setReviewDialogOpen(false);
    setReviewProductName(''); setReviewRating(4); setReviewTitle(''); setReviewBody('');
    setTab(2); // switch to reviews tab
  };

  const handlePlaceOrder = () => {
    if (!orderItemName.trim() || !orderItemPrice) return;
    placeOrder(
      [{ name: orderItemName.trim(), quantity: parseInt(orderItemQty) || 1, price: parseFloat(orderItemPrice) }],
      'external',
    );
    setOrderDialogOpen(false);
    setOrderItemName(''); setOrderItemQty('1'); setOrderItemPrice('');
  };

  const openReviewFromOrder = (orderId: string, productName: string) => {
    setReviewOrderId(orderId);
    setReviewProductName(productName);
    setReviewDialogOpen(true);
  };

  return (
    <Box sx={{ flex: 1, px: 3, py: 3, overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#ec489920', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ReceiptLongIcon sx={{ fontSize: 20, color: '#ec4899' }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>Orders &amp; Reviews</Typography>
            <Typography variant="body2" color="text.secondary">
              Track your orders, reorder favorites, and share reviews with the campus community.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Quick stats */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {[
          { label: 'Active Orders', value: activeOrders.length, color: '#38bdf8', icon: <LocalShippingIcon sx={{ fontSize: 20 }} /> },
          { label: 'Completed', value: orderHistory.filter((o) => o.status === 'delivered').length, color: '#10b981', icon: <ReceiptLongIcon sx={{ fontSize: 20 }} /> },
          { label: 'Reviews Written', value: reviews.length, color: '#f59e0b', icon: <RateReviewIcon sx={{ fontSize: 20 }} /> },
          { label: 'Total Spent', value: `$${orders.reduce((s, o) => s + (o.status !== 'cancelled' ? o.total : 0), 0).toFixed(0)}`, color: '#a78bfa', icon: <ReceiptLongIcon sx={{ fontSize: 20 }} /> },
        ].map((s) => (
          <Grid item xs={12} sm={6} md={3} key={s.label}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <Avatar sx={{ bgcolor: `${s.color}20`, color: s.color, width: 42, height: 42 }}>{s.icon}</Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.3 }}>{s.label}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.1 }}>{s.value}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOrderDialogOpen(true)} sx={{ textTransform: 'none' }}>
          Place Order
        </Button>
        <Button variant="outlined" startIcon={<RateReviewIcon />}
          onClick={() => { setReviewOrderId(''); setReviewDialogOpen(true); }} sx={{ textTransform: 'none' }}>
          Write Review
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={`Active (${activeOrders.length})`} sx={{ textTransform: 'none' }} />
        <Tab label={`History (${orderHistory.length})`} sx={{ textTransform: 'none' }} />
        <Tab label={`Reviews (${reviews.length})`} sx={{ textTransform: 'none' }} />
      </Tabs>

      {/* Tab 0: Active Orders */}
      {tab === 0 && (
        activeOrders.length === 0 ? (
          <Alert severity="info">No active orders. Place an order to start tracking!</Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {activeOrders.map((order) => (
              <Paper key={order.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <LocalShippingIcon sx={{ color: STATUS_COLORS[order.status] }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Order #{order.id.slice(0, 8)}</Typography>
                  <Chip label={STATUS_LABELS[order.status]} size="small"
                    sx={{ bgcolor: STATUS_COLORS[order.status] + '22', color: STATUS_COLORS[order.status], fontWeight: 600 }} />
                  <Typography variant="caption" color="text.secondary">
                    Placed: {new Date(order.placedAt).toLocaleDateString()}
                  </Typography>
                  <Box sx={{ flex: 1 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>${order.total.toFixed(0)}</Typography>
                </Box>

                {/* Tracking stepper */}
                <Stepper alternativeLabel sx={{ mb: 2 }}>
                  {order.trackingSteps.map((step) => (
                    <Step key={step.label} completed={step.done}>
                      <StepLabel
                        StepIconProps={{ sx: { color: step.done ? 'success.main' : 'grey.400' } }}
                      >
                        <Typography variant="caption">{step.label}</Typography>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {/* Items */}
                <Box sx={{ bgcolor: 'grey.50', borderRadius: 1, p: 1.5, mb: 1.5 }}>
                  {order.items.map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                      <Typography variant="body2">{item.name} × {item.quantity}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>${(item.price * item.quantity).toFixed(0)}</Typography>
                    </Box>
                  ))}
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Est. delivery: {order.estimatedDelivery}
                </Typography>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                  {(order.status === 'placed' || order.status === 'confirmed') && (
                    <Button size="small" variant="outlined" color="error" startIcon={<CancelIcon />}
                      onClick={() => cancelOrder(order.id)} sx={{ textTransform: 'none' }}>
                      Cancel
                    </Button>
                  )}
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <Tooltip title="Simulate next status update">
                      <Button size="small" variant="outlined" onClick={() => advanceOrder(order.id)} sx={{ textTransform: 'none' }}>
                        Simulate Next Step
                      </Button>
                    </Tooltip>
                  )}
                </Box>
              </Paper>
            ))}
          </Box>
        )
      )}

      {/* Tab 1: Order History */}
      {tab === 1 && (
        orderHistory.length === 0 ? (
          <Alert severity="info">No past orders yet.</Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {orderHistory.map((order) => (
              <Paper key={order.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                  <Chip label={STATUS_LABELS[order.status]} size="small"
                    sx={{ bgcolor: STATUS_COLORS[order.status] + '22', color: STATUS_COLORS[order.status], fontWeight: 600 }} />
                  <Typography variant="subtitle2">Order #{order.id.slice(0, 8)}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(order.placedAt).toLocaleDateString()}
                  </Typography>
                  <Box sx={{ flex: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>${order.total.toFixed(0)}</Typography>
                </Box>

                <Box sx={{ mb: 1 }}>
                  {order.items.map((item, i) => (
                    <Typography key={i} variant="body2" color="text.secondary">
                      {item.name} × {item.quantity} — ${(item.price * item.quantity).toFixed(0)}
                    </Typography>
                  ))}
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  {order.status === 'delivered' && (
                    <>
                      <Button size="small" variant="outlined" startIcon={<ReplayIcon />}
                        onClick={() => reorder(order.id)} sx={{ textTransform: 'none' }}>
                        Reorder
                      </Button>
                      <Button size="small" variant="outlined" startIcon={<RateReviewIcon />}
                        onClick={() => openReviewFromOrder(order.id, order.items[0]?.name || '')}
                        sx={{ textTransform: 'none' }}>
                        Review
                      </Button>
                    </>
                  )}
                </Box>
              </Paper>
            ))}
          </Box>
        )
      )}

      {/* Tab 2: Reviews */}
      {tab === 2 && (
        reviews.length === 0 ? (
          <Alert severity="info">No reviews yet. Share your experience with products you've bought!</Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {reviews.map((r) => (
              <Paper key={r.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                  <Rating value={r.rating} readOnly size="small" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>{r.title}</Typography>
                  <IconButton size="small" onClick={() => deleteReview(r.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Chip label={r.productName} size="small" variant="outlined" sx={{ mb: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{r.body}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button size="small" variant="text" startIcon={<ThumbUpIcon />}
                    onClick={() => markHelpful(r.id)} sx={{ textTransform: 'none' }}>
                    Helpful ({r.helpful})
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        )
      )}

      {/* Write Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Write a Review</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label="Product Name" fullWidth size="small" value={reviewProductName}
            onChange={(e) => setReviewProductName(e.target.value)} autoFocus />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">Rating:</Typography>
            <Rating value={reviewRating} onChange={(_, v) => setReviewRating(v)} />
          </Box>
          <TextField label="Review Title" fullWidth size="small" value={reviewTitle}
            onChange={(e) => setReviewTitle(e.target.value)} placeholder="e.g. Perfect for campus workouts!" />
          <TextField label="Your Review" fullWidth size="small" multiline rows={3} value={reviewBody}
            onChange={(e) => setReviewBody(e.target.value)} placeholder="Share your experience..." />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setReviewDialogOpen(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitReview}
            disabled={!reviewProductName.trim() || !reviewRating || !reviewTitle.trim()} sx={{ textTransform: 'none' }}>
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>

      {/* Place Order Dialog */}
      <Dialog open={orderDialogOpen} onClose={() => setOrderDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Place an Order</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label="Item Name" fullWidth size="small" value={orderItemName}
            onChange={(e) => setOrderItemName(e.target.value)} autoFocus placeholder="e.g. Whey Protein 2lb" />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Quantity" type="number" size="small" value={orderItemQty}
              onChange={(e) => setOrderItemQty(e.target.value)} sx={{ flex: 1 }} inputProps={{ min: 1 }} />
            <TextField label="Price" type="number" size="small" value={orderItemPrice}
              onChange={(e) => setOrderItemPrice(e.target.value)} sx={{ flex: 1 }}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOrderDialogOpen(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" onClick={handlePlaceOrder}
            disabled={!orderItemName.trim() || !orderItemPrice} sx={{ textTransform: 'none' }}>
            Place Order
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
