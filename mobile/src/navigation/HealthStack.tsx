import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { HealthStackParamList } from './types'

import { HealthFitnessScreen }    from '@/screens/app/health/HealthFitnessScreen'
import { FitnessProfileScreen }   from '@/screens/app/health/FitnessProfileScreen'
import { WorkoutsScreen }         from '@/screens/app/health/WorkoutsScreen'
import { LiveWorkoutScreen }      from '@/screens/app/health/LiveWorkoutScreen'
import { ActivityTrackingScreen } from '@/screens/app/health/ActivityTrackingScreen'
import { WearablesScreen }        from '@/screens/app/health/WearablesScreen'
import { InjuryTrackingScreen }   from '@/screens/app/health/InjuryTrackingScreen'
import { FitnessDashboardScreen } from '@/screens/app/health/FitnessDashboardScreen'

const Stack = createNativeStackNavigator<HealthStackParamList>()

export function HealthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HealthHub"        component={HealthFitnessScreen} />
      <Stack.Screen name="FitnessProfile"   component={FitnessProfileScreen} />
      <Stack.Screen name="Workouts"         component={WorkoutsScreen} />
      <Stack.Screen name="LiveWorkout"      component={LiveWorkoutScreen}
        options={{ orientation: 'landscape', presentation: 'fullScreenModal' }}
      />
      <Stack.Screen name="ActivityTracking" component={ActivityTrackingScreen} />
      <Stack.Screen name="Wearables"        component={WearablesScreen} />
      <Stack.Screen name="InjuryTracking"   component={InjuryTrackingScreen} />
      <Stack.Screen name="FitnessDashboard" component={FitnessDashboardScreen} />
    </Stack.Navigator>
  )
}
