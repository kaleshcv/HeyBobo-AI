import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createUserStorage } from '@/lib/userStorage';

// ─── Helpers ──────────────────────────────────────────────
const genId = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

// ─── Types ────────────────────────────────────────────────
export type ListingCategory = 'textbooks' | 'electronics' | 'fitness-equipment' | 'study-supplies' | 'lab-materials' | 'other';
export type ListingCondition = 'new' | 'like-new' | 'good' | 'fair';
export type ListingStatus = 'available' | 'sold' | 'reserved';

export interface Seller {
  id: string;
  name: string;
  department: string;
  rating: number;
  joinedYear: number;
}

export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number | null;
  condition: ListingCondition;
  category: ListingCategory;
  seller: Seller;
  relatedCourseId: string | null;
  tags: string[];
  status: ListingStatus;
  postedAt: string;
  location: string;
  wishlisted: boolean;
  isOwn: boolean;
}

export interface MarketplaceMessage {
  id: string;
  listingId: string;
  fromName: string;
  text: string;
  sentAt: string;
  isOwn: boolean;
}

// ─── Store ────────────────────────────────────────────────
interface CampusMarketplaceState {
  listings: MarketplaceListing[];
  messages: MarketplaceMessage[];
  searchQuery: string;
  categoryFilter: ListingCategory | 'all';
  conditionFilter: ListingCondition | 'all';
  maxPrice: number;
  setSearch: (q: string) => void;
  setCategoryFilter: (c: ListingCategory | 'all') => void;
  setConditionFilter: (c: ListingCondition | 'all') => void;
  setMaxPrice: (p: number) => void;
  toggleWishlist: (listingId: string) => void;
  createListing: (listing: Omit<MarketplaceListing, 'id' | 'postedAt' | 'wishlisted' | 'isOwn' | 'seller' | 'status'>, sellerName: string) => void;
  markAsSold: (listingId: string) => void;
  markAsAvailable: (listingId: string) => void;
  deleteListing: (listingId: string) => void;
  sendMessage: (listingId: string, text: string, fromName: string) => void;
  getFilteredListings: () => MarketplaceListing[];
  getWishlistedListings: () => MarketplaceListing[];
  getMyListings: () => MarketplaceListing[];
}

export const useCampusMarketplaceStore = create<CampusMarketplaceState>()(
  persist(
    (set, get) => ({
      listings: [],
      messages: [],
      searchQuery: '',
      categoryFilter: 'all' as const,
      conditionFilter: 'all' as const,
      maxPrice: 500,

      setSearch: (q) => set({ searchQuery: q }),
      setCategoryFilter: (c) => set({ categoryFilter: c }),
      setConditionFilter: (c) => set({ conditionFilter: c }),
      setMaxPrice: (p) => set({ maxPrice: p }),

      toggleWishlist: (listingId) =>
        set((s) => ({
          listings: s.listings.map((l) => (l.id === listingId ? { ...l, wishlisted: !l.wishlisted } : l)),
        })),

      createListing: (listing, sellerName) =>
        set((s) => ({
          listings: [
            {
              ...listing,
              id: genId(),
              postedAt: now(),
              wishlisted: false,
              isOwn: true,
              status: 'available' as const,
              seller: { id: 'self', name: sellerName, department: 'You', rating: 5, joinedYear: 2024 },
            },
            ...s.listings,
          ],
        })),

      markAsSold: (listingId) =>
        set((s) => ({
          listings: s.listings.map((l) => (l.id === listingId ? { ...l, status: 'sold' as const } : l)),
        })),

      markAsAvailable: (listingId) =>
        set((s) => ({
          listings: s.listings.map((l) => (l.id === listingId ? { ...l, status: 'available' as const } : l)),
        })),

      deleteListing: (listingId) =>
        set((s) => ({ listings: s.listings.filter((l) => l.id !== listingId) })),

      sendMessage: (listingId, text, fromName) =>
        set((s) => ({
          messages: [
            ...s.messages,
            { id: genId(), listingId, fromName, text, sentAt: now(), isOwn: true },
          ],
        })),

      getFilteredListings: () => {
        const { listings, searchQuery, categoryFilter, conditionFilter, maxPrice } = get();
        return listings.filter((l) => {
          if (l.status === 'sold') return false;
          if (categoryFilter !== 'all' && l.category !== categoryFilter) return false;
          if (conditionFilter !== 'all' && l.condition !== conditionFilter) return false;
          if (l.price > maxPrice) return false;
          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q) || l.tags.some((t) => t.includes(q));
          }
          return true;
        });
      },

      getWishlistedListings: () => get().listings.filter((l) => l.wishlisted),
      getMyListings: () => get().listings.filter((l) => l.isOwn),
    }),
    { name: 'campus-marketplace', storage: createUserStorage() },
  ),
);

export const LISTING_CATEGORY_LABELS: Record<ListingCategory, string> = {
  textbooks: 'Textbooks',
  electronics: 'Electronics',
  'fitness-equipment': 'Fitness Equipment',
  'study-supplies': 'Study Supplies',
  'lab-materials': 'Lab Materials',
  other: 'Other',
};

export const CONDITION_LABELS: Record<ListingCondition, string> = {
  new: 'New',
  'like-new': 'Like New',
  good: 'Good',
  fair: 'Fair',
};
