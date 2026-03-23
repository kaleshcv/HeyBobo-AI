import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Card } from '@/components/common/Card';
import { AppHeader } from '@/components/layout/AppHeader';
import { useGroomingStore } from '@/store/groomingStore';
import type { RecommendationCategory } from '@/store/groomingStore';

const COLORS = {
  primary: '#6366F1',
  text: '#1E293B',
  secondaryText: '#64748B',
  background: '#F8FAFC',
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};

const CATEGORY_COLORS: Record<RecommendationCategory, string> = {
  Skincare: '#EC4899',
  Haircare: '#F97316',
  Lifestyle: '#10B981',
  Grooming: '#6366F1',
};

const CATEGORY_ICONS: Record<RecommendationCategory, any> = {
  Skincare: 'water',
  Haircare: 'cut',
  Lifestyle: 'leaf',
  Grooming: 'sparkles',
};

function ScoreRing({ score }: { score: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? COLORS.success : score >= 50 ? COLORS.warning : COLORS.error;

  return (
    <View style={styles.scoreRingWrapper}>
      <Svg width={100} height={100} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r={radius} stroke={COLORS.border} strokeWidth="6" fill="none" />
        <Circle
          cx="50" cy="50" r={radius}
          stroke={color} strokeWidth="6" fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90" originX="50" originY="50"
        />
      </Svg>
      <View style={styles.scoreRingInner}>
        <Text style={[styles.scoreNumber, { color }]}>{score}</Text>
        <Text style={styles.scoreLabel}>/100</Text>
      </View>
    </View>
  );
}

export function GroomingDashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();
  const { profile, recommendations, analysisHistory, routine, toggleRoutineStep } = useGroomingStore();

  const latestAnalysis = analysisHistory[0] ?? null;

  const stats = useMemo(() => {
    const saved = recommendations.filter((r) => r.saved).length;
    const skincare = recommendations.filter((r) => r.category === 'Skincare').length;
    const haircare = recommendations.filter((r) => r.category === 'Haircare').length;
    const lifestyle = recommendations.filter((r) => r.category === 'Lifestyle').length;
    return { saved, skincare, haircare, lifestyle, total: recommendations.length };
  }, [recommendations]);

  const topRecs = useMemo(
    () => recommendations.filter((r) => r.priority === 'High').slice(0, 3),
    [recommendations],
  );

  const morningSteps = routine.filter((s) => s.period === 'morning');
  const eveningSteps = routine.filter((s) => s.period === 'evening');
  const morningDone = morningSteps.filter((s) => s.done).length;
  const eveningDone = eveningSteps.filter((s) => s.done).length;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Grooming & Lifestyle" subtitle="Personal Care Hub" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Profile Card ─────────────────────────────────────────────────── */}
        <Card padding="lg" style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Profile</Text>
            <TouchableOpacity>
              <Text style={styles.linkText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileChipRow}>
            {[
              { icon: 'water-outline', label: 'Skin', value: profile.skinType },
              { icon: 'cut-outline', label: 'Hair', value: profile.hairType },
              { icon: 'person-outline', label: 'Face', value: profile.faceShape },
            ].map((item) => (
              <View key={item.label} style={styles.profileChip}>
                <Ionicons name={item.icon as any} size={16} color={COLORS.primary} />
                <View>
                  <Text style={styles.profileChipLabel}>{item.label}</Text>
                  <Text style={styles.profileChipValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>

          {profile.concerns.length > 0 && (
            <View style={styles.concernsRow}>
              {profile.concerns.map((c) => (
                <View key={c} style={styles.concernChip}>
                  <Text style={styles.concernChipText}>{c}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* ── Quick Stats ───────────────────────────────────────────────────── */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Tips', value: stats.total, icon: 'bulb', color: COLORS.primary },
            { label: 'Saved', value: stats.saved, icon: 'bookmark', color: '#EC4899' },
            { label: 'Analyses', value: analysisHistory.length, icon: 'scan', color: COLORS.success },
            { label: 'Skin Score', value: latestAnalysis?.skinScore ?? '—', icon: 'star', color: COLORS.warning },
          ].map((stat) => (
            <Card key={stat.label} padding="md" style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}18` }]}>
                <Ionicons name={stat.icon as any} size={18} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Card>
          ))}
        </View>

        {/* ── AI Visual Analysis Snapshot ───────────────────────────────────── */}
        <Card padding="lg" style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Skin Analysis</Text>
            <TouchableOpacity onPress={() => navigation.navigate('VisualAnalysis')}>
              <Text style={styles.linkText}>New Scan</Text>
            </TouchableOpacity>
          </View>

          {latestAnalysis ? (
            <View style={styles.analysisRow}>
              <ScoreRing score={latestAnalysis.skinScore} />
              <View style={styles.analysisInfo}>
                <Text style={styles.analysisSkinType}>{latestAnalysis.skinType} Skin</Text>
                <Text style={styles.analysisDate}>Last scan: {formatDate(latestAnalysis.date)}</Text>
                <View style={styles.concernsRow}>
                  {latestAnalysis.concerns.slice(0, 3).map((c) => (
                    <View key={c} style={[styles.concernChip, { backgroundColor: '#EF444415' }]}>
                      <Text style={[styles.concernChipText, { color: COLORS.error }]}>{c}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.noAnalysisCTA}
              onPress={() => navigation.navigate('VisualAnalysis')}
            >
              <Ionicons name="camera-outline" size={28} color={COLORS.primary} />
              <Text style={styles.noAnalysisText}>Take your first skin analysis</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </Card>

        {/* ── Top Priority Recommendations ─────────────────────────────────── */}
        <Card padding="lg" style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Priority Tips</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Recommendations')}>
              <Text style={styles.linkText}>View All</Text>
            </TouchableOpacity>
          </View>

          {topRecs.map((rec, idx) => {
            const catColor = CATEGORY_COLORS[rec.category];
            return (
              <TouchableOpacity
                key={rec.id}
                style={[styles.recRow, idx > 0 && { marginTop: 10 }]}
                onPress={() => navigation.navigate('Recommendations')}
              >
                <View style={[styles.recIcon, { backgroundColor: `${catColor}18` }]}>
                  <Ionicons name={CATEGORY_ICONS[rec.category]} size={18} color={catColor} />
                </View>
                <View style={styles.recContent}>
                  <Text style={styles.recTitle}>{rec.title}</Text>
                  <Text style={styles.recCategory}>{rec.category}</Text>
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: '#EF444418' }]}>
                  <Text style={[styles.priorityText, { color: COLORS.error }]}>High</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </Card>

        {/* ── Category Breakdown ────────────────────────────────────────────── */}
        <Card padding="lg" style={styles.card}>
          <Text style={styles.sectionTitle}>By Category</Text>
          <View style={styles.categoryRow}>
            {(
              [
                ['Skincare', stats.skincare, '#EC4899'],
                ['Haircare', stats.haircare, '#F97316'],
                ['Lifestyle', stats.lifestyle, '#10B981'],
              ] as [string, number, string][]
            ).map(([label, count, color]) => (
              <TouchableOpacity
                key={label}
                style={[styles.categoryChip, { borderColor: color, backgroundColor: `${color}12` }]}
                onPress={() => navigation.navigate('Recommendations')}
              >
                <Text style={[styles.categoryChipCount, { color }]}>{count}</Text>
                <Text style={[styles.categoryChipLabel, { color }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* ── Daily Routine Tracker ─────────────────────────────────────────── */}
        <Card padding="lg" style={[styles.card, { marginBottom: 32 }]}>
          <Text style={styles.sectionTitle}>Daily Routine</Text>

          {/* Morning */}
          <View style={styles.routineHeader}>
            <View style={styles.routinePeriodRow}>
              <Ionicons name="sunny" size={16} color={COLORS.warning} />
              <Text style={styles.routinePeriodLabel}>Morning</Text>
            </View>
            <Text style={styles.routineProgress}>
              {morningDone}/{morningSteps.length} done
            </Text>
          </View>
          {morningSteps.map((step) => (
            <TouchableOpacity
              key={step.id}
              style={styles.routineStep}
              onPress={() => toggleRoutineStep(step.id)}
            >
              <Ionicons
                name={step.done ? 'checkmark-circle' : 'ellipse-outline'}
                size={20}
                color={step.done ? COLORS.success : COLORS.border}
              />
              <Text style={[styles.routineStepLabel, step.done && styles.routineStepDone]}>
                {step.label}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Evening */}
          <View style={[styles.routineHeader, { marginTop: 16 }]}>
            <View style={styles.routinePeriodRow}>
              <Ionicons name="moon" size={16} color='#8B5CF6' />
              <Text style={styles.routinePeriodLabel}>Evening</Text>
            </View>
            <Text style={styles.routineProgress}>
              {eveningDone}/{eveningSteps.length} done
            </Text>
          </View>
          {eveningSteps.map((step) => (
            <TouchableOpacity
              key={step.id}
              style={styles.routineStep}
              onPress={() => toggleRoutineStep(step.id)}
            >
              <Ionicons
                name={step.done ? 'checkmark-circle' : 'ellipse-outline'}
                size={20}
                color={step.done ? COLORS.success : COLORS.border}
              />
              <Text style={[styles.routineStepLabel, step.done && styles.routineStepDone]}>
                {step.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, paddingHorizontal: 16, paddingVertical: 16 },
  card: { marginBottom: 20 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  linkText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Profile
  profileChipRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  profileChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: `${COLORS.primary}08`,
    borderWidth: 1,
    borderColor: `${COLORS.primary}20`,
  },
  profileChipLabel: { fontSize: 10, color: COLORS.secondaryText },
  profileChipValue: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  concernsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  concernChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: `${COLORS.error}12`,
  },
  concernChipText: { fontSize: 11, color: COLORS.error, fontWeight: '500' },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  statValue: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: 10, color: COLORS.secondaryText, marginTop: 2 },

  // Analysis
  analysisRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  scoreRingWrapper: { position: 'relative', width: 100, height: 100 },
  scoreRingInner: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
  },
  scoreNumber: { fontSize: 22, fontWeight: '800' },
  scoreLabel: { fontSize: 10, color: COLORS.secondaryText },
  analysisInfo: { flex: 1 },
  analysisSkinType: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  analysisDate: { fontSize: 12, color: COLORS.secondaryText, marginBottom: 8 },
  noAnalysisCTA: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 14, paddingHorizontal: 16,
    backgroundColor: `${COLORS.primary}08`,
    borderRadius: 10, borderWidth: 1, borderColor: `${COLORS.primary}30`,
    borderStyle: 'dashed',
  },
  noAnalysisText: { flex: 1, fontSize: 14, color: COLORS.primary, fontWeight: '500' },

  // Recommendations
  recRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  recIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  recContent: { flex: 1 },
  recTitle: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  recCategory: { fontSize: 11, color: COLORS.secondaryText, marginTop: 2 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  priorityText: { fontSize: 10, fontWeight: '600' },

  // Category breakdown
  categoryRow: { flexDirection: 'row', gap: 10 },
  categoryChip: {
    flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 10,
    borderWidth: 1,
  },
  categoryChipCount: { fontSize: 20, fontWeight: '800' },
  categoryChipLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },

  // Routine
  routineHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
  },
  routinePeriodRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  routinePeriodLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  routineProgress: { fontSize: 12, color: COLORS.secondaryText },
  routineStep: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  routineStepLabel: { fontSize: 13, color: COLORS.text, flex: 1 },
  routineStepDone: { textDecorationLine: 'line-through', color: COLORS.secondaryText },
});
