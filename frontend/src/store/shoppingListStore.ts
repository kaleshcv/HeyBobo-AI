import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Helpers ──────────────────────────────────────────────
const genId = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

// ─── Types ────────────────────────────────────────────────
export type ListSource = 'course' | 'fitness' | 'dietary' | 'injury' | 'grooming' | 'manual';
export type ListType = 'course-materials' | 'fitness-gear' | 'groceries' | 'recovery' | 'grooming' | 'custom';

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  checked: boolean;
  source: ListSource;
  sourceDetail: string;
  category: string;
  addedAt: string;
  note: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  emoji: string;
  type: ListType;
  items: ShoppingItem[];
  createdAt: string;
  updatedAt: string;
  budget: number | null;
}

// ─── Equipment price map (for fitness gear generation) ────
const EQUIPMENT_PRICES: Record<string, number> = {
  barbell: 120, bench: 150, dumbbells: 60, 'squat rack': 200,
  'pull-up bar': 30, 'yoga mat': 25, 'jump rope': 15,
  'rowing machine': 300, 'stationary bike': 250, treadmill: 500,
  'plyo box': 45, kettlebell: 35, 'resistance bands': 20,
  'foam roller': 22, 'exercise ball': 18,
};

// ─── Grocery staples by diet type ──────────────────────────
const DIET_GROCERIES: Record<string, { name: string; price: number; unit: string }[]> = {
  standard: [
    { name: 'Rice (5 kg)', price: 8, unit: 'bag' },
    { name: 'Whole wheat bread', price: 4, unit: 'loaf' },
    { name: 'Milk (1 gal)', price: 5, unit: 'gallon' },
    { name: 'Eggs (dozen)', price: 4, unit: 'dozen' },
    { name: 'Chicken breast (2 lb)', price: 10, unit: 'pack' },
    { name: 'Mixed vegetables', price: 6, unit: 'bag' },
    { name: 'Fruits (assorted)', price: 8, unit: 'bag' },
    { name: 'Cooking oil', price: 7, unit: 'bottle' },
  ],
  vegetarian: [
    { name: 'Lentils (2 lb)', price: 5, unit: 'bag' },
    { name: 'Tofu (firm)', price: 4, unit: 'pack' },
    { name: 'Paneer (400g)', price: 6, unit: 'pack' },
    { name: 'Black beans (canned)', price: 2, unit: 'can' },
    { name: 'Quinoa (1 lb)', price: 7, unit: 'bag' },
    { name: 'Greek yogurt', price: 5, unit: 'tub' },
    { name: 'Spinach (fresh)', price: 3, unit: 'bunch' },
    { name: 'Mixed nuts (1 lb)', price: 10, unit: 'bag' },
  ],
  vegan: [
    { name: 'Tofu (extra firm)', price: 4, unit: 'pack' },
    { name: 'Tempeh', price: 5, unit: 'pack' },
    { name: 'Chickpeas (canned)', price: 2, unit: 'can' },
    { name: 'Almond milk (1 gal)', price: 6, unit: 'gallon' },
    { name: 'Nutritional yeast', price: 8, unit: 'bag' },
    { name: 'Avocados (4 ct)', price: 5, unit: 'pack' },
    { name: 'Sweet potatoes (3 lb)', price: 4, unit: 'bag' },
    { name: 'Flax seeds (1 lb)', price: 6, unit: 'bag' },
  ],
  keto: [
    { name: 'Avocados (6 ct)', price: 7, unit: 'pack' },
    { name: 'Eggs (2 dozen)', price: 7, unit: 'box' },
    { name: 'Grass-fed butter', price: 6, unit: 'block' },
    { name: 'Cheese variety pack', price: 10, unit: 'pack' },
    { name: 'Almonds (1 lb)', price: 9, unit: 'bag' },
    { name: 'Coconut oil', price: 8, unit: 'jar' },
    { name: 'Salmon fillets (1 lb)', price: 12, unit: 'pack' },
    { name: 'Bacon (1 lb)', price: 7, unit: 'pack' },
  ],
  high_protein: [
    { name: 'Chicken breast (3 lb)', price: 14, unit: 'pack' },
    { name: 'Eggs (3 dozen)', price: 10, unit: 'box' },
    { name: 'Greek yogurt (32 oz)', price: 6, unit: 'tub' },
    { name: 'Whey protein (2 lb)', price: 35, unit: 'tub' },
    { name: 'Tuna cans (6-pack)', price: 8, unit: 'pack' },
    { name: 'Cottage cheese', price: 5, unit: 'tub' },
    { name: 'Turkey breast (2 lb)', price: 12, unit: 'pack' },
    { name: 'Peanut butter (natural)', price: 6, unit: 'jar' },
  ],
};

// ─── Recovery items by body region ──────────────────────────
const RECOVERY_ITEMS: Record<string, { name: string; price: number }[]> = {
  knee: [
    { name: 'Knee compression brace', price: 25 },
    { name: 'Ice pack (reusable)', price: 12 },
    { name: 'Foam roller', price: 22 },
  ],
  shoulder: [
    { name: 'Resistance band set (light)', price: 15 },
    { name: 'Shoulder support brace', price: 30 },
    { name: 'Heating pad', price: 28 },
  ],
  back: [
    { name: 'Lumbar support pillow', price: 35 },
    { name: 'Heating pad (large)', price: 32 },
    { name: 'Posture corrector', price: 22 },
  ],
  wrist: [
    { name: 'Wrist brace', price: 15 },
    { name: 'Hand therapy putty', price: 10 },
    { name: 'Compression wrap', price: 8 },
  ],
  ankle: [
    { name: 'Ankle brace', price: 20 },
    { name: 'Compression wrap', price: 12 },
    { name: 'Ice/heat ankle wrap', price: 18 },
  ],
  neck: [
    { name: 'Cervical pillow', price: 40 },
    { name: 'Neck heating wrap', price: 25 },
    { name: 'Massage ball set', price: 12 },
  ],
  hip: [
    { name: 'Hip flexor stretch strap', price: 15 },
    { name: 'Tennis ball (for myofascial release)', price: 5 },
    { name: 'Foam roller (long)', price: 28 },
  ],
  general: [
    { name: 'First aid kit', price: 18 },
    { name: 'Elastic bandage set', price: 10 },
    { name: 'Pain relief gel', price: 12 },
  ],
};

function bodyPartToRegion(bp: string): string {
  if (bp.includes('knee')) return 'knee';
  if (bp.includes('shoulder')) return 'shoulder';
  if (bp.includes('back')) return 'back';
  if (bp.includes('wrist')) return 'wrist';
  if (bp.includes('ankle')) return 'ankle';
  if (bp.includes('neck')) return 'neck';
  if (bp.includes('hip')) return 'hip';
  return 'general';
}

// ─── Store ────────────────────────────────────────────────
interface ShoppingListState {
  lists: ShoppingList[];
  createList: (name: string, type: ListType, emoji: string) => string;
  deleteList: (listId: string) => void;
  renameList: (listId: string, name: string) => void;
  setBudget: (listId: string, budget: number | null) => void;
  addItem: (listId: string, item: Omit<ShoppingItem, 'id' | 'addedAt'>) => void;
  removeItem: (listId: string, itemId: string) => void;
  toggleItem: (listId: string, itemId: string) => void;
  updateItemQuantity: (listId: string, itemId: string, qty: number) => void;
  updateItemPrice: (listId: string, itemId: string, price: number) => void;
  clearChecked: (listId: string) => void;
  generateFromCourses: (courses: { id: string; title: string }[]) => string;
  generateFromWorkouts: (equipmentList: string[]) => string;
  generateFromDiet: (dietType: string) => string;
  generateFromInjuries: (injuries: { name: string; bodyPart: string }[]) => string;
  getListTotal: (listId: string) => number;
  getListProgress: (listId: string) => { checked: number; total: number };
}

