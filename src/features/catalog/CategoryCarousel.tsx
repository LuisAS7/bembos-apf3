import { useEffect, useId, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AccessibleButton } from '../../components/ui/AccessibleButton.tsx'
import { categoryLabels } from '../../data/catalog.ts'
import type { Category } from '../../domain/models.ts'

const images: Record<Category, string> = { hamburguesas: 'cheese', combos: 'combo-cheese', promociones: 'familiar', menus: 'menu-taypa', complementos: 'papas', pollo: 'chicken-grill', loncheritas: 'loncherita-burger' }

export function CategoryCarousel({ selected, onSelect }: { selected: Category; onSelect: (category: Category) => void }) {
  const id = useId()
  const viewport = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ previous: false, next: false })
  function updateEdges() {
    const element = viewport.current
    if (!element) return
    const previous = element.scrollLeft > 1
    const next = element.scrollLeft + element.clientWidth < element.scrollWidth - 1
    setEdges((current) => current.previous === previous && current.next === next ? current : { previous, next })
  }
  useEffect(() => {
    updateEdges()
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateEdges) : null
    if (viewport.current) observer?.observe(viewport.current)
    return () => observer?.disconnect()
  }, [])
  function scroll(direction: number) {
    const element = viewport.current
    if (element) element.scrollBy({ left: direction * element.clientWidth * .8, behavior: 'auto' })
  }
  return <fieldset className="category-filter" aria-describedby={`${id}-help`}>
    <legend className="sr-only">Categorías</legend>
    <div className="category-carousel-tools"><p id={`${id}-help`} className="control-help">Desliza las categorías o usa las flechas.</p>
      <div className="category-scroll-controls">
        <AccessibleButton className="button--secondary" aria-label="Ver categorías anteriores" aria-controls={id} aria-disabled={!edges.previous} onClick={() => { if (edges.previous) scroll(-1) }}><ChevronLeft size={20} aria-hidden="true" /></AccessibleButton>
        <AccessibleButton className="button--secondary" aria-label="Ver categorías siguientes" aria-controls={id} aria-disabled={!edges.next} onClick={() => { if (edges.next) scroll(1) }}><ChevronRight size={20} aria-hidden="true" /></AccessibleButton>
      </div>
    </div>
    <div id={id} className="category-options" ref={viewport} onScroll={updateEdges}>
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
