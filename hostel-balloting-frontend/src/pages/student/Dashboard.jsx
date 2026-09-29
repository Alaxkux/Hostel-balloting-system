import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiRequest from '../../lib/api'
import SystemMessageModal from '../../components/SystemMessageModal'

function Dashboard() {
  const student = JSON.parse(sessionStorage.getItem('student'))
  const [showMessage, setShowMessage] = useState(
    !sessionStorage.getItem('hasSeenSystemMessage')
  )

  const [applications, setApplications] = useState([])
  const [activeBallotRound, setActiveBallotRound] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [applicationsData, rounds, resultData] = await Promise.all([
          apiRequest('/students/applications/my'),
          apiRequest('/ballot-rounds'),
          apiRequest('/students/my-result'),
        ])

        setApplications(applicationsData)
        setActiveBallotRound(rounds.find((r) => r.status === 'open') || null)
        setResult(resultData)
      } catch (err) {
        console.error('Error loading dashboard data:', err.message)
      }
    }

    loadDashboardData()
  }, [])

  const handleCloseMessage = () => {
    sessionStorage.setItem('hasSeenSystemMessage', 'true')
    setShowMessage(false)
  }

  const applicationStatus = applications.length === 0
    ? 'Not Applied'
    : applications[0].status.charAt(0).toUpperCase() + applications[0].status.slice(1)

  return (
    <div>
      {/* Top row — greeting + matric/level */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <div className="sm:text-right text-sm text-gray-500">
          <p>Matric: {student.matric_no}</p>
          <p>Level: {student.level}</p>
        </div>
      </div>

      <h1 className="text-xl font-semibold text-gray-900 mb-5">
        Good morning, {student.name.split(' ')[0]}
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-gray-500 text-sm mb-1">Application Status</p>
          <p className="text-lg font-bold text-gray-900">{applicationStatus}</p>
          <p className="text-gray-400 text-xs mt-1">
            {applications.length === 0
              ? 'Apply now to be part of the next ballot.'
              : `Applied for ${applications[0].first_choice_hostel} (1st choice)`}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-gray-500 text-sm mb-1">Ballot Round</p>
          <p className="text-lg font-bold text-gray-900">
            {activeBallotRound ? activeBallotRound.academic_session : 'No Active Round'}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            {activeBallotRound ? 'Applications are currently open.' : 'Next round will be announced soon.'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-gray-500 text-sm mb-1">Your Hostel</p>
          <p className="text-lg font-bold text-gray-900">
            {result?.hostel_name || 'Not Assigned'}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            {result?.hostel_name
              ? `Room: ${result.room_number || 'Not yet assigned'}`
              : "You haven't been allocated a hostel yet."}
          </p>
        </div>
      </div>

      {/* Quick Actions + Notice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="font-semibold text-gray-900 mb-5 text-xl">Quick Actions</p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/student/apply"
              className="bg-blue-950 text-white text-sm font-medium px-4 py-2 rounded-lg"
            >
              Apply for Hostel
            </Link>
            <Link
              to="/student/ballot-result"
              className="border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg"
            >
              View Ballot Result
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="font-semibold text-gray-900 mb-2 text-xl">Important Notice</p>
          <p className="text-gray-500 text-sm">
            The hostel balloting system is managed by the University. Do not attempt to
            create a student account or manipulate the process. Be informed, be alert.
          </p>
          <a href="#" className="text-blue-950 text-sm font-medium mt-2 inline-block">
            View more notices →
          </a>
        </div>
      </div>

      {showMessage && (
        <SystemMessageModal onClose={handleCloseMessage} />
      )}
    </div>
  )
}

export default Dashboard