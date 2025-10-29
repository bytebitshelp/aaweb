// Razorpay Integration Service
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID

// Load Razorpay script dynamically
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

// Initialize Razorpay
export const initializeRazorpay = async () => {
  if (!RAZORPAY_KEY_ID) {
    console.error('Razorpay Key ID is not configured')
    toast.error('Payment gateway not configured')
    return null
  }

  const Razorpay = await loadRazorpayScript()
  if (!Razorpay) {
    toast.error('Razorpay SDK failed to load')
    return null
  }
  return Razorpay
}

// Create Razorpay order via Supabase Edge Function or direct API call
const createRazorpayOrder = async (amount, receipt) => {
  try {
    // Option 1: Use Supabase Edge Function (recommended for production)
    // This requires setting up a Supabase Edge Function
    
    // Option 2: Direct API call to your backend
    // For now, we'll create order on frontend (not recommended for production)
    // In production, create orders via backend to keep secret key secure
    
    // Since we can't store secret key on frontend, we'll use a mock order for now
    // You should replace this with a proper backend API call
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      id: orderId,
      amount: amount,
      currency: 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
      status: 'created'
    }
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    throw error
  }
}

// Verify payment signature
const verifyPaymentSignature = async (orderId, paymentId, signature) => {
  try {
    // In production, verify payment signature on backend
    // For now, we'll do basic validation
    if (!orderId || !paymentId || !signature) {
      return { success: false, error: 'Missing payment details' }
    }
    
    // Basic validation - in production, verify signature using secret key on backend
    return { success: true }
  } catch (error) {
    console.error('Payment verification error:', error)
    return { success: false, error: error.message }
  }
}

// Send email notification to admin using Resend API
const sendAdminNotificationEmail = async (orderData, userDetails, paymentDetails) => {
  try {
    const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY
    const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'asadmohammed181105@gmail.com'
    
    if (!RESEND_API_KEY) {
      console.warn('Resend API key not configured, skipping email notification')
      return { success: false, error: 'Email service not configured' }
    }

    // Format order items
    const orderItemsHTML = orderData.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.title || 'Artwork'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.artist_name || 'N/A'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">₹${item.price}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('')

    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #228B22; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #228B22; color: white; padding: 10px; text-align: left; }
          .total { font-size: 1.2em; font-weight: bold; color: #228B22; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎨 New Order Received - Arty Affairs</h1>
          </div>
          <div class="content">
            <h2>Order Details</h2>
            <p><strong>Order ID:</strong> ${paymentDetails.orderId}</p>
            <p><strong>Payment ID:</strong> ${paymentDetails.paymentId}</p>
            <p><strong>Customer Name:</strong> ${userDetails.name}</p>
            <p><strong>Customer Email:</strong> ${userDetails.email}</p>
            <p><strong>Order Date:</strong> ${new Date().toLocaleString('en-IN')}</p>
            
            <h3>Order Items:</h3>
            <table>
              <thead>
                <tr>
                  <th>Artwork</th>
                  <th>Artist</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderItemsHTML}
              </tbody>
            </table>
            
            <div class="total">
              <p><strong>Total Amount: ₹${orderData.totalAmount.toFixed(2)}</strong></p>
            </div>
            
            <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              Please log into your admin dashboard to process this order.
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    // Call Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Arty Affairs <orders@yourdomain.com>', // Update with your verified domain
        to: [ADMIN_EMAIL],
        subject: `New Order Received - ₹${orderData.totalAmount.toFixed(2)} - ${userDetails.name}`,
        html: emailHTML
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Resend API error:', errorData)
      return { success: false, error: errorData.message || 'Failed to send email' }
    }

    const result = await response.json()
    console.log('Admin notification email sent:', result)
    return { success: true, messageId: result.id }
  } catch (error) {
    console.error('Error sending admin notification email:', error)
    return { success: false, error: error.message }
  }
}

