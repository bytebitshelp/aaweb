import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ibgztilnaecjexshxmrz.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliZ3p0aWxuYWVjamV4c2h4bXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODEzMTIsImV4cCI6MjA3MzI1NzMxMn0.BXVkSNLdZb6y6SyzBGIcr7MiFDsjUwY9LU01dJwmGRo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
})

// Database schema for artworks
export const artworkSchema = {
  artwork_id: 'uuid',
  artist_name: 'text',
  title: 'text',
  category: 'text', // 'original', 'resin_art', 'giftable', 'bouquet'
  description: 'text',
  price: 'decimal',
  quantity_available: 'integer',
  is_original: 'boolean',
  status: 'text', // 'available', 'sold'
  image_url: 'text',
  created_at: 'timestamp'
}

// Database schema for users
export const userSchema = {
  user_id: 'uuid',
  name: 'text',
  email: 'text',
  password: 'text',
  role: 'text', // 'admin', 'customer'
  created_at: 'timestamp'
}

// Database schema for orders
export const orderSchema = {
  order_id: 'uuid',
  user_id: 'uuid',
  artwork_id: 'uuid',
  quantity: 'integer',
  order_status: 'text', // 'pending', 'dispatched'
  payment_status: 'text', // 'paid', 'unpaid'
  payment_id: 'text',
  order_date: 'timestamp'
}

// Database schema for cart
export const cartSchema = {
  cart_id: 'uuid',
  user_id: 'uuid',
  artwork_id: 'uuid',
  quantity: 'integer',
  created_at: 'timestamp'
}

// Database schema for workshops
export const workshopSchema = {
  id: 'uuid',
  name: 'text',
  description: 'text',
  date: 'timestamp',
  is_upcoming: 'boolean',
  image_url: 'text',
  created_at: 'timestamp'
}

// Database schema for interior design projects
export const projectSchema = {
  id: 'uuid',
  title: 'text',
  description: 'text',
  case_study: 'text',
  image_urls: 'text[]',
  created_at: 'timestamp'
}
