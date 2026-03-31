import React from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useAppNavigation } from '@/navigation/useAppNavigation'
import { Card } from '@/components/common/Card'
import { useWearablesStore } from '@/store/wearablesStore'
import T from '@/theme'

type MetricCardProps = {
  icon: React.ComponentProps<typeof Ionicons>['name']
  label: string
  value: string
  unit: string
  color: string
  trend?: string
  trendUp?: boolean
}

function MetricCard({ icon, label, value, unit, color, trend, trendUp }: MetricCardProps) {
  return (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={[styles.metricIconWrap, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricValueRow}>
        <Text style={[styles.metricValue, { color }]}>{value}</Text>
        <Text style={styles.metricUnit}>{unit}</Text>
      </View>
      {trend ? (
        <View style={styles.trendRow}>
          <Ionicons
            name={trendUp ? 'trending-up' : 'trending-down'}
            size={12}
            color={trendUp ? T.green : T.red}
          />
          <Text style={[styles.trendText, { color: trendUp ? T.green : T.red }]}>{trend}</Text>
        </View>
      ) : null}
    </View>
  )
}

type QuickLinkProps = {
  icon: React.ComponentProps<typeof Ionicons>['name']
  label: string
  description: string
  color: string
  onPress: () => void
}

function QuickLink({ icon, label, description, color, onPress }: QuickLinkProps) {
  return (
    <TouchableOpacity style={styles.quickLink} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.quickLinkIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.quickLinkText}>
        <Text style={styles.quickLinkLabel}>{label}</Text>
        <Text style={styles.quickLinkDesc}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={T.muted2} />
    </TouchableOpacity>
  )
}

