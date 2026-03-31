import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { ShoppingStackParamList } from './types'

import { ShoppingHubScreen }       from '@/screens/app/shopping/ShoppingHubScreen'
import { ShoppingListsScreen }     from '@/screens/app/shopping/ShoppingListsScreen'
import { CampusMarketplaceScreen } from '@/screens/app/shopping/CampusMarketplaceScreen'
import { BudgetExpensesScreen }    from '@/screens/app/shopping/BudgetExpensesScreen'
import { OrdersReviewsScreen }     from '@/screens/app/shopping/OrdersReviewsScreen'

const Stack = createNativeStackNavigator<ShoppingStackParamList>()

export function ShoppingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ShoppingHub"    component={ShoppingHubScreen} />
      <Stack.Screen name="ShoppingLists"  component={ShoppingListsScreen} />
      <Stack.Screen name="Marketplace"    component={CampusMarketplaceScreen} />
      <Stack.Screen name="BudgetExpenses" component={BudgetExpensesScreen} />
      <Stack.Screen name="OrdersReviews"  component={OrdersReviewsScreen} />
    </Stack.Navigator>
  )
}
