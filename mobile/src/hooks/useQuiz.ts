import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { educationApi } from '@/api'
import { queryKeys } from '@/lib/queryClient'

export function useQuiz(quizId: string) {
  return useQuery({
    queryKey: queryKeys.quiz.detail(quizId),
    queryFn:  () => educationApi.getQuiz(quizId),
    enabled:  !!quizId,
  })
}

export function useSubmitQuiz() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ quizId, answers }: { quizId: string; answers: Record<string, string | string[]> }) =>
      educationApi.submitQuiz(quizId, answers),
    onSuccess: (_data, { quizId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.quiz.attempts(quizId) })
    },
  })
}

export function useQuizAttempts(quizId: string) {
  return useQuery({
    queryKey: queryKeys.quiz.attempts(quizId),
    queryFn:  () => educationApi.getQuizAttempts(quizId),
    enabled:  !!quizId,
  })
}
