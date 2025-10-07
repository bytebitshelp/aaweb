// Razorpay Integration Service
import { supabase } from '../lib/supabase'

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID

// Load Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(window.Razorpay)
    script.onerror = () => resolve(null)
    document.body.appendChild(script)
  })
}

// Initialize Razorpay
export const initializeRazorpay = async () => {
  const Razorpay = await loadRazorpayScript()
  if (!Razorpay) {
    throw new Error('Failed to load Razorpay script')
  }
  return Razorpay
}

// Create Razorpay order
export const createRazorpayOrder = async (orderData) => {
  try {
    const response = await fetch('/api/create-razorpay-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      throw new Error('Failed to create Razorpay order')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    throw error
  }
}

// Process payment
export const processPayment = async (orderData, user) => {
  try {
    const Razorpay = await initializeRazorpay()
    
    // For demo purposes, we'll create a mock order
    // In production, you would call your backend API to create the actual Razorpay order
    const mockOrder = {
      id: `order_${Date.now()}`,
      amount: orderData.totalAmount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    }

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: mockOrder.amount,
      currency: mockOrder.currency,
      name: 'Arty Affairs',
      description: `Order for ${orderData.items.length} item(s)`,
      order_id: mockOrder.id,
      prefill: {
        name: user.name || user.email.split('@')[0],
        email: user.email,
      },
      theme: {
        color: '#44895d',
      },
      handler: async function (response) {
        try {
          // Verify payment on backend
          const verificationResult = await verifyPayment(response)
          
          if (verificationResult.success) {
            // Create order in database
            await createOrderInDatabase(orderData, user, response)
            return { success: true, paymentId: response.razorpay_payment_id }
          } else {
            throw new Error('Payment verification failed')
          }
        } catch (error) {
          console.error('Payment processing error:', error)
          throw error
        }
      },
      modal: {
        ondismiss: function() {
          console.log('Payment modal dismissed')
        }
      }
    }

    const razorpay = new Razorpay(options)
    razorpay.open()

    return new Promise((resolve, reject) => {
      window.razorpayPaymentHandler = (result) => {
        if (result.success) {
          resolve(result)
        } else {
          reject(new Error(result.error || 'Payment failed'))
        }
      }
    })
  } catch (error) {
    console.error('Error processing payment:', error)
    throw error
  }
}

// Verify payment (mock implementation)
const verifyPayment = async (paymentResponse) => {
  try {
    // In production, you would verify the payment signature on your backend
    // For demo purposes, we'll simulate a successful verification
    return { success: true }
  } catch (error) {
    console.error('Payment verification error:', error)
    return { success: false, error: error.message }
  }
}

// Create order in database
const createOrderInDatabase = async (orderData, user, paymentResponse) => {
  try {
    // Create orders for each item
    const orderPromises = orderData.items.map(async (item) => {
      const { error } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            artwork_id: item.id,
            quantity: item.quantity,
            payment_status: 'Paid',
            order_status: 'Pending',
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_order_id: paymentResponse.razorpay_order_id,
            total_amount: item.price * item.quantity,
            created_at: new Date().toISOString(),
          }
        ])

      if (error) throw error
    })

    await Promise.all(orderPromises)

    // Update artwork quantities
    const updatePromises = orderData.items.map(async (item) => {
      // Get current artwork
      const { data: artwork, error: fetchError } = await supabase
        .from('artworks')
        .select('quantity_available, is_original')
        .eq('artwork_id', item.id)
        .single()

      if (fetchError) throw fetchError

      const newQuantity = artwork.quantity_available - item.quantity
      const newStatus = newQuantity <= 0 && artwork.is_original ? 'Sold' : 'Available'

      const { error: updateError } = await supabase
        .from('artworks')
        .update({
          quantity_available: Math.max(0, newQuantity),
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('artwork_id', item.id)

      if (updateError) throw updateError
    })

    await Promise.all(updatePromises)

    // Clear user's cart
    const { error: cartError } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', user.id)

    if (cartError) console.error('Error clearing cart:', cartError)

  } catch (error) {
    console.error('Error creating order in database:', error)
    throw error
  }
}

// Get user orders
export const getUserOrders = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        artworks!inner(title, artist_name, image_url, price)
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

// Get order details
export const getOrderDetails = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        artworks!inner(title, artist_name, image_url, price, category),
        users!inner(name, email)
      `)
      .eq('order_id', orderId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching order details:', error)
    throw error
  }
}
