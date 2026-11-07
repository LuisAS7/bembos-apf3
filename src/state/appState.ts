import type { ConfirmationReceipt, DisplayPreferences, OrderDraft } from '../domain/models.ts'

export interface AppState {
  order: OrderDraft
  preferences: DisplayPreferences
  lastConfirmation: ConfirmationReceipt | null
  storageNotice: string
}
export type AppAction =
  | { type: 'order/replace'; value: OrderDraft }
  | { type: 'preferences/replace'; value: DisplayPreferences }
  | { type: 'confirmation/replace'; value: ConfirmationReceipt | null }
  | { type: 'storage/notice'; value: string }

export function createInitialState(): AppState {
  return {
    order: { catalogVersion: 1, locationId: 'san-miguel', items: [] },
    preferences: { textSize: 'default', reduceMotion: false, underlineLinks: false },
    lastConfirmation: null, storageNotice: '',
  }
}

// Infrastructure only; no add/edit/remove, pricing or checkout rules yet.
export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'order/replace': return { ...state, order: action.value }
    case 'preferences/replace': return { ...state, preferences: action.value }
    case 'confirmation/replace': return { ...state, lastConfirmation: action.value }
    case 'storage/notice': return { ...state, storageNotice: action.value }
  }
}
