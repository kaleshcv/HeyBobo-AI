import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Text,
  TextInput,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useCampusMarketplaceStore } from '@/store/campusMarketplaceStore'
import { AppHeader } from '@/components/layout/AppHeader'
import T from '@/theme'

const CATEGORIES = ['all', 'textbooks', 'electronics', 'fitness-equipment', 'study-supplies', 'lab-materials', 'other'] as const

export function CampusMarketplaceScreen() {
  const insets = useSafeAreaInsets()
  const { listings, activeCategory, searchQuery, setCategory, setSearch } = useCampusMarketplaceStore()

  const filteredListings = listings.filter((l) => {
    const matchesCategory = activeCategory === 'all' || l.category === activeCategory
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch && l.status === 'available'
  })

  const renderCategoryChip = (category: typeof CATEGORIES[number]) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryChip,
        activeCategory === category && styles.categoryChipActive,
      ]}
      onPress={() => setCategory(category)}
    >
      <Text
        style={[
          styles.categoryChipText,
          activeCategory === category && styles.categoryChipTextActive,
        ]}
      >
        {category === 'all' ? 'All' : category.replace('-', ' ').toUpperCase()}
      </Text>
    </TouchableOpacity>
  )

  const renderListingCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.listingCard}>
      <View style={styles.imagePlaceholder}>
        <Ionicons name="image-outline" size={32} color={T.border2} />
      </View>
      <View style={styles.listingInfo}>
        <Text style={styles.listingTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.conditionBadge}>
          <Text style={styles.conditionText}>{item.condition}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{item.price}</Text>
          <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
        </View>
        <View style={styles.sellerRow}>
          <Ionicons name="person-circle" size={16} color={T.muted} />
          <Text style={styles.sellerName} numberOfLines={1}>
            {item.seller.name}
          </Text>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.ratingText}>{item.seller.rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Campus Marketplace" />

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={T.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search listings..."
          placeholderTextColor={T.muted}
          value={searchQuery}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {CATEGORIES.map(renderCategoryChip)}
      </ScrollView>

      <FlatList
        data={filteredListings}
        renderItem={renderListingCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listingGrid}
        columnWrapperStyle={styles.columnWrapper}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="storefront-outline" size={48} color={T.muted} />
            <Text style={styles.emptyText}>No listings found</Text>
          </View>
        }
      />

      <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + 16 }]}>
        <Ionicons name="add" size={24} color={T.white} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.surface2,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: T.border2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 8,
    fontSize: 14,
    color: T.text,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  categoryContent: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: T.surface2,
    borderWidth: 1,
    borderColor: T.border2,
  },
  categoryChipActive: {
    backgroundColor: T.primary2,
    borderColor: T.primary2,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: T.muted,
  },
  categoryChipTextActive: {
    color: T.white,
  },
  listingGrid: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  columnWrapper: {
    gap: 12,
    marginBottom: 12,
  },
  listingCard: {
    flex: 1,
    backgroundColor: T.surface2,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: T.border2,
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: T.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingInfo: {
    padding: 12,
  },
  listingTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: T.text,
    marginBottom: 6,
  },
  conditionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: T.orange,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 6,
  },
  conditionText: {
    fontSize: 10,
    fontWeight: '600',
    color: T.white,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: T.primary2,
  },
  originalPrice: {
    fontSize: 12,
    color: T.muted,
    textDecorationLine: 'line-through',
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sellerName: {
    flex: 1,
    fontSize: 11,
    color: T.muted,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    color: T.muted,
  },
  fab: {
    position: 'absolute',
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: T.primary2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: T.text,
    marginTop: 16,
  },
})
