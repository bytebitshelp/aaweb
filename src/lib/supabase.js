import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ibgztilnaecjexshxmrz.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliZ3p0aWxuYWVjamV4c2h4bXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODEzMTIsImV4cCI6MjA3MzI1NzMxMn0.BXVkSNLdZb6y6SyzBGIcr7MiFDsjUwY9LU01dJwmGRo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  }
})

export async function fetchPublicArtworks() {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/artworks?select=*&order=created_at.desc`,
    {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    }
  )

  if (!response.ok) {
    const body = await response.text()
    throw new Error(body || `Could not load artworks (${response.status})`)
  }

  return response.json()
}

export async function fetchPublicWorkshops() {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/workshops?select=*&order=date.desc`,
    {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    }
  )

  if (!response.ok) {
    const body = await response.text()
    throw new Error(body || `Could not load workshops (${response.status})`)
  }

  return response.json()
}
