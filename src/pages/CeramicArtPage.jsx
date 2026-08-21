import { Landmark } from 'lucide-react'
import CategoryGallery from '../components/CategoryGallery'

const CeramicArtPage = () => (
  <CategoryGallery
    title="Ceramic Art"
    subtitle="Handcrafted ceramic pieces for home and gifting."
    icon={Landmark}
    category="ceramic"
    emptyTitle="No ceramic pieces yet"
  />
)

export default CeramicArtPage
