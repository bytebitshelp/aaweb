import { useState } from 'react'
import { Brush, Palette, Award, Clock, Star, Users, MessageCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { sendSupportEmail, buildHtmlFromObject } from '../services/resendEmail'

const CommissionPage = () => {
  const { user } = useAuth()
  const [selectedType, setSelectedType] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    commissionType: '',
    subject: '',
    description: '',
    size: '',
    style: '',
    budget: '',
    timeline: '',
    referenceImages: '',
    additionalNotes: ''
  })

  const commissionTypes = [
    {
      id: 'portrait',
      title: 'Portrait Commission',
      description: 'Custom portraits from your photos',
      price: 'Starting from ₹200',
      timeline: '2-4 weeks',
      features: ['High quality materials', 'Multiple style options', 'Digital preview', 'Free revisions'],
      icon: Users
    },
    {
      id: 'landscape',
      title: 'Landscape Commission',
      description: 'Custom landscape paintings',
      price: 'Starting from ₹300',
      timeline: '3-5 weeks',
      features: ['Various mediums', 'Custom size', 'Frame options', 'Installation help'],
      icon: Brush
    },
    {
      id: 'abstract',
      title: 'Abstract Commission',
      description: 'Personalized abstract artwork',
      price: 'Starting from ₹250',
      timeline: '2-3 weeks',
      features: ['Color consultation', 'Style matching', 'Texture options', 'Modern framing'],
      icon: Palette
    },
    {
      id: 'corporate',
      title: 'Corporate Commission',
      description: 'Large-scale artwork for businesses',
      price: 'Starting from ₹500',
      timeline: '4-8 weeks',
      features: ['Brand integration', 'Large formats', 'Installation', 'Maintenance'],
      icon: Award
    }
  ]

  const styles = [
    'Realistic', 'Impressionist', 'Abstract', 'Contemporary', 'Traditional', 'Modern', 'Minimalist', 'Expressionist'
  ]

  const sizes = [
    '8" x 10"', '11" x 14"', '16" x 20"', '18" x 24"', '24" x 30"', '30" x 40"', '36" x 48"', 'Custom Size'
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
      toast.error('Please login to submit commission request')
      return
    }

    const parsedUrls = (formData.referenceImages || '').toString()
    const html = buildHtmlFromObject('New Commission Request', [
      { label: 'Name', value: formData.name },
      { label: 'Email', value: formData.email },
      { label: 'Phone', value: formData.phone },
      { label: 'Commission Type', value: formData.commissionType || selectedType || 'Not specified' },
      { label: 'Subject', value: formData.subject },
      { label: 'Description', value: formData.description },
      { label: 'Preferred Size', value: formData.size },
      { label: 'Preferred Style', value: formData.style },
      { label: 'Budget Range', value: formData.budget },
      { label: 'Timeline', value: formData.timeline },
      { label: 'Reference Links', value: formData.referenceImages || 'None provided' },
      { label: 'Additional Notes', value: formData.additionalNotes }
    ])

    toast.loading('Sending commission request...', { id: 'commission-request' })

    const emailResult = await sendSupportEmail({
      subject: `Commission Request - ${formData.name || 'New Client'}`,
      html,
      replyTo: formData.email
    })

    toast.dismiss('commission-request')

    if (!emailResult.success) {
      toast.error(emailResult.error || 'Failed to submit request. Please try again.')
      return
    }

    toast.success('Commission request submitted successfully!')
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      commissionType: '',
      subject: '',
      description: '',
      size: '',
      style: '',
      budget: '',
      timeline: '',
      referenceImages: '',
      additionalNotes: ''
    })
    setSelectedType('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-forest-green to-green-700 text-white py-20">
        <div className="container-max text-center">
          <h1 className="text-5xl font-bold mb-6">Commission Custom Artwork</h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Work directly with our professional artists to create a one-of-a-kind piece 
            tailored to your exact specifications and vision.
          </p>
        </div>
      </div>

      {/* Commission Types Section */}
      <div className="py-20">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Commission Types</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the type of commission that best fits your needs and vision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {commissionTypes.map((type) => {
              const Icon = type.icon
              return (
                <div
                  key={type.id}
                  className={`bg-white rounded-lg shadow-lg p-8 text-center cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                    selectedType === type.id ? 'ring-2 ring-forest-green' : ''
                  }`}
                  onClick={() => {
                    setSelectedType(type.id)
                    setFormData(prev => ({ ...prev, commissionType: type.id }))
                  }}
                >
                  <div className="w-16 h-16 bg-forest-green bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-forest-green" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{type.title}</h3>
                  <p className="text-gray-600 mb-4">{type.description}</p>
                  <p className="text-2xl font-bold text-forest-green mb-2">{type.price}</p>
                  <p className="text-sm text-gray-500 mb-6 flex items-center justify-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {type.timeline}
                  </p>
                  <ul className="space-y-2">
                    {type.features.map((feature, index) => (
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

      {/* Commission Form Section */}
      <div className="py-20 bg-white">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Commission Request Form</h2>
              <p className="text-xl text-gray-600">
                Provide us with detailed information about your commission requirements.
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
                    Budget Range *
                  </label>
                  <select
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
                  >
                    <option value="">Select budget range</option>
                    <option value="200-500">$200 - $500</option>
                    <option value="500-1000">$500 - $1,000</option>
                    <option value="1000-2000">$1,000 - $2,000</option>
                    <option value="2000-5000">$2,000 - $5,000</option>
                    <option value="5000+">$5,000+</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
                    Desired Size *
                  </label>
                  <select
                    id="size"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
                  >
                    <option value="">Select size</option>
                    {sizes.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-2">
                    Art Style *
                  </label>
                  <select
                    id="style"
                    name="style"
                    value={formData.style}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
                  >
                    <option value="">Select style</option>
                    {styles.map((style) => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject/Theme *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
                    placeholder="What would you like painted?"
                  />
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
                    <option value="urgent">ASAP (rush fee applies)</option>
                    <option value="2-weeks">2 weeks</option>
                    <option value="1-month">1 month</option>
                    <option value="2-months">2 months</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent resize-none"
                  placeholder="Describe your vision in detail: colors, mood, composition, any specific elements you want included or excluded..."
                />
              </div>

              <div className="mb-6">
                <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent resize-none"
                  placeholder="Any additional requirements, special requests, or information that would help our artists understand your vision better..."
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
                  Sharing references helps our artists better understand your vision. Ensure the links are publicly accessible.
                </p>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="btn-primary text-lg px-12 py-4 flex items-center space-x-2 mx-auto"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Submit Commission Request</span>
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
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Commission Process</h2>
            <p className="text-xl text-gray-600">
              Our streamlined process ensures your vision becomes reality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-forest-green rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Submit Request</h3>
              <p className="text-gray-600">Fill out our detailed commission form with your requirements.</p>
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
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Sketch & Approval</h3>
              <p className="text-gray-600">Receive initial sketches for your approval before final creation.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-forest-green rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">4</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Creation</h3>
              <p className="text-gray-600">Our artists create your masterpiece with regular progress updates.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-forest-green rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">5</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Delivery</h3>
              <p className="text-gray-600">Your commissioned artwork is carefully packaged and delivered.</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 bg-white">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">How long does a commission take?</h3>
                <p className="text-gray-600">Most commissions take 2-6 weeks depending on size, complexity, and current workload. Rush orders are available for an additional fee.</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">What's included in the price?</h3>
                <p className="text-gray-600">The price includes high-quality materials, professional artwork, basic framing options, and careful packaging. Shipping is calculated separately.</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Can I see progress updates?</h3>
                <p className="text-gray-600">Yes! We provide regular progress photos throughout the creation process so you can see your artwork come to life.</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">What if I'm not satisfied?</h3>
                <p className="text-gray-600">We offer free revisions during the creation process. If you're not completely satisfied, we'll work with you to make it right.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommissionPage
