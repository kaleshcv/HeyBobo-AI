import React from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useAppNavigation } from '@/navigation/useAppNavigation'
import { UserRole } from '@/types'
import { Text } from 'react-native'
import { Card } from '@/components/common/Card'
import { Avatar } from '@/components/common/Avatar'
import { useAuthStore } from '@/store/authStore'
import { useLogout, useProfile } from '@/hooks/useAuth'
import T from '@/theme'

export function ProfileScreen() {
  const insets         = useSafeAreaInsets()
  const navigation     = useAppNavigation()
  const { user: storedUser, hasRole } = useAuthStore()
  const logoutMutation = useLogout()

  // Fetch fresh profile from API, fall back to stored user while loading
  const { data: freshUser } = useProfile()
  const user = freshUser ?? storedUser

  // Display name with graceful fallbacks for missing fields
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email?.split('@')[0] || 'User'
    : 'User'

  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const stats = [
    { label: 'Courses',      value: '12',      icon: 'school-outline'  as const },
    { label: 'Certificates', value: '5',       icon: 'ribbon-outline'  as const },
    { label: 'Streak',       value: '14 days', icon: 'flame-outline'   as const },
  ]

  const handleLogout = () => {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: () => {
            // Calls API logout then clears the store (sets isAuthenticated: false).
            // RootNavigator automatically switches to AuthStack — no manual navigate needed.
            logoutMutation.mutate()
          },
        },
      ],
    )
  }

  const renderStat = ({ item }: { item: (typeof stats)[0] }) => (
    <View style={styles.statCard}>
      <Ionicons name={item.icon} size={20} color={T.primary} />
      <Text style={styles.statValue}>{item.value}</Text>
      <Text style={styles.statLabel}>{item.label}</Text>
    </View>
  )

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={22} color={T.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <Card padding="lg" style={styles.profileCard}>
          <Avatar name={initials || displayName} size="lg" />
          <Text style={styles.userName}>{displayName}</Text>
          {user?.email ? <Text style={styles.userEmail}>{user.email}</Text> : null}
          {user?.role ? (
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{user.role.toUpperCase()}</Text>
            </View>
          ) : null}
        </Card>

        {/* Stats row */}
        <FlatList
          data={stats}
          renderItem={renderStat}
          keyExtractor={(item) => item.label}
          numColumns={3}
          scrollEnabled={false}
          columnWrapperStyle={styles.statsGrid}
          contentContainerStyle={{ marginBottom: 24 }}
        />

        {/* Portal links */}
        {hasRole(UserRole.TEACHER) && (
          <TouchableOpacity
            style={styles.portalBtn}
            onPress={() => navigation.navigate('TeacherDashboard')}
          >
            <Ionicons name="people-outline" size={20} color={T.primary} />
            <Text style={styles.portalBtnText}>Teacher Portal</Text>
            <Ionicons name="arrow-forward-outline" size={16} color={T.primary} />
          </TouchableOpacity>
        )}

        {hasRole(UserRole.ADMIN) && (
          <TouchableOpacity
            style={styles.portalBtn}
            onPress={() => navigation.navigate('AdminDashboard')}
          >
            <Ionicons name="shield-checkmark-outline" size={20} color={T.primary} />
            <Text style={styles.portalBtnText}>Admin Portal</Text>
            <Ionicons name="arrow-forward-outline" size={16} color={T.primary} />
          </TouchableOpacity>
        )}

        {/* Menu items */}
        <Card padding="lg" style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Ionicons name="person-outline" size={18} color={T.primary} />
            </View>
            <Text style={styles.menuItemText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={18} color={T.muted2} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Ionicons name="lock-closed-outline" size={18} color={T.primary} />
            </View>
            <Text style={styles.menuItemText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={18} color={T.muted2} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Ionicons name="bookmark-outline" size={18} color={T.primary} />
            </View>
            <Text style={styles.menuItemText}>Saved Courses</Text>
            <Ionicons name="chevron-forward" size={18} color={T.muted2} />
          </TouchableOpacity>
        </Card>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutBtn, logoutMutation.isPending && styles.logoutBtnDisabled]}
          onPress={handleLogout}
          disabled={logoutMutation.isPending}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={18} color={T.red} />
          <Text style={styles.logoutText}>
            {logoutMutation.isPending ? 'Logging out\u2026' : 'Log out'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: T.bg,
  },
  header: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingHorizontal: 20,
    paddingVertical:   14,
    backgroundColor:   T.bg2,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  headerTitle: {
    fontSize:   19,
    fontWeight: '700',
    color:      T.text,
  },
  content: {
    flex:              1,
    paddingHorizontal: 16,
    paddingTop:        16,
  },
  profileCard: {
    alignItems:   'center',
    marginBottom: 20,
  },
  userName: {
    fontSize:   20,
    fontWeight: '700',
    color:      T.text,
    marginTop:  12,
  },
  userEmail: {
    fontSize:  13,
    color:     T.muted,
    marginTop: 4,
  },
  roleBadge: {
    paddingHorizontal: 14,
    paddingVertical:   5,
    borderRadius:      20,
    backgroundColor:   T.primary2 + '25',
    borderWidth:       1,
    borderColor:       T.primary2 + '40',
    marginTop:         10,
  },
  roleBadgeText: {
    fontSize:      11,
    fontWeight:    '700',
    color:         T.primary,
    letterSpacing: 1,
  },
  statsGrid: {
    justifyContent: 'space-between',
    gap:            8,
  },
  statCard: {
    flex:            1,
    alignItems:      'center',
    backgroundColor: T.surface,
    borderRadius:    12,
    paddingVertical: 14,
    borderWidth:     1,
    borderColor:     T.border2,
  },
  statValue: {
    fontSize:   16,
    fontWeight: '700',
    color:      T.text,
    marginTop:  8,
  },
  statLabel: {
    fontSize:  10,
    color:     T.muted,
    marginTop: 3,
  },
  portalBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: T.primary2 + '15',
    borderRadius:    12,
    padding:         14,
    marginBottom:    10,
    gap:             12,
    borderWidth:     1,
    borderColor:     T.primary2 + '30',
  },
  portalBtnText: {
    flex:       1,
    fontSize:   14,
    fontWeight: '600',
    color:      T.primary,
  },
  menuCard: {
    marginBottom: 16,
  },
  menuItem: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingVertical: 14,
    gap:             12,
  },
  menuIcon: {
    width:           34,
    height:          34,
    borderRadius:    10,
    backgroundColor: T.primary2 + '18',
    alignItems:      'center',
    justifyContent:  'center',
  },
  menuItemText: {
    flex:       1,
    fontSize:   14,
    fontWeight: '500',
    color:      T.text,
  },
  divider: {
    height:          1,
    backgroundColor: T.border,
    marginLeft:      46,
  },
  logoutBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             8,
    borderWidth:     1.5,
    borderColor:     T.red + '50',
    borderRadius:    12,
    paddingVertical: 14,
    backgroundColor: T.red + '10',
  },
  logoutBtnDisabled: {
    opacity: 0.5,
  },
  logoutText: {
    fontSize:   15,
    fontWeight: '600',
    color:      T.red,
  },
})
