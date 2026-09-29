import { useState, useEffect } from 'react'
import apiRequest from '../../lib/api'

function BallotManagement() {
  const [rounds, setRounds] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const [session, setSession] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [notifyStudents, setNotifyStudents] = useState(false)
  const [activateNow, setActivateNow] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const statusStyle = {
    open: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-600',
    upcoming: 'bg-yellow-100 text-yellow-700',
  }

  const loadRounds = async () => {
    try {
      const data = await apiRequest('/ballot-rounds')
      setRounds(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRounds()
  }, [])

  const resetForm = () => {
    setSession('')
    setStartDate('')
    setEndDate('')
    setNotifyStudents(false)
    setActivateNow(false)
    setFormError('')
  }

  const handleCreateRound = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!session || !startDate || !endDate) {
      setFormError('Session, start date, and end date are all required.')
      return
    }

    setSaving(true)

    try {
      await apiRequest('/ballot-rounds', {
        method: 'POST',
        body: JSON.stringify({
          academic_session: session,
          application_start: startDate,
          application_end: endDate,
          status: activateNow ? 'open' : 'upcoming',
        }),
      })

      setShowModal(false)
      resetForm()
      loadRounds()
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
          <h1 className="text-xl font-bold text-gray-900">Ballot Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage ballot rounds.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-950 text-white text-sm font-medium px-4 py-2 rounded-lg self-start sm:self-auto"
        >
          + Create New Round
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-2.5 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {loading && <p className="text-gray-500 text-sm">Loading ballot rounds...</p>}
        {!loading && rounds.length === 0 && (
          <p className="text-gray-500 text-sm">No ballot rounds created yet.</p>
        )}

        {!loading && rounds.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-medium">Session</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Start Date</th>
                  <th className="pb-2 font-medium">End Date</th>
                  <th className="pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rounds.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 text-gray-900">{r.academic_session}</td>
                    <td className="py-2.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle[r.status] || 'bg-gray-100 text-gray-600'}`}>
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-2.5 text-gray-500">
                      {new Date(r.application_start).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 text-gray-500">
                      {new Date(r.application_end).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 text-gray-400">⋮</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal overlay — only renders when showModal is true */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-900">Create New Ballot Round</p>
              <button onClick={() => { setShowModal(false); resetForm() }} className="text-gray-400">✕</button>
            </div>

            {formError && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-2.5 rounded-lg mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateRound}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
                  <input
                    type="text"
                    placeholder="e.g. 2025/2026"
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-400">
                  <input
                    type="checkbox"
                    checked={notifyStudents}
                    onChange={(e) => setNotifyStudents(e.target.checked)}
                    disabled
                    className="rounded"
                  />
                  Notify all students (coming soon)
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={activateNow}
                    onChange={(e) => setActivateNow(e.target.checked)}
                    className="rounded"
                  />
                  Make this round active immediately
                </label>
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
                  {saving ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default BallotManagement