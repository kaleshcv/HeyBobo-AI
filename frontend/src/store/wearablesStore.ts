import { create } from 'zustand'
import { type BLEDeviceInfo, type BLEReading } from '@/lib/bleService'

// ─── Types ──────────────────────────────────────────────

export type DeviceType = 'smart-watch' | 'smart-ring' | 'fitness-band' | 'smart-scale' | 'blood-pressure' | 'cgm' | 'pulse-oximeter' | 'phone-sensors'

export type DeviceBrand =
  | 'apple-watch' | 'samsung-galaxy-watch' | 'garmin' | 'fitbit' | 'whoop'
  | 'oura-ring' | 'ultrahuman' | 'ringconn'
  | 'xiaomi-band' | 'amazfit'
  | 'withings-scale' | 'renpho'
  | 'omron' | 'withings-bp'
  | 'dexcom' | 'freestyle-libre'
  | 'masimo' | 'wellue'
  | 'phone'

export type ConnectionStatus = 'connected' | 'disconnected' | 'syncing' | 'error' | 'pairing'

export interface WearableDevice {
  id: string
  type: DeviceType
  brand: DeviceBrand
  name: string
  model: string
  firmwareVersion: string
  batteryLevel: number
  connectionStatus: ConnectionStatus
  connectedAt: string | null
  lastSyncedAt: string | null
  syncIntervalMinutes: number
  isAutoSync: boolean
  metrics: DeviceMetricConfig[]
  /** If paired via Web Bluetooth, the BLE device ID for reconnection */
  bleDeviceId?: string
  /** Whether this device was paired via real Bluetooth */
  isRealDevice?: boolean
}

export interface DeviceMetricConfig {
  metric: HealthMetric
  enabled: boolean
  frequency: 'realtime' | 'every-minute' | 'every-5-min' | 'every-15-min' | 'hourly' | 'daily'
}

export type HealthMetric =
  | 'heart-rate' | 'hrv' | 'resting-hr' | 'blood-oxygen' | 'blood-pressure'
  | 'body-temperature' | 'skin-temperature'
  | 'steps' | 'distance' | 'calories' | 'active-minutes' | 'floors-climbed'
  | 'sleep-duration' | 'sleep-stages' | 'sleep-score'
  | 'stress-level' | 'readiness-score' | 'recovery-score'
  | 'weight' | 'body-fat' | 'muscle-mass' | 'bmi'
  | 'blood-glucose' | 'ecg'
  | 'respiratory-rate' | 'vo2-max'

export interface HealthReading {
  id: string
  deviceId: string
  metric: HealthMetric
  value: number
  unit: string
  timestamp: string
}

export interface DeviceAlert {
  id: string
  deviceId: string
  deviceName: string
  type: 'low-battery' | 'disconnected' | 'abnormal-reading' | 'sync-failed' | 'firmware-update'
  message: string
  severity: 'info' | 'warning' | 'critical'
  timestamp: string
  dismissed: boolean
}

// Admin monitoring
export interface StudentWearableProfile {
  studentId: string
  studentName: string
  studentEmail: string
  studentAvatar: string | null
  devices: WearableDevice[]
  lastActivity: string
  healthScore: number // 0-100
  alerts: DeviceAlert[]
  latestReadings: Record<HealthMetric, { value: number; unit: string; timestamp: string }>
}

// ─── DEVICE CATALOG ─────────────────────────────────────

export interface DeviceCatalogEntry {
  brand: DeviceBrand
  type: DeviceType
  name: string
  model: string
  icon: string
  supportedMetrics: HealthMetric[]
  description: string
}

