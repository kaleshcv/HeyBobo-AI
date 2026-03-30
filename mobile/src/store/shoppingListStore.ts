import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { asyncStorage } from '@/lib/storage'

export type ListSource = 'course' | 'fitness' | 'dietary' | 'injury' | 'grooming' | 'manual'
export type ListType = 'course-materials' | 'fitness-gear' | 'groceries' | 'recovery' | 'grooming' | 'custom'

export interface ShoppingItem {
  id: string
  name: string
  quantity: number
  unit: string
  estimatedPrice: number
  checked: boolean
  source: ListSource
  sourceDetail: string
  category: string
  addedAt: string
  note: string
}

export interface ShoppingList {
  id: string
  name: string
  emoji: string
  type: ListType
  items: ShoppingItem[]
  createdAt: string
  updatedAt: string
  budget: number | null
}

interface ShoppingListState {
  lists: ShoppingList[]
  activeListId: string | null

  addList: (list: ShoppingList) => void
  removeList: (id: string) => void
  setActiveList: (id: string | null) => void
  addItem: (listId: string, item: ShoppingItem) => void
  removeItem: (listId: string, itemId: string) => void
  toggleItem: (listId: string, itemId: string) => void
  updateItem: (listId: string, itemId: string, data: Partial<ShoppingItem>) => void
  clearChecked: (listId: string) => void
}

export const useShoppingListStore = create<ShoppingListState>()(
  persist(
    (set) => ({
      lists: [],
      activeListId: null,

      addList: (list) =>
        set((s) => ({
          lists: [...s.lists, list],
          activeListId: list.id,
        })),

      removeList: (id) =>
        set((s) => ({
          lists: s.lists.filter((l) => l.id !== id),
          activeListId: s.activeListId === id ? null : s.activeListId,
        })),

      setActiveList: (activeListId) => set({ activeListId }),

      addItem: (listId, item) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId ? { ...l, items: [...l.items, item] } : l
          ),
        })),

      removeItem: (listId, itemId) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId
              ? { ...l, items: l.items.filter((i) => i.id !== itemId) }
              : l
          ),
        })),

      toggleItem: (listId, itemId) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId
              ? {
                  ...l,
                  items: l.items.map((i) =>
                    i.id === itemId ? { ...i, checked: !i.checked } : i
                  ),
                }
              : l
          ),
        })),

      updateItem: (listId, itemId, data) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId
              ? {
                  ...l,
                  items: l.items.map((i) =>
                    i.id === itemId ? { ...i, ...data } : i
                  ),
                }
              : l
          ),
        })),

      clearChecked: (listId) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId
              ? { ...l, items: l.items.filter((i) => !i.checked) }
              : l
          ),
        })),
    }),
    {
      name: 'shopping-list-store',
      storage: createJSONStorage(() => asyncStorage),
    }
  )
)
