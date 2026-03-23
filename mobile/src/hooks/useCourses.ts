import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { educationApi } from '@/api'
import { queryKeys } from '@/lib/queryClient'
import type { CourseFilter } from '@/types'

export function useCourses(filter?: CourseFilter) {
  return useQuery({
    queryKey: queryKeys.courses.list(filter),
    queryFn:  () => educationApi.getCourses(filter),
  })
}

export function useCourse(courseId: string) {
  return useQuery({
    queryKey: queryKeys.courses.detail(courseId),
    queryFn:  () => educationApi.getCourse(courseId),
    enabled:  !!courseId,
  })
}

export function useCourseContent(courseId: string) {
  return useQuery({
    queryKey: queryKeys.courses.content(courseId),
    queryFn:  () => educationApi.getCourseContent(courseId),
    enabled:  !!courseId,
  })
}

export function useFeaturedCourses() {
  return useQuery({
    queryKey: queryKeys.courses.featured,
    queryFn:  educationApi.getFeaturedCourses,
    staleTime: 1000 * 60 * 10,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.courses.categories,
    queryFn:  educationApi.getCategories,
    staleTime: 1000 * 60 * 30,
  })
}

export function useSearchCourses(query: string, filter?: CourseFilter) {
  return useQuery({
    queryKey: ['courses', 'search', query, filter],
    queryFn:  () => educationApi.searchCourses(query, filter),
    enabled:  query.length >= 2,
  })
}

export function useLearningStats() {
  return useQuery({
    queryKey: queryKeys.learningStats,
    queryFn:  educationApi.getLearningStats,
  })
}

// Teacher mutations
export function useCreateCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: educationApi.createCourse,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  })
}

export function useUpdateCourse(courseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof educationApi.updateCourse>[1]) =>
      educationApi.updateCourse(courseId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.courses.detail(courseId) })
    },
  })
}

export function usePublishCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: educationApi.publishCourse,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  })
}
