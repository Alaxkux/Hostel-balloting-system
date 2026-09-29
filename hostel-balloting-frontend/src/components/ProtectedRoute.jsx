import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children, requiredRole }) {
  const token = sessionStorage.getItem('token')

  if (!token) {
    return <Navigate to={requiredRole === 'admin' ? '/admin-login' : '/login'} replace />
  }

  return children
}

export default ProtectedRoute