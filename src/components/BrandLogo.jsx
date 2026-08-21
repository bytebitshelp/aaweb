const BrandLogo = ({ className = 'h-12 w-12', rounded = 'rounded-md' }) => (
  <img
    src="/logo.jpg"
    alt="Arty Affairs"
    className={`object-cover ${rounded} ${className}`}
  />
)

export default BrandLogo
