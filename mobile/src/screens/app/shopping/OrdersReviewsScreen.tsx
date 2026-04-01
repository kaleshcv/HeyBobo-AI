import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  FlatList,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useOrdersReviewsStore } from '@/store/ordersReviewsStore'
import { AppHeader } from '@/components/layout/AppHeader'
import T from '@/theme'

const TAB_ICONS = {
  orders: 'package',
  reviews: 'star',
} as const

export function OrdersReviewsScreen() {
  const insets = useSafeAreaInsets()
  const { orders, reviews } = useOrdersReviewsStore()
  const [activeTab, setActiveTab] = useState<'orders' | 'reviews'>('orders')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return T.green
      case 'shipped':
        return T.orange
      case 'placed':
      case 'confirmed':
        return T.primary2
      default:
        return T.muted
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'checkmark-circle'
      case 'shipped':
        return 'send'
      case 'placed':
      case 'confirmed':
        return 'receipt'
      case 'cancelled':
        return 'close-circle'
      default:
        return 'help-circle'
    }
  }

  const renderOrderCard = ({ item }: { item: any }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Order #{item.id.slice(0, 8)}</Text>
          <Text style={styles.orderDate}>
            {new Date(item.placedAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
          <Ionicons name={getStatusIcon(item.status) as any} size={14} color={getStatusColor(item.status)} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.itemsSection}>
        {item.items.slice(0, 2).map((product: any, idx: number) => (
          <Text key={idx} style={styles.itemText}>
            {product.quantity}x {product.name}
          </Text>
        ))}
        {item.items.length > 2 && <Text style={styles.moreItems}>+{item.items.length - 2} more</Text>}
      </View>

      <View style={styles.trackingSection}>
        <Text style={styles.trackingTitle}>Tracking</Text>
        {item.trackingSteps.slice(0, 3).map((step: any, idx: number) => (
          <View key={idx} style={styles.trackingStep}>
            <View style={[styles.stepDot, { backgroundColor: step.done ? T.green : T.border2 }]} />
            <View style={styles.stepInfo}>
              <Text style={styles.stepLabel}>{step.label}</Text>
              {step.date && <Text style={styles.stepDate}>{new Date(step.date).toLocaleDateString()}</Text>}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>₹{item.total.toFixed(2)}</Text>
        <Text style={styles.estimatedDelivery}>
          Est. {new Date(item.estimatedDelivery).toLocaleDateString()}
        </Text>
      </View>
    </View>
  )

  const renderReviewCard = ({ item }: { item: any }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View>
          <Text style={styles.reviewProduct}>{item.productName}</Text>
          <View style={styles.ratingRow}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name={i < item.rating ? 'star' : 'star-outline'}
                size={14}
                color="#F59E0B"
              />
            ))}
          </View>
        </View>
        <Text style={styles.reviewDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.reviewTitle}>{item.title}</Text>
      <Text style={styles.reviewBody} numberOfLines={3}>
        {item.body}
      </Text>
    </View>
  )

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Orders & Reviews" />

      <View style={styles.tabBar}>
        {(['orders', 'reviews'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Ionicons
              name={TAB_ICONS[tab] as any}
              size={20}
              color={activeTab === tab ? T.primary2 : T.muted}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === tab ? T.primary2 : T.muted },
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {activeTab === 'orders' ? (
          <FlatList
            data={orders}
            renderItem={renderOrderCard}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="cube-outline" size={48} color={T.muted} />
                <Text style={styles.emptyText}>No orders yet</Text>
              </View>
            }
          />
        ) : (
          <FlatList
            data={reviews}
            renderItem={renderReviewCard}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="star-outline" size={48} color={T.muted} />
                <Text style={styles.emptyText}>No reviews yet</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: T.border2,
    backgroundColor: T.surface2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: T.primary2,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: T.surface2,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: T.border2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '700',
    color: T.text,
  },
  orderDate: {
    fontSize: 11,
    color: T.muted,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  itemsSection: {
    marginBottom: 12,
  },
  itemText: {
    fontSize: 12,
    color: T.muted,
    marginBottom: 4,
  },
  moreItems: {
    fontSize: 11,
    color: T.primary2,
    fontWeight: '600',
  },
  trackingSection: {
    marginBottom: 12,
  },
  trackingTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: T.text,
    marginBottom: 8,
  },
  trackingStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  stepInfo: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: T.text,
  },
  stepDate: {
    fontSize: 10,
    color: T.muted,
    marginTop: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 1,
    borderTopColor: T.border2,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: T.primary2,
  },
  estimatedDelivery: {
    fontSize: 11,
    color: T.muted,
  },
  reviewCard: {
    backgroundColor: T.surface2,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: T.border2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  reviewProduct: {
    fontSize: 13,
    fontWeight: '700',
    color: T.text,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  reviewDate: {
    fontSize: 11,
    color: T.muted,
  },
  reviewTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: T.text,
    marginBottom: 6,
  },
  reviewBody: {
    fontSize: 12,
    color: T.muted,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: T.text,
    marginTop: 16,
  },
})
