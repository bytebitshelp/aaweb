import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ArtworkCard from '../components/ArtworkCard'
import FilterBar from '../components/FilterBar'
import ProductPopup from '../components/ProductPopup'
import { Loader2 } from 'lucide-react'
import { normalizeArtworkMedia, getImageUrl } from '../lib/imageUtils'

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
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching artworks:', error)
        // Use mock data if Supabase is not configured
        setArtworks(getMockArtworks())
      } else {
        const processed = (data || []).map((artwork) => {
          const normalizedMedia = normalizeArtworkMedia(artwork)
          return {
            ...artwork,
            image_urls: normalizedMedia.image_urls,
            image_url: normalizedMedia.image_url
          }
        })

        setArtworks(processed)
      }
    } catch (error) {
      console.error('Error:', error)
      setArtworks(getMockArtworks())
    } finally {
      setLoading(false)
    }
  }

  // Mock data for demonstration
  const getMockArtworks = () => {
    const items = [
    {
      id: '1',
      artist_name: 'Sarah Johnson',
      title: 'Forest Dreams',
      category: 'original',
      description: 'A beautiful acrylic painting capturing the essence of a mystical forest.',
      price: 299.99,
      image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=500&fit=crop',
      availability_status: 'available',
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      artist_name: 'Michael Chen',
      title: 'Ocean Waves',
      category: 'resin_art',
      description: 'Stunning resin art piece with ocean blue tones and metallic accents.',
      price: 199.99,
      image_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=500&fit=crop',
      availability_status: 'available',
      created_at: '2024-01-14T15:30:00Z'
    },
    {
      id: '3',
      artist_name: 'Emma Rodriguez',
      title: 'Sunset Bouquet',
      category: 'bouquet',
      description: 'Artistic flower arrangement perfect for special occasions.',
      price: 89.99,
      image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=500&h=500&fit=crop',
      availability_status: 'sold',
      created_at: '2024-01-13T09:15:00Z'
    },
    {
      id: '4',
      artist_name: 'David Park',
      title: 'Gift Hamper Deluxe',
      category: 'giftable',
      description: 'Premium gift hamper with art supplies and handmade items.',
      price: 149.99,
      image_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=500&fit=crop',
      availability_status: 'available',
      created_at: '2024-01-12T14:20:00Z'
    },
    {
      id: '5',
      artist_name: 'Lisa Wang',
      title: 'Abstract Emotions',
      category: 'original',
      description: 'Bold abstract painting expressing deep emotions through color.',
      price: 399.99,
      image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=500&fit=crop',
      availability_status: 'available',
      created_at: '2024-01-11T11:45:00Z'
    },
    {
      id: '6',
      artist_name: 'James Wilson',
      title: 'Geometric Harmony',
      category: 'resin_art',
      description: 'Modern geometric resin art with perfect symmetry and balance.',
      price: 249.99,
      image_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=500&fit=crop',
      availability_status: 'available',
      created_at: '2024-01-10T16:30:00Z'
    }
  ]

    return items.map(item => ({
      ...item,
      image_urls: item.image_url ? [getImageUrl(item.image_url)] : [],
      image_url: item.image_url ? getImageUrl(item.image_url) : null
    }))
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-max section-padding">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
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
