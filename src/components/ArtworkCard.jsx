import { useEffect, useState } from 'react'
import { ShoppingCart, Eye } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import ImageCarousel from './ImageCarousel'
import { getImageUrl, getImageUrls, isVideoFile, PLACEHOLDER_IMAGE } from '../lib/imageUtils'

const ArtworkCard = ({ artwork, onView }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { addItem } = useCartStore()
  const { user } = useAuth()

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const galleryMedia = getImageUrls(artwork.image_urls)
  const hasGalleryMedia = galleryMedia.length > 0

  let fallbackMediaUrl = hasGalleryMedia
    ? galleryMedia[0]
    : (artwork.image_url ? getImageUrl(artwork.image_url) : null)

  if (fallbackMediaUrl === PLACEHOLDER_IMAGE) {
    fallbackMediaUrl = null
  }

  const fallbackIsVideo = fallbackMediaUrl ? isVideoFile(fallbackMediaUrl) : false
  const isAvailable =
    (artwork.status === 'Available' || artwork.status === 'available') &&
    (artwork.quantity_available || 0) > 0

  useEffect(() => {
    if (!hasGalleryMedia && !fallbackMediaUrl) {
      setImageLoaded(true)
    }
  }, [hasGalleryMedia, fallbackMediaUrl])

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart')
      return
    }

    if (!isAvailable) {
      toast.error('This artwork is not available')
      return
    }

    await addItem(artwork, 1)
  }


  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden card-hover group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView(artwork)}
    >
      {/* Image Container with Carousel */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 group">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-forest-green rounded-full animate-spin"></div>
          </div>
        )}
        {hasGalleryMedia ? (
          <ImageCarousel 
            images={galleryMedia} 
            alt={`${artwork.title} by ${artwork.artist_name}`}
          />
        ) : fallbackMediaUrl ? (
          fallbackIsVideo ? (
            <video
              src={fallbackMediaUrl}
              className={`w-full h-full object-cover transition-all duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } ${isHovered ? 'scale-105' : 'scale-100'}`}
              onLoadedData={handleImageLoad}
              onError={(e) => {
                e.target.style.display = 'none'
                setImageLoaded(true)
              }}
              controls
              muted
              loop
              playsInline
            />
          ) : (
            <img
              src={fallbackMediaUrl}
              alt={`${artwork.title} by ${artwork.artist_name}`}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              className={`w-full h-full object-cover transition-all duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } ${isHovered ? 'scale-105' : 'scale-100'}`}
              onLoad={handleImageLoad}
              onError={(e) => {
                e.target.src = PLACEHOLDER_IMAGE
                setImageLoaded(true)
              }}
              loading="lazy"
            />
          )
        ) : (
          <img
            src={PLACEHOLDER_IMAGE}
            alt={`${artwork.title} by ${artwork.artist_name}`}
            className="w-full h-full object-cover"
            onLoad={handleImageLoad}
          />
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {isAvailable ? 'Available' : 'Sold'}
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
            {isAvailable && (
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
        
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xl font-bold text-forest-green">
              ₹{artwork.price}
            </span>
            <p className="text-xs text-gray-500">
              {isAvailable
                ? `${artwork.quantity_available} in stock`
                : 'Sold out'
              }
            </p>
          </div>
          <span className="text-xs text-gray-500 capitalize">
            {artwork.category?.replace('_', ' ') || artwork.category || 'Uncategorized'}
          </span>
        </div>

        {/* Availability Status Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (!user) {
              toast.error('Please login to view details')
              onView(artwork)
            } else if (!isAvailable) {
              toast.error('This item is currently out of stock')
              onView(artwork)
            } else {
              onView(artwork)
            }
          }}
          disabled={!isAvailable}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
            isAvailable
              ? 'bg-forest-green text-white hover:bg-forest-green-dark active:bg-forest-green-darker'
              : 'bg-gray-300 text-gray-600 cursor-not-allowed opacity-60'
          }`}
        >
          {isAvailable
            ? 'View Details'
            : 'Sold Out'
          }
        </button>
      </div>
    </div>
  )
}

export default ArtworkCard
