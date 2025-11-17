import { useState } from 'react'

export default function ChoosePathDialog(): React.JSX.Element {
  const [path, setPath] = useState<string>(localStorage.getItem('taskPath') || '')

  const openDialog = (): void => {
    // @ts-ignore: Unreachable code error
    document.getElementById('my_modal_1')?.showModal()
  }

  const handleSelectPath = async (): Promise<void> => {
    const result = await window.api.selectDirectory()
    if (!result.canceled && result.path) {
      setPath(result.path)
    }
  }

  const savePath = async (): Promise<void> => {
    localStorage.setItem('taskPath', path)
    // @ts-ignore: Unreachable code error
    document.getElementById('my_modal_1')?.close()
    alert('Task path set successfully!')
  }

  return (
    <div className="relative">
      <button
        className="btn btn-base bg-white text-blue-500 w-full py-2 rounded shadow-md"
        onClick={openDialog}
      >
        SELECT PATH
      </button>

      <dialog id="my_modal_1" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-base btn-circle btn-ghost absolute right-2 top-2">✕</button>

            <h3 className="font-bold text-lg">Choose Path</h3>
            <p className="py-4">Please choose the path or type the path to the task file.</p>
            <div className="flex flex-row gap-2"> </div>

            <button
              className="btn btn-base bg-white text-blue-500 w-full py-2 rounded shadow-md"
              onClick={(e) => {
                e.preventDefault()
                handleSelectPath()
              }}
            >
              SELECT PATH
            </button>

            <div className="h-5"></div>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Type the path here"
              value={path}
              onChange={(e) => setPath(e.target.value)}
            />
            <div className="h-5 mt-3 pl-[0.5px]">
              <p className="text-sm text-gray-400">(Example: /data/task/)</p>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-base bg-blue-500 text-white w-full py-2 rounded shadow-md"
                disabled={!path}
                onClick={(e) => {
                  e.preventDefault()
                  savePath()
                }}
              >
                SELECT PATH
              </button>
            </div>
          </form>
        </div>
      </dialog>
      {path ? (
        <p className="text-sm text-white mt-4 absolute left-0 w-full wrap-break-word whitespace-normal">
          Path: {path}
        </p>
      ) : null}
    </div>
  )
}
