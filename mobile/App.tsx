import React, { useEffect } from 'react'
import { Platform } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { QueryClientProvider } from '@tanstack/react-query'
import * as Notifications from 'expo-notifications'

import { queryClient } from '@/lib/queryClient'
import { RootNavigator } from '@/navigation/RootNavigator'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
})

async function setupNotifications() {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync()
    const { status } = existing !== 'granted'
      ? await Notifications.requestPermissionsAsync()
      : { status: existing }
    if (status !== 'granted') return
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6366F1',
      })
    }
  } catch { /* best-effort */ }
}

export default function App() {
  useEffect(() => { setupNotifications() }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <RootNavigator />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
