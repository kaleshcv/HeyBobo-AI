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
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useRoute } from '@react-navigation/native';
import { useCourse, useCourseContent } from '@/hooks/useCourses';
import { useEnrollment, useEnroll } from '@/hooks/useEnrollment';

const COLORS = {
  primary: '#6366F1',
  text: '#1E293B',
  secondaryText: '#64748B',
  background: '#F8FAFC',
  border: '#E2E8F0',
};

export function CoursePlayerScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();
  const route = useRoute();
  const { courseId } = route.params as { courseId: string };

  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const { data: course, isLoading } = useCourse(courseId);
  const { data: courseContent } = useCourseContent(courseId);
  const { data: enrollment } = useEnrollment(courseId);
  const { mutate: enroll, isPending } = useEnroll();

  const handleEnroll = () => {
    enroll(courseId, {
      onSuccess: () => {
        // Navigate to first lesson after enrollment
        if (courseContent?.[0]?.lessons?.[0]) {
          navigation.navigate('LessonPlayer', {
            lessonId: courseContent[0].lessons[0].id,
            courseId,
          });
        }
      },
    });
  };

  const renderSectionHeader = (section: any) => (
    <TouchableOpacity
      style={styles.sectionHeader}
      onPress={() =>
        setExpandedSection(expandedSection === section.id ? null : section.id)
      }
    >
      <View style={styles.sectionTitleContainer}>
        <Ionicons
          name={expandedSection === section.id ? 'chevron-down' : 'chevron-forward'}
          size={20}
          color={COLORS.primary}
        />
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text style={styles.lessonCount}>{section.lessons?.length || 0} lessons</Text>
      </View>
    </TouchableOpacity>
  );

  const renderLesson = (lesson: any) => (
    <TouchableOpacity
      style={styles.lessonItem}
      onPress={() =>
        enrollment
          ? navigation.navigate('LessonPlayer', {
              lessonId: lesson.id,
              courseId,
            })
          : null
      }
      disabled={!enrollment}
    >
      <Ionicons
        name={lesson.type === 'video' ? 'play-circle-outline' : 'document-text-outline'}
        size={18}
        color={COLORS.primary}
      />
      <View style={styles.lessonContent}>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        <Text style={styles.lessonDuration}>{lesson.duration || 'N/A'}</Text>
      </View>
      {lesson.completed && (
        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Loading course...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Course Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Course Thumbnail */}
        <View style={styles.thumbnailContainer}>
          <Ionicons
            name="film"
            size={80}
            color={COLORS.primary}
            style={{ alignSelf: 'center' }}
          />
        </View>

        {/* Course Info */}
        <Card padding="lg">
          <Text style={styles.courseTitle}>{course?.title}</Text>

          {course?.instructor && (
            <View style={styles.instructorInfo}>
              <View style={styles.instructorAvatar}>
                <Text style={styles.avatarText}>
                  {course.instructor.firstName?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.instructorName}>{`${course.instructor.firstName} ${course.instructor.lastName}`}</Text>
                <Text style={styles.instructorRole}>Instructor</Text>
              </View>
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="people" size={16} color={COLORS.primary} />
              <Text style={styles.statText}>
                {course?.enrollmentCount || 0} enrolled
              </Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="time" size={16} color={COLORS.primary} />
              <Text style={styles.statText}>{course?.totalDuration || 0} hours</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="star" size={16} color="#FBBF24" />
              <Text style={styles.statText}>{course?.rating || '4.5'}</Text>
            </View>
          </View>

          <Text style={styles.descriptionTitle}>About This Course</Text>
          <Text style={styles.description}>{course?.description}</Text>
        </Card>

        {/* Sections & Lessons */}
        <View style={styles.sectionsContainer}>
          <Text style={styles.sectionsTitle}>Course Content</Text>

          {courseContent?.map((section: any) => (
            <View key={section.id} style={styles.sectionWrapper}>
              {renderSectionHeader(section)}
              {expandedSection === section.id && (
                <View style={styles.lessonsContainer}>
                  {section.lessons?.map((lesson: any) =>
                    renderLesson(lesson)
                  )}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Enroll Button */}
        {!enrollment && (
          <View style={styles.enrollButtonContainer}>
            <Button
              title={`Enroll Now${course?.price ? ` - $${course.price.toFixed(2)}` : ''}`}
              onPress={handleEnroll}
              loading={isPending}
              fullWidth
            />
          </View>
        )}
      </ScrollView>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.secondaryText,
    textAlign: 'center',
    marginTop: 20,
  },
  thumbnailContainer: {
    width: '100%',
    height: 200,
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 12,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  instructorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  instructorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  instructorName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  instructorRole: {
    fontSize: 12,
    color: COLORS.secondaryText,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: COLORS.secondaryText,
    fontWeight: '500',
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.secondaryText,
    lineHeight: 20,
  },
  sectionsContainer: {
    marginTop: 32,
    marginBottom: 32,
  },
  sectionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  sectionWrapper: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  lessonCount: {
    fontSize: 12,
    color: COLORS.secondaryText,
  },
  lessonsContainer: {
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  lessonDuration: {
    fontSize: 12,
    color: COLORS.secondaryText,
  },
  enrollButtonContainer: {
    paddingBottom: 32,
  },
});
