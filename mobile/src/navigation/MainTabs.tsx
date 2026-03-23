import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { Platform, View, Text, StyleSheet } from 'react-native'
import { useUIStore } from '@/store/uiStore'
import type { MainTabsParamList } from './types'

import { AIBrainScreen }   from '@/screens/app/AIBrainScreen'
import { AITutorScreen }   from '@/screens/app/AITutorScreen'
import { LearnStack }      from './LearnStack'
import { HealthStack }     from './HealthStack'
import { ProfileStack }    from './ProfileStack'

const Tab = createBottomTabNavigator<MainTabsParamList>()

export function MainTabs() {
  const unreadCount = useUIStore((s) => s.unreadCount)

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   '#6366F1',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor:  '#E2E8F0',
          borderTopWidth:  1,
          paddingBottom:   Platform.OS === 'ios' ? 24 : 8,
          paddingTop:      8,
          height:          Platform.OS === 'ios' ? 84 : 64,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, [string, string]> = {
            Home:    ['home',                'home-outline'],
            Learn:   ['book',                'book-outline'],
            AITutor: ['chatbubble-ellipses', 'chatbubble-ellipses-outline'],
            Health:  ['fitness',             'fitness-outline'],
            Account: ['person',              'person-outline'],
          }
          const [active, inactive] = icons[route.name] ?? ['ellipse', 'ellipse-outline']
          return <Ionicons name={focused ? active : inactive as any} size={size} color={color} />
        },
      })}
    >
      <Tab.Screen name="Home"    component={AIBrainScreen}  options={{ title: 'Home' }} />
      <Tab.Screen name="Learn"   component={LearnStack}     options={{ title: 'Learn' }} />
      <Tab.Screen name="AITutor" component={AITutorScreen}  options={{ title: 'AI Tutor' }} />
      <Tab.Screen name="Health"  component={HealthStack}    options={{ title: 'Health' }} />
      <Tab.Screen name="Account" component={ProfileStack}
        options={{
          title: 'Account',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
    </Tab.Navigator>
  )
}
