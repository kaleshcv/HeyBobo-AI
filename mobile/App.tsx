import React, { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'

// Use the MMKV-backed queryClient + persister (no AsyncStorage dependency)
import { queryClient, persister } from '@/lib/queryClient'
import { RootNavigator } from '@/navigation/RootNavigator'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
})

async function registerForPushNotifications() {
  if (!Device.isDevice) return // emulator — skip silently

  try {
    const { status: existing } = await Notifications.getPermissionsAsync()
    const { status } = existing !== 'granted'
      ? await Notifications.requestPermissionsAsync()
      : { status: existing }

    if (status !== 'granted') return

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId

    if (!projectId) return

    const token = await Notifications.getExpoPushTokenAsync({ projectId })
    console.log('[Push] token:', token.data)

    if (Device.osName === 'Android') {
      await Notifications.setNotificationChannelAsync('default', {
        name:             'default',
        importance:       Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor:       '#6366F1',
      })
    }
  } catch (err) {
    // best-effort — don't crash the app
    console.warn('[Push] registration skipped:', err)
  }
}

export default function App() {
  useEffect(() => {
    registerForPushNotifications()
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister }}
        >
          <RootNavigator />
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
