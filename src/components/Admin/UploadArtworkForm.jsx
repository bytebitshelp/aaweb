import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '../../lib/supabase'
import { Upload, Link2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const UploadArtworkForm = () => {
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [imageUrlsInput, setImageUrlsInput] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm()

  const categories = [
    { value: 'original', label: 'Original Artwork' },
    { value: 'resin', label: 'Resin Art' },
    { value: 'giftable', label: 'Giftable Item' },
    { value: 'bouquet', label: 'Bouquet' },
    { value: 'crochet', label: 'Crochet Art' },
    { value: 'ceramic', label: 'Ceramic Art' }
  ]

  const parseImageUrls = (input) => {
    if (!input) return []
    return input
      .split(/\r?\n|,/)
      .map((url) => url.trim())
      .filter(Boolean)
  }

  const parsedImageUrls = useMemo(() => parseImageUrls(imageUrlsInput), [imageUrlsInput])

  const onSubmit = async (data) => {
    try {
      setUploading(true)
      setUploadStatus(null)

      if (parsedImageUrls.length === 0) {
        throw new Error('Please provide at least one image URL')
      }

      // Map category values to match actual database constraint
      const categoryMapping = {
        'original': 'original',
        'resin': 'resin_art',
        'giftable': 'giftable',
        'bouquet': 'bouquet',
        'crochet': 'crochet',
        'ceramic': 'ceramic'
      }

      const artworkData = {
        artist_name: data.artist_name,
        title: data.title,
        category: categoryMapping[data.category] || data.category.charAt(0).toUpperCase() + data.category.slice(1),
        description: data.description,
        price: parseFloat(data.price),
        quantity_available: parseInt(data.quantity_available),
        is_original: data.category === 'original',
        status: data.quantity_available > 0 ? 'available' : 'sold',
        image_url: parsedImageUrls[0] || null,
        image_urls: parsedImageUrls,
        created_at: new Date().toISOString()
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
      toast.success('Artwork uploaded successfully!')
    } catch (error) {
      console.error('Error uploading artwork:', error)
      setUploadStatus('error')
      toast.error('Failed to upload artwork')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                placeholder="Enter artist name"
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category */}
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

            {/* Quantity Available */}
            <div>
              <label htmlFor="quantity_available" className="block text-sm font-medium text-gray-700 mb-2">
                Quantity Available *
              </label>
              <input
                type="number"
                id="quantity_available"
                min="0"
                {...register('quantity_available', { 
                  required: 'Quantity is required',
                  min: { value: 0, message: 'Quantity must be non-negative' }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
                placeholder="0"
              />
              {errors.quantity_available && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity_available.message}</p>
              )}
            </div>
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                <Loader2 className="w-5 h-5 animate-spin" />
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
  )
}

export default UploadArtworkForm
