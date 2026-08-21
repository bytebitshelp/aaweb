import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(window.Razorpay)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(window.Razorpay)
    script.onerror = () => resolve(null)
    document.body.appendChild(script)
  })
}

const createRazorpayOrder = async (amount, receipt) => {
  try {
    const response = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, receipt, currency: 'INR' })
    })

    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

const verifyPaymentSignature = async (orderId, paymentId, signature) => {
  if (!orderId || !paymentId || !signature) {
    return { success: false, error: 'Missing payment details' }
  }

  try {
    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature
      })
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      return { success: false, error: data.error || 'Payment verification failed' }
    }

    return { success: true }
  } catch {
    return { success: false, error: 'Could not verify payment. Try again.' }
  }
}

const notifyAdmin = async (orderData, userDetails, paymentDetails) => {
  try {
    const { sendSupportEmail, buildHtmlFromObject } = await import('./resendEmail')
    await sendSupportEmail({
      subject: `New order ₹${orderData.totalAmount.toFixed(2)} — ${userDetails.name}`,
      html: buildHtmlFromObject('New Arty Affairs Order', [
        { label: 'Order ID', value: paymentDetails.orderId },
        { label: 'Payment ID', value: paymentDetails.paymentId },
        { label: 'Customer', value: userDetails.name },
        { label: 'Email', value: userDetails.email },
        { label: 'Items', value: orderData.items.map((item) => `${item.title} × ${item.quantity}`).join(', ') },
        { label: 'Total', value: `₹${orderData.totalAmount.toFixed(2)}` }
      ])
    })
  } catch (error) {
    console.error('Admin notification failed:', error)
  }
}

export const processPayment = async (orderData, userDetails) => {
  try {
    if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID.includes('your_key')) {
      toast.error('Payment gateway is not configured yet')
      return { success: false, error: 'Razorpay key not configured' }
    }

    const Razorpay = await loadRazorpayScript()
    if (!Razorpay) {
      toast.error('Could not load Razorpay')
      return { success: false, error: 'Razorpay SDK failed to load' }
    }

    const amount = Math.round(orderData.totalAmount * 100)
    const receipt = `receipt_${Date.now()}_${String(userDetails.id).slice(0, 8)}`
    const order = await createRazorpayOrder(amount, receipt)

    return new Promise((resolve) => {
      const options = {
        key: RAZORPAY_KEY_ID,
        amount,
        currency: 'INR',
        name: 'Arty Affairs',
        description: `Order for ${orderData.items.length} item(s)`,
        receipt,
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
          contact: userDetails.phone || ''
        },
        theme: { color: '#326b5a' },
        ...(order?.id && order.entity === 'order' ? { order_id: order.id } : {}),
        handler: async function (response) {
          try {
            const verification = await verifyPaymentSignature(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            )

            if (!verification.success) {
              toast.error('Payment verification failed')
              resolve({ success: false, error: verification.error })
              return
            }

            const orderResult = await createOrderInDatabase(orderData, userDetails, response)
            if (!orderResult.success) {
              toast.error('Payment received, but we could not save the order. Please contact us.')
              resolve({ success: false, error: orderResult.error })
              return
            }

            await notifyAdmin(orderData, userDetails, {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id
            })

            toast.success('Payment successful! Order placed.')
            resolve({
              success: true,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id
            })
          } catch (error) {
            console.error('Payment handler error:', error)
            toast.error('Error processing payment')
            resolve({ success: false, error: error.message })
          }
        },
        modal: {
          ondismiss: function () {
            toast.error('Payment cancelled')
            resolve({ success: false, error: 'Payment cancelled by user' })
          }
        }
      }

      const razorpay = new Razorpay(options)
      razorpay.open()
    })
  } catch (error) {
    console.error('Error processing payment:', error)
    toast.error('Payment processing failed')
    return { success: false, error: error.message }
  }
}

const createOrderInDatabase = async (orderData, userDetails, paymentResponse) => {
  try {
    const orderPromises = orderData.items.map(async (item) => {
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            user_id: userDetails.id,
            artwork_id: item.artwork_id,
            quantity: item.quantity,
            payment_status: 'Paid',
            order_status: 'Pending',
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_order_id: paymentResponse.razorpay_order_id,
            total_amount: item.price * item.quantity,
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single()

      if (error) throw error
      return data
    })

    const createdOrders = await Promise.all(orderPromises)

    await Promise.all(orderData.items.map(async (item) => {
      const { data: artwork, error: fetchError } = await supabase
        .from('artworks')
        .select('quantity_available, is_original, status')
        .eq('artwork_id', item.artwork_id)
        .single()

      if (fetchError) return

      const newQuantity = Math.max(0, (artwork.quantity_available || 0) - item.quantity)
      const newStatus = newQuantity <= 0 ? 'sold' : 'available'

      await supabase
        .from('artworks')
        .update({
          quantity_available: newQuantity,
          status: newStatus,
        })
        .eq('artwork_id', item.artwork_id)
    }))

    await supabase.from('cart').delete().eq('user_id', userDetails.id)

    return { success: true, orders: createdOrders }
  } catch (error) {
    console.error('Error creating order in database:', error)
    return { success: false, error: error.message }
  }
}

export const getUserOrders = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        artworks (title, artist_name, image_url, image_urls, price)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching user orders:', error)
    throw error
  }
}
