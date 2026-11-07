import assert from 'node:assert/strict'
import { test } from 'node:test'
import { cardBrand, decimalCents, demoQrValue, emptyPaymentDraft, luhn, validatePayment } from '../src/features/payments/payment.ts'
import { appReducer, createInitialState } from '../src/state/appState.ts'
import { defaultConfiguration } from '../src/features/customization/configuration.ts'
import { getConfigurableProduct } from '../src/data/customizations.ts'
import { checkoutTotals } from '../src/features/checkout/checkout.ts'
import { saveOrder, saveLastConfirmation } from '../src/storage/browserStorage.ts'

const now = new Date(2026, 10, 7)
function readyState() {
  const state = createInitialState()
  state.order.items = [{ itemId: 'a', productId: 'cheese', quantity: 2, unitPriceCents: 1, configuration: defaultConfiguration(getConfigurableProduct('cheese')) }]
  state.checkout = { ...state.checkout, fullName: 'Persona Ficticia', phone: '987654321', address: 'Calle Ficticia 100' }
  return state
}
function card() { return { ...emptyPaymentDraft('card'), holder: 'Titular Ficticio', number: '4111 1111 1111 1111', expiry: '11/26', cvv: '123' } }
const validate = (draft, challenge = null) => { const state = readyState(); return validatePayment(state.order, state.checkout, draft, challenge, now) }
function start(state, extra = {}) {
  return appReducer(state, { type: 'payment/start', attemptId: 'SIM-test-a', method: 'cash', revision: state.paymentRevision,
    totalCents: checkoutTotals(state.order, state.checkout.deliveryMethod).totalCents, ...extra })
}
function finish(state, outcome = 'approved', extra = {}) {
  return appReducer(state, { type: 'payment/finish', attemptId: 'SIM-test-a', revision: state.paymentRevision, outcome, ...extra })
}
function testNumber(prefix, length = 16) {
  const body = prefix.padEnd(length - 1, '0')
  return Array.from({ length: 10 }, (_, digit) => body + digit).find(luhn)
}

test('cash accepts exact decimal cents and requires tendered amount strictly greater than recalculated total', () => {
  assert.equal(decimalCents('38,80'), 3880)
  assert.equal(decimalCents('0.29'), 29)
  for (const value of ['1.001', '1,000.00', '-1', '1e3', 'Infinity', '', '90071992547409999']) assert.equal(decimalCents(value), null)
  assert.deepEqual(validate(emptyPaymentDraft()), [])
  const draft = { ...emptyPaymentDraft(), needsChange: true, tendered: '38.80' }
  assert.ok(validate(draft).some((issue) => issue.field === 'tendered'), 'equal amount must fail')
  assert.ok(validate({ ...draft, tendered: '38.79' }).length)
  assert.deepEqual(validate({ ...draft, tendered: '38,81' }), [])
  assert.deepEqual(validate({ ...draft, needsChange: false, tendered: 'bad' }), [])
})

test('Visa/Mastercard ranges, accepted lengths and Luhn are checked independently from detection', () => {
  assert.equal(cardBrand('4'), 'Visa')
  for (const prefix of ['51', '55', '2221', '2720']) {
    const number = testNumber(prefix)
    assert.equal(cardBrand(number), 'Mastercard')
    assert.deepEqual(validate({ ...card(), number }), [])
  }
  for (const prefix of ['50', '56', '2220', '2721', '34']) assert.equal(cardBrand(testNumber(prefix)), null)
  for (const length of [13, 16, 19]) assert.deepEqual(validate({ ...card(), number: testNumber('4', length) }), [])
  assert.ok(validate({ ...card(), number: testNumber('4', 15) }).some((issue) => issue.field === 'number'))
  assert.ok(validate({ ...card(), number: testNumber('51', 19) }).some((issue) => issue.field === 'number'))
  assert.equal(luhn('0000000000000000'), false)
  for (const number of ['4111111111111112', '41111111X1111111', '', '+4111111111111111']) {
    assert.ok(validate({ ...card(), number }).some((issue) => issue.field === 'number'))
  }
})

