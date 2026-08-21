import Razorpay from 'razorpay'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    return res.status(500).json({ error: 'Payment gateway is not configured' })
  }

  try {
    const { amount, receipt, currency = 'INR' } = req.body || {}
    const paise = Number(amount)

    if (!Number.isFinite(paise) || paise < 100) {
      return res.status(400).json({ error: 'Invalid amount' })
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })
    const order = await razorpay.orders.create({
      amount: Math.round(paise),
      currency,
      receipt: receipt || `arty_${Date.now()}`,
    })

    return res.status(200).json(order)
  } catch (error) {
    console.error('create-order error:', error)
    return res.status(500).json({ error: error.message || 'Failed to create order' })
  }
}
