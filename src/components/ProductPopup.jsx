import { X, ShoppingCart, Heart, Package, Ruler, DollarSign } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'
import toast from 'react-hot-toast'

const ProductPopup = ({ product, isOpen, onClose }) => {
  const { user } = useAuth()
  const { addItem } = useCartStore()
  const { addItem: addToWishlist, isInWishlist, removeItem: removeFromWishlist } = useWishlistStore()

  if (!isOpen || !product) return null

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart')
      return
    }

    if (product.status !== 'Available' || product.quantity_available <= 0) {
      toast.error('This item is currently not available')
      return
    }

    await addItem(product, 1)
  }

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error('Please login to manage wishlist')
      return
    }

    if (isInWishlist(product.artwork_id)) {
      // Find the wishlist item and remove it
      const wishlistItem = useWishlistStore.getState().items.find(item => item.artwork_id === product.artwork_id)
      if (wishlistItem) {
        await removeFromWishlist(wishlistItem.wishlist_id)
      }
    } else {
      await addToWishlist(product)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{product.title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row max-h-[calc(90vh-80px)] overflow-hidden">
          {/* Image Section */}
          <div className="lg:w-1/2 p-6">
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Package className="w-24 h-24" />
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="lg:w-1/2 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Artist */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Artist</h3>
                <p className="text-gray-600">{product.artist_name}</p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="w-5 h-5 text-forest-green" />
                    <h4 className="font-medium text-gray-900">Category</h4>
                  </div>
                  <p className="text-gray-600 capitalize">{product.category}</p>
                </div>

                {/* Price */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-5 h-5 text-forest-green" />
                    <h4 className="font-medium text-gray-900">Price</h4>
                  </div>
                  <p className="text-2xl font-bold text-forest-green">${product.price}</p>
                </div>

                {/* Availability */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="w-5 h-5 text-forest-green" />
                    <h4 className="font-medium text-gray-900">Availability</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.status === 'Available' && product.quantity_available > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.status === 'Available' && product.quantity_available > 0
                        ? 'Available'
                        : 'Sold Out / Not Available'
                      }
                    </span>
                    {product.status === 'Available' && product.quantity_available > 0 && (
                      <span className="text-sm text-gray-600">
                        ({product.quantity_available} left)
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Available */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Ruler className="w-5 h-5 text-forest-green" />
                    <h4 className="font-medium text-gray-900">Stock</h4>
                  </div>
                  <p className="text-gray-600">{product.quantity_available} pieces</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.status !== 'Available' || product.quantity_available <= 0}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>
                    {product.status === 'Available' && product.quantity_available > 0
                      ? 'Add to Cart'
                      : 'Not Available'
                    }
                  </span>
                </button>
                
                <button
                  onClick={handleWishlistToggle}
                  className={`flex-1 flex items-center justify-center space-x-2 ${
                    isInWishlist(product.artwork_id)
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'btn-secondary'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isInWishlist(product.artwork_id) ? 'fill-current' : ''}`} />
                  <span>
                    {isInWishlist(product.artwork_id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductPopup
