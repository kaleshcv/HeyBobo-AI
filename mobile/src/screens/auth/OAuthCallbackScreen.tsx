import React, { useEffect } from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import * as Linking from 'expo-linking'
import { useAuthStore }  from '@/store/authStore'
import { authApi }       from '@/api'
import T from '@/theme'

export function OAuthCallbackScreen() {
  const navigation = useNavigation<any>()
  const route      = useRoute<any>()
  const setAuth    = useAuthStore((s) => s.setAuth)

  useEffect(() => {
    const handle = async () => {
      try {
        const url    = await Linking.getInitialURL()
        if (!url) throw new Error('No URL')

        const parsed = new URL(url)
        const accessToken  = parsed.searchParams.get('access_token')
        const refreshToken = parsed.searchParams.get('refresh_token')

        if (!accessToken || !refreshToken) throw new Error('Missing tokens')

        // Store tokens first so the API client can use them for getProfile()
        const SecureStore = await import('expo-secure-store')
        await SecureStore.setItemAsync('access_token', accessToken)
        await SecureStore.setItemAsync('refresh_token', refreshToken)

        const user = await authApi.getProfile()
        await setAuth(user, accessToken, refreshToken)
        // Navigation handled automatically by RootNavigator (isAuthenticated → Main)
      } catch {
        navigation.navigate('Login')
      }
    }
    handle()
  }, [])

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6366F1" />
      <Text style={styles.text}>Completing sign-in…</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: T.surface },
  text:      { marginTop: 16, fontSize: 15, color: T.muted },
})
