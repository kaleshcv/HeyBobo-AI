/**
 * Web Bluetooth service for pairing real BLE health devices
 * and reading live health data (heart rate, SpO2, weight, etc.)
 *
 * Supported BLE GATT profiles:
 *  - Heart Rate (0x180D)
 *  - Battery (0x180F)
 *  - Device Information (0x180A)
 *  - Blood Pressure (0x1810)
 *  - Health Thermometer (0x1809)
 *  - Weight Scale (0x181D)
 *  - Running Speed & Cadence (0x1814)
 *  - Cycling Speed & Cadence (0x1816)
 *
 * Works in Chrome, Edge, Opera. Not supported in Firefox or Safari.
 */

// ─── Standard BLE GATT UUIDs ────────────────────────────

export const BLE_SERVICES = {
  heartRate: 0x180d,
  battery: 0x180f,
  deviceInfo: 0x180a,
  bloodPressure: 0x1810,
  healthThermometer: 0x1809,
  weightScale: 0x181d,
  runningSpeedCadence: 0x1814,
  cyclingSpeedCadence: 0x1816,
  cyclingPower: 0x1818,
} as const

export const BLE_CHARS = {
  // Heart Rate
  heartRateMeasurement: 0x2a37,
  bodySensorLocation: 0x2a38,
  // Battery
  batteryLevel: 0x2a19,
  // Device Info
  manufacturerName: 0x2a29,
  modelNumber: 0x2a24,
  firmwareRevision: 0x2a26,
  serialNumber: 0x2a25,
  // Blood Pressure
  bloodPressureMeasurement: 0x2a35,
  // Thermometer
  temperatureMeasurement: 0x2a1c,
  // Weight Scale
  weightMeasurement: 0x2a9d,
} as const

// ─── Types ──────────────────────────────────────────────

export interface BLEDeviceInfo {
  bleDevice: BluetoothDevice
  name: string
  deviceId: string
  manufacturer: string
  model: string
  firmware: string
  batteryLevel: number | null
  discoveredServices: string[]
}

export interface BLEReading {
  metric: string
  value: number
  unit: string
  timestamp: string
  deviceId: string
}

type ReadingListener = (reading: BLEReading) => void
type DisconnectListener = (deviceId: string) => void

// ─── Helpers ────────────────────────────────────────────

function readString(dv: DataView): string {
  const decoder = new TextDecoder()
  return decoder.decode(dv.buffer).trim()
}

function parseHeartRate(dv: DataView): { heartRate: number; contactDetected?: boolean; energyExpended?: number; rrIntervals?: number[] } {
  const flags = dv.getUint8(0)
  const is16Bit = !!(flags & 0x01)
  const hasContact = !!(flags & 0x04)
  const contactDetected = hasContact ? !!(flags & 0x02) : undefined
  const hasEnergy = !!(flags & 0x08)
  const hasRR = !!(flags & 0x10)

  let offset = 1
  const heartRate = is16Bit ? dv.getUint16(offset, true) : dv.getUint8(offset)
  offset += is16Bit ? 2 : 1

  let energyExpended: number | undefined
  if (hasEnergy) {
    energyExpended = dv.getUint16(offset, true)
    offset += 2
  }

  const rrIntervals: number[] = []
  if (hasRR) {
    while (offset + 1 < dv.byteLength) {
      rrIntervals.push(dv.getUint16(offset, true) / 1024 * 1000) // convert to ms
      offset += 2
    }
  }

  return { heartRate, contactDetected, energyExpended, rrIntervals }
}

function parseBloodPressure(dv: DataView): { systolic: number; diastolic: number; meanAP: number; unit: string } {
  const flags = dv.getUint8(0)
  const isKpa = !!(flags & 0x01)
  const unit = isKpa ? 'kPa' : 'mmHg'
  // IEEE 11073 SFLOAT — simplified: read as regular floats
  const systolic = dv.getFloat32(1, true) || dv.getUint16(1, true) / 10
  const diastolic = dv.getFloat32(3, true) || dv.getUint16(3, true) / 10
  const meanAP = dv.getFloat32(5, true) || dv.getUint16(5, true) / 10
  return { systolic: Math.round(systolic), diastolic: Math.round(diastolic), meanAP: Math.round(meanAP), unit }
}

