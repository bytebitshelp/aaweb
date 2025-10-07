import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Palette, 
  Users, 
  BarChart3,
  Plus,
  Eye,
  Package,
  Truck,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Menu,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const { userProfile, signIn, signInWithGoogle } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [loginLoading, setLoginLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [artworks, setArtworks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalArtworks: 0,
    totalUsers: 0,
    pendingOrders: 0,
    paidOrders: 0
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!loginData.email || !loginData.password) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setLoginLoading(true)
      await signIn(loginData.email, loginData.password)
      
      if (loginData.email === 'asadmohammed181105@gmail.com' && loginData.password === '123456789') {
        toast.success('Welcome back, Admin!')
        setShowLogin(false)
        fetchDashboardData()
      } else {
        toast.error('Invalid admin credentials')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Invalid email or password')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoginLoading(true)
      const result = await signInWithGoogle()
      
      if (result.user.email === 'asadmohammed181105@gmail.com') {
        toast.success('Welcome back, Admin!')
        setShowLogin(false)
        fetchDashboardData()
      } else {
        toast.error('Only admin accounts are allowed')
      }
    } catch (error) {
      console.error('Google login error:', error)
      toast.error('Google login failed')
    } finally {
      setLoginLoading(false)
    }
  }


  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchOrders(),
        fetchArtworks(),
        fetchUsers(),
        fetchStats()
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        users!inner(name, email),
        artworks!inner(title, artist_name, price)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      return
    }
    setOrders(data || [])
  }

  const fetchArtworks = async () => {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching artworks:', error)
      return
    }
    setArtworks(data || [])
  }

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return
    }
    setUsers(data || [])
  }

  const fetchStats = async () => {
    const [ordersResult, artworksResult, usersResult] = await Promise.all([
      supabase.from('orders').select('payment_status, total_amount'),
      supabase.from('artworks').select('artwork_id'),
      supabase.from('users').select('user_id')
    ])

    const ordersData = ordersResult.data || []
    const totalRevenue = ordersData
      .filter(order => order.payment_status === 'Paid')
      .reduce((sum, order) => sum + (order.total_amount || 0), 0)

    const pendingOrders = ordersData.filter(order => order.payment_status === 'Pending').length
    const paidOrders = ordersData.filter(order => order.payment_status === 'Paid').length

    setStats({
      totalOrders: ordersData.length,
      totalRevenue,
      totalArtworks: artworksResult.data?.length || 0,
      totalUsers: usersResult.data?.length || 0,
      pendingOrders,
      paidOrders
    })
  }

  const markOrderAsDispatched = async (orderId) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: 'Dispatched' })
        .eq('order_id', orderId)

      if (error) throw error

      toast.success('Order marked as dispatched')
      fetchOrders()
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order')
    }
  }

  const toggleArtworkAvailability = async (artworkId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Available' ? 'Sold' : 'Available'
      const { error } = await supabase
        .from('artworks')
        .update({ status: newStatus })
        .eq('artwork_id', artworkId)

      if (error) throw error

      toast.success(`Artwork marked as ${newStatus.toLowerCase()}`)
      fetchArtworks()
    } catch (error) {
      console.error('Error updating artwork:', error)
      toast.error('Failed to update artwork')
    }
  }

  const deleteArtwork = async (artworkId) => {
    if (!window.confirm('Are you sure you want to delete this artwork? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('artworks')
        .delete()
        .eq('artwork_id', artworkId)

      if (error) throw error

      toast.success('Artwork deleted successfully')
      fetchArtworks()
    } catch (error) {
      console.error('Error deleting artwork:', error)
      toast.error('Failed to delete artwork')
    }
  }

  const sidebarItems = [
    { id: 'orders', label: 'Orders Management', icon: ShoppingCart },
    { id: 'artworks', label: 'Artwork Management', icon: Palette },
    { id: 'users', label: 'User Overview', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-forest-green animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Login Form */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Admin Login</h2>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green"
                  placeholder="Enter admin email"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green"
                  placeholder="Enter password"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full btn-primary disabled:opacity-50"
              >
                {loginLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
            
            <div className="mt-4 text-center">
              <button
                onClick={handleGoogleLogin}
                disabled={loginLoading}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign In with Google
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowLogin(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Button */}
      {!userProfile && (
        <div className="fixed top-4 right-4 z-40">
          <button
            onClick={() => setShowLogin(true)}
            className="btn-primary"
          >
            Admin Login
          </button>
        </div>
      )}
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-forest-green rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-forest-green">Admin Dashboard</h1>
              <p className="text-xs text-gray-500">Arty Affairs</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="mt-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors rounded-lg ${
                    activeTab === item.id
                      ? 'bg-forest-green text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg h-screen sticky top-0 hidden lg:block">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-forest-green rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-forest-green">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Arty Affairs</p>
              </div>
            </div>
          </div>

          <nav className="mt-6">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-forest-green text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, Admin
            </h2>
            <p className="text-gray-600">Manage your store and track performance</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Artworks</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalArtworks}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Palette className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Orders Management</h3>
                <p className="text-gray-600 mt-1">Manage and track all customer orders</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Artwork
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.order_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.order_id.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.users?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.users?.email || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.artworks?.title || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              by {order.artworks?.artist_name || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{order.total_amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.payment_status === 'Paid' 
                              ? 'bg-green-100 text-green-800'
                              : order.payment_status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {order.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.order_status === 'Dispatched' 
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {order.order_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {order.payment_status === 'Paid' && order.order_status === 'Pending' && (
                            <button
                              onClick={() => markOrderAsDispatched(order.order_id)}
                              className="text-forest-green hover:text-opacity-80 flex items-center space-x-1"
                            >
                              <Truck className="w-4 h-4" />
                              <span>Mark Dispatched</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'artworks' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Artwork Management</h3>
                  <p className="text-gray-600 mt-1">Manage your art collection</p>
                </div>
                <button
                  onClick={() => window.location.href = '/admin/upload'}
                  className="btn-forest-green flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Artwork</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Artwork
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Artist
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {artworks.map((artwork) => (
                      <tr key={artwork.artwork_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4 flex items-center justify-center">
                              {artwork.image_url ? (
                                <img 
                                  src={artwork.image_url} 
                                  alt={artwork.title}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Palette className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{artwork.title}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {artwork.artist_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {artwork.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{artwork.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {artwork.quantity_available}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            artwork.status === 'Available' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {artwork.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleArtworkAvailability(artwork.artwork_id, artwork.status)}
                              className={`flex items-center space-x-1 ${
                                artwork.status === 'Available' 
                                  ? 'text-red-600 hover:text-red-800'
                                  : 'text-green-600 hover:text-green-800'
                              }`}
                            >
                              {artwork.status === 'Available' ? (
                                <>
                                  <XCircle className="w-4 h-4" />
                                  <span>Mark Sold</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Mark Available</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => deleteArtwork(artwork.artwork_id)}
                              className="text-red-600 hover:text-red-800 flex items-center space-x-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">User Overview</h3>
                <p className="text-gray-600 mt-1">View all registered users and their activity</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.user_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-forest-green rounded-full flex items-center justify-center mr-4">
                              <span className="text-white font-bold">
                                {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-forest-green hover:text-opacity-80 flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>View Orders</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                      <span className="text-sm text-gray-600">Pending Orders</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{stats.pendingOrders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-gray-600">Paid Orders</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{stats.paidOrders}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('artworks')}
                    className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Palette className="w-5 h-5 text-forest-green" />
                    <span className="text-sm font-medium text-gray-900">Manage Artworks</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5 text-forest-green" />
                    <span className="text-sm font-medium text-gray-900">View Orders</span>
                  </button>
                  <button
                    onClick={() => window.location.href = '/admin/upload'}
                    className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5 text-forest-green" />
                    <span className="text-sm font-medium text-gray-900">Add New Artwork</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
