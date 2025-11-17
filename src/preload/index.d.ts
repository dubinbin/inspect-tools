import { ElectronAPI } from '@electron-toolkit/preload'

interface DialogResult {
  canceled: boolean
  path: string | null
  error?: string
}

interface Device {
  name: string
  path: string
  size?: string
}

interface DeviceResult {
  success: boolean
  devices: Device[]
  error?: string
}

interface CopyResult {
  success: boolean
  targetPath?: string
  error?: string
}

interface API {
  selectDirectory: () => Promise<DialogResult>
  selectFile: (defaultPath?: string) => Promise<DialogResult>
  getExternalDevices: () => Promise<DeviceResult>
  copyFileToDevice: (sourceFile: string, targetDevice: string) => Promise<CopyResult>
  onCopyProgress: (callback: (progress: number) => void) => void
  removeCopyProgressListener: () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
