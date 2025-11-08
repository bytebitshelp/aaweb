import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Calendar, Clock, Users, MapPin, ArrowRight, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { sendSupportEmail, buildHtmlFromObject } from '../services/resendEmail'

const WorkshopsPage = () => {
  const [upcomingWorkshops, setUpcomingWorkshops] = useState([])
  const [previousWorkshops, setPreviousWorkshops] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkshops()
  }, [])

  const fetchWorkshops = async () => {
    try {
      setLoading(true)
      
      // Fetch upcoming workshops
      const { data: upcoming, error: upcomingError } = await supabase
        .from('workshops')
        .select('*')
        .eq('is_upcoming', true)
        .order('date', { ascending: true })

      // Fetch previous workshops
      const { data: previous, error: previousError } = await supabase
        .from('workshops')
        .select('*')
        .eq('is_upcoming', false)
        .order('date', { ascending: false })

      if (upcomingError || previousError) {
        console.error('Error fetching workshops:', upcomingError || previousError)
        const mockData = getMockWorkshops()
        setUpcomingWorkshops(mockData.upcoming)
        setPreviousWorkshops(mockData.previous)
      } else {
        setUpcomingWorkshops(upcoming || [])
        setPreviousWorkshops(previous || [])
      }
    } catch (error) {
      console.error('Error:', error)
      const mockData = getMockWorkshops()
      setUpcomingWorkshops(mockData.upcoming)
      setPreviousWorkshops(mockData.previous)
    } finally {
      setLoading(false)
    }
  }

  const getMockWorkshops = () => ({
    upcoming: [
      {
        id: '1',
        name: 'Watercolor Painting for Beginners',
        description: 'Learn the basics of watercolor painting with professional artist Sarah Johnson. Perfect for beginners who want to explore this beautiful medium.',
        date: '2024-02-15T10:00:00Z',
        is_upcoming: true,
        image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=300&fit=crop'
      },
      {
        id: '2',
        name: 'Resin Art Masterclass',
        description: 'Advanced techniques in resin art with Michael Chen. Learn to create stunning pieces with metallic accents and unique textures.',
        date: '2024-02-22T14:00:00Z',
        is_upcoming: true,
        image_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=300&fit=crop'
      },
      {
        id: '3',
        name: 'Abstract Expressionism Workshop',
        description: 'Explore abstract painting techniques with Lisa Wang. Learn to express emotions through color, texture, and composition.',
        date: '2024-03-01T11:00:00Z',
        is_upcoming: true,
        image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=300&fit=crop'
      }
    ],
    previous: [
      {
        id: '4',
        name: 'Oil Painting Fundamentals',
        description: 'Master the basics of oil painting with professional techniques.',
        date: '2024-01-20T10:00:00Z',
        is_upcoming: false,
        image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=300&fit=crop'
      },
      {
        id: '5',
        name: 'Digital Art Creation',
        description: 'Learn digital art techniques using modern software and tablets.',
        date: '2024-01-13T14:00:00Z',
        is_upcoming: false,
        image_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=300&fit=crop'
      },
      {
        id: '6',
        name: 'Portrait Drawing Workshop',
        description: 'Develop your portrait drawing skills with professional guidance.',
        date: '2024-01-06T11:00:00Z',
        is_upcoming: false,
        image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=300&fit=crop'
      }
    ]
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const handleJoinWorkshop = async (workshop) => {
    const toastId = `join-${workshop.id}`
    toast.loading('Registering your interest...', { id: toastId })

    const html = buildHtmlFromObject('Workshop Enquiry', [
      { label: 'Workshop', value: workshop.name },
      { label: 'Scheduled For', value: `${formatDate(workshop.date)} at ${formatTime(workshop.date)}` },
      { label: 'Description', value: workshop.description }
    ])

    const emailResult = await sendSupportEmail({
      subject: `Workshop enquiry - ${workshop.name}`,
      html
    })

    toast.dismiss(toastId)

    if (emailResult.success) {
      toast.success('Thanks! We will contact you with workshop details soon.')
    } else {
      toast.error(emailResult.error || 'Unable to send your request. Please try again later.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-forest-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workshops...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-max section-padding">
          <div className="text-center">
            <div className="w-16 h-16 bg-forest-green bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-forest-green" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Art Workshops
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Learn from professional artists in our hands-on workshops. Whether you're a beginner 
              or looking to refine your skills, we have the perfect class for you.
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Workshops */}
      <div className="container-max section-padding">
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Upcoming Workshops
          </h2>
          
          {upcomingWorkshops.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No upcoming workshops
              </h3>
              <p className="text-gray-600">
                Check back soon for new workshop announcements.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingWorkshops.map((workshop) => (
                <div key={workshop.id} className="bg-white rounded-lg shadow-md overflow-hidden card-hover">
                  <div className="aspect-video bg-gray-200 relative overflow-hidden">
                    <img
                      src={workshop.image_url}
                      alt={workshop.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-forest-green text-white px-3 py-1 rounded-full text-sm font-medium">
                        Upcoming
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {workshop.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {workshop.description}
                    </p>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(workshop.date)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{formatTime(workshop.date)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>Arty Affairs Studio</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleJoinWorkshop(workshop)}
                      className="w-full btn-primary flex items-center justify-center space-x-2"
                    >
                      <span>Join Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Previous Workshops */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Previous Workshops
          </h2>
          
          {previousWorkshops.length === 0 ? (
            <div className="text-center py-16">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No previous workshops
              </h3>
              <p className="text-gray-600">
                We'll showcase our completed workshops here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {previousWorkshops.map((workshop) => (
                <div key={workshop.id} className="bg-white rounded-lg shadow-md overflow-hidden card-hover">
                  <div className="aspect-video bg-gray-200 relative overflow-hidden">
                    <img
                      src={workshop.image_url}
                      alt={workshop.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Completed
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {workshop.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {workshop.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(workshop.date)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">
                        "Amazing workshop! Learned so much and met wonderful people. Can't wait for the next one!"
                      </p>
                      <p className="text-xs text-green-600 mt-1">- Workshop Participant</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WorkshopsPage
