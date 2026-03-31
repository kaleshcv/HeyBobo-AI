import React, { useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import Svg, { Circle, Path } from 'react-native-svg'
import { useAppNavigation } from '@/navigation/useAppNavigation'
import { Card } from '@/components/common/Card'
import { useWearablesStore } from '@/store/wearablesStore'
import T from '@/theme'

type IoIcon = React.ComponentProps<typeof Ionicons>['name']
const { width: SCREEN_W } = Dimensions.get('window')
const CARD_GAP = 10
const HALF_W   = (SCREEN_W - 32 - CARD_GAP) / 2   // 16px padding each side

/* ── Ring chart (Apple Watch style) ─────────────────────────────────────── */
function Ring({ size, stroke, progress, color, bgColor }: {
  size: number; stroke: number; progress: number; color: string; bgColor?: string
}) {
  const r    = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const off  = circ - Math.min(progress, 1) * circ
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={size / 2} cy={size / 2} r={r}
        stroke={bgColor ?? `${color}20`} strokeWidth={stroke} fill="none" />
      <Circle cx={size / 2} cy={size / 2} r={r}
        stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={circ} strokeDashoffset={off}
        strokeLinecap="round" rotation="-90"
        originX={size / 2} originY={size / 2} />
    </Svg>
  )
}

/* ── ECG line (decorative SVG) ──────────────────────────────────────────── */
function EcgWave({ width, height, color }: { width: number; height: number; color: string }) {
  const mid = height / 2
  const d = `M0 ${mid} L${width * 0.15} ${mid} L${width * 0.2} ${height * 0.8} L${width * 0.25} ${height * 0.15} L${width * 0.3} ${height * 0.7} L${width * 0.35} ${mid} L${width * 0.5} ${mid} L${width * 0.55} ${height * 0.35} L${width * 0.6} ${mid} L${width} ${mid}`
  return (
    <Svg width={width} height={height}>
      <Path d={d} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

/* ── Mini bar chart ─────────────────────────────────────────────────────── */
function MiniBarChart({ data, color, height = 40 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data, 1)
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height, gap: 3 }}>
      {data.map((v, i) => (
        <View key={i} style={{
          flex: 1,
          height: Math.max(4, (v / max) * height),
          backgroundColor: i === data.length - 1 ? color : `${color}50`,
          borderRadius: 3,
        }} />
      ))}
    </View>
  )
}

