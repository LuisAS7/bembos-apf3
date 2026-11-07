import type { CheckoutDraft, CompleteConfirmationReceipt, ConfirmationReceipt, OrderDraft } from '../../domain/models.ts'
import type { PaymentSimulation } from '../payments/payment.ts'
import { paymentContextReady } from '../payments/payment.ts'
import { checkoutTotals, pickupSlots } from '../checkout/checkout.ts'
import { getLocation } from '../../data/locations.ts'

export interface ConfirmationContext { order: OrderDraft; checkout: CheckoutDraft; payment: PaymentSimulation; paymentRevision: number }
export type ConfirmationResult = { ok: true; receipt: CompleteConfirmationReceipt } | { ok: false; message: string }

export function hasCompleteSummary(receipt: ConfirmationReceipt | null): receipt is CompleteConfirmationReceipt {
  return Boolean(receipt?.summary && receipt.paymentAttemptId && receipt.items.length && receipt.items.every((item) => item.snapshot))
}
export function canConfirm(context: ConfirmationContext): boolean {
  const { order, checkout, payment, paymentRevision } = context
  return payment.status === 'approved' && payment.method !== null && Boolean(payment.attemptId) &&
    payment.revision === paymentRevision && paymentContextReady(order, checkout) &&
    payment.totalCents === checkoutTotals(order, checkout.deliveryMethod).totalCents
}
export function createConfirmation(context: ConfirmationContext, orderId: string, confirmedAt: string): CompleteConfirmationReceipt | null {
  if (!canConfirm(context) || !/^BEM-[a-zA-Z0-9-]{1,64}$/.test(orderId) || !Number.isFinite(Date.parse(confirmedAt))) return null
  const { order, checkout, payment } = context
  const totals = checkoutTotals(order, checkout.deliveryMethod)
  const location = getLocation(order.locationId)!
  return {
    orderId, confirmedAt, locationId: location.id, deliveryMethod: checkout.deliveryMethod,
    paymentMethod: payment.method!, paymentAttemptId: payment.attemptId!, totalCents: totals.totalCents!,
    summary: { locationName: location.name, subtotalCents: totals.subtotalCents!, deliveryFeeCents: totals.deliveryFeeCents!,
      estimatedMinutes: location.estimatedMinutes,
      pickupSlotLabel: checkout.deliveryMethod === 'pickup' ? pickupSlots(location.id).find((slot) => slot.id === checkout.pickupSlot)!.label : null },
    items: totals.items.map(({ item, product, unitPriceCents, totalCents }) => ({
      productId: item.productId, quantity: item.quantity, lineTotalCents: totalCents!,
      snapshot: { itemId: item.itemId, name: product!.name, source: product!.source.kind, unitPriceCents: unitPriceCents!,
        image: { src: product!.image.src, ...(product!.image.duo ? { duo: true } : {}) },
        variantLabel: product!.variants.find((variant) => variant.id === item.configuration.variantId)?.label ?? null,
        selections: product!.optionGroups.map((group) => ({ label: group.label,
          options: (item.configuration.selections[group.id] ?? []).map((id) => group.options.find((option) => option.id === id)!.label) })) },
    })),
  }
}

// Protect recovery if the session receipt saved successfully but clearing localStorage failed.
export function excludeConfirmedItems(order: OrderDraft, receipt: ConfirmationReceipt | null): OrderDraft {
  if (!hasCompleteSummary(receipt)) return order
  const consumed = new Set(receipt.items.map((item) => item.snapshot.itemId))
  const items = order.items.filter((item) => !consumed.has(item.itemId))
  return items.length === order.items.length ? order : { ...order, items }
}
