import type { AppState, ConfirmationCompleteAction } from '../../state/appState.ts'
import { appReducer } from '../../state/appState.ts'
import { clearStoredOrder, saveLastConfirmation } from '../../storage/browserStorage.ts'
import { canConfirm, createConfirmation, hasCompleteSummary } from './confirmation.ts'
import type { ConfirmationResult } from './confirmation.ts'

interface ConfirmationDependencies { createId: () => string; now: () => string }

export function confirmOrder(state: AppState, expectedAttemptId: string, dependencies: ConfirmationDependencies = {
  createId: () => `BEM-${crypto.randomUUID()}`, now: () => new Date().toISOString(),
}): { state: AppState; result: ConfirmationResult; action?: ConfirmationCompleteAction } {
  if (hasCompleteSummary(state.lastConfirmation) && state.lastConfirmation.paymentAttemptId === expectedAttemptId) {
    return { state, result: { ok: true, receipt: state.lastConfirmation } }
  }
  if (!canConfirm(state) || state.payment.attemptId !== expectedAttemptId) {
    return { state, result: { ok: false, message: 'No puedes confirmar este pedido. Revisa los productos, la entrega y la aprobación del pago simulado.' } }
  }
  const receipt = createConfirmation(state, dependencies.createId(), dependencies.now())
  if (!receipt || receipt.orderId === state.lastConfirmation?.orderId || !saveLastConfirmation(receipt).ok) {
    return { state, result: { ok: false, message: 'No pudimos guardar el comprobante. El pedido no se ha confirmado y conservamos el carrito, la entrega y el pago simulado. Revisa los permisos de almacenamiento e intenta nuevamente.' } }
  }
  // Save first. An unsuccessful receipt write must never clear the user's order.
  const action: ConfirmationCompleteAction = { type: 'confirmation/complete', receipt, cleanupFailed: !clearStoredOrder().ok }
  return { state: appReducer(state, action), action, result: { ok: true, receipt } }
}
