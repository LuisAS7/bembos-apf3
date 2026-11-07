import type { AppState } from '../../state/appState.ts'
import type { CartToast } from '../../features/cart/cart.ts'

export interface NotificationEntry extends CartToast { kind?: 'success' | 'info' | 'error' }
export function notificationEntries(state: Pick<AppState, 'toasts' | 'storageNotice' | 'recoveryNotice'>): NotificationEntry[] {
  return [
    ...state.toasts,
    ...(state.recoveryNotice ? [{ id: 'app-recovery', message: state.recoveryNotice, kind: 'info' as const }] : []),
    ...(state.storageNotice ? [{ id: 'app-storage', message: state.storageNotice, kind: 'error' as const }] : []),
  ]
}
export function notificationPlan(previous: Map<string, string>, entries: NotificationEntry[]) {
  const next = new Map(entries.map((entry) => [entry.id, JSON.stringify([entry.message, Boolean(entry.removed), entry.kind])]))
  return { next, remove: [...previous.keys()].filter((id) => !next.has(id)),
    upsert: entries.filter((entry) => previous.get(entry.id) !== next.get(entry.id)) }
}
export function notificationDuration(entry: NotificationEntry): number { return entry.removed ? Infinity : 6000 }
