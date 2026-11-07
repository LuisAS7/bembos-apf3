import type { OrderDraft } from '../../domain/models.ts'
import type { StorageRead } from '../../storage/browserStorage.ts'
import { getLocation } from '../../data/locations.ts'
import { CATALOG_VERSION, recoverOrder } from '../cart/cart.ts'
import { inspectOrder } from '../cart/cart.ts'
import { evaluateConfiguration } from '../customization/configuration.ts'
import type { Product, ProductConfiguration } from '../../domain/models.ts'

export interface LocationPlan { locationId: string; issues: string[]; blocked: boolean; order?: OrderDraft }
export function planLocationChange(locationId: string, current: OrderDraft, stored: StorageRead<OrderDraft>, preview?: { product: Product; configuration: ProductConfiguration; quantity: number }): LocationPlan {
  const result = prepareLocationChange(locationId, current, stored, true)
  if (!result.ok) return { locationId, issues: [result.message], blocked: true }
  const issues = inspectOrder(result.order).items.flatMap((entry, index) => entry.issues.length
    ? [`Ítem ${index + 1}: ${entry.product?.name ?? entry.item.productId}. ${entry.issues.join(' ')}`] : [])
  if (preview) {
    const affected = evaluateConfiguration(preview.product, preview.configuration, preview.quantity, locationId).issues.filter((issue) => issue.availability)
    if (affected.length) issues.push(`${preview.product.name}: ${[...new Set(affected.map((issue) => issue.message))].join(' ')}`)
  }
  return { locationId, issues, blocked: false, order: result.order }
}

type LocationChange = { ok: true; order: OrderDraft } | { ok: false; message: string }

function orderContents(order: OrderDraft): string {
  return JSON.stringify({ locationId: order.locationId, items: order.items.map((item) => ({
    itemId: item.itemId, productId: item.productId, configuration: item.configuration, quantity: item.quantity,
  })) })
}

export function prepareLocationChange(locationId: string, current: OrderDraft, stored: StorageRead<OrderDraft>, confirmed = false): LocationChange {
  if (!getLocation(locationId)) return { ok: false, message: 'Elige uno de los locales de la lista.' }
  if (!confirmed && (current.items.length || (stored.status === 'ok' && stored.value.items.length))) {
    return { ok: false, message: 'Hay un pedido guardado que requiere revisión. Conservamos su local y sus productos.' }
  }
  if (stored.status === 'invalid') {
    return { ok: false, message: 'No pudimos leer el pedido guardado. Conservamos sus datos y el local actual. Puedes seguir usando el pedido abierto.' }
  }
  if (stored.status === 'unavailable' && !confirmed) {
    return { ok: false, message: 'No pudimos acceder al pedido guardado. Conservamos el local actual para no modificar sus datos.' }
  }
  if (confirmed) {
    const comparable = stored.status === 'ok' && stored.value.catalogVersion === CATALOG_VERSION
      ? recoverOrder(stored, current).order : stored.value
    if (comparable?.items.length && orderContents(comparable) !== orderContents(current)) {
      return { ok: false, message: 'El pedido guardado es diferente del pedido abierto, posiblemente por otra pestaña o por datos recuperados. No lo sobrescribimos al cambiar de local. Recarga para revisar el pedido guardado antes de cambiar de local.' }
    }
    return { ok: true, order: { ...current, locationId } }
  }
  return { ok: true, order: { ...(stored.status === 'ok' ? stored.value : current), locationId } }
}
