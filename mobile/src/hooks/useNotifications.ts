import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@/api'
import { queryKeys } from '@/lib/queryClient'
import { useUIStore } from '@/store/uiStore'

export function useNotifications() {
  const setUnread = useUIStore((s) => s.setUnread)
  return useQuery({
    queryKey: queryKeys.notifications.list,
    queryFn:  async () => {
      const data = await notificationsApi.getAll()
      setUnread(data.unreadCount)
      return data
    },
    refetchInterval: 30000, // poll every 30s
  })
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications.list }),
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  const clearUnread = useUIStore((s) => s.clearUnread)
  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      clearUnread()
      qc.invalidateQueries({ queryKey: queryKeys.notifications.list })
    },
  })
}
