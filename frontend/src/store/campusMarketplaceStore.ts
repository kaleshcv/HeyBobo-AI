import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

// ─── Seed data ────────────────────────────────────────────
const SELLERS: Seller[] = [
  { id: 'seller-1', name: 'Priya Sharma', department: 'Computer Science', rating: 4.8, joinedYear: 2023 },
  { id: 'seller-2', name: 'Arjun Patel', department: 'Mechanical Eng.', rating: 4.5, joinedYear: 2022 },
  { id: 'seller-3', name: 'Sneha Gupta', department: 'Biology', rating: 4.9, joinedYear: 2024 },
  { id: 'seller-4', name: 'Rahul Mehta', department: 'Computer Science', rating: 4.3, joinedYear: 2023 },
  { id: 'seller-5', name: 'Ananya Rao', department: 'Physics', rating: 4.7, joinedYear: 2022 },
  { id: 'seller-6', name: 'Karthik Nair', department: 'Data Science', rating: 4.6, joinedYear: 2024 },
];

const SEED_LISTINGS: MarketplaceListing[] = [
  {
    id: 'ml-1', title: 'Learning React — 2nd Edition (O\'Reilly)', description: 'Used for one semester, highlights in chapters 1-8. Great condition overall. Perfect for the React Crash Course.',
    price: 22, originalPrice: 55, condition: 'good', category: 'textbooks', seller: SELLERS[0], relatedCourseId: 'course-react',
    tags: ['react', 'javascript', 'web-dev'], status: 'available', postedAt: '2026-03-20T10:00:00Z', location: 'Library Lobby', wishlisted: false, isOwn: false,
  },
  {
    id: 'ml-2', title: 'Eloquent JavaScript — 4th Ed.', description: 'Barely used, no markings. Covers ES2024+ features comprehensively.',
    price: 18, originalPrice: 42, condition: 'like-new', category: 'textbooks', seller: SELLERS[3], relatedCourseId: 'course-js',
    tags: ['javascript', 'programming'], status: 'available', postedAt: '2026-03-19T14:30:00Z', location: 'CS Building, Room 201', wishlisted: false, isOwn: false,
  },
  {
    id: 'ml-3', title: 'Pair of 15 lb Dumbbells (Hex)', description: 'Rubber-coated hex dumbbells. Bought for home workouts, switching to gym membership. No damage.',
    price: 25, originalPrice: 45, condition: 'good', category: 'fitness-equipment', seller: SELLERS[1], relatedCourseId: null,
    tags: ['fitness', 'strength', 'dumbbells'], status: 'available', postedAt: '2026-03-18T09:15:00Z', location: 'Hostel Block C', wishlisted: false, isOwn: false,
  },
  {
    id: 'ml-4', title: 'TI-84 Plus CE Graphing Calculator', description: 'Works perfectly. Includes charging cable and cover. Essential for math & physics courses.',
    price: 55, originalPrice: 130, condition: 'good', category: 'electronics', seller: SELLERS[4], relatedCourseId: null,
    tags: ['calculator', 'math', 'physics'], status: 'available', postedAt: '2026-03-17T16:45:00Z', location: 'Science Block Canteen', wishlisted: false, isOwn: false,
  },
  {
    id: 'ml-5', title: 'Python Crash Course — 3rd Edition', description: 'Complete with all project files on USB. Perfect for beginners. Some notes in margins.',
    price: 15, originalPrice: 40, condition: 'fair', category: 'textbooks', seller: SELLERS[2], relatedCourseId: 'course-python',
    tags: ['python', 'programming', 'beginner'], status: 'available', postedAt: '2026-03-16T11:20:00Z', location: 'Cafeteria', wishlisted: false, isOwn: false,
  },
  {
    id: 'ml-6', title: 'Yoga Mat (6mm, Blue) + Carry Strap', description: 'Used for 2 months in yoga club. Still in great shape. Anti-slip surface.',
    price: 12, originalPrice: 28, condition: 'good', category: 'fitness-equipment', seller: SELLERS[5], relatedCourseId: null,
    tags: ['yoga', 'fitness', 'mat'], status: 'available', postedAt: '2026-03-15T08:00:00Z', location: 'Sports Complex', wishlisted: false, isOwn: false,
  },
  {
    id: 'ml-7', title: 'Lab Coat (Medium) + Safety Goggles', description: 'White lab coat, medium size. Wore it for one chem lab semester. Goggles included, scratch-free.',
    price: 10, originalPrice: 35, condition: 'good', category: 'lab-materials', seller: SELLERS[2], relatedCourseId: null,
    tags: ['lab', 'chemistry', 'safety'], status: 'available', postedAt: '2026-03-14T13:10:00Z', location: 'Chem Lab Building', wishlisted: false, isOwn: false,
  },
  {
    id: 'ml-8', title: 'Whiteboard Markers (12-pack, assorted)', description: 'Brand new, unopened. Bought extra for group study sessions. Expo brand.',
    price: 6, originalPrice: 12, condition: 'new', category: 'study-supplies', seller: SELLERS[0], relatedCourseId: null,
    tags: ['stationery', 'study', 'whiteboard'], status: 'available', postedAt: '2026-03-13T17:30:00Z', location: 'Library Lobby', wishlisted: false, isOwn: false,
  },
  {
    id: 'ml-9', title: 'Resistance Band Set (3 bands)', description: 'Light, medium, heavy bands. Used briefly for rehab. Latex-free.',
    price: 8, originalPrice: 20, condition: 'like-new', category: 'fitness-equipment', seller: SELLERS[1], relatedCourseId: null,
    tags: ['fitness', 'rehab', 'bands'], status: 'available', postedAt: '2026-03-12T10:45:00Z', location: 'Hostel Block A', wishlisted: false, isOwn: false,
  },
  {
    id: 'ml-10', title: 'TypeScript Handbook + Node.js Design Patterns (Bundle)', description: 'Selling both together. Excellent condition. Great for full-stack developers.',
    price: 28, originalPrice: 75, condition: 'like-new', category: 'textbooks', seller: SELLERS[3], relatedCourseId: 'course-ts',
    tags: ['typescript', 'nodejs', 'backend'], status: 'available', postedAt: '2026-03-11T12:00:00Z', location: 'CS Building, Room 105', wishlisted: false, isOwn: false,
  },
];

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
      listings: SEED_LISTINGS,
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
    { name: 'campus-marketplace' },
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
