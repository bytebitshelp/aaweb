import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const AuthCallback = () => {
  const navigate = useNavigate()
  const { userProfile, isAdmin } = useAuth()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          toast.error('Authentication failed')
          navigate('/')
          return
        }

        if (data.session?.user) {
          const user = data.session.user
          
          // Check if user profile exists
          const { data: existingProfile } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', user.id)
            .single()

          if (!existingProfile) {
            // Check if user is admin based on email (hardcoded for now due to RLS)
            const isAdminEmail = user.email === 'asadmohammed181105@gmail.com'
            const userRole = isAdminEmail ? 'admin' : 'customer'
            
            // Create user profile
            const { error: profileError } = await supabase
              .from('users')
              .insert([
                {
                  user_id: user.id,
                  name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0],
                  email: user.email,
                  role: userRole,
                  created_at: new Date().toISOString()
                }
              ])

            if (profileError) {
              console.error('Error creating user profile:', profileError)
            }
          }

          // Wait a moment for profile to be created/fetched
          setTimeout(() => {
            // Redirect based on role
            if (isAdmin()) {
              navigate('/admin-dashboard')
            } else {
              navigate('/')
            }
          }, 1000)
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        toast.error('Authentication failed')
        navigate('/')
      }
    }

    handleAuthCallback()
  }, [navigate, isAdmin])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-forest-green bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-8 h-8 text-forest-green animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Completing Sign In</h2>
        <p className="text-gray-600">Please wait while we set up your account...</p>
      </div>
    </div>
  )
}

export default AuthCallback
