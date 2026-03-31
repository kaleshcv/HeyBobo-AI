import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Text } from 'react-native';
import { Card } from '@/components/common/Card';
import { AppHeader } from '@/components/layout/AppHeader';
import { useNutritionSummary, useMealLogs } from '@/hooks/useDietary';
import { useDietaryProfileStore } from '@/store/dietaryProfileStore';
import Svg, { Circle } from 'react-native-svg';
import T from '@/theme'


export function DietaryDashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();
  const { data: nutrition } = useNutritionSummary();
  const { data: meals } = useMealLogs();

  const calorieGoal = 2000;
  const caloriesBurned = nutrition?.totalCalories || 1200;
  const caloriesPercent = (caloriesBurned / calorieGoal) * 100;

  const renderCalorieRing = () => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (caloriesPercent / 100) * circumference;

    return (
      <View style={styles.calorieRingContainer}>
        <Svg width={140} height={140} viewBox="0 0 140 140">
          <Circle
            cx="70"
            cy="70"
            r={radius}
            stroke={T.border2}
            strokeWidth="8"
            fill="none"
          />
          <Circle
            cx="70"
            cy="70"
            r={radius}
            stroke={T.primary2}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            rotation="-90"
            originX="70"
            originY="70"
          />
        </Svg>
        <View style={styles.calorieRingContent}>
          <Text style={styles.calorieValue}>{caloriesBurned}</Text>
          <Text style={styles.calorieLabel}>kcal</Text>
        </View>
      </View>
    );
  };

  const renderMacroBar = (label: string, value: number, goal: number, color: string) => (
    <View style={styles.macroBar}>
      <View style={styles.macroLabelContainer}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValue}>{value}g</Text>
      </View>
      <View style={styles.macroBarTrack}>
        <View
          style={[
            styles.macroBarFill,
            { width: `${Math.min((value / goal) * 100, 100)}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.macroGoal}>{goal}g</Text>
    </View>
  );

  const renderMeal = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.mealItem}
      onPress={() => navigation.navigate('MealLog')}
    >
      <View style={styles.mealIcon}>
        <Ionicons name="fast-food" size={20} color={T.primary2} />
      </View>
      <View style={styles.mealContent}>
        <Text style={styles.mealName}>{item.name}</Text>
        <Text style={styles.mealTime}>{item.time}</Text>
      </View>
      <Text style={styles.mealCalories}>{item.calories} kcal</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Dietary Tracking" subtitle="Today's Summary" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calorie Ring */}
        <Card padding="lg" style={{ marginBottom: 24 }}>
          <Text style={styles.sectionTitle}>Daily Calories</Text>
          <View style={styles.calorieSection}>
            {renderCalorieRing()}
            <View style={styles.calorieInfo}>
              <View style={styles.calorieInfoRow}>
                <Text style={styles.calorieInfoLabel}>Goal</Text>
                <Text style={styles.calorieInfoValue}>{calorieGoal}</Text>
              </View>
              <View style={styles.calorieInfoRow}>
                <Text style={styles.calorieInfoLabel}>Remaining</Text>
                <Text
                  style={[
                    styles.calorieInfoValue,
                    { color: Math.max(0, calorieGoal - caloriesBurned) > 0 ? T.green : T.orange },
                  ]}
                >
                  {Math.max(0, calorieGoal - caloriesBurned)}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Macros */}
        <Card padding="lg" style={{ marginBottom: 24 }}>
          <Text style={styles.sectionTitle}>Macronutrients</Text>
          {renderMacroBar('Protein', nutrition?.totalProtein || 45, 150, T.cyan)}
          {renderMacroBar('Carbs', nutrition?.totalCarbs || 180, 250, T.orange)}
          {renderMacroBar('Fat', nutrition?.totalFat || 55, 70, T.red)}
        </Card>

        {/* Water Tracker */}
        <Card padding="lg" style={{ marginBottom: 24 }}>
          <View style={styles.waterHeader}>
            <View>
              <Text style={styles.sectionTitle}>Water Intake</Text>
              <Text style={styles.waterCount}>6/8 glasses</Text>
            </View>
            <TouchableOpacity style={styles.addWaterButton}>
              <Ionicons name="add" size={20} color={T.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.waterGlasses}>
            {[...Array(8)].map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.waterGlass,
                  idx < 6 && styles.waterGlassFilled,
                ]}
              >
                <Ionicons
                  name="water"
                  size={14}
                  color={idx < 6 ? T.cyan : T.border2}
                />
              </View>
            ))}
          </View>
        </Card>

        {/* Recent Meals */}
        <View style={styles.mealsSection}>
          <View style={styles.mealsHeader}>
            <Text style={styles.sectionTitle}>Recent Meals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MealLog')}>
              <Text style={styles.addMealButton}>+ Add Meal</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={[
              { id: '1', name: 'Breakfast - Oatmeal', time: '8:00 AM', calories: 450 },
              { id: '2', name: 'Lunch - Grilled Chicken', time: '12:30 PM', calories: 650 },
              { id: '3', name: 'Snack - Apple', time: '3:00 PM', calories: 95 },
            ]}
            renderItem={renderMeal}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
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
    marginBottom: 12,
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
    fontSize: 22,
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
    fontSize: 12,
    color: T.muted,
  },
  calorieInfoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: T.text,
  },
  macroBar: {
    marginBottom: 16,
  },
  macroLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: T.text,
  },
  macroValue: {
    fontSize: 13,
    fontWeight: '600',
    color: T.text,
  },
  macroBarTrack: {
    height: 8,
    backgroundColor: T.border2,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  macroBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  macroGoal: {
    fontSize: 11,
    color: T.muted,
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  waterCount: {
    fontSize: 18,
    fontWeight: '700',
    color: T.primary2,
    marginTop: 4,
  },
  addWaterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: T.primary2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterGlasses: {
    flexDirection: 'row',
    gap: 8,
  },
  waterGlass: {
    flex: 1,
    height: 40,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: T.border2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterGlassFilled: {
    backgroundColor: `${T.cyan}20`,
    borderColor: T.cyan,
  },
  mealsSection: {
    marginBottom: 32,
  },
  mealsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addMealButton: {
    fontSize: 12,
    fontWeight: '600',
    color: T.primary2,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: T.border2,
    gap: 12,
  },
  mealIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${T.primary2}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealContent: {
    flex: 1,
  },
  mealName: {
    fontSize: 13,
    fontWeight: '600',
    color: T.text,
  },
  mealTime: {
    fontSize: 11,
    color: T.muted,
    marginTop: 2,
  },
  mealCalories: {
    fontSize: 13,
    fontWeight: '700',
    color: T.primary2,
  },
});
