import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { asyncStorage } from '@/lib/storage'

export type OrderStatus = 'placed' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
  name: string
  quantity: number
  price: number
}

export interface TrackingStep {
  label: string
  date: string | null
  done: boolean
}

export interface Order {
  id: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  source: string
  placedAt: string
  estimatedDelivery: string
  trackingSteps: TrackingStep[]
}

export interface ProductReview {
  id: string
  productName: string
  rating: number
  title: string
  body: string
  createdAt: string
}

interface OrdersReviewsState {
  orders: Order[]
  reviews: ProductReview[]

  addOrder: (order: Order) => void
  updateOrderStatus: (id: string, status: OrderStatus) => void
  addReview: (review: ProductReview) => void
  removeReview: (id: string) => void
}

export const useOrdersReviewsStore = create<OrdersReviewsState>()(
  persist(
    (set) => ({
      orders: [],
      reviews: [],

      addOrder: (order) =>
        set((s) => ({
          orders: [...s.orders, order],
        })),

      updateOrderStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? { ...o, status } : o
          ),
        })),

      addReview: (review) =>
        set((s) => ({
          reviews: [...s.reviews, review],
        })),

      removeReview: (id) =>
        set((s) => ({
          reviews: s.reviews.filter((r) => r.id !== id),
        })),
    }),
    {
      name: 'orders-reviews-store',
      storage: createJSONStorage(() => asyncStorage),
    }
  )
)
