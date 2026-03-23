import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Text } from 'react-native';
import { Button } from '@/components/common/Button';
import { AppHeader } from '@/components/layout/AppHeader';

const COLORS = { primary: '#6366F1', text: '#1E293B', secondaryText: '#64748B', background: '#F8FAFC', border: '#E2E8F0' };

const COURSES = [
  { id: '1', title: 'React Basics', students: 45, published: true },
  { id: '2', title: 'Advanced JS', students: 32, published: false },
];

export function TeacherCoursesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();

  const renderCourse = ({ item }: any) => (
    <TouchableOpacity style={styles.courseCard}>
      <View>
        <Text style={styles.courseTitle}>{item.title}</Text>
        <Text style={styles.courseInfo}>{item.students} students enrolled</Text>
      </View>
      <View style={styles.courseActions}>
        <View style={[styles.badge, { backgroundColor: item.published ? '#10B98120' : '#F59E0B20' }]}>
          <Text style={{ color: item.published ? '#10B981' : '#F59E0B', fontSize: 10, fontWeight: '600' }}>
            {item.published ? 'Published' : 'Draft'}
          </Text>
        </View>
        <Button title="Edit" size="sm" variant="outline" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="My Courses" subtitle="Manage your courses" />
      <FlatList data={COURSES} renderItem={renderCourse} keyExtractor={(item) => item.id} contentContainerStyle={styles.listContent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listContent: { paddingHorizontal: 16, paddingVertical: 16 },
  courseCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  courseTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  courseInfo: { fontSize: 12, color: COLORS.secondaryText, marginTop: 4 },
  courseActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
});
