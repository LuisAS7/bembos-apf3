import assert from 'node:assert/strict'
import { test, beforeEach } from 'node:test'
import { appReducer, createInitialState } from '../src/state/appState.ts'
import { defaultConfiguration } from '../src/features/customization/configuration.ts'
import { getConfigurableProduct } from '../src/data/customizations.ts'
import { checkoutTotals } from '../src/features/checkout/checkout.ts'
import { confirmOrder } from '../src/features/confirmation/confirmOrder.ts'
import { canConfirm, createConfirmation, excludeConfirmedItems, hasCompleteSummary } from '../src/features/confirmation/confirmation.ts'
import { readLastConfirmation, readOrder, saveLastConfirmation, saveOrder, savePreferences, STORAGE_KEYS } from '../src/storage/browserStorage.ts'

const deps = { createId: () => 'BEM-test-1', now: () => '2026-11-07T08:00:00.000Z' }
function memoryStorage() {
  const map = new Map()
  return { getItem: (key) => map.get(key) ?? null, setItem: (key, value) => map.set(key, value), removeItem: (key) => map.delete(key) }
}
beforeEach(() => { globalThis.window = { localStorage: memoryStorage(), sessionStorage: memoryStorage() } })
function approved(method = 'cash', deliveryMethod = 'delivery', attemptId = 'attempt-a') {
  let state = createInitialState()
  const configuration = defaultConfiguration(getConfigurableProduct('cheese'))
  configuration.variantId = 'grande'
  configuration.selections.papas = ['grandes']
  configuration.selections.extras = ['queso']
  state.order.items = [{ itemId: 'cart-a', productId: 'cheese', configuration, quantity: 2, unitPriceCents: 1 }]
  state.checkout = { ...state.checkout, deliveryMethod, fullName: 'PRIVATE-NAME', phone: '987654321', address: 'PRIVATE-ADDRESS 100', reference: 'PRIVATE-REFERENCE', pickupSlot: 'in-60' }
  state = appReducer(state, { type: 'payment/start', attemptId, revision: state.paymentRevision, method, totalCents: checkoutTotals(state.order, deliveryMethod).totalCents })
  return appReducer(state, { type: 'payment/finish', attemptId, revision: state.paymentRevision, outcome: 'approved' })
}

test('confirmation recalculates an independent snapshot with exact configurations, quantity and consistent totals', () => {
  const state = approved()
  const snapshot = createConfirmation(state, deps.createId(), deps.now())
  assert.equal(canConfirm(state), true)
  assert.equal(hasCompleteSummary(snapshot), true)
  assert.equal(snapshot.summary.subtotalCents, 5280)
  assert.equal(snapshot.summary.deliveryFeeCents, 500)
  assert.equal(snapshot.totalCents, 5780)
  assert.equal(snapshot.items[0].snapshot.unitPriceCents, 2640)
  assert.equal(snapshot.items[0].quantity, 2)
  assert.equal(snapshot.items[0].snapshot.variantLabel, 'Cheese grande')
  assert.deepEqual(snapshot.items[0].snapshot.selections.find((group) => group.label === 'Extras').options, ['Extra queso'])
  const serialized = JSON.stringify(snapshot)
  state.order.items[0].configuration.selections.extras.length = 0
  state.order.items[0].quantity = 99
  state.checkout.fullName = 'OTHER-PERSON'
  assert.equal(JSON.stringify(snapshot), serialized)
})

test('all payment types and pickup receipts use a frozen mock local/slot and zero pickup fee', () => {
  for (const method of ['cash', 'card', 'yape']) {
    const state = approved(method, 'pickup')
    const result = confirmOrder(state, 'attempt-a', deps)
    assert.equal(result.result.ok, true)
    const receipt = result.result.receipt
    assert.equal(receipt.paymentMethod, method)
    assert.equal(receipt.summary.locationName, 'Bembos San Miguel')
    assert.equal(receipt.summary.pickupSlotLabel, 'En 60 minutos')
    assert.equal(receipt.summary.estimatedMinutes, 25)
    assert.equal(receipt.summary.deliveryFeeCents, 0)
    assert.equal(receipt.totalCents, 5280)
  }
})

