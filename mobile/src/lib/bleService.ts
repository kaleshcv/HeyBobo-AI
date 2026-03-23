import { BleManager, Device, State } from 'react-native-ble-plx'
import { Platform } from 'react-native'

// Standard BLE GATT UUIDs (full 128-bit format for react-native-ble-plx)
export const BLE_SERVICES = {
  heartRate:           '0000180d-0000-1000-8000-00805f9b34fb',
  battery:             '0000180f-0000-1000-8000-00805f9b34fb',
  deviceInfo:          '0000180a-0000-1000-8000-00805f9b34fb',
  bloodPressure:       '00001810-0000-1000-8000-00805f9b34fb',
  healthThermometer:   '00001809-0000-1000-8000-00805f9b34fb',
  weightScale:         '0000181d-0000-1000-8000-00805f9b34fb',
  runningSpeedCadence: '00001814-0000-1000-8000-00805f9b34fb',
  cyclingSpeedCadence: '00001816-0000-1000-8000-00805f9b34fb',
  cyclingPower:        '00001818-0000-1000-8000-00805f9b34fb',
} as const

export const BLE_CHARS = {
  heartRateMeasurement: '00002a37-0000-1000-8000-00805f9b34fb',
  batteryLevel:         '00002a19-0000-1000-8000-00805f9b34fb',
  bloodPressure:        '00002a35-0000-1000-8000-00805f9b34fb',
  weightMeasurement:    '00002a9d-0000-1000-8000-00805f9b34fb',
  manufacturerName:     '00002a29-0000-1000-8000-00805f9b34fb',
  modelNumber:          '00002a24-0000-1000-8000-00805f9b34fb',
} as const

export interface WearableDevice {
  id: string
  name: string
  rssi: number
  services: string[]
}

export interface HeartRateReading {
  bpm: number
  contactDetected: boolean
  timestamp: number
}

class BLEService {
  private manager: BleManager
  private connectedDevice: Device | null = null
  private subscriptions: Array<{ remove: () => void }> = []

  constructor() {
    this.manager = new BleManager()
  }

  async initialize(): Promise<boolean> {
    return new Promise((resolve) => {
      const subscription = this.manager.onStateChange((state) => {
        if (state === State.PoweredOn) {
          subscription.remove()
          resolve(true)
        } else if (state === State.PoweredOff || state === State.Unsupported) {
          subscription.remove()
          resolve(false)
        }
      }, true)
    })
  }

  async scanForDevices(
    onDeviceFound: (device: WearableDevice) => void,
    timeoutMs = 10000,
  ): Promise<void> {
    const serviceUUIDs = Object.values(BLE_SERVICES)

    this.manager.startDeviceScan(serviceUUIDs, null, (error, device) => {
      if (error || !device) return
      if (!device.name) return

      onDeviceFound({
        id:       device.id,
        name:     device.name,
        rssi:     device.rssi ?? -100,
        services: device.serviceUUIDs ?? [],
      })
    })

    setTimeout(() => this.stopScan(), timeoutMs)
  }

  stopScan(): void {
    this.manager.stopDeviceScan()
  }

  async connectToDevice(deviceId: string): Promise<Device> {
    const device = await this.manager.connectToDevice(deviceId)
    await device.discoverAllServicesAndCharacteristics()
    this.connectedDevice = device
    return device
  }

  async subscribeHeartRate(onReading: (reading: HeartRateReading) => void): Promise<void> {
    if (!this.connectedDevice) throw new Error('No device connected')

    const sub = this.connectedDevice.monitorCharacteristicForService(
      BLE_SERVICES.heartRate,
      BLE_CHARS.heartRateMeasurement,
      (error, char) => {
        if (error || !char?.value) return
        const bytes = Buffer.from(char.value, 'base64')
        const flags = bytes[0]
        const bpm = flags & 0x01 ? bytes.readUInt16LE(1) : bytes[1]
        const contactDetected = !!(flags & 0x02)

        onReading({ bpm, contactDetected, timestamp: Date.now() })
      },
    )
    this.subscriptions.push(sub)
  }

  async readBatteryLevel(): Promise<number> {
    if (!this.connectedDevice) throw new Error('No device connected')
    const char = await this.connectedDevice.readCharacteristicForService(
      BLE_SERVICES.battery,
      BLE_CHARS.batteryLevel,
    )
    if (!char.value) return 0
    return Buffer.from(char.value, 'base64')[0]
  }

  disconnect(): void {
    this.subscriptions.forEach((s) => s.remove())
    this.subscriptions = []
    this.connectedDevice?.cancelConnection()
    this.connectedDevice = null
  }

  destroy(): void {
    this.disconnect()
    this.manager.destroy()
  }
}

export const bleService = new BLEService()
