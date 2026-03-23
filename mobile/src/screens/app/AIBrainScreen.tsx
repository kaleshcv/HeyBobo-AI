import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Text } from 'react-native';
import { Card } from '@/components/common/Card';
import { Avatar } from '@/components/common/Avatar';
import { useAuthStore } from '@/store/authStore';
import { useLearningStats, useFeaturedCourses } from '@/hooks/useCourses';

const COLORS = {
  primary: '#6366F1',
  text: '#1E293B',
  secondaryText: '#64748B',
  background: '#F8FAFC',
  border: '#E2E8F0',
  success: '#10B981',
};

export function AIBrainScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();
  const { user } = useAuthStore();
  const { data: stats } = useLearningStats();
  const { data: featured } = useFeaturedCourses();

  const firstName = user?.firstName || 'Student';

  const renderStatCard = (icon: string, label: string, value: string) => (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Ionicons name={icon as any} size={24} color={COLORS.primary} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderQuickAction = (icon: string, title: string, onPress: () => void) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <View style={styles.actionIcon}>
        <Ionicons name={icon as any} size={28} color={COLORS.primary} />
      </View>
      <Text style={styles.actionTitle}>{title}</Text>
      <Ionicons
        name="arrow-forward"
        size={16}
        color={COLORS.primary}
        style={{ marginTop: 8 }}
      />
    </TouchableOpacity>
  );

  const renderCourseCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() => navigation.navigate('CoursePlayer', { courseId: item.id })}
    >
      <View style={styles.courseImageContainer}>
        <Ionicons name="play-circle" size={32} color={COLORS.primary} />
      </View>
      <Text style={styles.courseCardTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.courseCardInstructor} numberOfLines={1}>
        {item.instructor ? `${item.instructor.firstName ?? ''} ${item.instructor.lastName ?? ''}`.trim() : 'Instructor'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeContent}>
            <Text style={styles.greeting}>Welcome back, {firstName}! 👋</Text>
            <Text style={styles.subGreeting}>Let's continue your learning journey</Text>
          </View>
          <Avatar name={user ? `${user.firstName} ${user.lastName}` : 'S'} size="md" />
        </View>

        {/* Quick Stats */}
        <Card padding="lg" style={{ marginBottom: 24 }}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsGrid}>
            {renderStatCard(
              'school',
              'Courses Enrolled',
              `${stats?.totalCoursesEnrolled || 0}`
            )}
            {renderStatCard('flame', 'Day Streak', `${stats?.currentStreak || 0}`)}
            {renderStatCard(
              'ribbon',
              'Certificates',
              `${stats?.totalCertificates || 0}`
            )}
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.actionsGrid}>
            {renderQuickAction('chatbox', 'AI Tutor', () =>
              navigation.navigate('AITutor')
            )}
            {renderQuickAction('fitness', 'Fitness', () =>
              navigation.navigate('HealthFitness')
            )}
            {renderQuickAction('nutrition', 'Dietary', () =>
              navigation.navigate('DietaryDashboard')
            )}
            {renderQuickAction('people', 'Grooming', () =>
              navigation.navigate('GroomingDashboard')
            )}
          </View>
        </View>

        {/* Featured Courses */}
        {featured && featured.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured For You</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('CoursesList')}
              >
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={featured.slice(0, 3)}
              renderItem={renderCourseCard}
              keyExtractor={(item) => item.id}
              horizontal
              scrollEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
            />
          </View>
        )}

        {/* Motivational Card */}
        <View style={styles.motivationalCard}>
          <View style={styles.motivationalContent}>
            <Ionicons name="star" size={32} color="#FBBF24" />
            <Text style={styles.motivationalText}>
              Keep up the great work! You're on a {stats?.currentStreak || 0}-day
              learning streak. You've completed {stats?.totalCoursesCompleted || 0} courses!
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  welcomeContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  subGreeting: {
    fontSize: 14,
    color: COLORS.secondaryText,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.secondaryText,
    textAlign: 'center',
  },
  actionsSection: {
    marginBottom: 32,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  courseCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  courseImageContainer: {
    width: '100%',
    height: 100,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    padding: 8,
    paddingBottom: 4,
  },
  courseCardInstructor: {
    fontSize: 10,
    color: COLORS.secondaryText,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  motivationalCard: {
    backgroundColor: `#FBBF2415`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  motivationalContent: {
    alignItems: 'center',
    gap: 12,
  },
  motivationalText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 20,
  },
});
