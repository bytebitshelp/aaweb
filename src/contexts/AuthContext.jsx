import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useCartStore } from '../store/cartStore'
import { isAdminEmail } from '../lib/admin'
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
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)
  const { setUser: setCartUser } = useCartStore()

  useEffect(() => {
    let mounted = true

    // Get initial session
    const initializeAuth = async () => {
      try {
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
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: { session: null }, error: { message: 'session timeout' } }), 4000)
          )
        ])
        const { data: { session }, error } = sessionResult
        
        if (error) {
          console.error('Error getting session:', error)
          // Don't clear cached session on error - might be temporary network issue
          if (mounted) {
            setLoading(false)
          }
          return
        }

        if (mounted) {
          if (session?.user) {
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
            setUser(null)
            setCartUser(null)
            setUserProfile(null)
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()
    const loadingSafety = setTimeout(() => {
      if (mounted) setLoading(false)
    }, 5000)

    // Do not await other Supabase queries inside this callback — it deadlocks getSession()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return

      if (event === 'SIGNED_OUT') {
        setUser(null)
        setCartUser(null)
        setUserProfile(null)
        localStorage.removeItem('sb-session')
        localStorage.removeItem('user-profile')
        setLoading(false)
        return
      }

      if (session?.user) {
        setUser(session.user)
        setCartUser(session.user)
        setLoading(false)
        try {
          localStorage.setItem('sb-session', JSON.stringify(session))
        } catch {}
        fetchUserProfile(session.user.id)
      }
    })

    return () => {
      mounted = false
      clearTimeout(loadingSafety)
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId) => {
    try {
      const query = supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      const { data, error } = await Promise.race([
        query,
        new Promise((_, reject) => setTimeout(() => reject(new Error('profile timeout')), 6000))
      ])

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error)
        // Don't show error toast for background profile fetch
      } else if (data) {
        // Self-heal: if email is admin but role isn't, upgrade role
        try {
          const adminUser = await checkAdminStatus(data.email)
          if (adminUser && data.role !== 'admin') {
            const { data: updated, error: updateError } = await supabase
              .from('users')
              .update({ role: 'admin' })
              .eq('user_id', userId)
              .select('*')
              .single()
            if (!updateError && updated) {
              setUserProfile(updated)
              try { localStorage.setItem('user-profile', JSON.stringify(updated)) } catch {}
              return
            }
          }
        } catch (e) {
          console.error('Error ensuring admin role:', e)
        }

        setUserProfile(data)
        try { localStorage.setItem('user-profile', JSON.stringify(data)) } catch {}
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const checkAdminStatus = async (email) => {
    try {
      if (!email) return false
      const normalizedEmail = String(email).trim().toLowerCase()
      if (isAdminEmail(normalizedEmail)) return true

      const { data, error } = await supabase
        .from('admin_emails')
        .select('email, is_active')
        .eq('email', normalizedEmail)
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
        setUser(data.user)
        setCartUser(data.user)
        setLoading(false)

        const adminUser = isAdminEmail(email)
        fetchUserProfile(data.user.id)

        toast.success('Signed in successfully!')
        window.location.replace(adminUser ? '/admin-dashboard' : '/')
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
    if (userProfile?.role === 'admin') return true
    return isAdminEmail(userProfile?.email || user?.email)
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
