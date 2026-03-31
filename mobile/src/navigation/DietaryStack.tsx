import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { DietaryStackParamList } from './types'

import { DietaryDashboardScreen } from '@/screens/app/dietary/DietaryDashboardScreen'
import { MealLogScreen }          from '@/screens/app/dietary/MealLogScreen'
import { NutritionTrackerScreen } from '@/screens/app/dietary/NutritionTrackerScreen'
import { MealPlannerScreen }      from '@/screens/app/dietary/MealPlannerScreen'
import { DietaryProfileScreen }   from '@/screens/app/dietary/DietaryProfileScreen'
import { DietaryGoalsScreen }     from '@/screens/app/dietary/DietaryGoalsScreen'
import { GroceryScreen }          from '@/screens/app/dietary/GroceryScreen'

const Stack = createNativeStackNavigator<DietaryStackParamList>()

export function DietaryStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
      animationDuration: 250,
      gestureEnabled: true,
    }}>
      <Stack.Screen name="DietaryDashboard" component={DietaryDashboardScreen} />
      <Stack.Screen name="MealLog"          component={MealLogScreen} />
      <Stack.Screen name="NutritionTracker" component={NutritionTrackerScreen} />
      <Stack.Screen name="MealPlanner"      component={MealPlannerScreen} />
      <Stack.Screen name="DietaryProfile"   component={DietaryProfileScreen} />
      <Stack.Screen name="DietaryGoals"     component={DietaryGoalsScreen} />
      <Stack.Screen name="Grocery"          component={GroceryScreen} />
    </Stack.Navigator>
  )
}
