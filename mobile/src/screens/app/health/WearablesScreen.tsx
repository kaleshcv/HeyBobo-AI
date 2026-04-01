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
import T from '@/theme';

const MOCK_DEVICES = [
  {
    id: '1',
    name: 'Noise ColorFit Pro 4',
    type: 'Smartwatch',
    connected: true,
    batteryLevel: 85,
  },
  {
    id: '2',
    name: 'Fire-Boltt Ninja Call Pro',
    type: 'Fitness Tracker',
    connected: false,
    batteryLevel: 0,
  },
  {
    id: '3',
    name: 'boAt Airdopes 131',
    type: 'Earbuds',
    connected: true,
    batteryLevel: 60,
  },
];

const DISCOVERED_DEVICES = [
  { id: 'disc-1', name: 'Mi Band 7', type: 'Smartwatch' },
  { id: 'disc-2', name: 'Galaxy Watch 5', type: 'Smartwatch' },
  { id: 'disc-3', name: 'Noise ColorFit Pro 4', type: 'Fitness Tracker' },
];

export function WearablesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<typeof DISCOVERED_DEVICES>([]);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connectedDevices, setConnectedDevices] = useState(MOCK_DEVICES);
  const { heartRate } = useWearablesStore();

  const handleStartScan = () => {
    setIsScanning(true);
    setDiscoveredDevices([]);

    setTimeout(() => {
      setDiscoveredDevices(DISCOVERED_DEVICES);
    }, 500);

    setTimeout(() => {
      setIsScanning(false);
    }, 3000);
  };

  const handlePairDevice = (device: (typeof DISCOVERED_DEVICES)[0]) => {
    setConnectingId(device.id);
    setTimeout(() => {
      const newDevice = {
        ...device,
        id: `conn-${device.id}`,
        connected: true,
        batteryLevel: 85,
      };
      setConnectedDevices([...connectedDevices, newDevice as any]);
      setConnectingId(null);
      setDiscoveredDevices(discoveredDevices.filter(d => d.id !== device.id));
    }, 1500);
  };

  const renderPulsingRing = (index: number) => {
    const delays = [0, 200, 400];
    return (
      <View
        key={index}
        style={[
          styles.pulsingRing,
          {
            width: 40 + index * 30,
            height: 40 + index * 30,
            borderRadius: (40 + index * 30) / 2,
            opacity: Math.max(0.1, 0.6 - index * 0.2),
          },
        ]}
      />
    );
  };

  const renderDiscoveredDevice = ({ item }: { item: (typeof DISCOVERED_DEVICES)[0] }) => (
    <View style={styles.discoveredDeviceCard}>
      <View style={styles.discoveredDeviceInfo}>
        <Ionicons
          name={item.type === 'Smartwatch' ? 'watch' : 'fitness'}
          size={24}
          color={T.primary2}
          style={{ marginRight: 12 }}
        />
        <View>
          <Text style={styles.discoveredDeviceName}>{item.name}</Text>
          <Text style={styles.discoveredDeviceType}>{item.type}</Text>
        </View>
      </View>
      <Button
        title={connectingId === item.id ? 'Pairing...' : 'Pair'}
        size="sm"
        onPress={() => handlePairDevice(item)}
        disabled={connectingId !== null}
      />
    </View>
  );

  const renderDevice = ({ item }: { item: (typeof connectedDevices)[0] }) => (
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
            color={T.primary2}
          />
        </View>

        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{item.name}</Text>
          <Text style={styles.deviceType}>{item.type}</Text>
        </View>

        {item.connected && (
          <View style={styles.connectedBadge}>
            <Ionicons name="checkmark-circle" size={20} color={T.green} />
          </View>
        )}
      </View>

      {item.connected && (
        <View style={styles.deviceFooter}>
          <View style={styles.batteryContainer}>
            <Ionicons name="battery-half" size={16} color={T.primary2} />
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
            {isScanning && <ActivityIndicator size="small" color={T.primary2} />}
          </View>

          {isScanning && (
            <View style={styles.scanningAnimation}>
              {[0, 1, 2].map((i) => renderPulsingRing(i))}
              <View style={styles.scannerDot} />
            </View>
          )}

          <Button
            title={isScanning ? 'Scanning...' : 'Start Scan'}
            onPress={handleStartScan}
            disabled={isScanning}
            fullWidth
            style={{ marginTop: 12 }}
          />

          {discoveredDevices.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <Text style={styles.discoveredTitle}>Discovered Devices</Text>
              <FlatList
                data={discoveredDevices}
                renderItem={renderDiscoveredDevice}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={{ gap: 12, marginTop: 8 }}
              />
            </View>
          )}
        </Card>

        {/* Heart Rate Display */}
        {heartRate !== null && heartRate !== undefined && (
          <Card padding="lg" style={{ marginBottom: 24 }}>
            <View style={styles.heartRateContainer}>
              <View style={styles.heartRateIcon}>
                <Ionicons name="heart" size={32} color={T.red} />
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
            data={connectedDevices}
            renderItem={renderDevice}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={{ gap: 12 }}
          />
        </View>

        {/* Permissions Info */}
        <Card padding="lg" style={{ marginBottom: 32 }}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color={T.primary2} />
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
    backgroundColor: T.bg,
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
    color: T.text,
  },
  scannerSubtitle: {
    fontSize: 12,
    color: T.muted,
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
    backgroundColor: `${T.red}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  heartRateInfo: {
    flex: 1,
  },
  heartRateLabel: {
    fontSize: 13,
    color: T.muted,
    marginBottom: 6,
  },
  heartRateValue: {
    fontSize: 28,
    fontWeight: '700',
    color: T.red,
  },
  heartRateUnit: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: T.border2,
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
    color: T.muted,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: T.text,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: T.text,
    marginBottom: 12,
  },
  deviceCard: {
    backgroundColor: T.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: T.border2,
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
    backgroundColor: `${T.primary2}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: T.text,
  },
  deviceType: {
    fontSize: 12,
    color: T.muted,
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
    borderTopColor: T.border2,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  batteryText: {
    fontSize: 12,
    fontWeight: '600',
    color: T.primary2,
  },
  disconnectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  disconnectButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: T.primary2,
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
    color: T.text,
  },
  infoText: {
    fontSize: 13,
    color: T.muted,
    lineHeight: 18,
  },
  scanningAnimation: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    marginVertical: 12,
  },
  pulsingRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: T.primary2,
  },
  scannerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: T.primary2,
  },
  discoveredTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: T.text,
    marginBottom: 8,
  },
  discoveredDeviceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: T.surface,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: T.border2,
  },
  discoveredDeviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  discoveredDeviceName: {
    fontSize: 13,
    fontWeight: '600',
    color: T.text,
  },
  discoveredDeviceType: {
    fontSize: 11,
    color: T.muted,
    marginTop: 2,
  },
});
