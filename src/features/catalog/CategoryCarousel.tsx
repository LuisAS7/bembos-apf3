import { categoryLabels } from '../../data/catalog.ts'
import type { Category } from '../../domain/models.ts'

const images: Record<Category, string> = { hamburguesas: 'cheese', combos: 'combo-cheese', promociones: 'familiar', menus: 'menu-taypa', complementos: 'papas', pollo: 'chicken-grill', loncheritas: 'loncherita-burger' }

export function CategoryCarousel({ selected, onSelect }: { selected: Category; onSelect: (category: Category) => void }) {
  return <fieldset className="category-filter">
    <legend className="sr-only">Categorías</legend>
    <div className="category-options">
      {(Object.keys(categoryLabels) as Category[]).map((category) => <label key={category} className={`category-option${selected === category ? ' category-option--selected' : ''}`}>
        <input className="sr-only" type="radio" name="product-category" value={category} checked={selected === category}
          onFocus={(event) => event.currentTarget.closest('label')?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' })}
          onChange={() => onSelect(category)} />
        <img src={`/images/official/${images[category]}.jpg`} alt="" width={88} height={88} />
        <span>{categoryLabels[category]}</span>
      </label>)}
    </div>
  </fieldset>
}
