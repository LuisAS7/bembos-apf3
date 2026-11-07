import type { OrderDraft } from '../../domain/models.ts'
import type { StorageRead } from '../../storage/browserStorage.ts'
import { getLocation } from '../../data/locations.ts'
import { CATALOG_VERSION, recoverOrder } from '../cart/cart.ts'

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
    return { ok: false, message: 'No pudimos leer el pedido guardado. Conservamos sus datos y el local actual. Puedes revisarlo y usar Limpiar pedido para reiniciar con confirmación.' }
  }
  if (stored.status === 'unavailable' && !confirmed) {
    return { ok: false, message: 'No pudimos acceder al pedido guardado. Conservamos el local actual para no modificar sus datos.' }
  }
  if (confirmed) {
    const comparable = stored.status === 'ok' && stored.value.catalogVersion === CATALOG_VERSION
      ? recoverOrder(stored, current).order : stored.value
    if (comparable?.items.length && orderContents(comparable) !== orderContents(current)) {
      return { ok: false, message: 'El pedido guardado es diferente del pedido abierto, posiblemente por otra pestaña o por datos recuperados. No lo sobrescribimos al cambiar de local. Recarga para revisarlo o usa Limpiar pedido con confirmación.' }
    }
    return { ok: true, order: { ...current, locationId } }
  }
  return { ok: true, order: { ...(stored.status === 'ok' ? stored.value : current), locationId } }
}
