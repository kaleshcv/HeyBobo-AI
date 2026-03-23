import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { educationApi } from '@/api'
import { queryKeys } from '@/lib/queryClient'

export function useEnrollments() {
  return useQuery({
    queryKey: queryKeys.enrollments.list,
    queryFn:  educationApi.getEnrollments,
  })
}

export function useEnrollment(courseId: string) {
  return useQuery({
    queryKey: queryKeys.enrollments.detail(courseId),
    queryFn:  () => educationApi.getEnrollment(courseId),
    enabled:  !!courseId,
    retry:    false,
  })
}

export function useEnrollmentStats() {
  return useQuery({
    queryKey: queryKeys.enrollments.stats,
    queryFn:  educationApi.getEnrollmentStats,
  })
}

export function useEnroll() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (courseId: string) => educationApi.enroll(courseId),
    onSuccess: (_data, courseId) => {
      qc.invalidateQueries({ queryKey: queryKeys.enrollments.list })
      qc.invalidateQueries({ queryKey: queryKeys.enrollments.detail(courseId) })
    },
  })
}
