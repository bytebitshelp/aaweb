import crypto from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) {
    return res.status(500).json({ error: 'Payment gateway is not configured' })
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {}

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details' })
    }

    const expected = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expected !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Invalid payment signature' })
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('verify-payment error:', error)
    return res.status(500).json({ error: error.message || 'Verification failed' })
  }
}
