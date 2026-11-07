import { ArrowRight, CircleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AccessibleButton } from '../../components/ui/AccessibleButton.tsx'
import { ProductImage } from '../../components/ui/ProductImage.tsx'
import { categoryLabels } from '../../data/catalog.ts'
import type { CatalogProduct } from '../../domain/models.ts'
import { formatPrice } from './filterProducts.ts'

export function ProductCard({ product, available, showCategory = false }: { product: CatalogProduct; available: boolean; showCategory?: boolean }) {
  return <article className="product-card" aria-labelledby={`product-${product.id}`}>
    <ProductImage image={product.image} />
    <div className="product-content">
      {showCategory && <p className="product-category">{categoryLabels[product.category]}</p>}
      <h3 id={`product-${product.id}`}>{product.name}</h3>
      <p className="product-description">{product.description}</p>
      {!available && <p className="product-availability is-unavailable"><CircleAlert size={18} aria-hidden="true" />Agotado en este local. Elige otro local para consultar su disponibilidad.</p>}
      <div className="product-purchase"><p className="product-price">{formatPrice(product.basePriceCents)}</p>
        {available ? <Link className="button" to={`/productos/${product.id}/personalizar`}>Personalizar<span className="sr-only">: {product.name}</span><ArrowRight size={18} aria-hidden="true" /></Link>
          : <AccessibleButton disabled>No disponible<span className="sr-only">: {product.name}</span></AccessibleButton>}
      </div>
    </div>
  </article>
}
