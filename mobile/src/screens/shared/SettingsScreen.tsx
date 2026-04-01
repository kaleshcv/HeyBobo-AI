import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Text } from 'react-native';
import { Card } from '@/components/common/Card';
import { AppHeader } from '@/components/layout/AppHeader';
import T from '@/theme'

const THEMES = ['Light', 'Dark', 'System'];

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();

  const [theme, setTheme] = useState('System');
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    reminders: true,
  });
  const [showThemePicker, setShowThemePicker] = useState(false);

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderToggle = (enabled: boolean) => (
    <View
      style={[
        styles.toggle,
        enabled && styles.toggleActive,
      ]}
    >
      <View
        style={[
          styles.toggleSwitch,
          { left: enabled ? 18 : 2 },
        ]}
      />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Settings" subtitle="App preferences" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Display Settings */}
        <Card padding="lg" style={{ marginBottom: 20 }}>
          <Text style={styles.sectionTitle}>Display</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowThemePicker(true)}
          >
            <View style={styles.settingContent}>
              <Ionicons name="contrast" size={20} color={T.primary2} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Theme</Text>
                <Text style={styles.settingValue}>{theme}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={T.border2} />
          </TouchableOpacity>
        </Card>

        {/* Notification Settings */}
        <Card padding="lg" style={{ marginBottom: 20 }}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="notifications" size={20} color={T.primary2} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingValue}>Get real-time alerts</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => toggleNotification('push')}>
              {renderToggle(notifications.push)}
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="mail" size={20} color={T.primary2} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Email Notifications</Text>
                <Text style={styles.settingValue}>Receive updates via email</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => toggleNotification('email')}>
              {renderToggle(notifications.email)}
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="alarm" size={20} color={T.primary2} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Course Reminders</Text>
                <Text style={styles.settingValue}>Remind me to learn</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => toggleNotification('reminders')}>
              {renderToggle(notifications.reminders)}
            </TouchableOpacity>
          </View>
        </Card>

        {/* App Info */}
        <Card padding="lg" style={{ marginBottom: 20 }}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="help-circle" size={20} color={T.primary2} />
              <Text style={styles.settingLabel}>Help & Support</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={T.border2} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="document-text" size={20} color={T.primary2} />
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={T.border2} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="checkmark-done" size={20} color={T.primary2} />
              <Text style={styles.settingLabel}>Terms of Service</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={T.border2} />
          </TouchableOpacity>
        </Card>
      </ScrollView>

      {/* Theme Picker Modal */}
      <Modal visible={showThemePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Theme</Text>
              <TouchableOpacity onPress={() => setShowThemePicker(false)}>
                <Ionicons name="close" size={24} color={T.text} />
              </TouchableOpacity>
            </View>
            {THEMES.map((t) => (
              <TouchableOpacity
                key={t}
                style={styles.modalOption}
                onPress={() => {
                  setTheme(t);
                  setShowThemePicker(false);
                }}
              >
                <Text style={styles.modalOptionText}>{t}</Text>
                {theme === t && (
                  <Ionicons name="checkmark" size={20} color={T.primary2} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: T.text,
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: T.text,
  },
  settingValue: {
    fontSize: 12,
    color: T.muted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: T.border2,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: T.text,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: T.primary2,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: T.border2,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: T.primary2,
  },
  toggleSwitch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#111827',
    position: 'absolute',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: T.border2,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: T.text,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: T.border2,
  },
  modalOptionText: {
    fontSize: 14,
    color: T.text,
  },
});
