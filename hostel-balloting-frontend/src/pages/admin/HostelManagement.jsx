import { useState, useEffect } from 'react'
import apiRequest from '../../lib/api'

function HostelManagement() {
  const [hostels, setHostels] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const [name, setName] = useState('')
  const [gender, setGender] = useState('male')
  const [capacity, setCapacity] = useState('')
  const [location, setLocation] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const loadHostels = async () => {
    try {
      const data = await apiRequest('/hostels')
      setHostels(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHostels()
  }, [])

  const resetForm = () => {
    setName('')
    setGender('male')
    setCapacity('')
    setLocation('')
    setFormError('')
  }

  const handleAddHostel = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!name || !capacity) {
      setFormError('Hostel name and capacity are required.')
      return
    }

    setSaving(true)

    try {
      await apiRequest('/hostels', {
        method: 'POST',
        body: JSON.stringify({
          name,
          gender,
          capacity: Number(capacity),
          available_slots: Number(capacity),
          location,
          status: 'active',
        }),
      })

      setShowModal(false)
      resetForm()
      loadHostels()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Hostel Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Add, edit and manage hostel information.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-950 text-white text-sm font-medium px-4 py-2 rounded-lg self-start sm:self-auto"
        >
          + Add Hostel
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-2.5 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {loading && <p className="text-gray-500 text-sm">Loading hostels...</p>}
        {!loading && hostels.length === 0 && (
          <p className="text-gray-500 text-sm">No hostels added yet.</p>
        )}

        {!loading && hostels.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-medium">Hostel Name</th>
                  <th className="pb-2 font-medium">Gender</th>
                  <th className="pb-2 font-medium">Capacity</th>
                  <th className="pb-2 font-medium">Occupied</th>
                  <th className="pb-2 font-medium">Available</th>
                  <th className="pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hostels.map((h) => (
                  <tr key={h.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 text-gray-900">{h.name}</td>
                    <td className="py-2.5 text-gray-500 capitalize">{h.gender}</td>
                    <td className="py-2.5 text-gray-500">{h.capacity}</td>
                    <td className="py-2.5 text-gray-500">{h.capacity - h.available_slots}</td>
                    <td className="py-2.5 text-gray-500">{h.available_slots}</td>
                    <td className="py-2.5 text-gray-400">⋮</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Hostel modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-900">Add Hostel</p>
              <button onClick={() => { setShowModal(false); resetForm() }} className="text-gray-400">✕</button>
            </div>

            {formError && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-2.5 rounded-lg mb-4">
                {formError}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleAddHostel}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hostel Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                />
              </div>
              

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location (optional)</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm() }}
                  className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-950 text-white font-medium py-2 rounded-lg text-sm disabled:opacity-60"
                >
                  {saving ? 'Adding...' : 'Add Hostel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default HostelManagement