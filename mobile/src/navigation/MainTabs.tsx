import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { Platform } from 'react-native'
import type { MainTabsParamList } from './types'
import T from '@/theme'

import { AIBrainScreen }  from '@/screens/app/AIBrainScreen'
import { LearnStack }     from './LearnStack'
import { FitnessStack }   from './FitnessStack'
import { HealthStack }    from './HealthStack'
import { DietaryStack }   from './DietaryStack'
import { GroomingStack }  from './GroomingStack'
import { ShoppingStack }  from './ShoppingStack'
import { ProfileStack }   from './ProfileStack'

const Tab = createBottomTabNavigator<MainTabsParamList>()

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

const TAB_ICONS: Record<string, [IoniconName, IoniconName]> = {
  Home:      ['home',              'home-outline'],
  Education: ['school',            'school-outline'],
  Fitness:   ['barbell',           'barbell-outline'],
  Health:    ['heart',             'heart-outline'],
  Dietary:   ['restaurant',        'restaurant-outline'],
  Grooming:  ['color-palette',     'color-palette-outline'],
  Shopping:  ['cart',              'cart-outline'],
  Account:   ['person',            'person-outline'],
}

export function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   T.primary,
        tabBarInactiveTintColor: T.muted,
        tabBarStyle: {
          backgroundColor: T.bg2,
          borderTopColor:  T.border,
          borderTopWidth:  1,
          paddingBottom:   Platform.OS === 'ios' ? 22 : 6,
          paddingTop:      4,
          height:          Platform.OS === 'ios' ? 80 : 58,
          elevation:       8,
          shadowColor:     T.black,
          shadowOffset:    { width: 0, height: -4 },
          shadowOpacity:   0.3,
          shadowRadius:    12,
        },
        tabBarLabelStyle: {
          fontSize:   9,
          fontWeight: '600',
          marginTop:  1,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const [active, inactive] = TAB_ICONS[route.name] ?? ['ellipse', 'ellipse-outline']
          return (
            <Ionicons
              name={focused ? active : inactive}
              size={size - 2}
              color={color}
            />
          )
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={AIBrainScreen}
        options={{ title: 'AI Coach' }}
      />
      <Tab.Screen
        name="Education"
        component={LearnStack}
        options={{ title: 'Education' }}
      />
      <Tab.Screen
        name="Fitness"
        component={FitnessStack}
        options={{ title: 'Fitness' }}
      />
      <Tab.Screen
        name="Health"
        component={HealthStack}
        options={{ title: 'Health' }}
      />
      <Tab.Screen
        name="Dietary"
        component={DietaryStack}
        options={{ title: 'Dietary' }}
      />
      <Tab.Screen
        name="Grooming"
        component={GroomingStack}
        options={{ title: 'Grooming' }}
      />
      <Tab.Screen
        name="Shopping"
        component={ShoppingStack}
        options={{ title: 'Shopping' }}
      />
      <Tab.Screen
        name="Account"
        component={ProfileStack}
        options={{ title: 'Account' }}
      />
    </Tab.Navigator>
  )
}
