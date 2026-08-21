import { Link } from 'react-router-dom'
import { ArrowRight, Award, Heart, Star, Palette, Sparkles, Home } from 'lucide-react'

const collections = [
  { name: 'Originals', href: '/originals', image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop', blurb: 'One-of-a-kind paintings' },
  { name: 'Resin Art', href: '/resin-art', image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop', blurb: 'Gloss and colour in layers' },
  { name: 'Giftables', href: '/giftables', image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&h=600&fit=crop', blurb: 'Handmade presents' },
  { name: 'Workshops', href: '/workshops', image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop', blurb: 'Learn with us' },
]

const LandingPage = () => {
  return (
    <>
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1600&h=900&fit=crop"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/60" />
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto py-24">
          <img src="/logo.jpg" alt="Arty Affairs" className="w-28 h-28 md:w-36 md:h-36 object-cover rounded-2xl mx-auto mb-6 shadow-xl" />
          <p className="uppercase tracking-[0.35em] text-sm text-green-100 mb-4">Studio · Gallery · Workshops</p>
          <h1 className="font-display text-5xl md:text-7xl font-semibold mb-6 leading-tight">
            Arty Affairs
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-green-50">Where art meets passion</p>
          <p className="text-base md:text-lg mb-10 text-gray-200 max-w-2xl mx-auto">
            Original artworks, custom commissions, workshops, and interiors — made by artists, for spaces that feel like yours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/shop" className="btn-primary text-lg px-8 py-4">
              <span>Explore artworks</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/workshops"
              className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-4 rounded-lg font-medium hover:bg-white hover:text-forest-green transition-all"
            >
              Join a workshop
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-cream section-padding">
        <div className="container-max">
          <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-forest-green mb-2">Collections</p>
              <h2 className="font-display text-3xl md:text-4xl text-gray-900">Start exploring</h2>
            </div>
            <Link to="/shop" className="text-forest-green font-medium inline-flex items-center gap-2">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {collections.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="group relative overflow-hidden rounded-2xl aspect-[4/5] bg-gray-200"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <h3 className="font-display text-2xl">{item.name}</h3>
                  <p className="text-sm text-gray-200">{item.blurb}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-dark-green text-white py-20">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl mb-6">The art of excellence</h2>
            <p className="text-lg text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Each piece is curated and crafted with care — from original canvases to custom commissions and interiors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Premium quality</h3>
              <p className="text-gray-200 leading-relaxed">Materials and finishing chosen to last, so the work stays beautiful in your home.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Made by artists</h3>
              <p className="text-gray-200 leading-relaxed">Every artwork is created by people who care about the story behind the piece.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Made for you</h3>
              <p className="text-gray-200 leading-relaxed">Shop ready works, or commission something that fits your space and brief.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Palette, title: 'Shop originals', text: 'Browse paintings, resin, ceramics, and giftables.', href: '/shop' },
              { icon: Sparkles, title: 'Commission a piece', text: 'Share a brief and we will create something unique.', href: '/commission' },
              { icon: Home, title: 'Style your space', text: 'Interior styling that puts art at the centre.', href: '/interior-design' },
            ].map((card) => (
              <Link key={card.title} to={card.href} className="p-8 rounded-2xl border border-gray-100 bg-cream hover:shadow-lg transition-shadow">
                <card.icon className="w-8 h-8 text-forest-green mb-4" />
                <h3 className="font-display text-2xl mb-2">{card.title}</h3>
                <p className="text-gray-600 mb-4">{card.text}</p>
                <span className="text-forest-green font-medium inline-flex items-center gap-2">
                  Learn more <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default LandingPage