export const DEVICE_CATALOG: DeviceCatalogEntry[] = [
  // Smart Watches
  { brand: 'apple-watch', type: 'smart-watch', name: 'Apple Watch', model: 'Series 9 / Ultra 2', icon: '⌚', supportedMetrics: ['heart-rate', 'hrv', 'resting-hr', 'blood-oxygen', 'ecg', 'steps', 'distance', 'calories', 'active-minutes', 'floors-climbed', 'sleep-duration', 'sleep-stages', 'body-temperature', 'respiratory-rate', 'vo2-max'], description: 'Full health tracking with ECG, blood oxygen, and temperature sensing' },
  { brand: 'samsung-galaxy-watch', type: 'smart-watch', name: 'Samsung Galaxy Watch', model: 'Watch 6 / Classic', icon: '⌚', supportedMetrics: ['heart-rate', 'hrv', 'resting-hr', 'blood-oxygen', 'blood-pressure', 'ecg', 'steps', 'distance', 'calories', 'active-minutes', 'sleep-duration', 'sleep-stages', 'body-temperature', 'stress-level'], description: 'Advanced health with blood pressure monitoring and body composition' },
  { brand: 'garmin', type: 'smart-watch', name: 'Garmin', model: 'Venu 3 / Forerunner', icon: '⌚', supportedMetrics: ['heart-rate', 'hrv', 'resting-hr', 'blood-oxygen', 'steps', 'distance', 'calories', 'active-minutes', 'floors-climbed', 'sleep-duration', 'sleep-stages', 'sleep-score', 'stress-level', 'readiness-score', 'respiratory-rate', 'vo2-max'], description: 'Premium fitness tracking with advanced training metrics and recovery insights' },
  { brand: 'fitbit', type: 'smart-watch', name: 'Fitbit', model: 'Sense 2 / Versa 4', icon: '⌚', supportedMetrics: ['heart-rate', 'hrv', 'resting-hr', 'blood-oxygen', 'skin-temperature', 'steps', 'distance', 'calories', 'active-minutes', 'floors-climbed', 'sleep-duration', 'sleep-stages', 'sleep-score', 'stress-level', 'readiness-score'], description: 'Comprehensive health & wellness tracking with stress management' },
  { brand: 'whoop', type: 'smart-watch', name: 'WHOOP', model: '4.0', icon: '⌚', supportedMetrics: ['heart-rate', 'hrv', 'resting-hr', 'blood-oxygen', 'skin-temperature', 'respiratory-rate', 'sleep-duration', 'sleep-stages', 'sleep-score', 'recovery-score', 'stress-level', 'calories'], description: 'Recovery and strain focused — no screen, pure data' },

  // Smart Rings
  { brand: 'oura-ring', type: 'smart-ring', name: 'Oura Ring', model: 'Generation 3', icon: '💍', supportedMetrics: ['heart-rate', 'hrv', 'resting-hr', 'blood-oxygen', 'body-temperature', 'skin-temperature', 'steps', 'calories', 'active-minutes', 'sleep-duration', 'sleep-stages', 'sleep-score', 'readiness-score', 'respiratory-rate'], description: 'Premium sleep and readiness tracking in a minimal ring form factor' },
  { brand: 'ultrahuman', type: 'smart-ring', name: 'Ultrahuman Ring', model: 'Air', icon: '💍', supportedMetrics: ['heart-rate', 'hrv', 'resting-hr', 'skin-temperature', 'blood-oxygen', 'steps', 'calories', 'sleep-duration', 'sleep-stages', 'sleep-score', 'readiness-score', 'vo2-max'], description: 'Metabolic tracking ring with movement and sleep insights' },
  { brand: 'ringconn', type: 'smart-ring', name: 'RingConn', model: 'Gen 2', icon: '💍', supportedMetrics: ['heart-rate', 'hrv', 'blood-oxygen', 'skin-temperature', 'steps', 'calories', 'sleep-duration', 'sleep-stages', 'stress-level'], description: 'Affordable smart ring with essential health tracking' },

  // Fitness Bands
  { brand: 'xiaomi-band', type: 'fitness-band', name: 'Xiaomi Smart Band', model: '8 Pro', icon: '📿', supportedMetrics: ['heart-rate', 'blood-oxygen', 'steps', 'distance', 'calories', 'active-minutes', 'sleep-duration', 'sleep-stages', 'stress-level'], description: 'Budget-friendly band with comprehensive tracking' },
  { brand: 'amazfit', type: 'fitness-band', name: 'Amazfit Band', model: '7', icon: '📿', supportedMetrics: ['heart-rate', 'blood-oxygen', 'steps', 'distance', 'calories', 'active-minutes', 'sleep-duration', 'sleep-stages', 'stress-level', 'vo2-max'], description: 'Feature-rich fitness band with Zepp OS' },

  // Smart Scales
  { brand: 'withings-scale', type: 'smart-scale', name: 'Withings Body+', model: 'Body Smart / Comp', icon: '⚖️', supportedMetrics: ['weight', 'body-fat', 'muscle-mass', 'bmi'], description: 'Wi-Fi smart scale with full body composition analysis' },
  { brand: 'renpho', type: 'smart-scale', name: 'Renpho Scale', model: 'Elis 1', icon: '⚖️', supportedMetrics: ['weight', 'body-fat', 'muscle-mass', 'bmi'], description: 'Affordable body composition scale with app integration' },

  // Blood Pressure
  { brand: 'omron', type: 'blood-pressure', name: 'Omron BP Monitor', model: 'Evolv / Platinum', icon: '🩺', supportedMetrics: ['blood-pressure', 'heart-rate'], description: 'Clinical-grade Bluetooth blood pressure monitor' },
  { brand: 'withings-bp', type: 'blood-pressure', name: 'Withings BPM', model: 'Connect / Core', icon: '🩺', supportedMetrics: ['blood-pressure', 'heart-rate', 'ecg'], description: 'Smart blood pressure monitor with ECG capability' },

  // CGM
  { brand: 'dexcom', type: 'cgm', name: 'Dexcom', model: 'G7 / Stelo', icon: '🔬', supportedMetrics: ['blood-glucose'], description: 'Continuous glucose monitoring for metabolic health' },
  { brand: 'freestyle-libre', type: 'cgm', name: 'FreeStyle Libre', model: '3', icon: '🔬', supportedMetrics: ['blood-glucose'], description: 'Flash glucose monitoring — scan or stream glucose readings' },

  // Pulse Oximeters
  { brand: 'masimo', type: 'pulse-oximeter', name: 'Masimo MightySat', model: 'Rx', icon: '🫁', supportedMetrics: ['blood-oxygen', 'heart-rate', 'respiratory-rate'], description: 'Medical-grade pulse oximeter with Bluetooth' },
  { brand: 'wellue', type: 'pulse-oximeter', name: 'Wellue O2Ring', model: 'O2Ring', icon: '🫁', supportedMetrics: ['blood-oxygen', 'heart-rate'], description: 'Continuous ring-style pulse oximeter with overnight tracking' },

  // Phone
  { brand: 'phone', type: 'phone-sensors', name: 'Phone Sensors', model: 'iOS / Android', icon: '📱', supportedMetrics: ['steps', 'distance', 'floors-climbed', 'active-minutes'], description: 'Use built-in phone accelerometer and GPS for basic tracking' },
]

