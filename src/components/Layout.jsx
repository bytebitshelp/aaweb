import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, ShoppingBag, Heart, User, Instagram, Facebook, Twitter, Mail, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCartStore } from '../store/cartStore'
import AuthModal from './Auth/AuthModal'
import CartModal from './Cart/CartModal'
import PaintingsDropdown from './PaintingsDropdown'
import ArtDropdown from './ArtDropdown'
import SocialButtons from './SocialButtons'
import DebugAuth from './DebugAuth'

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showCartModal, setShowCartModal] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  
  const { user, userProfile, signOut, isAdmin, loading } = useAuth()
  const { getTotalItems } = useCartStore()

  const navigation = [
    { name: 'Giftables', href: '/giftables', customerOnly: true },
    { name: 'Bouquets', href: '/bouquets', customerOnly: true },
    { name: 'Workshops', href: '/workshops', customerOnly: true },
    { name: 'Interior Design', href: '/interior-design', customerOnly: true },
    { name: 'Upload Artwork', href: '/upload-artwork', adminOnly: true },
    { name: 'Admin Dashboard', href: '/admin-dashboard', adminOnly: true },
    { name: 'My Orders', href: '/orders', authRequired: true },
  ].filter(item => {
    if (item.adminOnly && !isAdmin()) return false
    if (item.customerOnly && isAdmin()) return false
    if (item.authRequired && !user) return false
    return true
  })

  const isActive = (href) => location.pathname === href

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="container-max">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-forest-green rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold text-forest-green">Arty Affairs</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
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
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'text-forest-green'
                      : 'text-gray-700 hover:text-forest-green'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {!isAdmin() && (
                <>
                  <button className="p-2 text-gray-700 hover:text-forest-green transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setShowCartModal(true)}
                    className="relative p-2 text-gray-700 hover:text-forest-green transition-colors"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    {getTotalItems() > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-forest-green text-white text-xs rounded-full flex items-center justify-center">
                        {getTotalItems()}
                      </span>
                    )}
                  </button>
                </>
              )}
              
              {loading ? (
                <div className="p-2 text-gray-400">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-forest-green rounded-full animate-spin"></div>
                </div>
              ) : user ? (
                <div className="relative group">
                  <button className="p-2 text-gray-700 hover:text-forest-green transition-colors flex items-center space-x-1">
                    <User className="w-5 h-5" />
                    <span className="hidden sm:inline text-sm font-medium">{userProfile?.name}</span>
                  </button>
                  
                  {/* User Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{userProfile?.name}</p>
                        <p className="text-xs text-gray-500">{userProfile?.email}</p>
                      </div>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                      {isAdmin() && (
                        <Link
                          to="/admin-dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={async () => {
                          setIsMenuOpen(false)
                          await signOut()
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="p-2 text-gray-700 hover:text-forest-green transition-colors"
                >
                  <User className="w-5 h-5" />
                </button>
              )}
              
              {/* Mobile menu button */}
              <button
                className="lg:hidden p-2 text-gray-700 hover:text-forest-green transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-gray-100">
              <div className="px-4 py-4 space-y-2">
                {!isAdmin() && (
                  <>
                    {/* Paintings Section */}
                    <div className="space-y-1">
                      <div className="px-3 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        Paintings
                      </div>
                      <Link
                        to="/originals"
                        className={`block px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive('/originals')
                            ? 'text-forest-green bg-green-50'
                            : 'text-gray-700 hover:text-forest-green hover:bg-gray-50'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Originals
                      </Link>
                      <Link
                        to="/customization"
                        className={`block px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive('/customization')
                            ? 'text-forest-green bg-green-50'
                            : 'text-gray-700 hover:text-forest-green hover:bg-gray-50'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Customization
                      </Link>
                      <Link
                        to="/commission"
                        className={`block px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive('/commission')
                            ? 'text-forest-green bg-green-50'
                            : 'text-gray-700 hover:text-forest-green hover:bg-gray-50'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Commission
                      </Link>
                    </div>

                    {/* Art Section */}
                    <div className="space-y-1">
                      <div className="px-3 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        Art
                      </div>
                      <Link
                        to="/resin-art"
                        className={`block px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive('/resin-art')
                            ? 'text-forest-green bg-green-50'
                            : 'text-gray-700 hover:text-forest-green hover:bg-gray-50'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Resin Art
                      </Link>
                      <Link
                        to="/crochet"
                        className={`block px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive('/crochet')
                            ? 'text-forest-green bg-green-50'
                            : 'text-gray-700 hover:text-forest-green hover:bg-gray-50'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Crochet
                      </Link>
                      <Link
                        to="/ceramic-art"
                        className={`block px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive('/ceramic-art')
                            ? 'text-forest-green bg-green-50'
                            : 'text-gray-700 hover:text-forest-green hover:bg-gray-50'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Ceramic Art
                      </Link>
                    </div>
                  </>
                )}

                {/* Other Navigation Items */}
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'text-forest-green bg-green-50'
                        : 'text-gray-700 hover:text-forest-green hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Floating Social Buttons */}
      <SocialButtons />

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container-max section-padding">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-forest-green rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <span className="text-xl font-bold">Arty Affairs</span>
              </div>
              <p className="text-gray-300 text-sm">
                Where Art Meets Passion. Explore, Shop & Learn from talented artists.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {navigation.slice(0, 4).map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>123 Art Street</p>
                <p>Creative District</p>
                <p>New York, NY 10001</p>
                <p className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>info@artyaffairs.com</span>
                </p>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
              <p className="text-gray-300 text-sm mb-4">
                Subscribe to our newsletter for the latest artworks and workshops.
              </p>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-forest-green transition-colors"
                />
                <button
                  type="submit"
                  className="w-full btn-forest-green text-sm"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 Arty Affairs. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />

      {/* Cart Modal */}
      <CartModal 
        isOpen={showCartModal} 
        onClose={() => setShowCartModal(false)} 
      />

      {/* Debug Component (Development Only) */}
      <DebugAuth />
    </div>
  )
}

export default Layout
