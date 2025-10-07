import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Loader2, Palette } from 'lucide-react'

const OriginalsPage = () => {
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
                      <Palette className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{artwork.title}</h3>
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
        )}
      </div>
    </div>
  )
}

export default OriginalsPage