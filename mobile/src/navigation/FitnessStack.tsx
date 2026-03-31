import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { FitnessStackParamList } from './types'

import { FitnessHubScreen }       from '@/screens/app/health/FitnessHubScreen'
import { FitnessProfileScreen }   from '@/screens/app/health/FitnessProfileScreen'
import { WorkoutsScreen }         from '@/screens/app/health/WorkoutsScreen'
import { LiveWorkoutScreen }      from '@/screens/app/health/LiveWorkoutScreen'
import { FitnessDashboardScreen } from '@/screens/app/health/FitnessDashboardScreen'

const Stack = createNativeStackNavigator<FitnessStackParamList>()

export function FitnessStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FitnessHub"       component={FitnessHubScreen} />
      <Stack.Screen name="FitnessProfile"   component={FitnessProfileScreen} />
      <Stack.Screen name="Workouts"         component={WorkoutsScreen} />
      <Stack.Screen name="LiveWorkout"      component={LiveWorkoutScreen} />
      <Stack.Screen name="FitnessDashboard" component={FitnessDashboardScreen} />
    </Stack.Navigator>
  )
}
