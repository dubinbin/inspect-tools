import { useState, useEffect } from 'react'
import ChooseDeviceDialog from './components/choose-device-dialog'
import ChooseFileDialog from './components/choose-file-dialog'
import ChoosePathDialog from './components/choose-path-dialog'

function App(): React.JSX.Element {
  const [isTransferring, setIsTransferring] = useState(false)
  const [transferProgress, setTransferProgress] = useState(0)

  useEffect(() => {
    // Setup progress listener
    window.api.onCopyProgress((progress) => {
      setTransferProgress(progress)
    })

    // Cleanup on unmount
    return () => {
      window.api.removeCopyProgressListener()
    }
  }, [])

  const handleNext = async (): Promise<void> => {
    const taskPath = localStorage.getItem('taskPath')
    const taskFile = localStorage.getItem('taskFile')
    const selectedDevice = localStorage.getItem('selectedDevice')

    if (!taskPath || !taskFile || !selectedDevice) {
      alert('Task path, task file or device is not set. Please complete all selections first!')
      return
    }

    console.log('Starting file transfer...')
    console.log('Source file:', taskFile)
    console.log('Target device:', selectedDevice)

    setIsTransferring(true)
    setTransferProgress(0)

    try {
      const result = await window.api.copyFileToDevice(taskFile, selectedDevice)

      if (result.success) {
        alert(`File copied successfully to:\n${result.targetPath}`)
        console.log('File copied successfully to:', result.targetPath)
      } else {
        alert(`Failed to copy file:\n${result.error}`)
        console.error('Failed to copy file:', result.error)
      }
    } catch (error) {
      console.error('Error during file transfer:', error)
      alert('An error occurred during file transfer')
    } finally {
      setIsTransferring(false)
      setTransferProgress(0)
    }
  }

  const clearAll = (): void => {
    localStorage.clear()
    window.location.reload()
  }

  return (
    <div className="flex flex-col w-full h-screen bg-white">
      {/* Custom Title Bar */}
      <div
        className="titlebar bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-between px-4 py-2 select-none"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="flex items-center gap-3">
          <svg
            className="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
          >
            <path
              d="M481.901714 192a43.995429 43.995429 0 0 1 41.106286 28.196571l22.966857 59.830858h274.285714a43.995429 43.995429 0 0 1 43.995429 44.032V808.228571a44.032 44.032 0 0 1-44.032 43.995429H203.995429A44.032 44.032 0 0 1 160.036571 808.228571V236.032A44.032 44.032 0 0 1 204.032 192h277.869714z m129.536 289.170286a21.979429 21.979429 0 0 0-28.525714 32.621714l2.779429 2.852571 56.539428 49.481143H305.517714l-3.949714 0.365715a22.016 22.016 0 0 0 3.949714 43.666285h336.64l-56.539428 49.444572-2.779429 2.889143a22.016 22.016 0 0 0-1.609143 24.941714l2.340572 3.218286 2.852571 2.779428a22.016 22.016 0 0 0 24.941714 1.609143l3.218286-2.304 100.644572-88.027429 2.925714-3.145142a21.979429 21.979429 0 0 0 0-26.843429l-2.925714-3.145143-100.644572-88.027428-3.145143-2.377143z"
              fill="white"
            ></path>
          </svg>
          <h1 className="text-lg font-semibold">Inspect Data Transfer Tools</h1>
        </div>
        <div
          className="flex items-center gap-1"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            onClick={() => window.api.minimizeWindow()}
            className="hover:bg-blue-700 rounded p-2 transition-colors"
            title="Minimize"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="4" y="8" width="8" height="1" fill="currentColor" />
            </svg>
          </button>
          <button
            onClick={() => window.api.closeWindow()}
            className="hover:bg-red-600 rounded p-2 transition-colors"
            title="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 4L12 12M12 4L4 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Header */}
      <div className="header p-6 bg-white border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Data Transfer Workflow</h2>
        <p className="text-sm text-gray-500 mt-1">
          Select task path, choose file, and transfer to device
        </p>
      </div>

      {/* Main Content */}
      <div className="main-content bg-gray-50 h-full p-12 w-full overflow-auto">
        <div className="flex flex-row justify-center gap-6 w-full max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center flex-1 bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="text-3xl mb-2">📁</div>
            <p className="text-sm font-semibold text-gray-700 mb-4">SET TASK PATH</p>
            <div className="w-full">
              <ChoosePathDialog />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center flex-1 bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="text-3xl mb-2">📄</div>
            <p className="text-sm font-semibold text-gray-700 mb-4">CHOOSE TASK FILE</p>
            <div className="w-full">
              <ChooseFileDialog />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center flex-1 bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="text-3xl mb-2">💾</div>
            <p className="text-sm font-semibold text-gray-700 mb-4">CHOOSE DEVICE</p>
            <div className="w-full">
              <ChooseDeviceDialog />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer p-6 bg-white border-t border-gray-200 flex flex-col gap-4 w-full">
        {isTransferring && (
          <div className="w-full max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-blue-600">Transferring file...</span>
              <span className="text-sm font-medium text-blue-600">{transferProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300 ease-out flex items-center justify-center"
                style={{ width: `${transferProgress}%` }}
              >
                {transferProgress > 15 && (
                  <span className="text-xs text-white font-semibold">{transferProgress}%</span>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-4 w-full max-w-6xl mx-auto justify-between">
          <button
            className="px-6 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            onClick={clearAll}
            disabled={isTransferring}
          >
            🗑️ Clear All
          </button>
          <button
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
            onClick={handleNext}
            disabled={isTransferring}
          >
            {isTransferring ? '⏳ Transferring...' : '🚀 TRANSFER FILE'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
