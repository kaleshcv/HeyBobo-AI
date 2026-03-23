import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { UserRole } from '@/types';
import { Text } from 'react-native';
import { Card } from '@/components/common/Card';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/store/authStore';

const COLORS = {
  primary: '#6366F1',
  text: '#1E293B',
  secondaryText: '#64748B',
  background: '#F8FAFC',
  border: '#E2E8F0',
  error: '#EF4444',
};

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();
  const { user, hasRole } = useAuthStore();

  const stats = [
    { label: 'Courses', value: '12', icon: 'school' },
    { label: 'Certificates', value: '5', icon: 'ribbon' },
    { label: 'Streak', value: '14 days', icon: 'flame' },
  ];

  const renderStat = ({ item }: { item: (typeof stats)[0] }) => (
    <View style={styles.statCard}>
      <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
      <Text style={styles.statValue}>{item.value}</Text>
      <Text style={styles.statLabel}>{item.label}</Text>
    </View>
  );

  const handleLogout = () => {
    alert('Logged out!');
    navigation.navigate('Login');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Card padding="lg" style={{ marginBottom: 24, alignItems: 'center' }}>
          <Avatar name={user ? `${user.firstName} ${user.lastName}` : 'U'} size="lg" />
          <Text style={styles.userName}>{user ? `${user.firstName} ${user.lastName}` : ''}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>
              {user?.role?.toUpperCase()}
            </Text>
          </View>
        </Card>

        {/* Stats */}
        <FlatList
          data={stats}
          renderItem={renderStat}
          keyExtractor={(item) => item.label}
          numColumns={3}
          scrollEnabled={false}
          columnWrapperStyle={styles.statsGrid}
          contentContainerStyle={{ marginBottom: 24 }}
        />

        {/* Portal Links */}
        {hasRole(UserRole.TEACHER) && (
          <TouchableOpacity
            style={styles.portalButton}
            onPress={() => navigation.navigate('TeacherDashboard')}
          >
            <Ionicons name="people" size={20} color={COLORS.primary} />
            <Text style={styles.portalButtonText}>Teacher Portal</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        )}

        {hasRole(UserRole.ADMIN) && (
          <TouchableOpacity
            style={styles.portalButton}
            onPress={() => navigation.navigate('AdminDashboard')}
          >
            <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
            <Text style={styles.portalButtonText}>Admin Portal</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        )}

        {/* Menu Items */}
        <Card padding="lg" style={{ marginBottom: 24 }}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="person" size={20} color={COLORS.secondaryText} />
            <Text style={styles.menuItemText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.border} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="lock-closed" size={20} color={COLORS.secondaryText} />
            <Text style={styles.menuItemText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.border} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="bookmark" size={20} color={COLORS.secondaryText} />
            <Text style={styles.menuItemText}>Saved Courses</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.border} />
          </TouchableOpacity>
        </Card>

        {/* Logout */}
        <Button
          title="Logout"
          variant="outline"
          onPress={handleLogout}
          fullWidth
          style={{ marginBottom: 32 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.secondaryText,
    marginTop: 4,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: `${COLORS.primary}20`,
    marginTop: 12,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statsGrid: {
    justifyContent: 'space-around',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  portalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  portalButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
});
