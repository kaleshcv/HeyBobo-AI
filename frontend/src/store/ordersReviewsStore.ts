import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createUserStorage } from '@/lib/userStorage';

// ─── Helpers ──────────────────────────────────────────────
const genId = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

// ─── Types ────────────────────────────────────────────────
export type OrderStatus = 'placed' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type OrderSource = 'marketplace' | 'external' | 'shopping-list';

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface TrackingStep {
  label: string;
  date: string | null;
  done: boolean;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  source: OrderSource;
  placedAt: string;
  estimatedDelivery: string;
  trackingSteps: TrackingStep[];
}

export interface ProductReview {
  id: string;
  productName: string;
  rating: number;
  title: string;
  body: string;
  helpful: number;
  createdAt: string;
  orderId: string;
}

// ─── Status flow ──────────────────────────────────────────
const STATUS_FLOW: OrderStatus[] = ['placed', 'confirmed', 'shipped', 'delivered'];
const STATUS_LABELS: Record<OrderStatus, string> = {
  placed: 'Order Placed',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function buildTrackingSteps(status: OrderStatus): TrackingStep[] {
  const idx = STATUS_FLOW.indexOf(status);
  return STATUS_FLOW.map((s, i) => ({
    label: STATUS_LABELS[s],
    date: i <= idx ? now() : null,
    done: i <= idx,
  }));
}

// ─── Store ────────────────────────────────────────────────
interface OrdersReviewsState {
  orders: Order[];
  reviews: ProductReview[];
  placeOrder: (items: OrderItem[], source: OrderSource) => string;
  cancelOrder: (orderId: string) => void;
  advanceOrder: (orderId: string) => void;
  reorder: (orderId: string) => string;
  addReview: (review: Omit<ProductReview, 'id' | 'createdAt' | 'helpful'>) => void;
  deleteReview: (reviewId: string) => void;
  markHelpful: (reviewId: string) => void;
  getActiveOrders: () => Order[];
  getOrderHistory: () => Order[];
}

export { STATUS_LABELS };

export const useOrdersReviewsStore = create<OrdersReviewsState>()(
  persist(
    (set, get) => ({
      orders: [],
      reviews: [],

      placeOrder: (items, source) => {
        const id = genId();
        const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
        const est = new Date();
        est.setDate(est.getDate() + 7);
        const order: Order = {
          id, items, total, status: 'placed', source,
          placedAt: now(), estimatedDelivery: est.toISOString().slice(0, 10),
          trackingSteps: buildTrackingSteps('placed'),
        };
        set((s) => ({ orders: [order, ...s.orders] }));
        return id;
      },

      cancelOrder: (orderId) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId && (o.status === 'placed' || o.status === 'confirmed')
              ? { ...o, status: 'cancelled' as const, trackingSteps: o.trackingSteps.map((t) => ({ ...t, done: false })) }
              : o,
          ),
        })),

      advanceOrder: (orderId) =>
        set((s) => ({
          orders: s.orders.map((o) => {
            if (o.id !== orderId || o.status === 'delivered' || o.status === 'cancelled') return o;
            const idx = STATUS_FLOW.indexOf(o.status);
            if (idx < 0 || idx >= STATUS_FLOW.length - 1) return o;
            const newStatus = STATUS_FLOW[idx + 1];
            return { ...o, status: newStatus, trackingSteps: buildTrackingSteps(newStatus) };
          }),
        })),

      reorder: (orderId) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order) return '';
        return get().placeOrder(order.items, order.source);
      },

      addReview: (review) =>
        set((s) => ({
          reviews: [{ ...review, id: genId(), createdAt: now(), helpful: 0 }, ...s.reviews],
        })),

      deleteReview: (reviewId) =>
        set((s) => ({ reviews: s.reviews.filter((r) => r.id !== reviewId) })),

      markHelpful: (reviewId) =>
        set((s) => ({
          reviews: s.reviews.map((r) => (r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r)),
        })),

      getActiveOrders: () => get().orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled'),
      getOrderHistory: () => get().orders.filter((o) => o.status === 'delivered' || o.status === 'cancelled'),
    }),
    { name: 'orders-reviews', storage: createUserStorage() },
  ),
);
