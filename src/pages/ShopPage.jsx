import { useState, useEffect } from 'react'
import { fetchPublicArtworks } from '../lib/supabase'
import ArtworkCard from '../components/ArtworkCard'
import FilterBar from '../components/FilterBar'
import ProductPopup from '../components/ProductPopup'
import { Loader2 } from 'lucide-react'
import { normalizeArtworkMedia } from '../lib/imageUtils'

const ShopPage = () => {
  const [artworks, setArtworks] = useState([])
  const [filteredArtworks, setFilteredArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  // Fetch artworks from Supabase
  useEffect(() => {
    fetchArtworks()
  }, [])

  const fetchArtworks = async () => {
    try {
      setLoading(true)
      const data = await fetchPublicArtworks()
      const processed = (data || []).map((artwork) => {
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

  // Get unique categories
  const categories = [...new Set(artworks.map(artwork => artwork.category))]

  // Filter and sort artworks
  useEffect(() => {
    let filtered = artworks

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(artwork => artwork.category === selectedCategory)
    }

    // Sort artworks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at)
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at)
        case 'price_low':
          return a.price - b.price
        case 'price_high':
          return b.price - a.price
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    setFilteredArtworks(filtered)
  }, [artworks, selectedCategory, sortBy])

  const handleViewArtwork = (artwork) => {
    setSelectedProduct(artwork)
    setIsPopupOpen(true)
  }

  const handleClosePopup = () => {
    setIsPopupOpen(false)
    setSelectedProduct(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-forest-green mx-auto mb-4" />
          <p className="text-gray-600">Loading artworks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-max section-padding">
          <div className="text-center">
            <h1 className="font-display text-4xl md:text-5xl text-gray-900 mb-4">
              Art Gallery
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover unique artworks created by talented artists. From original paintings 
              to resin art, giftables, and beautiful bouquets.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={filteredArtworks.length}
      />

      {/* Artworks Grid */}
      <div className="container-max section-padding">
        {filteredArtworks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-gray-400">🎨</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No artworks found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or check back later for new pieces.
            </p>
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1 max-w-4xl mx-auto'
            }`}
          >
            {filteredArtworks.map((artwork) => (
              <ArtworkCard
                key={artwork.artwork_id || artwork.id}
                artwork={artwork}
                onView={handleViewArtwork}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Popup */}
      <ProductPopup
        product={selectedProduct}
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
      />
    </div>
  )
}

export default ShopPage
