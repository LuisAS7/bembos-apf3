import type { CatalogProduct, Category } from '../../domain/models.ts'
import { categoryLabels } from '../../data/catalog.ts'

export type CategoryFilter = Category | 'all'

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-PE').trim()
}

export function filterProducts(catalog: readonly CatalogProduct[], query: string, category: CategoryFilter): CatalogProduct[] {
  const search = normalize(query)
  return catalog.filter((product) => (category === 'all' || product.category === category) &&
    normalize(`${product.name} ${product.description} ${categoryLabels[product.category]}`).includes(search))
}

// Searching always crosses the three categories; the category remains a browsing choice.
export function menuProducts(catalog: readonly CatalogProduct[], query: string, category: Category): CatalogProduct[] {
  return filterProducts(catalog, query, query.trim() ? 'all' : category)
}

export function formatPrice(cents: number): string {
  return `S/${(cents / 100).toFixed(2)}`
}
