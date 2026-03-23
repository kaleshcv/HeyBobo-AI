import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { AdminStackParamList } from './types'
import { AdminDashboardScreen }    from '@/screens/admin/AdminDashboardScreen'
import { AdminUsersScreen }        from '@/screens/admin/AdminUsersScreen'
import { AdminTeachersScreen }     from '@/screens/admin/AdminTeachersScreen'
import { AdminCoursesScreen }      from '@/screens/admin/AdminCoursesScreen'
import { AdminCategoriesScreen }   from '@/screens/admin/AdminCategoriesScreen'
import { AdminAnalyticsScreen }    from '@/screens/admin/AdminAnalyticsScreen'
import { AdminCertificatesScreen } from '@/screens/admin/AdminCertificatesScreen'

const Stack = createNativeStackNavigator<AdminStackParamList>()

export function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard"    component={AdminDashboardScreen} />
      <Stack.Screen name="AdminUsers"        component={AdminUsersScreen} />
      <Stack.Screen name="AdminTeachers"     component={AdminTeachersScreen} />
      <Stack.Screen name="AdminCourses"      component={AdminCoursesScreen} />
      <Stack.Screen name="AdminCategories"   component={AdminCategoriesScreen} />
      <Stack.Screen name="AdminAnalytics"    component={AdminAnalyticsScreen} />
      <Stack.Screen name="AdminCertificates" component={AdminCertificatesScreen} />
    </Stack.Navigator>
  )
}
