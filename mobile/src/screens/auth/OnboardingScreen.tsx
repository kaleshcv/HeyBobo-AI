import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { TextInput } from 'react-native'
import { Button } from '@/components/common/Button'
import { useFitnessProfileStore } from '@/store/fitnessProfileStore'
import type { FitnessGoal, ActivityLevel } from '@/types'
import T from '@/theme'

type OnboardingStep = 1 | 2 | 3 | 4

interface OnboardingState {
  // Step 1: Physical Profile
  heightCm: string
  weightKg: string
  age: string
  gender: 'Male' | 'Female' | 'Other' | null
  // Step 2: Fitness Goals
  fitnessGoals: FitnessGoal[]
  lastWorkout: 'Never' | 'A week ago' | 'A month ago' | 'More than 3 months ago' | null
  // Step 3: Education Goals
  educationGoals: string[]
  // Step 4: Activity Level
  activityLevel: ActivityLevel | null
}

const FITNESS_GOAL_OPTIONS: { id: FitnessGoal; label: string; icon: string }[] = [
  { id: 'weight-loss', label: 'Weight Loss', icon: 'scale-outline' },
  { id: 'muscle-gain', label: 'Muscle Gain', icon: 'barbell-outline' },
  { id: 'general-fitness', label: 'General Fitness', icon: 'checkmark-circle-outline' },
  { id: 'endurance', label: 'Endurance', icon: 'heart-outline' },
  { id: 'rehab-mobility', label: 'Rehab/Mobility', icon: 'fitness-outline' },
]

const EDUCATION_GOAL_OPTIONS: { id: string; label: string; icon: string }[] = [
  { id: 'web-dev', label: 'Web Development', icon: 'code-outline' },
  { id: 'mobile-dev', label: 'Mobile Development', icon: 'phone-portrait-outline' },
  { id: 'data-science', label: 'Data Science', icon: 'analytics-outline' },
  { id: 'machine-learning', label: 'Machine Learning', icon: 'settings-outline' },
  { id: 'ui-ux', label: 'UI/UX Design', icon: 'palette-outline' },
  { id: 'python', label: 'Python', icon: 'code-outline' },
  { id: 'general-learning', label: 'General Learning', icon: 'school-outline' },
]

const ACTIVITY_LEVEL_OPTIONS: { id: ActivityLevel; label: string; description: string }[] = [
  { id: 'sedentary', label: 'Sedentary', description: 'Little or no exercise' },
  { id: 'lightly-active', label: 'Lightly Active', description: '1-3 days/week' },
  { id: 'moderately-active', label: 'Moderately Active', description: '3-5 days/week' },
  { id: 'very-active', label: 'Very Active', description: '6-7 days/week' },
  { id: 'extremely-active', label: 'Extremely Active', description: 'Physical job + exercise' },
]

