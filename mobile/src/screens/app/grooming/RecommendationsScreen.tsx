import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text } from 'react-native';
import { Card } from '@/components/common/Card';
import { AppHeader } from '@/components/layout/AppHeader';
import { useGroomingStore } from '@/store/groomingStore';
import type { RecommendationCategory } from '@/store/groomingStore';
import T from '@/theme'

const CATEGORY_COLORS: Record<RecommendationCategory, string> = {
  Skincare: T.pink,
  Haircare: T.orange,
  Lifestyle: T.green,
  Grooming: T.primary2,
};

const CATEGORY_ICONS: Record<RecommendationCategory, any> = {
  Skincare: 'water',
  Haircare: 'cut',
  Lifestyle: 'leaf',
  Grooming: 'sparkles',
};

type FilterTab = 'All' | RecommendationCategory;
const TABS: FilterTab[] = ['All', 'Skincare', 'Haircare', 'Lifestyle', 'Grooming'];

export function RecommendationsScreen() {
  const insets = useSafeAreaInsets();
  const { recommendations, toggleSaveRecommendation } = useGroomingStore();
  const [activeTab, setActiveTab] = useState<FilterTab>('All');

  const filtered = useMemo(
    () => activeTab === 'All' ? recommendations : recommendations.filter((r) => r.category === activeTab),
    [recommendations, activeTab],
  );

  const priorityColor = (p: string) => p === 'High' ? T.red : p === 'Medium' ? T.orange : T.green;
  const priorityBg = (p: string) => p === 'High' ? '#EF444415' : p === 'Medium' ? '#F59E0B15' : '#10B98115';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Recommendations" subtitle={`${recommendations.length} personalized tips`} />

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsBar}
        contentContainerStyle={styles.tabsContent}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab;
          const color = tab === 'All' ? T.primary2 : CATEGORY_COLORS[tab as RecommendationCategory] ?? T.primary2;
          const count = tab === 'All' ? recommendations.length : recommendations.filter((r) => r.category === tab).length;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, active && { backgroundColor: color, borderColor: color }]}
              onPress={() => setActiveTab(tab)}
            >
              {tab !== 'All' && (
                <Ionicons
                  name={CATEGORY_ICONS[tab as RecommendationCategory]}
                  size={13}
                  color={active ? T.white : color}
                />
              )}
              <Text style={[styles.tabText, active ? { color: T.white } : { color }]}>
                {tab} {count > 0 && `(${count})`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={40} color={T.border2} />
            <Text style={styles.emptyText}>No recommendations in this category</Text>
          </View>
        )}

        {filtered.map((item, idx) => {
          const catColor = CATEGORY_COLORS[item.category];
          return (
            <Card key={item.id} padding="lg" style={[styles.card, idx === 0 && { marginTop: 4 }]}>
              {/* Header */}
              <View style={styles.recHeader}>
                <View style={[styles.catIcon, { backgroundColor: `${catColor}18` }]}>
                  <Ionicons name={CATEGORY_ICONS[item.category]} size={18} color={catColor} />
                </View>
                <View style={styles.recMeta}>
                  <Text style={[styles.catLabel, { color: catColor }]}>{item.category}</Text>
                  <Text style={styles.recTitle}>{item.title}</Text>
                </View>
                <View style={styles.recActions}>
                  <View style={[styles.priorityBadge, { backgroundColor: priorityBg(item.priority) }]}>
                    <Text style={[styles.priorityText, { color: priorityColor(item.priority) }]}>
                      {item.priority}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={() => toggleSaveRecommendation(item.id)}
                  >
                    <Ionicons
                      name={item.saved ? 'bookmark' : 'bookmark-outline'}
                      size={18}
                      color={item.saved ? T.primary2 : T.muted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.description}>{item.description}</Text>

              {item.products.length > 0 && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.productsLabel}>Recommended Products</Text>
                  {item.products.map((product, i) => (
                    <View key={i} style={styles.productRow}>
                      <Ionicons name="checkmark-circle" size={15} color={T.primary2} />
                      <Text style={styles.productName}>{product}</Text>
                    </View>
                  ))}
                </>
              )}
            </Card>
          );
        })}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  content: { flex: 1, paddingHorizontal: 16 },
  card: { marginBottom: 12 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: T.muted },

  // Tabs
  tabsBar: { flexGrow: 0, marginBottom: 4 },
  tabsContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5, borderColor: T.border2,
    backgroundColor: T.surface,
  },
  tabText: { fontSize: 12, fontWeight: '600' },

  // Card
  recHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  catIcon: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  recMeta: { flex: 1 },
  catLabel: { fontSize: 10, fontWeight: '700', marginBottom: 2 },
  recTitle: { fontSize: 14, fontWeight: '700', color: T.text },
  recActions: { alignItems: 'flex-end', gap: 6 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  priorityText: { fontSize: 10, fontWeight: '700' },
  saveBtn: { padding: 2 },

  description: { fontSize: 13, color: T.muted, lineHeight: 19 },
  divider: { height: 1, backgroundColor: T.border2, marginVertical: 12 },
  productsLabel: { fontSize: 11, fontWeight: '700', color: T.text, marginBottom: 8 },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  productName: { fontSize: 12, color: T.muted, flex: 1 },
});

