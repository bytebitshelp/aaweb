import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Upload, Link2, CheckCircle, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'

const UploadArtworkPage = () => {
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null) // 'success', 'error', null
  const [imageUrlsInput, setImageUrlsInput] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm()

  const categories = [
    { value: 'original', label: 'Original Artwork' },
    { value: 'resin_art', label: 'Resin Art' },
    { value: 'giftable', label: 'Giftable Item' },
    { value: 'bouquet', label: 'Bouquet' }
  ]

  const availabilityOptions = [
    { value: 'available', label: 'Available' },
    { value: 'sold', label: 'Sold' }
  ]

  const parseImageUrls = (input) => {
    if (!input) return []
    return input
      .split(/\r?\n|,/)
      .map((url) => url.trim())
      .filter(Boolean)
  }
  const parsedImageUrls = parseImageUrls(imageUrlsInput)

  const onSubmit = async (data) => {
    try {
      setUploading(true)
      setUploadStatus(null)

      if (parsedImageUrls.length === 0) {
        throw new Error('Please enter at least one image URL')
      }

      const imageUrl = parsedImageUrls[0] || null

      const artworkData = {
        ...data,
        price: parseFloat(data.price),
        image_url: imageUrl,
        image_urls: parsedImageUrls,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('artworks')
        .insert([artworkData])

      if (error) {
        throw error
      }

      setUploadStatus('success')
      reset()
      setImageUrlsInput('')
    } catch (error) {
      console.error('Error uploading artwork:', error)
      setUploadStatus('error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-max section-padding">
          <div className="text-center">
            <div className="w-16 h-16 bg-forest-green bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Upload className="w-8 h-8 text-forest-green" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Upload Artwork
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Share your creative work with the world. Upload your artwork and 
              let others discover your talent.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Form */}
      <div className="container-max section-padding">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Artist Name */}
              <div>
                <label htmlFor="artist_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Artist Name *
                </label>
                <input
                  type="text"
                  id="artist_name"
                  {...register('artist_name', { required: 'Artist name is required' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
                  placeholder="Enter your name"
                />
                {errors.artist_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.artist_name.message}</p>
                )}
              </div>

              {/* Artwork Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Artwork Title *
                </label>
                <input
                  type="text"
                  id="title"
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
                  placeholder="Enter artwork title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Category and Availability Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    {...register('category', { required: 'Category is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="availability_status" className="block text-sm font-medium text-gray-700 mb-2">
                    Availability *
                  </label>
                  <select
                    id="availability_status"
                    {...register('availability_status', { required: 'Availability is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
                  >
                    <option value="">Select availability</option>
                    {availabilityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.availability_status && (
                    <p className="mt-1 text-sm text-red-600">{errors.availability_status.message}</p>
                  )}
                </div>
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  id="price"
                  step="0.01"
                  min="0"
                  {...register('price', { 
                    required: 'Price is required',
                    min: { value: 0, message: 'Price must be positive' }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  rows={4}
                  {...register('description', { required: 'Description is required' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent resize-none"
                  placeholder="Describe your artwork..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Image URLs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URLs * (one per line)
                </label>
                <div className="space-y-3">
                  <textarea
                    rows={4}
                    value={imageUrlsInput}
                    onChange={(e) => setImageUrlsInput(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  />
                  <p className="text-xs text-gray-500 flex items-center space-x-2">
                    <Link2 className="w-4 h-4" />
                    <span>Paste one image URL per line. The first URL will be used as the primary image.</span>
                  </p>
                  {parsedImageUrls.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {parsedImageUrls.map((url, index) => (
                        <div key={url + index} className="space-y-2">
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={url}
                              alt={`Image ${index + 1}`}
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = '/placeholder-art.jpg'
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 break-all">
                            {url}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Messages */}
              {uploadStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <p className="text-green-800 font-medium">
                    Artwork uploaded successfully!
                  </p>
                </div>
              )}

              {uploadStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-800 font-medium">
                    Error uploading artwork. Please try again.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uploading}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Upload Artwork</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadArtworkPage
