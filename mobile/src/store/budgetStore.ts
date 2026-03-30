import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { asyncStorage } from '@/lib/storage'

export type ExpenseCategory = 'education' | 'fitness' | 'food' | 'grooming' | 'health' | 'transport' | 'entertainment' | 'other'

export interface Expense {
  id: string
  amount: number
  category: ExpenseCategory
  description: string
  date: string
  source: string
}

export interface PriceAlert {
  id: string
  productName: string
  targetPrice: number
  currentPrice: number
  active: boolean
  createdAt: string
}

interface BudgetState {
  monthlyBudget: number
  categoryLimits: Record<ExpenseCategory, number>
  expenses: Expense[]
  priceAlerts: PriceAlert[]

  setMonthlyBudget: (amount: number) => void
  setCategoryLimit: (category: ExpenseCategory, amount: number) => void
  addExpense: (expense: Expense) => void
  removeExpense: (id: string) => void
  addPriceAlert: (alert: PriceAlert) => void
  removePriceAlert: (id: string) => void
  togglePriceAlert: (id: string) => void
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set) => ({
      monthlyBudget: 5000,
      categoryLimits: {
        education: 800,
        fitness: 300,
        food: 600,
        grooming: 150,
        health: 400,
        transport: 400,
        entertainment: 500,
        other: 250,
      },
      expenses: [],
      priceAlerts: [],

      setMonthlyBudget: (monthlyBudget) => set({ monthlyBudget }),

      setCategoryLimit: (category, amount) =>
        set((s) => ({
          categoryLimits: { ...s.categoryLimits, [category]: amount },
        })),

      addExpense: (expense) =>
        set((s) => ({
          expenses: [...s.expenses, expense],
        })),

      removeExpense: (id) =>
        set((s) => ({
          expenses: s.expenses.filter((e) => e.id !== id),
        })),

      addPriceAlert: (alert) =>
        set((s) => ({
          priceAlerts: [...s.priceAlerts, alert],
        })),

      removePriceAlert: (id) =>
        set((s) => ({
          priceAlerts: s.priceAlerts.filter((p) => p.id !== id),
        })),

      togglePriceAlert: (id) =>
        set((s) => ({
          priceAlerts: s.priceAlerts.map((p) =>
            p.id === id ? { ...p, active: !p.active } : p
          ),
        })),
    }),
    {
      name: 'budget-store',
      storage: createJSONStorage(() => asyncStorage),
    }
  )
)
