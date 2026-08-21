const DEFAULT_TO = import.meta.env.VITE_ENQUIRY_EMAIL || 'hello@artyaffairs.com'

export const sendSupportEmail = async ({
  subject,
  html,
  to = DEFAULT_TO,
  from,
  replyTo
}) => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, html, to, from, replyTo })
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to send email' }
    }

    return { success: true, id: data.id }
  } catch (error) {
    console.error('[Email] Unexpected error', error)
    return { success: false, error: error.message }
  }
}

export const buildHtmlFromObject = (title, entries = []) => {
  const rows = entries
    .filter(Boolean)
    .map(
      ({ label, value }) => `
        <tr>
          <td style="padding: 8px 12px; font-weight: 600; vertical-align: top; width: 160px;">${label}</td>
          <td style="padding: 8px 12px; color: #374151;">${value || '-'}</td>
        </tr>
      `
    )
    .join('')

  return `
    <div style="font-family: 'Segoe UI', sans-serif; background: #f9fafb; padding: 24px;">
      <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
        <div style="padding: 20px 24px; background: #326b5a; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px;">${title}</h2>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    </div>
  `
}
