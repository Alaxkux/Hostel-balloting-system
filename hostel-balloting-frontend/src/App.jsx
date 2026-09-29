//Imports

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import StudentLogin from './pages/StudentLogin'
import AdminLogin from './pages/AdminLogin'
import StudentLayout from './layouts/StudentLayout'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'

//Students pages
import Dashboard from './pages/student/Dashboard'
import Apply from './pages/student/Apply'
import BallotResult from './pages/student/BallotResult'
import Profile from './pages/student/Profile'
import Notifications from './pages/student/Notifications'

//Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import ManageStudents from './pages/admin/ManageStudents'
import HostelManagement from './pages/admin/HostelManagement'
import BallotManagement from './pages/admin/BallotManagement'
import ResultsManagement from './pages/admin/ResultsManagement'
import Settings from './pages/admin/Settings'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<StudentLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        <Route
          path="/student"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="apply" element={<Apply />} />
          <Route path="ballot-result" element={<BallotResult />} />
          <Route path="profile" element={<Profile />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="manage-students" element={<ManageStudents />} />
          <Route path="hostel-management" element={<HostelManagement />} />
          <Route path="ballot-management" element={<BallotManagement />} />
          <Route path="results-management" element={<ResultsManagement />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App