export const useShoppingListStore = create<ShoppingListState>()(
  persist(
    (set, get) => ({
      lists: [],

      createList: (name, type, emoji) => {
        const id = genId();
        set((s) => ({
          lists: [...s.lists, { id, name, emoji, type, items: [], createdAt: now(), updatedAt: now(), budget: null }],
        }));
        return id;
      },

      deleteList: (listId) => set((s) => ({ lists: s.lists.filter((l) => l.id !== listId) })),

      renameList: (listId, name) =>
        set((s) => ({
          lists: s.lists.map((l) => (l.id === listId ? { ...l, name, updatedAt: now() } : l)),
        })),

      setBudget: (listId, budget) =>
        set((s) => ({
          lists: s.lists.map((l) => (l.id === listId ? { ...l, budget, updatedAt: now() } : l)),
        })),

      addItem: (listId, item) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId
              ? { ...l, items: [...l.items, { ...item, id: genId(), addedAt: now() }], updatedAt: now() }
              : l,
          ),
        })),

      removeItem: (listId, itemId) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId ? { ...l, items: l.items.filter((i) => i.id !== itemId), updatedAt: now() } : l,
          ),
        })),

      toggleItem: (listId, itemId) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId
              ? { ...l, items: l.items.map((i) => (i.id === itemId ? { ...i, checked: !i.checked } : i)), updatedAt: now() }
              : l,
          ),
        })),

      updateItemQuantity: (listId, itemId, qty) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId
              ? { ...l, items: l.items.map((i) => (i.id === itemId ? { ...i, quantity: qty } : i)), updatedAt: now() }
              : l,
          ),
        })),

      updateItemPrice: (listId, itemId, price) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId
              ? { ...l, items: l.items.map((i) => (i.id === itemId ? { ...i, estimatedPrice: price } : i)), updatedAt: now() }
              : l,
          ),
        })),

      clearChecked: (listId) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId ? { ...l, items: l.items.filter((i) => !i.checked), updatedAt: now() } : l,
          ),
        })),

      generateFromCourses: (courses) => {
        const id = genId();
        const items: ShoppingItem[] = courses.flatMap((c) => [
          { id: genId(), name: `${c.title} — Textbook`, quantity: 1, unit: 'book', estimatedPrice: 45 + Math.floor(Math.random() * 30), checked: false, source: 'course' as const, sourceDetail: c.title, category: 'textbook', addedAt: now(), note: '' },
          { id: genId(), name: `Notebook for ${c.title}`, quantity: 1, unit: 'pc', estimatedPrice: 8, checked: false, source: 'course' as const, sourceDetail: c.title, category: 'stationery', addedAt: now(), note: '' },
        ]);
        set((s) => ({
          lists: [
            ...s.lists,
            { id, name: '📚 Course Materials', emoji: '📚', type: 'course-materials' as const, items, createdAt: now(), updatedAt: now(), budget: null },
          ],
        }));
        return id;
      },

      generateFromWorkouts: (equipmentList) => {
        const id = genId();
        const seen = new Set<string>();
        const items: ShoppingItem[] = equipmentList
          .filter((eq) => { if (seen.has(eq)) return false; seen.add(eq); return true; })
          .map((eq) => ({
            id: genId(), name: eq.charAt(0).toUpperCase() + eq.slice(1), quantity: 1, unit: 'pc',
            estimatedPrice: EQUIPMENT_PRICES[eq] ?? 30,
            checked: false, source: 'fitness' as const, sourceDetail: 'Workout Plan', category: 'equipment', addedAt: now(), note: '',
          }));
        set((s) => ({
          lists: [
            ...s.lists,
            { id, name: '🏋️ Fitness Gear', emoji: '🏋️', type: 'fitness-gear' as const, items, createdAt: now(), updatedAt: now(), budget: null },
          ],
        }));
        return id;
      },

      generateFromDiet: (dietType) => {
        const id = genId();
        const dt = dietType.toLowerCase().replace(/ /g, '_');
        const groceries = DIET_GROCERIES[dt] ?? DIET_GROCERIES.standard;
        const items: ShoppingItem[] = groceries.map((g) => ({
          id: genId(), name: g.name, quantity: 1, unit: g.unit, estimatedPrice: g.price,
          checked: false, source: 'dietary' as const, sourceDetail: dietType || 'Standard diet', category: 'grocery', addedAt: now(), note: '',
        }));
        set((s) => ({
          lists: [
            ...s.lists,
            { id, name: '🥗 Weekly Groceries', emoji: '🥗', type: 'groceries' as const, items, createdAt: now(), updatedAt: now(), budget: null },
          ],
        }));
        return id;
      },

      generateFromInjuries: (injuries) => {
        const id = genId();
        const items: ShoppingItem[] = injuries.flatMap((inj) => {
          const region = bodyPartToRegion(inj.bodyPart);
          const recItems = RECOVERY_ITEMS[region] ?? RECOVERY_ITEMS.general;
          return recItems.map((r) => ({
            id: genId(), name: r.name, quantity: 1, unit: 'pc', estimatedPrice: r.price,
            checked: false, source: 'injury' as const, sourceDetail: inj.name, category: 'recovery', addedAt: now(), note: `For: ${inj.name}`,
          }));
        });
        set((s) => ({
          lists: [
            ...s.lists,
            { id, name: '🩹 Recovery Items', emoji: '🩹', type: 'recovery' as const, items, createdAt: now(), updatedAt: now(), budget: null },
          ],
        }));
        return id;
      },

      getListTotal: (listId) => {
        const list = get().lists.find((l) => l.id === listId);
        if (!list) return 0;
        return list.items.reduce((sum, i) => sum + i.estimatedPrice * i.quantity, 0);
      },

      getListProgress: (listId) => {
        const list = get().lists.find((l) => l.id === listId);
        if (!list) return { checked: 0, total: 0 };
        return { checked: list.items.filter((i) => i.checked).length, total: list.items.length };
      },
    }),
    { name: 'shopping-lists' },
  ),
);
