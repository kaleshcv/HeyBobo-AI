import { useQuery, useMutation } from '@tanstack/react-query'
import { courseApi, reviewApi } from '@/lib/api'
import { CourseFilter } from '@/types/index'
import { queryClient } from '@/lib/queryClient'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/lib/utils'
import { errorLogger } from '@/lib/errorLogger'

export const useCourses = (filters?: CourseFilter) => {
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: () => courseApi.getCourses(filters),
    select: (response) => response.data.data,
  })
}

export const useCourse = (courseId: string) => {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: () => courseApi.getCourse(courseId),
    select: (response) => response.data.data,
    enabled: !!courseId,
  })
}

export const useFeaturedCourses = () => {
  return useQuery({
    queryKey: ['courses', 'featured'],
    queryFn: () => courseApi.getFeatured(),
    select: (response) => response.data.data,
  })
}

export const useRecommendedCourses = () => {
  return useQuery({
    queryKey: ['courses', 'recommended'],
    queryFn: () => courseApi.getRecommended(),
    select: (response) => response.data.data,
  })
}

export const useCreateCourse = () => {
  return useMutation({
    mutationFn: (data: any) => courseApi.createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      toast.success('Course created successfully!')
    },
    onError: (error) => {
      errorLogger.error(getErrorMessage(error), 'useCreateCourse')
      toast.error(getErrorMessage(error))
    },
  })
}

export const useUpdateCourse = (courseId: string) => {
  return useMutation({
    mutationFn: (data: any) => courseApi.updateCourse(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      toast.success('Course updated successfully!')
    },
    onError: (error) => {
      errorLogger.error(getErrorMessage(error), 'useUpdateCourse')
      toast.error(getErrorMessage(error))
    },
  })
}

export const usePublishCourse = (courseId: string) => {
  return useMutation({
    mutationFn: () => courseApi.publishCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] })
      toast.success('Course published successfully!')
    },
    onError: (error) => {
      errorLogger.error(getErrorMessage(error), 'usePublishCourse')
      toast.error(getErrorMessage(error))
    },
  })
}

export const useTeacherCourses = () => {
  return useQuery({
    queryKey: ['teacher', 'courses'],
    queryFn: () => courseApi.teacherGetCourses(),
    select: (response) => response.data.data,
  })
}

export const useTeacherAnalytics = (courseId: string) => {
  return useQuery({
    queryKey: ['teacher', 'analytics', courseId],
    queryFn: () => courseApi.teacherGetAnalytics(courseId),
    select: (response) => response.data.data,
    enabled: !!courseId,
  })
}

export const useCourseReviews = (courseId: string, page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ['course', courseId, 'reviews', { page, pageSize }],
    queryFn: () => reviewApi.getCourseReviews(courseId, page, pageSize),
    select: (response) => response.data.data,
    enabled: !!courseId,
  })
}

export const useCreateReview = (courseId: string) => {
  return useMutation({
    mutationFn: (data: { rating: number; title: string; content: string }) =>
      reviewApi.createReview(courseId, data.rating, data.title, data.content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId, 'reviews'] })
      queryClient.invalidateQueries({ queryKey: ['course', courseId] })
      toast.success('Review submitted successfully!')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export const useUpdateReview = (courseId: string, reviewId: string) => {
  return useMutation({
    mutationFn: (data: { rating: number; title: string; content: string }) =>
      reviewApi.updateReview(reviewId, data.rating, data.title, data.content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId, 'reviews'] })
      toast.success('Review updated successfully!')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export const useDeleteReview = (courseId: string) => {
  return useMutation({
    mutationFn: (reviewId: string) => reviewApi.deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId, 'reviews'] })
      toast.success('Review deleted successfully!')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
