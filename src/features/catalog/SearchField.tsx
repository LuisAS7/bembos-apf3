import { Search } from 'lucide-react'
import { AccessibleButton } from '../../components/ui/AccessibleButton.tsx'

interface SearchFieldProps { value: string; onChange: (value: string) => void }

export function SearchField({ value, onChange }: SearchFieldProps) {
  return <form className="catalog-search" role="search" onSubmit={(event) => event.preventDefault()}>
    <label htmlFor="product-search">Buscar productos</label>
    <div className="catalog-control-row">
      <div className="search-input-wrap">
        <Search size={20} aria-hidden="true" />
        <input id="product-search" type="search" value={value} onChange={(event) => onChange(event.target.value)}
          placeholder="Nombre, descripción o categoría" aria-describedby="search-help" aria-controls="catalog-results" />
      </div>
      <AccessibleButton className="button--secondary" disabled={!value} onClick={() => onChange('')}>Borrar búsqueda</AccessibleButton>
    </div>
    <p id="search-help" className="control-help">Busca entre las categorías o filtra por una de ellas.</p>
  </form>
}
