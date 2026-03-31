import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Text } from 'react-native';
import { Card } from '@/components/common/Card';
import { AppHeader } from '@/components/layout/AppHeader';
import { useTodayActivity } from '@/hooks/useFitness';
import { useWearablesStore } from '@/store/wearablesStore';
import Svg, { Circle, Path } from 'react-native-svg';
import T from '@/theme'

;

export function HealthFitnessScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();
  const { data: todayActivity } = useTodayActivity();
  const { heartRate } = useWearablesStore();

  const calorieGoal = 2500;
  const caloriesBurned = todayActivity?.caloriesBurned || 1250;
  const caloriesPercent = (caloriesBurned / calorieGoal) * 100;

  const renderCalorieRing = () => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (caloriesPercent / 100) * circumference;

    return (
      <View style={styles.calorieRingContainer}>
        <Svg width={160} height={160} viewBox="0 0 160 160">
          <Circle
            cx="80"
            cy="80"
            r={radius}
            stroke={T.border2}
            strokeWidth="8"
            fill="none"
          />
          <Circle
            cx="80"
            cy="80"
            r={radius}
            stroke={T.primary2}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            rotation="-90"
            originX="80"
            originY="80"
          />
        </Svg>
        <View style={styles.calorieRingContent}>
          <Text style={styles.calorieValue}>
            {Math.round(caloriesBurned)}
          </Text>
          <Text style={styles.calorieLabel}>kcal</Text>
        </View>
      </View>
    );
  };

  const renderQuickAccessCard = (
    icon: string,
    title: string,
    subtitle: string,
    onPress: () => void
  ) => (
    <TouchableOpacity style={styles.quickAccessCard} onPress={onPress}>
      <View style={styles.quickAccessIcon}>
        <Ionicons name={icon as any} size={28} color={T.primary2} />
      </View>
      <View style={styles.quickAccessContent}>
        <Text style={styles.quickAccessTitle}>{title}</Text>
        <Text style={styles.quickAccessSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="arrow-forward" size={18} color={T.primary2} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Health & Fitness" subtitle="Today's Activity" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Today's Stats */}
        <Card padding="lg" style={{ marginBottom: 24 }}>
          <View style={styles.statsHeader}>
            <Text style={styles.statsTitle}>Today's Activity</Text>
            <Text style={styles.statsDate}>
              {new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>

          {/* Steps Count */}
          <View style={styles.stepCountContainer}>
            <View style={styles.stepCountContent}>
              <Text style={styles.stepCount}>
                {todayActivity?.steps || 0}
              </Text>
              <Text style={styles.stepLabel}>Steps</Text>
              <Text style={styles.stepGoal}>Goal: 8,000</Text>
            </View>
            <View style={styles.stepCountIcon}>
              <Ionicons name="footsteps" size={48} color={T.primary2} />
            </View>
          </View>

          {/* Calorie Ring */}
          <View style={styles.divider} />
          <View style={styles.calorieSection}>
            {renderCalorieRing()}
            <View style={styles.calorieInfo}>
              <View style={styles.calorieInfoRow}>
                <Text style={styles.calorieInfoLabel}>Goal</Text>
                <Text style={styles.calorieInfoValue}>{calorieGoal} kcal</Text>
              </View>
              <View style={styles.calorieInfoRow}>
                <Text style={styles.calorieInfoLabel}>Remaining</Text>
                <Text style={styles.calorieInfoValue}>
                  {Math.max(0, calorieGoal - caloriesBurned)} kcal
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Heart Rate */}
        <Card padding="lg" style={{ marginBottom: 24 }}>
          <View style={styles.heartRateHeader}>
            <View>
              <Text style={styles.heartRateLabel}>Heart Rate</Text>
              <Text style={styles.heartRateValue}>
                {heartRate || 72} bpm
              </Text>
            </View>
            <Ionicons name="heart" size={40} color="#EF4444" />
          </View>
          <View style={styles.heartRateRange}>
            <Text style={styles.heartRateRangeLabel}>
              Resting: 60 bpm
            </Text>
            <Text style={styles.heartRateRangeLabel}>
              Max: 150 bpm
            </Text>
          </View>
        </Card>

        {/* Quick Access */}
        <Text style={styles.sectionTitle}>Quick Access</Text>

        {renderQuickAccessCard('fitness', 'Workouts', 'Start a workout', () =>
          navigation.navigate('Workouts')
        )}

        {renderQuickAccessCard(
          'nutrition',
          'Dietary Tracking',
          'Log your meals',
          () => navigation.navigate('Dietary', { screen: 'DietaryDashboard' } as any)
        )}

        {renderQuickAccessCard(
          'people',
          'Grooming',
          'Personal care tips',
          () => navigation.navigate('Dietary', { screen: 'GroomingDashboard' } as any)
        )}

        {renderQuickAccessCard(
          'watch',
          'Wearables',
          'Connect devices',
          () => navigation.navigate('Wearables')
        )}

        {/* Activity Tracking Link */}
        <TouchableOpacity
          style={styles.activityLink}
          onPress={() => navigation.navigate('ActivityTracking')}
        >
          <Text style={styles.activityLinkText}>View Detailed Activity Log</Text>
          <Ionicons name="arrow-forward" size={16} color={T.primary2} />
        </TouchableOpacity>
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
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: T.text,
  },
  statsDate: {
    fontSize: 12,
    color: T.muted,
  },
  stepCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepCountContent: {
    flex: 1,
  },
  stepCount: {
    fontSize: 32,
    fontWeight: '700',
    color: T.primary2,
  },
  stepLabel: {
    fontSize: 14,
    color: T.muted,
    marginTop: 4,
  },
  stepGoal: {
    fontSize: 12,
    color: T.muted,
    marginTop: 2,
  },
  stepCountIcon: {
    marginLeft: 20,
  },
  divider: {
    height: 1,
    backgroundColor: T.border2,
    marginVertical: 16,
  },
  calorieSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calorieRingContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calorieRingContent: {
    position: 'absolute',
    alignItems: 'center',
  },
  calorieValue: {
    fontSize: 24,
    fontWeight: '700',
    color: T.text,
  },
  calorieLabel: {
    fontSize: 11,
    color: T.muted,
    marginTop: 2,
  },
  calorieInfo: {
    flex: 1,
    marginLeft: 16,
  },
  calorieInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calorieInfoLabel: {
    fontSize: 13,
    color: T.muted,
  },
  calorieInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: T.text,
  },
  heartRateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heartRateLabel: {
    fontSize: 14,
    color: T.muted,
    marginBottom: 4,
  },
  heartRateValue: {
    fontSize: 28,
    fontWeight: '700',
    color: T.red,
  },
  heartRateRange: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: T.border2,
  },
  heartRateRangeLabel: {
    fontSize: 12,
    color: T.muted,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: T.text,
    marginBottom: 12,
  },
  quickAccessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: T.border2,
    gap: 12,
  },
  quickAccessIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${T.primary2}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAccessContent: {
    flex: 1,
  },
  quickAccessTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: T.text,
  },
  quickAccessSubtitle: {
    fontSize: 12,
    color: T.muted,
    marginTop: 2,
  },
  activityLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 16,
    marginBottom: 32,
    borderTopWidth: 1,
    borderTopColor: T.border2,
    gap: 8,
  },
  activityLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: T.primary2,
  },
});
