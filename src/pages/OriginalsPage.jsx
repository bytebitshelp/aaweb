import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ArtworkCard from '../components/ArtworkCard'
import ProductPopup from '../components/ProductPopup'
import { Loader2, Palette } from 'lucide-react'

const OriginalsPage = () => {
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  useEffect(() => {
    fetchArtworks()
  }, [])

  const fetchArtworks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('category', 'original')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching artworks:', error)
        setArtworks([])
      } else {
        setArtworks(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
      setArtworks([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-forest-green mx-auto mb-4" />
          <p className="text-gray-600">Loading original artworks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-max section-padding">
          <div className="text-center">
            <div className="w-16 h-16 bg-forest-green bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Palette className="w-8 h-8 text-forest-green" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Original Artworks
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover unique, one-of-a-kind paintings and drawings created by our talented artists.
            </p>
          </div>
        </div>
      </div>

      {/* Artworks Grid */}
      <div className="container-max section-padding">
        {artworks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No original artworks found
            </h3>
            <p className="text-gray-600">
              Check back soon for new original pieces from our artists.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artworks.map((artwork) => (
              <ArtworkCard
                key={artwork.artwork_id}
                artwork={artwork}
                onView={(artwork) => {
                  setSelectedProduct(artwork)
                  setIsPopupOpen(true)
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Popup */}
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

export default OriginalsPage