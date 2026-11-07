import { useState } from 'react'
import type { FormEvent } from 'react'
import { AccessibleButton } from '../../components/ui/AccessibleButton.tsx'
import { AccessibleModal } from '../../components/ui/AccessibleModal.tsx'
import type { Product, ProductConfiguration } from '../../domain/models.ts'
import { evaluateConfiguration } from '../customization/configuration.ts'
import { getLocation, locations } from '../../data/locations.ts'
import { useAppState } from '../../hooks/useAppState.ts'
import { readOrder } from '../../storage/browserStorage.ts'
import { prepareLocationChange } from './prepareLocationChange.ts'

interface ConfigurationContext { product: Product; configuration: ProductConfiguration; quantity: number }
interface ChangeDialog { locationId: string; issues: string[]; blocked: boolean }

export function LocalSelector({ configurationContext }: { configurationContext?: ConfigurationContext } = {}) {
  const { state, dispatch } = useAppState()
  const [selectedId, setSelectedId] = useState(state.order.locationId)
  const [message, setMessage] = useState('')
  const [dialog, setDialog] = useState<ChangeDialog | null>(null)

  function commitLocation(locationId: string) {
    // Re-read before applying: another tab may have saved an order meanwhile.
    const result = prepareLocationChange(locationId, state.order, readOrder())
    setDialog(null)
    if (!result.ok) { setMessage(result.message); return }
    dispatch({ type: 'order/replace', value: result.order })
    setMessage(`Local seleccionado: ${getLocation(locationId)?.name}. Disponibilidad actualizada; revisa las restricciones de tu selección.`)
  }

  function applyLocation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (selectedId === state.order.locationId) { setMessage(`El local actual es ${getLocation(selectedId)?.name}.`); return }
    const result = prepareLocationChange(selectedId, state.order, readOrder())
    if (!result.ok) { setDialog({ locationId: selectedId, issues: [result.message], blocked: true }); return }
    const issues = configurationContext ? evaluateConfiguration(configurationContext.product, configurationContext.configuration, configurationContext.quantity, selectedId).issues
      .filter((issue) => issue.availability).map((issue) => issue.message) : []
    if (issues.length) { setDialog({ locationId: selectedId, issues: [...new Set(issues)], blocked: false }); return }
    commitLocation(selectedId)
  }

  return <><form className="local-selector" onSubmit={applyLocation}>
    <label htmlFor="order-location">Local del pedido</label>
    <div className="catalog-control-row">
      <select id="order-location" value={selectedId} onChange={(event) => { setSelectedId(event.target.value); setMessage('') }}
        aria-describedby="location-help">
        {locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
      </select>
      <AccessibleButton type="submit">Aplicar local</AccessibleButton>
    </div>
    <p id="location-help" className="control-help">Elige un local y pulsa Aplicar local. La disponibilidad es simulada.</p>
    <p role="status" aria-atomic="true" className="local-feedback">{message}</p>
  </form>
    <AccessibleModal open={dialog !== null} title="Cambiar de local" onClose={() => setDialog(null)}>
      {dialog && <>
        <p>{dialog.blocked ? 'Conservamos el local actual para proteger tu pedido.' : `En ${getLocation(dialog.locationId)?.name}, tu selección se verá afectada:`}</p>
        {!dialog.blocked && configurationContext && <p><strong>Producto: {configurationContext.product.name}</strong></p>}
        <ul>{dialog.issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>
        {!dialog.blocked && <p>Conservaremos la configuración. Las opciones incompatibles se marcarán para que puedas corregirlas; no se sustituyen ni se eliminan automáticamente.</p>}
        <div className="modal-actions">
          <AccessibleButton className="button--secondary" onClick={() => setDialog(null)}>Mantener local actual</AccessibleButton>
          {!dialog.blocked && <AccessibleButton onClick={() => commitLocation(dialog.locationId)}>Cambiar de local</AccessibleButton>}
        </div>
      </>}
    </AccessibleModal>
  </>
}
