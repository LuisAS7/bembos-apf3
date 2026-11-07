import { useState } from 'react'
import type { FormEvent } from 'react'
import { AccessibleButton } from '../../components/ui/AccessibleButton.tsx'
import { AccessibleModal } from '../../components/ui/AccessibleModal.tsx'
import type { OrderDraft, Product, ProductConfiguration } from '../../domain/models.ts'
import { evaluateConfiguration } from '../customization/configuration.ts'
import { getLocation, locations } from '../../data/locations.ts'
import { useAppState } from '../../hooks/useAppState.ts'
import { readOrder } from '../../storage/browserStorage.ts'
import { prepareLocationChange } from './prepareLocationChange.ts'
import { inspectOrder } from '../cart/cart.ts'

interface ConfigurationContext { product: Product; configuration: ProductConfiguration; quantity: number }
interface ChangeDialog { locationId: string; issues: string[]; blocked: boolean; order?: OrderDraft }

export function LocalSelector({ configurationContext }: { configurationContext?: ConfigurationContext } = {}) {
  const { state, dispatch } = useAppState()
  const [selectedId, setSelectedId] = useState(state.order.locationId)
  const [message, setMessage] = useState('')
  const [dialog, setDialog] = useState<ChangeDialog | null>(null)

  function planChange(locationId: string): ChangeDialog {
    const result = prepareLocationChange(locationId, state.order, readOrder(), true)
    if (!result.ok) return { locationId, issues: [result.message], blocked: true }
    const issues = inspectOrder(result.order).items.flatMap((entry, index) => entry.issues.length
      ? [`Ítem ${index + 1}: ${entry.product?.name ?? entry.item.productId}. ${entry.issues.join(' ')}`] : [])
    if (configurationContext) {
      const draftIssues = evaluateConfiguration(configurationContext.product, configurationContext.configuration, configurationContext.quantity, locationId).issues
        .filter((issue) => issue.availability).map((issue) => issue.message)
      if (draftIssues.length) issues.push(`Borrador de ${configurationContext.product.name}: ${[...new Set(draftIssues)].join(' ')}`)
    }
    return { locationId, issues, blocked: false, order: result.order }
  }

  function commitLocation(plan: ChangeDialog) {
    // Re-read before applying: another tab may have saved an order meanwhile.
    const fresh = planChange(plan.locationId)
    if (fresh.blocked || JSON.stringify(fresh) !== JSON.stringify(plan)) { setDialog(fresh); return }
    setDialog(null)
    dispatch({ type: 'order/replace', value: fresh.order! })
    setMessage(`Local seleccionado: ${getLocation(plan.locationId)?.name}. Disponibilidad actualizada; revisa las restricciones de tu selección.`)
  }

  function applyLocation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (selectedId === state.order.locationId) { setMessage(`El local actual es ${getLocation(selectedId)?.name}.`); return }
    const plan = planChange(selectedId)
    if (plan.blocked || plan.issues.length) { setDialog(plan); return }
    commitLocation(plan)
  }

  return <><form className="local-selector" onSubmit={applyLocation}>
    <label htmlFor="order-location">Local del pedido</label>
    <div className="catalog-control-row">
      <select id="order-location" value={selectedId} onChange={(event) => { setSelectedId(event.target.value); setMessage('') }}
        aria-describedby="location-help">
        {!getLocation(selectedId) && <option value={selectedId} disabled>Local guardado no reconocido</option>}
        {locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
      </select>
      <AccessibleButton type="submit">Aplicar local</AccessibleButton>
    </div>
    <p id="location-help" className="control-help">Elige un local y pulsa Aplicar local. La disponibilidad es simulada.</p>
    <p role="status" aria-atomic="true" className="local-feedback">{message}</p>
  </form>
    <AccessibleModal key={dialog ? `${dialog.locationId}:${dialog.issues.join('|')}` : 'closed'} open={dialog !== null} title="Cambiar de local" onClose={() => setDialog(null)}>
      {dialog && <>
        <p>{dialog.blocked ? 'Conservamos el local actual para proteger tu pedido.' : `En ${getLocation(dialog.locationId)?.name}, tu selección se verá afectada:`}</p>
        {!dialog.blocked && configurationContext && <p><strong>Producto: {configurationContext.product.name}</strong></p>}
        <ul>{dialog.issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>
        {!dialog.blocked && <p>Conservaremos los productos y sus configuraciones. Los ítems incompatibles mostrarán «Requiere actualización» e impedirán continuar al pago hasta editarlos o eliminarlos.</p>}
        <div className="modal-actions">
          <AccessibleButton className="button--secondary" onClick={() => setDialog(null)}>Mantener local actual</AccessibleButton>
          {!dialog.blocked && <AccessibleButton onClick={() => commitLocation(dialog)}>Cambiar de local</AccessibleButton>}
        </div>
      </>}
    </AccessibleModal>
  </>
}
