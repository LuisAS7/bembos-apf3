import type { ConfirmationContext } from '../confirmation/confirmation.ts'
import { canConfirm } from '../confirmation/confirmation.ts'
import { paymentContextReady } from '../payments/payment.ts'

export const checkoutStages = ['Entrega y contacto', 'Método de pago', 'Revisión']
// UI progress only. Checkout/payment/confirmation keep their existing validation engines.
export function checkoutStep(requested: number, context: ConfirmationContext): number {
  if (!paymentContextReady(context.order, context.checkout)) return 0
  return requested >= 2 ? canConfirm(context) ? 2 : 1 : Math.max(0, requested)
}
