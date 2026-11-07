import type { CartItem, OrderDraft, ProductConfiguration } from '../../domain/models.ts'
import { getConfigurableProduct } from '../../data/customizations.ts'
import { getLocation } from '../../data/locations.ts'
import type { StorageRead } from '../../storage/browserStorage.ts'
import { evaluateConfiguration, quoteConfiguration } from '../customization/configuration.ts'

export const CATALOG_VERSION = 1
export interface RemovedItem { item: CartItem; index: number; beforeIds: string[]; afterIds: string[] }
export interface CartToast { id: string; message: string; removed?: RemovedItem }

export function cloneConfiguration(configuration: ProductConfiguration): ProductConfiguration {
  return { variantId: configuration.variantId, selections: Object.fromEntries(
    Object.entries(configuration.selections).map(([group, ids]) => [group, [...ids]]),
  ) }
}

export function inspectItem(item: CartItem, locationId: string) {
  const product = getConfigurableProduct(item.productId)
  if (!product) return { product, issues: ['El producto ya no existe en el catálogo. Elimínalo o elige otro desde el menú.'], unitPriceCents: null, totalCents: null }
  const validation = evaluateConfiguration(product, item.configuration, item.quantity, locationId)
  const quote = quoteConfiguration(product, item.configuration, item.quantity)
  return { product, issues: [...new Set(validation.issues.map((issue) => issue.message))],
    unitPriceCents: quote.unitPriceCents, totalCents: quote.totalCents }
}

export function inspectOrder(order: OrderDraft) {
  const items = order.items.map((item) => ({ item, ...inspectItem(item, order.locationId) }))
  const sum = items.reduce((total, entry) => total + (entry.totalCents ?? 0), 0)
  const totalCents = items.every((entry) => entry.totalCents !== null) && Number.isSafeInteger(sum) ? sum : null
  return { items, totalCents, canContinue: items.length > 0 && items.every((entry) => !entry.issues.length) && totalCents !== null }
}

export function addItem(order: OrderDraft, item: CartItem): OrderDraft {
  if (!item.itemId.trim() || order.items.some((entry) => entry.itemId === item.itemId)) return order
  const checked = inspectItem(item, order.locationId)
  if (checked.issues.length || checked.unitPriceCents === null) return order
  return { ...order, items: [...order.items, { ...item, configuration: cloneConfiguration(item.configuration), unitPriceCents: checked.unitPriceCents }] }
}

export function editItem(order: OrderDraft, itemId: string, configuration: ProductConfiguration, quantity: number): OrderDraft {
  const original = order.items.find((item) => item.itemId === itemId)
  if (!original) return order
  const updated = { ...original, configuration, quantity }
  const checked = inspectItem(updated, order.locationId)
  if (checked.issues.length || checked.unitPriceCents === null) return order
  return { ...order, items: order.items.map((item) => item.itemId === itemId
    ? { ...updated, configuration: cloneConfiguration(configuration), unitPriceCents: checked.unitPriceCents! } : item) }
}

export function removeItem(order: OrderDraft, itemId: string): { order: OrderDraft; removed: RemovedItem | null } {
  const index = order.items.findIndex((item) => item.itemId === itemId)
  if (index < 0) return { order, removed: null }
  const item = order.items[index]
  return { order: { ...order, items: order.items.filter((entry) => entry.itemId !== itemId) }, removed: {
    item: { ...item, configuration: cloneConfiguration(item.configuration) }, index,
    beforeIds: order.items.slice(0, index).map((entry) => entry.itemId),
    afterIds: order.items.slice(index + 1).map((entry) => entry.itemId),
  } }
}

export function restoreItem(order: OrderDraft, removed: RemovedItem): OrderDraft {
  if (order.items.some((item) => item.itemId === removed.item.itemId)) return order
  // Prefer surviving neighbours, then the original index. No automatic substitutions.
  const nextId = removed.afterIds.find((id) => order.items.some((item) => item.itemId === id))
  const previousId = [...removed.beforeIds].reverse().find((id) => order.items.some((item) => item.itemId === id))
  const index = nextId ? order.items.findIndex((item) => item.itemId === nextId)
    : previousId ? order.items.findIndex((item) => item.itemId === previousId) + 1 : Math.min(removed.index, order.items.length)
  const checked = inspectItem(removed.item, order.locationId)
  const items = [...order.items]
  items.splice(index, 0, { ...removed.item, configuration: cloneConfiguration(removed.item.configuration), unitPriceCents: checked.unitPriceCents ?? 0 })
  return { ...order, items }
}

export function recoverOrder(saved: StorageRead<OrderDraft>, fallback: OrderDraft): { order: OrderDraft; message: string } {
  if (saved.status === 'missing') return { order: fallback, message: '' }
  if (saved.status !== 'ok') return { order: fallback, message: saved.status === 'unavailable'
    ? 'No pudimos acceder al pedido guardado. Puedes usar un pedido temporal mientras esta página siga abierta.'
    : 'No pudimos recuperar el pedido: datos dañados o versión incompatible. No lo sobrescribimos al abrir la página; los cambios explícitos o Limpiar pedido reemplazarán esos datos.' }
  if (saved.value.catalogVersion !== CATALOG_VERSION) return { order: fallback,
    message: 'La versión del catálogo guardado es incompatible. Conservamos la copia guardada hasta que modifiques o limpies el pedido.' }
  let repairedIds = false
  const used = new Set<string>()
  const reserved = new Set(saved.value.items.map((item) => item.itemId))
  const items = saved.value.items.map((item, index) => {
    let itemId = item.itemId
    if (used.has(itemId)) {
      repairedIds = true
      itemId = `${item.itemId}-recuperado-${index}`
      while (reserved.has(itemId) || used.has(itemId)) itemId += '-r'
    }
    used.add(itemId)
    const checked = inspectItem(item, saved.value.locationId)
    return { ...item, itemId, configuration: cloneConfiguration(item.configuration), unitPriceCents: checked.unitPriceCents ?? 0 }
  })
  // Retain unknown locations so every item is flagged; the user explicitly chooses a new one.
  const order = { ...saved.value, items }
  const incompatible = !getLocation(order.locationId) || inspectOrder(order).items.some((entry) => entry.issues.length)
  return { order, message: [items.length ? 'Restauramos tu pedido anterior.' : '',
    incompatible ? 'Hay elementos que requieren actualización. Revisa tu pedido antes de continuar.' : '',
    repairedIds ? 'Reparamos identificadores repetidos sin combinar ni eliminar productos.' : '',
  ].filter(Boolean).join(' ') }
}

export function itemLabel(item: CartItem): string {
  const product = getConfigurableProduct(item.productId)
  const variant = product?.variants.find((entry) => entry.id === item.configuration.variantId)
  if (variant && product && variant.label.toLocaleLowerCase('es').startsWith(product.name.toLocaleLowerCase('es'))) return variant.label
  return `${product?.name ?? 'Producto fuera del catálogo'}${variant ? ` ${variant.label.toLocaleLowerCase('es')}` : ''}`
}
