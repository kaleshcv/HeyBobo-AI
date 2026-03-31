import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  FlatList,
  SectionList,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAppNavigation } from '@/navigation/useAppNavigation'
import { useWorkoutSystemStore, EXERCISE_DATABASE, PRESET_PLANS } from '@/store/workoutSystemStore'
import { AppHeader } from '@/components/layout/AppHeader'
import T from '@/theme'

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function FitnessDashboardScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useAppNavigation()
  const { plans, activePlanId, setActivePlan, addPlan } = useWorkoutSystemStore()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const activePlan = plans.find((p) => p.id === activePlanId)
  const categories = Array.from(new Set(EXERCISE_DATABASE.map((e) => e.category)))

  const filteredExercises = selectedCategory
    ? EXERCISE_DATABASE.filter((e) => e.category === selectedCategory)
    : EXERCISE_DATABASE

  const renderExerciseCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>{item.difficulty.charAt(0).toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.exerciseInfo}>
        {item.defaultReps && <Text style={styles.exerciseDetail}>{item.defaultReps} reps</Text>}
        {item.durationSeconds && (
          <Text style={styles.exerciseDetail}>{Math.round(item.durationSeconds / 60)} min</Text>
        )}
      </View>
      <View style={styles.muscleGroups}>
        {item.muscles.slice(0, 2).map((m: string) => (
          <Text key={m} style={styles.muscleTag}>
            {m.split('-')[0]}
          </Text>
        ))}
      </View>
    </TouchableOpacity>
  )

  const renderPresetPlan = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.presetPlanCard}
      onPress={() => {
        addPlan(item)
      }}
    >
      <View style={styles.planHeader}>
        <View>
          <Text style={styles.planName}>{item.name}</Text>
          <Text style={styles.planGoal}>{item.goal.replace('-', ' ')}</Text>
        </View>
        <View style={styles.planDaysPerWeek}>
          <Text style={styles.planDaysText}>{item.daysPerWeek}</Text>
          <Text style={styles.planDaysLabel}>days/week</Text>
        </View>
      </View>
      <Text style={styles.planDesc} numberOfLines={2}>
        {item.description}
      </Text>
    </TouchableOpacity>
  )

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Fitness Dashboard" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activePlan && (
          <View style={styles.activePlanCard}>
            <View style={styles.activePlanHeader}>
              <View>
                <Text style={styles.activePlanTitle}>{activePlan.name}</Text>
                <Text style={styles.activePlanGoal}>
                  Goal: {activePlan.goal.replace('-', ' ')}
                </Text>
              </View>
              <View style={styles.statsBox}>
                <Text style={styles.statsValue}>{activePlan.completedSessions}</Text>
                <Text style={styles.statsLabel}>Sessions</Text>
              </View>
            </View>

            <View style={styles.weekSchedule}>
              {DAYS.map((day, idx) => {
                const dayKey = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][idx]
                const hasWorkout = activePlan.weeklySchedule[dayKey]?.length > 0
                return (
                  <TouchableOpacity key={day} style={[styles.dayChip, hasWorkout && styles.dayChipActive]}>
                    <Text style={[styles.dayText, hasWorkout && styles.dayTextActive]}>
                      {day}
                    </Text>
                    {hasWorkout && <View style={styles.workoutDot} />}
                  </TouchableOpacity>
                )
              })}
            </View>

            <TouchableOpacity style={styles.startButton}>
              <Ionicons name="play" size={20} color="#FFF" />
              <Text style={styles.startButtonText}>Start Workout</Text>
            </TouchableOpacity>
          </View>
        )}

        {!activePlan && (
          <View style={styles.noActivePlanCard}>
            <Ionicons name="checkmark-circle" size={48} color={T.muted} />
            <Text style={styles.noActivePlanText}>No active plan</Text>
            <Text style={styles.noActivePlanSubtext}>Select a preset plan below</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preset Plans</Text>
          <FlatList
            data={PRESET_PLANS}
            renderItem={renderPresetPlan}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercise Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryContent}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === null && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === null && styles.categoryChipTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === cat && styles.categoryChipTextActive,
                  ]}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercises ({filteredExercises.length})</Text>
          <FlatList
            data={filteredExercises}
            renderItem={renderExerciseCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  activePlanCard: {
    backgroundColor: T.primary2,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  activePlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activePlanTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  activePlanGoal: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  statsBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  statsValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  statsLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    marginTop: 2,
  },
  weekSchedule: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayChip: {
    width: '13%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayChipActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  dayText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '600',
  },
  dayTextActive: {
    color: '#FFF',
  },
  workoutDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#111827',
    marginTop: 4,
  },
  startButton: {
    backgroundColor: '#111827',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  startButtonText: {
    color: T.primary2,
    fontWeight: '700',
    fontSize: 14,
  },
  noActivePlanCard: {
    backgroundColor: T.surface2,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: T.border2,
  },
  noActivePlanText: {
    fontSize: 16,
    fontWeight: '600',
    color: T.text,
    marginTop: 12,
  },
  noActivePlanSubtext: {
    fontSize: 13,
    color: T.muted,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: T.text,
    marginBottom: 12,
  },
  categoryScroll: {
    marginBottom: 12,
  },
  categoryContent: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: T.surface2,
    borderWidth: 1,
    borderColor: T.border2,
  },
  categoryChipActive: {
    backgroundColor: T.primary2,
    borderColor: T.primary2,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: T.muted,
  },
  categoryChipTextActive: {
    color: '#FFF',
  },
  presetPlanCard: {
    backgroundColor: T.surface2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: T.border2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  planName: {
    fontSize: 14,
    fontWeight: '700',
    color: T.text,
  },
  planGoal: {
    fontSize: 11,
    color: T.muted,
    marginTop: 2,
  },
  planDaysPerWeek: {
    backgroundColor: T.primary2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  planDaysText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  planDaysLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 9,
  },
  planDesc: {
    fontSize: 12,
    color: T.muted,
  },
  exerciseCard: {
    backgroundColor: T.surface2,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: T.border2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: T.text,
  },
  difficultyBadge: {
    backgroundColor: T.primary2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  exerciseInfo: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  exerciseDetail: {
    fontSize: 11,
    color: T.muted,
  },
  muscleGroups: {
    flexDirection: 'row',
    gap: 4,
  },
  muscleTag: {
    backgroundColor: T.bg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    color: T.primary2,
    fontWeight: '500',
  },
})
