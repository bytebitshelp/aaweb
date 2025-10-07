import { Instagram, MessageCircle } from 'lucide-react'

const SocialButtons = () => {
  const handleInstagramClick = () => {
    window.open('https://instagram.com/artyaffairs', '_blank', 'noopener,noreferrer')
  }

  const handleWhatsAppClick = () => {
    // Replace with actual WhatsApp number
    const whatsappNumber = '1234567890' // Replace with your actual WhatsApp number
    window.open(`https://wa.me/${whatsappNumber}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 flex flex-col space-y-4">
      {/* Instagram Button */}
      <button
        onClick={handleInstagramClick}
        className="group relative w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-x-1"
        aria-label="Follow us on Instagram"
      >
        <Instagram className="w-7 h-7 text-white" />
        
        {/* Tooltip */}
        <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
          Follow us on Instagram
          <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
        </div>
      </button>

      {/* WhatsApp Button */}
      <button
        onClick={handleWhatsAppClick}
        className="group relative w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-x-1"
        aria-label="Chat with us on WhatsApp"
      >
        <MessageCircle className="w-7 h-7 text-white" />
        
        {/* Tooltip */}
        <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
          Chat with us on WhatsApp
          <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
        </div>
      </button>
    </div>
  )
}

export default SocialButtons
