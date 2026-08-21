import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, fetchPublicArtworks } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { getImageUrl, normalizeArtworkMedia } from '../../lib/imageUtils'
import {
  ShoppingCart,
  Palette,
  Users,
  BarChart3,
  Plus,
  Package,
  Truck,
  DollarSign,
  CheckCircle,
  XCircle,
  Trash2,
  Menu,
  X,
  RefreshCw,
  Search,
  AlertCircle,
  Calendar
} from 'lucide-react'
import BrandLogo from '../../components/BrandLogo'
import WorkshopManager from '../../components/Admin/WorkshopManager'
import toast from 'react-hot-toast'

const lower = (value) => String(value || '').toLowerCase()
const isPaid = (status) => ['paid'].includes(lower(status))
const isPending = (status) => ['pending', 'processing'].includes(lower(status))
const isDispatched = (status) => ['dispatched', 'shipped'].includes(lower(status))
const isAvailable = (status) => lower(status) === 'available'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { user, userProfile, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState('artworks')
  const [orders, setOrders] = useState([])
  const [artworks, setArtworks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [connection, setConnection] = useState({ ok: true, message: 'Checking Supabase…' })
  const [usersRestricted, setUsersRestricted] = useState(false)
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
  }, [user?.id])

  const withTimeout = (promise, ms = 5000) =>
    Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timed out')), ms))
    ])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      await fetchArtworks()
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
    fetchOrders()
    fetchUsers()
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDashboardData()
    toast.success('Dashboard refreshed')
  }

  const fetchArtworks = async () => {
    try {
      const data = await fetchPublicArtworks()
      const processed = (data || []).map((artwork) => {
        const media = normalizeArtworkMedia(artwork)
        return {
          ...artwork,
          artwork_id: artwork.artwork_id || artwork.id,
          image_urls: media.image_urls,
          image_url: media.image_url,
          status: artwork.status || 'available',
          quantity_available: artwork.quantity_available ?? 0,
          price: Number(artwork.price) || 0
        }
      })
      setArtworks(processed)
      setConnection({ ok: true, message: `Connected · ${processed.length} artworks` })
    } catch (err) {
      setConnection({ ok: false, message: err.message || 'Could not load artworks' })
      setArtworks([])
    }
  }

  const fetchOrders = async () => {
    try {
      const result = await withTimeout(
        supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200)
      )
      if (result.error) {
        setOrders([])
        return
      }
      setOrders(result.data || [])
    } catch {
      setOrders([])
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)
      )
      if (error) {
        setUsersRestricted(true)
        setUsers([])
        return
      }
      setUsersRestricted((data || []).length === 0)
      setUsers(data || [])
    } catch {
      setUsersRestricted(true)
      setUsers([])
    }
  }

  useEffect(() => {
    const totalRevenue = orders
      .filter((order) => isPaid(order.payment_status))
      .reduce((sum, order) => sum + Number(order.total_amount || order.artworks?.price * (order.quantity || 1) || 0), 0)

    setStats({
      totalOrders: orders.length,
      totalRevenue,
      totalArtworks: artworks.length,
      totalUsers: users.length,
      pendingOrders: orders.filter((order) => isPending(order.order_status)).length,
      paidOrders: orders.filter((order) => isPaid(order.payment_status)).length
    })
  }, [orders, artworks, users])

  const markOrderAsDispatched = async (orderId) => {
    const { error } = await supabase
      .from('orders')
      .update({ order_status: 'dispatched' })
      .eq('order_id', orderId)

    if (error) {
      toast.error(error.message || 'Could not update order')
      return
    }
    toast.success('Order marked as dispatched')
    fetchOrders()
  }

  const toggleArtworkAvailability = async (artworkId, currentStatus) => {
    const next = isAvailable(currentStatus) ? 'sold' : 'available'
    const { error } = await supabase
      .from('artworks')
      .update({ status: next })
      .eq('artwork_id', artworkId)

    if (error) {
      toast.error(error.message || 'Could not update artwork. Sign in as admin and check RLS.')
      return
    }
    toast.success(`Artwork marked as ${next}`)
    fetchArtworks()
  }

  const deleteArtwork = async (artworkId) => {
    if (!window.confirm('Delete this artwork? This cannot be undone.')) return
    const { error } = await supabase
      .from('artworks')
      .delete()
      .eq('artwork_id', artworkId)

    if (error) {
      toast.error(error.message || 'Could not delete artwork')
      return
    }
    toast.success('Artwork deleted')
    fetchArtworks()
  }

  const filteredArtworks = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return artworks
    return artworks.filter((item) =>
      [item.title, item.artist_name, item.category].join(' ').toLowerCase().includes(q)
    )
  }, [artworks, search])

  const sidebarItems = [
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'artworks', label: 'Artworks', icon: Palette },
    { id: 'workshops', label: 'Workshops', icon: Calendar },
    { id: 'users', label: 'Customers', icon: Users },
    { id: 'analytics', label: 'Overview', icon: BarChart3 }
  ]

  return (
    <div className="min-h-screen bg-cream">
      <div className="lg:hidden bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-10 w-10" />
            <div>
            <h1 className="font-display text-lg text-forest-green">Admin</h1>
            <p className="text-xs text-gray-500">{userProfile?.email || user?.email}</p>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg hover:bg-gray-100">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="mt-3 space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === item.id ? 'bg-forest-green text-white' : 'hover:bg-gray-50'}`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex">
        <aside className="w-64 bg-white border-r min-h-screen sticky top-16 hidden lg:block">
          <div className="p-6 border-b">
            <BrandLogo className="h-16 w-16 mb-4" rounded="rounded-lg" />
            <p className="text-xs uppercase tracking-wider text-gray-400">Signed in as</p>
            <p className="font-medium truncate">{userProfile?.name || 'Admin'}</p>
            <p className="text-sm text-gray-500 truncate">{userProfile?.email || user?.email}</p>
            <p className="text-xs text-forest-green mt-1">{isAdmin() ? 'Administrator' : 'Staff'}</p>
          </div>
          <nav className="p-3 space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                  activeTab === item.id ? 'bg-forest-green text-white' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="px-6 pt-4">
            <button onClick={() => navigate('/admin/upload')} className="w-full btn-primary text-sm">
              <Plus className="w-4 h-4 mr-2" /> Add artwork
            </button>
          </div>
        </aside>

        <div className="flex-1 p-4 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-3xl text-gray-900">Dashboard</h2>
              <p className={`text-sm mt-1 ${connection.ok ? 'text-gray-500' : 'text-red-600'}`}>
                {connection.ok ? connection.message : `Supabase error: ${connection.message}`}
              </p>
            </div>
            <button onClick={handleRefresh} className="btn-secondary text-sm" disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'bg-blue-100 text-blue-700' },
              { label: 'Revenue', value: `₹${stats.totalRevenue.toFixed(0)}`, icon: DollarSign, color: 'bg-green-100 text-green-700' },
              { label: 'Artworks', value: stats.totalArtworks, icon: Palette, color: 'bg-purple-100 text-purple-700' },
              { label: 'Customers', value: stats.totalUsers, icon: Users, color: 'bg-orange-100 text-orange-700' },
            ].map((card) => (
              <div key={card.label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{card.label}</p>
                    <p className="text-2xl font-semibold mt-1">{loading ? '—' : card.value}</p>
                  </div>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.color}`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {activeTab === 'orders' && (
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Orders</h3>
                <p className="text-sm text-gray-500">Paid orders can be marked dispatched</p>
              </div>
              {loading ? (
                <p className="p-8 text-center text-gray-500">Loading orders…</p>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <Package className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p>No orders yet. They will appear here after checkout.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-6 py-3 text-left">Order</th>
                        <th className="px-6 py-3 text-left">Customer</th>
                        <th className="px-6 py-3 text-left">Artwork</th>
                        <th className="px-6 py-3 text-left">Amount</th>
                        <th className="px-6 py-3 text-left">Payment</th>
                        <th className="px-6 py-3 text-left">Fulfillment</th>
                        <th className="px-6 py-3 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {orders.map((order) => {
                        const amount = Number(order.total_amount || order.artworks?.price * (order.quantity || 1) || 0)
                        return (
                          <tr key={order.order_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium">
                              #{String(order.order_id).slice(0, 8)}
                              <div className="text-xs text-gray-400">
                                {new Date(order.created_at || order.order_date).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {order.users?.name || order.users?.email || 'Customer'}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {order.artworks?.title || 'Artwork'}
                              <div className="text-xs text-gray-400">Qty {order.quantity || 1}</div>
                            </td>
                            <td className="px-6 py-4 text-sm">₹{amount.toFixed(2)}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs rounded-full ${isPaid(order.payment_status) ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {order.payment_status || 'unpaid'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs rounded-full ${isDispatched(order.order_status) ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                {order.order_status || 'pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {isPaid(order.payment_status) && !isDispatched(order.order_status) && (
                                <button onClick={() => markOrderAsDispatched(order.order_id)} className="text-forest-green text-sm inline-flex items-center gap-1">
                                  <Truck className="w-4 h-4" /> Dispatch
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {activeTab === 'artworks' && (
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Artworks</h3>
                  <p className="text-sm text-gray-500">{filteredArtworks.length} in catalog</p>
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search title or artist"
                      className="pl-9 pr-3 py-2 border rounded-lg text-sm w-56"
                    />
                  </div>
                  <button onClick={() => navigate('/admin/upload')} className="btn-primary text-sm">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </button>
                </div>
              </div>
              {loading ? (
                <p className="p-8 text-center text-gray-500">Loading artworks…</p>
              ) : filteredArtworks.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  No artworks match. Add one from Upload Artwork.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-6 py-3 text-left">Artwork</th>
                        <th className="px-6 py-3 text-left">Artist</th>
                        <th className="px-6 py-3 text-left">Category</th>
                        <th className="px-6 py-3 text-left">Price</th>
                        <th className="px-6 py-3 text-left">Qty</th>
                        <th className="px-6 py-3 text-left">Status</th>
                        <th className="px-6 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredArtworks.map((artwork) => (
                        <tr key={artwork.artwork_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={getImageUrl(artwork.image_url || artwork.image_urls?.[0]) || '/placeholder-art.jpg'}
                                alt=""
                                className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                                onError={(e) => { e.target.src = '/placeholder-art.jpg' }}
                              />
                              <span className="text-sm font-medium">{artwork.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">{artwork.artist_name}</td>
                          <td className="px-6 py-4 text-sm capitalize">{String(artwork.category || '').replace('_', ' ')}</td>
                          <td className="px-6 py-4 text-sm">₹{artwork.price}</td>
                          <td className="px-6 py-4 text-sm">{artwork.quantity_available}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${isAvailable(artwork.status) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {artwork.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-3 text-sm">
                              <button
                                onClick={() => toggleArtworkAvailability(artwork.artwork_id, artwork.status)}
                                className={isAvailable(artwork.status) ? 'text-red-600' : 'text-green-700'}
                              >
                                {isAvailable(artwork.status) ? (
                                  <span className="inline-flex items-center gap-1"><XCircle className="w-4 h-4" /> Sold</span>
                                ) : (
                                  <span className="inline-flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Available</span>
                                )}
                              </button>
                              <button onClick={() => deleteArtwork(artwork.artwork_id)} className="text-red-600 inline-flex items-center gap-1">
                                <Trash2 className="w-4 h-4" /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {activeTab === 'workshops' && <WorkshopManager />}

          {activeTab === 'users' && (
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Customers</h3>
              </div>
              {usersRestricted && users.length === 0 && (
                <div className="m-6 p-4 rounded-xl bg-amber-50 text-amber-900 text-sm flex gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>
                    Supabase is connected, but the <code>users</code> table is hidden by row-level security (anon sees 0 rows).
                    Run <code>supabase-admin-policies.sql</code> in the Supabase SQL editor so admins can list customers and update orders.
                  </p>
                </div>
              )}
              {users.length === 0 ? (
                <p className="p-8 text-center text-gray-500">No customer profiles visible.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-6 py-3 text-left">Name</th>
                        <th className="px-6 py-3 text-left">Email</th>
                        <th className="px-6 py-3 text-left">Role</th>
                        <th className="px-6 py-3 text-left">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {users.map((person) => (
                        <tr key={person.user_id}>
                          <td className="px-6 py-4 text-sm font-medium">{person.name || '—'}</td>
                          <td className="px-6 py-4 text-sm">{person.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${person.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}>
                              {person.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">{person.created_at ? new Date(person.created_at).toLocaleDateString() : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100">
                <h3 className="font-semibold mb-4">Fulfillment</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span>Pending</span><strong>{stats.pendingOrders}</strong></div>
                  <div className="flex justify-between"><span>Paid</span><strong>{stats.paidOrders}</strong></div>
                  <div className="flex justify-between"><span>Catalog size</span><strong>{stats.totalArtworks}</strong></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-3">
                <h3 className="font-semibold mb-2">Shortcuts</h3>
                <button onClick={() => setActiveTab('workshops')} className="w-full text-left p-3 rounded-lg bg-cream hover:bg-gray-100">Manage workshops</button>
                <button onClick={() => setActiveTab('artworks')} className="w-full text-left p-3 rounded-lg bg-cream hover:bg-gray-100">Manage artworks</button>
                <button onClick={() => setActiveTab('orders')} className="w-full text-left p-3 rounded-lg bg-cream hover:bg-gray-100">View orders</button>
                <button onClick={() => navigate('/admin/upload')} className="w-full text-left p-3 rounded-lg bg-cream hover:bg-gray-100">Upload artwork</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
