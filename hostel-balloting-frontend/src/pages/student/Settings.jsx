function Settings() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your account and system preferences.
        </p>
      </div>

      <div className="max-w-lg space-y-4">
        {/* Account details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="font-semibold text-gray-900 mb-4">Account Details</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                defaultValue="Admin User"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                defaultValue="admin@unilorin.edu.ng"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
              />
            </div>
            <button className="bg-blue-950 text-white text-sm font-semibold px-5 py-2 rounded-lg">
              Save Changes
            </button>
          </div>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="font-semibold text-gray-900 mb-4">Change Password</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input type="password" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" />
            </div>
            <button className="bg-blue-950 text-white text-sm font-semibold px-5 py-2 rounded-lg">
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings