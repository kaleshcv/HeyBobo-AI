import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Text } from 'react-native';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { AppHeader } from '@/components/layout/AppHeader';
import { useWearablesStore } from '@/store/wearablesStore';

const COLORS = {
  primary: '#6366F1',
  text: '#1E293B',
  secondaryText: '#64748B',
  background: '#F8FAFC',
  border: '#E2E8F0',
  success: '#10B981',
};

const MOCK_DEVICES = [
  {
    id: '1',
    name: 'Apple Watch Series 7',
    type: 'Smartwatch',
    connected: true,
    batteryLevel: 85,
  },
  {
    id: '2',
    name: 'Fitbit Charge 5',
    type: 'Fitness Tracker',
    connected: false,
    batteryLevel: 0,
  },
  {
    id: '3',
    name: 'Samsung Galaxy Buds',
    type: 'Earbuds',
    connected: true,
    batteryLevel: 60,
  },
];

export function WearablesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();
  const [isScanning, setIsScanning] = useState(false);
  const { heartRate } = useWearablesStore();

  const handleStartScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  const renderDevice = ({ item }: { item: (typeof MOCK_DEVICES)[0] }) => (
    <TouchableOpacity style={styles.deviceCard}>
      <View style={styles.deviceHeader}>
        <View style={styles.deviceIcon}>
          <Ionicons
            name={
              item.type === 'Smartwatch'
                ? 'watch'
                : item.type === 'Fitness Tracker'
                  ? 'fitness'
                  : 'headset'
            }
            size={24}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{item.name}</Text>
          <Text style={styles.deviceType}>{item.type}</Text>
        </View>

        {item.connected && (
          <View style={styles.connectedBadge}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
          </View>
        )}
      </View>

      {item.connected && (
        <View style={styles.deviceFooter}>
          <View style={styles.batteryContainer}>
            <Ionicons name="battery-half" size={16} color={COLORS.primary} />
            <Text style={styles.batteryText}>{item.batteryLevel}%</Text>
          </View>
          <TouchableOpacity style={styles.disconnectButton}>
            <Text style={styles.disconnectButtonText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      )}

      {!item.connected && (
        <Button
          title="Connect"
          size="sm"
          fullWidth
          style={{ marginTop: 12 }}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Wearables" subtitle="Connect your devices" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Scanner Section */}
        <Card padding="lg" style={{ marginBottom: 24 }}>
          <View style={styles.scannerHeader}>
            <View>
              <Text style={styles.scannerTitle}>Device Scanner</Text>
              <Text style={styles.scannerSubtitle}>
                {isScanning ? 'Scanning for devices...' : 'Ready to scan'}
              </Text>
            </View>
            {isScanning && <ActivityIndicator size="small" color={COLORS.primary} />}
          </View>

          <Button
            title={isScanning ? 'Scanning...' : 'Start Scan'}
            onPress={handleStartScan}
            disabled={isScanning}
            fullWidth
            style={{ marginTop: 12 }}
          />
        </Card>

        {/* Heart Rate Display */}
        {heartRate !== null && heartRate !== undefined && (
          <Card padding="lg" style={{ marginBottom: 24 }}>
            <View style={styles.heartRateContainer}>
              <View style={styles.heartRateIcon}>
                <Ionicons name="heart" size={32} color="#EF4444" />
              </View>
              <View style={styles.heartRateInfo}>
                <Text style={styles.heartRateLabel}>Live Heart Rate</Text>
                <Text style={styles.heartRateValue}>
                  {heartRate}
                  <Text style={styles.heartRateUnit}> bpm</Text>
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.healthMetrics}>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Current</Text>
                <Text style={styles.metricValue}>{heartRate}</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Resting</Text>
                <Text style={styles.metricValue}>60</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Max</Text>
                <Text style={styles.metricValue}>150</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Connected Devices */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Your Devices</Text>
          <FlatList
            data={MOCK_DEVICES}
            renderItem={renderDevice}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={{ gap: 12 }}
          />
        </View>

        {/* Permissions Info */}
        <Card padding="lg" style={{ marginBottom: 32 }}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <Text style={styles.infoTitle}>Permissions Required</Text>
          </View>
          <Text style={styles.infoText}>
            To connect wearable devices, we need Bluetooth and location permissions on your device.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  scannerSubtitle: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginTop: 4,
  },
  heartRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  heartRateIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EF444420',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  heartRateInfo: {
    flex: 1,
  },
  heartRateLabel: {
    fontSize: 13,
    color: COLORS.secondaryText,
    marginBottom: 6,
  },
  heartRateValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#EF4444',
  },
  heartRateUnit: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  healthMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricBox: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  deviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  deviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  deviceType: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  connectedBadge: {
    padding: 8,
  },
  deviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  batteryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  disconnectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  disconnectButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.secondaryText,
    lineHeight: 18,
  },
});
