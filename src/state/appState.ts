import type { CartItem, CheckoutDraft, ConfirmationReceipt, DisplayPreferences, OrderDraft, ProductConfiguration } from '../domain/models.ts'
import { emptyCheckout } from '../features/checkout/checkout.ts'
import { addItem, editItem, itemLabel, removeItem, restoreItem } from '../features/cart/cart.ts'
import type { CartToast } from '../features/cart/cart.ts'
import { emptyPayment, paymentContextReady } from '../features/payments/payment.ts'
import type { PaymentSimulation } from '../features/payments/payment.ts'
import type { PaymentMethod } from '../domain/models.ts'
import { checkoutTotals } from '../features/checkout/checkout.ts'
import { canConfirm } from '../features/confirmation/confirmation.ts'
import type { CompleteConfirmationReceipt } from '../domain/models.ts'

export interface AppState {
  order: OrderDraft
  checkout: CheckoutDraft
  payment: PaymentSimulation
  paymentRevision: number
  configurationPreview: { productId: string; configuration: ProductConfiguration; quantity: number } | null
  preferences: DisplayPreferences
  lastConfirmation: ConfirmationReceipt | null
  storageNotice: string
  recoveryNotice: string
  toasts: CartToast[]
  notificationSequence: number
  cartAnnouncement: string
}
export type AppAction =
  | { type: 'order/replace'; value: OrderDraft }
  | { type: 'checkout/replace'; value: CheckoutDraft }
  | { type: 'configuration/preview'; value: AppState['configurationPreview'] }
  | { type: 'toast/notify'; message: string; kind?: CartToast['kind'] }
  | { type: 'payment/start'; attemptId: string; method: PaymentMethod; totalCents: number; revision: number }
  | { type: 'payment/finish'; attemptId: string; revision: number; outcome: 'approved' | 'error' }
  | { type: 'payment/reset' }
  | { type: 'payment/cancel' }
  | { type: 'cart/add'; item: CartItem }
  | { type: 'cart/edit'; itemId: string; configuration: ProductConfiguration; quantity: number }
  | { type: 'cart/quantity'; itemId: string; quantity: number }
  | { type: 'cart/remove'; itemId: string }
  | { type: 'cart/undo'; toastId: string }
  | { type: 'toast/dismiss'; toastId: string }
  | { type: 'preferences/replace'; value: DisplayPreferences }
  | { type: 'confirmation/replace'; value: ConfirmationReceipt | null }
  | { type: 'storage/notice'; value: string }

// Only the provider's storage transaction commits this internal reducer action.
export interface ConfirmationCompleteAction { type: 'confirmation/complete'; receipt: CompleteConfirmationReceipt; cleanupFailed: boolean }
type ReducerAction = AppAction | ConfirmationCompleteAction

export function createInitialState(): AppState {
  return {
    order: { catalogVersion: 1, locationId: 'san-miguel', items: [] },
    checkout: emptyCheckout(),
    payment: emptyPayment(), paymentRevision: 0,
    configurationPreview: null,
    preferences: { textSize: 'default', reduceMotion: false, underlineLinks: false },
    lastConfirmation: null, storageNotice: '', recoveryNotice: '', toasts: [], notificationSequence: 0, cartAnnouncement: '',
  }
}

function notify(state: AppState, order: OrderDraft, message: string, removed?: CartToast['removed'], kind: CartToast['kind'] = 'success'): AppState {
  const sequence = state.notificationSequence + 1
  return { ...state, order, recoveryNotice: '', notificationSequence: sequence, cartAnnouncement: `${message}${removed ? ' Deshacer disponible en Avisos del pedido.' : ''}`,
    toasts: [...state.toasts.filter((toast) => toast.removed), { id: `notice-${sequence}`, message, removed, kind }] }
}