/* ══════════════════════════════════════════════════════════════════════════ */
export function HealthHubScreen() {
  const insets     = useSafeAreaInsets()
  const navigation = useAppNavigation()
  const { heartRate } = useWearablesStore()

  // Demo data — replace with real store data when wearable is connected
  const hr        = heartRate ?? 72
  const steps     = 6842
  const stepsGoal = 10000
  const calories  = 487
  const calGoal   = 750
  const spo2      = 98
  const bodyTemp  = 36.6
  const sleep     = 7.2
  const sleepGoal = 8
  const systolic  = 120
  const diastolic = 78
  const respRate  = 16
  const vo2Max    = 42.5
  const hrv       = 48

  const stepsProgress = steps / stepsGoal
  const calProgress   = calories / calGoal
  const sleepProgress = sleep / sleepGoal

  // Weekly mock data
  const weeklySteps    = [5200, 7800, 6100, 9400, 6842, 0, 0]
  const weeklyHR       = [70, 68, 74, 72, 71, 69, 72]
  const weeklySleep    = [6.8, 7.5, 6.2, 7.8, 7.2, 0, 0]

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Health</Text>
          <Text style={styles.headerSub}>Today's Overview</Text>
        </View>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.navigate('HealthMetrics')}
        >
          <Ionicons name="analytics-outline" size={20} color={T.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Activity Rings (Apple Watch style) ──────────────────────────── */}
        <Card padding="lg" shadow style={styles.mb16}>
          <Text style={styles.cardTitle}>Activity Rings</Text>
          <View style={styles.ringsRow}>
            <View style={styles.ringStack}>
              <Ring size={120} stroke={10} progress={stepsProgress} color={T.cyan} />
              <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}>
                <Ring size={92} stroke={10} progress={calProgress} color={T.green} />
                <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}>
                  <Ring size={64} stroke={10} progress={sleepProgress} color={T.primary} />
                </View>
              </View>
            </View>
            <View style={styles.ringLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: T.cyan }]} />
                <View>
                  <Text style={styles.legendValue}>{steps.toLocaleString()}</Text>
                  <Text style={styles.legendLabel}>Steps</Text>
                </View>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: T.green }]} />
                <View>
                  <Text style={styles.legendValue}>{calories} kcal</Text>
                  <Text style={styles.legendLabel}>Active Energy</Text>
                </View>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: T.primary }]} />
                <View>
                  <Text style={styles.legendValue}>{sleep}h</Text>
                  <Text style={styles.legendLabel}>Sleep</Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        {/* ── Heart Rate + ECG Row ────────────────────────────────────────── */}
        <View style={styles.rowTwo}>
          {/* Heart Rate */}
          <Card padding="md" shadow style={[styles.halfCard, { overflow: 'hidden' }]}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="heart" size={16} color={T.red} />
              <Text style={styles.smallCardTitle}>Heart Rate</Text>
            </View>
            <Text style={[styles.bigValue, { color: T.red }]}>{hr}
              <Text style={styles.bigUnit}> bpm</Text>
            </Text>
            <Text style={styles.rangeText}>Range: 58–{hr + 12} bpm</Text>
            <View style={{ marginTop: 8 }}>
              <MiniBarChart data={weeklyHR} color={T.red} height={32} />
            </View>
          </Card>

          {/* ECG */}
          <Card padding="md" shadow style={styles.halfCard}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="pulse" size={16} color={T.green} />
              <Text style={styles.smallCardTitle}>ECG</Text>
            </View>
            <View style={{ marginTop: 4 }}>
              <EcgWave width={HALF_W - 32} height={50} color={T.green} />
            </View>
            <View style={[styles.ecgBadge, { backgroundColor: `${T.green}20` }]}>
              <Ionicons name="checkmark-circle" size={12} color={T.green} />
              <Text style={[styles.ecgBadgeText, { color: T.green }]}>Sinus Rhythm</Text>
            </View>
            <Text style={styles.rangeText}>Last: Today 2:30 PM</Text>
          </Card>
        </View>

        {/* ── Blood Oxygen + Body Temp Row ────────────────────────────────── */}
        <View style={styles.rowTwo}>
          {/* SpO₂ */}
          <Card padding="md" shadow style={styles.halfCard}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="water" size={16} color={T.teal} />
              <Text style={styles.smallCardTitle}>Blood Oxygen</Text>
            </View>
            <View style={styles.ringCenter}>
              <Ring size={72} stroke={7} progress={spo2 / 100} color={T.teal} />
              <View style={[StyleSheet.absoluteFill, styles.centerAbsolute]}>
                <Text style={[styles.ringPercent, { color: T.teal }]}>{spo2}%</Text>
              </View>
            </View>
            <Text style={styles.rangeText}>Normal: 95–100%</Text>
          </Card>

          {/* Body Temp */}
          <Card padding="md" shadow style={styles.halfCard}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="thermometer" size={16} color={T.orange} />
              <Text style={styles.smallCardTitle}>Body Temp</Text>
            </View>
            <Text style={[styles.bigValue, { color: T.orange, marginTop: 8 }]}>
              {bodyTemp}
              <Text style={styles.bigUnit}> °C</Text>
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: `${T.green}20` }]}>
              <Text style={[styles.statusText, { color: T.green }]}>Normal</Text>
            </View>
            <Text style={styles.rangeText}>Range: 36.1–37.2 °C</Text>
          </Card>
        </View>

        {/* ── Blood Pressure ──────────────────────────────────────────────── */}
        <Card padding="lg" shadow style={styles.mb16}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="fitness" size={18} color={T.primary} />
            <Text style={styles.cardTitle}>Blood Pressure</Text>
          </View>
          <View style={styles.bpRow}>
            <View style={styles.bpBlock}>
              <Text style={[styles.bpValue, { color: T.primary }]}>{systolic}</Text>
              <Text style={styles.bpLabel}>Systolic</Text>
            </View>
            <View style={styles.bpDivider}>
              <Text style={styles.bpSlash}>/</Text>
            </View>
            <View style={styles.bpBlock}>
              <Text style={[styles.bpValue, { color: T.cyan }]}>{diastolic}</Text>
              <Text style={styles.bpLabel}>Diastolic</Text>
            </View>
            <View style={styles.bpBlock}>
              <Text style={styles.bpUnit}>mmHg</Text>
              <View style={[styles.statusBadge, { backgroundColor: `${T.green}20`, marginTop: 4 }]}>
                <Text style={[styles.statusText, { color: T.green }]}>Normal</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* ── Steps Weekly Chart ──────────────────────────────────────────── */}
        <Card padding="lg" shadow style={styles.mb16}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="footsteps" size={18} color={T.cyan} />
            <Text style={styles.cardTitle}>Steps</Text>
            <View style={{ flex: 1 }} />
            <Text style={styles.cardSubRight}>{steps.toLocaleString()} / {stepsGoal.toLocaleString()}</Text>
          </View>
          <View style={styles.stepsProgressBg}>
            <View style={[styles.stepsProgressFill, { width: `${Math.min(stepsProgress * 100, 100)}%` }]} />
          </View>
          <View style={{ marginTop: 14 }}>
            <MiniBarChart data={weeklySteps} color={T.cyan} height={48} />
            <View style={styles.weekLabels}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <Text key={`${d}-${i}`} style={[styles.weekLabel, i === 4 && { color: T.cyan }]}>{d}</Text>
              ))}
            </View>
          </View>
        </Card>

        {/* ── Sleep Card ──────────────────────────────────────────────────── */}
        <Card padding="lg" shadow style={styles.mb16}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="moon" size={18} color={T.primary} />
            <Text style={styles.cardTitle}>Sleep</Text>
          </View>
          <View style={styles.sleepRow}>
            <View style={styles.ringCenter}>
              <Ring size={80} stroke={8} progress={sleepProgress} color={T.primary} />
              <View style={[StyleSheet.absoluteFill, styles.centerAbsolute]}>
                <Text style={[styles.ringPercent, { color: T.primary }]}>{sleep}h</Text>
              </View>
            </View>
            <View style={styles.sleepStats}>
              <View style={styles.sleepStatRow}>
                <Ionicons name="bed" size={14} color={T.muted} />
                <Text style={styles.sleepStatLabel}>Bedtime</Text>
                <Text style={styles.sleepStatValue}>11:15 PM</Text>
              </View>
              <View style={styles.sleepStatRow}>
                <Ionicons name="alarm" size={14} color={T.muted} />
                <Text style={styles.sleepStatLabel}>Wake up</Text>
                <Text style={styles.sleepStatValue}>6:27 AM</Text>
              </View>
              <View style={styles.sleepStatRow}>
                <Ionicons name="analytics" size={14} color={T.muted} />
                <Text style={styles.sleepStatLabel}>Deep sleep</Text>
                <Text style={styles.sleepStatValue}>1.8h</Text>
              </View>
              <View style={styles.sleepStatRow}>
                <Ionicons name="cloudy-night" size={14} color={T.muted} />
                <Text style={styles.sleepStatLabel}>REM</Text>
                <Text style={styles.sleepStatValue}>2.1h</Text>
              </View>
            </View>
          </View>
          <View style={{ marginTop: 12 }}>
            <MiniBarChart data={weeklySleep} color={T.primary} height={32} />
          </View>
        </Card>

        {/* ── Extra Vitals Row ────────────────────────────────────────────── */}
        <View style={styles.rowThree}>
          <Card padding="md" shadow style={styles.thirdCard}>
            <Ionicons name="speedometer" size={20} color={T.yellow} />
            <Text style={[styles.thirdValue, { color: T.yellow }]}>{vo2Max}</Text>
            <Text style={styles.thirdLabel}>VO₂ Max</Text>
            <Text style={styles.thirdUnit}>mL/kg/min</Text>
          </Card>
          <Card padding="md" shadow style={styles.thirdCard}>
            <Ionicons name="pulse" size={20} color={T.pink} />
            <Text style={[styles.thirdValue, { color: T.pink }]}>{hrv}</Text>
            <Text style={styles.thirdLabel}>HRV</Text>
            <Text style={styles.thirdUnit}>ms</Text>
          </Card>
          <Card padding="md" shadow style={styles.thirdCard}>
            <Ionicons name="leaf" size={20} color={T.teal} />
            <Text style={[styles.thirdValue, { color: T.teal }]}>{respRate}</Text>
            <Text style={styles.thirdLabel}>Resp Rate</Text>
            <Text style={styles.thirdUnit}>br/min</Text>
          </Card>
        </View>

        {/* ── Quick Access Links ──────────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { marginTop: 4 }]}>Quick Access</Text>
        <Card padding="none" shadow style={{ marginBottom: 20, overflow: 'hidden' }}>
          {([
            { icon: 'walk' as IoIcon,    label: 'Activity Tracking', desc: 'Steps, calories & active minutes', color: T.cyan,    screen: 'ActivityTracking' as const },
            { icon: 'watch' as IoIcon,   label: 'Wearables',         desc: 'Sync & manage your devices',      color: T.primary, screen: 'Wearables' as const },
            { icon: 'bandage' as IoIcon, label: 'Injury Tracking',   desc: 'Log and monitor injuries',        color: T.orange,  screen: 'InjuryTracking' as const },
            { icon: 'stats-chart' as IoIcon, label: 'Health Metrics', desc: 'Vitals, trends & reports',       color: T.green,   screen: 'HealthMetrics' as const },
          ]).map((q, i, arr) => (
            <React.Fragment key={q.label}>
              <TouchableOpacity
                style={styles.quickLink}
                activeOpacity={0.7}
                onPress={() => navigation.navigate(q.screen)}
              >
                <View style={[styles.qlIcon, { backgroundColor: `${q.color}20` }]}>
                  <Ionicons name={q.icon} size={22} color={q.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.qlLabel}>{q.label}</Text>
                  <Text style={styles.qlDesc}>{q.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={T.muted2} />
              </TouchableOpacity>
              {i < arr.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </Card>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  )
}

/* ══════════════════════════════════════════════════════════════════════════ */
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
  headerTitle: { fontSize: 22, fontWeight: '800', color: T.text },
  headerSub:   { fontSize: 12, color: T.muted, marginTop: 2 },
  headerBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: T.surface2,
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },
  mb16:   { marginBottom: 16 },

  // Section
  sectionTitle: { fontSize: 16, fontWeight: '700', color: T.text, marginBottom: 12 },

  // Card header row
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle:     { fontSize: 15, fontWeight: '700', color: T.text },
  cardSubRight:  { fontSize: 12, fontWeight: '600', color: T.muted },

  smallCardTitle: { fontSize: 13, fontWeight: '600', color: T.text },

  // Two-column layout
  rowTwo:   { flexDirection: 'row', gap: CARD_GAP, marginBottom: 16 },
  halfCard: { flex: 1 },

  // Three-column layout
  rowThree:  { flexDirection: 'row', gap: CARD_GAP, marginBottom: 16 },
  thirdCard: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  thirdValue: { fontSize: 22, fontWeight: '800', marginTop: 6 },
  thirdLabel: { fontSize: 11, fontWeight: '600', color: T.muted, marginTop: 2 },
  thirdUnit:  { fontSize: 9, color: T.muted2, marginTop: 1 },

  // Big value text
  bigValue: { fontSize: 30, fontWeight: '800', marginTop: 2 },
  bigUnit:  { fontSize: 14, fontWeight: '500', color: T.muted },

  // Range / subtext
  rangeText: { fontSize: 10, color: T.muted, marginTop: 6 },

  // Status badge
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, marginTop: 6,
  },
  statusText: { fontSize: 10, fontWeight: '700' },

  // Activity Rings
  ringsRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  ringStack: { width: 120, height: 120, justifyContent: 'center', alignItems: 'center' },
  ringLegend: { flex: 1, gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  legendDot:  { width: 10, height: 10, borderRadius: 5 },
  legendValue: { fontSize: 15, fontWeight: '700', color: T.text },
  legendLabel: { fontSize: 11, color: T.muted },

  ringCenter:    { alignItems: 'center', justifyContent: 'center' },
  centerAbsolute: { justifyContent: 'center', alignItems: 'center' },
  ringPercent:    { fontSize: 16, fontWeight: '800' },

  // ECG
  ecgBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, marginTop: 8,
  },
  ecgBadgeText: { fontSize: 10, fontWeight: '700' },

  // Blood Pressure
  bpRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bpBlock:   { flex: 1, alignItems: 'center' },
  bpValue:   { fontSize: 36, fontWeight: '800' },
  bpLabel:   { fontSize: 11, color: T.muted, marginTop: 2 },
  bpUnit:    { fontSize: 14, fontWeight: '600', color: T.muted },
  bpDivider: { justifyContent: 'center' },
  bpSlash:   { fontSize: 28, fontWeight: '300', color: T.muted2 },

  // Steps progress
  stepsProgressBg: {
    height: 6, backgroundColor: T.border2, borderRadius: 3, overflow: 'hidden',
  },
  stepsProgressFill: {
    height: '100%', backgroundColor: T.cyan, borderRadius: 3,
  },
  weekLabels: { flexDirection: 'row', marginTop: 6 },
  weekLabel:  { flex: 1, textAlign: 'center', fontSize: 10, color: T.muted },

  // Sleep
  sleepRow:      { flexDirection: 'row', alignItems: 'center', gap: 20 },
  sleepStats:    { flex: 1, gap: 8 },
  sleepStatRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sleepStatLabel: { flex: 1, fontSize: 12, color: T.muted },
  sleepStatValue: { fontSize: 13, fontWeight: '700', color: T.text },

  // Quick links
  quickLink: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  qlIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  qlLabel: { fontSize: 14, fontWeight: '600', color: T.text },
  qlDesc:  { fontSize: 12, color: T.muted, marginTop: 2 },
  divider: { height: 1, backgroundColor: T.border, marginLeft: 68 },
})
