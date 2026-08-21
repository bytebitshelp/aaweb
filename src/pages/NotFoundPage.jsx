import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-cream">
      <div className="text-center max-w-lg">
        <img src="/logo.jpg" alt="Arty Affairs" className="w-24 h-24 object-cover rounded-xl mx-auto mb-6" />
        <p className="text-sm uppercase tracking-[0.25em] text-forest-green mb-3">404</p>
        <h1 className="font-display text-4xl md:text-5xl text-gray-900 mb-4">Page not found</h1>
        <p className="text-gray-600 mb-8">
          This page does not exist, or the artwork may have moved. Browse the gallery instead.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary">Back to home</Link>
          <Link to="/shop" className="btn-secondary">Explore artworks</Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
