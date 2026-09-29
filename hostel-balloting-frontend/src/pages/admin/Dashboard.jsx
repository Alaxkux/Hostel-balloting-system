import { useState, useEffect } from 'react'
import apiRequest from '../../lib/api'
import SystemMessageModal from '../../components/SystemMessageModal'

function Dashboard() {
  const [showMessage, setShowMessage] = useState(
    !sessionStorage.getItem('hasSeenSystemMessage')
  )
  const [stats, setStats] = useState(null)
  const [applications, setApplications] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsData, applicationsData] = await Promise.all([
          apiRequest('/dashboard/admin-stats'),
          apiRequest('/applications'),
        ])

        setStats(statsData)
        setApplications(applicationsData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const handleCloseMessage = () => {
    sessionStorage.setItem('hasSeenSystemMessage', 'true')
    setShowMessage(false)
  }

  const statusStyle = {
    submitted: 'bg-yellow-100 text-yellow-700',
    processed: 'bg-green-100 text-green-700',
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Welcome, Admin</h1>
        <p className="text-gray-500 text-sm mt-1">
          Here's an overview of the hostel balloting system.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-2.5 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
          <p className="text-gray-500 text-sm mb-1">Total Students</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900">
            {loading ? '...' : stats?.total_students}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
          <p className="text-gray-500 text-sm mb-1">Applications</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900">
            {loading ? '...' : stats?.total_applications}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
          <p className="text-gray-500 text-sm mb-1">Ballot Rounds</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900">
            {loading ? '...' : stats?.total_ballot_rounds}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
          <p className="text-gray-500 text-sm mb-1">Hostels</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900">
            {loading ? '...' : stats?.total_hostels}
          </p>
        </div>
      </div>

      {/* Recent applications table */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-gray-900">Recent Applications</p>
          <a href="#" className="text-blue-950 text-sm font-medium">View All →</a>
        </div>

        {loading && <p className="text-gray-500 text-sm">Loading applications...</p>}
        {!loading && applications.length === 0 && (
          <p className="text-gray-500 text-sm">No applications yet.</p>
        )}

        {!loading && applications.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-medium">Matric Number</th>
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Hostel Choice</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.application_id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 text-gray-900">{app.matric_no}</td>
                    <td className="py-2.5 text-gray-900">{app.student_name}</td>
                    <td className="py-2.5 text-gray-500">{app.first_choice_hostel}</td>
                    <td className="py-2.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle[app.status] || 'bg-gray-100 text-gray-600'}`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-2.5 text-gray-500">
                      {new Date(app.application_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showMessage && (
        <SystemMessageModal onClose={handleCloseMessage} />
      )}
    </div>
  )
}

export default Dashboard