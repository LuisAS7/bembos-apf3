import { useEffect, useState } from 'react'
import { categoryLabels, products } from '../data/catalog.ts'
import type { Category } from '../domain/models.ts'
import { isProductAvailable } from '../data/locations.ts'
import { menuProducts } from '../features/catalog/filterProducts.ts'
import { ProductCard } from '../features/catalog/ProductCard.tsx'
import { SearchField } from '../features/catalog/SearchField.tsx'
import { useAppState } from '../hooks/useAppState.ts'
import '../features/catalog/Catalog.css'

const categoryImages: Record<Category, string> = { hamburguesas: 'cheese', combos: 'combo-cheese', promociones: 'familiar' }
export function MenuPage() {
  const { state } = useAppState()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category>('hamburguesas')
  const [announcement, setAnnouncement] = useState('')
  const results = menuProducts(products, query, category)
  const searching = Boolean(query.trim())
  const announcementText = `${results.length} ${results.length === 1 ? 'producto encontrado' : 'productos encontrados'}. ${searching ? `Búsqueda: «${query.trim()}», en Hamburguesas, Combos y Promociones.` : categoryLabels[category]}`
  useEffect(() => {
    const timer = window.setTimeout(() => setAnnouncement(announcementText), 300)
    return () => window.clearTimeout(timer)
  }, [announcementText])
  return <>
    <div className="menu-heading"><div><p className="eyebrow">Hechas a la parrilla</p><h1>¿Qué se te antoja?</h1><p className="page-description">Elige tu favorita. Dale tu toque.</p></div><SearchField value={query} onChange={setQuery} /></div>
    <fieldset className="category-filter"><legend className="sr-only">Categorías</legend>
      <div className="category-options">{(['hamburguesas', 'combos', 'promociones'] as const).map((value) => <label key={value} className={`category-option${category === value ? ' category-option--selected' : ''}`}>
        <input type="radio" name="product-category" value={value} checked={category === value} onChange={() => { setCategory(value); setQuery('') }} />
        <img src={`/images/official/${categoryImages[value]}.jpg`} alt="" width={88} height={88} />
        <span>{categoryLabels[value]}</span>
      </label>)}</div>
    </fieldset>
    <section aria-labelledby="catalog-heading">
      <div className="catalog-results-heading"><h2 id="catalog-heading">{searching ? `Resultados para «${query.trim()}»` : categoryLabels[category]}</h2>
        {searching && <p>En Hamburguesas, Combos y Promociones</p>}</div>
      <p className="sr-only" role="status" aria-atomic="true">{announcement}</p>
      <ul id="catalog-results" className="product-grid">{results.map((product) => <li key={product.id}><ProductCard product={product} available={isProductAvailable(product.id, state.order.locationId)} showCategory={searching} /></li>)}</ul>
      {results.length === 0 && <p className="catalog-empty">{searching ? `No encontramos productos para «${query.trim()}».` : 'No hay productos en esta categoría.'}</p>}
    </section>
  </>
}
