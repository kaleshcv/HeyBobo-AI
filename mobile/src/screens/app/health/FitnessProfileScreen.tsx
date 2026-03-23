import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Text } from 'react-native';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';

const COLORS = {
  primary: '#6366F1',
  text: '#1E293B',
  secondaryText: '#64748B',
  background: '#F8FAFC',
  border: '#E2E8F0',
};

const FITNESS_GOALS = ['Lose Weight', 'Gain Muscle', 'Get Fit', 'Maintain Health'];
const ACTIVITY_LEVELS = ['Sedentary', 'Light', 'Moderate', 'Very Active'];
const FITNESS_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export function FitnessProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();

  const [currentStep, setCurrentStep] = useState(0);
  const [fitnessGoal, setFitnessGoal] = useState<string | null>(null);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<string | null>(null);
  const [fitnessLevel, setFitnessLevel] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerItems, setPickerItems] = useState<string[]>([]);

  const steps = [
    { title: 'Fitness Goal', description: 'What is your main fitness goal?' },
    { title: 'Body Measurements', description: 'Enter your height and weight' },
    { title: 'Activity Level', description: 'How active are you?' },
    { title: 'Fitness Level', description: 'What is your current fitness level?' },
  ];

  const handlePickerSelect = (value: string) => {
    if (currentStep === 0) setFitnessGoal(value);
    else if (currentStep === 2) setActivityLevel(value);
    else if (currentStep === 3) setFitnessLevel(value);
    setShowPicker(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save profile
      alert('Profile saved!');
      navigation.goBack();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderPickerOption = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.pickerOption}
      onPress={() => handlePickerSelect(item)}
    >
      <Text style={styles.pickerOptionText}>{item}</Text>
      <Ionicons name="checkmark" size={20} color={COLORS.primary} />
    </TouchableOpacity>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepDescription}>
              Choose a fitness goal that resonates with you
            </Text>
            {FITNESS_GOALS.map((goal) => (
              <TouchableOpacity
                key={goal}
                style={[
                  styles.goalCard,
                  fitnessGoal === goal && styles.goalCardActive,
                ]}
                onPress={() => setFitnessGoal(goal)}
              >
                <View style={styles.goalIcon}>
                  <Ionicons
                    name={
                      goal === 'Lose Weight'
                        ? 'scale'
                        : goal === 'Gain Muscle'
                          ? 'fitness'
                          : goal === 'Get Fit'
                            ? 'rocket'
                            : 'shield-checkmark'
                    }
                    size={24}
                    color={fitnessGoal === goal ? '#fff' : COLORS.primary}
                  />
                </View>
                <View style={styles.goalContent}>
                  <Text
                    style={[
                      styles.goalTitle,
                      fitnessGoal === goal && styles.goalTitleActive,
                    ]}
                  >
                    {goal}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepDescription}>
              Help us understand your body composition
            </Text>
            <Card padding="lg">
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="170"
                value={height}
                onChangeText={setHeight}
                keyboardType="decimal-pad"
              />

              <View style={{ height: 16 }} />

              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="70"
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
              />
            </Card>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepDescription}>
              Choose your typical activity level
            </Text>
            {ACTIVITY_LEVELS.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.optionCard,
                  activityLevel === level && styles.optionCardActive,
                ]}
                onPress={() => setActivityLevel(level)}
              >
                <View style={styles.optionRadio}>
                  {activityLevel === level && (
                    <View style={styles.optionRadioInner} />
                  )}
                </View>
                <Text
                  style={[
                    styles.optionText,
                    activityLevel === level && styles.optionTextActive,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepDescription}>
              Select your current fitness level
            </Text>
            {FITNESS_LEVELS.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.optionCard,
                  fitnessLevel === level && styles.optionCardActive,
                ]}
                onPress={() => setFitnessLevel(level)}
              >
                <View style={styles.optionRadio}>
                  {fitnessLevel === level && (
                    <View style={styles.optionRadioInner} />
                  )}
                </View>
                <Text
                  style={[
                    styles.optionText,
                    fitnessLevel === level && styles.optionTextActive,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fitness Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentStep + 1) / steps.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Step {currentStep + 1} of {steps.length}
        </Text>
      </View>

      {/* Step Title */}
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
      </View>

      {/* Step Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.footer}>
        <Button
          title="Back"
          variant="outline"
          onPress={handleBack}
          disabled={currentStep === 0}
          fullWidth
        />
        <Button
          title={currentStep === steps.length - 1 ? 'Complete' : 'Next'}
          onPress={handleNext}
          fullWidth
        />
      </View>

      {/* Picker Modal */}
      <Modal visible={showPicker} transparent animationType="slide">
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select an option</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={pickerItems}
              renderItem={renderPickerOption}
              keyExtractor={(item) => item}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.secondaryText,
  },
  stepHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  stepDescription: {
    fontSize: 14,
    color: COLORS.secondaryText,
    marginBottom: 20,
    lineHeight: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  stepContent: {
    paddingBottom: 32,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 12,
  },
  goalCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}08`,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  goalTitleActive: {
    color: '#fff',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  optionCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}08`,
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  optionTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerOptionText: {
    fontSize: 14,
    color: COLORS.text,
  },
});