test('confirmation is idempotent per payment attempt: one ID/write and replay never clears a new order', () => {
  const state = approved()
  let ids = 0, writes = 0
  const setItem = window.sessionStorage.setItem
  window.sessionStorage.setItem = (key, value) => { writes++; setItem(key, value) }
  const dependencies = { ...deps, createId: () => { ids++; return 'BEM-test-once' } }
  const first = confirmOrder(state, 'attempt-a', dependencies)
  const second = confirmOrder(first.state, 'attempt-a', dependencies)
  assert.equal(first.result.ok, true)
  assert.equal(second.result.ok, true)
  assert.equal(second.result.receipt.orderId, first.result.receipt.orderId)
  assert.equal(ids, 1)
  assert.equal(writes, 1)
  const newOrder = appReducer(first.state, { type: 'cart/add', item: { ...state.order.items[0], itemId: 'new-item' } })
  const replay = confirmOrder(newOrder, 'attempt-a', dependencies)
  assert.equal(replay.state, newOrder)
  assert.equal(replay.state.order.items.length, 1)
  assert.equal(writes, 1)
})

test('empty/incompatible/invalid-checkout, unapproved or stale/tampered payments never create a receipt', () => {
  const mutations = [
    (s) => { s.order.items = [] }, (s) => { s.order.locationId = 'demo-centro' },
    (s) => { s.order.items[0].configuration.variantId = 'unknown' }, (s) => { s.checkout.phone = '' },
    (s) => { s.payment.status = 'processing' }, (s) => { s.payment.status = 'error' },
    (s) => { s.paymentRevision++ }, (s) => { s.payment.totalCents++ },
  ]
  for (const mutate of mutations) {
    const state = approved(); mutate(state)
    let generated = false
    const result = confirmOrder(state, 'attempt-a', { ...deps, createId: () => { generated = true; return 'BEM-invalid' } })
    assert.equal(result.result.ok, false)
    assert.equal(result.state, state)
    assert.equal(generated, false)
    assert.equal(readLastConfirmation().status, 'missing')
  }
  const state = approved()
  assert.equal(confirmOrder(state, 'other-attempt', deps).result.ok, false)
  assert.equal(createConfirmation(state, 'https://example.invalid', deps.now()), null)
})

test('receipt write failure preserves cart, checkout, approval, preferences and previous receipt without clearing storage', () => {
  const state = approved()
  const previous = createConfirmation(approved('cash', 'pickup', 'previous-attempt'), 'BEM-previous', deps.now())
  saveLastConfirmation(previous)
  state.lastConfirmation = previous
  const previousRaw = window.sessionStorage.getItem(STORAGE_KEYS.lastConfirmation)
  saveOrder(state.order)
  savePreferences(state.preferences)
  const rawOrder = window.localStorage.getItem(STORAGE_KEYS.order)
  let cleared = false
  window.localStorage.removeItem = () => { cleared = true }
  window.sessionStorage.setItem = () => { throw new Error('quota') }
  const failed = confirmOrder(state, 'attempt-a', deps)
  assert.equal(failed.result.ok, false)
  assert.ok(failed.result.message.includes('conservamos el carrito'))
  assert.equal(failed.state, state)
  assert.equal(cleared, false)
  assert.equal(window.localStorage.getItem(STORAGE_KEYS.order), rawOrder)
  assert.equal(failed.state.payment.status, 'approved')
  assert.equal(window.sessionStorage.getItem(STORAGE_KEYS.lastConfirmation), previousRaw)
  window.sessionStorage = memoryStorage()
  const retried = confirmOrder(failed.state, 'attempt-a', deps)
  assert.equal(retried.result.ok, true)
})

test('successful save precedes cleanup, clears temporary state/Undo and preserves display preferences', () => {
  let state = approved()
  state.preferences = { textSize: 'large', reduceMotion: true, underlineLinks: true }
  state.toasts = [{ id: 'old', message: 'old notice' }]
  saveOrder(state.order)
  savePreferences(state.preferences)
  window.localStorage.setItem('other-app', 'keep')
  const setItem = window.sessionStorage.setItem
  const removeItem = window.localStorage.removeItem
  const steps = []
  window.sessionStorage.setItem = (key, value) => { steps.push('receipt'); setItem(key, value) }
  window.localStorage.removeItem = (key) => { steps.push('cleanup'); removeItem(key) }
  const result = confirmOrder(state, 'attempt-a', deps)
  assert.deepEqual(steps, ['receipt', 'cleanup'])
  assert.equal(result.result.ok, true)
  assert.equal(result.state.order.items.length, 0)
  assert.equal(result.state.checkout.fullName, '')
  assert.equal(result.state.checkout.address, '')
  assert.equal(result.state.payment.status, 'idle')
  assert.equal(result.state.payment.attemptId, null)
  assert.deepEqual(result.state.toasts.map((toast) => toast.message), ['Pedido confirmado.'])
  assert.ok(result.state.toasts.every((toast) => !toast.removed), 'old Undo snapshots are discarded')
  assert.equal(result.state.preferences, state.preferences)
  assert.equal(readOrder().status, 'missing')
  assert.equal(window.localStorage.getItem('other-app'), 'keep')
  assert.deepEqual(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.preferences)).data, state.preferences)
})

