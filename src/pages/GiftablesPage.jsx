import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Loader2, Gift } from 'lucide-react'

const GiftablesPage = () => {
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArtworks()
  }, [])

  const fetchArtworks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('category', 'giftable')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching giftable artworks:', error)
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
          <p className="text-gray-600">Loading giftable items...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-forest-green to-green-700 text-white py-20">
        <div className="container-max text-center">
          <h1 className="text-5xl font-bold mb-6">Giftables</h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Perfect gifts for your loved ones. Handcrafted items that bring joy and beauty.
          </p>
        </div>
      </div>

      {/* Artworks Grid */}
      <div className="container-max py-12">
        {artworks.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gift className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Giftable Items Found</h3>
            <p className="text-gray-600 mb-8">
              Check back soon for new giftable creations!
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Giftable Collection ({artworks.length} items)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {artworks.map((artwork) => (
                <div key={artwork.artwork_id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="aspect-square bg-gray-200">
                    {artwork.image_url ? (
                      <img
                        src={artwork.image_url}
                        alt={artwork.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Gift className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{artwork.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">by {artwork.artist_name}</p>
                    <p className="text-gray-700 text-sm mb-3 line-clamp-2">{artwork.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-forest-green">₹{artwork.price}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        artwork.status === 'available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {artwork.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default GiftablesPage