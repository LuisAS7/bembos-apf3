import assert from 'node:assert/strict'
import { test, beforeEach } from 'node:test'
import { readOrder, readPreferences, readLastConfirmation, saveOrder, savePreferences, saveLastConfirmation, STORAGE_KEYS } from '../src/storage/browserStorage.ts'
import { appReducer, createInitialState } from '../src/state/appState.ts'

function memoryStorage() {
  const entries = new Map()
  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
    removeItem: (key) => entries.delete(key),
  }
}
beforeEach(() => {
  globalThis.window = { localStorage: memoryStorage(), sessionStorage: memoryStorage() }
})

test('missing, malformed and future-version snapshots are distinct and not overwritten', () => {
  assert.equal(readOrder().status, 'missing')
  window.localStorage.setItem(STORAGE_KEYS.order, '{broken')
  assert.equal(readOrder().status, 'invalid')
  assert.equal(window.localStorage.getItem(STORAGE_KEYS.order), '{broken')
  window.localStorage.setItem(STORAGE_KEYS.order, JSON.stringify({ schemaVersion: 99, data: {} }))
  assert.equal(readOrder().status, 'invalid')
})

test('order snapshot keeps independent configuration and strips unrelated properties', () => {
  const order = { catalogVersion: 1, locationId: 'san-miguel', phone: 'TEST-SECRET', items: [
    { itemId: 'item-a', productId: 'demo', quantity: 2, unitPriceCents: 1690,
      configuration: { variantId: 'medium', selections: { extras: ['cheese'] }, cvv: 'TEST-SECRET' } },
  ] }
  assert.equal(saveOrder(order).ok, true)
  const loaded = readOrder()
  assert.equal(loaded.status, 'ok')
  assert.deepEqual(loaded.value.items[0].configuration, { variantId: 'medium', selections: { extras: ['cheese'] } })
  assert.equal(loaded.value.items[0].quantity, 2)
  assert.ok(!window.localStorage.getItem(STORAGE_KEYS.order).includes('TEST-SECRET'))
  assert.equal(saveOrder({ ...order, items: [{ ...order.items[0], quantity: -1 }] }).ok, false)
})

test('only the sanitized receipt is stored in sessionStorage; null clears that key', () => {
  const receipt = { orderId: 'BEM-TEST', confirmedAt: '2026-11-07T12:00:00-05:00', locationId: 'san-miguel',
    deliveryMethod: 'pickup', paymentMethod: 'card', totalCents: 1690,
    cardNumber: 'TEST-SECRET', address: 'TEST-SECRET', yapeCode: 'TEST-SECRET',
    payment: { cvv: 'TEST-SECRET' }, items: [{ productId: 'demo', quantity: 1, lineTotalCents: 1690, phone: 'TEST-SECRET' }] }
  assert.equal(saveLastConfirmation(receipt).ok, true)
  assert.equal(readLastConfirmation().value.orderId, 'BEM-TEST')
  assert.equal(readLastConfirmation().value.paymentMethod, 'card')
  assert.ok(!window.sessionStorage.getItem(STORAGE_KEYS.lastConfirmation).includes('TEST-SECRET'))
  assert.equal(window.localStorage.getItem(STORAGE_KEYS.lastConfirmation), null)
  assert.equal(saveLastConfirmation({ ...receipt, paymentMethod: ['card'] }).ok, false)
  saveLastConfirmation(null)
  assert.equal(readLastConfirmation().status, 'missing')
})

test('preferences persist independently and reject invalid enum values', () => {
  const preferences = { textSize: 'large', reduceMotion: true, underlineLinks: false }
  assert.equal(savePreferences(preferences).ok, true)
  assert.deepEqual(readPreferences().value, preferences)
  assert.equal(savePreferences({ ...preferences, textSize: ['large'] }).ok, false)
})

test('blocked storage getters and quota failures do not throw', () => {
  Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked') } })
  assert.equal(readPreferences().status, 'unavailable')
  assert.equal(savePreferences(createInitialState().preferences).ok, false)
  window.sessionStorage.setItem = () => { throw new Error('quota') }
  assert.equal(saveLastConfirmation({ orderId: 'BEM-TEST', confirmedAt: '2026-11-07T17:00:00Z', locationId: 'san-miguel',
    deliveryMethod: 'delivery', paymentMethod: 'cash', totalCents: 100, items: [{ productId: 'demo', quantity: 1, lineTotalCents: 100 }] }).ok, false)
})

test('reducer keeps preferences and draft isolated and does not mutate previous state', () => {
  const initial = createInitialState()
  const next = appReducer(initial, { type: 'preferences/replace', value: { ...initial.preferences, reduceMotion: true } })
  assert.equal(initial.preferences.reduceMotion, false)
  assert.equal(next.preferences.reduceMotion, true)
  assert.equal(next.order, initial.order)
})
