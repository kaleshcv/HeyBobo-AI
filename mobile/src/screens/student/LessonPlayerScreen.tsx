import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { useRoute } from '@react-navigation/native';
import { Text } from 'react-native';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useUpdateProgress, useCompleteLesson, useToggleBookmark } from '@/hooks/useProgress';
import { useCourseContent } from '@/hooks/useCourses';
import T from '@/theme'
// expo-video Video component - use VideoView in newer Expo SDK
// import { VideoView } from 'expo-video'; // uncomment when upgrading

export function LessonPlayerScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();
  const route = useRoute();
  const { lessonId, courseId } = route.params as { lessonId: string; courseId: string };

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  const { data: courseContent } = useCourseContent(courseId);
  const { mutate: updateProgress } = useUpdateProgress(lessonId);
  const { mutate: completeLesson } = useCompleteLesson();
  const { mutate: toggleBookmark } = useToggleBookmark();

  // Find current lesson
  const lesson = courseContent
    ?.flatMap((s: any) => s.lessons)
    .find((l: any) => l.id === lessonId);

  // Find next lesson
  const allLessons = courseContent?.flatMap((s: any) => s.lessons) || [];
  const currentIndex = allLessons.findIndex((l: any) => l.id === lessonId);
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1
    ? allLessons[currentIndex + 1]
    : null;

  const handleVideoProgress = (status: any) => {
    if (status.durationMillis > 0) {
      const progress = (status.positionMillis / status.durationMillis) * 100;
      setVideoProgress(progress);

      // Auto-complete if 80% watched
      if (progress >= 80 && !lesson?.completed) {
        completeLesson(lessonId);
      }

      // Update progress
      updateProgress({ watchedSeconds: Math.round(status.positionMillis / 1000), totalSeconds: Math.round(status.durationMillis / 1000) });
    }
  };

  const handleToggleBookmark = () => {
    toggleBookmark(lessonId);
    setIsBookmarked(!isBookmarked);
  };

  const handleCompleteLesson = () => {
    completeLesson(lessonId);
  };

  const handleNextLesson = () => {
    if (nextLesson) {
      navigation.push('LessonPlayer', {
        lessonId: nextLesson.id,
        courseId,
      });
    }
  };

  if (!lesson) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Lesson not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={T.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {lesson.title}
        </Text>
        <TouchableOpacity onPress={handleToggleBookmark}>
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={T.primary2}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Video Player */}
        {lesson.videoUrl && (
          <View style={styles.videoContainer}>
            {/* Video player placeholder - replace with VideoView from expo-video when upgrading SDK */}
            <View style={[styles.video, { backgroundColor: T.black, alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="play-circle" size={64} color={T.white} />
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(videoProgress, 100)}%` },
                ]}
              />
            </View>
          </View>
        )}

        {/* Lesson Info */}
        <Card padding="lg">
          <View style={styles.lessonHeader}>
            <View>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              <View style={styles.lessonMeta}>
                <Ionicons name="time" size={14} color={T.muted} />
                <Text style={styles.metaText}>{lesson.duration || 'N/A'}</Text>
              </View>
            </View>
            {lesson.completed && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={24} color={T.green} />
              </View>
            )}
          </View>

          <Text style={styles.description}>{lesson.description}</Text>

          {!lesson.completed && (
            <Button
              title="Mark as Complete"
              onPress={handleCompleteLesson}
              fullWidth
              style={{ marginTop: 16 }}
            />
          )}
        </Card>

        {/* Resources */}
        {lesson.resources && lesson.resources.length > 0 && (
          <View style={styles.resourcesSection}>
            <Text style={styles.resourcesTitle}>Resources</Text>
            {lesson.resources.map((resource: any, index: number) => (
              <TouchableOpacity key={index} style={styles.resourceItem}>
                <Ionicons
                  name={
                    resource.type === 'pdf'
                      ? 'document'
                      : resource.type === 'link'
                        ? 'link'
                        : 'download'
                  }
                  size={18}
                  color={T.primary2}
                />
                <View style={styles.resourceContent}>
                  <Text style={styles.resourceName}>{resource.name}</Text>
                  <Text style={styles.resourceType}>{resource.type?.toUpperCase()}</Text>
                </View>
                <Ionicons name="download" size={18} color={T.primary2} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Notes Section */}
        <Card padding="lg" style={{ marginBottom: 32 }}>
          <Text style={styles.notesTitle}>Add Notes</Text>
          <View style={styles.notesInput}>
            <Text style={styles.placeholderText}>
              Take notes on this lesson...
            </Text>
          </View>
        </Card>

        {/* Navigation */}
        {nextLesson && (
          <View style={styles.navigationContainer}>
            <Button
              title="Next Lesson"
              onPress={handleNextLesson}
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
    backgroundColor: T.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: T.surface,
    borderBottomWidth: 1,
    borderBottomColor: T.border2,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: T.text,
    marginHorizontal: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  errorText: {
    fontSize: 16,
    color: T.muted,
    textAlign: 'center',
    marginTop: 20,
  },
  videoContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: T.black,
  },
  video: {
    width: '100%',
    height: 220,
  },
  progressBar: {
    height: 3,
    backgroundColor: `${T.primary2}20`,
  },
  progressFill: {
    height: '100%',
    backgroundColor: T.primary2,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: T.text,
    marginBottom: 8,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: T.muted,
  },
  completedBadge: {
    padding: 8,
  },
  description: {
    fontSize: 14,
    color: T.muted,
    lineHeight: 20,
    marginBottom: 16,
  },
  resourcesSection: {
    marginBottom: 24,
  },
  resourcesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: T.text,
    marginBottom: 12,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: T.border2,
    gap: 12,
  },
  resourceContent: {
    flex: 1,
  },
  resourceName: {
    fontSize: 14,
    fontWeight: '500',
    color: T.text,
  },
  resourceType: {
    fontSize: 12,
    color: T.muted,
    marginTop: 2,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: T.text,
    marginBottom: 12,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: T.border2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: `${T.primary2}05`,
    minHeight: 100,
  },
  placeholderText: {
    fontSize: 14,
    color: T.muted,
  },
  navigationContainer: {
    marginBottom: 32,
  },
});
