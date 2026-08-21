import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import toast from 'react-hot-toast'

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (artwork) => {
        if (!artwork?.artwork_id) return
        if (get().items.some((item) => item.artwork_id === artwork.artwork_id)) {
          toast('Already in your wishlist')
          return
        }
        set({ items: [...get().items, artwork] })
        toast.success('Saved to wishlist')
      },

      removeItem: (artworkId) => {
        set({ items: get().items.filter((item) => item.artwork_id !== artworkId) })
        toast.success('Removed from wishlist')
      },

      toggleItem: (artwork) => {
        if (get().isInWishlist(artwork.artwork_id)) {
          get().removeItem(artwork.artwork_id)
        } else {
          get().addItem(artwork)
        }
      },

      isInWishlist: (artworkId) => get().items.some((item) => item.artwork_id === artworkId),
      getTotalItems: () => get().items.length,
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
)
