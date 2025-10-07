import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'

const PaintingsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const items = [
    { name: 'Originals', href: '/originals' },
    { name: 'Customization', href: '/customization' },
    { name: 'Commission', href: '/commission' },
  ]

  const isActive = (href) => location.pathname === href
  const hasActiveItem = items.some(item => isActive(item.href))

  return (
    <div className="relative group">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className={`flex items-center space-x-1 text-sm font-medium transition-colors duration-200 ${
          hasActiveItem
            ? 'text-forest-green'
            : 'text-gray-700 hover:text-forest-green'
        }`}
      >
        <span>Paintings</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <div
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className={`absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 transition-all duration-200 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="py-2">
          {items.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                isActive(item.href)
                  ? 'text-forest-green bg-green-50'
                  : 'text-gray-700 hover:text-forest-green hover:bg-gray-50'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PaintingsDropdown
