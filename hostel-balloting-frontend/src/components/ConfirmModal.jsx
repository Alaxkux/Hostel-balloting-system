function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  loading = false,
  error = '',
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center">
        <p className="font-semibold text-gray-900 text-lg mb-2">{title}</p>
        <div className="text-gray-500 text-sm mb-6">{message}</div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-2.5 rounded-lg mb-4 text-left">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 rounded-lg text-sm disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 text-white font-medium py-2 rounded-lg text-sm disabled:opacity-60 ${
              danger ? 'bg-red-600' : 'bg-blue-950'
            }`}
          >
            {loading ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal