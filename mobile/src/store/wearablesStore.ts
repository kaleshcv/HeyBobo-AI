import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { asyncStorage } from '@/lib/storage'
import type { WearableDevice } from '@/lib/bleService'

interface WearablesState {
  isScanning:      boolean
  connectedDevice: WearableDevice | null
  discoveredDevices: WearableDevice[]
  heartRate:       number | null
  batteryLevel:    number | null
  lastSynced:      string | null

  setScanning:       (v: boolean) => void
  setDiscovered:     (devices: WearableDevice[]) => void
  addDiscovered:     (device: WearableDevice) => void
  setConnected:      (device: WearableDevice | null) => void
  setHeartRate:      (bpm: number) => void
  setBattery:        (level: number) => void
  setSynced:         () => void
  disconnect:        () => void
}

export const useWearablesStore = create<WearablesState>()(
  persist(
    (set) => ({
      isScanning:        false,
      connectedDevice:   null,
      discoveredDevices: [],
      heartRate:         null,
      batteryLevel:      null,
      lastSynced:        null,

      setScanning:   (isScanning) => set({ isScanning }),
      setDiscovered: (discoveredDevices) => set({ discoveredDevices }),
      addDiscovered: (device) =>
        set((s) => ({
          discoveredDevices: s.discoveredDevices.some((d) => d.id === device.id)
            ? s.discoveredDevices
            : [...s.discoveredDevices, device],
        })),
      setConnected:  (connectedDevice) => set({ connectedDevice }),
      setHeartRate:  (heartRate) => set({ heartRate }),
      setBattery:    (batteryLevel) => set({ batteryLevel }),
      setSynced:     () => set({ lastSynced: new Date().toISOString() }),
      disconnect:    () => set({ connectedDevice: null, heartRate: null, batteryLevel: null }),
    }),
    {
      name:    'wearables',
      storage: createJSONStorage(() => asyncStorage),
      partialize: (s) => ({ connectedDevice: s.connectedDevice, lastSynced: s.lastSynced }),
    },
  ),
)
