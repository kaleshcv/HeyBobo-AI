import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Text } from 'react-native';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { AppHeader } from '@/components/layout/AppHeader';
import { useWorkoutPlans } from '@/hooks/useFitness';

const COLORS = {
  primary: '#6366F1',
  text: '#1E293B',
  secondaryText: '#64748B',
  background: '#F8FAFC',
  border: '#E2E8F0',
};

const MOCK_WORKOUTS = [
  {
    id: '1',
    name: 'Full Body Strength',
    difficulty: 'Intermediate',
    duration: '45 mins',
    exercises: 8,
    description: 'Build strength with compound exercises',
  },
  {
    id: '2',
    name: 'HIIT Cardio Blast',
    difficulty: 'Hard',
    duration: '30 mins',
    exercises: 6,
    description: 'High intensity interval training for cardio',
  },
  {
    id: '3',
    name: 'Yoga & Flexibility',
    difficulty: 'Beginner',
    duration: '40 mins',
    exercises: 12,
    description: 'Improve flexibility and relaxation',
  },
  {
    id: '4',
    name: 'Upper Body Focus',
    difficulty: 'Intermediate',
    duration: '50 mins',
    exercises: 10,
    description: 'Chest, back, shoulders and arms workout',
  },
];

export function WorkoutsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();

  const renderDifficultyBadge = (difficulty: string) => {
    const colors: Record<string, string> = {
      Beginner: '#10B981',
      Intermediate: '#F59E0B',
      Hard: '#EF4444',
    };
    return (
      <View
        style={[
          styles.difficultyBadge,
          { backgroundColor: `${colors[difficulty]}20` },
        ]}
      >
        <Text style={[styles.difficultyText, { color: colors[difficulty] }]}>
          {difficulty}
        </Text>
      </View>
    );
  };

  const renderWorkout = ({ item }: { item: (typeof MOCK_WORKOUTS)[0] }) => (
    <TouchableOpacity
      style={styles.workoutCard}
      onPress={() =>
        navigation.navigate('LiveWorkout', { workoutId: item.id })
      }
    >
      <View style={styles.workoutHeader}>
        <View style={styles.workoutIcon}>
          <Ionicons name="fitness" size={28} color={COLORS.primary} />
        </View>
        {renderDifficultyBadge(item.difficulty)}
      </View>

      <Text style={styles.workoutName}>{item.name}</Text>
      <Text style={styles.workoutDescription} numberOfLines={1}>
        {item.description}
      </Text>

      <View style={styles.workoutMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="time" size={14} color={COLORS.secondaryText} />
          <Text style={styles.metaText}>{item.duration}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="repeat" size={14} color={COLORS.secondaryText} />
          <Text style={styles.metaText}>{item.exercises} exercises</Text>
        </View>
      </View>

      <Button
        title="Start Workout"
        size="sm"
        fullWidth
        style={{ marginTop: 12 }}
      />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Workouts" subtitle="Choose a workout plan" />

      <View style={styles.headerCard}>
        <Ionicons name="sparkles" size={20} color={COLORS.primary} />
        <Text style={styles.headerCardText}>Generate AI Workout Plan</Text>
        <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
      </View>

      <FlatList
        data={MOCK_WORKOUTS}
        renderItem={renderWorkout}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}15`,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 10,
  },
  headerCardText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  workoutDescription: {
    fontSize: 13,
    color: COLORS.secondaryText,
    marginBottom: 12,
  },
  workoutMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.secondaryText,
  },
});
