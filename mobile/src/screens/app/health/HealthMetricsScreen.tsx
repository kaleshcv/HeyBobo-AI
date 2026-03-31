import React, { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import { AppHeader } from '@/components/layout/AppHeader'
import { Card } from '@/components/common/Card'
import T from '@/theme'

type Period = 'week' | 'month' | '3month'

const METRICS = [
  { key: 'heartRate',  label: 'Heart Rate',   unit: 'bpm',  icon: 'heart'        as const, color: T.red,     values: [68,70,72,69,74,71,72] },
  { key: 'bloodPressure', label: 'Blood Pressure', unit: 'mmHg', icon: 'pulse'   as const, color: T.orange,  values: [118,120,117,122,119,121,120] },
  { key: 'weight',     label: 'Weight',        unit: 'kg',   icon: 'fitness'      as const, color: T.cyan,    values: [74.2,74.0,73.8,73.6,73.5,73.4,73.2] },
  { key: 'spo2',       label: 'Blood Oxygen',  unit: '%',    icon: 'water'        as const, color: T.teal,    values: [98,97,98,99,98,98,97] },
  { key: 'sleep',      label: 'Sleep',         unit: 'hrs',  icon: 'moon'         as const, color: T.primary, values: [7.0,6.5,7.5,8.0,7.2,6.8,7.4] },
  { key: 'stress',     label: 'Stress Level',  unit: '/10',  icon: 'brain'        as const, color: T.pink,    values: [5,6,4,7,5,4,3] },
]

export function HealthMetricsScreen() {
  const insets = useSafeAreaInsets()
  const [period, setPeriod] = useState<Period>('week')

  const periods: { key: Period; label: string }[] = [
    { key: 'week',    label: '7 Days'  },
    { key: 'month',   label: '30 Days' },
    { key: '3month',  label: '3 Months' },
  ]

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Health Metrics" />

      {/* Period selector */}
      <View style={styles.periodRow}>
        {periods.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[styles.periodBtn, period === p.key && styles.periodBtnActive]}
            onPress={() => setPeriod(p.key)}
          >
            <Text style={[styles.periodBtnText, period === p.key && styles.periodBtnTextActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {METRICS.map((m) => {
          const last    = m.values[m.values.length - 1]
          const prev    = m.values[m.values.length - 2]
          const delta   = last - prev
          const max     = Math.max(...m.values)
          const min     = Math.min(...m.values)
          const avg     = Math.round(m.values.reduce((a, b) => a + b, 0) / m.values.length * 10) / 10

          return (
            <Card key={m.key} padding="lg" style={styles.metricCard}>
              {/* Header */}
              <View style={styles.metricHeader}>
                <View style={[styles.metricIconWrap, { backgroundColor: m.color + '20' }]}>
                  <Ionicons name={m.icon} size={18} color={m.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.metricLabel}>{m.label}</Text>
                  <View style={styles.metricValueRow}>
                    <Text style={[styles.metricValue, { color: m.color }]}>{last}</Text>
                    <Text style={styles.metricUnit}> {m.unit}</Text>
                    {delta !== 0 && (
                      <View style={styles.deltaBadge}>
                        <Ionicons
                          name={delta > 0 ? 'arrow-up' : 'arrow-down'}
                          size={10}
                          color={delta > 0 ? T.green : T.red}
                        />
                        <Text style={[styles.deltaText, { color: delta > 0 ? T.green : T.red }]}>
                          {Math.abs(delta).toFixed(1)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Mini sparkline (bar chart) */}
              <View style={styles.sparkline}>
                {m.values.map((v, i) => {
                  const range   = max - min || 1
                  const height  = ((v - min) / range) * 40 + 8
                  const isLast  = i === m.values.length - 1
                  return (
                    <View key={i} style={styles.sparkBar}>
                      <View
                        style={[
                          styles.sparkBarFill,
                          {
                            height,
                            backgroundColor: isLast ? m.color : m.color + '50',
                          },
                        ]}
                      />
                    </View>
                  )
                })}
              </View>

              {/* Stats row */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{avg}</Text>
                  <Text style={styles.statLabel}>Average</Text>
                </View>
                <View style={[styles.statItem, styles.statBorder]}>
                  <Text style={styles.statValue}>{min}</Text>
                  <Text style={styles.statLabel}>Min</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{max}</Text>
                  <Text style={styles.statLabel}>Max</Text>
                </View>
              </View>
            </Card>
          )
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: T.bg },
  periodRow: {
    flexDirection:     'row',
    paddingHorizontal: 16,
    paddingVertical:   10,
    gap:               8,
    backgroundColor:   T.bg2,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  periodBtn: {
    paddingHorizontal: 14,
    paddingVertical:   6,
    borderRadius:      20,
    backgroundColor:   T.surface2,
    borderWidth:       1,
    borderColor:       T.border2,
  },
  periodBtnActive: {
    backgroundColor: T.primary,
    borderColor:     T.primary,
  },
  periodBtnText:       { fontSize: 13, fontWeight: '500', color: T.muted },
  periodBtnTextActive: { color: T.white },
  scroll:              { padding: 16, gap: 12 },
  metricCard:          { marginBottom: 0 },
  metricHeader: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
    marginBottom:  12,
  },
  metricIconWrap: {
    width:           38,
    height:          38,
    borderRadius:    12,
    alignItems:      'center',
    justifyContent:  'center',
  },
  metricLabel:     { fontSize: 12, color: T.muted, marginBottom: 2 },
  metricValueRow:  { flexDirection: 'row', alignItems: 'baseline' },
  metricValue:     { fontSize: 26, fontWeight: '800' },
  metricUnit:      { fontSize: 12, color: T.muted },
  deltaBadge: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: T.surface2,
    borderRadius:    8,
    paddingHorizontal: 6,
    paddingVertical:   2,
    marginLeft:      8,
    gap:             2,
  },
  deltaText:       { fontSize: 10, fontWeight: '600' },
  sparkline: {
    flexDirection:  'row',
    alignItems:     'flex-end',
    height:         52,
    gap:            4,
    marginBottom:   12,
    paddingHorizontal: 2,
  },
  sparkBar:      { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: 52 },
  sparkBarFill:  { width: '100%', borderRadius: 4, minHeight: 4 },
  statsRow: {
    flexDirection:  'row',
    borderTopWidth: 1,
    borderTopColor: T.border,
    paddingTop:     10,
  },
  statItem:   { flex: 1, alignItems: 'center' },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: T.border },
  statValue:  { fontSize: 16, fontWeight: '700', color: T.text },
  statLabel:  { fontSize: 10, color: T.muted, marginTop: 2 },
})
