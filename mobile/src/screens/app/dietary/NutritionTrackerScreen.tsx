import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Text } from 'react-native';
import { Card } from '@/components/common/Card';
import { AppHeader } from '@/components/layout/AppHeader';
import { useNutritionSummary } from '@/hooks/useDietary';
import Svg, { Polyline, G, Text as SvgText } from 'react-native-svg';
import T from '@/theme'

;

const DAILY_DATA = [
  { day: 'Mon', calories: 1800 },
  { day: 'Tue', calories: 2100 },
  { day: 'Wed', calories: 1900 },
  { day: 'Thu', calories: 2300 },
  { day: 'Fri', calories: 2200 },
  { day: 'Sat', calories: 2400 },
  { day: 'Sun', calories: 2100 },
];

export function NutritionTrackerScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();
  const { data: nutrition } = useNutritionSummary();

  const avgCalories = Math.round(
    DAILY_DATA.reduce((a, b) => a + b.calories, 0) / 7
  );

  const renderMacroBreakdown = (label: string, value: number, color: string) => (
    <View style={styles.macroBreakdownItem}>
      <View style={[styles.macroDot, { backgroundColor: color }]} />
      <View style={styles.macroBreakdownContent}>
        <Text style={styles.macroBreakdownLabel}>{label}</Text>
        <Text style={styles.macroBreakdownValue}>{value}g</Text>
      </View>
      <Text style={styles.macroBreakdownPercent}>
        {Math.round((value / 200) * 100)}%
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Nutrition Tracker" subtitle="Weekly Analysis" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calorie Trend */}
        <Card padding="lg" style={{ marginBottom: 24 }}>
          <Text style={styles.sectionTitle}>Calorie Trend</Text>
          <View style={styles.chartContainer}>
            <View style={styles.chartAxis}>
              <Text style={styles.axisLabel}>2500</Text>
              <Text style={styles.axisLabel}>1750</Text>
              <Text style={styles.axisLabel}>1000</Text>
            </View>

            <View style={styles.barChart}>
              {DAILY_DATA.map((item, idx) => (
                <View key={idx} style={styles.barGroup}>
                  <View
                    style={[
                      styles.bar,
                      { height: (item.calories / 2500) * 120 },
                    ]}
                  />
                  <Text style={styles.barLabel}>{item.day}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Average</Text>
              <Text style={styles.statValue}>{avgCalories}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Highest</Text>
              <Text style={styles.statValue}>2400</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Lowest</Text>
              <Text style={styles.statValue}>1800</Text>
            </View>
          </View>
        </Card>

        {/* Macro Breakdown */}
        <Card padding="lg" style={{ marginBottom: 24 }}>
          <Text style={styles.sectionTitle}>Weekly Macro Breakdown</Text>
          {renderMacroBreakdown('Protein', 1050, '#3B82F6')}
          {renderMacroBreakdown('Carbs', 1260, T.orange)}
          {renderMacroBreakdown('Fat', 490, T.red)}
        </Card>

        {/* Nutrition Goals */}
        <Card padding="lg" style={{ marginBottom: 32 }}>
          <Text style={styles.sectionTitle}>Goal Progress</Text>

          <View style={styles.goalItem}>
            <View style={styles.goalContent}>
              <Text style={styles.goalLabel}>Daily Calorie Goal</Text>
              <View style={styles.goalBar}>
                <View style={[styles.goalBarFill, { width: '75%' }]} />
              </View>
            </View>
            <Text style={styles.goalPercent}>75%</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.goalItem}>
            <View style={styles.goalContent}>
              <Text style={styles.goalLabel}>Protein Intake</Text>
              <View style={styles.goalBar}>
                <View style={[styles.goalBarFill, { width: '85%' }]} />
              </View>
            </View>
            <Text style={styles.goalPercent}>85%</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.goalItem}>
            <View style={styles.goalContent}>
              <Text style={styles.goalLabel}>Water Intake</Text>
              <View style={styles.goalBar}>
                <View style={[styles.goalBarFill, { width: '60%' }]} />
              </View>
            </View>
            <Text style={styles.goalPercent}>60%</Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: T.text,
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  chartAxis: {
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  axisLabel: {
    fontSize: 10,
    color: T.muted,
  },
  barChart: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
  },
  barGroup: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  bar: {
    width: '70%',
    backgroundColor: T.primary2,
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    color: T.muted,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: T.border2,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: T.muted,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: T.text,
  },
  macroBreakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  macroDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  macroBreakdownContent: {
    flex: 1,
  },
  macroBreakdownLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: T.text,
  },
  macroBreakdownValue: {
    fontSize: 12,
    color: T.muted,
    marginTop: 2,
  },
  macroBreakdownPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: T.primary2,
  },
  divider: {
    height: 1,
    backgroundColor: T.border2,
    marginVertical: 12,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  goalContent: {
    flex: 1,
  },
  goalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: T.text,
    marginBottom: 6,
  },
  goalBar: {
    height: 6,
    backgroundColor: T.border2,
    borderRadius: 3,
    overflow: 'hidden',
  },
  goalBarFill: {
    height: '100%',
    backgroundColor: T.primary2,
  },
  goalPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: T.primary2,
  },
});
