import { useState } from 'react'

export default function ChooseFileDialog(): React.JSX.Element {
  const [filePath, setFilePath] = useState<string>(localStorage.getItem('taskFile') || '')

  const openDialog = (): void => {
    // @ts-ignore: Unreachable code error
    document.getElementById('my_modal_2')?.showModal()
  }

  const handleSelectFile = async (): Promise<void> => {
    const taskPath = localStorage.getItem('taskPath')
    if (!taskPath) {
      alert('task path is not set. Please set the task path first!')
      return
    }
    const result = await window.api.selectFile(taskPath)
    if (!result.canceled) {
      if (result.error) {
        alert(result.error)
      } else if (result.path) {
        setFilePath(result.path)
      }
    }
  }

  const handleConfirm = async (): Promise<void> => {
    localStorage.setItem('taskFile', filePath)
    // @ts-ignore: Unreachable code error
    document.getElementById('my_modal_2')?.close()
    alert('Task file set successfully!')
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
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-base btn-circle btn-ghost absolute right-2 top-2">✕</button>

            <h3 className="font-bold text-lg">Choose File</h3>
            <p className="py-4">
              Please choose the task file. The file browser will open in the task path.
            </p>

            {localStorage.getItem('taskPath') && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                <p className="text-sm font-semibold text-blue-700">Task Path:</p>
                <p className="text-xs text-blue-600 break-all">
                  {localStorage.getItem('taskPath')}
                </p>
              </div>
            )}

            <button
              className="btn btn-base bg-white text-blue-500 w-full py-2 rounded shadow-md"
              onClick={(e) => {
                e.preventDefault()
                handleSelectFile()
              }}
            >
              SELECT FILE
            </button>

            <div className="h-5"></div>
            <input
              type="text"
              disabled
              className="input input-bordered w-full bg-gray-100"
              placeholder="File path will be filled automatically"
              value={filePath}
            />
            <div className="modal-action">
              <button
                className="btn btn-base bg-blue-500 text-white w-full py-2 rounded shadow-md"
                onClick={(e) => {
                  e.preventDefault()
                  handleConfirm()
                }}
                disabled={!filePath}
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
