import { useAuth } from '../contexts/AuthContext'

const DebugAuth = () => {
  const { user, userProfile, loading, initialized } = useAuth()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-xs">
      <h4 className="font-bold mb-2">Auth Debug</h4>
      <div>Initialized: {initialized ? 'Yes' : 'No'}</div>
      <div>Loading: {loading ? 'Yes' : 'No'}</div>
      <div>User: {user ? 'Logged In' : 'Not Logged In'}</div>
      <div>Profile: {userProfile ? 'Loaded' : 'Not Loaded'}</div>
      <div>Role: {userProfile?.role || 'N/A'}</div>
    </div>
  )
}

export default DebugAuth
