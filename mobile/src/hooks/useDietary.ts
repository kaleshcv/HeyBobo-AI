import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dietaryApi } from '@/api'
import { queryKeys } from '@/lib/queryClient'
import type { MealType } from '@/types'
import dayjs from 'dayjs'

export function useMealLogs(date?: string) {
  const d = date ?? dayjs().format('YYYY-MM-DD')
  return useQuery({
    queryKey: queryKeys.dietary.meals(d),
    queryFn:  () => dietaryApi.getMealLogs(d),
  })
}

export function useNutritionSummary(date?: string) {
  const d = date ?? dayjs().format('YYYY-MM-DD')
  return useQuery({
    queryKey: queryKeys.dietary.nutrition(d),
    queryFn:  () => dietaryApi.getNutritionSummary(d),
  })
}

export function useLogMeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: dietaryApi.logMeal,
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.dietary.meals(vars.date) })
      qc.invalidateQueries({ queryKey: queryKeys.dietary.nutrition(vars.date) })
    },
  })
}

export function useDeleteMealLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: dietaryApi.deleteMealLog,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dietary', 'meals'] }),
  })
}

export function useSearchFood(query: string) {
  return useQuery({
    queryKey: ['dietary', 'food', 'search', query],
    queryFn:  () => dietaryApi.searchFood(query),
    enabled:  query.length >= 2,
  })
}

export function useFoodByBarcode(barcode: string) {
  return useQuery({
    queryKey: ['dietary', 'food', 'barcode', barcode],
    queryFn:  () => dietaryApi.getFoodByBarcode(barcode),
    enabled:  !!barcode,
  })
}

export function useMealPlans() {
  return useQuery({
    queryKey: queryKeys.dietary.plans,
    queryFn:  dietaryApi.getMealPlans,
  })
}

export function useGroceryList() {
  return useQuery({
    queryKey: queryKeys.dietary.grocery,
    queryFn:  dietaryApi.getGroceryList,
  })
}

export function useUpdateGroceryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => dietaryApi.updateGroceryItem(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.dietary.grocery }),
  })
}

export function useAddGroceryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: dietaryApi.addGroceryItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.dietary.grocery }),
  })
}
