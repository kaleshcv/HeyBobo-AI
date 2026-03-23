import api from './client'
import type { MealLog, FoodItem, NutritionSummary, MealPlan, GroceryItem, MealType } from '@/types'

export const dietaryApi = {
  logMeal: (data: {
    foodItemId?: string
    foodItem?: Partial<FoodItem>
    date: string
    mealType: MealType
    quantity: number
  }) => api.post<MealLog>('/dietary/meals', data).then((r) => r.data),

  getMealLogs: (date: string) =>
    api.get<MealLog[]>('/dietary/meals', { params: { date } }).then((r) => r.data),

  deleteMealLog: (logId: string) =>
    api.delete(`/dietary/meals/${logId}`).then((r) => r.data),

  getNutritionSummary: (date: string) =>
    api.get<NutritionSummary>('/dietary/nutrition/summary', { params: { date } }).then((r) => r.data),

  searchFood: (query: string) =>
    api.get<FoodItem[]>('/dietary/food/search', { params: { q: query } }).then((r) => r.data),

  getFoodByBarcode: (barcode: string) =>
    api.get<FoodItem>(`/dietary/food/barcode/${barcode}`).then((r) => r.data),

  getMealPlans: () =>
    api.get<MealPlan[]>('/dietary/meal-plans').then((r) => r.data),

  createMealPlan: (data: Partial<MealPlan>) =>
    api.post<MealPlan>('/dietary/meal-plans', data).then((r) => r.data),

  getGroceryList: () =>
    api.get<GroceryItem[]>('/dietary/grocery').then((r) => r.data),

  updateGroceryItem: (id: string, data: Partial<GroceryItem>) =>
    api.patch<GroceryItem>(`/dietary/grocery/${id}`, data).then((r) => r.data),

  addGroceryItem: (item: Omit<GroceryItem, 'id'>) =>
    api.post<GroceryItem>('/dietary/grocery', item).then((r) => r.data),

  deleteGroceryItem: (id: string) =>
    api.delete(`/dietary/grocery/${id}`).then((r) => r.data),

  getDietaryProfile: () =>
    api.get('/dietary/profile').then((r) => r.data),

  updateDietaryProfile: (data: any) =>
    api.patch('/dietary/profile', data).then((r) => r.data),
}
