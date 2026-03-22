import { useQuery, useMutation } from '@tanstack/react-query'
import { enrollmentApi } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/lib/utils'
import { errorLogger } from '@/lib/errorLogger'

export const useMyEnrollments = (status?: string) => {
  return useQuery({
    queryKey: ['enrollments', 'me', { status }],
    queryFn: () => enrollmentApi.getMyEnrollments(status),
    select: (response) => response.data.data,
  })
}

export const useEnrollment = (enrollmentId: string) => {
  return useQuery({
    queryKey: ['enrollment', enrollmentId],
    queryFn: () => enrollmentApi.getEnrollment(enrollmentId),
    select: (response) => response.data.data,
    enabled: !!enrollmentId,
  })
}

export const useCourseEnrollment = (courseId: string) => {
  return useQuery({
    queryKey: ['enrollment', 'course', courseId],
    queryFn: () => enrollmentApi.getCourseEnrollment(courseId),
    select: (response) => response.data.data,
    enabled: !!courseId,
  })
}

export const useEnrollmentStats = () => {
  return useQuery({
    queryKey: ['enrollments', 'stats'],
    queryFn: () => enrollmentApi.getStats(),
    select: (response) => response.data.data,
  })
}

export const useEnrollCourse = () => {
  return useMutation({
    mutationFn: (courseId: string) => enrollmentApi.enroll(courseId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['enrollments', 'me'] })
      queryClient.invalidateQueries({ queryKey: ['enrollments', 'stats'] })
      toast.success('Enrolled in course successfully!')
      return response.data.data
    },
    onError: (error) => {
      errorLogger.error(getErrorMessage(error), 'useEnrollCourse')
      toast.error(getErrorMessage(error))
    },
  })
}