function parseTemperature(dv: DataView): { temperature: number; unit: string } {
  const flags = dv.getUint8(0)
  const isFahrenheit = !!(flags & 0x01)
  // IEEE 11073 FLOAT — simplified
  const mantissa = dv.getUint16(1, true) | ((dv.getUint8(3) & 0x0f) << 16)
  const exponent = (dv.getInt8(3) >> 4)
  const temperature = mantissa * Math.pow(10, exponent)
  return { temperature: Math.round(temperature * 10) / 10, unit: isFahrenheit ? '°F' : '°C' }
}

function parseWeight(dv: DataView): { weight: number; unit: string } {
  const flags = dv.getUint8(0)
  const isImperial = !!(flags & 0x01)
  const weight = dv.getUint16(1, true) / (isImperial ? 200 : 200) // resolution 0.005 kg or 0.01 lb
  return { weight: Math.round(weight * 10) / 10, unit: isImperial ? 'lb' : 'kg' }
}

// ─── BLE Service ────────────────────────────────────────

class BLEService {
  private connectedDevices = new Map<string, BluetoothDevice>()
  private gattServers = new Map<string, BluetoothRemoteGATTServer>()
  private readingListeners: ReadingListener[] = []
  private disconnectListeners: DisconnectListener[] = []
  private activeCharacteristics = new Map<string, BluetoothRemoteGATTCharacteristic[]>()

  /** Check if Web Bluetooth is available */
  isSupported(): boolean {
    return typeof navigator !== 'undefined' && !!navigator.bluetooth
  }

  /** Subscribe to live readings from all connected devices */
  onReading(listener: ReadingListener): () => void {
    this.readingListeners.push(listener)
    return () => {
      this.readingListeners = this.readingListeners.filter((l) => l !== listener)
    }
  }

  /** Subscribe to device disconnect events */
  onDisconnect(listener: DisconnectListener): () => void {
    this.disconnectListeners.push(listener)
    return () => {
      this.disconnectListeners = this.disconnectListeners.filter((l) => l !== listener)
    }
  }

  private emitReading(reading: BLEReading) {
    this.readingListeners.forEach((l) => l(reading))
  }

  private emitDisconnect(deviceId: string) {
    this.disconnectListeners.forEach((l) => l(deviceId))
  }

  /**
   * Open the browser's Bluetooth device picker and pair a device.
   * Returns device info after connection.
   */
  async scanAndPair(): Promise<BLEDeviceInfo> {
    if (!this.isSupported()) {
      throw new Error('Web Bluetooth is not supported in this browser. Use Chrome, Edge, or Opera.')
    }

    // Request device with health-related service filters
    const device = await navigator.bluetooth.requestDevice({
      filters: [
        { services: [BLE_SERVICES.heartRate] },
        { services: [BLE_SERVICES.bloodPressure] },
        { services: [BLE_SERVICES.healthThermometer] },
        { services: [BLE_SERVICES.weightScale] },
        { services: [BLE_SERVICES.runningSpeedCadence] },
        { services: [BLE_SERVICES.cyclingSpeedCadence] },
        { services: [BLE_SERVICES.cyclingPower] },
      ],
      optionalServices: [
        BLE_SERVICES.battery,
        BLE_SERVICES.deviceInfo,
      ],
    })

    return this.connectDevice(device)
  }

