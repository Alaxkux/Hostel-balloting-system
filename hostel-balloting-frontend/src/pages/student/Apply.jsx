import { useState, useEffect } from 'react'
import apiRequest from '../../lib/api'

function Apply() {
  const student = JSON.parse(sessionStorage.getItem('student'))

  const [hostels, setHostels] = useState([])
  const [activeBallotRound, setActiveBallotRound] = useState(null)
  const [choice1, setChoice1] = useState('')
  const [choice2, setChoice2] = useState('')
  const [choice3, setChoice3] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const hostelData = await apiRequest('/hostels')
        setHostels(hostelData)

        const rounds = await apiRequest('/ballot-rounds')
        const openRound = rounds.find((r) => r.status === 'open')
        setActiveBallotRound(openRound || null)
      } catch (err) {
        setError(err.message)
      }
    }

    loadData()
  }, [])

  const maleHostels = hostels.filter((h) => h.gender === 'male')
  const femaleHostels = hostels.filter((h) => h.gender === 'female')
  const mixedHostels = hostels.filter((h) => h.gender === 'mixed')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!confirmed) {
      setError('Please confirm the checkbox before submitting.')
      return
    }

    if (!activeBallotRound) {
      setError('There is no open ballot round to apply for right now.')
      return
    }

    const hostelChoices = [choice1, choice2, choice3].filter(Boolean)

    if (hostelChoices.length === 0) {
      setError('Please select at least one hostel choice.')
      return
    }

    setLoading(true)

    try {
      await apiRequest('/applications', {
        method: 'POST',
        body: JSON.stringify({
          ballot_round_id: activeBallotRound.id,
          hostel_choices: hostelChoices,
        }),
      })

      setSuccess('Application submitted successfully!')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Top row — title + matric/level */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Apply for Hostel</h1>
          <p className="text-gray-500 text-sm mt-1">
            You can select up to 3 hostel choices. You will be assigned 1 hostel
            based on the ballot result.
          </p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>Matric: {student.matric_no}</p>
          <p>Level: {student.level}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-2.5 rounded-lg mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-700 text-sm px-4 py-2.5 rounded-lg mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left — hostel choices form */}
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <p className="font-semibold text-gray-900 mb-4">Hostel Choices</p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">1st Choice</label>
              <select
                value={choice1}
                onChange={(e) => setChoice1(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-500"
              >
                <option value="">Select Hostel</option>
                {hostels.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">2nd Choice</label>
              <select
                value={choice2}
                onChange={(e) => setChoice2(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-500"
              >
                <option value="">Select Hostel</option>
                {hostels.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">3rd Choice</label>
              <select
                value={choice3}
                onChange={(e) => setChoice3(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-500"
              >
                <option value="">Select Hostel</option>
                {hostels.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>

            <label className="flex items-start gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 rounded"
              />
              I confirm that the information provided is correct and I understand
              that I cannot change my choices after submission.
            </label>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-950 text-white font-semibold px-6 py-2.5 rounded-lg text-sm disabled:opacity-60"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>

        {/* Right — hostel list */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-xl">
          <p className="font-semibold text-gray-900 mb-5">Hostel List</p>

          <p className="text-base font-medium text-gray-700 mb-2">Male Hostels</p>
          <ul className="text-sm text-gray-500 space-y-2 mb-5">
            {maleHostels.map((h) => (
              <li key={h.id}>{h.name}</li>
            ))}
          </ul>

          <p className="text-base font-medium text-gray-700 mb-2">Female Hostels</p>
          <ul className="text-sm text-gray-500 space-y-2 mb-5">
            {femaleHostels.map((h) => (
              <li key={h.id}>{h.name}</li>
            ))}
          </ul>

          <p className="text-base font-medium text-gray-700 mb-2">Mixed Hostels</p>
          <ul className="text-sm text-gray-500 space-y-2">
            {mixedHostels.map((h) => (
              <li key={h.id}>{h.name}</li>
            ))}
          </ul>
          
        </div>
      </div>
    </div>
  )
}

export default Apply