test('card field errors follow DOM order and expiry accepts the current month but rejects past or malformed dates', () => {
  assert.deepEqual(validate(emptyPaymentDraft('card')).map((issue) => issue.field), ['holder', 'number', 'expiry', 'cvv'])
  assert.deepEqual(validate(card()), [])
  for (const expiry of ['10/26', '12/25', '00/27', '13/27', '1/27', '11/2026', '']) assert.ok(validate({ ...card(), expiry }).some((issue) => issue.field === 'expiry'))
  assert.deepEqual(validate({ ...card(), expiry: '12/26' }), [])
  for (const cvv of ['', '12', '1234', '12x']) assert.ok(validate({ ...card(), cvv }).some((issue) => issue.field === 'cvv'))
  assert.ok(validate({ ...card(), holder: 'a'.repeat(101) }).some((issue) => issue.field === 'holder'))
  const monthEnd = new Date(2026, 10, 30, 23, 59)
  const state = readyState()
  assert.deepEqual(validatePayment(state.order, state.checkout, card(), null, monthEnd), [])
})

test('Yape QR is demonstration text only and a generated code must match its current challenge', () => {
  const challenge = { operationId: 'DEMO-operation-a', code: '123456' }
  const draft = { ...emptyPaymentDraft('yape'), yapeCode: challenge.code }
  assert.deepEqual(validate(draft, challenge), [])
  for (const candidate of [null, { ...challenge, code: '654321' }, { ...challenge, operationId: 'https://example.invalid/pay' }]) assert.ok(validate(draft, candidate).some((issue) => issue.field === 'yapeCode'))
  assert.ok(validate({ ...draft, yapeCode: '12345' }, challenge).length)
  const payload = demoQrValue(challenge.operationId)
  assert.equal(payload, 'APF3-DEMO-YAPE:DEMO-operation-a')
  assert.ok(!payload.includes(challenge.code))
  assert.ok(!/https?:|yape:\/\/|tel:|\/\//i.test(payload))
  assert.throws(() => demoQrValue('https://example.invalid'))
})

test('invalid order/checkout or tampered amounts cannot start or approve a simulation', () => {
  for (const alter of [
    (s) => { s.order.items = [] }, (s) => { s.order.items[0].productId = 'unknown' },
    (s) => { s.order.items[0].configuration.variantId = 'grande'; s.order.locationId = 'demo-centro' },
    (s) => { s.checkout.phone = '' }, (s) => { s.checkout.deliveryMethod = 'pickup'; s.checkout.pickupSlot = 'forged' },
  ]) {
    const state = readyState(); alter(state)
    assert.ok(validatePayment(state.order, state.checkout, emptyPaymentDraft(), null, now).some((issue) => issue.field === 'context'))
    assert.equal(start(state), state)
    assert.equal(finish(state), state, 'finish without processing must be ignored')
  }
  const state = readyState()
  assert.equal(start(state, { totalCents: 1 }), state)
  assert.equal(start(state, { revision: 99 }), state)
  assert.equal(start(state, { method: 'unknown' }), state)
})

test('processing prevents duplicate submissions, ignores stale callbacks and supports explicit retry after rejection', () => {
  const processing = start(readyState())
  assert.equal(processing.payment.status, 'processing')
  assert.equal(start(processing, { attemptId: 'SIM-second' }), processing)
  assert.equal(finish(processing, 'approved', { attemptId: 'SIM-other' }), processing)
  const rejected = finish(processing, 'error')
  assert.equal(rejected.payment.status, 'error')
  const retried = start(rejected, { attemptId: 'SIM-retry' })
  const approved = finish(retried, 'approved', { attemptId: 'SIM-retry' })
  assert.equal(approved.payment.status, 'approved')
  assert.equal(approved.payment.totalCents, 3880)
  assert.equal(start(approved), approved)
  assert.equal(finish(approved), approved)
  const cancelled = appReducer(processing, { type: 'payment/cancel' })
  assert.equal(cancelled.payment.status, 'invalidated')
  assert.equal(finish(cancelled), cancelled)
})

test('order, configuration, quantity, local, delivery and contact changes invalidate approval; preferences do not', () => {
  const approved = finish(start(readyState()))
  const actions = [
    { type: 'cart/quantity', itemId: 'a', quantity: 3 },
    { type: 'cart/edit', itemId: 'a', quantity: 2, configuration: { ...approved.order.items[0].configuration, variantId: 'grande' } },
    { type: 'cart/remove', itemId: 'a' },
    { type: 'order/replace', value: { ...approved.order, locationId: 'demo-centro' } },
    ...['deliveryMethod', 'fullName', 'phone', 'address', 'reference', 'pickupSlot'].map((field) => ({ type: 'checkout/replace', value: { ...approved.checkout,
      [field]: field === 'deliveryMethod' ? 'pickup' : field === 'pickupSlot' ? 'in-60' : 'Changed' } })),
  ]
  for (const action of actions) {
    const changed = appReducer(approved, action)
    assert.equal(changed.payment.status, 'invalidated', action.type)
    assert.equal(changed.payment.attemptId, null)
    assert.ok(changed.paymentRevision > approved.paymentRevision)
  }
  const prefs = appReducer(approved, { type: 'preferences/replace', value: { ...approved.preferences, reduceMotion: true } })
  assert.equal(prefs.payment, approved.payment)
  const cleared = appReducer(approved, { type: 'cart/clear' })
  assert.equal(cleared.payment.status, 'idle')
  assert.equal(cleared.payment.method, null)
})

test('changing a pending attempt and undoing the change cannot revive its late approval', () => {
  const pending = start(readyState())
  const changed = appReducer(pending, { type: 'cart/quantity', itemId: 'a', quantity: 3 })
  const reverted = appReducer(changed, { type: 'cart/quantity', itemId: 'a', quantity: 2 })
  assert.equal(finish(reverted, 'approved', { revision: pending.paymentRevision }), reverted)
  assert.equal(reverted.payment.status, 'invalidated')
  const invalid = { ...pending, checkout: { ...pending.checkout, phone: '' } }
  assert.equal(finish(invalid).payment.status, 'invalidated', 'completion revalidates even without a normal edit action')
})

test('shared payment metadata and existing storage/receipt allowlists exclude injected sensitive fields', () => {
  const state = readyState()
  const sensitive = { holder: 'SECRET-HOLDER', cardNumber: 'SECRET-PAN', cvv: 'SECRET-CVV', expiry: 'SECRET-EXPIRY', yapeCode: 'SECRET-CODE' }
  const processing = start(state, sensitive)
  const approved = finish(processing)
  assert.deepEqual(Object.keys(approved.payment).sort(), ['status', 'method', 'totalCents', 'attemptId', 'revision'].sort())
  assert.equal(approved.order, state.order, 'payment actions do not trigger order persistence')
  const writes = []
  globalThis.window = { localStorage: { setItem: (key, value) => writes.push(value) }, sessionStorage: { setItem: (key, value) => writes.push(value) } }
  assert.equal(saveOrder({ ...approved.order, ...sensitive }).ok, true)
  assert.equal(saveLastConfirmation({ orderId: 'TEST-OLD-CONTRACT', confirmedAt: '2026-11-07T00:00:00Z', locationId: 'san-miguel', deliveryMethod: 'pickup', paymentMethod: 'card', totalCents: 3880,
    ...sensitive, items: [{ productId: 'cheese', quantity: 2, lineTotalCents: 3880, ...sensitive }] }).ok, true)
  for (const secret of Object.values(sensitive)) {
    assert.ok(!JSON.stringify(approved.payment).includes(secret))
    assert.ok(!writes.some((value) => value.includes(secret)))
  }
  assert.equal(createInitialState().payment.status, 'idle')
})
