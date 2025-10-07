import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Home, ArrowRight, CheckCircle, Star, Users, Award } from 'lucide-react'

const InteriorDesignPage = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('interior_design_projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching projects:', error)
        setProjects(getMockProjects())
      } else {
        setProjects(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
      setProjects(getMockProjects())
    } finally {
      setLoading(false)
    }
  }

  const getMockProjects = () => [
    {
      id: '1',
      title: 'Modern Living Room Transformation',
      description: 'Complete living room makeover with contemporary art pieces and minimalist design.',
      case_study: 'This project involved transforming a traditional living room into a modern, art-focused space. We selected bold abstract paintings and sleek sculptures to create visual interest while maintaining functionality.',
      image_urls: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'
      ],
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      title: 'Bohemian Bedroom Retreat',
      description: 'Eclectic bedroom design featuring vibrant artwork and natural textures.',
      case_study: 'A creative approach to bedroom design that combines bohemian aesthetics with carefully curated art pieces. The result is a personal sanctuary that reflects the client\'s artistic personality.',
      image_urls: [
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=600&fit=crop'
      ],
      created_at: '2024-01-10T14:30:00Z'
    },
    {
      id: '3',
      title: 'Corporate Office Art Installation',
      description: 'Professional office space enhanced with inspiring artwork and modern design elements.',
      case_study: 'This corporate project required balancing professional aesthetics with inspiring art pieces. We selected contemporary works that would motivate employees while maintaining a sophisticated business environment.',
      image_urls: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'
      ],
      created_at: '2024-01-05T09:15:00Z'
    }
  ]

  const services = [
    {
      icon: <Home className="w-8 h-8" />,
      title: 'Space Planning',
      description: 'Optimal furniture and artwork placement for maximum visual impact and functionality.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Art Curation',
      description: 'Personalized selection of artworks that complement your space and reflect your style.'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Custom Design',
      description: 'Bespoke interior design solutions tailored to your unique preferences and lifestyle.'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Homeowner',
      content: 'Arty Affairs transformed our living space completely. The art curation was perfect and the design exceeded our expectations.',
      rating: 5
    },
    {
      name: 'David Chen',
      role: 'Business Owner',
      content: 'Professional service with incredible attention to detail. Our office looks amazing and employees love the new atmosphere.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Interior Designer',
      content: 'As a fellow designer, I was impressed by their artistic vision and execution. Highly recommend their services.',
      rating: 5
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-forest-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interior design projects...</p>
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
              <Home className="w-8 h-8 text-forest-green" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Interior Design Services
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform your space with our expert interior design services. We specialize in 
              incorporating beautiful artwork into functional, inspiring environments.
            </p>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-white">
        <div className="container-max section-padding">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-forest-green bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4 text-forest-green">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Projects */}
      <div className="container-max section-padding">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
          Featured Projects
        </h2>
        
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No projects available
            </h3>
            <p className="text-gray-600">
              Check back soon for our latest interior design projects.
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {projects.map((project, index) => (
              <div key={project.id} className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {project.description}
                  </p>
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Case Study</h4>
                    <p className="text-gray-600">
                      {project.case_study}
                    </p>
                  </div>
                  <button className="btn-primary flex items-center space-x-2">
                    <span>View Full Project</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                
                <div className={index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                  <div className="grid grid-cols-2 gap-4">
                    {project.image_urls.slice(0, 4).map((image, imgIndex) => (
                      <div key={imgIndex} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`${project.title} - Image ${imgIndex + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Testimonials */}
      <div className="bg-white">
        <div className="container-max section-padding">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            What Our Clients Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-forest-green">
        <div className="container-max section-padding text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Space?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Let our expert designers help you create a beautiful, functional space 
            that reflects your unique style and personality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary bg-white text-forest-green hover:bg-gray-100">
              Schedule Consultation
            </button>
            <button className="btn-secondary border-white text-white hover:bg-white hover:text-forest-green">
              View Portfolio
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InteriorDesignPage
