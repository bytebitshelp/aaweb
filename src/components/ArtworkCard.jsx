import { useState } from 'react'
import { Heart, ShoppingCart, Eye } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import ImageCarousel from './ImageCarousel'

const ArtworkCard = ({ artwork, onView }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { addItem } = useCartStore()
  const { addItem: addToWishlist, isInWishlist, removeItem: removeFromWishlist } = useWishlistStore()
  const { user } = useAuth()

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart')
      return
    }

    if (artwork.status !== 'Available') {
      toast.error('This artwork is not available')
      return
    }

    if (artwork.quantity_available <= 0) {
      toast.error('Out of stock')
      return
    }

    await addItem(artwork, 1)
  }

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error('Please login to manage wishlist')
      return
    }

    if (isInWishlist(artwork.artwork_id)) {
      // Find the wishlist item and remove it
      const wishlistItem = useWishlistStore.getState().items.find(item => item.artwork_id === artwork.artwork_id)
      if (wishlistItem) {
        await removeFromWishlist(wishlistItem.wishlist_id)
      }
    } else {
      await addToWishlist(artwork)
    }
  }

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden card-hover group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with Carousel */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 group">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-forest-green rounded-full animate-spin"></div>
          </div>
        )}
        {artwork.image_urls && artwork.image_urls.length > 0 ? (
          <ImageCarousel 
            images={artwork.image_urls} 
            alt={`${artwork.title} by ${artwork.artist_name}`}
          />
        ) : (
          <img
            src={artwork.image_url || '/placeholder-art.jpg'}
            alt={`${artwork.title} by ${artwork.artist_name}`}
            className={`w-full h-full object-cover transition-all duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } ${isHovered ? 'scale-105' : 'scale-100'}`}
            onLoad={handleImageLoad}
            loading="lazy"
          />
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              artwork.status === 'Available' && artwork.quantity_available > 0
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {artwork.status === 'Available' && artwork.quantity_available > 0 ? 'Available' : 'Sold Out'}
          </span>
        </div>

        {/* Action Buttons */}
        <div
          className={`absolute inset-0 bg-black bg-opacity-0 transition-all duration-300 flex items-center justify-center ${
            isHovered ? 'bg-opacity-30' : ''
          }`}
        >
          <div
            className={`flex space-x-2 transition-all duration-300 ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                onView(artwork)
              }}
              className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
            >
              <Eye className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleWishlistToggle()
              }}
              className={`p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all ${
                isInWishlist(artwork.artwork_id) ? 'text-red-500' : 'text-gray-700'
              }`}
            >
              <Heart className={`w-4 h-4 ${isInWishlist(artwork.artwork_id) ? 'fill-current' : ''}`} />
            </button>
            {artwork.status === 'Available' && artwork.quantity_available > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleAddToCart()
                }}
                className="p-2 bg-forest-green bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
              >
                <ShoppingCart className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {artwork.title}
          </h3>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {artwork.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-forest-green">
              ₹{artwork.price}
            </span>
            {artwork.quantity_available > 0 && (
              <p className="text-xs text-gray-500">
                {artwork.quantity_available} available
              </p>
            )}
          </div>
          <span className="text-xs text-gray-500 capitalize">
            {artwork.category.replace('_', ' ')}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ArtworkCard
