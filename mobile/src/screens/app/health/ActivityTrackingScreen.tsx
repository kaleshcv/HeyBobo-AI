import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Text } from 'react-native';
import { Card } from '@/components/common/Card';
import { AppHeader } from '@/components/layout/AppHeader';
import T from '@/theme'

export function ActivityTrackingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();

  // Mock weekly data
  const weeklySteps = [5000, 7200, 8500, 6300, 9100, 10200, 8000];
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyCalories = [1800, 2100, 1900, 2300, 2200, 2400, 2100];

  const totalSteps = weeklySteps.reduce((a, b) => a + b, 0);
  const avgSteps = Math.round(totalSteps / 7);
  const totalCalories = weeklyCalories.reduce((a, b) => a + b, 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Activity Tracking" subtitle="Weekly Summary" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Weekly Stats Summary */}
        <Card padding="lg" style={{ marginBottom: 24 }}>
          <Text style={styles.sectionTitle}>Weekly Overview</Text>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryIcon}>
                <Ionicons name="footsteps" size={20} color={T.primary2} />
              </View>
              <Text style={styles.summaryLabel}>Total Steps</Text>
              <Text style={styles.summaryValue}>
                {(totalSteps / 1000).toFixed(1)}K
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryIcon}>
                <Ionicons name="flame" size={20} color={T.red} />
              </View>
              <Text style={styles.summaryLabel}>Total Calories</Text>
              <Text style={styles.summaryValue}>
                {(totalCalories / 1000).toFixed(1)}K
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryIcon}>
                <Ionicons name="trending-up" size={20} color={T.green} />
              </View>
              <Text style={styles.summaryLabel}>Avg Daily Steps</Text>
              <Text style={styles.summaryValue}>
                {(avgSteps / 1000).toFixed(1)}K
              </Text>
            </View>
          </View>
        </Card>

        {/* Steps Chart */}
        <Card padding="lg" style={{ marginBottom: 24 }}>
          <Text style={styles.sectionTitle}>Daily Steps</Text>
          <View style={styles.chartContainer}>
            <View style={styles.barChart}>
              {weeklySteps.map((steps, idx) => (
                <View key={idx} style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      { height: (steps / 12000) * 150 },
                    ]}
                  />
                  <Text style={styles.barLabel}>{weekDays[idx]}</Text>
                </View>
              ))}
            </View>
          </View>
        </Card>

        {/* Calories Breakdown */}
        <Card padding="lg" style={{ marginBottom: 24 }}>
          <Text style={styles.sectionTitle}>Calories Breakdown</Text>

          {weekDays.map((day, idx) => (
            <View key={idx} style={styles.calorieRow}>
              <Text style={styles.calorieDay}>{day}</Text>
              <View style={styles.calorieBar}>
                <View
                  style={[
                    styles.calorieBarFill,
                    { width: `${(weeklyCalories[idx] / 2500) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.calorieValue}>
                {weeklyCalories[idx]} kcal
              </Text>
            </View>
          ))}
        </Card>

        {/* Insights */}
        <Card padding="lg" style={{ marginBottom: 32 }}>
          <Text style={styles.sectionTitle}>Insights</Text>

          <View style={styles.insightItem}>
            <Ionicons name="checkmark-circle" size={20} color={T.green} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.insightTitle}>Goal Achievement</Text>
              <Text style={styles.insightText}>
                You reached your daily goal 5 out of 7 days this week
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.insightItem}>
            <Ionicons name="trending-up" size={20} color={T.primary2} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.insightTitle}>Best Day</Text>
              <Text style={styles.insightText}>
                Saturday was your most active day with 10,200 steps
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.insightItem}>
            <Ionicons name="alert-circle" size={20} color="#F59E0B" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.insightTitle}>Rest Needed</Text>
              <Text style={styles.insightText}>
                Sunday had lower activity - time for recovery
              </Text>
            </View>
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
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: `${T.primary2}08`,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${T.primary2}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 11,
    color: T.muted,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: T.text,
  },
  chartContainer: {
    height: 180,
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  bar: {
    width: '70%',
    backgroundColor: T.primary2,
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 11,
    color: T.muted,
    fontWeight: '500',
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  calorieDay: {
    width: 40,
    fontSize: 12,
    fontWeight: '500',
    color: T.text,
  },
  calorieBar: {
    flex: 1,
    height: 6,
    backgroundColor: T.border2,
    borderRadius: 3,
    overflow: 'hidden',
  },
  calorieBarFill: {
    height: '100%',
    backgroundColor: T.primary2,
  },
  calorieValue: {
    width: 60,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '600',
    color: T.text,
  },
  divider: {
    height: 1,
    backgroundColor: T.border2,
    marginVertical: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: T.text,
    marginBottom: 4,
  },
  insightText: {
    fontSize: 12,
    color: T.muted,
    lineHeight: 16,
  },
});
