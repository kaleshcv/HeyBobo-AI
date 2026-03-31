import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Modal,
  TextInput,
  FlatList,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useBudgetStore } from '@/store/budgetStore'
import { AppHeader } from '@/components/layout/AppHeader'
import T from '@/theme'

export function BudgetExpensesScreen() {
  const insets = useSafeAreaInsets()
  const { monthlyBudget, categoryLimits, expenses, priceAlerts, addExpense } = useBudgetStore()
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: 'food' as const,
    description: '',
    source: '',
  })

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
  const budgetRemaining = monthlyBudget - totalSpent

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      education: '#3B82F6',
      fitness: T.green,
      food: T.orange,
      grooming: '#EC4899',
      health: '#8B5CF6',
      transport: '#06B6D4',
      entertainment: T.red,
      other: T.muted,
    }
    return colors[category] || T.primary2
  }

  const handleAddExpense = () => {
    if (newExpense.amount && newExpense.description) {
      addExpense({
        id: Date.now().toString(),
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        description: newExpense.description,
        date: new Date().toISOString(),
        source: newExpense.source,
      })
      setNewExpense({ amount: '', category: 'food', description: '', source: '' })
      setShowAddExpense(false)
    }
  }

  const renderExpenseItem = ({ item }: { item: any }) => (
    <View style={styles.expenseItem}>
      <View style={[styles.expenseIcon, { backgroundColor: `${getCategoryColor(item.category)}20` }]}>
        <Ionicons
          name={item.category === 'food' ? 'restaurant' : 'cash'}
          size={18}
          color={getCategoryColor(item.category)}
        />
      </View>
      <View style={styles.expenseDetails}>
        <Text style={styles.expenseDescription}>{item.description}</Text>
        <Text style={styles.expenseCategory}>{item.category}</Text>
      </View>
      <Text style={styles.expenseAmount}>-${item.amount.toFixed(2)}</Text>
    </View>
  )

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Budget & Expenses" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.budgetOverview}>
          <View style={styles.budgetRow}>
            <View>
              <Text style={styles.budgetLabel}>Monthly Budget</Text>
              <Text style={styles.budgetAmount}>${monthlyBudget}</Text>
            </View>
            <View>
              <Text style={styles.budgetLabel}>Remaining</Text>
              <Text style={[styles.budgetAmount, { color: budgetRemaining > 0 ? T.green : T.red }]}>
                ${budgetRemaining.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, (totalSpent / monthlyBudget) * 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>
            ${totalSpent.toFixed(2)} of ${monthlyBudget} spent
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          {Object.entries(categoryLimits).map(([category, limit]) => {
            const spent = expenses
              .filter((e) => e.category === category)
              .reduce((sum, e) => sum + e.amount, 0)
            const percentage = (spent / limit) * 100

            return (
              <View key={category} style={styles.categoryRow}>
                <View style={styles.categoryInfo}>
                  <View
                    style={[
                      styles.categoryDot,
                      { backgroundColor: getCategoryColor(category) },
                    ]}
                  />
                  <View>
                    <Text style={styles.categoryName}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                    <Text style={styles.categoryLimit}>
                      ${spent.toFixed(2)} / ${limit}
                    </Text>
                  </View>
                </View>
                <View style={styles.categoryBar}>
                  <View
                    style={[
                      styles.categoryFill,
                      {
                        width: `${Math.min(100, percentage)}%`,
                        backgroundColor: getCategoryColor(category),
                      },
                    ]}
                  />
                </View>
              </View>
            )
          })}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Expenses</Text>
            {expenses.length > 5 && <Text style={styles.seeAllText}>See all</Text>}
          </View>
          {expenses.length === 0 ? (
            <Text style={styles.emptyText}>No expenses logged yet</Text>
          ) : (
            <FlatList
              data={expenses.slice(0, 5)}
              renderItem={renderExpenseItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Alerts ({priceAlerts.length})</Text>
          {priceAlerts.length === 0 ? (
            <Text style={styles.emptyText}>No price alerts set</Text>
          ) : (
            priceAlerts.map((alert) => (
              <View key={alert.id} style={styles.alertCard}>
                <View style={styles.alertInfo}>
                  <Text style={styles.alertProduct}>{alert.productName}</Text>
                  <Text style={styles.alertPrice}>
                    Target: ${alert.targetPrice} • Current: ${alert.currentPrice}
                  </Text>
                </View>
                <Ionicons
                  name={alert.active ? 'eye' : 'eye-off'}
                  size={20}
                  color={T.primary2}
                />
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
        onPress={() => setShowAddExpense(true)}
      >
        <Ionicons name="add" size={24} color="#FFF" />
      </TouchableOpacity>

      <Modal
        visible={showAddExpense}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddExpense(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Expense</Text>
            <TextInput
              style={styles.input}
              placeholder="Amount"
              placeholderTextColor={T.muted}
              keyboardType="decimal-pad"
              value={newExpense.amount}
              onChangeText={(text) => setNewExpense({ ...newExpense, amount: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              placeholderTextColor={T.muted}
              value={newExpense.description}
              onChangeText={(text) => setNewExpense({ ...newExpense, description: text })}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setShowAddExpense(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.addButton]} onPress={handleAddExpense}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  budgetOverview: {
    backgroundColor: T.primary2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  budgetLabel: {
    color: '#FFF',
    fontSize: 12,
    opacity: 0.9,
  },
  budgetAmount: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#111827',
  },
  progressLabel: {
    color: '#FFF',
    fontSize: 11,
    opacity: 0.9,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: T.text,
  },
  seeAllText: {
    fontSize: 12,
    color: T.primary2,
    fontWeight: '600',
  },
  categoryRow: {
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: T.text,
  },
  categoryLimit: {
    fontSize: 11,
    color: T.muted,
    marginTop: 2,
  },
  categoryBar: {
    height: 6,
    backgroundColor: T.border2,
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryFill: {
    height: '100%',
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: T.border2,
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 13,
    fontWeight: '600',
    color: T.text,
  },
  expenseCategory: {
    fontSize: 11,
    color: T.muted,
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: T.red,
  },
  alertCard: {
    backgroundColor: T.surface2,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: T.border2,
  },
  alertInfo: {
    flex: 1,
  },
  alertProduct: {
    fontSize: 13,
    fontWeight: '600',
    color: T.text,
  },
  alertPrice: {
    fontSize: 11,
    color: T.muted,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 13,
    color: T.muted,
    textAlign: 'center',
    paddingVertical: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: T.surface2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: T.text,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: T.border2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: T.text,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: T.border2,
  },
  cancelButtonText: {
    color: T.text,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: T.primary2,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
})
