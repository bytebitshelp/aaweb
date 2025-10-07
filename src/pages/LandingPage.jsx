import { Link } from 'react-router-dom'
import { ArrowRight, Palette, Users, Sparkles, Award, Heart, Star } from 'lucide-react'

const LandingPage = () => {
  return (
    <>
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/hero-video.mp4" type="video/mp4" />
          {/* Fallback image if video doesn't load */}
        </video>
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Welcome to{' '}
            <span className="text-gradient bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
              Arty Affairs
            </span>
          </h1>
          <p className="text-2xl md:text-3xl mb-4 text-green-100">
            Where Art Meets Passion
          </p>
          <p className="text-lg md:text-xl mb-12 text-gray-200 max-w-2xl mx-auto">
            Explore, Shop & Learn from talented artists. Discover unique artworks, 
            attend workshops, and transform your space with our interior design services.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="animate-slide-up flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/shop"
            className="btn-forest-green text-lg px-8 py-4 bg-forest-green hover:bg-opacity-90 flex items-center space-x-2"
          >
            <span>Explore Artworks</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/workshops"
            className="btn-secondary text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-forest-green"
          >
            Join Workshops
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="absolute bottom-8 left-0 right-0 z-10">
        <div className="container-max">
          <div className="flex justify-center">
            <div className="text-center animate-slide-up max-w-sm">
              <div className="w-16 h-16 bg-forest-green bg-opacity-80 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Original Artworks</h3>
              <p className="text-gray-200">
                Discover unique pieces created by talented artists
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>

    {/* New Info Section */}
    <section className="bg-dark-green text-white py-20">
      <div className="container-max">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Discover the Art of Excellence
          </h2>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Immerse yourself in a world where creativity meets craftsmanship. 
            Each piece tells a unique story, crafted with passion and precision by our talented artists.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Quality Excellence */}
          <div className="text-center group">
            <div className="w-20 h-20 bg-white bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-opacity-20 transition-all duration-300">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Premium Quality</h3>
            <p className="text-gray-200 leading-relaxed">
              Every artwork is carefully curated and crafted using the finest materials, 
              ensuring lasting beauty and exceptional quality.
            </p>
          </div>

          {/* Artist Passion */}
          <div className="text-center group">
            <div className="w-20 h-20 bg-white bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-opacity-20 transition-all duration-300">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Artisan Passion</h3>
            <p className="text-gray-200 leading-relaxed">
              Created by passionate artists who pour their heart and soul into every piece, 
              bringing you authentic and meaningful artwork.
            </p>
          </div>

          {/* Unique Experience */}
          <div className="text-center group">
            <div className="w-20 h-20 bg-white bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-opacity-20 transition-all duration-300">
              <Star className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Unique Experience</h3>
            <p className="text-gray-200 leading-relaxed">
              From original masterpieces to custom creations, each piece offers a unique 
              experience that transforms your space into something extraordinary.
            </p>
          </div>
        </div>

        <div className="text-center mt-16">
          <Link
            to="/shop"
            className="inline-flex items-center space-x-2 bg-white text-forest-green px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <span>Explore Our Collection</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
    </>
  )
}

export default LandingPage
