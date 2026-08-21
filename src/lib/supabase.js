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

const workshopsHeaders = {
  apikey: supabaseAnonKey,
  Authorization: `Bearer ${supabaseAnonKey}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
}

async function workshopsRequest(path, options = {}) {
  const response = await fetch(`${supabaseUrl}/rest/v1/workshops${path}`, {
    ...options,
    headers: { ...workshopsHeaders, ...(options.headers || {}) },
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const message = data?.message || data?.error_description || `Workshop request failed (${response.status})`
    throw new Error(message)
  }
  return data
}

export async function fetchPublicWorkshops() {
  return workshopsRequest('?select=*&order=date.desc', { method: 'GET' })
}

export async function createWorkshop(payload) {
  const rows = await workshopsRequest('', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('Workshop was not created. Run supabase-admin-policies.sql in the Supabase SQL editor.')
  }
  return rows[0]
}

export async function updateWorkshop(id, payload) {
  const rows = await workshopsRequest(`?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('Workshop was not updated. Run supabase-admin-policies.sql in the Supabase SQL editor.')
  }
  return rows[0]
}

export async function deleteWorkshop(id) {
  const rows = await workshopsRequest(`?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('Workshop was not deleted. Run supabase-admin-policies.sql in the Supabase SQL editor.')
  }
  return rows[0]
}
