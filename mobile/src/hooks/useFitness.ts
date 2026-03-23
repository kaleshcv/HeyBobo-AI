import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fitnessApi } from '@/api'
import { queryKeys } from '@/lib/queryClient'
import type { FitnessProfile, WorkoutSession } from '@/types'

export function useFitnessProfile() {
  return useQuery({
    queryKey: queryKeys.fitness.profile,
    queryFn:  fitnessApi.getProfile,
  })
}

export function useUpdateFitnessProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<FitnessProfile>) => fitnessApi.updateProfile(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.fitness.profile }),
  })
}

export function useWorkoutPlans() {
  return useQuery({
    queryKey: queryKeys.fitness.plans,
    queryFn:  fitnessApi.getWorkoutPlans,
  })
}

export function useGenerateWorkoutPlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fitnessApi.generateWorkoutPlan,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.fitness.plans }),
  })
}

export function useExercises(filter?: { category?: string; muscle?: string; difficulty?: string }) {
  return useQuery({
    queryKey: queryKeys.fitness.exercises(filter),
    queryFn:  () => fitnessApi.getExercises(filter),
    staleTime: 1000 * 60 * 60, // exercises don't change often
  })
}

export function useLogWorkoutSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (session: Partial<WorkoutSession>) => fitnessApi.logSession(session),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.fitness.sessions }),
  })
}

export function useWorkoutSessions() {
  return useQuery({
    queryKey: queryKeys.fitness.sessions,
    queryFn:  () => fitnessApi.getSessions({ limit: 20 }),
  })
}

export function useActivityLogs(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: queryKeys.fitness.activity(startDate),
    queryFn:  () => fitnessApi.getActivityLogs({ startDate, endDate }),
  })
}

export function useTodayActivity() {
  return useQuery({
    queryKey: queryKeys.fitness.activity('today'),
    queryFn:  fitnessApi.getTodayActivity,
    refetchInterval: 60000,
  })
}
