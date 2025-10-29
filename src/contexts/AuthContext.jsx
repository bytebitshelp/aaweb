import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'

const AuthContext = createContext({
  user: null,
  userProfile: null,
  loading: true,
  signUp: () => {},
  signIn: () => {},
  signInWithGoogle: () => {},
  signOut: () => {},
  isAdmin: () => false,
  isCustomer: () => false,
  fetchUserProfile: () => {},
  checkAdminStatus: () => {}
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [initialized, setInitialized] = useState(false)
  const { setUser: setCartUser } = useCartStore()

  useEffect(() => {
    let mounted = true

    // Get initial session
    const initializeAuth = async () => {
      try {
        // Set initialized immediately to unblock UI
        if (mounted) {
          setInitialized(true)
        }

        // Supabase handles session persistence internally via localStorage
        // We'll verify the session with Supabase, but can use cached data for initial render
        try {
          const cachedSessionRaw = localStorage.getItem('sb-session')
          if (cachedSessionRaw && mounted) {
            const cachedSession = JSON.parse(cachedSessionRaw)
            if (cachedSession?.user) {
              // Set initial user state from cache (will be verified by Supabase)
              setUser(cachedSession.user)
              setCartUser(cachedSession.user)
              
              // Try to hydrate cached profile
              const cachedProfileRaw = localStorage.getItem('user-profile')
              if (cachedProfileRaw) {
                try {
                  const cachedProfile = JSON.parse(cachedProfileRaw)
                  if (cachedProfile.user_id === cachedSession.user.id) {
                    setUserProfile(cachedProfile)
                  }
                } catch {}
              }
              // Don't return - still verify with Supabase below
            }
          }
        } catch (error) {
          console.error('Error parsing cached session:', error)
        }

        // Always check with Supabase for current session
        // Supabase handles session persistence internally, but we verify it
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          // Don't clear cached session on error - might be temporary network issue
          if (mounted) {
            setInitialized(true)
            setLoading(false)
          }
          return
        }

        if (mounted) {
          if (session?.user) {
            // Valid session exists - restore user state
            console.log('Session found, user:', session.user.email)
            setUser(session.user)
            setCartUser(session.user)
            
            // Persist session
            try {
              localStorage.setItem('sb-session', JSON.stringify(session))
            } catch (err) {
              console.error('Error saving session:', err)
            }
            
            // Restore profile from cache or fetch
            const cachedProfileRaw = localStorage.getItem('user-profile')
            if (cachedProfileRaw) {
              try {
                const cachedProfile = JSON.parse(cachedProfileRaw)
                // Verify profile matches current user
                if (cachedProfile.user_id === session.user.id) {
                  setUserProfile(cachedProfile)
                  console.log('Profile restored from cache')
                } else {
                  // Profile doesn't match, fetch new one
                  fetchUserProfile(session.user.id)
                }
              } catch {
                fetchUserProfile(session.user.id)
              }
            } else {
              // No cached profile, fetch it
              fetchUserProfile(session.user.id)
            }
          } else {
            // No session - user is logged out
            console.log('No session found')
            setUser(null)
            setCartUser(null)
            setUserProfile(null)
          }
          setInitialized(true)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setInitialized(true)
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log('Auth state changed:', event, session?.user?.email || 'No user')

      // Handle auth state changes properly
      // CRITICAL: Only clear session on explicit SIGNED_OUT event
      // Do NOT clear on other events with null session - Supabase handles token refresh
      
      if (event === 'SIGNED_OUT') {
        // Explicit sign out - clear everything
        console.log('User explicitly signed out')
        setUser(null)
        setCartUser(null)
        setUserProfile(null)
        localStorage.removeItem('sb-session')
        localStorage.removeItem('user-profile')
      } else if (session?.user) {
        // Valid session exists - update state
        console.log('Session active for user:', session.user.email)
        setUser(session.user)
        setCartUser(session.user)
        await fetchUserProfile(session.user.id)
        
        // Backup session to localStorage
        try {
          localStorage.setItem('sb-session', JSON.stringify(session))
        } catch (err) {
          console.error('Error saving session:', err)
        }
      }
      // For TOKEN_REFRESHED or other events without session, don't clear user state
      // Ra Supabase manages session persistence internally
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error)
        // Don't show error toast for background profile fetch
      } else if (data) {
        setUserProfile(data)
        try {
          localStorage.setItem('user-profile', JSON.stringify(data))
        } catch {}
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const checkAdminStatus = async (email) => {
    try {
      // Check if email is the specific admin email
      if (email === 'asadmohammed181105@gmail.com') {
        return true
      }
      
      const { data, error } = await supabase
        .from('admin_emails')
        .select('email, is_active')
        .eq('email', email)
        .eq('is_active', true)
        .single()

      return !error && data
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  }

  const signUp = async (email, password, name, role = 'customer') => {
    try {
      
      // Check if user is admin
      const isAdmin = await checkAdminStatus(email)
      const userRole = isAdmin ? 'admin' : 'customer'

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: userRole
          }
        }
      })

      if (error) throw error

      // Create user profile in custom users table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              user_id: data.user.id,
              name,
              email,
              role: userRole,
              created_at: new Date().toISOString()
            }
          ])

        if (profileError) {
          console.error('Error creating user profile:', profileError)
        }
      }

      toast.success('Account created successfully! Please check your email to verify your account.')
      return { data, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      toast.error(error.message)
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // Set user immediately for responsive UI
        setUser(data.user)
        setCartUser(data.user)

        // Check if user exists in our users table, if not create profile (background)
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', data.user.id)
          .single()

        if (!existingUser) {
          // Check if user is admin
          const isAdmin = await checkAdminStatus(email)
          const userRole = isAdmin ? 'admin' : 'customer'
          
          // Create user profile
          const { error: profileError } = await supabase
            .from('users')
            .insert([
              {
                user_id: data.user.id,
                name: data.user.user_metadata?.name || data.user.email.split('@')[0],
                email: data.user.email,
                role: userRole,
                created_at: new Date().toISOString()
              }
            ])

          if (profileError) {
            console.error('Error creating user profile:', profileError)
          }
        }

        // Get and persist session
        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData?.session) {
          try {
            localStorage.setItem('sb-session', JSON.stringify(sessionData.session))
          } catch {}
          
          // Fetch profile and wait for it
          await fetchUserProfile(data.user.id)
          
          toast.success('Signed in successfully!')
          
          // Redirect but preserve session - use replace to avoid adding to history
          setTimeout(() => {
            const profileRaw = localStorage.getItem('user-profile')
            const profile = profileRaw ? JSON.parse(profileRaw) : null
            if (profile?.role === 'admin') {
              window.location.replace('/admin-dashboard')
            } else {
              window.location.replace('/')
            }
          }, 300)
        } else {
          toast.success('Signed in successfully!')
          window.location.replace('/')
        }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error(error.message)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      // Get the redirect URL - use environment variable if available, otherwise use current origin
      let siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin
      
      // Ensure siteUrl doesn't have a trailing slash
      siteUrl = siteUrl.replace(/\/$/, '')
      
      const redirectUrl = `${siteUrl}/auth/callback`
      
      console.log('Google OAuth redirect URL:', redirectUrl)
      console.log('Site URL source:', import.meta.env.VITE_SITE_URL ? 'Environment variable' : 'window.location.origin')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Google sign in error:', error)
      toast.error('Failed to sign in with Google')
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      
      // Clear user state immediately
      setUser(null)
      setUserProfile(null)
      setCartUser(null)
      
      // Clear all localStorage items
      localStorage.removeItem('sb-session')
      localStorage.removeItem('user-profile')
      localStorage.removeItem('cart-storage')
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Supabase sign out error:', error)
        // Continue with sign out even if Supabase error occurs
      }
      
      toast.success('Signed out successfully!')
      
      // Force redirect to home page
      window.location.href = '/'
      
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Error signing out')
      // Still redirect even if there's an error
      window.location.href = '/'
    }
  }

  const isAdmin = () => {
    return userProfile?.role === 'admin'
  }

  const isCustomer = () => {
    return userProfile?.role === 'customer'
  }

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    isAdmin,
    isCustomer,
    fetchUserProfile,
    checkAdminStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
