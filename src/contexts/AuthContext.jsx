import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'
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
  const { setUser: setWishlistUser } = useWishlistStore()

  useEffect(() => {
    let mounted = true

    // Get initial session
    const initializeAuth = async () => {
      try {
        // Set initialized immediately to unblock UI
        if (mounted) {
          setInitialized(true)
        }

        // Check for cached session first (non-blocking)
        try {
          const cachedSessionRaw = localStorage.getItem('sb-session')
          if (cachedSessionRaw) {
            const cachedSession = JSON.parse(cachedSessionRaw)
            if (cachedSession?.user && mounted) {
              setUser(cachedSession.user)
              setCartUser(cachedSession.user)
              setWishlistUser(cachedSession.user)
              
              // Try to hydrate cached profile
              const cachedProfileRaw = localStorage.getItem('user-profile')
              if (cachedProfileRaw) {
                const cachedProfile = JSON.parse(cachedProfileRaw)
                setUserProfile(cachedProfile)
              } else {
                // Fetch profile in background
                fetchUserProfile(cachedSession.user.id)
              }
              return
            }
          }
        } catch (error) {
          console.error('Error parsing cached session:', error)
        }

        // If no cached session, check with Supabase (non-blocking with timeout)
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 5000)
        )
        
        try {
          const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise])
          
          if (error) {
            console.error('Error getting session:', error)
            return
          }

          if (mounted) {
            setUser(session?.user ?? null)
            setCartUser(session?.user ?? null)
            setWishlistUser(session?.user ?? null)
            if (session?.user) {
              fetchUserProfile(session.user.id) // Don't await - run in background
              try {
                localStorage.setItem('sb-session', JSON.stringify(session))
              } catch {}
            } else {
              setUserProfile(null)
            }
          }
        } catch (timeoutError) {
          console.error('Session check timed out:', timeoutError)
          // Continue with null user state
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setInitialized(true)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      setUser(session?.user ?? null)
      setCartUser(session?.user ?? null)
      setWishlistUser(session?.user ?? null)
      if (session?.user) {
        await fetchUserProfile(session.user.id)
        // Persist session for routing redirects
        try {
          const serialized = JSON.stringify(session)
          localStorage.setItem('sb-session', serialized)
        } catch {}
      } else {
        setUserProfile(null)
        localStorage.removeItem('sb-session')
      }
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
        setWishlistUser(data.user)

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

        // Fetch profile in background
        fetchUserProfile(data.user.id)
        
        // Persist session immediately
        try {
          const { data: sessionData } = await supabase.auth.getSession()
          if (sessionData?.session) {
            localStorage.setItem('sb-session', JSON.stringify(sessionData.session))
          }
        } catch {}
        
        toast.success('Signed in successfully!')
        
        // Redirect after a short delay to allow UI to update
        setTimeout(() => {
          try {
            const profileRaw = localStorage.getItem('user-profile')
            const profile = profileRaw ? JSON.parse(profileRaw) : null
            if (profile?.role === 'admin') {
              window.location.assign('/admin-dashboard')
            } else {
              window.location.assign('/')
            }
          } catch {
            window.location.assign('/')
          }
        }, 100)
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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
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
      setWishlistUser(null)
      
      // Clear all localStorage items
      localStorage.removeItem('sb-session')
      localStorage.removeItem('user-profile')
      localStorage.removeItem('cart-storage')
      localStorage.removeItem('wishlist-storage')
      
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
