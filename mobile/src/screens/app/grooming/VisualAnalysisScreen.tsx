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
import T from '@/theme'


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
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: false });
      // Simulate AI analysis on the captured photo (replace with real API later)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const newResult = {
        id: `a${Date.now()}`,
        date: new Date().toISOString(),
        photoUri: photo?.uri ?? null,
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
    } catch (_e) {
      // Camera capture failed — fall back to simulated result
      const newResult = {
        id: `a${Date.now()}`,
        date: new Date().toISOString(),
        photoUri: null,
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
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (results) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { setResults(null); navigation.goBack(); }}>
            <Ionicons name="arrow-back" size={24} color={T.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: T.text }]}>Analysis Results</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Skin Score */}
          <Card padding="lg" style={{ marginBottom: 20 }}>
            <Text style={styles.resultLabel}>Skin Score</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={[styles.resultValue, { color: T.primary2 }]}>{results.skinScore}</Text>
              <Text style={{ fontSize: 14, color: T.muted }}>/100</Text>
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
                <Ionicons name="alert-circle" size={16} color={T.primary2} />
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
                  color={T.primary2}
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
          <Ionicons name="arrow-back" size={24} color={T.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Visual Analysis</Text>
        <View style={{ width: 24 }} />
      </View>

      {isAnalyzing ? (
        <View style={styles.analyzingContainer}>
          <ActivityIndicator size="large" color={T.primary2} />
          <Text style={styles.analyzingText}>Analyzing your photo...</Text>
        </View>
      ) : (
        <>
          <View style={styles.cameraContainer}>
            <CameraView ref={cameraRef} style={styles.camera} facing="front" />
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
                <Ionicons name="camera" size={32} color={T.white} />
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
    color: T.white,
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
    borderColor: T.primary2,
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
    backgroundColor: T.primary2,
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
    color: T.white,
    marginTop: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: T.bg,
  },
  resultLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: T.muted,
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: '700',
    color: T.text,
  },
  concernChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: `${T.primary2}08`,
    borderRadius: 6,
    gap: 8,
  },
  concernText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: T.text,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  recommendationText: {
    flex: 1,
    fontSize: 13,
    color: T.muted,
    lineHeight: 18,
  },
});
