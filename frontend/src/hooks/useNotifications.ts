import { useQuery, useMutation } from '@tanstack/react-query'
import { notificationApi } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/lib/utils'
import { errorLogger } from '@/lib/errorLogger'

export const useNotifications = (page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: ['notifications', { page, pageSize }],
    queryFn: () => notificationApi.getNotifications(page, pageSize),
    select: (response) => response.data.data,
  })
}

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationApi.getUnreadCount(),
    select: (response) => response.data.data?.count || 0,
    refetchInterval: 30000, // 30 seconds
  })
}

export const useMarkNotificationRead = () => {
  return useMutation({
    mutationFn: (notificationId: string) => notificationApi.markRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
    },
    onError: (error) => {
      errorLogger.error(getErrorMessage(error), 'useMarkNotificationRead')
    },
  })
}

export const useMarkAllNotificationsRead = () => {
  return useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
      toast.success('All notifications marked as read')
    },
    onError: (error) => {
      errorLogger.error(getErrorMessage(error), 'useMarkAllNotificationsRead')
      toast.error(getErrorMessage(error))
    },
  })
}

export const useDeleteNotification = () => {
  return useMutation({
    mutationFn: (notificationId: string) => notificationApi.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Notification deleted')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
