import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { fetchPublicArtworks } from '../lib/supabase'
import { normalizeArtworkMedia } from '../lib/imageUtils'
import ArtworkCard from './ArtworkCard'
import ProductPopup from './ProductPopup'

const CategoryGallery = ({
  title,
  subtitle,
  icon: Icon,
  category,
  emptyTitle,
  emptyMessage
}) => {
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setLoading(true)
        const data = await fetchPublicArtworks()
        const processed = (data || [])
          .filter((artwork) => artwork.category === category)
          .map((artwork) => {
            const normalizedMedia = normalizeArtworkMedia(artwork)
            return {
              ...artwork,
              image_urls: normalizedMedia.image_urls,
              image_url: normalizedMedia.image_url
            }
          })

        setArtworks(processed)
      } catch (error) {
        console.error('Error:', error)
        setArtworks([])
      } finally {
        setLoading(false)
      }
    }

    fetchArtworks()
  }, [category])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-forest-green mx-auto mb-4" />
          <p className="text-gray-600">Loading collection...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-white border-b border-gray-100">
        <div className="container-max section-padding">
          <div className="text-center max-w-2xl mx-auto">
            {Icon && (
              <div className="w-16 h-16 bg-forest-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon className="w-8 h-8 text-forest-green" />
              </div>
            )}
            <h1 className="font-display text-4xl md:text-5xl text-gray-900 mb-4">{title}</h1>
            <p className="text-lg text-gray-600">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="container-max section-padding">
        {artworks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {emptyTitle || `No ${title.toLowerCase()} found`}
            </h3>
            <p className="text-gray-600">
              {emptyMessage || 'Check back soon — new pieces are added regularly.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artworks.map((artwork) => (
              <ArtworkCard
                key={artwork.artwork_id || artwork.id}
                artwork={artwork}
                onView={(item) => {
                  setSelectedProduct(item)
                  setIsPopupOpen(true)
                }}
              />
            ))}
          </div>
        )}
      </div>

      <ProductPopup
        product={selectedProduct}
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false)
          setSelectedProduct(null)
        }}
      />
    </div>
  )
}

export default CategoryGallery
