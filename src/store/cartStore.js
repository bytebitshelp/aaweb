import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
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
          get().fetchCartItems()
        } else {
          set({ items: [] })
        }
      },

      // Add item to cart
      addItem: async (artwork, quantity = 1) => {
        const { user } = get()
        if (!user) {
          toast.error('Please login to add items to cart')
          return
        }

        try {
          const existingItem = get().items.find(item => item.artwork_id === artwork.artwork_id)
          
          if (existingItem) {
            // Update quantity
            const newQuantity = existingItem.quantity + quantity
            if (newQuantity > artwork.quantity_available) {
              toast.error('Not enough quantity available')
              return
            }

            await supabase
              .from('cart')
              .update({ quantity: newQuantity })
              .eq('cart_id', existingItem.cart_id)

            set(state => ({
              items: state.items.map(item =>
                item.artwork_id === artwork.artwork_id
                  ? { ...item, quantity: newQuantity }
                  : item
              )
            }))

            toast.success('Cart updated successfully!')
          } else {
            // Add new item
            const { data, error } = await supabase
              .from('cart')
              .insert([
                {
                  user_id: user.id,
                  artwork_id: artwork.artwork_id,
                  quantity,
                  created_at: new Date().toISOString()
                }
              ])
              .select()
              .single()

            if (error) throw error

            set(state => ({
              items: [...state.items, { ...artwork, cart_id: data.cart_id, quantity }]
            }))

            toast.success('Item added to cart!')
          }
        } catch (error) {
          console.error('Error adding to cart:', error)
          toast.error('Failed to add item to cart')
        }
      },

      // Remove item from cart
      removeItem: async (cartId) => {
        try {
          await supabase
            .from('cart')
            .delete()
            .eq('cart_id', cartId)

          set(state => ({
            items: state.items.filter(item => item.cart_id !== cartId)
          }))

          toast.success('Item removed from cart!')
        } catch (error) {
          console.error('Error removing from cart:', error)
          toast.error('Failed to remove item from cart')
        }
      },

      // Update item quantity
      updateQuantity: async (cartId, quantity) => {
        try {
          await supabase
            .from('cart')
            .update({ quantity })
            .eq('cart_id', cartId)

          set(state => ({
            items: state.items.map(item =>
              item.cart_id === cartId
                ? { ...item, quantity }
                : item
            )
          }))
        } catch (error) {
          console.error('Error updating quantity:', error)
          toast.error('Failed to update quantity')
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
                quantity_available,
                status
              )
            `)
            .eq('user_id', user.id)

          if (error) throw error

          const items = data.map(cartItem => ({
            ...cartItem.artworks,
            cart_id: cartItem.cart_id,
            quantity: cartItem.quantity
          })).filter(item => item.status === 'Available')

          set({ items, loading: false })
        } catch (error) {
          console.error('Error fetching cart items:', error)
          set({ loading: false })
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
        const { items, getTotalPrice, user } = get()
        
        if (!user) {
          toast.error('Please login to proceed with checkout')
          return { success: false }
        }
        
        if (items.length === 0) {
          toast.error('Your cart is empty')
          return { success: false }
        }
        
        try {
          // Import processPayment dynamically to avoid circular dependency
          const { processPayment } = await import('../services/razorpay')
          
          const orderData = {
            items,
            totalAmount: getTotalPrice()
          }
          
          const result = await processPayment(orderData, user)
          
          if (result.success) {
            toast.success('Order placed successfully!')
            await get().clearCart()
            return { success: true, paymentId: result.paymentId }
          } else {
            toast.error('Payment failed')
            return { success: false, error: result.error }
          }
        } catch (error) {
          console.error('Checkout error:', error)
          toast.error('Checkout failed. Please try again.')
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
