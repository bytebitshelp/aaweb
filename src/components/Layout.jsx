import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ShoppingBag, Heart, User, Instagram, Facebook, Mail, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'
import AuthModal from './Auth/AuthModal'
import CartModal from './Cart/CartModal'
import WishlistModal from './WishlistModal'
import PaintingsDropdown from './PaintingsDropdown'
import ArtDropdown from './ArtDropdown'
import SocialButtons from './SocialButtons'
import BrandLogo from './BrandLogo'
import toast from 'react-hot-toast'

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showCartModal, setShowCartModal] = useState(false)
  const [showWishlistModal, setShowWishlistModal] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const location = useLocation()
  const { user, userProfile, signOut, isAdmin, loading } = useAuth()
  const { getTotalItems } = useCartStore()
  const wishlistCount = useWishlistStore((state) => state.items.length)
  const profileRef = useRef(null)

  useEffect(() => {
    setIsMenuOpen(false)
    setIsProfileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }
    if (isProfileOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isProfileOpen])

  const navigation = [
    { name: 'Shop', href: '/shop', customerOnly: true },
    { name: 'Giftables', href: '/giftables', customerOnly: true },
    { name: 'Bouquets', href: '/bouquets', customerOnly: true },
    { name: 'Workshops', href: '/workshops', customerOnly: true },
    { name: 'Interior Design', href: '/interior-design', customerOnly: true },
    { name: 'Upload Artwork', href: '/upload-artwork', adminOnly: true },
    { name: 'Admin Dashboard', href: '/admin-dashboard', adminOnly: true },
  ].filter((item) => {
    if (item.adminOnly && !isAdmin()) return false
    if (item.customerOnly && isAdmin()) return false
    return true
  })

  const footerLinks = [
    { name: 'Originals', href: '/originals' },
    { name: 'Resin Art', href: '/resin-art' },
    { name: 'Workshops', href: '/workshops' },
    { name: 'Commissions', href: '/commission' },
  ]

  const isActive = (href) => location.pathname === href
  const instagramUrl = import.meta.env.VITE_INSTAGRAM_URL || 'https://www.instagram.com/artyaffairs'

  const handleNewsletter = (e) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) {
      toast.error('Enter your email')
      return
    }
    toast.success('Thanks — we will keep you posted.')
    setNewsletterEmail('')
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <nav className="bg-white/95 backdrop-blur border-b border-gray-100 sticky top-0 z-50">
        <div className="container-max">
          <div className="flex items-center justify-between h-16 px-4 lg:px-0">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <BrandLogo className="h-11 w-11" />
              <span className="sr-only">Arty Affairs</span>
            </Link>

            <div className="hidden lg:flex items-center space-x-7">
              {!isAdmin() && (
                <>
                  <PaintingsDropdown />
                  <ArtDropdown />
                </>
              )}
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive(item.href) ? 'text-forest-green' : 'text-gray-700 hover:text-forest-green'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              {!isAdmin() && (
                <>
                  <button
                    onClick={() => setShowWishlistModal(true)}
                    className="relative p-2 text-gray-700 hover:text-forest-green"
                    aria-label="Wishlist"
                  >
                    <Heart className="w-5 h-5" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-forest-green text-white text-[10px] rounded-full flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setShowCartModal(true)}
                    className="relative p-2 text-gray-700 hover:text-forest-green"
                    aria-label="Cart"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    {getTotalItems() > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-forest-green text-white text-[10px] rounded-full flex items-center justify-center">
                        {getTotalItems()}
                      </span>
                    )}
                  </button>
                </>
              )}

              {loading ? (
                <div className="p-2">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-forest-green rounded-full animate-spin" />
                </div>
              ) : user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="p-1.5 text-gray-700 hover:text-forest-green flex items-center space-x-2 rounded-lg px-2 hover:bg-gray-50"
                  >
                    <div className="w-8 h-8 bg-forest-green rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {userProfile?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900 leading-tight">
                        {userProfile?.name || user?.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">{isAdmin() ? 'Admin' : 'Customer'}</p>
                    </div>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border z-50">
                      <div className="px-4 py-3 border-b bg-cream">
                        <p className="text-sm font-semibold truncate">{userProfile?.name || 'Account'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <Link to="/orders" className="flex items-center px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
                        <ShoppingBag className="w-4 h-4 mr-3" /> My Orders
                      </Link>
                      {isAdmin() && (
                        <Link to="/admin-dashboard" className="flex items-center px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
                          <LayoutDashboard className="w-4 h-4 mr-3" /> Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={async () => {
                          setIsProfileOpen(false)
                          await signOut()
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t"
                      >
                        <LogOut className="w-4 h-4 mr-3" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-white bg-forest-green px-4 py-2 rounded-lg hover:bg-dark-green"
                >
                  <User className="w-4 h-4" />
                  Sign in
                </button>
              )}

              {!user && (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="sm:hidden p-2 text-gray-700"
                  aria-label="Sign in"
                >
                  <User className="w-5 h-5" />
                </button>
              )}

              <button
                className="lg:hidden p-2 text-gray-700"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Menu"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="lg:hidden border-t border-gray-100 pb-4">
              <div className="px-4 py-4 space-y-1">
                {!isAdmin() && (
                  <>
                    {[
                      ['Paintings', [['Originals', '/originals'], ['Customization', '/customization'], ['Commission', '/commission']]],
                      ['Art', [['Resin Art', '/resin-art'], ['Crochet', '/crochet'], ['Ceramic Art', '/ceramic-art']]],
                    ].map(([label, links]) => (
                      <div key={label} className="mb-2">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</div>
                        {links.map(([name, href]) => (
                          <Link
                            key={href}
                            to={href}
                            className={`block px-6 py-2 text-sm rounded-md ${isActive(href) ? 'text-forest-green bg-green-50' : 'text-gray-700 hover:bg-gray-50'}`}
                          >
                            {name}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </>
                )}
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block px-3 py-2 text-sm rounded-md ${isActive(item.href) ? 'text-forest-green bg-green-50' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-grow">{children}</main>
      <SocialButtons />

      <footer className="bg-gray-900 text-white mt-auto">
        <div className="container-max section-padding">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="space-y-4">
              <div className="flex items-center">
                <BrandLogo className="h-20 w-20" rounded="rounded-lg" />
              </div>
              <p className="text-gray-300 text-sm">Original art, workshops, and interiors — made with care.</p>
              <div className="flex space-x-4">
                <a href={instagramUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white" aria-label="Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white" aria-label="Facebook">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Explore</h3>
              <ul className="space-y-2">
                {footerLinks.map((item) => (
                  <li key={item.name}>
                    <Link to={item.href} className="text-gray-300 hover:text-white text-sm">{item.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>India</p>
                <p className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:hello@artyaffairs.com" className="hover:text-white">hello@artyaffairs.com</a>
                </p>
                <a href={instagramUrl} className="hover:text-white" target="_blank" rel="noreferrer">@artyaffairs</a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Stay updated</h3>
              <p className="text-gray-300 text-sm mb-4">New drops, workshops, and studio notes.</p>
              <form className="space-y-3" onSubmit={handleNewsletter}>
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-forest-green"
                />
                <button type="submit" className="w-full btn-primary text-sm">Subscribe</button>
              </form>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-10 pt-6 text-center">
            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Arty Affairs. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <CartModal isOpen={showCartModal} onClose={() => setShowCartModal(false)} />
      <WishlistModal isOpen={showWishlistModal} onClose={() => setShowWishlistModal(false)} />
    </div>
  )
}

export default Layout