export function HealthHubScreen() {
  const insets     = useSafeAreaInsets()
  const navigation = useAppNavigation()
  const { heartRate } = useWearablesStore()
  const stepsToday = null
  const sleepHours = null

  const metrics: MetricCardProps[] = [
    {
      icon:     'heart',
      label:    'Heart Rate',
      value:    String(heartRate ?? 72),
      unit:     'bpm',
      color:    T.red,
      trend:    '+2 from yesterday',
      trendUp:  false,
    },
    {
      icon:     'footsteps',
      label:    'Steps',
      value:    (stepsToday ?? 6842).toLocaleString(),
      unit:     'steps',
      color:    T.cyan,
      trend:    '68% of goal',
      trendUp:  true,
    },
    {
      icon:     'moon',
      label:    'Sleep',
      value:    String(sleepHours ?? 7.2),
      unit:     'hrs',
      color:    T.primary,
      trend:    'Good quality',
      trendUp:  true,
    },
    {
      icon:     'water',
      label:    'Hydration',
      value:    '1.8',
      unit:     'L',
      color:    T.teal,
      trend:    '60% of daily',
      trendUp:  false,
    },
    {
      icon:     'thermometer',
      label:    'Body Temp',
      value:    '36.6',
      unit:     '°C',
      color:    T.orange,
      trend:    'Normal range',
      trendUp:  true,
    },
    {
      icon:     'pulse',
      label:    'SpO₂',
      value:    '98',
      unit:     '%',
      color:    T.green,
      trend:    'Excellent',
      trendUp:  true,
    },
  ]

  const quickLinks: QuickLinkProps[] = [
    {
      icon:        'walk',
      label:       'Activity Tracking',
      description: 'Steps, calories & active minutes',
      color:       T.cyan,
      onPress:     () => navigation.navigate('ActivityTracking'),
    },
    {
      icon:        'watch',
      label:       'Wearables',
      description: 'Sync & manage your devices',
      color:       T.primary,
      onPress:     () => navigation.navigate('Wearables'),
    },
    {
      icon:        'bandage',
      label:       'Injury Tracking',
      description: 'Log and monitor injuries',
      color:       T.orange,
      onPress:     () => navigation.navigate('InjuryTracking'),
    },
    {
      icon:        'stats-chart',
      label:       'Health Metrics',
      description: 'Vitals, trends & reports',
      color:       T.green,
      onPress:     () => navigation.navigate('HealthMetrics'),
    },
  ]

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Health Monitor</Text>
          <Text style={styles.headerSub}>Today's overview</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="notifications-outline" size={22} color={T.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Health Score */}
        <Card padding="lg" style={styles.scoreCard}>
          <View style={styles.scoreRow}>
            <View>
              <Text style={styles.scoreTitle}>Health Score</Text>
              <Text style={styles.scoreValue}>82 <Text style={styles.scoreMax}>/100</Text></Text>
              <Text style={styles.scoreLabel}>Good — keep it up!</Text>
            </View>
            <View style={styles.scoreCircle}>
              <Ionicons name="shield-checkmark" size={36} color={T.green} />
              <Text style={styles.scoreCircleText}>82%</Text>
            </View>
          </View>
          {/* Progress bar */}
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: '82%', backgroundColor: T.green }]} />
          </View>
        </Card>

        {/* Metrics Grid */}
        <Text style={styles.sectionTitle}>Today's Metrics</Text>
        <View style={styles.metricsGrid}>
          {metrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </View>

        {/* Quick Access */}
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <Card padding="none" style={styles.quickLinksCard}>
          {quickLinks.map((q, i) => (
            <React.Fragment key={q.label}>
              <QuickLink {...q} />
              {i < quickLinks.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </Card>

        {/* Weekly Summary */}
        <Text style={styles.sectionTitle}>This Week</Text>
        <Card padding="lg" style={styles.weekCard}>
          <View style={styles.weekRow}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
              const pct = [80, 60, 90, 45, 70, 100, 55][i]
              const isToday = i === new Date().getDay() - 1
              return (
                <View key={`${day}-${i}`} style={styles.weekDay}>
                  <View style={styles.weekBar}>
                    <View
                      style={[
                        styles.weekBarFill,
                        { height: `${pct}%`, backgroundColor: isToday ? T.primary : T.teal + '80' },
                      ]}
                    />
                  </View>
                  <Text style={[styles.weekDayLabel, isToday && { color: T.primary }]}>{day}</Text>
                </View>
              )
            })}
          </View>
          <View style={styles.weekStats}>
            <View style={styles.weekStat}>
              <Text style={styles.weekStatValue}>5/7</Text>
              <Text style={styles.weekStatLabel}>Active days</Text>
            </View>
            <View style={styles.weekStat}>
              <Text style={styles.weekStatValue}>47,890</Text>
              <Text style={styles.weekStatLabel}>Total steps</Text>
            </View>
            <View style={styles.weekStat}>
              <Text style={styles.weekStatValue}>7.4h</Text>
              <Text style={styles.weekStatLabel}>Avg sleep</Text>
            </View>
          </View>
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: T.bg },
  header: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingHorizontal: 20,
    paddingVertical:   14,
    backgroundColor:   T.bg2,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  headerTitle:     { fontSize: 20, fontWeight: '700', color: T.text },
  headerSub:       { fontSize: 12, color: T.muted, marginTop: 2 },
  headerBtn: {
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: T.surface2,
    alignItems:      'center',
    justifyContent:  'center',
  },
  scroll:          { paddingHorizontal: 16, paddingTop: 16 },

  // Score card
  scoreCard:       { marginBottom: 20 },
  scoreRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  scoreTitle:      { fontSize: 13, color: T.muted, marginBottom: 6 },
  scoreValue:      { fontSize: 36, fontWeight: '800', color: T.text },
  scoreMax:        { fontSize: 18, fontWeight: '400', color: T.muted },
  scoreLabel:      { fontSize: 13, color: T.green, marginTop: 4 },
  scoreCircle: {
    width:           72,
    height:          72,
    borderRadius:    36,
    backgroundColor: T.green + '20',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             2,
  },
  scoreCircleText: { fontSize: 11, fontWeight: '700', color: T.green },
  progressBg: {
    height:          6,
    backgroundColor: T.border2,
    borderRadius:    3,
    overflow:        'hidden',
  },
  progressFill:    { height: '100%', borderRadius: 3 },

  // Section
  sectionTitle:    { fontSize: 16, fontWeight: '700', color: T.text, marginBottom: 12 },

  // Metrics grid
  metricsGrid: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    gap:            10,
    marginBottom:   20,
  },
  metricCard: {
    width:           '47.5%',
    backgroundColor: T.surface,
    borderRadius:    12,
    padding:         14,
    borderLeftWidth: 3,
    borderWidth:     1,
    borderColor:     T.border,
  },
  metricIconWrap: {
    width:        34,
    height:       34,
    borderRadius: 10,
    alignItems:   'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricLabel:     { fontSize: 11, color: T.muted, marginBottom: 4 },
  metricValueRow:  { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  metricValue:     { fontSize: 22, fontWeight: '800' },
  metricUnit:      { fontSize: 12, color: T.muted },
  trendRow:        { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6 },
  trendText:       { fontSize: 10, fontWeight: '500' },

  // Quick links
  quickLinksCard:  { marginBottom: 20, overflow: 'hidden' },
  quickLink: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 16,
    paddingVertical:   14,
    gap:               12,
  },
  quickLinkIcon: {
    width:           40,
    height:          40,
    borderRadius:    12,
    alignItems:      'center',
    justifyContent:  'center',
  },
  quickLinkText:   { flex: 1 },
  quickLinkLabel:  { fontSize: 14, fontWeight: '600', color: T.text },
  quickLinkDesc:   { fontSize: 12, color: T.muted, marginTop: 2 },
  divider: {
    height:          1,
    backgroundColor: T.border,
    marginLeft:      68,
  },

  // Weekly chart
  weekCard:        { marginBottom: 20 },
  weekRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-end',
    height:         80,
    marginBottom:   8,
  },
  weekDay:         { alignItems: 'center', flex: 1 },
  weekBar: {
    width:           16,
    height:          64,
    backgroundColor: T.border2,
    borderRadius:    8,
    overflow:        'hidden',
    justifyContent:  'flex-end',
  },
  weekBarFill:     { width: '100%', borderRadius: 8 },
  weekDayLabel:    { fontSize: 10, color: T.muted, marginTop: 4 },
  weekStats: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: T.border,
    paddingTop:     12,
    marginTop:      4,
  },
  weekStat:        { alignItems: 'center', flex: 1 },
  weekStatValue:   { fontSize: 15, fontWeight: '700', color: T.text },
  weekStatLabel:   { fontSize: 10, color: T.muted, marginTop: 2 },
})
