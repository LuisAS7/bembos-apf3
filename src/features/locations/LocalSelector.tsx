import { useState } from 'react'
import type { FormEvent } from 'react'
import { AccessibleButton } from '../../components/ui/AccessibleButton.tsx'
import { getLocation, locations } from '../../data/locations.ts'
import { useAppState } from '../../hooks/useAppState.ts'
import { readOrder } from '../../storage/browserStorage.ts'
import { prepareLocationChange } from './prepareLocationChange.ts'

export function LocalSelector() {
  const { state, dispatch } = useAppState()
  const [selectedId, setSelectedId] = useState(state.order.locationId)
  const [message, setMessage] = useState('')

  function applyLocation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = prepareLocationChange(selectedId, state.order, readOrder())
    if (!result.ok) { setMessage(result.message); return }
    dispatch({ type: 'order/replace', value: result.order })
    setMessage(`Local seleccionado: ${getLocation(selectedId)?.name}. Disponibilidad de productos actualizada.`)
  }

  return <form className="local-selector" onSubmit={applyLocation}>
    <label htmlFor="order-location">Local del pedido</label>
    <div className="catalog-control-row">
      <select id="order-location" value={selectedId} onChange={(event) => { setSelectedId(event.target.value); setMessage('') }}
        aria-describedby="location-help">
        {locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
      </select>
      <AccessibleButton type="submit" disabled={selectedId === state.order.locationId}>Aplicar local</AccessibleButton>
    </div>
    <p id="location-help" className="control-help">Elige un local y pulsa Aplicar local. La disponibilidad es simulada.</p>
    <p role="status" aria-atomic="true" className="local-feedback">{message}</p>
  </form>
}
