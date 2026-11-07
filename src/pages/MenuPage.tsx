import { useEffect, useState } from 'react'
import { categoryLabels, products } from '../data/catalog.ts'
import type { Category } from '../domain/models.ts'
import { isProductAvailable } from '../data/locations.ts'
import { menuProducts } from '../features/catalog/filterProducts.ts'
import { ProductCard } from '../features/catalog/ProductCard.tsx'
import { CategoryCarousel } from '../features/catalog/CategoryCarousel.tsx'
import { SearchField } from '../features/catalog/SearchField.tsx'
import { useAppState } from '../hooks/useAppState.ts'
import '../features/catalog/Catalog.css'

export function MenuPage() {
  const { state } = useAppState()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category>('hamburguesas')
  const [announcement, setAnnouncement] = useState('')
  const results = menuProducts(products, query, category)
  const searching = Boolean(query.trim())
  const announcementText = `${results.length} ${results.length === 1 ? 'producto encontrado' : 'productos encontrados'}. ${searching ? `Búsqueda: «${query.trim()}», en todas las categorías.` : categoryLabels[category]}`
  useEffect(() => {
    const timer = window.setTimeout(() => setAnnouncement(announcementText), 300)
    return () => window.clearTimeout(timer)
  }, [announcementText])
  return <>
    <div className="menu-heading"><div><p className="eyebrow">Hechas a la parrilla</p><h1>¿Qué se te antoja?</h1><p className="page-description">Elige tu favorita. Dale tu toque.</p></div><SearchField value={query} onChange={setQuery} /></div>
    <CategoryCarousel selected={category} onSelect={(value) => { setCategory(value); setQuery('') }} />
    <section aria-labelledby="catalog-heading">
      <div className="catalog-results-heading"><h2 id="catalog-heading">{searching ? `Resultados para «${query.trim()}»` : categoryLabels[category]}</h2>
        {searching && <p>En todas las categorías</p>}</div>
      <p className="sr-only" role="status" aria-atomic="true">{announcement}</p>
      <ul id="catalog-results" className="product-grid">{results.map((product) => <li key={product.id}><ProductCard product={product} available={isProductAvailable(product.id, state.order.locationId)} showCategory={searching} /></li>)}</ul>
      {results.length === 0 && <p className="catalog-empty">{searching ? `No encontramos productos para «${query.trim()}».` : 'No hay productos en esta categoría.'}</p>}
    </section>
  </>
}
