import { useQuery, useMutation } from '@tanstack/react-query'
import { quizApi } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/lib/utils'
import { errorLogger } from '@/lib/errorLogger'

export const useQuiz = (quizId: string) => {
  return useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => quizApi.getQuiz(quizId),
    select: (response) => response.data.data,
    enabled: !!quizId,
  })
}

export const useStartQuizAttempt = (quizId: string) => {
  return useMutation({
    mutationFn: () => quizApi.startAttempt(quizId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId, 'attempts'] })
      toast.success('Quiz started!')
    },
    onError: (error) => {
      errorLogger.error(getErrorMessage(error), 'useStartQuizAttempt')
      toast.error(getErrorMessage(error))
    },
  })
}

export const useSubmitQuizAttempt = (attemptId: string) => {
  return useMutation({
    mutationFn: (answers: Record<string, string>) =>
      quizApi.submitAttempt(attemptId, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-attempt', attemptId] })
      toast.success('Quiz submitted successfully!')
    },
    onError: (error) => {
      errorLogger.error(getErrorMessage(error), 'useSubmitQuizAttempt')
      toast.error(getErrorMessage(error))
    },
  })
}

export const useQuizAttempts = (quizId: string) => {
  return useQuery({
    queryKey: ['quiz', quizId, 'attempts'],
    queryFn: () => quizApi.getAttempts(quizId),
    select: (response) => response.data.data,
    enabled: !!quizId,
  })
}

export const useQuizAttempt = (attemptId: string) => {
  return useQuery({
    queryKey: ['quiz-attempt', attemptId],
    queryFn: () => quizApi.getAttempt(attemptId),
    select: (response) => response.data.data,
    enabled: !!attemptId,
  })
}
