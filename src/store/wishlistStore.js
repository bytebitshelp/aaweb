import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      user: null,

      // Set user when auth state changes
      setUser: (user) => {
        set({ user })
        if (user) {
          get().fetchWishlistItems()
        } else {
          set({ items: [] })
        }
      },

      // Add item to wishlist
      addItem: async (artwork) => {
        const { user } = get()
        if (!user) {
          toast.error('Please login to add items to wishlist')
          return
        }

        try {
          // Check if item already exists in wishlist
          const existingItem = get().items.find(item => item.artwork_id === artwork.artwork_id)
          
          if (existingItem) {
            toast.error('Item already in wishlist')
            return
          }

          const { data, error } = await supabase
            .from('wishlist')
            .insert([
              {
                user_id: user.id,
                artwork_id: artwork.artwork_id,
                created_at: new Date().toISOString()
              }
            ])
            .select()
            .single()

          if (error) throw error

          set(state => ({
            items: [...state.items, { ...artwork, wishlist_id: data.wishlist_id }]
          }))

          toast.success('Added to wishlist!')
        } catch (error) {
          console.error('Error adding to wishlist:', error)
          toast.error('Failed to add item to wishlist')
        }
      },

      // Remove item from wishlist
      removeItem: async (wishlistId) => {
        try {
          await supabase
            .from('wishlist')
            .delete()
            .eq('wishlist_id', wishlistId)

          set(state => ({
            items: state.items.filter(item => item.wishlist_id !== wishlistId)
          }))

          toast.success('Removed from wishlist!')
        } catch (error) {
          console.error('Error removing from wishlist:', error)
          toast.error('Failed to remove item from wishlist')
        }
      },

      // Clear wishlist
      clearWishlist: async () => {
        const { user } = get()
        if (!user) return

        try {
          await supabase
            .from('wishlist')
            .delete()
            .eq('user_id', user.id)

          set({ items: [] })
          toast.success('Wishlist cleared!')
        } catch (error) {
          console.error('Error clearing wishlist:', error)
          toast.error('Failed to clear wishlist')
        }
      },

      // Fetch wishlist items
      fetchWishlistItems: async () => {
        const { user } = get()
        if (!user) return

        try {
          set({ loading: true })
          const { data, error } = await supabase
            .from('wishlist')
            .select(`
              *,
              artworks (
                artwork_id,
                title,
                artist_name,
                price,
                image_url,
                quantity_available,
                status,
                category
              )
            `)
            .eq('user_id', user.id)

          if (error) throw error

          const items = data.map(wishlistItem => ({
            ...wishlistItem.artworks,
            wishlist_id: wishlistItem.wishlist_id
          })).filter(item => item.status === 'Available')

          set({ items, loading: false })
        } catch (error) {
          console.error('Error fetching wishlist items:', error)
          set({ loading: false })
        }
      },

      // Check if item is in wishlist
      isInWishlist: (artworkId) => {
        return get().items.some(item => item.artwork_id === artworkId)
      },

      // Get total items
      getTotalItems: () => {
        return get().items.length
      }
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
)
