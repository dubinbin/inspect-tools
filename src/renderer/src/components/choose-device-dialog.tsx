import { useEffect, useState } from 'react'

interface Device {
  name: string
  path: string
  size?: string
}

export default function ChooseDeviceDialog(): React.JSX.Element {
  const [devices, setDevices] = useState<Device[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>(
    localStorage.getItem('selectedDevice') || ''
  )
  const [loading, setLoading] = useState<boolean>(false)

  const openDialog = (): void => {
    // @ts-ignore: Unreachable code error
    document.getElementById('my_modal_3')?.showModal()
  }

  const handleSelectDevice = async (): Promise<void> => {
    if (!selectedDevice) {
      alert('Please select a device first!')
      return
    }
    localStorage.setItem('selectedDevice', selectedDevice)
    // @ts-ignore: Unreachable code error
    document.getElementById('my_modal_3')?.close()
    setSelectedDevice(selectedDevice)
    alert(`Device selected: ${selectedDevice}`)
  }

  useEffect(() => {
    searchDevices()
  }, [])

  const searchDevices = async (): Promise<void> => {
    setLoading(true)
    try {
      console.log('Searching for external devices...')
      const result = await window.api.getExternalDevices()
      console.log('Device search result:', result)

      if (result.success) {
        setDevices(result.devices)
        console.log(`Found ${result.devices.length} device(s)`)
        if (result.devices.length === 0) {
          console.log('No external devices found')
        } else {
          result.devices.forEach((device, index) => {
            console.log(`Device ${index + 1}: ${device.name} at ${device.path}`)
          })
        }
      } else {
        console.error('Error getting devices:', result.error)
        alert(`Error getting devices: ${result.error}`)
      }
    } catch (error) {
      console.error('Error searching devices:', error)
      alert('Failed to search for devices')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        className="btn btn-base bg-blue-500 text-white w-full py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-sm"
        onClick={openDialog}
      >
        Select Device
      </button>

      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-base btn-circle btn-ghost absolute right-2 top-2">✕</button>

            <h3 className="font-bold text-lg">Choose DEVICE</h3>
            <p className="py-4">Please choose the device to transfer the task file.</p>
            <div className="flex flex-row gap-2 mb-4">
              <button
                className="btn btn-sm bg-blue-500 text-white"
                onClick={(e) => {
                  e.preventDefault()
                  searchDevices()
                }}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Refresh Devices'}
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Searching for devices...</p>
              </div>
            ) : devices.length === 0 ? (
              <div className="text-center py-8 bg-gray-100 rounded-lg">
                <p className="text-gray-500">No external devices found</p>
                <p className="text-sm text-gray-400 mt-2">
                  Please connect a USB drive or external hard drive
                </p>
              </div>
            ) : (
              <ul className="list bg-base-100 rounded-box shadow-md max-h-96 overflow-y-auto">
                {devices.map((device, index) => (
                  <li
                    key={index}
                    className={`list-row cursor-pointer hover:bg-gray-50 ${selectedDevice === device.path ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedDevice(device.path)}
                  >
                    <div>
                      <svg
                        className="icon"
                        viewBox="0 0 1024 1024"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                      >
                        <path
                          d="M728.7 725.8m-33.9 0a33.9 33.9 0 1 0 67.8 0 33.9 33.9 0 1 0-67.8 0Z"
                          fill="#B4E7FC"
                        ></path>
                        <path
                          d="M729.4 785c-34.1 0-60.7-25.9-60.7-59.3 0-33.3 26.5-59.3 60.7-59.3 34.1 0 60.7 25.9 60.7 59.3-0.1 33.4-26.6 59.3-60.7 59.3z m-182-14.8c0 7.4-7.6 14.8-15.2 14.8s-15.2-7.4-15.2-14.8v-88.9c0-7.4 7.6-14.8 15.2-14.8s15.2 7.4 15.2 14.8v88.9z m-60.7 0c0 7.4-7.6 14.8-15.2 14.8s-15.2-7.4-15.2-14.8v-88.9c0-7.4 7.6-14.8 15.2-14.8s15.2 7.4 15.2 14.8v88.9z m-60.7 0c0 7.4-7.6 14.8-15.2 14.8s-15.2-7.4-15.2-14.8v-88.9c0-7.4 7.6-14.8 15.2-14.8s15.2 7.4 15.2 14.8v88.9z m-60.6 0c0 7.4-7.6 14.8-15.2 14.8s-15.2-7.4-15.2-14.8v-88.9c0-7.4 7.6-14.8 15.2-14.8s15.2 7.4 15.2 14.8v88.9z m-60.7 0c0 7.4-7.6 14.8-15.2 14.8s-15.2-7.4-15.2-14.8v-88.9c0-7.4 7.6-14.8 15.2-14.8s15.2 7.4 15.2 14.8v88.9z m-60.7 0c0 7.4-7.6 14.8-15.2 14.8s-15.2-7.4-15.2-14.8v-88.9c0-7.4 7.6-14.8 15.2-14.8s15.2 7.4 15.2 14.8v88.9zM881 648c0-22.2-15.2-37-37.9-40.7H190.9c-19 3.7-34.1 18.5-37.9 40.7V799.8c0 22.2 22.8 44.4 45.5 44.4h637c26.5 0 45.5-22.2 45.5-44.4V651.7 648z"
                          fill="#B4E7FC"
                        ></path>
                        <path
                          d="M339.2 387.1a177.8 101.6 0 1 0 355.6 0 177.8 101.6 0 1 0-355.6 0Z"
                          fill="#B4E7FC"
                        ></path>
                        <path
                          d="M517 253.1c119.4 0 209 59.9 209 134.9s-89.6 134.9-209 134.9c-115.7 0-209-59.9-209-134.9s93.3-134.9 209-134.9zM199.8 582.8h645.6c7.5 3.7 14.9 3.7 18.7 7.5l-70.9-415.9c-7.5-22.5-29.9-41.2-52.2-41.2H293.2c-22.4 0-44.8 18.7-48.5 41.2L170 590.3c7.5-3.7 11.2-3.7 18.7-7.5h11.1z"
                          fill="#B4E7FC"
                        ></path>
                      </svg>
                    </div>
                    <div>
                      <div className="mb-1">{device.name}</div>
                      <div className="text-xs uppercase font-semibold opacity-60">
                        {device.path}
                      </div>
                    </div>
                    {selectedDevice === device.path && (
                      <div className="ml-auto">
                        <svg
                          className="icon"
                          viewBox="0 0 1024 1024"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                        >
                          <path
                            d="M887.904744 298.20852c-12.863647-12.063755-33.151673-11.487488-45.215428 1.408843L415.935493 753.983819 182.815858 524.287381c-12.607338-12.416396-32.8644-12.287381-45.280796 0.319957-12.416396 12.576374-12.256417 32.8644 0.352641 45.248112l256.479935 252.671415c0.096331 0.096331 0.223626 0.127295 0.319957 0.223626s0.127295 0.223626 0.223626 0.319957c2.016073 1.919742 4.448434 3.008628 6.784464 4.288456 1.152533 0.672598 2.143368 1.663432 3.359548 2.143368 3.775837 1.47249 7.775299 2.239699 11.743798 2.239699 4.192125 0 8.384249-0.832576 12.287381-2.496009 1.312512-0.543583 2.33603-1.663432 3.552211-2.368714 2.399677-1.408843 4.895686-2.59234 6.944443-4.67206 0.096331-0.096331 0.127295-0.25631 0.223626-0.352641 0.063647-0.096331 0.192662-0.127295 0.287273-0.223626L889.277463 343.420508C901.439269 330.591265 900.768391 310.335923 887.904744 298.20852z"
                            fill="#3B82F6"
                          ></path>
                        </svg>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <div className="modal-action">
              <button
                className="btn btn-base bg-blue-500 text-white w-full py-2 rounded shadow-md"
                onClick={(e) => {
                  e.preventDefault()
                  handleSelectDevice()
                }}
              >
                SELECT DEVICE
              </button>
            </div>
          </form>
        </div>
      </dialog>
      {selectedDevice ? (
        <p className="text-xs text-gray-600 mt-3 break-all">
          {selectedDevice.split('/').pop()}
        </p>
      ) : null}
    </div>
  )
}
