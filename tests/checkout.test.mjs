import assert from 'node:assert/strict'
import { test } from 'node:test'
import { emptyCheckout, validateCheckout, pickupSlots, checkoutTotals } from '../src/features/checkout/checkout.ts'
import { createInitialState, appReducer } from '../src/state/appState.ts'
import { getConfigurableProduct } from '../src/data/customizations.ts'
import { defaultConfiguration } from '../src/features/customization/configuration.ts'

const valid = () => ({ ...emptyCheckout(), fullName: 'Persona de Prueba', phone: '+51 (987) 654-321', address: 'Calle Ficticia 123, Distrito Demo' })
function order() {
  const configuration = defaultConfiguration(getConfigurableProduct('cheese'))
  configuration.selections.extras = ['queso']
  return { catalogVersion: 1, locationId: 'san-miguel', items: [
    { itemId: 'a', productId: 'cheese', quantity: 2, unitPriceCents: 1, configuration },
    { itemId: 'b', productId: 'royal', quantity: 1, unitPriceCents: 1, configuration: defaultConfiguration(getConfigurableProduct('royal')) },
  ] }
}

test('delivery validation orders errors by form order and preserves valid data without mutation', () => {
  assert.deepEqual(validateCheckout(emptyCheckout(), 'san-miguel').map((issue) => issue.field), ['fullName', 'phone', 'address'])
  const draft = { ...valid(), phone: 'invalid', address: '' }
  const before = structuredClone(draft)
  assert.deepEqual(validateCheckout(draft, 'san-miguel').map((issue) => issue.field), ['phone', 'address'])
  assert.deepEqual(draft, before)
  assert.deepEqual(validateCheckout(valid(), 'san-miguel'), [])
  assert.deepEqual(validateCheckout({ ...valid(), fullName: '李', phone: '1234567' }, 'san-miguel'), [], 'no two-word/Latin-name requirement')
})

test('field boundaries, telephone format and optional reference are validated with textual errors', () => {
  for (const [field, values] of Object.entries({
    fullName: ['   ', '12345', 'a'.repeat(101)], phone: ['', '123456', '1'.repeat(16), '987abc321', '98+7654321'],
    address: ['    ', '1234', 'a'.repeat(181)], reference: ['a'.repeat(201)],
  })) for (const value of values) {
    const issues = validateCheckout({ ...valid(), [field]: value }, 'san-miguel')
    assert.ok(issues.some((issue) => issue.field === field && issue.message.length), `${field}: ${value}`)
  }
  assert.deepEqual(validateCheckout({ ...valid(), fullName: 'a'.repeat(100), phone: '1'.repeat(15), address: '12345', reference: '' }, 'san-miguel'), [])
  assert.deepEqual(validateCheckout({ ...valid(), reference: 'a'.repeat(200) }, 'san-miguel'), [])
})

test('pickup hides delivery-only validation, requires a known slot, and still validates contact', () => {
  const draft = { ...valid(), deliveryMethod: 'pickup', address: '', reference: 'a'.repeat(201) }
  assert.deepEqual(validateCheckout(draft, 'demo-norte'), [])
  assert.deepEqual(validateCheckout({ ...draft, pickupSlot: 'forged' }, 'demo-norte').map((issue) => issue.field), ['pickupSlot'])
  assert.deepEqual(validateCheckout({ ...draft, fullName: '', phone: '' }, 'demo-norte').map((issue) => issue.field), ['fullName', 'phone'])
  assert.deepEqual(validateCheckout({ ...valid(), pickupSlot: 'forged' }, 'san-miguel'), [], 'hidden pickup slot cannot block delivery')
  assert.equal(pickupSlots('san-miguel')[0].id, 'asap')
  assert.ok(pickupSlots('san-miguel')[0].label.includes('25 minutos'))
  assert.deepEqual(pickupSlots('demo-norte').map((slot) => slot.id), ['asap', 'in-60', 'in-90'])
  assert.deepEqual(pickupSlots('unknown'), [])
  assert.equal(validateCheckout({ ...valid(), deliveryMethod: 'unknown' }, 'san-miguel')[0].field, 'deliveryMethod')
})

test('totals reuse catalog pricing, include delivery exactly once, and charge zero for pickup', () => {
  const draftOrder = order()
  const before = structuredClone(draftOrder)
  const delivery = checkoutTotals(draftOrder, 'delivery')
  assert.equal(delivery.subtotalCents, 6070)
  assert.equal(delivery.deliveryFeeCents, 500)
  assert.equal(delivery.totalCents, 6570)
  assert.equal(delivery.canContinue, true)
  const pickup = checkoutTotals(draftOrder, 'pickup')
  assert.equal(pickup.deliveryFeeCents, 0)
  assert.equal(pickup.totalCents, 6070)
  const centre = checkoutTotals({ ...draftOrder, locationId: 'demo-centro' }, 'delivery')
  assert.equal(centre.deliveryFeeCents, 600)
  assert.equal(centre.totalCents, 6670)
  assert.deepEqual(draftOrder, before)
})

test('empty, incompatible, obsolete and unknown-location carts cannot continue', () => {
  assert.equal(checkoutTotals(createInitialState().order, 'delivery').canContinue, false)
  const incompatible = checkoutTotals({ ...order(), locationId: 'demo-norte' }, 'pickup')
  assert.equal(incompatible.canContinue, false)
  assert.ok(incompatible.items.find((entry) => entry.item.productId === 'royal').issues.length)
  const obsolete = order()
  obsolete.items[0].configuration.selections.extras = ['unknown']
  assert.equal(checkoutTotals(obsolete, 'delivery').totalCents, null)
  assert.equal(checkoutTotals(obsolete, 'delivery').canContinue, false)
  const unknown = checkoutTotals({ ...order(), locationId: 'unknown' }, 'delivery')
  assert.equal(unknown.deliveryFeeCents, null)
  assert.equal(unknown.totalCents, null)
})

test('checkout stays outside persisted order, survives editing, resets schedule on local change and clears with the order', () => {
  const initial = { ...createInitialState(), order: order() }
  const draft = { ...valid(), deliveryMethod: 'pickup', pickupSlot: 'in-90' }
  const filled = appReducer(initial, { type: 'checkout/replace', value: draft })
  assert.equal(filled.order, initial.order, 'provider persists only changed order/preference/receipt contracts')
  assert.deepEqual(initial.checkout, emptyCheckout())
  const edited = appReducer(filled, { type: 'cart/quantity', itemId: 'a', quantity: 3 })
  assert.deepEqual(edited.checkout, draft)
  assert.equal(checkoutTotals(edited.order, 'pickup').totalCents, 8010)
  const moved = appReducer(edited, { type: 'order/replace', value: { ...edited.order, locationId: 'demo-centro' } })
  assert.equal(moved.checkout.pickupSlot, 'asap')
  assert.equal(moved.checkout.fullName, draft.fullName)
  const cleared = appReducer(moved, { type: 'cart/clear' })
  assert.deepEqual(cleared.checkout, emptyCheckout())
  assert.equal(cleared.preferences, initial.preferences)
  assert.ok(!JSON.stringify(filled.order).includes(draft.fullName))
  assert.deepEqual(createInitialState().checkout, emptyCheckout(), 'new page starts without personal data')
})