  /**
   * Scan with "accept all" — broader, shows all nearby BLE devices.
   */
  async scanAllDevices(): Promise<BLEDeviceInfo> {
    if (!this.isSupported()) {
      throw new Error('Web Bluetooth is not supported in this browser. Use Chrome, Edge, or Opera.')
    }

    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [
        BLE_SERVICES.heartRate,
        BLE_SERVICES.battery,
        BLE_SERVICES.deviceInfo,
        BLE_SERVICES.bloodPressure,
        BLE_SERVICES.healthThermometer,
        BLE_SERVICES.weightScale,
      ],
    })

    return this.connectDevice(device)
  }

  /** Connect to a BluetoothDevice and read its info */
  private async connectDevice(device: BluetoothDevice): Promise<BLEDeviceInfo> {
    if (!device.gatt) throw new Error('GATT not available on this device')

    const server = await device.gatt.connect()
    const deviceId = device.id

    this.connectedDevices.set(deviceId, device)
    this.gattServers.set(deviceId, server)

    // Listen for disconnection
    device.addEventListener('gattserverdisconnected', () => {
      this.connectedDevices.delete(deviceId)
      this.gattServers.delete(deviceId)
      this.activeCharacteristics.delete(deviceId)
      this.emitDisconnect(deviceId)
    })

    // Read device information
    const info = await this.readDeviceInfo(server, device)

    // Start listening to available health services
    await this.subscribeToServices(server, deviceId)

    return info
  }

  /** Read manufacturer, model, firmware, battery from Device Info service */
  private async readDeviceInfo(server: BluetoothRemoteGATTServer, device: BluetoothDevice): Promise<BLEDeviceInfo> {
    let manufacturer = 'Unknown'
    let model = 'Unknown'
    let firmware = 'Unknown'
    let batteryLevel: number | null = null
    const discoveredServices: string[] = []

    // Device Info Service
    try {
      const dis = await server.getPrimaryService(BLE_SERVICES.deviceInfo)
      discoveredServices.push('device-info')
      try { manufacturer = readString(await (await dis.getCharacteristic(BLE_CHARS.manufacturerName)).readValue()) } catch { /* not available */ }
      try { model = readString(await (await dis.getCharacteristic(BLE_CHARS.modelNumber)).readValue()) } catch { /* not available */ }
      try { firmware = readString(await (await dis.getCharacteristic(BLE_CHARS.firmwareRevision)).readValue()) } catch { /* not available */ }
    } catch { /* DIS not available */ }

    // Battery Service
    try {
      const bs = await server.getPrimaryService(BLE_SERVICES.battery)
      discoveredServices.push('battery')
      const char = await bs.getCharacteristic(BLE_CHARS.batteryLevel)
      const dv = await char.readValue()
      batteryLevel = dv.getUint8(0)
    } catch { /* battery not available */ }

    // Probe which health services are available
    const probes: [string, number][] = [
      ['heart-rate', BLE_SERVICES.heartRate],
      ['blood-pressure', BLE_SERVICES.bloodPressure],
      ['thermometer', BLE_SERVICES.healthThermometer],
      ['weight-scale', BLE_SERVICES.weightScale],
      ['running-speed', BLE_SERVICES.runningSpeedCadence],
      ['cycling-speed', BLE_SERVICES.cyclingSpeedCadence],
      ['cycling-power', BLE_SERVICES.cyclingPower],
    ]

    for (const [label, uuid] of probes) {
      try {
        await server.getPrimaryService(uuid)
        discoveredServices.push(label)
      } catch { /* not available */ }
    }

    return {
      bleDevice: device,
      name: device.name || 'BLE Device',
      deviceId: device.id,
      manufacturer,
      model,
      firmware,
      batteryLevel,
      discoveredServices,
    }
  }

  /** Subscribe to notifications for all discovered health services */
  private async subscribeToServices(server: BluetoothRemoteGATTServer, deviceId: string) {
    const chars: BluetoothRemoteGATTCharacteristic[] = []

    // Heart Rate
    try {
      const svc = await server.getPrimaryService(BLE_SERVICES.heartRate)
      const char = await svc.getCharacteristic(BLE_CHARS.heartRateMeasurement)
      char.addEventListener('characteristicvaluechanged', ((e: Event) => {
        const target = (e as Event & { target: BluetoothRemoteGATTCharacteristic }).target
        if (!target.value) return
        const parsed = parseHeartRate(target.value)
        this.emitReading({ metric: 'heart-rate', value: parsed.heartRate, unit: 'bpm', timestamp: new Date().toISOString(), deviceId })
        if (parsed.rrIntervals && parsed.rrIntervals.length > 0) {
          // Calculate HRV from successive RR interval differences (RMSSD)
          const rr = parsed.rrIntervals
          if (rr.length >= 2) {
            let sumSq = 0
            for (let i = 1; i < rr.length; i++) sumSq += (rr[i] - rr[i - 1]) ** 2
            const hrv = Math.round(Math.sqrt(sumSq / (rr.length - 1)))
            this.emitReading({ metric: 'hrv', value: hrv, unit: 'ms', timestamp: new Date().toISOString(), deviceId })
          }
        }
        if (parsed.energyExpended !== undefined) {
          this.emitReading({ metric: 'calories', value: parsed.energyExpended, unit: 'kcal', timestamp: new Date().toISOString(), deviceId })
        }
      }) as EventListener)
      await char.startNotifications()
      chars.push(char)
    } catch { /* HR not available */ }

    // Blood Pressure
    try {
      const svc = await server.getPrimaryService(BLE_SERVICES.bloodPressure)
      const char = await svc.getCharacteristic(BLE_CHARS.bloodPressureMeasurement)
      char.addEventListener('characteristicvaluechanged', ((e: Event) => {
        const target = (e as Event & { target: BluetoothRemoteGATTCharacteristic }).target
        if (!target.value) return
        const parsed = parseBloodPressure(target.value)
        this.emitReading({ metric: 'blood-pressure', value: parsed.systolic, unit: parsed.unit, timestamp: new Date().toISOString(), deviceId })
        this.emitReading({ metric: 'blood-pressure-diastolic', value: parsed.diastolic, unit: parsed.unit, timestamp: new Date().toISOString(), deviceId })
      }) as EventListener)
      await char.startNotifications()
      chars.push(char)
    } catch { /* BP not available */ }

    // Temperature
    try {
      const svc = await server.getPrimaryService(BLE_SERVICES.healthThermometer)
      const char = await svc.getCharacteristic(BLE_CHARS.temperatureMeasurement)
      char.addEventListener('characteristicvaluechanged', ((e: Event) => {
        const target = (e as Event & { target: BluetoothRemoteGATTCharacteristic }).target
        if (!target.value) return
        const parsed = parseTemperature(target.value)
        this.emitReading({ metric: 'body-temperature', value: parsed.temperature, unit: parsed.unit, timestamp: new Date().toISOString(), deviceId })
      }) as EventListener)
      await char.startNotifications()
      chars.push(char)
    } catch { /* temp not available */ }

    // Weight Scale
    try {
      const svc = await server.getPrimaryService(BLE_SERVICES.weightScale)
      const char = await svc.getCharacteristic(BLE_CHARS.weightMeasurement)
      char.addEventListener('characteristicvaluechanged', ((e: Event) => {
        const target = (e as Event & { target: BluetoothRemoteGATTCharacteristic }).target
        if (!target.value) return
        const parsed = parseWeight(target.value)
        this.emitReading({ metric: 'weight', value: parsed.weight, unit: parsed.unit, timestamp: new Date().toISOString(), deviceId })
      }) as EventListener)
      await char.startNotifications()
      chars.push(char)
    } catch { /* weight not available */ }

    // Battery — poll once (usually doesn't support notifications)
    try {
      const svc = await server.getPrimaryService(BLE_SERVICES.battery)
      const char = await svc.getCharacteristic(BLE_CHARS.batteryLevel)
      try {
        char.addEventListener('characteristicvaluechanged', ((e: Event) => {
          const target = (e as Event & { target: BluetoothRemoteGATTCharacteristic }).target
          if (!target.value) return
          this.emitReading({ metric: 'battery', value: target.value.getUint8(0), unit: '%', timestamp: new Date().toISOString(), deviceId })
        }) as EventListener)
        await char.startNotifications()
        chars.push(char)
      } catch { /* notification not supported for battery, that's fine */ }
    } catch { /* battery not available */ }

    this.activeCharacteristics.set(deviceId, chars)
  }

  /** Read battery level on demand */
  async readBattery(deviceId: string): Promise<number | null> {
    const server = this.gattServers.get(deviceId)
    if (!server?.connected) return null
    try {
      const svc = await server.getPrimaryService(BLE_SERVICES.battery)
      const char = await svc.getCharacteristic(BLE_CHARS.batteryLevel)
      const dv = await char.readValue()
      return dv.getUint8(0)
    } catch {
      return null
    }
  }

  /** Disconnect a specific device */
  async disconnect(deviceId: string) {
    const chars = this.activeCharacteristics.get(deviceId) || []
    for (const char of chars) {
      try { await char.stopNotifications() } catch { /* ignore */ }
    }
    this.activeCharacteristics.delete(deviceId)

    const server = this.gattServers.get(deviceId)
    if (server?.connected) server.disconnect()

    this.connectedDevices.delete(deviceId)
    this.gattServers.delete(deviceId)
  }

  /** Check if a device is currently connected */
  isConnected(deviceId: string): boolean {
    const server = this.gattServers.get(deviceId)
    return !!server?.connected
  }

  /** Disconnect all and clean up */
  disconnectAll() {
    for (const id of this.connectedDevices.keys()) {
      this.disconnect(id)
    }
  }

  /** Get all connected device IDs */
  getConnectedDeviceIds(): string[] {
    return Array.from(this.connectedDevices.keys()).filter((id) => this.isConnected(id))
  }
}

// Singleton
export const bleService = new BLEService()
