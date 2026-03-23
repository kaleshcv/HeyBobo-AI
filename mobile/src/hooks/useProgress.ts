import { useMutation, useQueryClient } from '@tanstack/react-query'
import { educationApi } from '@/api'
import { useCourseStore } from '@/store/courseStore'
import { queryKeys } from '@/lib/queryClient'

export function useUpdateProgress(lessonId: string) {
  const qc = useQueryClient()
  const updateProgress = useCourseStore((s) => s.updateProgress)

  return useMutation({
    mutationFn: ({ watchedSeconds, totalSeconds }: { watchedSeconds: number; totalSeconds: number }) =>
      educationApi.updateLessonProgress(lessonId, watchedSeconds, totalSeconds),
    onSuccess: (data) => {
      updateProgress(lessonId, data)
      qc.invalidateQueries({ queryKey: queryKeys.lessons.progress(lessonId) })
    },
  })
}

export function useCompleteLesson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (lessonId: string) => educationApi.completeLesson(lessonId),
    onSuccess: (_data, lessonId) => {
      qc.invalidateQueries({ queryKey: queryKeys.lessons.progress(lessonId) })
      qc.invalidateQueries({ queryKey: queryKeys.enrollments.list })
    },
  })
}

export function useToggleBookmark() {
  return useMutation({
    mutationFn: (lessonId: string) => educationApi.toggleBookmark(lessonId),
  })
}
