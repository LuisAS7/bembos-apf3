import { Search, X } from 'lucide-react'

interface SearchFieldProps { value: string; onChange: (value: string) => void }

export function SearchField({ value, onChange }: SearchFieldProps) {
  return <form className="catalog-search" role="search" onSubmit={(event) => event.preventDefault()}>
    <label htmlFor="product-search">Buscar productos</label>
    <div className="catalog-control-row">
      <div className="search-input-wrap">
        <Search size={20} aria-hidden="true" />
        <input id="product-search" type="search" value={value} onChange={(event) => onChange(event.target.value)}
          placeholder="¿Cheese, Royal o un combo?" aria-controls="catalog-results" />
        {value && <button className="search-clear" type="button" aria-label="Borrar búsqueda" onClick={() => { onChange(''); document.getElementById('product-search')?.focus() }}><X size={18} aria-hidden="true" /></button>}
      </div>
    </div>
  </form>
}
