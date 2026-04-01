import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Text } from 'react-native';
import { Button } from '@/components/common/Button';
import { AppHeader } from '@/components/layout/AppHeader';
import T from '@/theme'

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
          <Text style={{ color: item.published ? T.green : T.orange, fontSize: 10, fontWeight: '600' }}>
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
  container: { flex: 1, backgroundColor: T.bg },
  listContent: { paddingHorizontal: 16, paddingVertical: 16 },
  courseCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: T.surface, borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: T.border2 },
  courseTitle: { fontSize: 14, fontWeight: '700', color: T.text },
  courseInfo: { fontSize: 12, color: T.muted, marginTop: 4 },
  courseActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
});
