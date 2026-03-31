import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { useRoute } from '@react-navigation/native';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/EmptyState';
import { AppHeader } from '@/components/layout/AppHeader';
import { useFeaturedCourses, useCourses, useCategories } from '@/hooks/useCourses';
import { Text } from 'react-native';
import T from '@/theme'

;

export function CoursesListScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: featuredCourses } = useFeaturedCourses();
  const { data: courses, isLoading } = useCourses();
  const { data: categories } = useCategories();

  const filteredCourses = useMemo(() => {
    return (courses?.data || []).filter((course) => {
      const matchesSearch = course.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || course.category?.id === selectedCategory || course.category?.slug === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [courses, searchQuery, selectedCategory]);

  const renderCourseCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() =>
        navigation.navigate('CoursePlayer', { courseId: item.id })
      }
    >
      <View style={styles.courseImage}>
        <Ionicons name="play-circle-outline" size={40} color={T.primary2} />
      </View>
      <View style={styles.courseContent}>
        <Text style={styles.courseTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.courseInstructor} numberOfLines={1}>
          {`${item.instructor?.firstName ?? ''} ${item.instructor?.lastName ?? 'Instructor'}`.trim()}
        </Text>
        <View style={styles.courseFooter}>
          <Text style={styles.coursePrice}>
            ${item.price?.toFixed(2) || 'Free'}
          </Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FBBF24" />
            <Text style={styles.rating}>{item.rating || '4.5'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFeaturedCourse = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() =>
        navigation.navigate('CoursePlayer', { courseId: item.id })
      }
    >
      <View style={styles.featuredContent}>
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredBadgeText}>Featured</Text>
        </View>
        <Text style={styles.featuredTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.featuredDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      <View style={styles.featuredIcon}>
        <Ionicons name="arrow-forward" size={24} color={T.primary2} />
      </View>
    </TouchableOpacity>
  );

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
              <Ionicons name="sparkles" size={20} color="#818cf8" />
            </View>
            <View>
              <Text style={styles.tutorBannerTitle}>AI Tutor</Text>
              <Text style={styles.tutorBannerSub}>Textbooks · Study Plans · Quizzes · Chat</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#818cf8" />
        </TouchableOpacity>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={T.muted}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={T.muted}
          />
        </View>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              !selectedCategory && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={[
                styles.categoryChipText,
                !selectedCategory && styles.categoryChipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {categories?.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category.id && styles.categoryChipTextActive,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Courses */}
        {featuredCourses && featuredCourses.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Featured</Text>
            <FlatList
              data={featuredCourses.slice(0, 3)}
              renderItem={renderFeaturedCourse}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Community */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Community</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={styles.communityCard}
              onPress={() => navigation.navigate('Groups')}
            >
              <Ionicons name="people" size={28} color="#6366F1" />
              <Text style={styles.communityTitle}>Study Groups</Text>
              <Text style={styles.communityDesc}>Join or create learning groups</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.communityCard}
              onPress={() => navigation.navigate('Meetings')}
            >
              <Ionicons name="videocam" size={28} color="#10B981" />
              <Text style={styles.communityTitle}>Meetings</Text>
              <Text style={styles.communityDesc}>Schedule & join video meetings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* All Courses */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            {selectedCategory ? 'Category Courses' : 'All Courses'}
          </Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.border2,
    marginVertical: 16,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: T.text,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.border2,
    marginRight: 12,
    backgroundColor: '#111827',
  },
  categoryChipActive: {
    backgroundColor: T.primary2,
    borderColor: T.primary2,
  },
  categoryChipText: {
    fontSize: 14,
    color: T.muted,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: T.text,
    marginBottom: 16,
  },
  courseGrid: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  courseCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 12,
    marginHorizontal: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: T.border2,
  },
  courseImage: {
    width: '100%',
    height: 120,
    backgroundColor: `${T.primary2}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseContent: {
    padding: 12,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: T.text,
    marginBottom: 6,
  },
  courseInstructor: {
    fontSize: 12,
    color: T.muted,
    marginBottom: 8,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coursePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: T.primary2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 12,
    color: T.muted,
  },
  featuredCard: {
    flexDirection: 'row',
    backgroundColor: T.primary2,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    minHeight: 140,
  },
  featuredContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  featuredBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  featuredDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  featuredIcon: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.border2,
    gap: 8,
  },
  communityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: T.text,
    textAlign: 'center',
  },
  communityDesc: {
    fontSize: 12,
    color: T.muted,
    textAlign: 'center',
    lineHeight: 16,
  },
  tutorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: T.text,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#6366f133',
  },
  tutorBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tutorBannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#6366f133',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tutorBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: T.bg,
  },
  tutorBannerSub: {
    fontSize: 11,
    color: T.muted2,
    marginTop: 2,
  },
});
