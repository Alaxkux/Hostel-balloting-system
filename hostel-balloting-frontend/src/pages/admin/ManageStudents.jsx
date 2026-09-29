import { useState, useEffect } from 'react'
import apiRequest from '../../lib/api'
import ActionMenu from '../../components/ActionMenu'
import ConfirmModal from '../../components/ConfirmModal'
import { VALID_LEVELS, validateStudentForm } from '../../lib/validators'

const emptyForm = { name: '', email: '', level: '', faculty: '', department: '' }

function ManageStudents() {
  const [students, setStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)

  // edit modal
  const [editingStudent, setEditingStudent] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  // deactivate / reactivate confirmation
  const [statusTarget, setStatusTarget] = useState(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [statusError, setStatusError] = useState('')

  const studentsPerPage = 5

  const loadStudents = async () => {
    try {
      const data = await apiRequest('/students')
      setStudents(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStudents()
  }, [])

  const filteredStudents = students.filter((s) =>
    (s.matric_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / studentsPerPage))
  const startIndex = (currentPage - 1) * studentsPerPage
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + studentsPerPage)

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  // ----- edit modal -----
  const openEdit = (student) => {
    setNotice('')
    setEditingStudent(student)
    setForm({
      name: student.name || '',
      email: student.email || '',
      level: student.level ? String(student.level) : '',
      faculty: student.faculty || '',
      department: student.department || '',
    })
    setSubmitted(false)
    setFormError('')
  }

  const closeEdit = () => {
    setEditingStudent(null)
    setFormError('')
  }

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // checked on every render, but only shown after the first submit attempt
  const errors = validateStudentForm(form)
  const showError = (field) => submitted && errors[field]
  const inputClass = (field) =>
    `w-full border rounded-lg px-4 py-2 text-sm ${showError(field) ? 'border-red-400' : 'border-gray-300'}`

  const handleSave = async (e) => {
    e.preventDefault()
    setSubmitted(true)
    setFormError('')

    if (Object.keys(errors).length > 0) return

    setSaving(true)

    try {
      const data = await apiRequest(`/students/${editingStudent.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          level: Number(form.level),
          faculty: form.faculty.trim(),
          department: form.department.trim(),
          status: editingStudent.status === 'inactive' ? 'inactive' : 'active',
        }),
      })

      setNotice(data.message)
      closeEdit()
      loadStudents()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ----- deactivate / reactivate -----
  const openStatusConfirm = (student, action) => {
    setNotice('')
    setStatusError('')
    setStatusTarget({ student, action })
  }

  const handleStatusChange = async () => {
    setStatusLoading(true)
    setStatusError('')

    try {
      const data = await apiRequest(
        `/students/${statusTarget.student.id}/${statusTarget.action}`,
        { method: 'PATCH' }
      )

      setNotice(data.message)
      setStatusTarget(null)
      loadStudents()
    } catch (err) {
      setStatusError(err.message)
    } finally {
      setStatusLoading(false)
    }
  }

  const menuItemsFor = (student) => [
    { label: 'Edit details', onClick: () => openEdit(student) },
    student.status === 'inactive'
      ? { label: 'Reactivate', onClick: () => openStatusConfirm(student, 'reactivate') }
      : { label: 'Deactivate', danger: true, onClick: () => openStatusConfirm(student, 'deactivate') },
  ]

  const targetName = statusTarget
    ? statusTarget.student.name || statusTarget.student.matric_no || 'this student'
    : ''

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Manage Students</h1>
        <p className="text-gray-500 text-sm mt-1">
          Search and manage student records.
        </p>
      </div>

      {notice && (
        <div className="bg-green-50 text-green-700 text-sm px-4 py-2.5 rounded-lg mb-4">
          {notice}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {/* Search row */}
        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="Search by matric number or name"
            value={searchTerm}
            onChange={handleSearchChange}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-2.5 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading && <p className="text-gray-500 text-sm">Loading students...</p>}

        {!loading && !error && filteredStudents.length === 0 && (
          <p className="text-gray-500 text-sm">No students found.</p>
        )}

        {!loading && paginatedStudents.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-2 font-medium">Matric Number</th>
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">Level</th>
                    <th className="pb-2 font-medium">Faculty</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.map((s) => (
                    <tr key={s.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-2.5 text-gray-900">{s.matric_no || '—'}</td>
                      <td className="py-2.5 text-gray-900">{s.name || '—'}</td>
                      <td className="py-2.5 text-gray-500">{s.level}</td>
                      <td className="py-2.5 text-gray-500">{s.faculty}</td>
                      <td className="py-2.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {s.status ? s.status.charAt(0).toUpperCase() + s.status.slice(1) : 'Unknown'}
                        </span>
                      </td>
                      <td className="py-1.5">
                        <ActionMenu items={menuItemsFor(s)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4 text-sm text-gray-500">
              <span>
                Showing {startIndex + 1}-{Math.min(startIndex + studentsPerPage, filteredStudents.length)} of {filteredStudents.length}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-40"
                >
                  ‹
                </button>
                <span className="px-3 py-1">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-40"
                >
                  ›
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit student modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-900">Edit Student</p>
              <button onClick={closeEdit} className="text-gray-400">✕</button>
            </div>

            {formError && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-2.5 rounded-lg mb-4">
                {formError}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSave} noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matric Number</label>
                <input
                  type="text"
                  value={editingStudent.matric_no || '—'}
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-gray-50 text-gray-500"
                />
                <p className="text-gray-400 text-xs mt-1">The matric number cannot be changed.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className={inputClass('name')}
                />
                {showError('name') && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className={inputClass('email')}
                />
                {showError('email') && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select
                  value={form.level}
                  onChange={(e) => handleFieldChange('level', e.target.value)}
                  className={inputClass('level')}
                >
                  <option value="">Select level</option>
                  {VALID_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
                {showError('level') && <p className="text-red-600 text-xs mt-1">{errors.level}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
                <input
                  type="text"
                  value={form.faculty}
                  onChange={(e) => handleFieldChange('faculty', e.target.value)}
                  className={inputClass('faculty')}
                />
                {showError('faculty') && <p className="text-red-600 text-xs mt-1">{errors.faculty}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => handleFieldChange('department', e.target.value)}
                  className={inputClass('department')}
                />
                {showError('department') && <p className="text-red-600 text-xs mt-1">{errors.department}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-950 text-white font-medium py-2 rounded-lg text-sm disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate / reactivate confirmation */}
      {statusTarget && (
        <ConfirmModal
          title={statusTarget.action === 'deactivate' ? 'Deactivate student?' : 'Reactivate student?'}
          message={
            statusTarget.action === 'deactivate' ? (
              <>
                <span className="font-medium text-gray-700">{targetName}</span> will no longer be
                able to log in. You can reactivate them at any time.
              </>
            ) : (
              <>
                <span className="font-medium text-gray-700">{targetName}</span> will be able to
                log in again.
              </>
            )
          }
          confirmLabel={statusTarget.action === 'deactivate' ? 'Deactivate' : 'Reactivate'}
          danger={statusTarget.action === 'deactivate'}
          loading={statusLoading}
          error={statusError}
          onCancel={() => setStatusTarget(null)}
          onConfirm={handleStatusChange}
        />
      )}
    </div>
  )
}

export default ManageStudents