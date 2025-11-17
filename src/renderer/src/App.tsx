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
    <div className="flex flex-col w-full h-screen">
      <div className="header p-8 bg-white shadow-sm flex items-center gap-2 w-full">
        <svg
          className="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
        >
          <path
            d="M481.901714 192a43.995429 43.995429 0 0 1 41.106286 28.196571l22.966857 59.830858h274.285714a43.995429 43.995429 0 0 1 43.995429 44.032V808.228571a44.032 44.032 0 0 1-44.032 43.995429H203.995429A44.032 44.032 0 0 1 160.036571 808.228571V236.032A44.032 44.032 0 0 1 204.032 192h277.869714z m129.536 289.170286a21.979429 21.979429 0 0 0-28.525714 32.621714l2.779429 2.852571 56.539428 49.481143H305.517714l-3.949714 0.365715a22.016 22.016 0 0 0 3.949714 43.666285h336.64l-56.539428 49.444572-2.779429 2.889143a22.016 22.016 0 0 0-1.609143 24.941714l2.340572 3.218286 2.852571 2.779428a22.016 22.016 0 0 0 24.941714 1.609143l3.218286-2.304 100.644572-88.027429 2.925714-3.145142a21.979429 21.979429 0 0 0 0-26.843429l-2.925714-3.145143-100.644572-88.027428-3.145143-2.377143z"
            fill="#1296db"
          ></path>
        </svg>
        <h1 className="text-3xl font-bold text-black">Inspect Data transfer Tools</h1>
      </div>

      <div className="main-content bg-blue-400 h-full p-12 w-full">
        <div className="flex flex-row justify-evenly w-full">
          <div className="flex flex-col items-center justify-center w-[25%]">
            <p className="text-sm text-white">SET TASK PATH</p>
            <div className="mt-2 w-full">
              <ChoosePathDialog />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center w-[25%]">
            <p className="text-sm text-white">Choose Task File</p>
            <div className="mt-2 w-full ">
              <ChooseFileDialog />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center w-[40%]">
            <p className="text-sm text-white">Choose Device</p>
            <div className="mt-2 w-full">
              <ChooseDeviceDialog />
            </div>
          </div>
        </div>
      </div>

      <div className="footer p-8 bg-white shadow-sm flex flex-col gap-4 w-full">
        {isTransferring && (
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-blue-600">Transferring file...</span>
              <span className="text-sm font-medium text-blue-600">{transferProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-300 ease-out flex items-center justify-center"
                style={{ width: `${transferProgress}%` }}
              >
                {transferProgress > 10 && (
                  <span className="text-xs text-white font-semibold">{transferProgress}%</span>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 w-full justify-between">
          <button
            className="text-xl text-blue-500 cursor-pointer hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={clearAll}
            disabled={isTransferring}
          >
            Clear
          </button>
          <button
            className="text-xl text-blue-500 cursor-pointer hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleNext}
            disabled={isTransferring}
          >
            {isTransferring ? 'Transferring...' : 'TRANSFER FILE'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
