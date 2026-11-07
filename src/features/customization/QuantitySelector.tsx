import { Minus, Plus } from 'lucide-react'
import { AccessibleButton } from '../../components/ui/AccessibleButton.tsx'
import { MAX_QUANTITY } from './configuration.ts'
import { formatPrice } from '../catalog/filterProducts.ts'

export function QuantitySelector({ id, value, error, onChange, disabled = false, productName = 'este producto', totalCents = null }: { id: string; productName?: string; value: string; error?: string; disabled?: boolean; onChange: (value: string) => void; totalCents?: number | null }) {
  const number = Number(value)
  function change(delta: number) {
    const next = Number.isInteger(number) ? Math.min(MAX_QUANTITY, Math.max(1, number + delta)) : 1
    onChange(String(next))
  }
  const unitWord = number === 1 ? 'unidad' : 'unidades'
  const totalText = totalCents === null ? 'Total por actualizar.' : `Total ${formatPrice(totalCents)}.`
  const announcement = `${productName}: ${value} ${unitWord}. ${totalText}`
  return <div id={id} className="quantity-field" role="group" tabIndex={-1} aria-labelledby={`${id}-label`} aria-describedby={`${id}-help${error ? ` ${id}-error` : ''}`}>
    <p id={`${id}-label`} className="quantity-label">Cantidad <span className="quantity-limits">(1–{MAX_QUANTITY})</span></p>
    <div className="quantity-controls">
      <AccessibleButton className="button--secondary" aria-label={`Disminuir cantidad de ${productName}`} disabled={disabled || number <= 1} onClick={() => change(-1)}><Minus size={20} aria-hidden="true" /></AccessibleButton>
      <output aria-label={`Cantidad de ${productName}`} aria-atomic="true">{value}</output>
      <AccessibleButton className="button--secondary" aria-label={`Aumentar cantidad de ${productName}`} disabled={disabled || number >= MAX_QUANTITY} onClick={() => change(1)}><Plus size={20} aria-hidden="true" /></AccessibleButton>
    </div>
    <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>
    <p id={`${id}-help`} className="control-help">Entre 1 y {MAX_QUANTITY} unidades de este producto o promoción.</p>
    {error && <p id={`${id}-error`} className="field-errors">{error}</p>}
  </div>
}
