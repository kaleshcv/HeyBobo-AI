import React, { useState, useMemo } from 'react'
import {
  View, StyleSheet, FlatList, TextInput, ScrollView,
  TouchableOpacity, Image, Text,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useAppNavigation } from '@/navigation/useAppNavigation'
import { EmptyState } from '@/components/common/EmptyState'
import { AppHeader } from '@/components/layout/AppHeader'
import { useCourseStore, type LocalCourse } from '@/store/courseStore'
import T from '@/theme'

const LEVEL_COLORS: Record<string, string> = {
  beginner:     T.green,
  intermediate: T.orange,
  advanced:     T.red,
}

export function CoursesListScreen() {
  const insets     = useSafeAreaInsets()
  const navigation = useAppNavigation()

  const courses = useCourseStore((s) => s.courses)
  const getCourseProgress = useCourseStore((s) => s.getCourseProgress)

  const [searchQuery, setSearchQuery]         = useState('')
  const [selectedLevel, setSelectedLevel]     = useState<string | null>(null)

  const levels = ['beginner', 'intermediate', 'advanced']

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.instructor.toLowerCase().includes(searchQuery.toLowerCase())
      const matchLevel  = !selectedLevel || c.level === selectedLevel
      return matchSearch && matchLevel
    })
  }, [courses, searchQuery, selectedLevel])

  const renderCourseCard = ({ item }: { item: LocalCourse }) => {
    const progress   = getCourseProgress(item.id)
    const levelColor = LEVEL_COLORS[item.level] ?? T.primary

    return (
      <TouchableOpacity
        style={styles.courseCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('CoursePlayer', { courseId: item.id })}
      >
        {/* Thumbnail */}
        <View style={styles.thumbWrap}>
          <Image
            source={{ uri: item.thumbnail }}
            style={styles.thumbImage}
            resizeMode="cover"
          />
          {/* Video count badge */}
          <View style={styles.videoBadge}>
            <Ionicons name="play" size={10} color={T.white} />
            <Text style={styles.videoBadgeText}>{item.videos.length}</Text>
          </View>
          {/* Level badge */}
          <View style={[styles.levelBadge, { backgroundColor: levelColor + '22' }]}>
            <Text style={[styles.levelBadgeText, { color: levelColor }]}>
              {item.level.charAt(0).toUpperCase() + item.level.slice(1)}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.courseContent}>
          <Text style={styles.courseTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.courseInstructor} numberOfLines={1}>
            {item.instructor}
          </Text>

          {/* Progress */}
          {progress.completed > 0 && (
            <View style={styles.progressWrap}>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${progress.percent}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {progress.completed}/{progress.total} videos
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Explore Courses" />

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* AI Tutor Banner */}
        <TouchableOpacity
          style={styles.tutorBanner}
          onPress={() => navigation.navigate('AITutor')}
          activeOpacity={0.8}
        >
          <View style={styles.tutorBannerLeft}>
            <View style={styles.tutorBannerIcon}>
              <Ionicons name="sparkles" size={20} color={T.primary} />
            </View>
            <View>
              <Text style={styles.tutorBannerTitle}>AI Tutor</Text>
              <Text style={styles.tutorBannerSub}>Textbooks · Study Plans · Quizzes · Chat</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={T.primary} />
        </TouchableOpacity>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={T.muted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={T.muted}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={T.muted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Level Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.chip, !selectedLevel && styles.chipActive]}
            onPress={() => setSelectedLevel(null)}
          >
            <Text style={[styles.chipText, !selectedLevel && styles.chipTextActive]}>All</Text>
          </TouchableOpacity>
          {levels.map((lvl) => (
            <TouchableOpacity
              key={lvl}
              style={[styles.chip, selectedLevel === lvl && styles.chipActive]}
              onPress={() => setSelectedLevel(selectedLevel === lvl ? null : lvl)}
            >
              <View style={[styles.chipDot, { backgroundColor: LEVEL_COLORS[lvl] }]} />
              <Text style={[styles.chipText, selectedLevel === lvl && styles.chipTextActive]}>
                {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Community */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={styles.communityCard} onPress={() => navigation.navigate('Groups')}>
              <Ionicons name="people" size={28} color={T.primary} />
              <Text style={styles.communityTitle}>Study Groups</Text>
              <Text style={styles.communityDesc}>Join or create learning groups</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.communityCard} onPress={() => navigation.navigate('Meetings')}>
              <Ionicons name="videocam" size={28} color={T.green} />
              <Text style={styles.communityTitle}>Meetings</Text>
              <Text style={styles.communityDesc}>Schedule & join video meetings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Courses Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedLevel
                ? `${selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)} Courses`
                : 'All Courses'}
            </Text>
            <Text style={styles.sectionCount}>{filteredCourses.length} courses</Text>
          </View>

          {filteredCourses.length > 0 ? (
            <FlatList
              data={filteredCourses}
              renderItem={renderCourseCard}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.courseGrid}
              scrollEnabled={false}
            />
          ) : (
            <EmptyState
              icon="search"
              title="No Courses Found"
              description="Try adjusting your search or filters"
            />
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: T.bg },
  scrollContent: { flex: 1, paddingHorizontal: 16 },

  // Tutor banner
  tutorBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: T.surface, borderRadius: 12, padding: 14, marginTop: 12,
    borderWidth: 1, borderColor: T.border,
  },
  tutorBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tutorBannerIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: T.primary + '22', justifyContent: 'center', alignItems: 'center',
  },
  tutorBannerTitle: { fontSize: 14, fontWeight: '700', color: T.text },
  tutorBannerSub:   { fontSize: 11, color: T.muted, marginTop: 2 },

  // Search
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: T.surface, borderRadius: 12,
    borderWidth: 1, borderColor: T.border2,
    marginVertical: 16, paddingHorizontal: 12,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: T.text },

  // Filters
  filterRow:       { marginBottom: 20 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: T.border2, marginRight: 10,
    backgroundColor: T.surface,
  },
  chipActive:     { backgroundColor: T.primary2, borderColor: T.primary2 },
  chipText:       { fontSize: 13, color: T.muted, fontWeight: '500' },
  chipTextActive: { color: T.white },
  chipDot:        { width: 8, height: 8, borderRadius: 4 },

  // Section
  section:       { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle:  { fontSize: 18, fontWeight: '700', color: T.text, marginBottom: 14 },
  sectionCount:  { fontSize: 12, color: T.muted },

  // Course card
  courseGrid: { justifyContent: 'space-between', marginBottom: 14 },
  courseCard: {
    flex: 1, backgroundColor: T.surface, borderRadius: 12,
    marginHorizontal: 5, overflow: 'hidden',
    borderWidth: 1, borderColor: T.border,
  },
  thumbWrap:  { width: '100%', height: 100, backgroundColor: T.surface2 },
  thumbImage: { width: '100%', height: '100%' },
  videoBadge: {
    position: 'absolute', bottom: 6, right: 6,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  videoBadgeText: { fontSize: 10, fontWeight: '700', color: T.white },
  levelBadge: {
    position: 'absolute', top: 6, left: 6,
    borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2,
  },
  levelBadgeText: { fontSize: 9, fontWeight: '700' },

  courseContent:    { padding: 10 },
  courseTitle:      { fontSize: 13, fontWeight: '600', color: T.text, marginBottom: 4, lineHeight: 18 },
  courseInstructor: { fontSize: 11, color: T.muted, marginBottom: 6 },

  // Progress
  progressWrap: { marginTop: 4 },
  progressBg:   { height: 4, backgroundColor: T.border2, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: T.primary, borderRadius: 2 },
  progressText: { fontSize: 9, color: T.muted, marginTop: 3 },

  // Community
  communityCard: {
    flex: 1, backgroundColor: T.surface, borderRadius: 12, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: T.border, gap: 8,
  },
  communityTitle: { fontSize: 14, fontWeight: '700', color: T.text, textAlign: 'center' },
  communityDesc:  { fontSize: 12, color: T.muted, textAlign: 'center', lineHeight: 16 },
})
