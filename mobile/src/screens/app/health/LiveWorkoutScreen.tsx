import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { useRoute } from '@react-navigation/native';
import { Text } from 'react-native';
import { Button } from '@/components/common/Button';
import { CameraView } from 'expo-camera';
import { useLiveWorkoutStore } from '@/store/liveWorkoutStore';
import { useWearablesStore } from '@/store/wearablesStore';

const COLORS = {
  primary: '#6366F1',
  text: '#1E293B',
  secondaryText: '#64748B',
  background: '#F8FAFC',
  success: '#10B981',
  warning: '#F59E0B',
};

export function LiveWorkoutScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();
  const route = useRoute();
  const { workoutId } = route.params as { workoutId: string };

  const [isActive, setIsActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [repCount, setRepCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();

  const { heartRate } = useWearablesStore();

  const exercises = [
    { name: 'Push-ups', sets: 3, reps: 15 },
    { name: 'Squats', sets: 3, reps: 20 },
    { name: 'Lunges', sets: 3, reps: 12 },
  ];

  const currentExercise = exercises[currentExerciseIndex];

  useEffect(() => {
    if (!isActive) return;

    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [isActive]);

  const handleStartStop = () => {
    setIsActive(!isActive);
  };

  const handleRepCompleted = () => {
    setRepCount((prev) => prev + 1);
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setRepCount(0);
    }
  };

  const handleFinishWorkout = () => {
    alert(`Workout complete! Total time: ${Math.floor(elapsedTime / 60)} minutes`);
    navigation.goBack();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Camera Preview */}
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} />

        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.overlayHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.overlayTitle}>{currentExercise.name}</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Ionicons name="time" size={20} color="#fff" />
              <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text>
            </View>

            <View style={styles.statBox}>
              <Ionicons name="heart" size={20} color="#EF4444" />
              <Text style={styles.statValue}>{heartRate || 72}</Text>
            </View>

            <View style={styles.statBox}>
              <Ionicons name="repeat" size={20} color={COLORS.success} />
              <Text style={styles.statValue}>{repCount}</Text>
            </View>
          </View>

          {/* Exercise Info */}
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseGoal}>
              Goal: {currentExercise.reps} reps × {currentExercise.sets} sets
            </Text>
            <Text style={styles.exerciseProgress}>
              Exercise {currentExerciseIndex + 1} of {exercises.length}
            </Text>
          </View>

          {/* Control Buttons */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.controlButton, styles.repButton]}
              onPress={handleRepCompleted}
            >
              <Text style={styles.repButtonText}>Rep +1</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlButton,
                isActive ? styles.pauseButton : styles.startButton,
              ]}
              onPress={handleStartStop}
            >
              <Ionicons
                name={isActive ? 'pause' : 'play'}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleNextExercise}
              disabled={currentExerciseIndex === exercises.length - 1}
            >
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Bottom Actions */}
          <View style={styles.bottomActions}>
            <Button
              title="Finish Workout"
              onPress={handleFinishWorkout}
              fullWidth
              size="sm"
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  overlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overlayTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  exerciseInfo: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  exerciseGoal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  exerciseProgress: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repButton: {
    backgroundColor: COLORS.success,
  },
  repButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: COLORS.primary,
  },
  pauseButton: {
    backgroundColor: COLORS.success,
  },
  bottomActions: {
    paddingHorizontal: 0,
  },
});
