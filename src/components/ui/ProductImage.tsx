import type { Product } from '../../domain/models.ts'

export function ProductImage({ image }: { image: Product['image'] }) {
  return <div className={`product-image${image.crop ? ` product-image--${image.crop}` : ''}`}>
    <img src={image.src} alt={image.alt} loading="lazy" width={image.crop ? 361 : 600} height={image.crop ? 692 : 300} />
  </div>
}
