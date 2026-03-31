import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { GroomingStackParamList } from './types'

import { GroomingDashboardScreen } from '@/screens/app/grooming/GroomingDashboardScreen'
import { VisualAnalysisScreen }    from '@/screens/app/grooming/VisualAnalysisScreen'
import { RecommendationsScreen }   from '@/screens/app/grooming/RecommendationsScreen'

const Stack = createNativeStackNavigator<GroomingStackParamList>()

export function GroomingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GroomingDashboard" component={GroomingDashboardScreen} />
      <Stack.Screen name="VisualAnalysis"    component={VisualAnalysisScreen} />
      <Stack.Screen name="Recommendations"   component={RecommendationsScreen} />
    </Stack.Navigator>
  )
}
