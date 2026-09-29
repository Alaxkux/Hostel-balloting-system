import { useState, useEffect } from 'react'
import apiRequest from '../../lib/api'

function ResultsManagement() {
  const [rounds, setRounds] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [runningId, setRunningId] = useState(null)
  const [runMessage, setRunMessage] = useState('')

  const [confirmRound, setConfirmRound] = useState(null)

  const [showResultsModal, setShowResultsModal] = useState(false)
  const [modalResults, setModalResults] = useState([])
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')
  const [modalSession, setModalSession] = useState('')
  const [modalPage, setModalPage] = useState(1)

  const resultsPerPage = 5

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

  const handleRunBallot = async () => {
    const roundId = confirmRound.id
    setRunningId(roundId)
    setConfirmRound(null)
    setRunMessage('')
    setError('')

    try {
      const data = await apiRequest(`/ballots/${roundId}/run`, { method: 'POST' })
      setRunMessage(data.message)
      loadRounds()
    } catch (err) {
      setError(err.message)
    } finally {
      setRunningId(null)
    }
  }

  const handleViewResults = async (round) => {
    setModalSession(round.academic_session)
    setModalPage(1)
    setShowResultsModal(true)
    setModalLoading(true)
    setModalError('')

    try {
      const data = await apiRequest(`/ballots/${round.id}/results`)
      setModalResults(data)
    } catch (err) {
      setModalError(err.message)
    } finally {
      setModalLoading(false)
    }
  }

  const modalTotalPages = Math.max(1, Math.ceil(modalResults.length / resultsPerPage))
  const modalStartIndex = (modalPage - 1) * resultsPerPage
  const paginatedModalResults = modalResults.slice(modalStartIndex, modalStartIndex + resultsPerPage)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Results Management</h1>
        <p className="text-gray-500 text-sm mt-1">
          View and manage ballot results.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-2.5 rounded-lg mb-4">
          {error}
        </div>
      )}
      {runMessage && (
        <div className="bg-green-50 text-green-700 text-sm px-4 py-2.5 rounded-lg mb-4">
          {runMessage}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {loading && <p className="text-gray-500 text-sm">Loading ballot rounds...</p>}
        {!loading && rounds.length === 0 && (
          <p className="text-gray-500 text-sm">No ballot rounds found.</p>
        )}

        {!loading && rounds.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-medium">Session</th>
                  <th className="pb-2 font-medium">Ballot Date</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rounds.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 text-gray-900">{r.academic_session}</td>
                    <td className="py-2.5 text-gray-500">
                      {r.ballot_date ? new Date(r.ballot_date).toLocaleDateString() : 'Not set'}
                    </td>
                    <td className="py-2.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle[r.status] || 'bg-gray-100 text-gray-600'}`}>
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmRound(r)}
                          disabled={runningId === r.id}
                          className="bg-blue-950 text-white text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-60"
                        >
                          {runningId === r.id ? 'Running...' : 'Run Ballot'}
                        </button>
                        <button
                          onClick={() => handleViewResults(r)}
                          className="border border-gray-300 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg"
                        >
                          View Results
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Run Ballot modal */}
      {confirmRound && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center">
            <p className="font-semibold text-gray-900 text-lg mb-2">Run Ballot?</p>
            <p className="text-gray-500 text-sm mb-6">
              This will allocate hostels for all submitted applications in the{' '}
              <span className="font-medium text-gray-700">{confirmRound.academic_session}</span> round.
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmRound(null)}
                className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleRunBallot}
                className="flex-1 bg-blue-950 text-white font-medium py-2 rounded-lg text-sm"
              >
                Yes, Run Ballot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Results modal */}
      {showResultsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-900">Results — {modalSession}</p>
              <button onClick={() => setShowResultsModal(false)} className="text-gray-400">✕</button>
            </div>

            {modalLoading && <p className="text-gray-500 text-sm">Loading results...</p>}
            {modalError && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-2.5 rounded-lg">
                {modalError}
              </div>
            )}
            {!modalLoading && !modalError && modalResults.length === 0 && (
              <p className="text-gray-500 text-sm">
                No results yet — this ballot round hasn't been run.
              </p>
            )}

            {!modalLoading && paginatedModalResults.length > 0 && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[450px]">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-100">
                        <th className="pb-2 font-medium">Student</th>
                        <th className="pb-2 font-medium">Hostel</th>
                        <th className="pb-2 font-medium">Room</th>
                        <th className="pb-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedModalResults.map((res, i) => (
                        <tr key={i} className="border-b border-gray-50 last:border-0">
                          <td className="py-2 text-gray-900">{res.student_name}</td>
                          <td className="py-2 text-gray-500">{res.hostel_name}</td>
                          <td className="py-2 text-gray-500">{res.room_number || '—'}</td>
                          <td className="py-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              res.result_status === 'successful' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {res.result_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4 text-sm text-gray-500">
                  <span>
                    Showing {modalStartIndex + 1}-{Math.min(modalStartIndex + resultsPerPage, modalResults.length)} of {modalResults.length}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setModalPage((p) => Math.max(1, p - 1))}
                      disabled={modalPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-40"
                    >
                      ‹
                    </button>
                    <span className="px-3 py-1">
                      Page {modalPage} of {modalTotalPages}
                    </span>
                    <button
                      onClick={() => setModalPage((p) => Math.min(modalTotalPages, p + 1))}
                      disabled={modalPage === modalTotalPages}
                      className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-40"
                    >
                      ›
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ResultsManagement