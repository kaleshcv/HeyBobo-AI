import { useQuery, useMutation } from '@tanstack/react-query'
import { lessonApi } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/lib/utils'
import { errorLogger } from '@/lib/errorLogger'

export const useCourseLearn = (courseId: string) => {
  return useQuery({
    queryKey: ['lesson', 'course', courseId, 'learn'],
    queryFn: () => lessonApi.getCourseLearn(courseId),
    select: (response) => response.data.data,
    enabled: !!courseId,
  })
}

export const useLessonProgress = (lessonId: string) => {
  return useQuery({
    queryKey: ['lesson', lessonId, 'progress'],
    queryFn: () => lessonApi.getLessonProgress(lessonId),
    select: (response) => response.data.data,
    enabled: !!lessonId,
  })
}

export const useUpdateProgress = (lessonId: string) => {
  return useMutation({
    mutationFn: (data: { watchedSeconds: number; totalSeconds: number }) =>
      lessonApi.updateProgress(lessonId, data.watchedSeconds, data.totalSeconds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId, 'progress'] })
    },
    onError: (error) => {
      errorLogger.error(getErrorMessage(error), 'useUpdateProgress')
    },
  })
}

export const useCompleteLesson = (lessonId: string) => {
  return useMutation({
    mutationFn: () => lessonApi.completeLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId, 'progress'] })
      toast.success('Lesson completed!')
    },
    onError: (error) => {
      errorLogger.error(getErrorMessage(error), 'useCompleteLesson')
      toast.error(getErrorMessage(error))
    },
  })
}

export const useAddBookmark = (lessonId: string) => {
  return useMutation({
    mutationFn: () => lessonApi.addBookmark(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId, 'progress'] })
      queryClient.invalidateQueries({ queryKey: ['lessons', 'bookmarks'] })
      toast.success('Bookmarked!')
    },
    onError: (error) => {
      errorLogger.error(getErrorMessage(error), 'useAddBookmark')
      toast.error(getErrorMessage(error))
    },
  })
}

export const useRemoveBookmark = (lessonId: string) => {
  return useMutation({
    mutationFn: () => lessonApi.removeBookmark(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId, 'progress'] })
      queryClient.invalidateQueries({ queryKey: ['lessons', 'bookmarks'] })
      toast.success('Bookmark removed!')
    },
    onError: (error) => {
      errorLogger.error(getErrorMessage(error), 'useRemoveBookmark')
      toast.error(getErrorMessage(error))
    },
  })
}

export const useBookmarks = () => {
  return useQuery({
    queryKey: ['lessons', 'bookmarks'],
    queryFn: () => lessonApi.getBookmarks(),
    select: (response) => response.data.data,
  })
}

export const useLesson = (lessonId: string) => {
  return useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => lessonApi.getLesson(lessonId),
    select: (response) => response.data.data,
    enabled: !!lessonId,
  })
}
