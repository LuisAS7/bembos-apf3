import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { ChevronDown, MapPin, Check } from 'lucide-react'
import { AccessibleButton } from '../../components/ui/AccessibleButton.tsx'
import { AccessibleModal } from '../../components/ui/AccessibleModal.tsx'
import { getLocation, locations } from '../../data/locations.ts'
import { getConfigurableProduct } from '../../data/customizations.ts'
import { useAppState } from '../../hooks/useAppState.ts'
import { readOrder } from '../../storage/browserStorage.ts'
import { planLocationChange } from './prepareLocationChange.ts'
import type { LocationPlan } from './prepareLocationChange.ts'

export function LocalSelector() {
  const { state, dispatch } = useAppState()
  const [selectedId, setSelectedId] = useState(state.order.locationId)
  const [open, setOpen] = useState(false)
  const [plan, setPlan] = useState<LocationPlan | null>(null)
  const modalId = useId()
  function makePlan(id: string) {
    const preview = state.configurationPreview
    const product = preview ? getConfigurableProduct(preview.productId) : undefined
    return planLocationChange(id, state.order, readOrder(), preview && product ? { ...preview, product } : undefined)
  }
  function close() { setOpen(false); setPlan(null) }
  function commit(candidate: LocationPlan) {
    const fresh = makePlan(candidate.locationId)
    if (fresh.blocked || JSON.stringify(fresh) !== JSON.stringify(candidate)) { setPlan(fresh); return }
    dispatch({ type: 'order/replace', value: fresh.order! })
    dispatch({ type: 'toast/notify', kind: fresh.issues.length ? 'warning' : 'success', message: `Local actualizado: ${getLocation(fresh.locationId)?.name}. Revisa la disponibilidad de tu selección.` })
    close()
  }
  function select(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!getLocation(selectedId)) return
    if (selectedId === state.order.locationId) { close(); return }
    const candidate = makePlan(selectedId)
    if (candidate.blocked || candidate.issues.length) setPlan(candidate)
    else commit(candidate)
  }
  return <>
    <button className="header-location" type="button" aria-haspopup="dialog" aria-expanded={open} aria-controls={modalId}
      onClick={() => { setSelectedId(state.order.locationId); setPlan(null); setOpen(true) }}>
      <MapPin size={22} aria-hidden="true" /><span><small>Tu local</small>{getLocation(state.order.locationId)?.name ?? 'Seleccionar local'}</span><ChevronDown size={18} aria-hidden="true" />
    </button>
    <AccessibleModal id={modalId} key={plan ? `${plan.locationId}:${plan.issues.join('|')}` : 'locations'} open={open} title={plan ? 'Cambiar de local' : 'Elige tu local'} onClose={close}>
      {plan ? <>
        <p>{plan.blocked ? 'Conservamos tu local actual para proteger el pedido.' : `En ${getLocation(plan.locationId)?.name}, estas selecciones requieren revisión:`}</p>
        <ul className="location-impact">{plan.issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>
        {!plan.blocked && <p>Conservaremos todos los productos y sus opciones. Los ítems incompatibles mostrarán «Requiere actualización» hasta editarlos o eliminarlos.</p>}
        <div className="modal-actions"><AccessibleButton className="button--secondary" onClick={close}>Mantener local actual</AccessibleButton>
          {!plan.blocked && <AccessibleButton onClick={() => commit(plan)}>Cambiar de local</AccessibleButton>}</div>
      </> : <form onSubmit={select} className="location-form">
        <fieldset className="location-choices"><legend>Local (obligatorio)</legend>
          {locations.map((location) => <label key={location.id} className={`location-choice${selectedId === location.id ? ' location-choice--selected' : ''}`}>
            <input type="radio" name="location" value={location.id} checked={selectedId === location.id} required aria-required="true" onChange={() => setSelectedId(location.id)} />
            <MapPin size={20} aria-hidden="true" /><span>{location.name}{state.order.locationId === location.id && <small>Local actual</small>}</span>{selectedId === location.id && <Check size={20} aria-hidden="true" />}
          </label>)}
        </fieldset>
        <div className="modal-actions"><AccessibleButton className="button--secondary" onClick={close}>Cancelar</AccessibleButton><AccessibleButton type="submit" disabled={!getLocation(selectedId)}>Usar este local</AccessibleButton></div>
      </form>}
    </AccessibleModal>
  </>
}
