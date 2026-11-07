import { AccessibleButton } from '../../components/ui/AccessibleButton.tsx'
import { MAX_QUANTITY } from './configuration.ts'

export function QuantitySelector({ id, value, error, onChange }: { id: string; value: string; error?: string; onChange: (value: string) => void }) {
  const number = Number(value)
  function change(delta: number) {
    const next = Number.isInteger(number) ? Math.min(MAX_QUANTITY, Math.max(1, number + delta)) : 1
    onChange(String(next))
  }
  return <div className="quantity-field">
    <label htmlFor={id}>Cantidad (obligatoria)</label>
    <div className="quantity-controls">
      <AccessibleButton className="button--secondary" aria-label="Menos: disminuir cantidad" disabled={Number.isInteger(number) && number <= 1} onClick={() => change(-1)}>Menos</AccessibleButton>
      <input id={id} type="number" inputMode="numeric" min={1} max={MAX_QUANTITY} step={1} required aria-required="true" value={value}
        aria-invalid={Boolean(error)} aria-describedby={`${id}-help${error ? ` ${id}-error` : ''}`} onChange={(event) => onChange(event.target.value)} />
      <AccessibleButton className="button--secondary" aria-label="Más: aumentar cantidad" disabled={Number.isInteger(number) && number >= MAX_QUANTITY} onClick={() => change(1)}>Más</AccessibleButton>
    </div>
    <p id={`${id}-help`} className="control-help">Entre 1 y {MAX_QUANTITY} unidades de este producto o promoción.</p>
    {error && <p id={`${id}-error`} className="field-errors">{error}</p>}
  </div>
}
