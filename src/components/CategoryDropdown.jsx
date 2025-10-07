import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ChevronDown } from 'lucide-react'

const CategoryDropdown = ({ value, onChange, error, required = false }) => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('artworks')
        .select('category')
        .not('category', 'is', null)

      if (error) throw error

      // Get unique categories
      const uniqueCategories = [...new Set(data.map(item => item.category))]
        .filter(Boolean)
        .sort()

      // Add all possible categories from schema (must match database constraint exactly)
      const allCategories = [
        'Original',
        'Resin',
        'Giftable',
        'Bouquet',
        'Crochet',
        'Ceramic'
      ]

      // Merge and deduplicate
      const finalCategories = [...new Set([...allCategories, ...uniqueCategories])]
        .sort()
        .map(category => ({
          value: category.toLowerCase(),
          label: category
        }))

      setCategories(finalCategories)
    } catch (error) {
      console.error('Error fetching categories:', error)
      // Fallback to default categories
      setCategories([
        { value: 'original', label: 'Original' },
        { value: 'resin', label: 'Resin' },
        { value: 'giftable', label: 'Giftable' },
        { value: 'bouquet', label: 'Bouquet' },
        { value: 'crochet', label: 'Crochet' },
        { value: 'ceramic', label: 'Ceramic' }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent appearance-none bg-white ${
          error ? 'border-red-500' : ''
        }`}
        disabled={loading}
        required={required}
      >
        <option value="">
          {loading ? 'Loading categories...' : 'Select category'}
        </option>
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
