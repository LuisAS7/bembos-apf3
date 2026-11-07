import type { Product } from '../../domain/models.ts'
import { useState } from 'react'
import { UtensilsCrossed } from 'lucide-react'

export function ProductImage({ image }: { image: Product['image'] }) {
  const [failedSource, setFailedSource] = useState('')
  return <div className={`product-image${image.duo ? ' product-image--duo' : ''}`}>
    {failedSource === image.src ? <div className="product-image-fallback" role="img" aria-label={`Imagen no disponible. ${image.alt}`}><UtensilsCrossed size={48} aria-hidden="true" /><span>Preparado a tu gusto</span></div>
      : <><img src={image.src} alt={image.alt} loading="lazy" decoding="async" width={800} height={800} onError={() => setFailedSource(image.src)} />
        {image.duo && <img className="duo-companion" src={image.src} alt="" loading="lazy" decoding="async" width={800} height={800} />}</>}
  </div>
}
