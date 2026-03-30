import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createUserStorage } from '@/lib/userStorage';

// ─── Helpers ──────────────────────────────────────────────
const genId = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

// ─── Types ────────────────────────────────────────────────
export type ExpenseCategory = 'education' | 'fitness' | 'food' | 'grooming' | 'health' | 'transport' | 'entertainment' | 'other';

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
  source: string;
}

export interface PriceAlert {
  id: string;
  productName: string;
  targetPrice: number;
  currentPrice: number;
  active: boolean;
  createdAt: string;
}

// ─── Store ────────────────────────────────────────────────
interface BudgetState {
  monthlyBudget: number;
  categoryLimits: Record<ExpenseCategory, number>;
  expenses: Expense[];
  priceAlerts: PriceAlert[];
  setMonthlyBudget: (amount: number) => void;
  setCategoryLimit: (category: ExpenseCategory, limit: number) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  removeExpense: (id: string) => void;
  addPriceAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt'>) => void;
  removePriceAlert: (id: string) => void;
  togglePriceAlert: (id: string) => void;
  getMonthExpenses: () => Expense[];
  getSpentByCategory: () => Record<ExpenseCategory, number>;
  getTotalSpent: () => number;
  getBudgetRemaining: () => number;
}

const DEFAULT_LIMITS: Record<ExpenseCategory, number> = {
  education: 200,
  fitness: 80,
  food: 300,
  grooming: 40,
  health: 60,
  transport: 80,
  entertainment: 60,
  other: 80,
};



export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  education: '#5c6bc0',
  fitness: '#26a69a',
  food: '#ff7043',
  grooming: '#ab47bc',
  health: '#ef5350',
  transport: '#42a5f5',
  entertainment: '#ffa726',
  other: '#78909c',
};

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  education: 'Education',
  fitness: 'Fitness',
  food: 'Food & Grocery',
  grooming: 'Grooming',
  health: 'Health',
  transport: 'Transport',
  entertainment: 'Entertainment',
  other: 'Other',
};

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      monthlyBudget: 900,
      categoryLimits: { ...DEFAULT_LIMITS },
      expenses: [],
      priceAlerts: [],

      setMonthlyBudget: (amount) => set({ monthlyBudget: amount }),

      setCategoryLimit: (category, limit) =>
        set((s) => ({ categoryLimits: { ...s.categoryLimits, [category]: limit } })),

      addExpense: (expense) =>
        set((s) => ({ expenses: [{ ...expense, id: genId() }, ...s.expenses] })),

      removeExpense: (id) =>
        set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),

      addPriceAlert: (alert) =>
        set((s) => ({
          priceAlerts: [...s.priceAlerts, { ...alert, id: genId(), createdAt: now() }],
        })),

      removePriceAlert: (id) =>
        set((s) => ({ priceAlerts: s.priceAlerts.filter((a) => a.id !== id) })),

      togglePriceAlert: (id) =>
        set((s) => ({
          priceAlerts: s.priceAlerts.map((a) => (a.id === id ? { ...a, active: !a.active } : a)),
        })),

      getMonthExpenses: () => {
        const d = new Date();
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return get().expenses.filter((e) => e.date.startsWith(ym));
      },

      getSpentByCategory: () => {
        const monthExpenses = get().getMonthExpenses();
        const result: Record<string, number> = {};
        for (const cat of Object.keys(DEFAULT_LIMITS)) result[cat] = 0;
        for (const e of monthExpenses) result[e.category] = (result[e.category] ?? 0) + e.amount;
        return result as Record<ExpenseCategory, number>;
      },

      getTotalSpent: () => get().getMonthExpenses().reduce((s, e) => s + e.amount, 0),

      getBudgetRemaining: () => get().monthlyBudget - get().getTotalSpent(),
    }),
    { name: 'budget-tracker', storage: createUserStorage() },
  ),
);
