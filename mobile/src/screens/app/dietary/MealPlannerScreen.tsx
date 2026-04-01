import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Text } from 'react-native';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { AppHeader } from '@/components/layout/AppHeader';
import T from '@/theme'

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export function MealPlannerScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();
  const [selectedDay, setSelectedDay] = useState(0);

  const renderMealSlot = (mealType: string) => (
    <TouchableOpacity
      key={mealType}
      style={styles.mealSlot}
      onPress={() => navigation.navigate('MealLog')}
    >
      <View style={styles.mealSlotHeader}>
        <Text style={styles.mealTypeLabel}>{mealType}</Text>
        <Ionicons name="add" size={20} color={T.primary2} />
      </View>
      <Text style={styles.mealPlaceholder}>No meal planned</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Meal Planner" subtitle="Weekly View" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Day Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
          {WEEK_DAYS.map((day, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.dayButton,
                selectedDay === idx && styles.dayButtonActive,
              ]}
              onPress={() => setSelectedDay(idx)}
            >
              <Text
                style={[
                  styles.dayText,
                  selectedDay === idx && styles.dayTextActive,
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Meal Slots for Selected Day */}
        <View style={styles.mealSlotsContainer}>
          {MEAL_TYPES.map((mealType) => renderMealSlot(mealType))}
        </View>

        {/* Daily Summary */}
        <Card padding="lg" style={{ marginBottom: 24 }}>
          <Text style={styles.sectionTitle}>Daily Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Calories</Text>
              <Text style={styles.summaryValue}>2,100</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Meals Planned</Text>
              <Text style={styles.summaryValue}>0</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Prep Time</Text>
              <Text style={styles.summaryValue}>--</Text>
            </View>
          </View>
        </Card>

        {/* Generate Plan Button */}
        <Button title="AI Generate Weekly Plan" fullWidth style={{ marginBottom: 32 }} />
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
    paddingVertical: 16,
  },
  daySelector: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border2,
  },
  dayButtonActive: {
    backgroundColor: T.primary2,
    borderColor: T.primary2,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
    color: T.text,
  },
  dayTextActive: {
    color: T.white,
  },
  mealSlotsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  mealSlot: {
    backgroundColor: T.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: T.border2,
    borderStyle: 'dashed',
  },
  mealSlotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: T.text,
  },
  mealPlaceholder: {
    fontSize: 12,
    color: T.muted,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: T.text,
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: T.muted,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: T.text,
  },
});
