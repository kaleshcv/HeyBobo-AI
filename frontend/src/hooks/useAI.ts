import { useQuery, useMutation } from '@tanstack/react-query'
import { aiApi } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/lib/utils'
import { errorLogger } from '@/lib/errorLogger'

export const useAIChat = (conversationId: string | null, documentId?: string | null) => {
  return useMutation({
    mutationFn: (data: {
      message: string
      context?: { courseId?: string; lessonId?: string }
    }) => aiApi.chat(conversationId, data.message, data.context, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'conversations'] })
      if (conversationId) {
        queryClient.invalidateQueries({ queryKey: ['ai', 'conversation', conversationId] })
      }
    },
    onError: (error) => {
      errorLogger.error(getErrorMessage(error), 'useAIChat')
      toast.error(getErrorMessage(error))
    },
  })
}

export const useAISummarizeLesson = (lessonId: string) => {
  return useMutation({
    mutationFn: () => aiApi.summarizeLesson(lessonId),
    onSuccess: () => {
      toast.success('Summary generated!')
    },
    onError: (error) => {
      errorLogger.error(getErrorMessage(error), 'useAISummarizeLesson')
      toast.error(getErrorMessage(error))
    },
  })
}

export const useAIRevisionNotes = (lessonId: string) => {
  return useMutation({
    mutationFn: () => aiApi.getRevisionNotes(lessonId),
    onSuccess: () => {
      toast.success('Revision notes generated!')
    },
    onError: (error) => {
      errorLogger.error(getErrorMessage(error), 'useAIRevisionNotes')
      toast.error(getErrorMessage(error))
    },
  })
}

export const useAIConversations = () => {
  return useQuery({
    queryKey: ['ai', 'conversations'],
    queryFn: () => aiApi.getConversations(),
    select: (response) => response.data.data,
  })
}

export const useAIConversation = (conversationId: string) => {
  return useQuery({
    queryKey: ['ai', 'conversation', conversationId],
    queryFn: () => aiApi.getConversation(conversationId),
    select: (response) => response.data.data,
    enabled: !!conversationId,
  })
}

export const useDeleteAIConversation = () => {
  return useMutation({
    mutationFn: (conversationId: string) => aiApi.deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'conversations'] })
      toast.success('Conversation deleted!')
    },
    onError: (error) => {
      errorLogger.error(getErrorMessage(error), 'useDeleteAIConversation')
      toast.error(getErrorMessage(error))
    },
  })
}

export const useUploadDocument = () => {
  return useMutation({
    mutationFn: (file: File) => aiApi.uploadDocument(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'documents'] })
      toast.success('Document uploaded!')
    },
    onError: (error) => {
      errorLogger.error(getErrorMessage(error), 'useUploadDocument')
      toast.error(getErrorMessage(error))
    },
  })
}

export const useAIDocuments = () => {
  return useQuery({
    queryKey: ['ai', 'documents'],
    queryFn: () => aiApi.getDocuments(),
    select: (response) => response.data.data,
  })
}

export const useDeleteAIDocument = () => {
  return useMutation({
    mutationFn: (documentId: string) => aiApi.deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'documents'] })
      toast.success('Document removed!')
    },
    onError: (error) => {
      errorLogger.error(getErrorMessage(error), 'useDeleteAIDocument')
      toast.error(getErrorMessage(error))
    },
  })
}
