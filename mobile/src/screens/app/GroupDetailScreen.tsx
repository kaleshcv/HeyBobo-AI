import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  FlatList,
  TextInput,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRoute } from '@react-navigation/native'
import { useGroupStore } from '@/store/groupStore'
import { AppHeader } from '@/components/layout/AppHeader'
import T from '@/theme'

type TabType = 'feed' | 'members' | 'assignments' | 'about'

export function GroupDetailScreen() {
  const insets = useSafeAreaInsets()
  const route = useRoute()
  const { groupId } = route.params as { groupId: string }
  const { groups, addPost, likePost } = useGroupStore()
  const group = groups.find((g) => g.id === groupId)
  const [activeTab, setActiveTab] = useState<TabType>('feed')
  const [newPostContent, setNewPostContent] = useState('')

  if (!group) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AppHeader title="Group" />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Group not found</Text>
        </View>
      </View>
    )
  }

  const handleAddPost = () => {
    if (newPostContent.trim()) {
      const newPost = {
        id: Date.now().toString(),
        authorId: 'current-user',
        authorName: 'You',
        content: newPostContent,
        type: 'text' as const,
        pinned: false,
        createdAt: new Date().toISOString(),
        likes: 0,
      }
      addPost(group.id, newPost)
      setNewPostContent('')
    }
  }

  const renderPostCard = ({ item }: { item: any }) => (
    <View style={[styles.postCard, item.pinned && styles.pinnedPost]}>
      {item.pinned && (
        <View style={styles.pinnedBadge}>
          <Ionicons name="pin" size={12} color="#FFF" />
          <Text style={styles.pinnedText}>Pinned</Text>
        </View>
      )}
      <View style={styles.postHeader}>
        <View>
          <Text style={styles.authorName}>{item.authorName}</Text>
          <Text style={styles.postTime}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <Text style={styles.postContent}>{item.content}</Text>
      <View style={styles.postFooter}>
        <TouchableOpacity style={styles.likeButton} onPress={() => likePost(group.id, item.id)}>
          <Ionicons name="heart" size={16} color={T.primary2} />
          <Text style={styles.likeCount}>{item.likes}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderMemberCard = ({ item }: { item: any }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberInfo}>
        <View style={styles.memberAvatar}>
          <Text style={styles.memberAvatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.memberDetails}>
          <Text style={styles.memberName}>{item.name}</Text>
          <View style={styles.roleAndStats}>
            <View style={[styles.roleBadge, item.role === 'owner' && styles.roleOwner]}>
              <Text style={styles.roleText}>{item.role}</Text>
            </View>
            <Text style={styles.memberStats}>{item.stats.attendance}% attendance</Text>
          </View>
        </View>
      </View>
    </View>
  )

  const renderAssignmentCard = ({ item }: { item: any }) => (
    <View style={styles.assignmentCard}>
      <View style={styles.assignmentHeader}>
        <Text style={styles.assignmentTitle}>{item.title}</Text>
        <Text style={styles.assignmentDue}>
          Due: {new Date(item.dueDate).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.assignmentDesc} numberOfLines={2}>
        {item.description}
      </Text>
      <Text style={styles.maxScore}>Max Score: {item.maxScore}</Text>
    </View>
  )

  const pinnedPosts = group.posts.filter((p) => p.pinned)
  const regularPosts = group.posts.filter((p) => !p.pinned)

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title={group.name} />

      <View style={styles.tabBar}>
        {(['feed', 'members', 'assignments', 'about'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'feed' && (
          <>
            <View style={styles.postInputSection}>
              <TextInput
                style={styles.postInput}
                placeholder="Share your thoughts..."
                placeholderTextColor={T.muted}
                value={newPostContent}
                onChangeText={setNewPostContent}
                multiline
              />
              <TouchableOpacity
                style={[styles.postButton, !newPostContent.trim() && styles.postButtonDisabled]}
                onPress={handleAddPost}
                disabled={!newPostContent.trim()}
              >
                <Ionicons name="send" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>

            {pinnedPosts.map((post) => renderPostCard({ item: post }))}
            {regularPosts.map((post) => renderPostCard({ item: post }))}
          </>
        )}

        {activeTab === 'members' && (
          <FlatList
            data={group.members}
            renderItem={renderMemberCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.listPadding}
          />
        )}

        {activeTab === 'assignments' && (
          <FlatList
            data={group.assignments}
            renderItem={renderAssignmentCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.listPadding}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={40} color={T.muted} />
                <Text style={styles.emptyText}>No assignments yet</Text>
              </View>
            }
          />
        )}

        {activeTab === 'about' && (
          <View style={styles.aboutSection}>
            <View style={styles.aboutCard}>
              <Text style={styles.aboutLabel}>Group Name</Text>
              <Text style={styles.aboutValue}>{group.name}</Text>
            </View>
            <View style={styles.aboutCard}>
              <Text style={styles.aboutLabel}>Description</Text>
              <Text style={styles.aboutValue}>{group.description}</Text>
            </View>
            <View style={styles.aboutCard}>
              <Text style={styles.aboutLabel}>Category</Text>
              <Text style={styles.aboutValue}>{group.category}</Text>
            </View>
            <View style={styles.aboutCard}>
              <Text style={styles.aboutLabel}>Members</Text>
              <Text style={styles.aboutValue}>{group.members.length}</Text>
            </View>
            <View style={styles.aboutCard}>
              <Text style={styles.aboutLabel}>Visibility</Text>
              <Text style={styles.aboutValue}>{group.isPublic ? 'Public' : 'Private'}</Text>
            </View>
          </View>
        )}
      </ScrollView>
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
    paddingVertical: 12,
    alignItems: 'center',
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
  postInputSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: T.border2,
    backgroundColor: T.surface2,
  },
  postInput: {
    backgroundColor: T.bg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: T.text,
    marginBottom: 12,
    maxHeight: 80,
  },
  postButton: {
    backgroundColor: T.primary2,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postCard: {
    backgroundColor: T.surface2,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: T.border2,
  },
  pinnedPost: {
    borderColor: T.primary2,
    borderWidth: 2,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: T.primary2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  pinnedText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  postHeader: {
    marginBottom: 8,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
    color: T.text,
  },
  postTime: {
    fontSize: 11,
    color: T.muted,
    marginTop: 2,
  },
  postContent: {
    fontSize: 13,
    color: T.text,
    lineHeight: 18,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeCount: {
    fontSize: 12,
    color: T.primary2,
    fontWeight: '600',
  },
  memberCard: {
    backgroundColor: T.surface2,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: T.border2,
  },
  memberInfo: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: T.primary2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    color: T.text,
  },
  roleAndStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  roleBadge: {
    backgroundColor: T.bg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleOwner: {
    backgroundColor: T.primary2,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '600',
    color: T.primary2,
  },
  memberStats: {
    fontSize: 11,
    color: T.muted,
  },
  assignmentCard: {
    backgroundColor: T.surface2,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: T.border2,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  assignmentTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: T.text,
  },
  assignmentDue: {
    fontSize: 11,
    color: T.red,
  },
  assignmentDesc: {
    fontSize: 12,
    color: T.muted,
    marginBottom: 8,
  },
  maxScore: {
    fontSize: 11,
    color: T.primary2,
    fontWeight: '600',
  },
  aboutSection: {
    padding: 16,
  },
  aboutCard: {
    backgroundColor: T.surface2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: T.border2,
  },
  aboutLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: T.muted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  aboutValue: {
    fontSize: 14,
    fontWeight: '600',
    color: T.text,
  },
  listPadding: {
    paddingVertical: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: T.text,
    marginTop: 12,
  },
})
