import { useState } from 'react'
import { Palette, CheckCircle, Star, Users, Clock, MessageCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { sendSupportEmail, buildHtmlFromObject } from '../services/resendEmail'

const CustomizationPage = () => {
  const { user } = useAuth()
  const [selectedService, setSelectedService] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: '',
    description: '',
    budget: '',
    timeline: '',
    referenceImages: ''
  })

  const customizationServices = [
    {
      id: 'wall-art',
      title: 'Custom Wall Art',
      description: 'Personalized paintings and artwork for your walls',
      price: 'Starting from ₹150',
      features: ['Custom size', 'Personal style', 'Color matching', 'Frame included'],
      icon: Palette
    },
    {
      id: 'portrait',
      title: 'Custom Portraits',
      description: 'Hand-painted portraits from your photos',
      price: 'Starting from ₹200',
      features: ['High quality', 'Multiple styles', 'Fast delivery', 'Digital preview'],
      icon: Users
    },
    {
      id: 'gift',
      title: 'Gift Customization',
      description: 'Personalized artwork for special occasions',
      price: 'Starting from ₹100',
      features: ['Gift wrapping', 'Message included', 'Special packaging', 'Express delivery'],
      icon: Star
    },
    {
      id: 'corporate',
      title: 'Corporate Art',
      description: 'Custom artwork for offices and businesses',
      price: 'Starting from ₹300',
      features: ['Brand colors', 'Large formats', 'Installation', 'Maintenance'],
      icon: CheckCircle
    }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Please login to submit customization request')
      return
    }

    toast.loading('Sending customization request...', { id: 'customization-request' })

    const html = buildHtmlFromObject('New Customization Request', [
      { label: 'Name', value: formData.name },
      { label: 'Email', value: formData.email },
      { label: 'Phone', value: formData.phone },
      { label: 'Service Type', value: formData.serviceType || selectedService || 'Not specified' },
      { label: 'Description', value: formData.description },
      { label: 'Budget', value: formData.budget },
      { label: 'Timeline', value: formData.timeline },
      { label: 'Reference Links', value: formData.referenceImages || 'None provided' }
    ])

    const emailResult = await sendSupportEmail({
      subject: `Customization Request - ${formData.name || 'New Client'}`,
      html,
      replyTo: formData.email
    })

    toast.dismiss('customization-request')

    if (!emailResult.success) {
      toast.error(emailResult.error || 'Failed to submit request. Please try again.')
      return
    }

    toast.success('Customization request submitted successfully!')
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      serviceType: '',
      description: '',
      budget: '',
      timeline: '',
      referenceImages: ''
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-forest-green to-green-700 text-white py-20">
        <div className="container-max text-center">
          <h1 className="text-5xl font-bold mb-6">Custom Artwork Services</h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Transform your vision into stunning, personalized artwork. Our talented artists create 
            custom pieces that perfectly match your style and requirements.
          </p>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-20">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Customization Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our range of customization services, each tailored to bring your unique vision to life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {customizationServices.map((service) => {
              const Icon = service.icon
              return (
                <div
                  key={service.id}
                  className={`bg-white rounded-lg shadow-lg p-8 text-center cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                    selectedService === service.id ? 'ring-2 ring-forest-green' : ''
                  }`}
                  onClick={() => {
                    setSelectedService(service.id)
                    setFormData(prev => ({ ...prev, serviceType: service.id }))
                  }}
                >
                  <div className="w-16 h-16 bg-forest-green bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-forest-green" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <p className="text-2xl font-bold text-forest-green mb-6">{service.price}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-500 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-forest-green mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Request Form Section */}
      <div className="py-20 bg-white">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Request Custom Artwork</h2>
              <p className="text-xl text-gray-600">
                Tell us about your vision and we'll create something amazing for you.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range
                  </label>
                  <select
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
                  >
                    <option value="">Select budget range</option>
                    <option value="100-200">$100 - $200</option>
                    <option value="200-500">$200 - $500</option>
                    <option value="500-1000">$500 - $1,000</option>
                    <option value="1000+">$1,000+</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
                    Timeline
                  </label>
                  <select
                    id="timeline"
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
                  >
                    <option value="">Select timeline</option>
                    <option value="1-week">1 week</option>
                    <option value="2-weeks">2 weeks</option>
                    <option value="1-month">1 month</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent resize-none"
                  placeholder="Describe your vision, style preferences, colors, size requirements, and any specific details..."
                />
              </div>

              <div className="mb-8">
                <label htmlFor="referenceImages" className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Image Links (Optional)
                </label>
                <textarea
                  id="referenceImages"
                  name="referenceImages"
                  rows={4}
                  value={formData.referenceImages}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
                  placeholder="Paste Google Drive, Pinterest or Instagram links here (one per line)"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Include any publicly accessible inspiration links to help our artists understand your requirements.
                </p>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="btn-primary text-lg px-12 py-4 flex items-center space-x-2 mx-auto"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Submit Customization Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="py-20 bg-gray-50">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Process</h2>
            <p className="text-xl text-gray-600">
              Simple steps to get your custom artwork created.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-forest-green rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Submit Request</h3>
              <p className="text-gray-600">Fill out our form with your vision and requirements.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-forest-green rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Consultation</h3>
              <p className="text-gray-600">We'll discuss your project and provide a detailed quote.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-forest-green rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Creation</h3>
              <p className="text-gray-600">Our artists bring your vision to life with regular updates.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-forest-green rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">4</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Delivery</h3>
              <p className="text-gray-600">Your custom artwork is delivered safely to your door.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomizationPage
