import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { ProfileStackParamList } from './types'
import { ProfileScreen }       from '@/screens/shared/ProfileScreen'
import { SettingsScreen }      from '@/screens/shared/SettingsScreen'
import { NotificationsScreen } from '@/screens/shared/NotificationsScreen'
import { TeacherStack }        from './TeacherStack'
import { AdminStack }          from './AdminStack'

const Stack = createNativeStackNavigator<ProfileStackParamList>()

export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
      animationDuration: 250,
      gestureEnabled: true,
    }}>
      <Stack.Screen name="Profile"       component={ProfileScreen} />
      <Stack.Screen name="Settings"      component={SettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="TeacherPortal" component={TeacherStack} />
      <Stack.Screen name="AdminPortal"   component={AdminStack} />
    </Stack.Navigator>
  )
}
