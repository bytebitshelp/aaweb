import { Scissors } from 'lucide-react'
import CategoryGallery from '../components/CategoryGallery'

const CrochetPage = () => (
  <CategoryGallery
    title="Crochet"
    subtitle="Handmade crochet pieces with warmth and texture."
    icon={Scissors}
    category="crochet"
    emptyTitle="No crochet pieces yet"
  />
)

export default CrochetPage
