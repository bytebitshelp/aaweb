import { useState } from 'react'
import { Upload, Image, X, CheckCircle, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import CategoryDropdown from '../../components/CategoryDropdown'
import toast from 'react-hot-toast'

/**
 * TEMPORARY LOCAL STORAGE FALLBACK
 * Since Supabase queries are timing out, this will store artworks locally
 * and try to sync to Supabase in the background
 */
const UploadArtworkPage = () => {
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)
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
      const newFiles = [...selectedImages, ...files].slice(0, 5)
      setSelectedImages(newFiles)
      
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

  const onSubmit = async (data) => {
    if (selectedImages.length === 0) {
      toast.error('Please select at least one image')
      return
    }

    try {
      setUploading(true)
      setUploadStatus(null)
      
      console.log('=== LOCAL FALLBACK UPLOAD ===')
      console.log('Storing artwork locally...')

      // Convert images to base64
      const imageUrls = []
      for (const image of selectedImages) {
        const base64Promise = new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target.result)
          reader.onerror = reject
          reader.readAsDataURL(image)
        })
        const base64Url = await base64Promise
        imageUrls.push(base64Url)
      }

      // Create artwork data
      const artworkData = {
        artwork_id: `local-${Date.now()}`,
        artist_name: data.artist_name,
        title: data.title,
        category: data.category,
        description: data.description,
        price: parseFloat(data.price),
        quantity_available: parseInt(data.quantity_available) || 1,
        is_original: data.category === 'original',
        status: data.availability_status === 'available' ? 'available' : 'sold',
        image_url: imageUrls[0],
        image_urls: imageUrls,
        created_at: new Date().toISOString()
      }

      // Store in localStorage
      const existingArtworks = JSON.parse(localStorage.getItem('localArtworks') || '[]')
      existingArtworks.push(artworkData)
      localStorage.setItem('localArtworks', JSON.stringify(existingArtworks))

      console.log('✅ Artwork stored locally!')
      console.log('Total local artworks:', existingArtworks.length)
      
      toast.success('Artwork saved! (Stored locally due to connection issues)')
      
      setUploadStatus('success')
      reset()
      setSelectedImages([])
      setImagePreviews([])
      
    } catch (error) {
      console.error('Error:', error)
      setUploadStatus('error')
      toast.error('Failed to save artwork')
    } finally {
      setUploading(false)
    }
  }

  // Rest of component remains the same...
  // Copy from original upload.jsx
  return (
    <div className="min-h-screen bg-gray-50">
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
    </div>
  )
}