export const DEVICE_TYPE_META: Record<DeviceType, { label: string; emoji: string; color: string }> = {
  'smart-watch': { label: 'Smart Watch', emoji: '⌚', color: '#1e88e5' },
  'smart-ring': { label: 'Smart Ring', emoji: '💍', color: '#7b1fa2' },
  'fitness-band': { label: 'Fitness Band', emoji: '📿', color: '#00897b' },
  'smart-scale': { label: 'Smart Scale', emoji: '⚖️', color: '#ef6c00' },
  'blood-pressure': { label: 'Blood Pressure', emoji: '🩺', color: '#c62828' },
  'cgm': { label: 'CGM', emoji: '🔬', color: '#2e7d32' },
  'pulse-oximeter': { label: 'Pulse Oximeter', emoji: '🫁', color: '#0277bd' },
  'phone-sensors': { label: 'Phone', emoji: '📱', color: '#546e7a' },
}

export const METRIC_META: Record<HealthMetric, { label: string; unit: string; emoji: string; normalRange?: [number, number] }> = {
  'heart-rate': { label: 'Heart Rate', unit: 'bpm', emoji: '❤️', normalRange: [60, 100] },
  'hrv': { label: 'HRV', unit: 'ms', emoji: '💓', normalRange: [20, 100] },
  'resting-hr': { label: 'Resting HR', unit: 'bpm', emoji: '🫀', normalRange: [50, 80] },
  'blood-oxygen': { label: 'Blood Oxygen', unit: '%', emoji: '🩸', normalRange: [95, 100] },
  'blood-pressure': { label: 'Blood Pressure', unit: 'mmHg', emoji: '🩺', normalRange: [90, 140] },
  'body-temperature': { label: 'Body Temp', unit: '°F', emoji: '🌡️', normalRange: [97, 99.5] },
  'skin-temperature': { label: 'Skin Temp', unit: '°F', emoji: '🌡️', normalRange: [91, 95] },
  'steps': { label: 'Steps', unit: 'steps', emoji: '👟' },
  'distance': { label: 'Distance', unit: 'km', emoji: '📍' },
  'calories': { label: 'Calories', unit: 'kcal', emoji: '🔥' },
  'active-minutes': { label: 'Active Minutes', unit: 'min', emoji: '⏱️' },
  'floors-climbed': { label: 'Floors', unit: 'floors', emoji: '🏢' },
  'sleep-duration': { label: 'Sleep Duration', unit: 'hrs', emoji: '😴', normalRange: [7, 9] },
  'sleep-stages': { label: 'Sleep Stages', unit: '', emoji: '🌙' },
  'sleep-score': { label: 'Sleep Score', unit: '/100', emoji: '💤', normalRange: [70, 100] },
  'stress-level': { label: 'Stress Level', unit: '/100', emoji: '😰', normalRange: [0, 50] },
  'readiness-score': { label: 'Readiness', unit: '/100', emoji: '✅', normalRange: [60, 100] },
  'recovery-score': { label: 'Recovery', unit: '/100', emoji: '🔄', normalRange: [50, 100] },
  'weight': { label: 'Weight', unit: 'kg', emoji: '⚖️' },
  'body-fat': { label: 'Body Fat', unit: '%', emoji: '📊' },
  'muscle-mass': { label: 'Muscle Mass', unit: 'kg', emoji: '💪' },
  'bmi': { label: 'BMI', unit: '', emoji: '📐', normalRange: [18.5, 25] },
  'blood-glucose': { label: 'Blood Glucose', unit: 'mg/dL', emoji: '🔬', normalRange: [70, 140] },
  'ecg': { label: 'ECG', unit: '', emoji: '📈' },
  'respiratory-rate': { label: 'Resp. Rate', unit: 'brpm', emoji: '🫁', normalRange: [12, 20] },
  'vo2-max': { label: 'VO₂ Max', unit: 'mL/kg/min', emoji: '🏃', normalRange: [30, 60] },
}

