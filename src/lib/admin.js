export const getAdminEmails = () => {
  const envAdminsRaw = [import.meta.env.VITE_ADMIN_EMAILS, import.meta.env.VITE_ADMIN_EMAIL]
    .filter(Boolean)
    .join(',')
  const fromEnv = envAdminsRaw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  const fallback = 'asadmohammed181105@gmail.com'
  return fromEnv.includes(fallback) ? fromEnv : [...fromEnv, fallback]
}

export const isAdminEmail = (email) => {
  const normalized = String(email || '').trim().toLowerCase()
  if (!normalized) return false
  return getAdminEmails().includes(normalized)
}
