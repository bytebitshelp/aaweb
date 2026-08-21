export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Email service is not configured' })
  }

  try {
    const {
      subject,
      html,
      to = process.env.ENQUIRY_EMAIL || process.env.VITE_ENQUIRY_EMAIL || 'hello@artyaffairs.com',
      from = process.env.RESEND_FROM_EMAIL || 'Arty Affairs <notifications@artyaffairs.com>',
      replyTo
    } = req.body || {}

    if (!subject || !html) {
      return res.status(400).json({ error: 'Subject and html are required' })
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        reply_to: replyTo ? [replyTo] : undefined
      })
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Failed to send email' })
    }

    return res.status(200).json({ success: true, id: data.id })
  } catch (error) {
    console.error('send-email error:', error)
    return res.status(500).json({ error: error.message || 'Failed to send email' })
  }
}
