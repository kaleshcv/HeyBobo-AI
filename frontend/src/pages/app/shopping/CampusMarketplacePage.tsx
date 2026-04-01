import { useState } from 'react';
import {
  Box, Typography, Paper, Button, Chip, IconButton, TextField, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem,
  InputAdornment, Tabs, Tab, Rating, Avatar, Alert,
  FormControl, InputLabel, Slider,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import SellIcon from '@mui/icons-material/Sell';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import {
  useCampusMarketplaceStore,
  LISTING_CATEGORY_LABELS,
  CONDITION_LABELS,
  type ListingCategory,
  type ListingCondition,
} from '@/store/campusMarketplaceStore';
import { useAuthStore } from '@/store/authStore';

const CATEGORY_ICONS: Record<string, string> = {
  textbooks: '📚', electronics: '💻', 'fitness-equipment': '🏋️',
  'study-supplies': '✏️', 'lab-materials': '🧪', other: '📦',
};

export default function CampusMarketplacePage() {
  const listings = useCampusMarketplaceStore((s) => s.listings);
  const messages = useCampusMarketplaceStore((s) => s.messages);
  const searchQuery = useCampusMarketplaceStore((s) => s.searchQuery);
  const categoryFilter = useCampusMarketplaceStore((s) => s.categoryFilter);
  const conditionFilter = useCampusMarketplaceStore((s) => s.conditionFilter);
  const maxPrice = useCampusMarketplaceStore((s) => s.maxPrice);
  const setSearch = useCampusMarketplaceStore((s) => s.setSearch);
  const setCategoryFilter = useCampusMarketplaceStore((s) => s.setCategoryFilter);
  const setConditionFilter = useCampusMarketplaceStore((s) => s.setConditionFilter);
  const setMaxPrice = useCampusMarketplaceStore((s) => s.setMaxPrice);
  const toggleWishlist = useCampusMarketplaceStore((s) => s.toggleWishlist);
  const createListing = useCampusMarketplaceStore((s) => s.createListing);
  const markAsSold = useCampusMarketplaceStore((s) => s.markAsSold);
  const markAsAvailable = useCampusMarketplaceStore((s) => s.markAsAvailable);
  const deleteListing = useCampusMarketplaceStore((s) => s.deleteListing);
  const sendMessage = useCampusMarketplaceStore((s) => s.sendMessage);
  const getFilteredListings = useCampusMarketplaceStore((s) => s.getFilteredListings);
  const getWishlistedListings = useCampusMarketplaceStore((s) => s.getWishlistedListings);
  const getMyListings = useCampusMarketplaceStore((s) => s.getMyListings);

  const user = useAuthStore((s) => s.user);

  const [tab, setTab] = useState(0);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [detailListing, setDetailListing] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  // Sell form state
  const [sellTitle, setSellTitle] = useState('');
  const [sellDesc, setSellDesc] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [sellOriginal, setSellOriginal] = useState('');
  const [sellCondition, setSellCondition] = useState<ListingCondition>('good');
  const [sellCategory, setSellCategory] = useState<ListingCategory>('textbooks');
  const [sellLocation, setSellLocation] = useState('');
  const [sellTags, setSellTags] = useState('');

  const filtered = getFilteredListings();
  const wishlisted = getWishlistedListings();
  const myListings = getMyListings();
  const detail = listings.find((l) => l.id === detailListing);
  const detailMessages = messages.filter((m) => m.listingId === detailListing);

  const tabListings = tab === 0 ? filtered : tab === 1 ? wishlisted : myListings;

  const handleCreateListing = () => {
    if (!sellTitle.trim() || !sellPrice) return;
    createListing(
      {
        title: sellTitle.trim(),
        description: sellDesc.trim(),
        price: parseFloat(sellPrice),
        originalPrice: sellOriginal ? parseFloat(sellOriginal) : null,
        condition: sellCondition,
        category: sellCategory,
        relatedCourseId: null,
        tags: sellTags.split(',').map((t) => t.trim()).filter(Boolean),
        location: sellLocation.trim() || 'Campus',
      },
      user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'You',
    );
    setSellDialogOpen(false);
    setSellTitle(''); setSellDesc(''); setSellPrice(''); setSellOriginal('');
    setSellCondition('good'); setSellCategory('textbooks'); setSellLocation(''); setSellTags('');
    setTab(2); // switch to My Listings
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !detailListing) return;
    sendMessage(detailListing, messageText.trim(), user?.firstName || 'You');
    setMessageText('');
  };

  return (
    <Box sx={{ flex: 1, px: { xs: 2.5, md: 4, lg: 5 }, py: 3, overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#06b6d420', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <StorefrontIcon sx={{ fontSize: 20, color: '#06b6d4' }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>Campus Marketplace</Typography>
            <Typography variant="body2" color="text.secondary">
              Buy &amp; sell textbooks, equipment, and supplies with fellow students on campus.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Search + Filters + Sell Button */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small" placeholder="Search listings..."
            value={searchQuery} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
            sx={{ minWidth: 220, flex: 1 }}
          />

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Category</InputLabel>
            <Select value={categoryFilter} label="Category" onChange={(e) => setCategoryFilter(e.target.value as ListingCategory | 'all')}>
              <MenuItem value="all">All Categories</MenuItem>
              {Object.entries(LISTING_CATEGORY_LABELS).map(([k, v]) => (
                <MenuItem key={k} value={k}>{CATEGORY_ICONS[k]} {v}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Condition</InputLabel>
            <Select value={conditionFilter} label="Condition" onChange={(e) => setConditionFilter(e.target.value as ListingCondition | 'all')}>
              <MenuItem value="all">Any</MenuItem>
              {Object.entries(CONDITION_LABELS).map(([k, v]) => (
                <MenuItem key={k} value={k}>{v}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ width: 150 }}>
            <Typography variant="caption" color="text.secondary">Max: ${maxPrice}</Typography>
            <Slider size="small" value={maxPrice} onChange={(_, v) => setMaxPrice(v as number)} min={1} max={500} />
          </Box>

          <Button variant="contained" startIcon={<SellIcon />} onClick={() => setSellDialogOpen(true)} sx={{ textTransform: 'none' }}>
            Sell Item
          </Button>
        </Box>
      </Paper>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={`Browse (${filtered.length})`} sx={{ textTransform: 'none' }} />
        <Tab label={`Wishlist (${wishlisted.length})`} sx={{ textTransform: 'none' }} />
        <Tab label={`My Listings (${myListings.length})`} sx={{ textTransform: 'none' }} />
      </Tabs>

      {/* Listings grid */}
      {tabListings.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          {tab === 0 ? 'No listings match your filters.' : tab === 1 ? 'No wishlisted items yet. Browse and heart items you like!' : 'You haven\'t listed anything yet. Click "Sell Item" to get started.'}
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {tabListings.map((listing) => (
            <Grid item xs={12} sm={6} md={4} key={listing.id}>
              <Paper
                variant="outlined"
                sx={{ p: 2, borderRadius: 3, cursor: 'pointer', position: 'relative', '&:hover': { bgcolor: 'action.hover' } }}
                onClick={() => setDetailListing(listing.id)}
              >
                {listing.status === 'sold' && (
                  <Chip label="SOLD" size="small" color="error" sx={{ position: 'absolute', top: 8, right: 8, fontWeight: 700 }} />
                )}

                {/* Category header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography sx={{ fontSize: 20 }}>{CATEGORY_ICONS[listing.category]}</Typography>
                  <Chip label={LISTING_CATEGORY_LABELS[listing.category]} size="small" variant="outlined" sx={{ height: 20, fontSize: 11 }} />
                  <Box sx={{ flex: 1 }} />
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleWishlist(listing.id); }}>
                    {listing.wishlisted ? <FavoriteIcon fontSize="small" sx={{ color: '#e91e63' }} /> : <FavoriteBorderIcon fontSize="small" />}
                  </IconButton>
                </Box>

                {/* Title & Price */}
                <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3, mb: 0.5 }} noWrap>
                  {listing.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>${listing.price}</Typography>
                  {listing.originalPrice && (
                    <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.disabled' }}>
                      ${listing.originalPrice}
                    </Typography>
                  )}
                  {listing.originalPrice && (
                    <Chip
                      label={`${Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)}% off`}
                      size="small" color="success" sx={{ height: 20, fontSize: 11 }}
                    />
                  )}
                </Box>

                {/* Description */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {listing.description}
                </Typography>

                {/* Seller + Condition + Location */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label={CONDITION_LABELS[listing.condition]} size="small" variant="outlined" sx={{ height: 20, fontSize: 11 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">{listing.location}</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Avatar sx={{ width: 20, height: 20, fontSize: 10, bgcolor: '#5c6bc0' }}>
                      {listing.seller.name.charAt(0)}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">{listing.isOwn ? 'You' : listing.seller.name}</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Detail / Contact Dialog */}
      <Dialog open={!!detail} onClose={() => setDetailListing(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {detail && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: 20 }}>{CATEGORY_ICONS[detail.category]}</Typography>
              {detail.title}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Chip label={`$${detail.price}`} color="success" sx={{ fontWeight: 700 }} />
                <Chip label={CONDITION_LABELS[detail.condition]} variant="outlined" />
                <Chip label={LISTING_CATEGORY_LABELS[detail.category]} variant="outlined" />
              </Box>

              <Typography variant="body1" sx={{ mb: 2 }}>{detail.description}</Typography>

              {/* Seller info */}
              <Paper variant="outlined" sx={{ p: 1.5, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: '#5c6bc0' }}>{detail.seller.name.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="subtitle2">{detail.isOwn ? 'You' : detail.seller.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{detail.seller.department} · Joined {detail.seller.joinedYear}</Typography>
                </Box>
                <Box sx={{ flex: 1 }} />
                <Rating value={detail.seller.rating} readOnly precision={0.1} size="small" />
              </Paper>

              <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
                <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">Pickup: {detail.location}</Typography>
              </Box>

              {detail.tags.length > 0 && (
                <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
                  {detail.tags.map((t) => (
                    <Chip key={t} label={t} size="small" variant="outlined" sx={{ height: 22 }} />
                  ))}
                </Box>
              )}

              {/* Messaging */}
              {!detail.isOwn && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Contact Seller</Typography>
                  {detailMessages.length > 0 && (
                    <Box sx={{ maxHeight: 150, overflow: 'auto', mb: 1 }}>
                      {detailMessages.map((m) => (
                        <Box key={m.id} sx={{ mb: 0.5, p: 1, bgcolor: m.isOwn ? 'primary.50' : 'grey.50', borderRadius: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>{m.fromName}</Typography>
                          <Typography variant="body2">{m.text}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small" fullWidth placeholder="Ask about this item..."
                      value={messageText} onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <IconButton color="primary" onClick={handleSendMessage} disabled={!messageText.trim()}>
                      <SendIcon />
                    </IconButton>
                  </Box>
                </Box>
              )}

              {/* Own listing controls */}
              {detail.isOwn && (
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  {detail.status === 'available' ? (
                    <Button variant="contained" color="warning" startIcon={<CheckCircleIcon />}
                      onClick={() => { markAsSold(detail.id); setDetailListing(null); }} sx={{ textTransform: 'none' }}>
                      Mark as Sold
                    </Button>
                  ) : (
                    <Button variant="outlined" onClick={() => { markAsAvailable(detail.id); setDetailListing(null); }} sx={{ textTransform: 'none' }}>
                      Re-list as Available
                    </Button>
                  )}
                  <Button variant="outlined" color="error" startIcon={<DeleteIcon />}
                    onClick={() => { deleteListing(detail.id); setDetailListing(null); }} sx={{ textTransform: 'none' }}>
                    Delete
                  </Button>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setDetailListing(null)} sx={{ textTransform: 'none', color: 'text.secondary' }}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Sell Item Dialog */}
      <Dialog open={sellDialogOpen} onClose={() => setSellDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Sell an Item</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label="Title" fullWidth size="small" value={sellTitle} onChange={(e) => setSellTitle(e.target.value)}
            placeholder="e.g. React Textbook — 2nd Edition" autoFocus />
          <TextField label="Description" fullWidth size="small" multiline rows={3} value={sellDesc} onChange={(e) => setSellDesc(e.target.value)}
            placeholder="Condition details, any markings, what's included..." />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Your Price" type="number" size="small" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} sx={{ flex: 1 }} />
            <TextField label="Original Price (optional)" type="number" size="small" value={sellOriginal} onChange={(e) => setSellOriginal(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} sx={{ flex: 1 }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Category</InputLabel>
              <Select value={sellCategory} label="Category" onChange={(e) => setSellCategory(e.target.value as ListingCategory)}>
                {Object.entries(LISTING_CATEGORY_LABELS).map(([k, v]) => (
                  <MenuItem key={k} value={k}>{CATEGORY_ICONS[k]} {v}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Condition</InputLabel>
              <Select value={sellCondition} label="Condition" onChange={(e) => setSellCondition(e.target.value as ListingCondition)}>
                {Object.entries(CONDITION_LABELS).map(([k, v]) => (
                  <MenuItem key={k} value={k}>{v}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <TextField label="Pickup Location" size="small" value={sellLocation} onChange={(e) => setSellLocation(e.target.value)}
            placeholder="e.g. Library Lobby, Hostel Block C" />
          <TextField label="Tags (comma-separated)" size="small" value={sellTags} onChange={(e) => setSellTags(e.target.value)}
            placeholder="e.g. react, web-dev, textbook" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSellDialogOpen(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateListing} disabled={!sellTitle.trim() || !sellPrice} sx={{ textTransform: 'none' }}>
            List for Sale
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
