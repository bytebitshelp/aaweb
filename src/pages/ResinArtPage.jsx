import { Droplets } from 'lucide-react'
import CategoryGallery from '../components/CategoryGallery'

const ResinArtPage = () => (
  <CategoryGallery
    title="Resin Art"
    subtitle="Glossy, sculptural pieces with depth, colour, and movement."
    icon={Droplets}
    category="resin_art"
    emptyTitle="No resin artworks yet"
  />
)

export default ResinArtPage
