/**
 * BLE Service — stubbed for Expo Go.
 * react-native-ble-plx requires a native build (npx expo run:android).
 * The full implementation is kept as comments below.
 */

export interface BLEDeviceInfo {
  id: string
  name: string | null
  rssi: number | null
}

export class BLEService {
  async requestPermissions(): Promise<boolean> {
    console.warn('[BLE] BLE requires a native build — stubbed in Expo Go')
    return false
  }
  async scanForDevices(_onFound: (device: BLEDeviceInfo) => void): Promise<void> {
    console.warn('[BLE] BLE requires a native build — stubbed in Expo Go')
  }
  async connectToDevice(_deviceId: string): Promise<void> {
    console.warn('[BLE] BLE requires a native build')
  }
  async subscribeHeartRate(_deviceId: string, _cb: (bpm: number) => void): Promise<void> {
    console.warn('[BLE] BLE requires a native build')
  }
  async readBatteryLevel(_deviceId: string): Promise<number> {
    return 0
  }
  async disconnect(_deviceId: string): Promise<void> {}
  stopScan(): void {}
}

export const bleService = new BLEService()

// Type alias used by wearablesStore
export type WearableDevice = BLEDeviceInfo
