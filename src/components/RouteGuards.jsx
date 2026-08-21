import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const AuthSpinner = () => (
  <div className="min-h-[50vh] flex items-center justify-center bg-cream">
    <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-forest-green animate-spin" />
  </div>
)

export const ProtectedRoute = () => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading && !user) return <AuthSpinner />
  if (!user) return <Navigate to="/" state={{ from: location }} replace />
  return <Outlet />
}

export const AdminRoute = () => {
  const { user, loading, isAdmin } = useAuth()
  const location = useLocation()
  const [waited, setWaited] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setWaited(true), 2500)
    return () => clearTimeout(timer)
  }, [])

  if (loading && !user && !waited) return <AuthSpinner />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (!isAdmin()) return <Navigate to="/" replace />
  return <Outlet />
}

export default ProtectedRoute
