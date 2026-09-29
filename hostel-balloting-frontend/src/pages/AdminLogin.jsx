import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apiRequest from '../lib/api'

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await apiRequest('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      sessionStorage.setItem('token', data.token)
      sessionStorage.setItem('admin', JSON.stringify(data.admin))

      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* Left panel — photo side, hidden on mobile */}
      <div
        className="hidden md:flex relative w-1/2 bg-cover bg-center flex-col justify-between p-10"
        style={{ backgroundImage: "url('/unilorin-background.png')" }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-blue-950/80"></div>

        {/* Logo + Title (must be above the overlay) */}
        <div className="relative z-10 flex items-center gap-2">
          <img
            src="/unilorin-logo.png"
            alt="University of Ilorin logo"
            className="w-16 h-16 object-contain"
          />
          <div className="leading-none">
            <p className="text-white text-sm font-medium tracking-[0.15em] uppercase mb-0.1">
              University of
            </p>
            <p className="text-white font-bold text-3xl tracking-wide">
              ILORIN
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — form side */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-sm">

          <div className="flex justify-end mb-8">
            <div className="bg-gray-100 rounded-full p-1 flex text-sm font-medium">
              <Link to="/login" className="px-4 py-1.5 rounded-full text-gray-500">
                Student
              </Link>
              <button className="px-4 py-1.5 rounded-full bg-blue-950 text-white">
                Admin
              </button>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Admin Login</h2>
          <p className="text-gray-500 text-sm mb-6">
            Restricted access for authorized personnel only.
          </p>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-2.5 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
                >
                  👁
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-950 text-white font-semibold py-2.5 rounded-lg disabled:opacity-60"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin