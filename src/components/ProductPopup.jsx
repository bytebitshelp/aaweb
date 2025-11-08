import { X, ShoppingCart, Package, Ruler, DollarSign, CreditCard } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'
import { getImageUrl, getImageUrls, isVideoFile, PLACEHOLDER_IMAGE } from '../lib/imageUtils'
import ImageCarousel from './ImageCarousel'

const ProductPopup = ({ product, isOpen, onClose }) => {
  const { user } = useAuth()
  const { addItem } = useCartStore()

  if (!isOpen || !product) return null

  const galleryMedia = getImageUrls(product.image_urls)
  const hasGalleryMedia = galleryMedia.length > 0
  let fallbackMediaUrl = hasGalleryMedia
    ? galleryMedia[0]
    : (product.image_url ? getImageUrl(product.image_url) : null)

  if (fallbackMediaUrl === PLACEHOLDER_IMAGE) {
    fallbackMediaUrl = null
  }

  const fallbackIsVideo = fallbackMediaUrl ? isVideoFile(fallbackMediaUrl) : false
  const isAvailable =
    (product.status === 'Available' || product.status === 'available') &&
    (product.quantity_available || 0) > 0

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart')
      return
    }

    if (!isAvailable) {
      toast.error('This item is currently not available')
      return
    }

    await addItem(product, 1)
  }

  const handleBuyNow = () => {
    window.open('https://www.instagram.com/artyaffairs', '_blank', 'noopener,noreferrer')
    onClose()
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
          {/* Media Section */}
          <div className="lg:w-1/2 p-6">
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
              {hasGalleryMedia ? (
                <ImageCarousel 
                  images={galleryMedia} 
                  alt={product.title}
                />
              ) : fallbackMediaUrl ? (
                fallbackIsVideo ? (
                  <video
                    src={fallbackMediaUrl}
                    className="w-full h-full object-cover"
                    controls
                    muted
                    loop
                    playsInline
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                ) : (
                  <img
                    src={fallbackMediaUrl}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = PLACEHOLDER_IMAGE
                    }}
                  />
                )
              ) : (
                <img
                  src={PLACEHOLDER_IMAGE}
                  alt={product.title}
                  className="w-full h-full object-cover opacity-70"
                />
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
                  <p className="text-2xl font-bold text-forest-green">₹{product.price}</p>
                </div>

                {/* Availability */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="w-5 h-5 text-forest-green" />
                    <h4 className="font-medium text-gray-900">Availability</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isAvailable ? 'Available' : 'Sold'}
                    </span>
                    {isAvailable && (
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
                  <p className="text-gray-600">
                    {isAvailable ? `${product.quantity_available} pieces` : 'Sold out'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                {isAvailable ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 btn-primary flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>Add to Cart</span>
                    </button>
                    
                    <button
                      onClick={handleBuyNow}
                      className="flex-1 bg-forest-green hover:bg-forest-green-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                    >
                      <CreditCard className="w-5 h-5" />
                      <span>Buy on Instagram</span>
                    </button>
                  </div>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-600 px-6 py-3 rounded-lg font-semibold opacity-70 cursor-not-allowed"
                  >
                    Sold Out
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductPopup
