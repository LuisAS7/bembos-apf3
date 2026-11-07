import { CheckCircle2, CircleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AccessibleButton } from '../../components/ui/AccessibleButton.tsx'
import { categoryLabels } from '../../data/catalog.ts'
import type { CatalogProduct } from '../../domain/models.ts'
import { formatPrice } from './filterProducts.ts'

export function ProductCard({ product, available }: { product: CatalogProduct; available: boolean }) {
  const StatusIcon = available ? CheckCircle2 : CircleAlert
  return <article className="product-card" aria-labelledby={`product-${product.id}`}>
    <div className={`product-image${product.image.crop ? ` product-image--${product.image.crop}` : ''}`}>
      <img src={product.image.src} alt={product.image.alt} loading="lazy" width={product.image.crop ? 361 : 600} height={product.image.crop ? 692 : 300} />
    </div>
    <div className="product-content">
      <div className="product-meta"><span>{categoryLabels[product.category]}</span><span className="source-badge">{product.source.kind === 'apf2' ? 'Referencia APF2' : 'Mock académico'}</span></div>
      <div className="product-heading"><h3 id={`product-${product.id}`}>{product.name}</h3><p className="product-price">{formatPrice(product.basePriceCents)}</p></div>
      <p className="product-description">{product.description}</p>
      <p className={`product-availability ${available ? 'is-available' : 'is-unavailable'}`}>
        <StatusIcon size={18} aria-hidden="true" />{available ? 'Disponible en este local' : 'Agotado en este local'}
      </p>
      {available
        ? <Link className="button" to={`/productos/${product.id}/personalizar`}>Ver producto<span className="sr-only">: {product.name}</span></Link>
        : <AccessibleButton disabled>No disponible<span className="sr-only">: {product.name}</span></AccessibleButton>}
    </div>
  </article>
}
