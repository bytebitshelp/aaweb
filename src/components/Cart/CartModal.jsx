import { useState, useEffect } from 'react'
import { X, Minus, Plus, Trash2, ShoppingBag, CreditCard } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import { useAuth } from '../../contexts/AuthContext'
// Removed processPayment import as it's now handled in cartStore
import toast from 'react-hot-toast'

const CartModal = ({ isOpen, onClose }) => {
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems, clearCart, processCheckout } = useCartStore()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && user) {
      useCartStore.getState().fetchCartItems()
    }
  }, [isOpen, user])

  const handleQuantityChange = async (cartId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeItem(cartId)
    } else {
      await updateQuantity(cartId, newQuantity)
    }
  }

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    try {
      setLoading(true)
      // processCheckout handles user authentication internally
      const result = await processCheckout()
      
      if (result.success) {
        onClose()
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Checkout failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5" />
            <span>Shopping Cart ({getTotalItems()} items)</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500">Add some artworks to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.cart_id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  {/* Image */}
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.image_url || '/placeholder-art.jpg'}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{item.title}</h4>
                    <p className="text-sm font-medium text-forest-green">₹{item.price}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuantityChange(item.cart_id, item.quantity - 1)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Minus className="w-4 h-4 text-gray-500" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.cart_id, item.quantity + 1)}
                      disabled={item.quantity >= item.quantity_available}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>

                  {/* Total Price */}
                  <div className="text-sm font-medium text-gray-900">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.cart_id)}
                    className="p-2 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-medium text-gray-900">Total:</span>
              <span className="text-xl font-bold text-forest-green">
                ₹{getTotalPrice().toFixed(2)}
              </span>
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Proceed to Checkout</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartModal
