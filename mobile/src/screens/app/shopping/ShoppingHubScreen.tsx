import React from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAppNavigation } from '@/navigation/useAppNavigation'
import { useShoppingListStore } from '@/store/shoppingListStore'
import { useBudgetStore } from '@/store/budgetStore'
import { AppHeader } from '@/components/layout/AppHeader'

const COLORS = {
  primary: '#6366F1',
  text: '#1E293B',
  secondaryText: '#64748B',
  background: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
}

export function ShoppingHubScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useAppNavigation()
  const lists = useShoppingListStore((s) => s.lists)
  const { monthlyBudget, expenses } = useBudgetStore()

  const totalBudgetSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
  const budgetRemaining = monthlyBudget - totalBudgetSpent

  const hubCards = [
    {
      id: '1',
      title: 'Shopping Lists',
      count: lists.length,
      icon: 'list',
      color: '#3B82F6',
      route: 'ShoppingLists' as const,
    },
    {
      id: '2',
      title: 'Marketplace',
      count: 0,
      icon: 'storefront',
      color: '#10B981',
      route: 'Marketplace' as const,
    },
    {
      id: '3',
      title: 'Budget & Expenses',
      count: expenses.length,
      icon: 'wallet',
      color: '#F59E0B',
      route: 'BudgetExpenses' as const,
    },
    {
      id: '4',
      title: 'Orders & Reviews',
      count: 0,
      icon: 'package',
      color: '#8B5CF6',
      route: 'OrdersReviews' as const,
    },
  ]

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Shopping Hub" />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.budgetCard}>
          <Text style={styles.budgetLabel}>Monthly Budget Remaining</Text>
          <Text style={styles.budgetAmount}>${budgetRemaining}</Text>
          <View style={styles.budgetBar}>
            <View
              style={[
                styles.budgetFill,
                {
                  width: `${Math.max(0, Math.min(100, (totalBudgetSpent / monthlyBudget) * 100))}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.budgetDetail}>
            ${totalBudgetSpent} of ${monthlyBudget} spent
          </Text>
        </View>

        <View style={styles.cardsGrid}>
          {hubCards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={styles.hubCard}
              onPress={() => navigation.navigate(card.route)}
            >
              <View style={[styles.cardIcon, { backgroundColor: `${card.color}20` }]}>
                <Ionicons name={card.icon as any} size={28} color={card.color} />
              </View>
              <Text style={styles.cardTitle}>{card.title}</Text>
              {card.count > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{card.count}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  budgetCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  budgetLabel: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.9,
  },
  budgetAmount: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '700',
    marginTop: 8,
  },
  budgetBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginTop: 12,
    overflow: 'hidden',
  },
  budgetFill: {
    height: '100%',
    backgroundColor: '#FFF',
  },
  budgetDetail: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 10,
    opacity: 0.9,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  hubCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 8,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
})