// ─── HELPERS ────────────────────────────────────────────

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function randomReading(metric: HealthMetric): number {
  const meta = METRIC_META[metric]
  if (meta.normalRange) {
    const [lo, hi] = meta.normalRange
    const spread = hi - lo
    return Math.round((lo + Math.random() * spread * 1.3) * 10) / 10
  }
  switch (metric) {
    case 'steps': return Math.floor(2000 + Math.random() * 10000)
    case 'distance': return Math.round((1 + Math.random() * 8) * 10) / 10
    case 'calories': return Math.floor(200 + Math.random() * 600)
    case 'active-minutes': return Math.floor(10 + Math.random() * 80)
    case 'floors-climbed': return Math.floor(2 + Math.random() * 15)
    case 'weight': return Math.round((55 + Math.random() * 40) * 10) / 10
    case 'body-fat': return Math.round((12 + Math.random() * 22) * 10) / 10
    case 'muscle-mass': return Math.round((25 + Math.random() * 20) * 10) / 10
    case 'sleep-stages': return 0
    case 'ecg': return 0
    default: return Math.round(Math.random() * 100)
  }
}

function simulateReadings(device: WearableDevice): HealthReading[] {
  return device.metrics
    .filter((m) => m.enabled)
    .map((m) => ({
      id: genId(),
      deviceId: device.id,
      metric: m.metric,
      value: randomReading(m.metric),
      unit: METRIC_META[m.metric].unit,
      timestamp: new Date().toISOString(),
    }))
}

// ─── STORE ──────────────────────────────────────────────

interface WearablesState {
  // User's devices
  devices: WearableDevice[]
  readings: HealthReading[]
  alerts: DeviceAlert[]

  // Admin
  studentProfiles: StudentWearableProfile[]

  // Actions — devices
  pairDevice: (catalogEntry: DeviceCatalogEntry) => void
  unpairDevice: (deviceId: string) => void
  syncDevice: (deviceId: string) => void
  syncAllDevices: () => void
  toggleAutoSync: (deviceId: string) => void
  toggleMetric: (deviceId: string, metric: HealthMetric) => void

  // Actions — alerts
  dismissAlert: (alertId: string) => void
  dismissAllAlerts: () => void

  // Actions — admin
  loadStudentProfiles: () => void
  syncStudentDevice: (studentId: string, deviceId: string) => void

  // Actions — real BLE
  pairRealDevice: (info: BLEDeviceInfo) => void
  handleBLEReading: (reading: BLEReading) => void
  handleBLEDisconnect: (bleDeviceId: string) => void
}