test('failed local cleanup retains a recoverable receipt and confirmed identities cannot rehydrate', () => {
  const state = approved()
  saveOrder(state.order)
  window.localStorage.removeItem = () => { throw new Error('blocked') }
  const result = confirmOrder(state, 'attempt-a', deps)
  assert.equal(result.result.ok, true)
  assert.equal(readLastConfirmation().status, 'ok')
  assert.ok(result.state.storageNotice.includes('No pudimos borrar'))
  assert.equal(excludeConfirmedItems(readOrder().value, readLastConfirmation().value).items.length, 0)
  const mixed = { ...state.order, items: [...state.order.items, { ...state.order.items[0], itemId: 'fresh-item' }] }
  assert.deepEqual(excludeConfirmedItems(mixed, result.result.receipt).items.map((item) => item.itemId), ['fresh-item'])
})

test('receipt recovery is catalog-independent, keeps only the latest and rejects inconsistent or incomplete snapshots', () => {
  const first = confirmOrder(approved(), 'attempt-a', deps)
  const recovered = readLastConfirmation()
  assert.equal(recovered.status, 'ok')
  assert.deepEqual(recovered.value, first.result.receipt)
  const raw = window.sessionStorage.getItem(STORAGE_KEYS.lastConfirmation)
  for (const mutate of [
    (r) => { r.totalCents++ }, (r) => { r.summary.subtotalCents++ },
    (r) => { r.items[0].snapshot.unitPriceCents++ }, (r) => { delete r.summary },
  ]) {
    const damaged = JSON.parse(raw); mutate(damaged.data)
    window.sessionStorage.setItem(STORAGE_KEYS.lastConfirmation, JSON.stringify(damaged))
    assert.equal(readLastConfirmation().status, 'invalid')
  }
  window.sessionStorage.setItem(STORAGE_KEYS.lastConfirmation, raw)
  const second = confirmOrder(approved('yape', 'pickup', 'attempt-b'), 'attempt-b', { ...deps, createId: () => 'BEM-test-2' })
  assert.equal(second.result.ok, true)
  assert.equal(readLastConfirmation().value.orderId, 'BEM-test-2')
  assert.equal(first.result.receipt.orderId, 'BEM-test-1')
  const colliding = approved('cash', 'delivery', 'attempt-c')
  colliding.lastConfirmation = second.result.receipt
  assert.equal(confirmOrder(colliding, 'attempt-c', { ...deps, createId: () => 'BEM-test-2' }).result.ok, false)
  assert.equal(readLastConfirmation().value.orderId, 'BEM-test-2')
})

test('snapshot, QR identifier and storage exclude contact/address/card/CVV/expiry/Yape code, including nested extras', () => {
  const state = approved('card')
  const receipt = createConfirmation(state, deps.createId(), deps.now())
  const secrets = { fullName: state.checkout.fullName, phone: state.checkout.phone, address: state.checkout.address, reference: state.checkout.reference,
    cardNumber: 'SECRET-PAN', cvv: 'SECRET-CVV', expiry: 'SECRET-EXPIRY', yapeCode: 'SECRET-YAPE' }
  const dirty = structuredClone(receipt)
  Object.assign(dirty, secrets)
  Object.assign(dirty.summary, secrets)
  Object.assign(dirty.items[0], secrets)
  Object.assign(dirty.items[0].snapshot, secrets)
  Object.assign(dirty.items[0].snapshot.selections[0], secrets)
  assert.equal(saveLastConfirmation(dirty).ok, true)
  const encoded = window.sessionStorage.getItem(STORAGE_KEYS.lastConfirmation)
  const recovered = readLastConfirmation().value
  for (const secret of Object.values(secrets)) {
    assert.ok(!JSON.stringify(receipt).includes(secret))
    assert.ok(!encoded.includes(secret))
    assert.ok(!recovered.orderId.includes(secret))
  }
  assert.deepEqual(recovered, receipt)
})
