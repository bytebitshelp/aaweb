import { Gift } from 'lucide-react'
import CategoryGallery from '../components/CategoryGallery'

const GiftablesPage = () => (
  <CategoryGallery
    title="Giftables"
    subtitle="Thoughtful handmade gifts for every occasion."
    icon={Gift}
    category="giftable"
    emptyTitle="No giftables yet"
  />
)

export default GiftablesPage
