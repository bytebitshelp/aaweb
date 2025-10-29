import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ArtworkCard from '../components/ArtworkCard'
import ProductPopup from '../components/ProductPopup'
import { Loader2, ShoppingBag } from 'lucide-react'

const CeramicArtPage = () => {
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
        .eq('category', 'ceramic')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching ceramic artworks:', error)
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
          <p className="text-gray-600">Loading ceramic artworks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-forest-green to-green-700 text-white py-20">
        <div className="container-max text-center">
          <h1 className="text-5xl font-bold mb-6">Ceramic Art</h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Explore stunning ceramic masterpieces that blend functionality with artistic beauty.
          </p>
        </div>
      </div>

      {/* Artworks Grid */}
      <div className="container-max py-12">
        {artworks.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Ceramic Items Found</h3>
            <p className="text-gray-600 mb-8">
              Check back soon for new ceramic creations!
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Ceramic Collection ({artworks.length} items)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
          </>
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

export default CeramicArtPage
