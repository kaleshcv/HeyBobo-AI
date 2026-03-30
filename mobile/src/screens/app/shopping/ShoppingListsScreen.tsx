import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  Modal,
  TextInput,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useShoppingListStore } from '@/store/shoppingListStore'
import { AppHeader } from '@/components/layout/AppHeader'

const COLORS = {
  primary: '#6366F1',
  text: '#1E293B',
  secondaryText: '#64748B',
  background: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
}

export function ShoppingListsScreen() {
  const insets = useSafeAreaInsets()
  const { lists, addList } = useShoppingListStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [newListName, setNewListName] = useState('')

  const handleAddList = () => {
    if (newListName.trim()) {
      const newList = {
        id: Date.now().toString(),
        name: newListName,
        emoji: '🛒',
        type: 'custom' as const,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        budget: null,
      }
      addList(newList)
      setNewListName('')
      setShowAddModal(false)
    }
  }

  const renderListCard = ({ item }: { item: any }) => {
    const checkedCount = item.items.filter((i: any) => i.checked).length
    const progress = item.items.length > 0 ? (checkedCount / item.items.length) * 100 : 0
    const totalPrice = item.items.reduce((sum: number, i: any) => sum + i.estimatedPrice, 0)

    return (
      <TouchableOpacity style={styles.listCard}>
        <View style={styles.listHeader}>
          <View>
            <View style={styles.listTitleRow}>
              <Text style={styles.listEmoji}>{item.emoji}</Text>
              <Text style={styles.listName}>{item.name}</Text>
            </View>
            <Text style={styles.listDetail}>
              {item.items.length} items • ${totalPrice.toFixed(2)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.secondaryText} />
        </View>

        {item.items.length > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {checkedCount}/{item.items.length} completed
            </Text>
          </View>
        )}
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Shopping Lists" />

      <FlatList
        data={lists}
        renderItem={renderListCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="list-outline" size={48} color={COLORS.secondaryText} />
            <Text style={styles.emptyText}>No shopping lists yet</Text>
            <Text style={styles.emptySubtext}>Create one to get started</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={24} color="#FFF" />
      </TouchableOpacity>

      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Shopping List</Text>
            <TextInput
              style={styles.input}
              placeholder="List name"
              placeholderTextColor={COLORS.secondaryText}
              value={newListName}
              onChangeText={setNewListName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={handleAddList}
              >
                <Text style={styles.createButtonText}>Create</Text>
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
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: 16,
  },
  listCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  listName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  listDetail: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginTop: 4,
    marginLeft: 28,
  },
  progressSection: {
    marginTop: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: 11,
    color: COLORS.secondaryText,
    marginTop: 6,
  },
  fab: {
    position: 'absolute',
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
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
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.secondaryText,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 20,
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
    backgroundColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: COLORS.primary,
  },
  createButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
})
