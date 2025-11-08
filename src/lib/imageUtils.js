import { supabase } from './supabase'

export const PLACEHOLDER_IMAGE = '/placeholder-art.jpg'

const stripWrappingQuotes = (value) => {
  if (typeof value !== 'string') {
    return value
  }

  let result = value.trim()

  // Replace escaped quotes
  result = result.replace(/\\+"/g, '"').replace(/\\+'/g, "'")

  let changed = true
  while (changed && result.length > 1) {
    changed = false

    if (
      (result.startsWith('"') && result.endsWith('"')) ||
      (result.startsWith("'") && result.endsWith("'")) ||
      (result.startsWith('`') && result.endsWith('`'))
    ) {
      result = result.slice(1, -1).trim()
      changed = true
    }
  }

  return result
}

/**
 * Checks if a file or URL is a HEIC/HEIF image
 */
const isHeicFile = (fileOrUrl) => {
  if (!fileOrUrl) return false
  
  const name = typeof fileOrUrl === 'string' 
    ? fileOrUrl.toLowerCase() 
    : fileOrUrl.name?.toLowerCase() || ''
  
  return name.endsWith('.heic') || 
         name.endsWith('.heif') || 
         name.includes('.heic') || 
         name.includes('.heif')
}

/**
 * Checks if a URL or file is a video
 */
export const isVideoFile = (fileOrUrl) => {
  if (!fileOrUrl) return false
  
  if (typeof fileOrUrl === 'object' && fileOrUrl.type) {
    // File object
    return fileOrUrl.type.startsWith('video/')
  }
  
  // URL string
  const url = typeof fileOrUrl === 'string' ? fileOrUrl.toLowerCase() : ''
  return url.match(/\.(mp4|webm|mov|avi|mkv|m4v|ogv|flv|wmv)(\?.*)?$/i) !== null ||
         (url.includes('/storage/v1/object/public/') && 
          url.match(/\.(mp4|webm|mov|avi|mkv|m4v|ogv|flv|wmv)/i) !== null)
}

/**
 * Normalizes different media representations into a flat array of urls/paths
 * Accepts:
 * - Arrays (including nested arrays)
 * - JSON strings (e.g. '["url1","url2"]')
 * - Comma-separated strings
 * - Objects with url/path/src properties
 */
const normalizeMediaInput = (input) => {
  if (!input) {
    return []
  }

  if (Array.isArray(input)) {
    return input
      .flatMap(entry => normalizeMediaInput(entry))
      .filter(Boolean)
  }

  if (typeof input === 'string') {
    let trimmed = stripWrappingQuotes(input)
    if (!trimmed) {
      return []
    }

    // Handle base64 data URLs (contain comma, but should stay intact)
    if (trimmed.startsWith('data:')) {
      return [trimmed]
    }

    // Attempt to parse JSON arrays/objects
    if (
      (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      (trimmed.startsWith('{') && trimmed.endsWith('}'))
    ) {
      try {
        const parsed = JSON.parse(trimmed)
        return normalizeMediaInput(parsed)
      } catch {
        // continue with fallback parsing
      }
    }

    // Handle Postgres-style text arrays {value1,value2}
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const withoutBraces = trimmed.slice(1, -1)
      return withoutBraces
        .split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/)
        .flatMap(value => normalizeMediaInput(stripWrappingQuotes(value)))
        .filter(Boolean)
    }

    // Handle comma separated values
    if (trimmed.includes(',')) {
      return trimmed
        .split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/) // split commas not inside quotes
        .flatMap(value => normalizeMediaInput(stripWrappingQuotes(value)))
        .filter(Boolean)
    }

    return [trimmed]
  }

  if (typeof input === 'object') {
    if (typeof File !== 'undefined' && input instanceof File) {
      return []
    }

    if (input.url) {
      return normalizeMediaInput(stripWrappingQuotes(input.url))
    }

    if (input.path) {
      return normalizeMediaInput(stripWrappingQuotes(input.path))
    }

    if (input.src) {
      return normalizeMediaInput(stripWrappingQuotes(input.src))
    }
  }

  return []
}

/**
 * Converts HEIC file to JPEG using Canvas API
 * Falls back to original if conversion fails
 */
