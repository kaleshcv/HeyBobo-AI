import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { HealthStackParamList } from './types'

import { HealthHubScreen }        from '@/screens/app/health/HealthHubScreen'
import { ActivityTrackingScreen } from '@/screens/app/health/ActivityTrackingScreen'
import { WearablesScreen }        from '@/screens/app/health/WearablesScreen'
import { InjuryTrackingScreen }   from '@/screens/app/health/InjuryTrackingScreen'
import { HealthMetricsScreen }    from '@/screens/app/health/HealthMetricsScreen'

const Stack = createNativeStackNavigator<HealthStackParamList>()

export function HealthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HealthHub"        component={HealthHubScreen} />
      <Stack.Screen name="ActivityTracking" component={ActivityTrackingScreen} />
      <Stack.Screen name="Wearables"        component={WearablesScreen} />
      <Stack.Screen name="InjuryTracking"   component={InjuryTrackingScreen} />
      <Stack.Screen name="HealthMetrics"    component={HealthMetricsScreen} />
    </Stack.Navigator>
  )
}