export function OnboardingScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<any>()
  const { setProfile, completeOnboarding } = useFitnessProfileStore()

  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1)
  const [state, setState] = useState<OnboardingState>({
    heightCm: '',
    weightKg: '',
    age: '',
    gender: null,
    fitnessGoals: [],
    lastWorkout: null,
    educationGoals: [],
    activityLevel: null,
  })

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as OnboardingStep)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as OnboardingStep)
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    // Save the fitness profile
    setProfile({
      heightCm: state.heightCm ? parseInt(state.heightCm) : null,
      weightKg: state.weightKg ? parseInt(state.weightKg) : null,
      goals: state.fitnessGoals,
      activityLevel: state.activityLevel,
    })

    // Mark onboarding as complete
    completeOnboarding()

    // Navigate to main app
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    })
  }

  const toggleFitnessGoal = (goal: FitnessGoal) => {
    setState((prev) => ({
      ...prev,
      fitnessGoals: prev.fitnessGoals.includes(goal)
        ? prev.fitnessGoals.filter((g) => g !== goal)
        : [...prev.fitnessGoals, goal],
    }))
  }

  const toggleEducationGoal = (goal: string) => {
    setState((prev) => ({
      ...prev,
      educationGoals: prev.educationGoals.includes(goal)
        ? prev.educationGoals.filter((g) => g !== goal)
        : [...prev.educationGoals, goal],
    }))
  }

  const progress = (currentStep / 4) * 100

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header with Skip */}
        <View style={styles.header}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Step {currentStep} of 4
          </Text>
        </View>

        {/* Step 1: Physical Profile */}
        {currentStep === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Physical Profile</Text>
            <Text style={styles.stepSubtitle}>
              Help us understand your fitness baseline
            </Text>

            {/* Height */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 175"
                placeholderTextColor={T.muted2}
                keyboardType="decimal-pad"
                value={state.heightCm}
                onChangeText={(text) =>
                  setState((prev) => ({ ...prev, heightCm: text }))
                }
              />
            </View>

            {/* Weight */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 70"
                placeholderTextColor={T.muted2}
                keyboardType="decimal-pad"
                value={state.weightKg}
                onChangeText={(text) =>
                  setState((prev) => ({ ...prev, weightKg: text }))
                }
              />
            </View>

            {/* Age */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 28"
                placeholderTextColor={T.muted2}
                keyboardType="number-pad"
                value={state.age}
                onChangeText={(text) =>
                  setState((prev) => ({ ...prev, age: text }))
                }
              />
            </View>

            {/* Gender */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.chipRow}>
                {['Male', 'Female', 'Other'].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.chip,
                      state.gender === gender && styles.chipActive,
                    ]}
                    onPress={() =>
                      setState((prev) => ({
                        ...prev,
                        gender: gender as 'Male' | 'Female' | 'Other',
                      }))
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        state.gender === gender && styles.chipTextActive,
                      ]}
                    >
                      {gender}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Step 2: Fitness Goals */}
        {currentStep === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Fitness Goals</Text>
            <Text style={styles.stepSubtitle}>
              Select all that apply
            </Text>

            {/* Fitness Goals Chips */}
            <View style={styles.chipGrid}>
              {FITNESS_GOAL_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.goalChip,
                    state.fitnessGoals.includes(option.id) &&
                      styles.goalChipActive,
                  ]}
                  onPress={() => toggleFitnessGoal(option.id)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={
                      state.fitnessGoals.includes(option.id)
                        ? T.primary
                        : T.muted
                    }
                  />
                  <Text
                    style={[
                      styles.goalChipText,
                      state.fitnessGoals.includes(option.id) &&
                        styles.goalChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Last Workout */}
            <View style={[styles.inputGroup, { marginTop: 24 }]}>
              <Text style={styles.label}>When was your last workout?</Text>
              <View style={styles.chipRow}>
                {[
                  { id: 'Never' as const, label: 'Never' },
                  { id: 'A week ago' as const, label: 'A week ago' },
                  { id: 'A month ago' as const, label: 'A month ago' },
                  { id: 'More than 3 months ago' as const, label: 'More than 3 months' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.chip,
                      styles.smallChip,
                      state.lastWorkout === option.id && styles.chipActive,
                    ]}
                    onPress={() =>
                      setState((prev) => ({ ...prev, lastWorkout: option.id }))
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        styles.smallChipText,
                        state.lastWorkout === option.id &&
                          styles.chipTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Step 3: Education Goals */}
        {currentStep === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Learning Goals</Text>
            <Text style={styles.stepSubtitle}>
              What would you like to learn?
            </Text>

            <View style={styles.chipGrid}>
              {EDUCATION_GOAL_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.goalChip,
                    state.educationGoals.includes(option.id) &&
                      styles.goalChipActive,
                  ]}
                  onPress={() => toggleEducationGoal(option.id)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={
                      state.educationGoals.includes(option.id)
                        ? T.primary
                        : T.muted
                    }
                  />
                  <Text
                    style={[
                      styles.goalChipText,
                      state.educationGoals.includes(option.id) &&
                        styles.goalChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 4: Activity Level */}
        {currentStep === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Activity Level</Text>
            <Text style={styles.stepSubtitle}>
              How active are you?
            </Text>

            <View style={styles.activityLevelContainer}>
              {ACTIVITY_LEVEL_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.activityCard,
                    state.activityLevel === option.id &&
                      styles.activityCardActive,
                  ]}
                  onPress={() =>
                    setState((prev) => ({
                      ...prev,
                      activityLevel: option.id,
                    }))
                  }
                >
                  <View style={styles.activityCardContent}>
                    <Text style={styles.activityLabel}>{option.label}</Text>
                    <Text style={styles.activityDescription}>
                      {option.description}
                    </Text>
                  </View>
                  {state.activityLevel === option.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={T.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Spacer */}
        <View style={{ height: 32 }} />

        {/* Navigation Buttons */}
        <View style={styles.buttonRow}>
          <Button
            title="Back"
            onPress={handleBack}
            disabled={currentStep === 1}
            variant="secondary"
            size="lg"
            style={{ flex: 1, marginRight: 8 }}
          />
          <Button
            title={currentStep === 4 ? 'Complete' : 'Next'}
            onPress={handleNext}
            size="lg"
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: T.bg,
  },
  content: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  skipBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: T.muted,
  },
  progressContainer: {
    marginBottom: 28,
  },
  progressBar: {
    height: 6,
    backgroundColor: T.surface3,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: T.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: T.muted,
    textAlign: 'right',
  },
  stepContainer: {
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: T.text,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 15,
    color: T.muted,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: T.text2,
    marginBottom: 10,
  },
  input: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border2,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: T.text,
    fontWeight: '500',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: T.surface3,
    borderWidth: 1.5,
    borderColor: T.border2,
  },
  smallChip: {
    flex: 1,
    minWidth: '30%',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: T.text2,
    textAlign: 'center',
  },
  smallChipText: {
    fontSize: 12,
  },
  chipActive: {
    backgroundColor: T.primary2,
    borderColor: T.primary,
  },
  chipTextActive: {
    color: T.text,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalChip: {
    flex: 1,
    minWidth: '45%',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: T.surface3,
    borderWidth: 1.5,
    borderColor: T.border2,
    alignItems: 'center',
    gap: 8,
  },
  goalChipActive: {
    backgroundColor: T.primary2,
    borderColor: T.primary,
  },
  goalChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: T.text2,
    textAlign: 'center',
  },
  goalChipTextActive: {
    color: T.text,
  },
  activityLevelContainer: {
    gap: 12,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: T.surface,
    borderWidth: 1.5,
    borderColor: T.border2,
  },
  activityCardActive: {
    backgroundColor: T.primary2,
    borderColor: T.primary,
  },
  activityCardContent: {
    flex: 1,
  },
  activityLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: T.text,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 13,
    color: T.muted,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
})
