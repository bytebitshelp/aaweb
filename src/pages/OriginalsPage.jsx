import { Palette } from 'lucide-react'
import CategoryGallery from '../components/CategoryGallery'

const OriginalsPage = () => (
  <CategoryGallery
    title="Original Artworks"
    subtitle="One-of-a-kind paintings and drawings created by our artists."
    icon={Palette}
    category="original"
    emptyTitle="No original artworks yet"
  />
)

export default OriginalsPage
