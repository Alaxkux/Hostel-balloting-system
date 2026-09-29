function Profile() {
  const student = JSON.parse(sessionStorage.getItem('student'))

  return (
    <div>
      {/* Top row — title + matric/level */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-500 text-sm mt-1">
            Your personal and academic information.
          </p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>Matric: {student.matric_no}</p>
          <p>Level: {student.level}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6" >
        <p className="font-semibold text-gray-900 mb-4">Student Information</p>

        <div className="space-y-10 text-base">
          <div className="flex justify-between">
            <span className="text-gray-500">Matric Number</span>
            <span className="text-gray-900 font-medium">{student.matric_no}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Full Name</span>
            <span className="text-gray-900 font-medium">{student.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Level</span>
            <span className="text-gray-900 font-medium">{student.level}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Faculty</span>
            <span className="text-gray-900 font-medium">{student.faculty}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Department</span>
            <span className="text-gray-900 font-medium">{student.department}</span>
          </div>
        </div>

        <p className="text-gray-400 text-xs mt-6">
          ℹ️ This information is linked to your matric number and cannot be edited.
        </p>
      </div>
    </div>
  )
}

export default Profile