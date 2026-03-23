import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { HealthStackParamList } from './types'

import { HealthFitnessScreen }    from '@/screens/app/health/HealthFitnessScreen'
import { FitnessProfileScreen }   from '@/screens/app/health/FitnessProfileScreen'
import { WorkoutsScreen }         from '@/screens/app/health/WorkoutsScreen'
import { LiveWorkoutScreen }      from '@/screens/app/health/LiveWorkoutScreen'
import { ActivityTrackingScreen } from '@/screens/app/health/ActivityTrackingScreen'
import { WearablesScreen }        from '@/screens/app/health/WearablesScreen'
import { DietaryDashboardScreen } from '@/screens/app/dietary/DietaryDashboardScreen'
import { MealLogScreen }          from '@/screens/app/dietary/MealLogScreen'
import { NutritionTrackerScreen } from '@/screens/app/dietary/NutritionTrackerScreen'
import { MealPlannerScreen }      from '@/screens/app/dietary/MealPlannerScreen'
import { DietaryProfileScreen }   from '@/screens/app/dietary/DietaryProfileScreen'
import { DietaryGoalsScreen }     from '@/screens/app/dietary/DietaryGoalsScreen'
import { GroceryScreen }          from '@/screens/app/dietary/GroceryScreen'
import { GroomingDashboardScreen } from '@/screens/app/grooming/GroomingDashboardScreen'
import { VisualAnalysisScreen }   from '@/screens/app/grooming/VisualAnalysisScreen'
import { RecommendationsScreen }  from '@/screens/app/grooming/RecommendationsScreen'

const Stack = createNativeStackNavigator<HealthStackParamList>()

export function HealthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HealthHub"          component={HealthFitnessScreen} />
      <Stack.Screen name="FitnessProfile"     component={FitnessProfileScreen} />
      <Stack.Screen name="Workouts"           component={WorkoutsScreen} />
      <Stack.Screen name="LiveWorkout"        component={LiveWorkoutScreen}
        options={{ orientation: 'landscape', presentation: 'fullScreenModal' }}
      />
      <Stack.Screen name="ActivityTracking"   component={ActivityTrackingScreen} />
      <Stack.Screen name="Wearables"          component={WearablesScreen} />
      <Stack.Screen name="DietaryDashboard"   component={DietaryDashboardScreen} />
      <Stack.Screen name="MealLog"            component={MealLogScreen} />
      <Stack.Screen name="NutritionTracker"   component={NutritionTrackerScreen} />
      <Stack.Screen name="MealPlanner"        component={MealPlannerScreen} />
      <Stack.Screen name="DietaryProfile"     component={DietaryProfileScreen} />
      <Stack.Screen name="DietaryGoals"       component={DietaryGoalsScreen} />
      <Stack.Screen name="Grocery"            component={GroceryScreen} />
      <Stack.Screen name="GroomingDashboard"  component={GroomingDashboardScreen} />
      <Stack.Screen name="VisualAnalysis"     component={VisualAnalysisScreen} />
      <Stack.Screen name="Recommendations"    component={RecommendationsScreen} />
    </Stack.Navigator>
  )
}
