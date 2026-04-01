import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Text } from 'react-native';
import { EmptyState } from '@/components/common/EmptyState';
import { useCourses } from '@/hooks/useCourses';
import T from '@/theme'

const PRICE_FILTERS = [
  { label: 'All', value: null },
  { label: 'Free', value: 0 },
  { label: '$1-50', value: '1-50' },
  { label: '$50+', value: '50+' },
];

const RATING_FILTERS = [
  { label: 'All', value: null },
  { label: '4.5+', value: 4.5 },
  { label: '4.0+', value: 4 },
  { label: '3.5+', value: 3.5 },
];

export function SearchScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrice, setSelectedPrice] = useState<any>(null);
  const [selectedRating, setSelectedRating] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data: courses } = useCourses();

  // Debounce search
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredCourses = useMemo(() => {
    return (courses?.data || []).filter((course) => {
      const matchesSearch = course.title
        .toLowerCase()
        .includes(debouncedQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(debouncedQuery.toLowerCase());

      const matchesPrice = !selectedPrice
        ? true
        : selectedPrice === 0
          ? course.price === 0
          : selectedPrice === '1-50'
            ? course.price > 0 && course.price <= 50
            : course.price > 50;

      const matchesRating = !selectedRating
        ? true
        : (course.rating || 0) >= selectedRating;

      return matchesSearch && matchesPrice && matchesRating;
    });
  }, [courses, debouncedQuery, selectedPrice, selectedRating]);

  const renderSearchResult = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() =>
        navigation.navigate('CoursePlayer', { courseId: item.id })
      }
    >
      <View style={styles.resultThumbnail}>
        <Ionicons name="play-circle" size={32} color={T.primary2} />
      </View>

      <View style={styles.resultContent}>
        <Text style={styles.resultTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.resultInstructor} numberOfLines={1}>
          {item.instructor ? `${item.instructor.firstName ?? ''} ${item.instructor.lastName ?? ''}`.trim() : 'Instructor'}
        </Text>

        <View style={styles.resultFooter}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FBBF24" />
            <Text style={styles.rating}>{item.rating || '4.5'}</Text>
            <Text style={styles.reviews}>
              ({Math.floor(Math.random() * 1000) + 100})
            </Text>
          </View>

          <Text style={styles.resultPrice}>
            {item.price === 0 ? 'Free' : `$${item.price.toFixed(2)}`}
          </Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color={T.muted} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={T.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Courses</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search & Filters */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={T.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={T.muted}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close" size={18} color={T.muted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="funnel" size={20} color={T.primary2} />
        </TouchableOpacity>
      </View>

      {/* Filter Panel */}
      {showFilters && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterTitle}>Price Range</Text>
          <View style={styles.filterOptions}>
            {PRICE_FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter.value}
                style={[
                  styles.filterOption,
                  selectedPrice === filter.value && styles.filterOptionActive,
                ]}
                onPress={() => setSelectedPrice(filter.value)}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedPrice === filter.value &&
                      styles.filterOptionTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.filterTitle, { marginTop: 16 }]}>
            Minimum Rating
          </Text>
          <View style={styles.filterOptions}>
            {RATING_FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter.value}
                style={[
                  styles.filterOption,
                  selectedRating === filter.value && styles.filterOptionActive,
                ]}
                onPress={() => setSelectedRating(filter.value)}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedRating === filter.value &&
                      styles.filterOptionTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Results */}
      {filteredCourses.length > 0 ? (
        <>
          <Text style={styles.resultsCount}>
            {filteredCourses.length} result
            {filteredCourses.length !== 1 ? 's' : ''}
          </Text>
          <FlatList
            data={filteredCourses}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.resultsList}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="search"
            title={debouncedQuery ? 'No Courses Found' : 'Start Searching'}
            description={
              debouncedQuery
                ? 'Try different keywords or adjust filters'
                : 'Search for courses to get started'
            }
          />
        </View>
      )}
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
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: T.border2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: T.text,
  },
  searchBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: T.border2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: T.text,
    marginHorizontal: 8,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: `${T.primary2}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPanel: {
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: T.border2,
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: T.text,
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: T.border2,
    borderRadius: 6,
    backgroundColor: '#111827',
  },
  filterOptionActive: {
    backgroundColor: T.primary2,
    borderColor: T.primary2,
  },
  filterOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: T.muted,
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  resultsCount: {
    fontSize: 12,
    color: T.muted,
    paddingHorizontal: 16,
    paddingTop: 12,
    fontWeight: '500',
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: T.border2,
    gap: 12,
  },
  resultThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: `${T.primary2}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: T.text,
    marginBottom: 4,
  },
  resultInstructor: {
    fontSize: 12,
    color: T.muted,
    marginBottom: 6,
  },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rating: {
    fontSize: 11,
    fontWeight: '600',
    color: T.text,
  },
  reviews: {
    fontSize: 11,
    color: T.muted,
  },
  resultPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: T.primary2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
