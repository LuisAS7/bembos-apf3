import { useEffect, useState } from 'react'
import { categoryLabels, products } from '../data/catalog.ts'
import { getLocation, isProductAvailable } from '../data/locations.ts'
import { filterProducts } from '../features/catalog/filterProducts.ts'
import type { CategoryFilter } from '../features/catalog/filterProducts.ts'
import { ProductCard } from '../features/catalog/ProductCard.tsx'
import { SearchField } from '../features/catalog/SearchField.tsx'
import { LocalSelector } from '../features/locations/LocalSelector.tsx'
import { useAppState } from '../hooks/useAppState.ts'
import '../features/catalog/Catalog.css'

export function MenuPage() {
  const { state } = useAppState()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [announcement, setAnnouncement] = useState('')
  const results = filterProducts(products, query, category)
  const locationName = getLocation(state.order.locationId)?.name ?? 'el local seleccionado'
  const countMessage = `${results.length} ${results.length === 1 ? 'producto encontrado' : 'productos encontrados'}.`
  const resultMessage = results.length === 0 && query.trim()
    ? `No encontramos productos para «${query.trim()}».` : countMessage
  const categoryName = category === 'all' ? 'Todas' : categoryLabels[category]
  const announcementText = `${resultMessage}${results.length > 0 && query.trim() ? ` Búsqueda: «${query.trim()}».` : ''} Categoría: ${categoryName}. Local: ${locationName}.`

  // Update results immediately; group live announcements without moving focus.
  useEffect(() => {
    const timer = window.setTimeout(() => setAnnouncement(announcementText), 300)
    return () => window.clearTimeout(timer)
  }, [announcementText])

  return <>
    <div className="page-heading">
      <p className="eyebrow">Tu pedido, a tu manera</p>
      <h1>Menú</h1>
      <p className="page-description">Hamburguesas, combos y propuestas para compartir.</p>
    </div>
    <p className="catalog-notice"><strong>Catálogo académico.</strong> Cheese y Royal conservan los datos del APF2; los demás productos son mocks. La disponibilidad es simulada. No son ofertas comerciales vigentes.</p>
    <div className="catalog-toolbar"><SearchField value={query} onChange={setQuery} /><LocalSelector /></div>
    <fieldset className="category-filter">
      <legend>Categorías</legend>
      <div className="category-options">
        {(['all', 'hamburguesas', 'combos', 'promociones'] as const).map((value) =>
          <label key={value} className={`category-option${category === value ? ' category-option--selected' : ''}`}>
            <input type="radio" name="product-category" value={value} checked={category === value} onChange={() => setCategory(value)} />
            <span>{value === 'all' ? 'Todas' : categoryLabels[value]}</span>
          </label>)}
      </div>
    </fieldset>
    <section aria-labelledby="catalog-heading">
      <div className="catalog-results-heading"><h2 id="catalog-heading">{category === 'all' ? 'Todos los productos' : categoryLabels[category]}</h2><p>{countMessage}</p></div>
      <p className="sr-only" role="status" aria-atomic="true">{announcement}</p>
      <ul id="catalog-results" className="product-grid">
        {results.map((product) => <li key={product.id}><ProductCard product={product} available={isProductAvailable(product.id, state.order.locationId)} /></li>)}
      </ul>
      {results.length === 0 && <p className="catalog-empty">{resultMessage}</p>}
    </section>
  </>
}
