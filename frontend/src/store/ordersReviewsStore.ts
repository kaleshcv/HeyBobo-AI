import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

// ─── Seed orders ──────────────────────────────────────────
const SEED_ORDERS: Order[] = [
  {
    id: 'ord-1',
    items: [
      { name: 'React Textbook (used)', quantity: 1, price: 22 },
      { name: 'Notebook', quantity: 2, price: 8 },
    ],
    total: 38, status: 'shipped', source: 'marketplace',
    placedAt: '2026-03-15T10:00:00Z', estimatedDelivery: '2026-03-25',
    trackingSteps: buildTrackingSteps('shipped'),
  },
  {
    id: 'ord-2',
    items: [
      { name: 'Resistance Bands Set', quantity: 1, price: 20 },
      { name: 'Yoga Mat', quantity: 1, price: 25 },
    ],
    total: 45, status: 'delivered', source: 'shopping-list',
    placedAt: '2026-03-08T14:30:00Z', estimatedDelivery: '2026-03-14',
    trackingSteps: buildTrackingSteps('delivered'),
  },
  {
    id: 'ord-3',
    items: [
      { name: 'Whey Protein (2 lb)', quantity: 1, price: 35 },
      { name: 'Shaker Bottle', quantity: 1, price: 10 },
    ],
    total: 45, status: 'confirmed', source: 'external',
    placedAt: '2026-03-20T09:00:00Z', estimatedDelivery: '2026-03-28',
    trackingSteps: buildTrackingSteps('confirmed'),
  },
];

const SEED_REVIEWS: ProductReview[] = [
  {
    id: 'rev-1', productName: 'Resistance Bands Set', rating: 5, title: 'Great for dorm workouts!',
    body: 'These bands are perfect for quick workouts between classes. The light band is great for rehab exercises too.',
    helpful: 3, createdAt: '2026-03-15T10:00:00Z', orderId: 'ord-2',
  },
  {
    id: 'rev-2', productName: 'Yoga Mat', rating: 4, title: 'Good quality, slightly thin',
    body: 'Works well for yoga and floor exercises. A bit thinner than expected but still comfortable.',
    helpful: 1, createdAt: '2026-03-16T12:00:00Z', orderId: 'ord-2',
  },
];

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
      orders: SEED_ORDERS,
      reviews: SEED_REVIEWS,

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
    { name: 'orders-reviews' },
  ),
);
