import toast from 'react-hot-toast'

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export const initializeRazorpay = async () => {
  const res = await loadRazorpayScript()
  if (!res) {
    toast.error('Razorpay SDK failed to load')
    return false
  }
  return true
}

export const createRazorpayOrder = async (orderData) => {
  try {
    // In a real application, you would create the order on your backend
    // For now, we'll simulate the order creation
    const response = await fetch('/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    })

    if (!response.ok) {
      throw new Error('Failed to create order')
    }

    const order = await response.json()
    return order
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    // For demo purposes, return a mock order
    return {
      id: `order_${Date.now()}`,
      amount: orderData.amount,
      currency: 'INR',
      receipt: orderData.receipt
    }
  }
}

export const processPayment = async (orderData, userDetails) => {
  try {
    const isLoaded = await initializeRazorpay()
    if (!isLoaded) {
      return { success: false, error: 'Razorpay SDK failed to load' }
    }

    const order = await createRazorpayOrder(orderData)
    
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_your_key_id',
      amount: order.amount,
      currency: order.currency,
      name: 'Arty Affairs',
      description: `Order for ${orderData.items.length} item(s)`,
      order_id: order.id,
      handler: async function (response) {
        try {
          // Verify payment on backend
          const verifyResponse = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData,
              userDetails
            })
          })

          if (verifyResponse.ok) {
            const result = await verifyResponse.json()
            return { success: true, paymentId: response.razorpay_payment_id, order: result }
          } else {
            throw new Error('Payment verification failed')
          }
        } catch (error) {
          console.error('Payment verification error:', error)
          return { success: false, error: 'Payment verification failed' }
        }
      },
      prefill: {
        name: userDetails.name,
        email: userDetails.email,
        contact: userDetails.phone || ''
      },
      theme: {
        color: '#228B22'
      },
      modal: {
        ondismiss: () => {
          toast.error('Payment cancelled')
        }
      }
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()

    return new Promise((resolve) => {
      window.razorpayPaymentCallback = (result) => {
        resolve(result)
      }
    })

  } catch (error) {
    console.error('Payment processing error:', error)
    toast.error('Payment processing failed')
    return { success: false, error: error.message }
  }
}

// Mock API endpoints for demo purposes
export const mockCreateOrder = async (orderData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return {
    id: `order_${Date.now()}`,
    amount: orderData.amount,
    currency: 'INR',
    receipt: orderData.receipt,
    status: 'created'
  }
}

export const mockVerifyPayment = async (paymentData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // In real implementation, verify the signature
  return {
    success: true,
    paymentId: paymentData.razorpay_payment_id,
    orderId: paymentData.razorpay_order_id,
    amount: paymentData.orderData.amount
  }
}
