import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export const ProtectedRoute = () => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-forest-green animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/" state={{ from: location }} replace />
  return <Outlet />
}

export const AdminRoute = () => {
  const { user, userProfile, loading } = useAuth()
  const location = useLocation()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-forest-green animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/" state={{ from: location }} replace />
  if (userProfile?.role !== 'admin') return <Navigate to="/" replace />
  return <Outlet />
}

export default ProtectedRoute


