import { Flower2 } from 'lucide-react'
import CategoryGallery from '../components/CategoryGallery'

const BouquetsPage = () => (
  <CategoryGallery
    title="Bouquets"
    subtitle="Artistic arrangements made to be remembered."
    icon={Flower2}
    category="bouquet"
    emptyTitle="No bouquets yet"
  />
)

export default BouquetsPage