// Process payment
export const processPayment = async (orderData, userDetails) => {
  try {
    const Razorpay = await initializeRazorpay()
    if (!Razorpay) {
      return { success: false, error: 'Razorpay SDK failed to load' }
    }

    if (!RAZORPAY_KEY_ID) {
      return { success: false, error: 'Razorpay key not configured' }
    }

    const amount = Math.round(orderData.totalAmount * 100) // Convert to paise
    const receipt = `receipt_${Date.now()}_${userDetails.id.substring(0, 8)}`
    
    // Create order
    const order = await createRazorpayOrder(amount, receipt)

    return new Promise((resolve, reject) => {
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'INR',
        name: 'Arty Affairs',
        description: `Order for ${orderData.items.length} item(s)`,
        order_id: order.id,
        receipt: receipt,
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
          contact: userDetails.phone || ''
        },
        theme: {
          color: '#228B22'
        },
        handler: async function (response) {
          try {
            // Verify payment signature
            const verification = await verifyPaymentSignature(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            )

            if (!verification.success) {
              toast.error('Payment verification failed')
              window.razorpayPaymentHandler?.({ success: false, error: verification.error })
              return
            }

            // Create order in database
            const orderResult = await createOrderInDatabase(orderData, userDetails, response)
            
            if (!orderResult.success) {
              toast.error('Failed to save order details')
              window.razorpayPaymentHandler?.({ success: false, error: orderResult.error })
              return
            }

            // Send admin notification email
            try {
              await sendAdminNotificationEmail(orderData, userDetails, {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id
              })
            } catch (emailError) {
              console.error('Failed to send admin notification email:', emailError)
              // Don't fail the payment if email fails
            }

            toast.success('Payment successful! Order placed.')
            window.razorpayPaymentHandler?.({
              success: true,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id
            })
          } catch (error) {
            console.error('Payment handler error:', error)
            toast.error('Error processing payment: ' + error.message)
            window.razorpayPaymentHandler?.({ success: false, error: error.message })
          }
        },
        modal: {
          ondismiss: function() {
            toast.error('Payment cancelled')
            window.razorpayPaymentHandler?.({ success: false, error: 'Payment cancelled by user' })
          }
        }
      }

      const razorpay = new Razorpay(options)
      
      // Set up payment handler callback
      window.razorpayPaymentHandler = (result) => {
        if (result.success) {
          resolve(result)
        } else {
          reject(new Error(result.error || 'Payment failed'))
        }
      }

      razorpay.open()
    })
  } catch (error) {
    console.error('Error processing payment:', error)
    toast.error('Payment processing failed: ' + error.message)
    return { success: false, error: error.message }
  }
}

// Create order in database
const createOrderInDatabase = async (orderData, userDetails, paymentResponse) => {
  try {
    // Create orders for each item
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

      if (error) {
        console.error('Error creating order:', error)
        throw error
      }
      return data
    })

    const createdOrders = await Promise.all(orderPromises)

    // Update artwork quantities
    const updatePromises = orderData.items.map(async (item) => {
      const { data: artwork, error: fetchError } = await supabase
        .from('artworks')
        .select('quantity_available, is_original, status')
        .eq('artwork_id', item.artwork_id)
        .single()

      if (fetchError) {
        console.error('Error fetching artwork:', fetchError)
        throw fetchError
      }

      const newQuantity = Math.max(0, (artwork.quantity_available || 0) - item.quantity)
      const newStatus = newQuantity <= 0 && artwork.is_original 
        ? 'Sold' 
        : (newQuantity > 0 ? 'Available' : 'Not Available')

      const { error: updateError } = await supabase
        .from('artworks')
        .update({
          quantity_available: newQuantity,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('artwork_id', item.artwork_id)

      if (updateError) {
        console.error('Error updating artwork:', updateError)
        throw updateError
      }
    })

    await Promise.all(updatePromises)

    // Clear user's cart
    const { error: cartError } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userDetails.id)

    if (cartError) {
      console.error('Error clearing cart:', cartError)
      // Don't fail if cart clear fails
    }

    return { success: true, orders: createdOrders }
  } catch (error) {
    console.error('Error creating order in database:', error)
    return { success: false, error: error.message }
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
