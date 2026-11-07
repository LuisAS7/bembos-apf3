import type { ConfirmationReceipt, DisplayPreferences, OrderDraft } from '../domain/models.ts'

export const STORAGE_KEYS = {
  order: 'bembos.apf3.order',
  preferences: 'bembos.apf3.preferences',
  lastConfirmation: 'bembos.apf3.lastConfirmation',
} as const

const SCHEMA_VERSION = 1
type StorageKind = 'localStorage' | 'sessionStorage'
export type StorageRead<T> =
  | { status: 'ok'; value: T }
  | { status: 'missing' | 'invalid' | 'unavailable'; value: null }
export type StorageWrite = { ok: true } | { ok: false }

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0
const money = (value: unknown): value is number => Number.isSafeInteger(value) && (value as number) >= 0
const positive = (value: unknown): value is number => money(value) && value > 0

function isPreferences(value: unknown): value is DisplayPreferences {
  return record(value) && typeof value.textSize === 'string' && ['default', 'large', 'extra-large'].includes(value.textSize) &&
    typeof value.reduceMotion === 'boolean' && typeof value.underlineLinks === 'boolean'
}

function isOrder(value: unknown): value is OrderDraft {
  return record(value) && positive(value.catalogVersion) && text(value.locationId) &&
    Array.isArray(value.items) && value.items.every((item: unknown) => {
      if (!record(item) || !record(item.configuration)) return false
      const config = item.configuration
      return text(item.itemId) && text(item.productId) && positive(item.quantity) &&
        money(item.unitPriceCents) && (config.variantId === null || text(config.variantId)) &&
        record(config.selections) && Object.values(config.selections).every(
          (options) => Array.isArray(options) && options.every(text),
        )
    })
}

function isConfirmation(value: unknown): value is ConfirmationReceipt {
  return record(value) && text(value.orderId) && text(value.confirmedAt) &&
    Number.isFinite(Date.parse(value.confirmedAt)) && text(value.locationId) &&
    typeof value.deliveryMethod === 'string' && ['delivery', 'pickup'].includes(value.deliveryMethod) &&
    typeof value.paymentMethod === 'string' && ['cash', 'card', 'yape'].includes(value.paymentMethod) && money(value.totalCents) &&
    Array.isArray(value.items) && value.items.length > 0 && value.items.every((item: unknown) =>
      record(item) && text(item.productId) && positive(item.quantity) && money(item.lineTotalCents),
    )
}

function read<T>(kind: StorageKind, key: string, valid: (value: unknown) => value is T): StorageRead<T> {
  let raw: string | null
  try { raw = window[kind].getItem(key) } catch { return { status: 'unavailable', value: null } }
  if (raw === null) return { status: 'missing', value: null }
  try {
    const envelope: unknown = JSON.parse(raw)
    if (!record(envelope) || envelope.schemaVersion !== SCHEMA_VERSION || !valid(envelope.data)) {
      return { status: 'invalid', value: null }
    }
    return { status: 'ok', value: envelope.data }
  } catch { return { status: 'invalid', value: null } }
}

function write(kind: StorageKind, key: string, data: unknown): StorageWrite {
  try {
    window[kind].setItem(key, JSON.stringify({ schemaVersion: SCHEMA_VERSION, data }))
    return { ok: true }
  } catch { return { ok: false } }
}

// Explicit allowlists strip extra runtime properties before serialization.
function safeOrder(value: OrderDraft): OrderDraft {
  return {
    catalogVersion: value.catalogVersion, locationId: value.locationId,
    items: value.items.map((item) => ({
      itemId: item.itemId, productId: item.productId, quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      configuration: {
        variantId: item.configuration.variantId,
        selections: Object.fromEntries(Object.entries(item.configuration.selections).map(
          ([group, options]) => [group, [...options]],
        )),
      },
    })),
  }
}

function safePreferences(value: DisplayPreferences): DisplayPreferences {
  return { textSize: value.textSize, reduceMotion: value.reduceMotion, underlineLinks: value.underlineLinks }
}

function safeConfirmation(value: ConfirmationReceipt): ConfirmationReceipt {
  return {
    orderId: value.orderId, confirmedAt: value.confirmedAt, locationId: value.locationId,
    deliveryMethod: value.deliveryMethod, paymentMethod: value.paymentMethod, totalCents: value.totalCents,
    items: value.items.map((item) => ({
      productId: item.productId, quantity: item.quantity, lineTotalCents: item.lineTotalCents,
    })),
  }
}

export function readOrder(): StorageRead<OrderDraft> {
  const result = read('localStorage', STORAGE_KEYS.order, isOrder)
  return result.status === 'ok' ? { status: 'ok', value: safeOrder(result.value) } : result
}
export function readPreferences(): StorageRead<DisplayPreferences> {
  const result = read('localStorage', STORAGE_KEYS.preferences, isPreferences)
  return result.status === 'ok' ? { status: 'ok', value: safePreferences(result.value) } : result
}
export function readLastConfirmation(): StorageRead<ConfirmationReceipt> {
  const result = read('sessionStorage', STORAGE_KEYS.lastConfirmation, isConfirmation)
  return result.status === 'ok' ? { status: 'ok', value: safeConfirmation(result.value) } : result
}
export function saveOrder(value: OrderDraft): StorageWrite {
  return isOrder(value) ? write('localStorage', STORAGE_KEYS.order, safeOrder(value)) : { ok: false }
}
export function savePreferences(value: DisplayPreferences): StorageWrite {
  return isPreferences(value) ? write('localStorage', STORAGE_KEYS.preferences, safePreferences(value)) : { ok: false }
}
export function saveLastConfirmation(value: ConfirmationReceipt | null): StorageWrite {
  if (value === null) {
    try { window.sessionStorage.removeItem(STORAGE_KEYS.lastConfirmation); return { ok: true } }
    catch { return { ok: false } }
  }
  return isConfirmation(value) ? write('sessionStorage', STORAGE_KEYS.lastConfirmation, safeConfirmation(value)) : { ok: false }
}
