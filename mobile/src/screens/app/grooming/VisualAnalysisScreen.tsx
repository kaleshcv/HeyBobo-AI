import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Text } from 'react-native';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { CameraView } from 'expo-camera';
import { useGroomingStore } from '@/store/groomingStore';
import type { SkinType } from '@/store/groomingStore';

const COLORS = {
  primary: '#6366F1',
  text: '#1E293B',
  secondaryText: '#64748B',
  background: '#F8FAFC',
  border: '#E2E8F0',
};

export function VisualAnalysisScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const cameraRef = useRef<CameraView>(null);
  const { addAnalysisResult, updateProfile } = useGroomingStore();

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      const newResult = {
        id: `a${Date.now()}`,
        date: new Date().toISOString(),
        skinType: 'Combination' as SkinType,
        skinScore: Math.floor(65 + Math.random() * 25),
        concerns: ['Dryness', 'Oiliness'],
        recommendations: [
          'Use lightweight, non-comedogenic moisturizer',
          'Apply sunscreen daily',
          'Exfoliate 2-3 times weekly',
        ],
      };
      addAnalysisResult(newResult);
      updateProfile({ skinType: newResult.skinType, concerns: newResult.concerns });
      setResults(newResult);
      setIsAnalyzing(false);
    }, 2000);
  };

  if (results) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { setResults(null); navigation.goBack(); }}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: COLORS.text }]}>Analysis Results</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Skin Score */}
          <Card padding="lg" style={{ marginBottom: 20 }}>
            <Text style={styles.resultLabel}>Skin Score</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={[styles.resultValue, { color: COLORS.primary }]}>{results.skinScore}</Text>
              <Text style={{ fontSize: 14, color: COLORS.secondaryText }}>/100</Text>
            </View>
          </Card>

          {/* Skin Type */}
          <Card padding="lg" style={{ marginBottom: 20 }}>
            <Text style={styles.resultLabel}>Skin Type</Text>
            <Text style={styles.resultValue}>{results.skinType}</Text>
          </Card>

          {/* Concerns */}
          <Card padding="lg" style={{ marginBottom: 20 }}>
            <Text style={styles.resultLabel}>Identified Concerns</Text>
            {results.concerns.map((concern: string, idx: number) => (
              <View
                key={idx}
                style={[
                  styles.concernChip,
                  idx > 0 && { marginTop: 8 },
                ]}
              >
                <Ionicons name="alert-circle" size={16} color={COLORS.primary} />
                <Text style={styles.concernText}>{concern}</Text>
              </View>
            ))}
          </Card>

          {/* Recommendations */}
          <Card padding="lg" style={{ marginBottom: 32 }}>
            <Text style={styles.resultLabel}>Personalized Recommendations</Text>
            {results.recommendations.map((rec: string, idx: number) => (
              <View
                key={idx}
                style={[
                  styles.recommendationItem,
                  idx > 0 && { marginTop: 12 },
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={COLORS.primary}
                />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </Card>

          <Button
            title="Take Another Photo"
            onPress={() => setResults(null)}
            fullWidth
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Visual Analysis</Text>
        <View style={{ width: 24 }} />
      </View>

      {isAnalyzing ? (
        <View style={styles.analyzingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.analyzingText}>Analyzing your photo...</Text>
        </View>
      ) : (
        <>
          <View style={styles.cameraContainer}>
            <CameraView style={styles.camera} />
            <View style={styles.cameraOverlay}>
              <View style={styles.cameraMask} />
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleTakePhoto}
            >
              <View style={styles.captureBtnInner}>
                <Ionicons name="camera" size={32} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraMask: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtnInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingText: {
    fontSize: 14,
    color: '#fff',
    marginTop: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.background,
  },
  resultLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondaryText,
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  concernChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: `${COLORS.primary}08`,
    borderRadius: 6,
    gap: 8,
  },
  concernText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  recommendationText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.secondaryText,
    lineHeight: 18,
  },
});
