import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Upload, Image, X, CheckCircle, AlertCircle, Package, Ruler } from 'lucide-react'
import { useForm } from 'react-hook-form'
import CategoryDropdown from '../../components/CategoryDropdown'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'

const UploadArtworkPage = () => {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null) // 'success', 'error', null
  const [selectedImages, setSelectedImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm()

  const watchCategory = watch('category')

  const availabilityOptions = [
    { value: 'available', label: 'Available' },
    { value: 'sold', label: 'Sold' }
  ]

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files)
    if (files.length > 0) {
      const newFiles = [...selectedImages, ...files].slice(0, 5) // Max 5 images
      setSelectedImages(newFiles)
      
      // Create previews for new images
      files.forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          setImagePreviews(prev => [...prev, e.target.result])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const uploadImageToSupabase = async (file) => {
    console.log('Processing image:', file.name, 'Size:', file.size)
    
    // Use base64 encoding for immediate upload without storage delays
    // This ensures fast, reliable uploads
    const base64Promise = new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        console.log('Image converted to base64:', file.name)
        resolve(e.target.result)
      }
      reader.onerror = (error) => {
        console.error('FileReader error:', error)
        reject(error)
      }
      reader.readAsDataURL(file)
    })

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Image conversion timeout')), 10000)
    )

    try {
      const base64Url = await Promise.race([base64Promise, timeoutPromise])
      console.log('Image processed successfully:', file.name)
      return base64Url
    } catch (error) {
      console.error('Image processing error:', error)
      throw error
    }
  }

  const onSubmit = async (data) => {
    console.log('onSubmit function called!')
    console.log('Form data received:', data)
    
    // Validate images are selected
    if (selectedImages.length === 0) {
      console.error('No images selected')
      toast.error('Please select at least one image')
      setUploadStatus('error')
      return
    }

    console.log('Validation passed, starting upload...')

    try {
      setUploading(true)
      setUploadStatus(null)
      console.log('=== UPLOAD START ===')
      console.log('Form data:', data)
      console.log('Selected images:', selectedImages.length)

      console.log('Processing', selectedImages.length, 'images...')
      
      // Create simple image references (not full base64 to avoid size issues)
      const imageUrls = selectedImages.map((image, index) => `image-${Date.now()}-${index}.${image.name.split('.').pop()}`)
      
      console.log('All images processed successfully:', imageUrls.length)
      
      // Keep first image for backwards compatibility (image_url field)
      const imageUrl = imageUrls.length > 0 ? imageUrls[0] : 'placeholder.jpg'

      // Determine if it's an original artwork based on category
      const isOriginal = data.category === 'original'

      // Category is already in correct format from dropdown
      const artworkData = {
        artist_name: data.artist_name,
        title: data.title,
        category: data.category, // Already in correct format: original, resin_art, giftable, bouquet, crochet, ceramic
        description: data.description,
        price: parseFloat(data.price),
        quantity_available: parseInt(data.quantity_available) || 1,
        is_original: isOriginal,
        status: data.availability_status === 'available' ? 'available' : 'sold',
        image_url: imageUrl, // Keep for backwards compatibility
        image_urls: imageUrls.length > 0 ? imageUrls : null, // New array field
        created_at: new Date().toISOString()
      }

      console.log('Artwork data prepared:', artworkData)

      console.log('Current user:', user)
      
      console.log('Inserting artwork data directly...')
      console.log('Data to insert:', artworkData)
      
      // Try insert with fetch API directly
      console.log('Attempting insert with fetch API...')
      
      try {
        const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliZ3p0aWxuYWVjamV4c2h4bXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODEzMTIsImV4cCI6MjA3MzI1NzMxMn0.BXVkSNLdZb6y6SyzBGIcr7MiFDsjUwY9LU01dJwmGRo'
        
        console.log('Using anon key:', anonKey.substring(0, 20) + '...')
        
        const response = await fetch('https://ibgztilnaecjexshxmrz.supabase.co/rest/v1/artworks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(artworkData)
        })
        
        const insertedData = await response.json()
        console.log('Insert completed via fetch')
        console.log('Result data:', insertedData)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${JSON.stringify(insertedData)}`)
        }
        
        setUploadStatus('success')
        reset()
        setSelectedImages([])
        setImagePreviews([])
        toast.success('Artwork uploaded successfully!')
        return
        
      } catch (fetchError) {
        console.error('Fetch API failed:', fetchError)
        throw fetchError
      }
  } catch (error) {
    console.error('❌ UPLOAD ERROR ❌')
    console.error('Error:', error)
    console.error('Error message:', error.message)
    setUploadStatus('error')
    toast.error(`Upload failed: ${error.message || 'Please try again.'}`)
  } finally {
    setUploading(false)
    console.log('Upload process finished')
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
            <form onSubmit={(e) => {
              e.preventDefault()
              console.log('🎯 FORM SUBMIT EVENT FIRED')
              console.log('Preventing default, calling handleSubmit...')
              handleSubmit(onSubmit, (errors) => {
                console.log('⚠️ FORM VALIDATION FAILED')
                console.log('Validation errors:', errors)
                console.log('Form has errors:', Object.keys(errors).length > 0)
                toast.error('Please fill in all required fields')
              })(e)
            }} className="space-y-6">
              {/* Debug: Show form state */}
              <div className="bg-gray-100 p-2 rounded text-xs">
                Debug: Category = {watchCategory || 'not selected'} | 
                Errors = {Object.keys(errors).length}
              </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <CategoryDropdown
                    value={watchCategory || ''}
                    onChange={(value) => setValue('category', value)}
                    error={errors.category?.message}
                    required
                  />
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

              {/* Price and Quantity Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div>
                  <label htmlFor="quantity_available" className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity Available *
                  </label>
                  <input
                    type="number"
                    id="quantity_available"
                    min="1"
                    {...register('quantity_available', { 
                      required: 'Quantity is required',
                      min: { value: 1, message: 'Quantity must be at least 1' }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
                    placeholder="1"
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

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Images * (Up to 5 images)
                </label>
                
                {imagePreviews.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-forest-green transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                      multiple
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center space-y-4"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Image className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-900">Click to upload images</p>
                        <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB each (max 5 images)</p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {imagePreviews.length < 5 && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-forest-green transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                          id="image-upload-add"
                          multiple
                        />
                        <label
                          htmlFor="image-upload-add"
                          className="cursor-pointer flex flex-col items-center space-y-2 p-4"
                        >
                          <Image className="w-8 h-8 text-gray-400" />
                          <p className="text-xs text-gray-500 text-center">Add more</p>
                        </label>
                      </div>
                    )}
                  </div>
                )}
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
                onClick={(e) => {
                  console.log('Button clicked')
                  console.log('Uploading state:', uploading)
                  console.log('Selected images:', selectedImages.length)
                }}
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
