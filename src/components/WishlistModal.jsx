import { X, Heart, ShoppingCart } from 'lucide-react'
import { useWishlistStore } from '../store/wishlistStore'
import { useCartStore } from '../store/cartStore'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const WishlistModal = ({ isOpen, onClose }) => {
  const { items, removeItem } = useWishlistStore()
  const { addItem } = useCartStore()
  const { user } = useAuth()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Heart className="w-5 h-5 text-forest-green" />
            Wishlist ({items.length})
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 max-h-[70vh]">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Save pieces you love and find them here later.
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.artwork_id} className="flex items-center gap-4 p-4 border rounded-xl">
                  <img
                    src={item.image_url || '/placeholder-art.jpg'}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    <p className="text-sm text-forest-green">₹{item.price}</p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!user) {
                        toast.error('Please sign in to add to cart')
                        return
                      }
                      await addItem(item, 1)
                    }}
                    className="p-2 rounded-full bg-forest-green text-white"
                    aria-label="Add to cart"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeItem(item.artwork_id)}
                    className="p-2 rounded-full hover:bg-red-50 text-red-500"
                    aria-label="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WishlistModal
