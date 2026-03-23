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

const COLORS = {
  primary: '#6366F1',
  text: '#1E293B',
  secondaryText: '#64748B',
  background: '#F8FAFC',
  border: '#E2E8F0',
};

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
        <Ionicons name="play-circle-outline" size={40} color={COLORS.primary} />
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
        <Ionicons name="arrow-forward" size={24} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Explore Courses" />

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={COLORS.secondaryText}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.secondaryText}
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
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: COLORS.text,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 12,
    backgroundColor: '#fff',
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 14,
    color: COLORS.secondaryText,
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
    color: COLORS.text,
    marginBottom: 16,
  },
  courseGrid: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  courseCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  courseImage: {
    width: '100%',
    height: 120,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseContent: {
    padding: 12,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  courseInstructor: {
    fontSize: 12,
    color: COLORS.secondaryText,
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
    color: COLORS.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 12,
    color: COLORS.secondaryText,
  },
  featuredCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
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
});
