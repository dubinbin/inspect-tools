import { useState } from 'react'

interface FileItem {
  name: string
  path: string
  isDirectory: boolean
  size?: number
}

export default function ChooseFileDialog(): React.JSX.Element {
  const [filePath, setFilePath] = useState<string>(localStorage.getItem('taskFile') || '')
  const [currentPath, setCurrentPath] = useState<string>('')
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [selectedFile, setSelectedFile] = useState<string>('')

  const openDialog = (): void => {
    const taskPath = localStorage.getItem('taskPath')
    if (!taskPath) {
      alert('task path is not set. Please set the task path first!')
      return
    }
    setCurrentPath(taskPath)
    setSelectedFile('')
    loadFiles(taskPath)
    // @ts-ignore: Unreachable code error
    document.getElementById('my_modal_2')?.showModal()
  }

  const loadFiles = async (directoryPath: string): Promise<void> => {
    setLoading(true)
    try {
      const result = await window.api.listFiles(directoryPath)
      if (result.success) {
        setFiles(result.files)
      } else {
        alert(`Error loading files: ${result.error}`)
        setFiles([])
      }
    } catch (error) {
      console.error('Error loading files:', error)
      alert('Failed to load files')
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  const handleItemClick = (item: FileItem): void => {
    if (item.isDirectory) {
      // Navigate into directory
      setCurrentPath(item.path)
      setSelectedFile('')
      loadFiles(item.path)
    } else {
      // Select file
      setSelectedFile(item.path)
    }
  }

  const handleGoUp = (): void => {
    const taskPath = localStorage.getItem('taskPath')
    if (!taskPath) return

    // Prevent going above task path
    if (currentPath === taskPath) {
      return
    }

    const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'))
    if (parentPath.startsWith(taskPath)) {
      setCurrentPath(parentPath)
      setSelectedFile('')
      loadFiles(parentPath)
    }
  }

  const handleConfirm = async (): Promise<void> => {
    if (!selectedFile) {
      alert('Please select a file')
      return
    }
    setFilePath(selectedFile)
    localStorage.setItem('taskFile', selectedFile)
    // @ts-ignore: Unreachable code error
    document.getElementById('my_modal_2')?.close()
    alert('Task file set successfully!')
  }

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  return (
    <div className="relative">
      <button
        className="btn btn-base bg-white text-blue-500 w-full py-2 rounded shadow-md"
        onClick={openDialog}
      >
        CHOOSE FILE
      </button>

      <dialog id="my_modal_2" className="modal">
        <div className="modal-box max-w-3xl">
          <form method="dialog">
            <button className="btn btn-base btn-circle btn-ghost absolute right-2 top-2">✕</button>

            <h3 className="font-bold text-lg mb-4">Choose File</h3>

            {/* Current Path Display */}
            <div className="bg-gray-100 border border-gray-300 rounded p-2 mb-2 flex items-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-circle"
                onClick={handleGoUp}
                disabled={currentPath === localStorage.getItem('taskPath')}
              >
                ⬆️
              </button>
              <span className="text-sm font-mono text-gray-700 flex-1 truncate">{currentPath}</span>
            </div>

            {/* File List */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading files...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No files or folders found</p>
              </div>
            ) : (
              <div className="border border-gray-300 rounded max-h-96 overflow-y-auto bg-white">
                {files.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                      selectedFile === item.path ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleItemClick(item)}
                    onDoubleClick={() => {
                      if (item.isDirectory) {
                        handleItemClick(item)
                      }
                    }}
                  >
                    <div className="text-2xl">{item.isDirectory ? '📁' : '📄'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{item.name}</div>
                      {!item.isDirectory && item.size !== undefined && (
                        <div className="text-xs text-gray-500">{formatFileSize(item.size)}</div>
                      )}
                    </div>
                    {selectedFile === item.path && !item.isDirectory && (
                      <div className="text-blue-500">✓</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Selected File Display */}
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded p-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">Selected File:</p>
              <p className="text-sm text-gray-800 break-all font-mono">
                {selectedFile || 'No file selected'}
              </p>
            </div>

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-base bg-blue-500 text-white w-full py-2 rounded shadow-md"
                onClick={(e) => {
                  e.preventDefault()
                  handleConfirm()
                }}
                disabled={!selectedFile}
              >
                CONFIRM
              </button>
            </div>
          </form>
        </div>
      </dialog>
      {filePath ? (
        <p className="text-sm text-white mt-4 absolute left-0 w-full wrap-break-word whitespace-normal">
          File: {filePath}
        </p>
      ) : null}
    </div>
  )
}