// Data is synced to backend via API — no localStorage
// Zustand stores data in-memory only (ephemeral per session)

export const useWearablesStore = create<WearablesState>((set, get) => {
  return {
    devices: [],
    readings: [],
    alerts: [],
    studentProfiles: [],

    pairDevice: (entry) => {
      const device: WearableDevice = {
        id: genId(),
        type: entry.type,
        brand: entry.brand,
        name: entry.name,
        model: entry.model,
        firmwareVersion: '1.0',
        batteryLevel: Math.floor(70 + Math.random() * 30),
        connectionStatus: 'connected',
        connectedAt: new Date().toISOString(),
        lastSyncedAt: new Date().toISOString(),
        syncIntervalMinutes: 15,
        isAutoSync: true,
        metrics: entry.supportedMetrics.map((m) => ({
          metric: m,
          enabled: true,
          frequency: 'every-15-min' as const,
        })),
      }
      const devices = [...get().devices, device]
      const newReadings = simulateReadings(device)
      const readings = [...newReadings, ...get().readings].slice(0, 500)
      set({ devices, readings })
    },

    unpairDevice: (deviceId) => {
      const devices = get().devices.filter((d) => d.id !== deviceId)
      const readings = get().readings.filter((r) => r.deviceId !== deviceId)
      const alerts = get().alerts.filter((a) => a.deviceId !== deviceId)
      set({ devices, readings, alerts })
    },

    syncDevice: (deviceId) => {
      const device = get().devices.find((d) => d.id === deviceId)
      if (!device) return
      const devices = get().devices.map((d) => {
        if (d.id !== deviceId) return d
        return {
          ...d,
          connectionStatus: 'connected' as ConnectionStatus,
          lastSyncedAt: new Date().toISOString(),
          batteryLevel: Math.max(5, d.batteryLevel - Math.floor(Math.random() * 3)),
        }
      })
      const newReadings = simulateReadings(device)
      const readings = [...newReadings, ...get().readings].slice(0, 500)
      // Check for alerts
      const newAlerts: DeviceAlert[] = []
      const updatedDevice = devices.find((d) => d.id === deviceId)!
      if (updatedDevice.batteryLevel < 20) {
        newAlerts.push({ id: genId(), deviceId, deviceName: updatedDevice.name, type: 'low-battery', message: `Battery at ${updatedDevice.batteryLevel}%`, severity: updatedDevice.batteryLevel < 10 ? 'critical' : 'warning', timestamp: new Date().toISOString(), dismissed: false })
      }
      for (const r of newReadings) {
        const meta = METRIC_META[r.metric]
        if (meta.normalRange) {
          const [lo, hi] = meta.normalRange
          if (r.value < lo * 0.85 || r.value > hi * 1.15) {
            newAlerts.push({ id: genId(), deviceId, deviceName: updatedDevice.name, type: 'abnormal-reading', message: `${meta.label}: ${r.value} ${r.unit} (normal: ${lo}–${hi})`, severity: r.value < lo * 0.7 || r.value > hi * 1.3 ? 'critical' : 'warning', timestamp: new Date().toISOString(), dismissed: false })
          }
        }
      }
      const alerts = [...newAlerts, ...get().alerts]
      set({ devices, readings, alerts })
    },

    syncAllDevices: () => {
      const { devices } = get()
      devices.forEach((d) => {
        if (d.connectionStatus !== 'error') get().syncDevice(d.id)
      })
    },

    toggleAutoSync: (deviceId) => {
      const devices = get().devices.map((d) => d.id === deviceId ? { ...d, isAutoSync: !d.isAutoSync } : d)
      set({ devices })
    },

    toggleMetric: (deviceId, metric) => {
      const devices = get().devices.map((d) => {
        if (d.id !== deviceId) return d
        return { ...d, metrics: d.metrics.map((m) => m.metric === metric ? { ...m, enabled: !m.enabled } : m) }
      })
      set({ devices })
    },

    dismissAlert: (alertId) => {
      const alerts = get().alerts.map((a) => a.id === alertId ? { ...a, dismissed: true } : a)
      set({ alerts })
    },

    dismissAllAlerts: () => {
      const alerts = get().alerts.map((a) => ({ ...a, dismissed: true }))
      set({ alerts })
    },

    loadStudentProfiles: () => {
      // Admin-only: load from API when available. No mock data.
      set({ studentProfiles: [] })
    },

    syncStudentDevice: (studentId, deviceId) => {
      const profiles = get().studentProfiles.map((p) => {
        if (p.studentId !== studentId) return p
        return {
          ...p,
          devices: p.devices.map((d) => d.id === deviceId ? { ...d, lastSyncedAt: new Date().toISOString(), connectionStatus: 'connected' as ConnectionStatus } : d),
          lastActivity: new Date().toISOString(),
        }
      })
      set({ studentProfiles: profiles })
    },

    // ── Real BLE device actions ───────────────────────────

    pairRealDevice: (info: BLEDeviceInfo) => {
      // Map discovered BLE services to our metric types
      const metricsFromServices: HealthMetric[] = []
      for (const svc of info.discoveredServices) {
        switch (svc) {
          case 'heart-rate':
            metricsFromServices.push('heart-rate', 'hrv', 'calories')
            break
          case 'blood-pressure':
            metricsFromServices.push('blood-pressure')
            break
          case 'thermometer':
            metricsFromServices.push('body-temperature')
            break
          case 'weight-scale':
            metricsFromServices.push('weight')
            break
          case 'running-speed':
            metricsFromServices.push('steps', 'distance')
            break
          case 'cycling-speed':
          case 'cycling-power':
            metricsFromServices.push('calories', 'active-minutes')
            break
        }
      }
      const uniqueMetrics = [...new Set(metricsFromServices)]

      // Determine device type from services
      let type: DeviceType = 'fitness-band'
      if (info.discoveredServices.includes('heart-rate')) type = 'smart-watch'
      if (info.discoveredServices.includes('weight-scale')) type = 'smart-scale'
      if (info.discoveredServices.includes('blood-pressure')) type = 'blood-pressure'
      if (info.discoveredServices.includes('thermometer')) type = 'pulse-oximeter'

      const device: WearableDevice = {
        id: genId(),
        type,
        brand: 'phone' as DeviceBrand, // Generic — real BLE devices
        name: info.name,
        model: info.model !== 'Unknown' ? info.model : info.name,
        firmwareVersion: info.firmware !== 'Unknown' ? info.firmware : '—',
        batteryLevel: info.batteryLevel ?? 100,
        connectionStatus: 'connected',
        connectedAt: new Date().toISOString(),
        lastSyncedAt: new Date().toISOString(),
        syncIntervalMinutes: 1,
        isAutoSync: true,
        metrics: uniqueMetrics.map((m) => ({ metric: m, enabled: true, frequency: 'realtime' as const })),
        bleDeviceId: info.deviceId,
        isRealDevice: true,
      }

      const devices = [...get().devices, device]
      set({ devices })
    },

    handleBLEReading: (reading: BLEReading) => {
      // Find the WearableDevice that has this bleDeviceId
      const device = get().devices.find((d) => d.bleDeviceId === reading.deviceId)
      if (!device) return

      const healthReading: HealthReading = {
        id: genId(),
        deviceId: device.id,
        metric: reading.metric as HealthMetric,
        value: reading.value,
        unit: reading.unit,
        timestamp: reading.timestamp,
      }

      const readings = [healthReading, ...get().readings].slice(0, 1000)
      const devices = get().devices.map((d) =>
        d.id === device.id ? { ...d, lastSyncedAt: reading.timestamp, connectionStatus: 'connected' as ConnectionStatus } : d,
      )
      set({ devices, readings })
    },

    handleBLEDisconnect: (bleDeviceId: string) => {
      const devices = get().devices.map((d) =>
        d.bleDeviceId === bleDeviceId ? { ...d, connectionStatus: 'disconnected' as ConnectionStatus } : d,
      )
      const disconnected = get().devices.find((d) => d.bleDeviceId === bleDeviceId)
      const newAlerts: DeviceAlert[] = []
      if (disconnected) {
        newAlerts.push({
          id: genId(),
          deviceId: disconnected.id,
          deviceName: disconnected.name,
          type: 'disconnected',
          message: `${disconnected.name} lost Bluetooth connection`,
          severity: 'warning',
          timestamp: new Date().toISOString(),
          dismissed: false,
        })
      }
      const alerts = [...newAlerts, ...get().alerts]
      set({ devices, alerts })
    },
  }
})
