import { OptionVisual } from './OptionVisual.tsx'
import { CircleAlert } from 'lucide-react'
import { AccessibleButton } from '../../components/ui/AccessibleButton.tsx'
import { formatPrice } from '../catalog/filterProducts.ts'
import type { AvailabilityStatus, OptionGroup as GroupDefinition } from '../../domain/models.ts'

interface OptionGroupProps {
  group: GroupDefinition
  fieldId: string
  selectedIds: string[]
  errors: string[]
  availability: (optionId: string) => AvailabilityStatus
  onChange: (ids: string[]) => void
  onViewLocations: (optionId: string, label: string) => void
}

export function OptionGroup({ group, fieldId, selectedIds, errors, availability, onChange, onViewLocations }: OptionGroupProps) {
  const helpId = `${fieldId}-help`
  const errorId = `${fieldId}-error`
  return <fieldset id={fieldId} className="config-group" tabIndex={-1} aria-describedby={`${helpId}${errors.length ? ` ${errorId}` : ''}`}>
    <legend>{group.label} <span className="field-requirement">({group.min ? 'obligatorio' : 'opcional'})</span></legend>
    <p id={helpId} className="control-help">{group.instructions ?? (group.selection === 'single' ? 'Elige una opción.' : `Puedes elegir hasta ${group.max} opciones.`)}</p>
    <div className="config-options">
      {group.options.map((option) => {
        const status = availability(option.id)
        const selected = selectedIds.includes(option.id)
        const inputId = `${fieldId}-${option.id}`
        const descriptionId = `${inputId}-description`
        return <div key={option.id} className={`config-option${selected ? ' config-option--selected' : ''}${!status.available ? ' config-option--unavailable' : ''}`}>
          <label htmlFor={inputId}>
            <input id={inputId} name={fieldId} type={group.selection === 'single' ? 'radio' : 'checkbox'}
              checked={selected} disabled={!status.available && !(group.selection === 'multiple' && selected)} required={group.selection === 'single' && group.min > 0}
              aria-required={group.selection === 'single' && group.min > 0 ? true : undefined}
              aria-invalid={errors.length > 0} aria-describedby={`${helpId}${!status.available ? ` ${descriptionId}` : ''}${errors.length ? ` ${errorId}` : ''}`}
              onChange={(event) => onChange(group.selection === 'single' ? [option.id]
                : event.target.checked ? [...selectedIds, option.id] : selectedIds.filter((id) => id !== option.id))} />
            <OptionVisual groupId={group.id} option={option} /><span className="option-name">{option.label}{selected && <span className="selected-text"> · Seleccionado</span>}</span>
            <span className="option-price">{option.additionalPriceCents === 0 ? 'Sin costo adicional' : `+ ${formatPrice(option.additionalPriceCents)}`}</span>
          </label>
          {!status.available && <div id={descriptionId} className="option-description"><p className="restriction-text"><CircleAlert size={18} aria-hidden="true" /><span>{status.reason}{selected && group.selection === 'multiple' && ' Puedes desmarcar esta opción para retirarla.'}</span></p></div>}
          {!status.available && <AccessibleButton className="button--secondary option-locations" onClick={() => onViewLocations(option.id, option.label)}>
            Ver locales<span className="sr-only"> para {option.label}</span>
          </AccessibleButton>}
        </div>
      })}
    </div>
    {errors.length > 0 && <div id={errorId} className="field-errors">{errors.map((error, index) => <p key={`${index}-${error}`}>{error}</p>)}</div>}
  </fieldset>
}