function reduceAppState(state: AppState, action: ReducerAction): AppState {
  switch (action.type) {
    case 'configuration/preview': return { ...state, configurationPreview: action.value }
    case 'toast/notify': return notify(state, state.order, action.message, undefined, action.kind)
    case 'confirmation/complete': {
      if (!canConfirm(state) || action.receipt.paymentAttemptId !== state.payment.attemptId || action.receipt.totalCents !== state.payment.totalCents) return state
      const completed = { ...state, order: { ...state.order, items: [] }, checkout: emptyCheckout(), payment: emptyPayment(),
        lastConfirmation: action.receipt, toasts: [], recoveryNotice: '', cartAnnouncement: '',
        storageNotice: action.cleanupFailed ? 'Pedido confirmado y comprobante guardado. No pudimos borrar la copia anterior del carrito. No restauraremos esos ítems mientras este comprobante esté disponible en esta sesión.' : '' }
      return notify(completed, completed.order, 'Pedido confirmado.')
    }
    case 'payment/start': {
      if (['processing', 'approved'].includes(state.payment.status) || !action.attemptId.trim() ||
        !['cash', 'card', 'yape'].includes(action.method) || action.revision !== state.paymentRevision ||
        !paymentContextReady(state.order, state.checkout) || checkoutTotals(state.order, state.checkout.deliveryMethod).totalCents !== action.totalCents) return state
      return { ...state, payment: { status: 'processing', method: action.method, totalCents: action.totalCents, attemptId: action.attemptId, revision: action.revision } }
    }
    case 'payment/finish': {
      if (state.payment.status !== 'processing' || action.attemptId !== state.payment.attemptId || action.revision !== state.paymentRevision) return state
      if (!paymentContextReady(state.order, state.checkout) || checkoutTotals(state.order, state.checkout.deliveryMethod).totalCents !== state.payment.totalCents) {
        return { ...state, payment: { ...emptyPayment(), status: 'invalidated' } }
      }
      return notify({ ...state, payment: { ...state.payment, status: action.outcome } }, state.order, action.outcome === 'approved' ? 'Pago aprobado.' : 'Pago rechazado. Revisa los datos de prueba y vuelve a intentar.', undefined, action.outcome === 'approved' ? 'success' : 'error')
    }
    case 'payment/reset': return { ...state, payment: emptyPayment() }
    case 'payment/cancel': return state.payment.status === 'processing' ? { ...state, payment: { ...emptyPayment(), status: 'invalidated' } } : state
    case 'order/replace': return { ...state, order: action.value, recoveryNotice: '', checkout: action.value.locationId === state.order.locationId
      ? state.checkout : { ...state.checkout, pickupSlot: 'asap' } }
    case 'checkout/replace': return { ...state, checkout: { ...action.value } }
    case 'cart/add': {
      const order = addItem(state.order, action.item)
      return order === state.order ? state : notify(state, order, 'Producto agregado al pedido.')
    }
    case 'cart/edit': {
      const order = editItem(state.order, action.itemId, action.configuration, action.quantity)
      return order === state.order ? state : notify(state, order, 'Configuración actualizada.')
    }
    case 'cart/quantity': {
      const item = state.order.items.find((entry) => entry.itemId === action.itemId)
      if (!item) return state
      const order = editItem(state.order, action.itemId, item.configuration, action.quantity)
      return order === state.order ? state : { ...state, order }
    }
    case 'cart/remove': {
      const { order, removed } = removeItem(state.order, action.itemId)
      return removed ? notify(state, order, `${itemLabel(removed.item)} eliminada del pedido.`, removed) : state
    }
    case 'cart/undo': {
      const toast = state.toasts.find((entry) => entry.id === action.toastId)
      if (!toast?.removed) return state
      const order = restoreItem(state.order, toast.removed)
      return { ...state, order, notificationSequence: state.notificationSequence + 1,
        cartAnnouncement: `${itemLabel(toast.removed.item)} restaurada en el pedido. Revisa su disponibilidad en el local actual.`,
        toasts: state.toasts.map((entry) => entry.id === action.toastId
        ? { id: entry.id, message: `${itemLabel(toast.removed!.item)} restaurada en el pedido. Revisa su disponibilidad en el local actual.` } : entry) }
    }
    case 'toast/dismiss': return { ...state, toasts: state.toasts.filter((toast) => toast.id !== action.toastId) }
    case 'preferences/replace': return { ...state, preferences: action.value }
    case 'confirmation/replace': return { ...state, lastConfirmation: action.value }
    case 'storage/notice': return { ...state, storageNotice: action.value }
  }
}

// Every order/checkout mutation cancels an in-flight simulation or its approval.
// A revision prevents late callbacks from approving even a change later undone.
export function appReducer(state: AppState, action: ReducerAction): AppState {
  const next = reduceAppState(state, action)
  if (next.order === state.order && next.checkout === state.checkout) return next
  const invalidated = action.type !== 'confirmation/complete' && ['processing', 'approved', 'invalidated'].includes(state.payment.status)
  return { ...next, paymentRevision: state.paymentRevision + 1,
    payment: { ...emptyPayment(), status: invalidated ? 'invalidated' : 'idle' } }
}
