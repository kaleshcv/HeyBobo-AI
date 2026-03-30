import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Text,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAppNavigation } from '@/navigation/useAppNavigation'
import { Card } from '@/components/common/Card'
import { Avatar } from '@/components/common/Avatar'
import { useAuthStore } from '@/store/authStore'
import { useAIBrainStore } from '@/store/aiBrainStore'
import { useLearningStats, useFeaturedCourses } from '@/hooks/useCourses'

const COLORS = {
  primary: '#6366F1',
  text: '#1E293B',
  secondaryText: '#64748B',
  background: '#F8FAFC',
  border: '#E2E8F0',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
}

export function AIBrainScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useAppNavigation()
  const { user } = useAuthStore()
  const { data: stats } = useLearningStats()
  const { data: featured } = useFeaturedCourses()
  const { mode, setMode, priorityItems, alerts, scheduleEvents, moduleInsights, dismissAlert } = useAIBrainStore()

  const firstName = user?.firstName || 'Student'
  const BRAIN_MODES = ['monitor', 'priority', 'safety', 'coach', 'planner', 'sync', 'insight'] as const

  const renderStatCard = (icon: string, label: string, value: string) => (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Ionicons name={icon as any} size={24} color={COLORS.primary} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )

  const renderBrainModeChip = (brainMode: typeof BRAIN_MODES[number]) => (
    <TouchableOpacity
      key={brainMode}
      style={[styles.modeChip, mode === brainMode && styles.modeChipActive]}
      onPress={() => setMode(brainMode)}
    >
      <Text style={[styles.modeChipText, mode === brainMode && styles.modeChipTextActive]}>
        {brainMode.charAt(0).toUpperCase() + brainMode.slice(1)}
      </Text>
    </TouchableOpacity>
  )

  const renderPriorityItem = ({ item }: { item: any }) => {
    const levelColor = item.level === 'critical' ? COLORS.danger : item.level === 'high' ? COLORS.warning : COLORS.primary
    return (
      <View style={[styles.priorityCard, { borderLeftColor: levelColor, borderLeftWidth: 4 }]}>
        <View style={styles.priorityHeader}>
          <Ionicons name={item.icon as any} size={20} color={levelColor} />
          <Text style={styles.priorityTitle}>{item.title}</Text>
        </View>
        <Text style={styles.priorityDesc}>{item.description}</Text>
        {item.actionLabel && (
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: levelColor }]}>
            <Text style={styles.actionButtonText}>{item.actionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  const renderAlertBanner = ({ item }: { item: any }) => {
    if (item.dismissed) return null
    const alertColor = item.severity === 'error' ? COLORS.danger : item.severity === 'warning' ? COLORS.warning : COLORS.primary
    return (
      <View style={[styles.alertBanner, { backgroundColor: `${alertColor}20`, borderLeftColor: alertColor }]}>
        <Ionicons name={item.icon as any} size={18} color={alertColor} />
        <View style={styles.alertContent}>
          <Text style={styles.alertTitle}>{item.title}</Text>
          <Text style={styles.alertDesc}>{item.description}</Text>
        </View>
        <TouchableOpacity onPress={() => dismissAlert(item.id)}>
          <Ionicons name="close" size={18} color={alertColor} />
        </TouchableOpacity>
      </View>
    )
  }

  const renderModuleInsight = ({ item }: { item: any }) => (
    <View style={styles.insightCard}>
      <Text style={styles.insightModule}>{item.module}</Text>
      <View style={styles.scoreRow}>
        <Text style={styles.score}>{item.score}</Text>
        <Ionicons
          name={item.trend === 'up' ? 'arrow-up' : item.trend === 'down' ? 'arrow-down' : 'remove'}
          size={14}
          color={item.trend === 'up' ? COLORS.success : item.trend === 'down' ? COLORS.danger : COLORS.secondaryText}
        />
      </View>
      <Text style={styles.insightSummary} numberOfLines={2}>
        {item.summary}
      </Text>
    </View>
  )

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeContent}>
            <Text style={styles.greeting}>Welcome back, {firstName}! 👋</Text>
            <Text style={styles.subGreeting}>AI Brain Mode: {mode.toUpperCase()}</Text>
          </View>
          <Avatar name={user ? `${user.firstName} ${user.lastName}` : 'S'} size="md" />
        </View>

        <Text style={styles.sectionTitle}>AI Brain Mode</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.modeScroll}
          contentContainerStyle={styles.modeContent}
        >
          {BRAIN_MODES.map(renderBrainModeChip)}
        </ScrollView>

        {alerts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Alerts</Text>
            <FlatList data={alerts} renderItem={renderAlertBanner} keyExtractor={(item) => item.id} scrollEnabled={false} />
          </>
        )}

        {priorityItems.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Priority Items</Text>
            <FlatList
              data={priorityItems.slice(0, 3)}
              renderItem={renderPriorityItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </>
        )}

        {scheduleEvents.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            {scheduleEvents.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <View style={[styles.eventTime, { backgroundColor: event.color }]}>
                  <Text style={styles.eventTimeText}>{event.time}</Text>
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventModule}>{event.module}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {moduleInsights.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Module Insights</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.insightScroll}
              contentContainerStyle={styles.insightContent}
            >
              {moduleInsights.map((insight) => renderModuleInsight({ item: insight }))}
            </ScrollView>
          </>
        )}

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate('FitnessDashboard')}>
            <Ionicons name="barbell" size={24} color={COLORS.primary} />
            <Text style={styles.quickActionLabel}>Workout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate('MealLog')}>
            <Ionicons name="restaurant" size={24} color={COLORS.primary} />
            <Text style={styles.quickActionLabel}>Meal Log</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate('AITutor')}>
            <Ionicons name="chatbubble" size={24} color={COLORS.primary} />
            <Text style={styles.quickActionLabel}>AI Tutor</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate('ShoppingHub')}>
            <Ionicons name="cart" size={24} color={COLORS.primary} />
            <Text style={styles.quickActionLabel}>Shopping</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  welcomeContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  subGreeting: {
    fontSize: 14,
    color: COLORS.secondaryText,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.secondaryText,
    textAlign: 'center',
  },
  actionsSection: {
    marginBottom: 32,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  courseCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  courseImageContainer: {
    width: '100%',
    height: 100,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    padding: 8,
    paddingBottom: 4,
  },
  courseCardInstructor: {
    fontSize: 10,
    color: COLORS.secondaryText,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  motivationalCard: {
    backgroundColor: `#FBBF2415`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  motivationalContent: {
    alignItems: 'center',
    gap: 12,
  },
  motivationalText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 20,
  },
  modeScroll: {
    marginBottom: 20,
  },
  modeContent: {
    gap: 8,
    paddingHorizontal: 16,
  },
  modeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondaryText,
  },
  modeChipTextActive: {
    color: '#fff',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    gap: 10,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  alertDesc: {
    fontSize: 11,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  priorityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priorityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  priorityTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  priorityDesc: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginBottom: 12,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  eventTime: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  eventTimeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  eventModule: {
    fontSize: 10,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  insightScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  insightContent: {
    gap: 10,
  },
  insightCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    width: 140,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  insightModule: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 6,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  score: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  insightSummary: {
    fontSize: 10,
    color: COLORS.secondaryText,
    lineHeight: 14,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 32,
  },
  quickActionBtn: {
    width: '23%',
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickActionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 6,
    textAlign: 'center',
  },
})
