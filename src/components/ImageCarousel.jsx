import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getImageUrl, getImageUrls, isVideoFile } from '../lib/imageUtils'

const ImageCarousel = ({ images, alt = 'Product image' }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToImage = (index) => {
    setCurrentIndex(index)
  }

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-200 flex items-center justify-center rounded-lg">
        <span className="text-gray-400">No images available</span>
      </div>
    )
  }

  // Convert all media URLs to full accessible URLs
  const displayImages = getImageUrls(images)
  const hasMultipleImages = displayImages.length > 1

  // Check if current item is a video
  const currentUrl = displayImages[currentIndex] || ''
  const isVideo = isVideoFile(currentUrl)

  return (
    <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-lg">
      {/* Main Media */}
      <div className="relative w-full h-full">
        {isVideo ? (
          <video
            src={currentUrl || '/placeholder-art.jpg'}
            className="w-full h-full object-cover transition-all duration-300"
            controls
            muted
            loop
            playsInline
            onError={(e) => {
              console.error('Video failed to load:', currentUrl)
              e.target.style.display = 'none'
            }}
          />
        ) : (
          <img
            src={currentUrl || '/placeholder-art.jpg'}
            alt={`${alt} ${currentIndex + 1}`}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            className="w-full h-full object-cover transition-all duration-300"
            onError={(e) => {
              const failedUrl = displayImages[currentIndex]
              console.error('Image failed to load:', failedUrl)
              
              // Check if it's a HEIC file
              if (failedUrl && (failedUrl.includes('.heic') || failedUrl.includes('.HEIC'))) {
                console.warn('HEIC file cannot be displayed in browser. Please re-upload as JPEG/PNG.')
              }
              
              // Don't retry if already showing placeholder
              if (e.target.src !== window.location.origin + '/placeholder-art.jpg') {
                e.target.src = '/placeholder-art.jpg'
              }
            }}
          />
        )}

        {/* Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-gray-800" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-gray-800" />
            </button>
          </>
        )}
      </div>

      {/* Image Indicators/Dots */}
      {hasMultipleImages && displayImages.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
          {displayImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-6'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Image Counter */}
      {hasMultipleImages && (
        <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 text-white text-xs rounded-full">
          {currentIndex + 1} / {displayImages.length}
        </div>
      )}
    </div>
  )
}

export default ImageCarousel

