import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Package, Clock, Truck, CheckCircle, Eye, Loader2 } from 'lucide-react'

const OrderHistoryPage = () => {
  const { userProfile } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  // Mock data for demonstration
  const mockOrders = [
    {
      order_id: '1',
      artwork_title: 'Forest Dreams',
      artist_name: 'Sarah Johnson',
      quantity: 1,
      order_status: 'dispatched',
      payment_status: 'paid',
      order_date: '2024-01-15T10:00:00Z',
      total_amount: 299.99,
      image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=500&fit=crop'
    },
    {
      order_id: '2',
      artwork_title: 'Ocean Waves',
      artist_name: 'Michael Chen',
      quantity: 2,
      order_status: 'pending',
      payment_status: 'paid',
      order_date: '2024-01-14T15:30:00Z',
      total_amount: 399.98,
      image_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=500&fit=crop'
    },
    {
      order_id: '3',
      artwork_title: 'Sunset Bouquet',
      artist_name: 'Emma Rodriguez',
      quantity: 1,
      order_status: 'pending',
      payment_status: 'paid',
      order_date: '2024-01-13T09:15:00Z',
      total_amount: 89.99,
      image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=500&h=500&fit=crop'
    }
  ]

  useEffect(() => {
    if (userProfile) {
      fetchOrders()
    }
  }, [userProfile])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      // In a real implementation, fetch from Supabase
      // const { data, error } = await supabase
      //   .from('orders')
      //   .select(`
      //     *,
      //     artworks (title, artist_name, image_url)
      //   `)
      //   .eq('user_id', userProfile.user_id)
      //   .order('order_date', { ascending: false })

      // For demo purposes, using mock data
      setTimeout(() => {
        setOrders(mockOrders)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'dispatched':
        return <Truck className="w-5 h-5 text-blue-500" />
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      default:
        return <Package className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'dispatched':
        return 'bg-blue-100 text-blue-800'
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'unpaid':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Order Processing'
      case 'dispatched':
        return 'Shipped'
      case 'paid':
        return 'Payment Received'
      case 'unpaid':
        return 'Payment Pending'
      default:
        return status
    }
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h2>
          <p className="text-gray-600">You need to be logged in to view your orders.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-max section-padding">
          <div className="text-center">
            <div className="w-16 h-16 bg-forest-green bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8 text-forest-green" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Order History
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Track your orders and view your purchase history.
            </p>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="container-max section-padding">
        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-forest-green mx-auto mb-4" />
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-600">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.order_id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        {/* Artwork Image */}
                        <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={order.image_url}
                            alt={order.artwork_title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Order Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Order #{order.order_id}
                            </h3>
                            <span className="text-sm text-gray-500">
                              {new Date(order.order_date).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <h4 className="text-base font-medium text-gray-900 mb-1">
                            {order.artwork_title}
                          </h4>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            by {order.artist_name} • Qty: {order.quantity}
                          </p>

                          {/* Status Badges */}
                          <div className="flex flex-wrap gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                              {getStatusIcon(order.order_status)}
                              <span className="ml-1">{getStatusText(order.order_status)}</span>
                            </span>
                            
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.payment_status)}`}>
                              {getStatusIcon(order.payment_status)}
                              <span className="ml-1">{getStatusText(order.payment_status)}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Actions */}
                    <div className="flex flex-col items-end space-y-3">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="text-xl font-bold text-forest-green">
                          ${order.total_amount.toFixed(2)}
                        </p>
                      </div>

                      <button className="btn-secondary flex items-center space-x-2 text-sm px-4 py-2">
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>

                  {/* Order Timeline */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-gray-600">Order Placed</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {order.payment_status === 'paid' ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-sm text-gray-600">Payment Confirmed</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-5 h-5 text-yellow-500" />
                            <span className="text-sm text-gray-600">Payment Pending</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {order.order_status === 'dispatched' ? (
                          <>
                            <Truck className="w-5 h-5 text-blue-500" />
                            <span className="text-sm text-gray-600">Shipped</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-5 h-5 text-yellow-500" />
                            <span className="text-sm text-gray-600">Processing</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderHistoryPage
