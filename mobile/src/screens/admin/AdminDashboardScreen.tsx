import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text } from 'react-native';
import { Card } from '@/components/common/Card';
import { AppHeader } from '@/components/layout/AppHeader';
import T from '@/theme'

;

export function AdminDashboardScreen() {
  const insets = useSafeAreaInsets();

  const stats = [
    { label: 'Users', value: '1,234', icon: 'people' },
    { label: 'Courses', value: '156', icon: 'school' },
    { label: 'Enrollments', value: '5,678', icon: 'checkmark-circle' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Admin Dashboard" subtitle="Platform overview" />
      <ScrollView style={styles.content}>
        {stats.map((stat) => (
          <Card key={stat.label} padding="lg" style={styles.statCard}>
            <Ionicons name={stat.icon as any} size={24} color={T.primary2} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  content: { flex: 1, paddingHorizontal: 16, paddingVertical: 16 },
  statCard: { marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 16 },
  statValue: { fontSize: 18, fontWeight: '700', color: T.text },
  statLabel: { fontSize: 12, color: T.muted, marginTop: 4 },
});
