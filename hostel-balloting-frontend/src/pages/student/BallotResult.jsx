import { useState, useEffect } from 'react'
import apiRequest from '../../lib/api'

function BallotResult() {
  const student = JSON.parse(sessionStorage.getItem('student'))
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadResult() {
      try {
        const data = await apiRequest('/students/my-result')
        setResult(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadResult()
  }, [])

  return (
    <div>
      {/* Top row — title + matric/level */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Ballot Result</h1>
          <p className="text-gray-500 text-sm mt-1">
            Check your hostel allocation result for the current session.
          </p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>Matric: {student.matric_no}</p>
          <p>Level: {student.level}</p>
        </div>
      </div>

      {loading && (
        <p className="text-gray-500 text-sm">Loading your result...</p>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-2.5 rounded-lg mb-4 max-w-md">
          {error}
        </div>
      )}

      {!loading && !error && result?.message && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-gray-500 text-sm">
          {result.message}
        </div>
      )}

      {!loading && !error && result?.hostel_name && (
        <div>
          {/* Allocated hostel card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">
                ✔
              </div>
              <div>
                <p className="text-gray-500 text-sm">Your Allocated Hostel</p>
                <p className="text-lg font-bold text-gray-900">{result.hostel_name}</p>
                <p className="text-gray-500 text-sm">Room: {result.room_number || 'Not yet assigned'}</p>
              </div>
            </div>
          </div>

          {/* Ballot details card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="font-semibold text-gray-900 mb-4">Ballot Details</p>

            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Ballot Round</span>
              <span className="text-gray-900 font-medium">{result.academic_session}</span>
            </div>
            <div className="flex justify-between text-sm mb-4">
              <span className="text-gray-500">Date Conducted</span>
              <span className="text-gray-900 font-medium">
                {result.ballot_date ? new Date(result.ballot_date).toLocaleDateString() : 'N/A'}
              </span>
            </div>

            <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full mb-4 ${
              result.result_status === 'successful' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {result.result_status === 'successful' ? 'Successful' : 'Unsuccessful'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default BallotResult