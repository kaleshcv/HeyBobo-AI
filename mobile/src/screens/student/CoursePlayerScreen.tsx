import React, { useState, useCallback } from 'react'
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Image,
  Text, Linking, Dimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useAppNavigation } from '@/navigation/useAppNavigation'
import { useRoute } from '@react-navigation/native'
import { Card } from '@/components/common/Card'
import { useCourseStore, getYouTubeId, type LocalVideo } from '@/store/courseStore'
import T from '@/theme'

const { width: SCREEN_W } = Dimensions.get('window')
const LEVEL_COLORS: Record<string, string> = {
  beginner: T.green, intermediate: T.orange, advanced: T.red,
}

export function CoursePlayerScreen() {
  const insets     = useSafeAreaInsets()
  const navigation = useAppNavigation()
  const route      = useRoute()
  const { courseId } = route.params as { courseId: string }

  const course           = useCourseStore((s) => s.courses.find((c) => c.id === courseId))
  const getCourseProgress = useCourseStore((s) => s.getCourseProgress)
  const markVideoCompleted = useCourseStore((s) => s.markVideoCompleted)
  const progress          = useCourseStore((s) => s.progress)

  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)

  const courseProgress = getCourseProgress(courseId)
  const activeVideo    = course?.videos.find((v) => v.id === activeVideoId) ?? null
  const levelColor     = LEVEL_COLORS[course?.level ?? 'beginner'] ?? T.primary

  const openYouTube = useCallback((video: LocalVideo) => {
    const ytId = getYouTubeId(video.youtubeUrl)
    if (ytId) {
      // Try app first, falls back to browser
      Linking.openURL(`https://www.youtube.com/watch?v=${ytId}`)
      markVideoCompleted(courseId, video.id)
    }
  }, [courseId, markVideoCompleted])

  if (!course) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={T.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Course Not Found</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>
    )
  }

  const isVideoCompleted = (videoId: string) =>
    progress.some((p) => p.courseId === courseId && p.videoId === videoId && p.completed)

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={T.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{course.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Hero thumbnail */}
        <View style={styles.heroWrap}>
          <Image source={{ uri: course.thumbnail }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroOverlay}>
            <View style={[styles.heroBadge, { backgroundColor: levelColor + '33' }]}>
              <Text style={[styles.heroBadgeText, { color: levelColor }]}>
                {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Course info */}
        <Card padding="lg" style={{ marginTop: -20, marginHorizontal: 16, zIndex: 1 }}>
          <Text style={styles.courseTitle}>{course.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="person" size={14} color={T.primary} />
              <Text style={styles.metaText}>{course.instructor}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="play-circle" size={14} color={T.cyan} />
              <Text style={styles.metaText}>{course.videos.length} videos</Text>
            </View>
          </View>

          <Text style={styles.description}>{course.description}</Text>

          {/* Progress bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressValue}>{courseProgress.percent}%</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${courseProgress.percent}%` }]} />
            </View>
            <Text style={styles.progressSub}>
              {courseProgress.completed} of {courseProgress.total} videos completed
            </Text>
          </View>
        </Card>

        {/* Video list */}
        <View style={styles.videosSection}>
          <Text style={styles.videosTitle}>Course Videos</Text>

          {course.videos.map((video, index) => {
            const completed = isVideoCompleted(video.id)
            const isActive  = activeVideoId === video.id
            const ytId      = getYouTubeId(video.youtubeUrl)

            return (
              <TouchableOpacity
                key={video.id}
                style={[styles.videoItem, isActive && styles.videoItemActive]}
                activeOpacity={0.7}
                onPress={() => {
                  setActiveVideoId(video.id)
                  openYouTube(video)
                }}
              >
                {/* Thumbnail */}
                <View style={styles.videoThumbWrap}>
                  {ytId ? (
                    <Image
                      source={{ uri: `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` }}
                      style={styles.videoThumb}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.videoThumb, { backgroundColor: T.surface2 }]} />
                  )}
                  <View style={styles.playOverlay}>
                    <Ionicons name="play" size={16} color={T.white} />
                  </View>
                  {completed && (
                    <View style={styles.completedOverlay}>
                      <Ionicons name="checkmark-circle" size={20} color={T.green} />
                    </View>
                  )}
                </View>

                {/* Info */}
                <View style={styles.videoInfo}>
                  <Text style={styles.videoIndex}>{index + 1}.</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
                    <View style={styles.videoDurationRow}>
                      <Ionicons name="time-outline" size={12} color={T.muted} />
                      <Text style={styles.videoDuration}>{video.duration}</Text>
                      {completed && <Text style={styles.completedTag}>Watched</Text>}
                    </View>
                  </View>
                  <Ionicons name="open-outline" size={16} color={T.muted2} />
                </View>
              </TouchableOpacity>
            )
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: T.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: T.bg2, borderBottomWidth: 1, borderBottomColor: T.border,
  },
  headerTitle: { fontSize: 16, fontWeight: '600', color: T.text, flex: 1, textAlign: 'center', marginHorizontal: 8 },
  content:     { flex: 1 },

  // Hero
  heroWrap:    { width: '100%', height: 200, backgroundColor: T.surface2 },
  heroImage:   { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 12 },
  heroBadge:   { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  heroBadgeText: { fontSize: 11, fontWeight: '700' },

  // Course info
  courseTitle:  { fontSize: 20, fontWeight: '700', color: T.text, marginBottom: 10 },
  metaRow:     { flexDirection: 'row', gap: 16, marginBottom: 12 },
  metaItem:    { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText:    { fontSize: 13, color: T.muted },
  description: { fontSize: 13, color: T.muted, lineHeight: 20, marginBottom: 16 },

  // Progress
  progressSection: { borderTopWidth: 1, borderTopColor: T.border, paddingTop: 12 },
  progressRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel:   { fontSize: 12, color: T.muted },
  progressValue:   { fontSize: 12, fontWeight: '700', color: T.primary },
  progressBg:      { height: 6, backgroundColor: T.border2, borderRadius: 3, overflow: 'hidden' },
  progressFill:    { height: '100%', backgroundColor: T.primary, borderRadius: 3 },
  progressSub:     { fontSize: 11, color: T.muted, marginTop: 6 },

  // Videos
  videosSection: { padding: 16 },
  videosTitle:   { fontSize: 18, fontWeight: '700', color: T.text, marginBottom: 14 },
  videoItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: T.surface, borderRadius: 12, padding: 10,
    marginBottom: 10, borderWidth: 1, borderColor: T.border,
  },
  videoItemActive: { borderColor: T.primary },
  videoThumbWrap:  { width: 100, height: 60, borderRadius: 8, overflow: 'hidden', position: 'relative' },
  videoThumb:      { width: '100%', height: '100%' },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center',
  },
  completedOverlay: {
    position: 'absolute', top: 2, right: 2,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, padding: 1,
  },
  videoInfo:   { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  videoIndex:  { fontSize: 14, fontWeight: '700', color: T.muted2, width: 20 },
  videoTitle:  { fontSize: 13, fontWeight: '600', color: T.text, lineHeight: 18 },
  videoDurationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  videoDuration:    { fontSize: 11, color: T.muted },
  completedTag: {
    fontSize: 9, fontWeight: '700', color: T.green,
    backgroundColor: T.green + '22', borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 1, marginLeft: 6,
  },
})
