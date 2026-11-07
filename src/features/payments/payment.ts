import type { CheckoutDraft, OrderDraft, PaymentMethod } from '../../domain/models.ts'
import { checkoutTotals, validateCheckout } from '../checkout/checkout.ts'

export interface PaymentDraft {
  method: PaymentMethod
  needsChange: boolean
  tendered: string
  holder: string
  number: string
  expiry: string
  cvv: string
  yapeCode: string
}
export interface YapeChallenge { operationId: string; code: string }
export interface PaymentIssue { field: 'context' | keyof PaymentDraft; message: string }
// Only this sanitized metadata may enter shared state. No card details/codes.
export interface PaymentSimulation {
  status: 'idle' | 'processing' | 'error' | 'approved' | 'invalidated'
  method: PaymentMethod | null
  totalCents: number | null
  attemptId: string | null
  revision: number | null
}
export function emptyPayment(): PaymentSimulation {
  return { status: 'idle', method: null, totalCents: null, attemptId: null, revision: null }
}
export function emptyPaymentDraft(method: PaymentMethod = 'cash'): PaymentDraft {
  return { method, needsChange: false, tendered: '', holder: '', number: '', expiry: '', cvv: '', yapeCode: '' }
}
export function decimalCents(value: string): number | null {
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(value.trim())) return null
  const [whole, fraction = ''] = value.trim().split(/[.,]/)
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
  return Number.isSafeInteger(cents) && cents >= 0 ? cents : null
}
export function cardBrand(value: string): 'Visa' | 'Mastercard' | null {
  const digits = value.replace(/[ -]/g, '')
  if (!/^\d+$/.test(digits)) return null
  if (digits.startsWith('4')) return 'Visa'
  if (/^5[1-5]/.test(digits) || (digits.length >= 4 && Number(digits.slice(0, 4)) >= 2221 && Number(digits.slice(0, 4)) <= 2720)) return 'Mastercard'
  return null
}
export function luhn(digits: string): boolean {
  if (!/^\d{2,}$/.test(digits) || /^0+$/.test(digits)) return false
  let sum = 0
  for (let index = digits.length - 1, double = false; index >= 0; index--, double = !double) {
    let digit = Number(digits[index]) * (double ? 2 : 1)
    if (digit > 9) digit -= 9
    sum += digit
  }
  return sum % 10 === 0
}
export function demoQrValue(operationId: string): string {
  if (!/^DEMO-[a-zA-Z0-9-]{1,64}$/.test(operationId)) throw new Error('Identificador de demostración inválido.')
  return `APF3-DEMO-YAPE:${operationId}`
}
export function paymentContextReady(order: OrderDraft, checkout: CheckoutDraft): boolean {
  return checkoutTotals(order, checkout.deliveryMethod).canContinue && validateCheckout(checkout, order.locationId).length === 0
}
export function validatePayment(order: OrderDraft, checkout: CheckoutDraft, draft: PaymentDraft, challenge: YapeChallenge | null, now = new Date()): PaymentIssue[] {
  const issues: PaymentIssue[] = []
  const total = checkoutTotals(order, checkout.deliveryMethod).totalCents
  if (!paymentContextReady(order, checkout)) issues.push({ field: 'context', message: 'Revisa el pedido y los datos de entrega antes de simular el pago.' })
  if (draft.method === 'cash') {
    const tendered = decimalCents(draft.tendered)
    if (draft.needsChange && (tendered === null || total === null || tendered <= total)) {
      issues.push({ field: 'tendered', message: 'Indica un monto mayor al total, sin separadores de miles y con hasta dos decimales.' })
    }
  } else if (draft.method === 'card') {
    if (!draft.holder.trim() || !/\p{L}/u.test(draft.holder) || draft.holder.length > 100) issues.push({ field: 'holder', message: 'Escribe el nombre del titular de prueba, hasta 100 caracteres.' })
    const digits = draft.number.replace(/[ -]/g, '')
    const brand = cardBrand(draft.number)
    if (!brand || !/^\d+$/.test(digits) || !(brand === 'Visa' ? [13, 16, 19].includes(digits.length) : digits.length === 16) || !luhn(digits)) {
      issues.push({ field: 'number', message: 'Revisa el número de prueba Visa o Mastercard: formato, longitud y dígito de control inválidos.' })
    }
    const expiry = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(draft.expiry.trim())
    if (!expiry || !Number.isFinite(now.getTime()) || 2000 + Number(expiry[2]) < now.getFullYear() ||
      (2000 + Number(expiry[2]) === now.getFullYear() && Number(expiry[1]) < now.getMonth() + 1)) {
      issues.push({ field: 'expiry', message: 'Usa MM/AA con un mes válido, actual o posterior.' })
    }
    if (!/^\d{3}$/.test(draft.cvv)) issues.push({ field: 'cvv', message: 'Escribe un CVV ficticio de 3 dígitos.' })
  } else if (draft.method === 'yape') {
    if (!challenge || !/^DEMO-[a-zA-Z0-9-]{1,64}$/.test(challenge.operationId) || !/^\d{6}$/.test(challenge.code) || draft.yapeCode !== challenge.code) {
      issues.push({ field: 'yapeCode', message: 'Genera una demostración e ingresa exactamente su código ficticio de 6 dígitos.' })
    }
  } else issues.push({ field: 'method', message: 'Elige Efectivo, Tarjeta simulada o Yape simulado.' })
  return issues
}
