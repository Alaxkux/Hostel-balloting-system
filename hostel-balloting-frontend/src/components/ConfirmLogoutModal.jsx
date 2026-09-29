function ConfirmLogoutModal({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center">
        <p className="font-semibold text-gray-900 text-lg mb-2">Confirm Logout</p>
        <p className="text-gray-500 text-sm mb-6">
          Are you sure you want to logout from your account?
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 rounded-lg text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white font-medium py-2 rounded-lg text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmLogoutModal