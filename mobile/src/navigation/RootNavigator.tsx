import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuthStore } from '@/store/authStore'
import { authEventEmitter } from '@/api'
import { AuthStack } from './AuthStack'
import { MainTabs } from './MainTabs'
import { LoadingScreen } from '@/components/common/LoadingScreen'
import type { RootStackParamList } from './types'

const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootNavigator() {
  const { isAuthenticated, isHydrated, hydrate, logout } = useAuthStore()

  useEffect(() => {
    hydrate()
  }, [])

  // Listen for auto-logout triggered by failed token refresh
  useEffect(() => {
    const handler = () => logout()
    authEventEmitter.on('logout', handler)
    return () => authEventEmitter.off('logout', handler)
  }, [logout])

  if (!isHydrated) return <LoadingScreen />

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
