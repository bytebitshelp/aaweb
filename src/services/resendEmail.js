const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY
const DEFAULT_FROM = import.meta.env.VITE_RESEND_FROM_EMAIL || 'Arty Affairs <notifications@artyaffairs.com>'
const DEFAULT_TO = import.meta.env.VITE_ENQUIRY_EMAIL || 'hello@artyaffairs.com'

export const sendSupportEmail = async ({
  subject,
  html,
  to = DEFAULT_TO,
  from = DEFAULT_FROM,
  replyTo
}) => {
  if (!RESEND_API_KEY) {
    console.warn('[Resend] API key missing; skipping email send')
    return { success: false, error: 'Resend API key not configured' }
  }

  if (!to) {
    console.warn('[Resend] Destination email missing; skipping email send')
    return { success: false, error: 'Destination email not configured' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        reply_to: replyTo ? [replyTo] : undefined
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[Resend] Failed to send email', errorData)
      return { success: false, error: errorData?.message || 'Failed to send email' }
    }

    const data = await response.json()
    console.log('[Resend] Email sent:', data)
    return { success: true, id: data?.id }
  } catch (error) {
    console.error('[Resend] Unexpected error', error)
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
        <div style="padding: 20px 24px; background: #1b5e20; color: #ffffff;">
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

