import type { OrderDraft } from '../../domain/models.ts'
import type { StorageRead } from '../../storage/browserStorage.ts'
import { getLocation } from '../../data/locations.ts'

type LocationChange = { ok: true; order: OrderDraft } | { ok: false; message: string }

// Saved items are never modified here. Cart impact handling belongs to phase 4.
export function prepareLocationChange(locationId: string, current: OrderDraft, stored: StorageRead<OrderDraft>): LocationChange {
  if (!getLocation(locationId)) return { ok: false, message: 'Elige uno de los locales de la lista.' }
  if (current.items.length || (stored.status === 'ok' && stored.value.items.length)) {
    return { ok: false, message: 'Hay un pedido guardado que requiere revisión. Conservamos su local y sus productos.' }
  }
  if (stored.status === 'invalid') {
    return { ok: false, message: 'No pudimos leer el pedido guardado. Conservamos sus datos y el local actual.' }
  }
  if (stored.status === 'unavailable') {
    return { ok: false, message: 'No pudimos acceder al pedido guardado. Conservamos el local actual para no modificar sus datos.' }
  }
  return { ok: true, order: { ...(stored.status === 'ok' ? stored.value : current), locationId } }
}
