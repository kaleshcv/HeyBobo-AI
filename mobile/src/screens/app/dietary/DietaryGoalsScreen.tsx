import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Text } from 'react-native';
import { Button } from '@/components/common/Button';
import { AppHeader } from '@/components/layout/AppHeader';
import T from '@/theme'

const GOALS = [
  {
    id: 'lose_weight',
    title: 'Lose Weight',
    description: 'Reduce body weight and fat',
    icon: 'trending-down',
    color: T.red,
  },
  {
    id: 'gain_weight',
    title: 'Gain Weight',
    description: 'Build muscle and mass',
    icon: 'trending-up',
    color: T.green,
  },
  {
    id: 'maintain',
    title: 'Maintain Weight',
    description: 'Keep current weight stable',
    icon: 'swap-horizontal',
    color: T.orange,
  },
  {
    id: 'build_muscle',
    title: 'Build Muscle',
    description: 'Increase strength and mass',
    icon: 'fitness',
    color: T.primary2,
  },
];

export function DietaryGoalsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();
  const [selectedGoal, setSelectedGoal] = useState('maintain');

  const handleSelectGoal = (goalId: string) => {
    setSelectedGoal(goalId);
  };

  const handleContinue = () => {
    alert(`Selected: ${GOALS.find((g) => g.id === selectedGoal)?.title}`);
    navigation.navigate('DietaryProfile');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Dietary Goals" subtitle="What's your goal?" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Choose a goal that aligns with your health and fitness objectives
        </Text>

        {GOALS.map((goal) => (
          <TouchableOpacity
            key={goal.id}
            style={[
              styles.goalCard,
              selectedGoal === goal.id && styles.goalCardActive,
            ]}
            onPress={() => handleSelectGoal(goal.id)}
          >
            <View style={styles.goalCardContent}>
              <View
                style={[
                  styles.goalIcon,
                  { backgroundColor: `${goal.color}20` },
                ]}
              >
                <Ionicons
                  name={goal.icon as any}
                  size={28}
                  color={goal.color}
                />
              </View>

              <View style={styles.goalTextContent}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={styles.goalDescription}>{goal.description}</Text>
              </View>

              <View style={styles.goalCheckbox}>
                {selectedGoal === goal.id && (
                  <View style={styles.goalCheckboxInner} />
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color={T.primary2} />
            <Text style={styles.infoTitle}>How It Works</Text>
          </View>
          <Text style={styles.infoText}>
            Your goal will help us customize meal recommendations, calorie targets, and macronutrient ratios to match your objectives.
          </Text>
        </View>

        <Button
          title="Continue"
          onPress={handleContinue}
          fullWidth
          style={{ marginBottom: 32 }}
        />
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
  subtitle: {
    fontSize: 14,
    color: T.muted,
    marginBottom: 24,
    lineHeight: 20,
  },
  goalCard: {
    backgroundColor: T.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: T.border2,
  },
  goalCardActive: {
    borderColor: T.primary2,
    backgroundColor: `${T.primary2}08`,
  },
  goalCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  goalIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalTextContent: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: T.text,
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 12,
    color: T.muted,
  },
  goalCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: T.border2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalCheckboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: T.primary2,
  },
  infoCard: {
    backgroundColor: `${T.primary2}08`,
    borderRadius: 10,
    padding: 14,
    marginTop: 24,
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: T.text,
  },
  infoText: {
    fontSize: 12,
    color: T.muted,
    lineHeight: 16,
  },
});
