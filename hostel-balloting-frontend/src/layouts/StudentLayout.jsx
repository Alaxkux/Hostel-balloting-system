import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import ConfirmLogoutModal from '../components/ConfirmLogoutModal'

const navItems = [
  { to: '/student/dashboard', label: 'Dashboard' },
  { to: '/student/apply', label: 'Apply for Hostel' },
  { to: '/student/ballot-result', label: 'Ballot Result' },
  { to: '/student/profile', label: 'Profile' },
  { to: '/student/notifications', label: 'Notifications' },
]

function StudentLayout() {
  const [showLogout, setShowLogout] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* Mobile-only top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-blue-950 text-white flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-2">
          <img src="/unilorin-logo.png" alt="University of Ilorin logo" className="w-8 h-8 object-contain" />
          <span className="font-bold text-sm">University of Ilorin</span>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="text-2xl leading-none">
          ☰
        </button>
      </div>

      {/* Backdrop — only shows on mobile when the drawer is open */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 z-30"
        ></div>
      )}

      {/* Sidebar — fixed drawer on mobile, static column on desktop */}
      <aside
        className={`w-64 bg-blue-950 text-white flex flex-col p-4 fixed inset-y-0 left-0 z-40 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static`}
      >
        <div className="flex items-center gap-3 px-2 py-4">
          <img src="/unilorin-logo.png" alt="University of Ilorin logo" className="w-12 h-12 object-contain" />
          <span className="font-bold">University of Ilorin</span>
        </div>

        <nav className="flex-1 mt-6 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-blue-800 text-white'
                    : 'text-white/70 hover:bg-blue-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => setShowLogout(true)}
          className="text-left px-4 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-blue-900"
        >
          Logout
        </button>
      </aside>

      {/* Main content area — each page renders here */}
      <main className="flex-1 p-4 pt-20 md:p-8 md:pt-8">
        <Outlet />
      </main>

      {showLogout && (
        <ConfirmLogoutModal
          onCancel={() => setShowLogout(false)}
          onConfirm={() => navigate('/login')}
        />
      )}
    </div>
  )
}

export default StudentLayout