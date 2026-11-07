import type { CheckoutDraft, DeliveryMethod, OrderDraft } from '../../domain/models.ts'
import { getLocation } from '../../data/locations.ts'
import { inspectOrder } from '../cart/cart.ts'

export function emptyCheckout(): CheckoutDraft {
  return { deliveryMethod: 'delivery', fullName: '', phone: '', address: '', reference: '', pickupSlot: 'asap' }
}

export function pickupSlots(locationId: string) {
  const location = getLocation(locationId)
  return location ? [
    { id: 'asap', label: `Lo antes posible (aprox. ${location.estimatedMinutes} minutos)` },
    { id: 'in-60', label: 'En 60 minutos' },
    { id: 'in-90', label: 'En 90 minutos' },
  ] : []
}

export interface CheckoutIssue { field: keyof CheckoutDraft; message: string }

// Order matches the form's DOM order; hidden delivery fields never block pickup.
export function validateCheckout(draft: CheckoutDraft, locationId: string): CheckoutIssue[] {
  const issues: CheckoutIssue[] = []
  const location = getLocation(locationId)
  if (!location || !location.deliveryMethods.some((method) => method === draft.deliveryMethod)) {
    issues.push({ field: 'deliveryMethod', message: 'Elige un método de entrega disponible en el local.' })
  }
  if (!draft.fullName.trim() || !/\p{L}/u.test(draft.fullName) || draft.fullName.length > 100) {
    issues.push({ field: 'fullName', message: 'Escribe tu nombre completo, con letras y hasta 100 caracteres.' })
  }
  const digits = draft.phone.replace(/\D/g, '')
  if (!/^\+?[\d\s()-]+$/.test(draft.phone.trim()) || digits.length < 7 || digits.length > 15 || draft.phone.length > 40) {
    issues.push({ field: 'phone', message: 'Escribe un teléfono de 7 a 15 dígitos. Puedes usar + al inicio, espacios, guiones o paréntesis.' })
  }
  if (draft.deliveryMethod === 'delivery') {
    if (draft.address.trim().length < 5 || draft.address.length > 180) issues.push({ field: 'address', message: 'Escribe una dirección de 5 a 180 caracteres, con calle, número y distrito.' })
    if (draft.reference.length > 200) issues.push({ field: 'reference', message: 'La referencia es opcional y admite hasta 200 caracteres.' })
  } else if (draft.deliveryMethod === 'pickup' && !pickupSlots(locationId).some((slot) => slot.id === draft.pickupSlot)) {
    issues.push({ field: 'pickupSlot', message: 'Elige uno de los horarios de recojo de la lista.' })
  }
  return issues
}

export function checkoutTotals(order: OrderDraft, method: DeliveryMethod) {
  const checked = inspectOrder(order)
  const location = getLocation(order.locationId)
  const deliveryFeeCents = location && location.deliveryMethods.some((entry) => entry === method)
    ? method === 'pickup' ? 0 : location.deliveryFeeCents : null
  const feeValid = deliveryFeeCents !== null && Number.isSafeInteger(deliveryFeeCents) && deliveryFeeCents >= 0
  const total = checked.totalCents !== null && feeValid ? checked.totalCents + deliveryFeeCents! : null
  const totalCents = total !== null && Number.isSafeInteger(total) ? total : null
  return { ...checked, subtotalCents: checked.totalCents, deliveryFeeCents: feeValid ? deliveryFeeCents : null,
    totalCents, canContinue: checked.canContinue && totalCents !== null }
}
