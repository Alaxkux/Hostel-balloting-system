function SystemMessageModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl mx-auto mb-4">
          ℹ️
        </div>
        <p className="font-semibold text-gray-900 text-lg mb-2">System Message</p>
        <p className="text-gray-500 text-sm mb-6">
          This is an official UNILORIN system. Do not share your login details with anyone.
        </p>

        <button
          onClick={onClose}
          className="w-full bg-blue-950 text-white font-medium py-2.5 rounded-lg text-sm mb-4"
        >
          OK
        </button>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <img src="/unilorin-logo.png" alt="University of Ilorin logo" className="w-7 h-7 object-contain" />
          <div className="text-left">
            <p className="font-medium">UNIVERSITY OF ILORIN</p>
            <p>Hostel Balloting System</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemMessageModal