import assert from 'node:assert/strict'
import { test } from 'node:test'
import { additionalProducts } from '../src/data/catalog.ts'
import { configurableProducts, getConfigurableProduct } from '../src/data/customizations.ts'
import { locations } from '../src/data/locations.ts'
import { defaultConfiguration, evaluateConfiguration } from '../src/features/customization/configuration.ts'
import { appReducer, createInitialState } from '../src/state/appState.ts'
import { recoverOrder } from '../src/features/cart/cart.ts'
import { checkoutTotals } from '../src/features/checkout/checkout.ts'
import { checkoutStep } from '../src/features/checkout/steps.ts'
import { createConfirmation } from '../src/features/confirmation/confirmation.ts'
import { readLastConfirmation, saveLastConfirmation, readOrder, saveOrder } from '../src/storage/browserStorage.ts'

function ready() {
  let state = createInitialState()
  state = appReducer(state, { type: 'cart/add', item: { itemId: 'a', productId: 'cheese', quantity: 2, unitPriceCents: 1, configuration: defaultConfiguration(getConfigurableProduct('cheese')) } })
  return appReducer(state, { type: 'checkout/replace', value: { ...state.checkout, fullName: 'CONTACT-PRIVATE', phone: '987654321', address: 'ADDRESS-PRIVATE 100' } })
}
function approve(state) {
  state = appReducer(state, { type: 'payment/start', attemptId: 'test-payment', method: 'cash', totalCents: checkoutTotals(state.order, state.checkout.deliveryMethod).totalCents, revision: state.paymentRevision })
  return appReducer(state, { type: 'payment/finish', attemptId: 'test-payment', revision: state.paymentRevision, outcome: 'approved' })
}

test('new sauce defaults are empty and optional; editing preserves the exact saved sauces and identity', () => {
  for (const product of configurableProducts) {
    const sauces = product.optionGroups.find((group) => group.id === 'salsas')
    if (sauces) {
      assert.equal(sauces.min, 0)
      assert.equal(sauces.max, 2)
      assert.deepEqual(defaultConfiguration(product).selections.salsas, [])
    }
  }
  let state = ready()
  const configuration = structuredClone(state.order.items[0].configuration)
  configuration.selections.salsas = ['aji', 'ketchup']
  state = appReducer(state, { type: 'cart/edit', itemId: 'a', configuration, quantity: 3 })
  const restored = recoverOrder({ status: 'ok', value: structuredClone(state.order) }, createInitialState().order).order
  state = appReducer({ ...state, order: restored }, { type: 'cart/edit', itemId: 'a', configuration: restored.items[0].configuration, quantity: 4 })
  assert.equal(state.order.items.length, 1)
  assert.equal(state.order.items[0].itemId, 'a')
  assert.deepEqual(state.order.items[0].configuration.selections.salsas, ['aji', 'ketchup'])
  assert.equal(checkoutTotals(state.order, 'pickup').totalCents, 6760)
})

test('eight additions have exactly two per new category and valid product-specific configurations at every location', () => {
  assert.equal(additionalProducts.length, 8)
  for (const category of ['menus', 'complementos', 'pollo', 'loncheritas']) {
    assert.equal(additionalProducts.filter((product) => product.category === category).length, 2)
  }
  for (const entry of additionalProducts) {
    const product = getConfigurableProduct(entry.id)
    assert.ok(product.source.reference.includes('https://www.bembos.com.pe/menu/'))
    assert.equal(product.source.kind, 'academic-mock')
    assert.deepEqual(product.variants, [])
    if (product.category !== 'pollo') assert.deepEqual(product.optionGroups, [], 'fixed composition does not inherit hamburger options')
    for (const location of locations) {
      const result = evaluateConfiguration(product, defaultConfiguration(product), 2, location.id)
      assert.deepEqual(result.issues, [], `${entry.id}/${location.id}`)
      assert.equal(result.totalCents, product.basePriceCents * 2)
    }
  }
})

test('all new products survive cart recovery, recalculation and receipt storage without personal or payment inputs', () => {
  const previousWindow = globalThis.window
  const memory = () => { const data = new Map(); return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key) } }
  globalThis.window = { localStorage: memory(), sessionStorage: memory() }
  try {
    for (const location of locations) {
      let state = ready()
      state.order = { ...state.order, locationId: location.id, items: [] }
      for (const product of additionalProducts) state = appReducer(state, { type: 'cart/add', item: {
        itemId: `new-${product.id}`, productId: product.id, quantity: 2, unitPriceCents: 1,
        configuration: defaultConfiguration(getConfigurableProduct(product.id)),
      } })
      const expected = additionalProducts.reduce((sum, product) => sum + product.basePriceCents * 2, 0)
      assert.equal(checkoutTotals(state.order, 'delivery').totalCents, expected + location.deliveryFeeCents)
      assert.equal(saveOrder(state.order).ok, true)
      const restored = recoverOrder(readOrder(), createInitialState().order).order
      assert.deepEqual(restored, state.order)
      assert.equal(new Set(restored.items.map((item) => item.itemId)).size, 8)
      state = approve({ ...state, order: restored })
      const receipt = createConfirmation(state, `BEM-${location.id}`, '2026-11-07T12:00:00Z')
      assert.ok(receipt)
      assert.equal(receipt.totalCents, expected + location.deliveryFeeCents)
      assert.deepEqual(receipt.items.map((item) => item.snapshot.name), additionalProducts.map((product) => product.name))
      assert.equal(saveLastConfirmation(receipt).ok, true)
      assert.deepEqual(readLastConfirmation().value, receipt)
      assert.ok(!JSON.stringify(receipt).includes('CONTACT-PRIVATE'))
      assert.ok(!JSON.stringify(receipt).includes('ADDRESS-PRIVATE'))
      assert.ok(!/"(?:number|cvv|expiry|yapeCode|holder)":/.test(JSON.stringify(receipt)))
    }
  } finally { globalThis.window = previousWindow }
})

test('checkout stages require applicable delivery data and current approval; backtracking preserves the memory draft', () => {
  const state = ready()
  assert.equal(checkoutStep(0, state), 0, 'valid defaults alone do not advance the wizard')
  assert.equal(checkoutStep(1, state), 1)
  assert.equal(checkoutStep(2, state), 1, 'review cannot bypass payment')
  const approved = approve(state)
  assert.equal(checkoutStep(2, approved), 2)
  const before = structuredClone(approved.checkout)
  assert.equal(checkoutStep(0, approved), 0)
  assert.deepEqual(approved.checkout, before)
  const changed = appReducer(approved, { type: 'cart/quantity', itemId: 'a', quantity: 3 })
  assert.equal(checkoutStep(2, changed), 1)
  assert.equal(changed.payment.status, 'invalidated')
  const invalidContact = appReducer(approved, { type: 'checkout/replace', value: { ...approved.checkout, phone: '' } })
  assert.equal(checkoutStep(2, invalidContact), 0)
  const pickup = { ...state, checkout: { ...state.checkout, deliveryMethod: 'pickup', address: '', reference: '', pickupSlot: 'in-60' } }
  assert.equal(checkoutStep(1, pickup), 1, 'hidden address fields do not block pickup')
})

test('payment outcomes notify once, quantity changes stay quiet, and individual removal remains reversible', () => {
  const approved = approve(ready())
  assert.equal(approved.toasts.filter((toast) => toast.message === 'Pago aprobado.').length, 1)
  assert.equal(appReducer(approved, { type: 'payment/finish', attemptId: 'test-payment', revision: approved.paymentRevision, outcome: 'approved' }), approved)
  const changed = appReducer(approved, { type: 'cart/quantity', itemId: 'a', quantity: 3 })
  assert.equal(changed.notificationSequence, approved.notificationSequence)
  assert.deepEqual(changed.toasts, approved.toasts)
  const empty = appReducer(changed, { type: 'cart/remove', itemId: 'a' })
  assert.equal(empty.order.items.length, 0)
  assert.deepEqual(empty.checkout, changed.checkout)
  assert.equal(empty.preferences, changed.preferences)
  const undo = empty.toasts.find((toast) => toast.removed)
  const restored = appReducer(empty, { type: 'cart/undo', toastId: undo.id })
  assert.deepEqual(restored.order.items, changed.order.items)
  const pending = appReducer(ready(), { type: 'payment/start', attemptId: 'declined', method: 'cash', totalCents: 3880, revision: ready().paymentRevision })
  const rejected = appReducer(pending, { type: 'payment/finish', attemptId: 'declined', revision: pending.paymentRevision, outcome: 'error' })
  assert.equal(rejected.payment.status, 'error')
  assert.equal(rejected.toasts.at(-1).kind, 'error')
  assert.match(rejected.toasts.at(-1).message, /Pago rechazado/)
})
