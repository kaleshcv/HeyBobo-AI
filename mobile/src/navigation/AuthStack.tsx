import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { AuthStackParamList } from './types'
import { LoginScreen }         from '@/screens/auth/LoginScreen'
import { RegisterScreen }      from '@/screens/auth/RegisterScreen'
import { ForgotPasswordScreen } from '@/screens/auth/ForgotPasswordScreen'
import { ResetPasswordScreen } from '@/screens/auth/ResetPasswordScreen'
import { OAuthCallbackScreen } from '@/screens/auth/OAuthCallbackScreen'
import T from '@/theme'

const Stack = createNativeStackNavigator<AuthStackParamList>()

export function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown:  false,
        animation:    'slide_from_right',
        contentStyle: { backgroundColor: T.surface },
      }}
    >
      <Stack.Screen name="Login"          component={LoginScreen} />
      <Stack.Screen name="Register"       component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword"  component={ResetPasswordScreen} />
      <Stack.Screen name="OAuthCallback"  component={OAuthCallbackScreen}
        options={{ animation: 'none' }}
      />
    </Stack.Navigator>
  )
}
