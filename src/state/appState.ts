import type { CartItem, ConfirmationReceipt, DisplayPreferences, OrderDraft, ProductConfiguration } from '../domain/models.ts'
import { addItem, editItem, itemLabel, removeItem, restoreItem } from '../features/cart/cart.ts'
import type { CartToast } from '../features/cart/cart.ts'

export interface AppState {
  order: OrderDraft
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
  | { type: 'cart/add'; item: CartItem }
  | { type: 'cart/edit'; itemId: string; configuration: ProductConfiguration; quantity: number }
  | { type: 'cart/quantity'; itemId: string; quantity: number }
  | { type: 'cart/remove'; itemId: string }
  | { type: 'cart/undo'; toastId: string }
  | { type: 'cart/clear' }
  | { type: 'toast/dismiss'; toastId: string }
  | { type: 'preferences/replace'; value: DisplayPreferences }
  | { type: 'confirmation/replace'; value: ConfirmationReceipt | null }
  | { type: 'storage/notice'; value: string }

export function createInitialState(): AppState {
  return {
    order: { catalogVersion: 1, locationId: 'san-miguel', items: [] },
    preferences: { textSize: 'default', reduceMotion: false, underlineLinks: false },
    lastConfirmation: null, storageNotice: '', recoveryNotice: '', toasts: [], notificationSequence: 0, cartAnnouncement: '',
  }
}

function notify(state: AppState, order: OrderDraft, message: string, removed?: CartToast['removed']): AppState {
  const sequence = state.notificationSequence + 1
  return { ...state, order, recoveryNotice: '', notificationSequence: sequence, cartAnnouncement: `${message}${removed ? ' Deshacer disponible en Avisos del pedido.' : ''}`,
    toasts: [...state.toasts.filter((toast) => toast.removed), { id: `notice-${sequence}`, message, removed }] }
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'order/replace': return { ...state, order: action.value, recoveryNotice: '' }
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
      return order === state.order ? state : notify(state, order, `Cantidad de ${itemLabel(item)} actualizada: ${action.quantity}.`)
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
    case 'cart/clear': return notify({ ...state, toasts: [], recoveryNotice: '' },
      { ...state.order, catalogVersion: 1, items: [] }, 'Pedido limpiado. Se conservaron tus preferencias de visualización y el local actual.')
    case 'toast/dismiss': return { ...state, toasts: state.toasts.filter((toast) => toast.id !== action.toastId) }
    case 'preferences/replace': return { ...state, preferences: action.value }
    case 'confirmation/replace': return { ...state, lastConfirmation: action.value }
    case 'storage/notice': return { ...state, storageNotice: action.value }
  }
}