const convertHeicToJpeg = async (file) => {
  try {
    // Dynamic import to avoid loading heic2any if not needed
    const heic2any = (await import('heic2any')).default
    
    console.log('Converting HEIC file to JPEG:', file.name)
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.92
    })
    
    // heic2any returns an array, get the first blob
    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob
    
    // Create a new File from the blob
    const jpegFile = new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
      type: 'image/jpeg',
      lastModified: Date.now()
    })
    
    console.log('HEIC conversion successful:', jpegFile.name)
    return jpegFile
  } catch (error) {
    console.error('HEIC conversion failed:', error)
    // Return original file if conversion fails
    return file
  }
}

/**
 * Converts an image URL or filename to a full accessible URL
 * Handles:
 * - Full URLs (https://...) - returns as-is
 * - Supabase Storage filenames - converts to public URL
 * - Relative paths - converts to Supabase Storage URL
 * - Base64 data URLs - returns as-is
 * - HEIC files - shows warning as browsers can't display them directly
 */
export const getImageUrl = (rawValue) => {
  if (rawValue === null || rawValue === undefined) {
    return PLACEHOLDER_IMAGE
  }

  if (typeof rawValue === 'object' && !(rawValue instanceof String)) {
    if ('url' in rawValue) {
      return getImageUrl(rawValue.url)
    }
    if ('path' in rawValue) {
      return getImageUrl(rawValue.path)
    }
    if ('src' in rawValue) {
      return getImageUrl(rawValue.src)
    }
  }

  let imageUrl = stripWrappingQuotes(String(rawValue).trim())

  if (!imageUrl) {
    return PLACEHOLDER_IMAGE
  }

  const lower = imageUrl.toLowerCase()
  if (lower === 'null' || lower === 'undefined' || lower === '[object object]') {
    return PLACEHOLDER_IMAGE
  }

  // If it's already a full URL (http/https), return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    if (isHeicFile(imageUrl)) {
      console.warn('HEIC image detected - browsers cannot display HEIC files directly. Please convert to JPEG/PNG.')
    }
    return imageUrl
  }

  // If it's a base64 data URL, return as-is
  if (imageUrl.startsWith('data:')) {
    return imageUrl
  }

  let cleanPath = stripWrappingQuotes(imageUrl).replace(/^\/+/, '')
  if (!cleanPath) {
    return PLACEHOLDER_IMAGE
  }

  if (!cleanPath.includes('/')) {
    cleanPath = `artworks/${cleanPath}`
  }

  if (isHeicFile(cleanPath)) {
    console.warn('HEIC image detected:', cleanPath, '- Browsers cannot display HEIC files. Please convert to JPEG/PNG.')
  }
  
  const encodedPath = cleanPath
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/')

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ibgztilnaecjexshxmrz.supabase.co'
  const storageUrl = `${supabaseUrl}/storage/v1/object/public/artwork-images/${encodedPath}`
  
  return storageUrl
}

/**
 * Converts an array of image URLs to full accessible URLs
 */
export const getImageUrls = (imageUrls) => {
  const normalized = normalizeMediaInput(imageUrls)
  return normalized
    .map(url => getImageUrl(url))
    .filter(url => url && url !== PLACEHOLDER_IMAGE)
}

/**
 * Normalizes artwork media fields (image_url & image_urls)
 * Ensures both properties contain usable URLs
 */
export const normalizeArtworkMedia = (artwork) => {
  if (!artwork) {
    return {
      image_urls: [],
      image_url: null
    }
  }

  const gallery = getImageUrls(artwork.image_urls)
  const primary = getImageUrl(artwork.image_url)

  const combined = [...gallery]
  if (primary && primary !== PLACEHOLDER_IMAGE && !combined.includes(primary)) {
    combined.unshift(primary)
  }

  const filtered = combined.filter((url, index) => url && combined.indexOf(url) === index)
  const fallbackPrimary = filtered[0] || (primary !== PLACEHOLDER_IMAGE ? primary : null)

  console.debug('[normalizeArtworkMedia]', {
    title: artwork.title,
    rawImageUrl: artwork.image_url,
    rawImageUrls: artwork.image_urls,
    normalizedPrimary: fallbackPrimary,
    normalizedGallery: filtered
  })

  return {
    image_urls: filtered,
    image_url: fallbackPrimary
  }
}

