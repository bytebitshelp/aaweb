import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { getImageUrl, getImageUrls, PLACEHOLDER_IMAGE } from '../lib/imageUtils'
import toast from 'react-hot-toast'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      user: null,

      // Set user when auth state changes
      setUser: (user) => {
        set({ user })
        if (user) {
          // Ensure user profile exists, then fetch cart items
          get().ensureUserProfile(user.id, user.email, user.user_metadata?.name || user.email.split('@')[0])
            .then(() => {
              get().fetchCartItems()
            })
            .catch(err => {
              console.error('Error ensuring user profile:', err)
            })
        } else {
          set({ items: [] })
        }
      },

      // Ensure user profile exists in users table
      ensureUserProfile: async (userId, userEmail, userName) => {
        try {
          // Check if user exists
          const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('user_id')
            .eq('user_id', userId)
            .single()

          // If user doesn't exist (404 or no rows), create profile
          if (!existingUser || checkError?.code === 'PGRST116') {
            // Determine if admin
            const isAdminEmail = userEmail === 'asadmohammed181105@gmail.com'
            const userRole = isAdminEmail ? 'admin' : 'customer'
            
            const { error: insertError } = await supabase
              .from('users')
              .insert([
                {
                  user_id: userId,
                  email: userEmail,
                  name: userName || userEmail.split('@')[0],
                  role: userRole,
                  created_at: new Date().toISOString()
                }
              ])

            // Ignore unique constraint errors (user might have been created between check and insert)
            if (insertError && insertError.code !== '23505') {
              console.error('Error creating user profile:', insertError)
              throw insertError
            }
          }
        } catch (error) {
          console.error('Error ensuring user profile:', error)
          // Don't throw - let it continue, might still work
        }
      },

      // Add item to cart
      addItem: async (artwork, quantity = 1) => {
        const { user } = get()
        if (!user) {
          toast.error('Please login to add items to cart')
          return
        }

        // Validate artwork
        if (!artwork || !artwork.artwork_id) {
          toast.error('Invalid artwork')
          return
        }

        // Check availability
        const isAvailable = (artwork.status === 'Available' || artwork.status === 'available') && (artwork.quantity_available || 0) > 0
        if (!isAvailable) {
          toast.error('This item is currently not available')
          return
        }

        try {
          // Ensure user profile exists before adding to cart
          await get().ensureUserProfile(
            user.id,
            user.email,
            user.user_metadata?.name || user.email.split('@')[0]
          )

          const existingItem = get().items.find(item => item.artwork_id === artwork.artwork_id)
          
          if (existingItem) {
            // Update quantity
            const newQuantity = Math.min(existingItem.quantity + quantity, artwork.quantity_available || 0)
            
            if (newQuantity > (artwork.quantity_available || 0)) {
              toast.error(`Only ${artwork.quantity_available} items available`)
              return
            }

            const { error: updateError } = await supabase
              .from('cart')
              .update({ quantity: newQuantity })
              .eq('cart_id', existingItem.cart_id)
              .eq('user_id', user.id)

            if (updateError) throw updateError

            // Refresh cart from database to ensure consistency
            await get().fetchCartItems()

            toast.success('Cart updated successfully!')
          } else {
            // Add new item - handle unique constraint if item already exists
            const { data, error } = await supabase
              .from('cart')
              .insert([
                {
                  user_id: user.id,
                  artwork_id: artwork.artwork_id,
                  quantity: Math.min(quantity, artwork.quantity_available || 0),
                  created_at: new Date().toISOString()
                }
              ])
              .select()
              .single()

            if (error) {
              // Handle foreign key constraint violation (user doesn't exist in users table)
              if (error.code === '23503' && error.message?.includes('cart_user_id_fkey')) {
                console.error('Foreign key constraint error - user profile missing')
                toast.error('User profile not found. Please try again.')
                
                // Try to create user profile and retry
                try {
                  await get().ensureUserProfile(
                    user.id,
                    user.email,
                    user.user_metadata?.name || user.email.split('@')[0]
                  )
                  
                  // Retry adding to cart
                  const { data: retryData, error: retryError } = await supabase
                    .from('cart')
                    .insert([
                      {
                        user_id: user.id,
                        artwork_id: artwork.artwork_id,
                        quantity: Math.min(quantity, artwork.quantity_available || 0),
                        created_at: new Date().toISOString()
                      }
                    ])
                    .select()
                    .single()

                  if (retryError) throw retryError
                  
                  await get().fetchCartItems()
                  toast.success('Item added to cart!')
                  return
                } catch (retryErr) {
                  console.error('Retry failed:', retryErr)
                  throw error
                }
              }
              
              // Handle unique constraint violation (item already in cart)
              if (error.code === '23505') {
                // Fetch existing cart item and update quantity
                const { data: existingCartItem } = await supabase
                  .from('cart')
                  .select('*')
                  .eq('user_id', user.id)
                  .eq('artwork_id', artwork.artwork_id)
                  .single()

                if (existingCartItem) {
                  const updatedQuantity = Math.min(existingCartItem.quantity + quantity, artwork.quantity_available || 0)
                  await supabase
                    .from('cart')
                    .update({ quantity: updatedQuantity })
                    .eq('cart_id', existingCartItem.cart_id)
                  
                  await get().fetchCartItems()
                  toast.success('Item quantity updated in cart!')
                  return
                }
              }
              throw error
            }

            // Refresh cart from database
            await get().fetchCartItems()

            toast.success('Item added to cart!')
          }
        } catch (error) {
          console.error('Error adding to cart:', error)
          const errorMessage = error.message || 'Failed to add item to cart'
          
          if (errorMessage.includes('exceeds available') || errorMessage.includes('quantity')) {
            toast.error('Not enough quantity available')
          } else if (errorMessage.includes('not available')) {
            toast.error('This item is no longer available')
            await get().fetchCartItems() // Refresh to remove invalid items
          } else {
            toast.error(errorMessage)
          }
        }
      },

      // Remove item from cart
      removeItem: async (cartId) => {
        const { user } = get()
        if (!user) {
          toast.error('Please login to modify cart')
          return
        }

        try {
          const { error } = await supabase
            .from('cart')
            .delete()
            .eq('cart_id', cartId)
            .eq('user_id', user.id)

          if (error) throw error

          // Refresh cart from database
          await get().fetchCartItems()

          toast.success('Item removed from cart!')
        } catch (error) {
          console.error('Error removing from cart:', error)
          toast.error('Failed to remove item from cart')
        }
      },

      // Update item quantity
      updateQuantity: async (cartId, quantity) => {
        const { user } = get()
        if (!user) {
          toast.error('Please login to update cart')
          return
        }

        if (quantity <= 0) {
          // If quantity is 0 or less, remove item
          await get().removeItem(cartId)
          return
        }

        try {
          // Get current cart item to check artwork availability
          const cartItem = get().items.find(item => item.cart_id === cartId)
          if (!cartItem) {
            toast.error('Item not found in cart')
            return
          }

          // Validate quantity against available stock
          if (quantity > (cartItem.quantity_available || 0)) {
            toast.error(`Only ${cartItem.quantity_available} items available`)
            return
          }

          const { error } = await supabase
            .from('cart')
            .update({ quantity })
            .eq('cart_id', cartId)
            .eq('user_id', user.id)

          if (error) throw error

          // Refresh cart from database to ensure consistency
          await get().fetchCartItems()

          toast.success('Quantity updated')
        } catch (error) {
          console.error('Error updating quantity:', error)
          toast.error('Failed to update quantity')
          // Refresh cart to sync with database
          await get().fetchCartItems()
        }
      },

      // Clear cart
      clearCart: async () => {
        const { user } = get()
        if (!user) return

        try {
          await supabase
            .from('cart')
            .delete()
            .eq('user_id', user.id)

          set({ items: [] })
          toast.success('Cart cleared!')
        } catch (error) {
          console.error('Error clearing cart:', error)
          toast.error('Failed to clear cart')
        }
      },

      // Fetch cart items
      fetchCartItems: async () => {
        const { user } = get()
        if (!user) return

        try {
          set({ loading: true })
          
          // Try to clean up invalid cart items first (if function exists)
          try {
            await supabase.rpc('remove_unavailable_cart_items')
          } catch (cleanupError) {
            // Function might not exist, continue anyway
            console.log('Cleanup function not available, skipping...')
          }
          
          const { data, error } = await supabase
            .from('cart')
            .select(`
              *,
              artworks (
                artwork_id,
                title,
                artist_name,
                price,
                image_url,
                image_urls,
                quantity_available,
                status,
                category
              )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          if (error) throw error

          // Process cart items - filter out unavailable and null items
          const items = (data || [])
            .map(cartItem => {
              // Skip if artwork data is missing
              if (!cartItem.artworks || !cartItem.artworks.artwork_id) {
                return null
              }
              
              const artwork = cartItem.artworks
              const mediaUrls = getImageUrls(artwork.image_urls)
              let primaryImageUrl = mediaUrls[0] || (artwork.image_url ? getImageUrl(artwork.image_url) : null)
              if (primaryImageUrl === PLACEHOLDER_IMAGE) {
                primaryImageUrl = null
              }
              const isAvailable = (artwork.status === 'Available' || artwork.status === 'available') && (artwork.quantity_available || 0) > 0
              
              // Return valid item with corrected quantity
              return {
                ...artwork,
                image_urls: mediaUrls,
                image_url: primaryImageUrl || null,
                cart_id: cartItem.cart_id,
                quantity: Math.min(cartItem.quantity || 1, artwork.quantity_available || 0)
              }
            })
            .filter(item => {
              if (!item) return false
              const isAvailable = (item.status === 'Available' || item.status === 'available') && (item.quantity_available || 0) > 0
              return isAvailable && (item.quantity || 0) > 0
            })

          set({ items, loading: false })
        } catch (error) {
          console.error('Error fetching cart items:', error)
          toast.error('Failed to load cart items')
          set({ items: [], loading: false })
        }
      },

      // Get total price
      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          return total + (item.price * item.quantity)
        }, 0)
      },

      // Get total items
      getTotalItems: () => {
        return get().items.reduce((total, item) => {
          return total + item.quantity
        }, 0)
      },

      // Process checkout with Razorpay
      processCheckout: async () => {
        const { items, getTotalPrice } = get()
        const { user } = get()
        
        // Get current session to verify user is logged in
        let currentUser = user
        if (!currentUser) {
          try {
            const { data: { session } } = await supabase.auth.getSession()
            currentUser = session?.user || null
            
            if (currentUser) {
              // Update cart store with current user
              set({ user: currentUser })
            }
          } catch (err) {
            console.error('Error getting session:', err)
          }
        }
        
        if (!currentUser) {
          toast.error('Please login to proceed with checkout')
          return { success: false, error: 'User not authenticated' }
        }
        
        if (items.length === 0) {
          toast.error('Your cart is empty')
          return { success: false, error: 'Cart is empty' }
        }
        
        try {
          // Import processPayment dynamically to avoid circular dependency
          const { processPayment } = await import('../services/razorpay')
          
          // Get user profile for payment details
          const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', currentUser.id)
            .single()
          
          const orderData = {
            items,
            totalAmount: getTotalPrice()
          }
          
          const userDetails = {
            id: currentUser.id,
            email: currentUser.email,
            name: userProfile?.name || currentUser.user_metadata?.name || currentUser.email.split('@')[0],
            phone: userProfile?.phone || ''
          }
          
          const result = await processPayment(orderData, userDetails)
          
          if (result.success) {
            toast.success('Order placed successfully!')
            await get().clearCart()
            return { success: true, paymentId: result.paymentId, orderId: result.orderId }
          } else {
            toast.error(result.error || 'Payment failed')
            return { success: false, error: result.error }
          }
        } catch (error) {
          console.error('Checkout error:', error)
          toast.error(error.message || 'Checkout failed. Please try again.')
          return { success: false, error: error.message }
        }
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
)
