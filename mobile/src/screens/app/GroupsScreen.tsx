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
import { useAppNavigation } from '@/navigation/useAppNavigation'
import { useGroupStore } from '@/store/groupStore'
import { AppHeader } from '@/components/layout/AppHeader'
import T from '@/theme'

const generateColorForName = (name: string) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE']
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

export function GroupsScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useAppNavigation()
  const { groups, addGroup } = useGroupStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      const newGroup = {
        id: Date.now().toString(),
        name: newGroupName,
        description: 'New study group',
        category: 'study-group' as const,
        avatar: '👥',
        members: [],
        posts: [],
        assignments: [],
        isPublic: true,
        createdAt: new Date().toISOString(),
      }
      addGroup(newGroup)
      setNewGroupName('')
      setShowAddModal(false)
    }
  }

  const renderGroupCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.groupCard}
      onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}
    >
      <View style={styles.groupCardContent}>
        <View
          style={[
            styles.avatarPlaceholder,
            { backgroundColor: generateColorForName(item.name) },
          ]}
        >
          <Text style={styles.avatarText}>{item.avatar || item.name.charAt(0)}</Text>
        </View>

        <View style={styles.groupInfo}>
          <Text style={styles.groupName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.groupDesc} numberOfLines={1}>
            {item.description}
          </Text>
          <View style={styles.groupMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="people" size={14} color={T.muted} />
              <Text style={styles.metaText}>{item.members.length} members</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="chatbubble" size={14} color={T.muted} />
              <Text style={styles.metaText}>{item.posts.length} posts</Text>
            </View>
          </View>
        </View>

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {item.category.split('-')[0].charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Study Groups" />

      <FlatList
        data={groups}
        renderItem={renderGroupCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={T.muted} />
            <Text style={styles.emptyText}>No groups yet</Text>
            <Text style={styles.emptySubtext}>Create or join a study group to get started</Text>
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
            <Text style={styles.modalTitle}>Create Study Group</Text>
            <TextInput
              style={styles.input}
              placeholder="Group name"
              placeholderTextColor={T.muted}
              value={newGroupName}
              onChangeText={setNewGroupName}
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
                onPress={handleAddGroup}
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
    backgroundColor: T.bg,
  },
  listContent: {
    padding: 16,
  },
  groupCard: {
    backgroundColor: T.surface2,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: T.border2,
    overflow: 'hidden',
  },
  groupCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 15,
    fontWeight: '700',
    color: T.text,
  },
  groupDesc: {
    fontSize: 12,
    color: T.muted,
    marginTop: 4,
  },
  groupMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: T.muted,
  },
  categoryBadge: {
    backgroundColor: T.primary2,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
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
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: T.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: T.muted,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 24,
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
    backgroundColor: T.border2,
  },
  cancelButtonText: {
    color: T.text,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: T.primary2,
  },
  createButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
})
