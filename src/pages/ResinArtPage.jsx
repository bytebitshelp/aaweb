import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ArtworkCard from '../components/ArtworkCard'
import ProductPopup from '../components/ProductPopup'
import FilterBar from '../components/FilterBar'
import { Loader2, Sparkles } from 'lucide-react'

const ResinArtPage = () => {
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  useEffect(() => {
    fetchResinArtworks()
  }, [])

  const fetchResinArtworks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('category', 'resin_art')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching resin artworks:', error)
        setArtworks(getMockResinArtworks())
      } else {
        setArtworks(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
      setArtworks(getMockResinArtworks())
    } finally {
      setLoading(false)
    }
  }

  const getMockResinArtworks = () => [
    {
      id: '1',
      artist_name: 'Michael Chen',
      title: 'Ocean Waves',
      category: 'resin_art',
      description: 'Stunning resin art piece with ocean blue tones and metallic accents that shimmer in the light.',
      price: 199.99,
      image_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=500&fit=crop',
      availability_status: 'available',
      created_at: '2024-01-14T15:30:00Z'
    },
    {
      id: '2',
      artist_name: 'James Wilson',
      title: 'Geometric Harmony',
      category: 'resin_art',
      description: 'Modern geometric resin art with perfect symmetry and balance, featuring gold leaf accents.',
      price: 249.99,
      image_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=500&fit=crop',
      availability_status: 'available',
      created_at: '2024-01-10T16:30:00Z'
    },
    {
      id: '3',
      artist_name: 'Sofia Martinez',
      title: 'Cosmic Dreams',
      category: 'resin_art',
      description: 'Deep space-inspired resin art with swirling galaxies and embedded glitter for a magical effect.',
      price: 179.99,
      image_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=500&fit=crop',
      availability_status: 'sold',
      created_at: '2024-01-07T11:15:00Z'
    },
    {
      id: '4',
      artist_name: 'Alex Thompson',
      title: 'Forest Floor',
      category: 'resin_art',
      description: 'Nature-inspired resin art with preserved leaves and flowers, creating a beautiful natural scene.',
      price: 229.99,
      image_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=500&fit=crop',
      availability_status: 'available',
      created_at: '2024-01-04T13:45:00Z'
    },
    {
      id: '5',
      artist_name: 'Rachel Green',
      title: 'Sunset Glow',
      category: 'resin_art',
      description: 'Warm sunset colors captured in resin with a gradient effect from orange to deep purple.',
      price: 159.99,
      image_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=500&fit=crop',
      availability_status: 'available',
      created_at: '2024-01-02T09:20:00Z'
    },
    {
      id: '6',
      artist_name: 'Kevin Liu',
      title: 'Abstract Flow',
      category: 'resin_art',
      description: 'Fluid abstract resin art with organic shapes and vibrant color transitions.',
      price: 189.99,
      image_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=500&fit=crop',
      availability_status: 'available',
      created_at: '2024-01-01T14:10:00Z'
    }
  ]

  const categories = ['all'] // Only resin art category for this page

  // Filter and sort artworks
  const filteredArtworks = artworks.slice().sort((a, b) => {
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

  const handleViewArtwork = (artwork) => {
    setSelectedProduct(artwork)
    setIsPopupOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-forest-green mx-auto mb-4" />
          <p className="text-gray-600">Loading resin artworks...</p>
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
              <Sparkles className="w-8 h-8 text-forest-green" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Resin Art Collection
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our stunning collection of resin art pieces. Each piece is carefully crafted 
              with vibrant colors, unique textures, and mesmerizing depth that catches the light beautifully.
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
              <Sparkles className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No resin artworks found
            </h3>
            <p className="text-gray-600">
              Check back soon for new resin art pieces from our talented artists.
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
        onClose={() => {
          setIsPopupOpen(false)
          setSelectedProduct(null)
        }}
      />
    </div>
  )
}

export default ResinArtPage
