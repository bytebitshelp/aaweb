import { ChevronDown } from 'lucide-react'

const CategoryDropdown = ({ value, onChange, error, required = false }) => {
  // Static categories - instant loading, no backend fetch needed
  const categories = [
    { value: 'original', label: 'Original' },
    { value: 'resin_art', label: 'Resin Art' },
    { value: 'giftable', label: 'Giftable' },
    { value: 'bouquet', label: 'Bouquet' },
    { value: 'crochet', label: 'Crochet' },
    { value: 'ceramic', label: 'Ceramic' }
  ]

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent appearance-none bg-white ${
          error ? 'border-red-500' : ''
        }`}
        required={required}
      >
        <option value="">Select category</option>
        {categories.map((category) => (
          <option key={category.value} value={category.value}>
            {category.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export default CategoryDropdown