/**
 * Uploads a file (image or video) to Supabase Storage
 * Automatically converts HEIC files to JPEG
 * Supports all image formats and video formats
 * @param {File} file - The file to upload (image or video)
 * @param {string} bucketName - The storage bucket name (default: 'artwork-images')
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export const uploadImageToStorage = async (file, bucketName = 'artwork-images') => {
  try {
    console.log('[imageUtils] uploadImageToStorage called', {
      hasFile: !!file,
      bucketName,
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size
    })

    let fileToUpload = file
    
    // Convert HEIC files to JPEG (only for images, not videos)
    if (!file.type?.startsWith('video/') && isHeicFile(file)) {
      console.log('HEIC file detected, converting to JPEG...')
      try {
        fileToUpload = await convertHeicToJpeg(file)
      } catch (heicError) {
        console.warn('HEIC conversion failed, using original file:', heicError)
        // Continue with original file if conversion fails
      }
    }
    
    console.log('[imageUtils] Preparing file metadata...')

    // Get file extension and create unique filename
    // Preserve original extension for videos and other file types
    const fileExt = fileToUpload.name.split('.').pop()?.toLowerCase() || 
                   (fileToUpload.type?.startsWith('video/') ? 'mp4' : 'jpg')
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `artworks/${fileName}`

    // Check if user is authenticated (for debugging)
    console.log('[imageUtils] Checking Supabase session...')
    let session = null
    try {
      const sessionPromise = supabase.auth.getSession()
      const sessionTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Session check timeout')), 4000)
      })
      const sessionResult = await Promise.race([sessionPromise, sessionTimeout])
      session = sessionResult?.data?.session || null
      console.log('[imageUtils] Session status:', {
        isAuthenticated: !!session,
        userId: session?.user?.id || 'anonymous',
        email: session?.user?.email || 'anonymous'
      })
    } catch (sessionErr) {
      console.warn('[imageUtils] Session check failed or timed out:', sessionErr)
      console.log('[imageUtils] Continuing without session information')
    }
    console.log('Upload session check:', {
      hasSession: !!session,
      userId: session?.user?.id || 'anonymous',
      userEmail: session?.user?.email || 'anonymous'
    })

    console.log('Uploading to Supabase Storage:', {
      bucket: bucketName,
      path: filePath,
      fileName: fileToUpload.name,
      originalName: file.name,
      size: fileToUpload.size,
      type: fileToUpload.type,
      isAuthenticated: !!session
    })

    // Upload file to Supabase Storage with timeout
    console.log('[imageUtils] Starting upload to Storage...')
    console.log('[imageUtils] Bucket:', bucketName)
    console.log('[imageUtils] File path:', filePath)
    console.log('[imageUtils] File size:', fileToUpload.size, 'bytes')
    
    // Verify Supabase client is initialized
    console.log('[imageUtils] Verifying Supabase client...')
    if (!supabase) {
      throw new Error('Supabase client is not initialized')
    }
    if (!supabase.storage) {
      throw new Error('Supabase Storage is not available')
    }
    console.log('[imageUtils] ✅ Supabase client verified')
    
    const uploadStartTime = Date.now()
    
    console.log('[imageUtils] Creating upload promise...')
    console.log('[imageUtils] About to call: supabase.storage.from(bucketName).upload(...)')
    
    // Create the upload promise - this should trigger the HTTP request
    let uploadPromise
    try {
      uploadPromise = supabase.storage
        .from(bucketName)
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        })
      console.log('[imageUtils] Supabase upload() invoked')
      console.log('[imageUtils] ✅ Upload promise created')
      console.log('[imageUtils] Promise type:', typeof uploadPromise)
      console.log('[imageUtils] Promise is Promise:', uploadPromise instanceof Promise)
    } catch (promiseErr) {
      console.error('[imageUtils] ❌ Failed to create upload promise:', promiseErr)
      throw new Error(`Failed to create upload promise: ${promiseErr.message}`)
    }
      
    console.log('[imageUtils] Upload promise created, waiting for response...')
    console.log('[imageUtils] ⚠️ If Network tab is empty, the HTTP request is not being made')
    console.log('[imageUtils] This could mean:')
    console.log('[imageUtils] 1. Supabase client is not properly initialized')
    console.log('[imageUtils] 2. Storage API is not available')
    console.log('[imageUtils] 3. JavaScript error preventing request')

    // Add progress logging
    const progressInterval = setInterval(() => {
      const elapsed = Math.round((Date.now() - uploadStartTime) / 1000)
      console.log(`[imageUtils] Upload in progress... ${elapsed}s elapsed`)
      console.log(`[imageUtils] Check Network tab for request to: storage/v1/object/${bucketName}/...`)
    }, 5000)

    const uploadWithTimeout = new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        clearInterval(progressInterval)
        const elapsed = Math.round((Date.now() - uploadStartTime) / 1000)
        console.error(`[imageUtils] ❌ Upload timeout after ${elapsed} seconds`)
        console.error(`[imageUtils] This usually means:`)
        console.error(`[imageUtils] 1. RLS policies are blocking the upload (check Network tab for 401/403)`)
        console.error(`[imageUtils] 2. Network connection issue`)
        console.error(`[imageUtils] 3. Bucket doesn't exist or isn't accessible`)
        console.error(`[imageUtils] 4. CORS issue`)
        console.error(`[imageUtils]`)
        console.error(`[imageUtils] ACTION REQUIRED:`)
        console.error(`[imageUtils] - Open Network tab and look for the failed request`)
        console.error(`[imageUtils] - Check the status code (401/403 = policy issue, 404 = bucket not found)`)
        console.error(`[imageUtils] - Run fix-storage-bucket-policies.sql in Supabase SQL Editor`)
        reject(new Error(`Upload timeout after ${elapsed} seconds. Check browser Network tab for the actual HTTP request status. Most likely cause: RLS policies blocking upload. Run fix-storage-bucket-policies.sql`))
      }, 30000) // 30 second timeout for uploads

      try {
        console.log('[imageUtils] Awaiting upload promise...')
        const result = await uploadPromise
        clearInterval(progressInterval)
        clearTimeout(timeout)
        const elapsed = Math.round((Date.now() - uploadStartTime) / 1000)
        console.log(`[imageUtils] ✅ Upload completed in ${elapsed}s`)
        console.log('[imageUtils] Upload result:', result)
        resolve(result)
      } catch (err) {
        clearInterval(progressInterval)
        clearTimeout(timeout)
        const elapsed = Math.round((Date.now() - uploadStartTime) / 1000)
        console.error(`[imageUtils] ❌ Upload failed after ${elapsed}s:`, err)
        reject(err)
      }
    })

    const { data: uploadData, error: uploadError } = await uploadWithTimeout

    if (uploadError) {
      console.error('Upload error:', uploadError)
      console.error('Upload error details:', {
        message: uploadError.message,
        statusCode: uploadError.statusCode,
        error: uploadError.error
      })
      
      // Check for common errors
      if (uploadError.message?.includes('Bucket not found')) {
        throw new Error(`Storage bucket '${bucketName}' not found. Please create it in Supabase Storage.`)
      } else if (uploadError.message?.includes('new row violates row-level security') || 
                 uploadError.message?.includes('permission denied') ||
                 uploadError.message?.includes('Row Level Security')) {
        throw new Error(`Permission denied. Please run fix-storage-bucket-policies.sql in Supabase SQL Editor to allow uploads.`)
      } else if (uploadError.message?.includes('not allowed') || 
                 uploadError.message?.includes('mime type') ||
                 uploadError.message?.includes('content type')) {
        throw new Error(`File type not allowed. Please run fix-bucket-mime-types.sql to remove MIME type restrictions.`)
      } else if (uploadError.message?.includes('413') || 
                 uploadError.message?.includes('too large') ||
                 uploadError.message?.includes('file size')) {
        throw new Error(`File too large. Please run fix-bucket-mime-types.sql to increase file size limit.`)
      } else {
        const fileType = file.type?.startsWith('video/') ? 'video' : 'image'
        throw new Error(`Failed to upload ${fileType}: ${uploadError.message || 'Unknown error'}`)
      }
    }

    console.log('Upload successful:', uploadData)

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath)

    console.log('Public URL generated:', publicUrl)
    return publicUrl
  } catch (error) {
    console.error('Error uploading image to storage:', error)
    throw error
  }
}

/**
 * Uploads multiple files to Supabase Storage
 * @param {File[]} files - Array of files to upload
 * @param {string} bucketName - The storage bucket name (default: 'artwork-images')
 * @returns {Promise<string[]>} - Array of public URLs
 */
export const uploadMultipleImagesToStorage = async (files, bucketName = 'artwork-images') => {
  try {
    const uploadPromises = files.map(file => uploadImageToStorage(file, bucketName))
    const urls = await Promise.all(uploadPromises)
    return urls
  } catch (error) {
    console.error('Error uploading multiple images:', error)
    throw error
  }
}

