import React, { useRef, useCallback, useEffect } from 'react'
import {
  View, Text, Pressable, ScrollView, Platform, Dimensions, StyleSheet,
} from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
  Easing,
} from 'react-native-reanimated'
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

const TAB_CONFIG: {
  name: keyof MainTabsParamList
  title: string
  icons: [IoniconName, IoniconName]
  component: React.ComponentType<any>
}[] = [
  { name: 'Home',      title: 'AI Coach',   icons: ['home',          'home-outline'],          component: AIBrainScreen },
  { name: 'Education', title: 'Education',  icons: ['school',        'school-outline'],        component: LearnStack },
  { name: 'Fitness',   title: 'Fitness',    icons: ['barbell',       'barbell-outline'],       component: FitnessStack },
  { name: 'Health',    title: 'Health',     icons: ['heart',         'heart-outline'],         component: HealthStack },
  { name: 'Dietary',   title: 'Dietary',    icons: ['restaurant',    'restaurant-outline'],    component: DietaryStack },
  { name: 'Grooming',  title: 'Grooming',   icons: ['color-palette', 'color-palette-outline'], component: GroomingStack },
  { name: 'Shopping',  title: 'Shopping',   icons: ['cart',          'cart-outline'],          component: ShoppingStack },
  { name: 'Account',   title: 'Account',    icons: ['person',        'person-outline'],        component: ProfileStack },
]

const SCREEN_WIDTH = Dimensions.get('window').width
const VISIBLE_TABS = 5
const TAB_WIDTH    = SCREEN_WIDTH / VISIBLE_TABS
const INDICATOR_W  = 24

/* ── Animated single tab ────────────────────────────────── */
function AnimatedTab({
  focused, cfg, onPress, onLongPress,
}: {
  focused: boolean
  cfg: typeof TAB_CONFIG[number]
  onPress: () => void
  onLongPress: () => void
}) {
  const scale    = useSharedValue(1)
  const progress = useSharedValue(focused ? 1 : 0)

  useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, {
      duration: 250,
      easing:   Easing.bezier(0.4, 0, 0.2, 1),
    })
  }, [focused])

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const labelStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      progress.value,
      [0, 1],
      [T.muted, T.primary],
    )
    return { color }
  })

  const [activeIcon, inactiveIcon] = cfg.icons

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => {
        scale.value = withSpring(0.85, { damping: 15, stiffness: 400 })
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 350 })
      }}
      style={styles.tab}
    >
      <Animated.View style={iconStyle}>
        <Ionicons
          name={focused ? activeIcon : inactiveIcon}
          size={22}
          color={focused ? T.primary : T.muted}
        />
      </Animated.View>
      <Animated.Text style={[styles.tabLabel, labelStyle]}>
        {cfg.title}
      </Animated.Text>
    </Pressable>
  )
}

/* ── Custom tab bar with sliding indicator ──────────────── */
function CustomTabBar({ state, navigation }: any) {
  const scrollRef     = useRef<ScrollView>(null)
  const indicatorX    = useSharedValue(state.index * TAB_WIDTH + (TAB_WIDTH - INDICATOR_W) / 2)

  useEffect(() => {
    // Animate indicator to active tab
    indicatorX.value = withSpring(
      state.index * TAB_WIDTH + (TAB_WIDTH - INDICATOR_W) / 2,
      { damping: 18, stiffness: 200, mass: 0.8 },
    )

    // Auto-scroll so the active tab is visible
    const scrollTarget = Math.max(0, state.index * TAB_WIDTH - SCREEN_WIDTH / 2 + TAB_WIDTH / 2)
    scrollRef.current?.scrollTo({ x: scrollTarget, animated: true })
  }, [state.index])

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }))

  return (
    <View style={styles.barOuter}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        decelerationRate="fast"
        snapToInterval={TAB_WIDTH}
        contentContainerStyle={{ minWidth: SCREEN_WIDTH }}
      >
        {/* Sliding indicator pill */}
        <Animated.View style={[styles.indicator, indicatorStyle]} />

        {state.routes.map((route: any, index: number) => {
          const focused = state.index === index
          const cfg     = TAB_CONFIG[index]
          if (!cfg) return null

          const onPress = () => {
            const event = navigation.emit({
              type:              'tabPress',
              target:            route.key,
              canPreventDefault: true,
            })
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name)
            }
          }

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key })
          }

          return (
            <AnimatedTab
              key={route.key}
              focused={focused}
              cfg={cfg}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          )
        })}
      </ScrollView>
    </View>
  )
}

/* ── Main tabs navigator ────────────────────────────────── */
export function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {TAB_CONFIG.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{ title: tab.title }}
        />
      ))}
    </Tab.Navigator>
  )
}

/* ── Styles ─────────────────────────────────────────────── */
const styles = StyleSheet.create({
  barOuter: {
    backgroundColor:  T.bg2,
    borderTopWidth:   1,
    borderTopColor:   T.border,
    paddingBottom:    Platform.OS === 'ios' ? 24 : 8,
    paddingTop:       6,
    elevation:        8,
    shadowColor:      T.black,
    shadowOffset:     { width: 0, height: -4 },
    shadowOpacity:    0.3,
    shadowRadius:     12,
  },
  tab: {
    width:           TAB_WIDTH,
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: 2,
  },
  tabLabel: {
    fontSize:   9,
    fontWeight: '600',
    marginTop:  2,
  },
  indicator: {
    position:        'absolute',
    top:             0,
    width:           INDICATOR_W,
    height:          3,
    borderRadius:    1.5,
    backgroundColor: T.primary,
  },
})
