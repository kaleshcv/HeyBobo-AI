import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

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
import { ShoppingHubScreen }      from '@/screens/app/shopping/ShoppingHubScreen'
import { ShoppingListsScreen }    from '@/screens/app/shopping/ShoppingListsScreen'
import { CampusMarketplaceScreen } from '@/screens/app/shopping/CampusMarketplaceScreen'
import { BudgetExpensesScreen }   from '@/screens/app/shopping/BudgetExpensesScreen'
import { OrdersReviewsScreen }    from '@/screens/app/shopping/OrdersReviewsScreen'

export type DietaryStackParamList = {
  DietaryDashboard:  undefined
  MealLog:           undefined
  NutritionTracker:  undefined
  MealPlanner:       undefined
  DietaryProfile:    undefined
  DietaryGoals:      undefined
  Grocery:           undefined
  GroomingDashboard: undefined
  VisualAnalysis:    undefined
  Recommendations:   undefined
  ShoppingHub:       undefined
  ShoppingLists:     undefined
  Marketplace:       undefined
  BudgetExpenses:    undefined
  OrdersReviews:     undefined
}

const Stack = createNativeStackNavigator<DietaryStackParamList>()

export function DietaryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DietaryDashboard"  component={DietaryDashboardScreen} />
      <Stack.Screen name="MealLog"           component={MealLogScreen} />
      <Stack.Screen name="NutritionTracker"  component={NutritionTrackerScreen} />
      <Stack.Screen name="MealPlanner"       component={MealPlannerScreen} />
      <Stack.Screen name="DietaryProfile"    component={DietaryProfileScreen} />
      <Stack.Screen name="DietaryGoals"      component={DietaryGoalsScreen} />
      <Stack.Screen name="Grocery"           component={GroceryScreen} />
      <Stack.Screen name="GroomingDashboard" component={GroomingDashboardScreen} />
      <Stack.Screen name="VisualAnalysis"    component={VisualAnalysisScreen} />
      <Stack.Screen name="Recommendations"   component={RecommendationsScreen} />
      <Stack.Screen name="ShoppingHub"       component={ShoppingHubScreen} />
      <Stack.Screen name="ShoppingLists"     component={ShoppingListsScreen} />
      <Stack.Screen name="Marketplace"       component={CampusMarketplaceScreen} />
      <Stack.Screen name="BudgetExpenses"    component={BudgetExpensesScreen} />
      <Stack.Screen name="OrdersReviews"     component={OrdersReviewsScreen} />
    </Stack.Navigator>
  )
}
