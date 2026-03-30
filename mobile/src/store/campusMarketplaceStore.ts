import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { asyncStorage } from '@/lib/storage'

export type ListingCategory = 'textbooks' | 'electronics' | 'fitness-equipment' | 'study-supplies' | 'lab-materials' | 'other'
export type ListingCondition = 'new' | 'like-new' | 'good' | 'fair'
export type ListingStatus = 'available' | 'sold' | 'reserved'

export interface Seller {
  id: string
  name: string
  department: string
  rating: number
  joinedYear: number
}

export interface MarketplaceListing {
  id: string
  title: string
  description: string
  price: number
  originalPrice: number
  condition: ListingCondition
  category: ListingCategory
  seller: Seller
  images: string[]
  status: ListingStatus
  relatedCourseId?: string
  createdAt: string
}

interface CampusMarketplaceState {
  listings: MarketplaceListing[]
  myListings: MarketplaceListing[]
  savedListings: string[]
  activeCategory: ListingCategory | 'all'
  searchQuery: string

  setListings: (listings: MarketplaceListing[]) => void
  addListing: (listing: MarketplaceListing) => void
  removeListing: (id: string) => void
  toggleSaved: (id: string) => void
  setCategory: (category: ListingCategory | 'all') => void
  setSearch: (query: string) => void
}

export const useCampusMarketplaceStore = create<CampusMarketplaceState>()(
  persist(
    (set) => ({
      listings: [],
      myListings: [],
      savedListings: [],
      activeCategory: 'all',
      searchQuery: '',

      setListings: (listings) => set({ listings }),

      addListing: (listing) =>
        set((s) => ({
          myListings: [...s.myListings, listing],
          listings: [...s.listings, listing],
        })),

      removeListing: (id) =>
        set((s) => ({
          listings: s.listings.filter((l) => l.id !== id),
          myListings: s.myListings.filter((l) => l.id !== id),
        })),

      toggleSaved: (id) =>
        set((s) => ({
          savedListings: s.savedListings.includes(id)
            ? s.savedListings.filter((sid) => sid !== id)
            : [...s.savedListings, id],
        })),

      setCategory: (activeCategory) => set({ activeCategory }),

      setSearch: (searchQuery) => set({ searchQuery }),
    }),
    {
      name: 'campus-marketplace-store',
      storage: createJSONStorage(() => asyncStorage),
    }
  )
)
