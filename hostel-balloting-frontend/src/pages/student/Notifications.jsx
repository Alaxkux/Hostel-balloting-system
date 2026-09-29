import { useState, useEffect } from 'react'
import apiRequest from '../../lib/api'

function Notifications() {
  const [notices, setNotices] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await apiRequest('/notifications/my')
        setNotices(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [])

  const handleMarkAsRead = async (id) => {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' })
      setNotices((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      )
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      {/* Top row — title + matric/level */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-sm mt-1">
            View your system messages and updates.
          </p>
        </div>
      </div>

      {loading && <p className="text-gray-500 text-sm">Loading notifications...</p>}
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-2.5 rounded-lg mb-4">
          {error}
        </div>
      )}
      {!loading && !error && notices.length === 0 && (
        <p className="text-gray-500 text-sm">You have no notifications yet.</p>
      )}

      <div className="mx-auto bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 space-y-5 text-base">
        {notices.map((notice) => (
          <button
            key={notice.id}
            onClick={() => handleMarkAsRead(notice.id)}
            className="w-full text-left flex items-start gap-3 p-4"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
              notice.is_read ? 'bg-gray-100' : 'bg-blue-100'
            }`}>
              🔔
            </div>
            <div>
              <p className={`text-sm ${notice.is_read ? 'text-gray-600' : 'font-semibold text-gray-900'}`}>
                {notice.title}
              </p>
              <p className="text-sm text-gray-500">{notice.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(notice.created_at).toLocaleString()}
              </p>
            </div>
            {!notice.is_read && (
              <span className="w-2 h-2 bg-blue-600 rounded-full ml-auto mt-1.5 shrink-0"></span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Notifications