import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join, basename } from 'path'
import {
  readdirSync,
  statSync,
  lstatSync,
  existsSync,
  createReadStream,
  createWriteStream
} from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    icon: icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Window control handlers
  ipcMain.on('window:minimize', () => {
    if (mainWindow) {
      mainWindow.minimize()
    }
  })

  ipcMain.on('window:close', () => {
    if (mainWindow) {
      mainWindow.close()
    }
  })

  // IPC handler for selecting directory
  ipcMain.handle('dialog:selectDirectory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory']
    })

    if (result.canceled) {
      return { canceled: true, path: null }
    } else {
      return { canceled: false, path: result.filePaths[0] }
    }
  })

  // IPC handler for listing files in a directory
  ipcMain.handle('file:listFiles', async (_, directoryPath: string) => {
    try {
      console.log('Listing files in directory:', directoryPath)

      if (!existsSync(directoryPath)) {
        return { success: false, error: 'Directory does not exist', files: [] }
      }

      const stats = statSync(directoryPath)
      if (!stats.isDirectory()) {
        return { success: false, error: 'Path is not a directory', files: [] }
      }

      const entries = readdirSync(directoryPath, { withFileTypes: true })
      const files: Array<{ name: string; path: string; isDirectory: boolean; size?: number }> = []

      for (const entry of entries) {
        // Skip hidden files
        if (entry.name.startsWith('.')) {
          continue
        }

        const fullPath = join(directoryPath, entry.name)
        try {
          const itemStats = statSync(fullPath)
          files.push({
            name: entry.name,
            path: fullPath,
            isDirectory: entry.isDirectory(),
            size: entry.isFile() ? itemStats.size : undefined
          })
        } catch (err) {
          console.error(`Error reading ${entry.name}:`, err)
        }
      }

      // Sort: directories first, then files, both alphabetically
      files.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1
        if (!a.isDirectory && b.isDirectory) return 1
        return a.name.localeCompare(b.name)
      })

      console.log(`Found ${files.length} items in ${directoryPath}`)
      return { success: true, files, error: null }
    } catch (error) {
      console.error('Error listing files:', error)
      return { success: false, error: (error as Error).message, files: [] }
    }
  })

  // IPC handler for getting external devices (USB drives, external hard drives)
  ipcMain.handle('device:getExternalDevices', async () => {
    try {
      const devices: Array<{ name: string; path: string; size?: string }> = []

      if (process.platform === 'darwin') {
        // macOS: Check /Volumes directory
        const volumesPath = '/Volumes'
        console.log('Scanning volumes in:', volumesPath)
        const volumes = readdirSync(volumesPath)
        console.log('Found volumes:', volumes)

        for (const volume of volumes) {
          // Skip Macintosh HD, hidden volumes, and symbolic links
          if (volume === 'Macintosh HD' || volume.startsWith('.')) {
            console.log(`Skipping system volume: ${volume}`)
            continue
          }

          const volumePath = join(volumesPath, volume)
          console.log(`Checking volume: ${volume} at ${volumePath}`)

          try {
            // Use lstatSync to not follow symbolic links
            const stats = lstatSync(volumePath)
            console.log(`Volume ${volume} stats:`, {
              isDirectory: stats.isDirectory(),
              isSymbolicLink: stats.isSymbolicLink()
            })

            // Only include actual directories, not symbolic links
            if (stats.isDirectory() && !stats.isSymbolicLink()) {
              devices.push({
                name: volume,
                path: volumePath
              })
              console.log(`Added device: ${volume}`)
            } else {
              console.log(
                `Skipped ${volume}: symlink=${stats.isSymbolicLink()}, dir=${stats.isDirectory()}`
              )
            }
          } catch (err) {
            console.error(`Error checking volume ${volume}:`, err)
          }
        }
      } else if (process.platform === 'linux') {
        // Linux: Check multiple possible mount points for external devices
        const username = process.env.USER || process.env.USERNAME || ''
        const mediaPaths = [
          `/media/${username}`, // Ubuntu default
          '/media', // Generic media
          `/run/media/${username}`, // Fedora, RHEL
          '/mnt' // Manual mounts
        ]

        console.log('Checking Linux mount points:', mediaPaths)

        for (const mediaPath of mediaPaths) {
          if (!existsSync(mediaPath)) {
            console.log(`Path does not exist: ${mediaPath}`)
            continue
          }

          try {
            console.log(`Scanning: ${mediaPath}`)
            const entries = readdirSync(mediaPath)
            console.log(`Found entries in ${mediaPath}:`, entries)

            for (const entry of entries) {
              const fullPath = join(mediaPath, entry)

              try {
                // Use lstatSync to not follow symbolic links initially
                const stats = lstatSync(fullPath)

                // Skip symbolic links and hidden directories
                if (stats.isSymbolicLink() || entry.startsWith('.')) {
                  console.log(`Skipping ${entry}: symlink or hidden`)
                  continue
                }

                // Check if it's a directory and accessible
                if (stats.isDirectory()) {
                  // Try to read the directory to verify it's accessible (mounted)
                  try {
                    readdirSync(fullPath)
                    devices.push({
                      name: entry,
                      path: fullPath
                    })
                    console.log(`Added device: ${entry} at ${fullPath}`)
                  } catch (readErr) {
                    console.log(`Cannot read ${entry}, likely not mounted:`, readErr)
                  }
                }
              } catch (err) {
                console.error(`Error checking entry ${entry}:`, err)
              }
            }
          } catch (err) {
            console.error(`Error reading ${mediaPath}:`, err)
          }
        }
      }

      return { success: true, devices }
    } catch (error) {
      console.error('Error getting external devices:', error)
      return { success: false, devices: [], error: (error as Error).message }
    }
  })

  // IPC handler for copying file to device with progress
  ipcMain.handle('file:copyToDevice', async (event, sourceFile: string, targetDevice: string) => {
    try {
      console.log(`Copying file from ${sourceFile} to device ${targetDevice}`)

      // Check if source file exists
      if (!existsSync(sourceFile)) {
        return {
          success: false,
          error: `Source file does not exist: ${sourceFile}`
        }
      }

      // Check if target device exists
      if (!existsSync(targetDevice)) {
        return {
          success: false,
          error: `Target device does not exist: ${targetDevice}`
        }
      }

      // Get the filename from the source path
      const fileName = basename(sourceFile)
      const targetPath = join(targetDevice, fileName)

      console.log(`Target path: ${targetPath}`)

      // Get file size
      const stats = statSync(sourceFile)
      const fileSize = stats.size
      let copiedBytes = 0

      console.log(`File size: ${fileSize} bytes`)

      // Create streams for copying with progress
      const readStream = createReadStream(sourceFile)
      const writeStream = createWriteStream(targetPath)

      return new Promise((resolve) => {
        readStream.on('data', (chunk) => {
          copiedBytes += chunk.length
          const progress = Math.round((copiedBytes / fileSize) * 100)
          // Send progress update to renderer
          event.sender.send('file:copyProgress', progress)
          console.log(`Progress: ${progress}%`)
        })

        readStream.on('error', (error) => {
          console.error('Error reading file:', error)
          writeStream.close()
          resolve({
            success: false,
            error: `Error reading file: ${error.message}`
          })
        })

        writeStream.on('error', (error) => {
          console.error('Error writing file:', error)
          readStream.close()
          resolve({
            success: false,
            error: `Error writing file: ${error.message}`
          })
        })

        writeStream.on('finish', () => {
          console.log(`File copied successfully to ${targetPath}`)
          event.sender.send('file:copyProgress', 100)
          resolve({
            success: true,
            targetPath: targetPath
          })
        })

        readStream.pipe(writeStream)
      })
    } catch (error) {
      console.error('Error copying file:', error)
      return {
        success: false,
        error: (error as Error).message
      }
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed
app.on('window-all-closed', () => {
  app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
