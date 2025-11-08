import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const AuthCallback = () => {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

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
          const normalizedEmail = String(user.email || '').trim().toLowerCase()

          // Determine admin status using hardcoded email, admin_emails table, and VITE_ADMIN_EMAILS
          const envAdminsRaw = import.meta.env.VITE_ADMIN_EMAILS || ''
          const envAdmins = envAdminsRaw
            .split(',')
            .map(e => e.trim().toLowerCase())
            .filter(Boolean)

          let isAdminEmail = normalizedEmail === 'asadmohammed181105@gmail.com' || envAdmins.includes(normalizedEmail)
          if (!isAdminEmail) {
            try {
              const { data: adminEmail, error: adminCheckError } = await supabase
                .from('admin_emails')
                .select('email, is_active')
                .eq('email', normalizedEmail)
                .eq('is_active', true)
                .single()
              if (!adminCheckError && adminEmail) isAdminEmail = true
            } catch {}
          }

          // Ensure a user profile exists and has correct role
          const { data: existingProfile, error: fetchProfileError } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', user.id)
            .single()

          if (!existingProfile || fetchProfileError?.code === 'PGRST116') {
            // Create user profile
            const { error: profileError } = await supabase
              .from('users')
              .insert([
                {
                  user_id: user.id,
                  name: user.user_metadata?.full_name || user.user_metadata?.name || normalizedEmail.split('@')[0],
                  email: normalizedEmail,
                  role: isAdminEmail ? 'admin' : 'customer',
                  created_at: new Date().toISOString()
                }
              ])
            if (profileError && profileError.code !== '23505') {
              console.error('Error creating user profile:', profileError)
            }
          } else if (existingProfile && isAdminEmail && existingProfile.role !== 'admin') {
            // Upgrade role to admin if needed
            const { error: updateError } = await supabase
              .from('users')
              .update({ role: 'admin' })
              .eq('user_id', user.id)
            if (updateError) {
              console.error('Error updating user role to admin:', updateError)
            }
          }

          // Fetch and cache latest profile to ensure UI reflects admin role immediately
          try {
            const { data: freshProfile } = await supabase
              .from('users')
              .select('*')
              .eq('user_id', user.id)
              .single()
            if (freshProfile) {
              localStorage.setItem('user-profile', JSON.stringify(freshProfile))
            }
          } catch {}

          // Persist session as backup for routing
          try {
            localStorage.setItem('sb-session', JSON.stringify(data.session))
          } catch {}

          // Redirect immediately based on admin status
          if (isAdminEmail) {
            window.location.replace('/admin-dashboard')
          } else {
            window.location.replace('/')
          }
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
