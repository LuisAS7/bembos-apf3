import assert from 'node:assert/strict'
import { test, beforeEach } from 'node:test'
import { getConfigurableProduct } from '../src/data/customizations.ts'
import { defaultConfiguration, MAX_QUANTITY } from '../src/features/customization/configuration.ts'
import { addItem, editItem, removeItem, restoreItem, inspectOrder, recoverOrder } from '../src/features/cart/cart.ts'
import { prepareLocationChange } from '../src/features/locations/prepareLocationChange.ts'
import { appReducer, createInitialState } from '../src/state/appState.ts'
import { clearStoredOrder, readOrder, saveOrder, STORAGE_KEYS } from '../src/storage/browserStorage.ts'

const empty = () => createInitialState().order
const item = (itemId, productId = 'cheese', quantity = 1) => ({ itemId, productId, quantity, unitPriceCents: 1,
  configuration: defaultConfiguration(getConfigurableProduct(productId)) })
const ok = (value) => ({ status: 'ok', value })
function storage() {
  const entries = new Map()
  return { getItem: (key) => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value), removeItem: (key) => entries.delete(key) }
}
beforeEach(() => { globalThis.window = { localStorage: storage(), sessionStorage: storage() } })

test('same product can be added independently; identity collisions and invalid configurations are rejected', () => {
  const a = item('a'), b = item('b'), royal = item('royal', 'royal')
  const order = addItem(addItem(addItem(empty(), a), b), royal)
  assert.deepEqual(order.items.map((entry) => entry.itemId), ['a', 'b', 'royal'])
  assert.equal(order.items[0].unitPriceCents, 1690)
  assert.equal(inspectOrder(order).totalCents, 1690 * 2 + 2190)
  assert.equal(addItem(order, a), order)
  assert.equal(addItem(order, { ...item('bad'), configuration: { variantId: null, selections: {} } }), order)
  assert.equal(addItem(order, { ...item('bad'), quantity: MAX_QUANTITY + 1 }), order)
  a.configuration.selections.extras.push('queso')
  assert.deepEqual(order.items[0].configuration.selections.extras, [])
  assert.notEqual(order.items[0].configuration, order.items[1].configuration)
})

test('edit replaces exactly the requested item without duplicates and recalculates all additions once', () => {
  const order = addItem(addItem(empty(), item('a')), item('b'))
  const configuration = defaultConfiguration(getConfigurableProduct('cheese'))
  configuration.variantId = 'grande'
  configuration.selections.papas = ['grandes']
  configuration.selections.extras = ['queso']
  const updated = editItem(order, 'a', configuration, 2)
  assert.deepEqual(updated.items.map((entry) => entry.itemId), ['a', 'b'])
  assert.equal(updated.items[0].unitPriceCents, 2640)
  assert.equal(inspectOrder(updated).totalCents, 5280 + 1690)
  assert.deepEqual(updated.items[0].configuration, configuration)
  assert.equal(updated.items[1], order.items[1])
  assert.equal(order.items[0].quantity, 1)
  assert.equal(editItem(order, 'missing', configuration, 2), order)
  assert.equal(editItem(order, 'a', { ...configuration, variantId: 'unknown' }, 2), order)
  configuration.selections.extras.length = 0
  assert.deepEqual(updated.items[0].configuration.selections.extras, ['queso'])
})

test('quantity reducer reuses valid limits, preserves item identity and uses recalculated prices', () => {
  let state = appReducer(createInitialState(), { type: 'cart/add', item: item('a') })
  for (const quantity of [2, MAX_QUANTITY, 1]) {
    state = appReducer(state, { type: 'cart/quantity', itemId: 'a', quantity })
    assert.equal(state.order.items.length, 1)
    assert.equal(state.order.items[0].itemId, 'a')
    assert.equal(inspectOrder(state.order).totalCents, 1690 * quantity)
  }
  for (const quantity of [0, -1, 1.5, NaN, MAX_QUANTITY + 1]) {
    assert.equal(appReducer(state, { type: 'cart/quantity', itemId: 'a', quantity }), state)
  }
})

test('Undo restores exact identity, configuration, quantity and original position, once only', () => {
  let state = createInitialState()
  for (const id of ['a', 'b', 'c']) state = appReducer(state, { type: 'cart/add', item: item(id, 'cheese', 2) })
  const original = structuredClone(state.order)
  state = appReducer(state, { type: 'cart/remove', itemId: 'b' })
  const deletion = state.toasts.find((toast) => toast.removed)
  assert.deepEqual(state.order.items.map((entry) => entry.itemId), ['a', 'c'])
  assert.equal(deletion.removed.index, 1)
  state = appReducer(state, { type: 'cart/undo', toastId: deletion.id })
  assert.deepEqual(state.order, original)
  assert.ok(state.cartAnnouncement.includes('restaurada'))
  assert.equal(appReducer(state, { type: 'cart/undo', toastId: deletion.id }), state)
})

test('multiple removals retain surviving neighbour positions in either undo order and with new additions', () => {
  const order = ['a', 'b', 'c', 'd'].reduce((draft, id) => addItem(draft, item(id)), empty())
  const first = removeItem(order, 'b')
  const second = removeItem(first.order, 'c')
  for (const snapshots of [[first.removed, second.removed], [second.removed, first.removed]]) {
    const result = snapshots.reduce(restoreItem, addItem(second.order, item('new')))
    assert.deepEqual(result.items.map((entry) => entry.itemId), ['a', 'b', 'c', 'd', 'new'])
    assert.equal(restoreItem(result, first.removed), result)
  }
  assert.equal(removeItem(order, 'unknown').order, order)
})

test('Undo after a local change preserves selections, recalculates and marks incompatibilities', () => {
  const original = item('a', 'cheese', 2)
  original.configuration.variantId = 'grande'
  original.configuration.selections.extras = ['tocino']
  const removed = removeItem(addItem(empty(), original), 'a')
  const restored = restoreItem({ ...removed.order, locationId: 'demo-norte' }, removed.removed)
  assert.equal(restored.items[0].itemId, 'a')
  assert.deepEqual(restored.items[0].configuration, original.configuration)
  assert.equal(restored.items[0].quantity, 2)
  assert.equal(restored.items[0].unitPriceCents, 2340)
  assert.equal(inspectOrder(restored).canContinue, false)
  assert.ok(inspectOrder(restored).items[0].issues.length >= 2)
})

test('round-trip recovery never trusts saved prices and retains exact configuration and quantity', () => {
  const selected = item('a', 'cheese', 3)
  selected.configuration.selections.extras = ['queso']
  const draft = addItem(empty(), selected)
  draft.items[0].unitPriceCents = 999999
  assert.equal(saveOrder(draft).ok, true)
  const raw = window.localStorage.getItem(STORAGE_KEYS.order)
  const recovered = recoverOrder(readOrder(), empty())
  assert.equal(recovered.message, 'Restauramos tu pedido anterior.')
  assert.equal(recovered.order.items[0].unitPriceCents, 1940)
  assert.deepEqual(recovered.order.items[0].configuration, selected.configuration)
  assert.equal(inspectOrder(recovered.order).totalCents, 5820)
  assert.equal(window.localStorage.getItem(STORAGE_KEYS.order), raw, 'recovery must not write on mount')
})

test('unknown products, stale groups/options, invalid quantities and unknown local stay visible and block continuation', () => {
  const cases = [
    { ...item('a'), productId: 'removed-product' },
    { ...item('a'), quantity: MAX_QUANTITY + 1 },
    { ...item('a'), configuration: { variantId: 'mediana', selections: { old: ['option'] } } },
  ]
  for (const entry of cases) {
    const recovered = recoverOrder(ok({ ...empty(), items: [entry] }), empty())
    assert.equal(recovered.order.items.length, 1)
    assert.deepEqual(recovered.order.items[0].configuration, entry.configuration)
    assert.equal(recovered.order.items[0].itemId, 'a')
    assert.equal(inspectOrder(recovered.order).canContinue, false)
    assert.equal(inspectOrder(recovered.order).totalCents, null)
    assert.ok(recovered.message.includes('requieren actualización'))
  }
  const recovered = recoverOrder(ok({ ...empty(), locationId: 'unknown', items: [item('a')] }), empty())
  assert.equal(recovered.order.locationId, 'unknown')
  assert.equal(inspectOrder(recovered.order).canContinue, false)
  assert.equal(inspectOrder(recovered.order).totalCents, 1690)
})

test('duplicate recovered identities are repaired deterministically without losing or merging items', () => {
  const saved = { ...empty(), items: [item('a'), item('a'), item('a-recuperado-1')] }
  const result = recoverOrder(ok(saved), empty())
  assert.equal(result.order.items.length, 3)
  assert.equal(new Set(result.order.items.map((entry) => entry.itemId)).size, 3)
  assert.equal(result.order.items[0].itemId, 'a')
  assert.deepEqual(recoverOrder(ok(saved), empty()).order, result.order)
  assert.deepEqual(saved.items.map((entry) => entry.itemId), ['a', 'a', 'a-recuperado-1'])
  assert.ok(result.message.includes('identificadores repetidos'))
  assert.equal(prepareLocationChange('demo-centro', result.order, ok(saved), true).ok, true)
})

test('broken JSON, incompatible schema/catalog and blocked storage recover safely without writes', () => {
  for (const raw of ['{broken', JSON.stringify({ schemaVersion: 99, data: empty() }),
    JSON.stringify({ schemaVersion: 1, data: { ...empty(), catalogVersion: 99, items: [item('a')] } })]) {
    window.localStorage.setItem(STORAGE_KEYS.order, raw)
    const recovered = recoverOrder(readOrder(), empty())
    assert.deepEqual(recovered.order, empty())
    assert.ok(recovered.message.length)
    assert.equal(window.localStorage.getItem(STORAGE_KEYS.order), raw)
    assert.equal(addItem(recovered.order, item('new')).items.length, 1)
  }
  Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked') } })
  const recovered = recoverOrder(readOrder(), empty())
  assert.ok(recovered.message.includes('temporal'))
  assert.equal(addItem(recovered.order, item('new')).items.length, 1)
  assert.equal(saveOrder(recovered.order).ok, false)
  assert.equal(clearStoredOrder().ok, false)
})

test('local changes require acknowledgement, retain affected items, block continuation and can be corrected', () => {
  const a = item('a')
  a.configuration.variantId = 'grande'
  a.configuration.selections.papas = ['grandes']
  const order = addItem(addItem(empty(), a), item('b', 'royal'))
  const original = structuredClone(order)
  assert.equal(prepareLocationChange('demo-centro', order, ok(order)).ok, false)
  const changed = prepareLocationChange('demo-centro', order, ok(order), true)
  assert.equal(changed.ok, true)
  assert.deepEqual(changed.order.items, order.items)
  const inspected = inspectOrder(changed.order)
  assert.equal(inspected.canContinue, false)
  assert.ok(inspected.items[0].issues.some((issue) => issue.includes('grande')))
  assert.equal(inspected.items[1].issues.length, 0)
  assert.deepEqual(order, original)
  const fixed = editItem(changed.order, 'a', defaultConfiguration(getConfigurableProduct('cheese')), 1)
  assert.equal(inspectOrder(fixed).canContinue, true)
  const north = prepareLocationChange('demo-norte', order, ok(order), true)
  assert.ok(inspectOrder(north.order).items[1].issues.length, 'Royal is unavailable in Norte')
})

test('local guard protects divergent saved orders and permits a temporary order when storage is blocked', () => {
  const order = addItem(empty(), item('a'))
  const different = addItem(order, item('b'))
  assert.equal(prepareLocationChange('demo-centro', order, ok(different), true).ok, false)
  assert.equal(prepareLocationChange('demo-centro', empty(), ok(order), true).ok, false)
  assert.equal(prepareLocationChange('demo-centro', order, { status: 'invalid', value: null }, true).ok, false)
  assert.equal(prepareLocationChange('demo-centro', order, { status: 'unavailable', value: null }, true).ok, true)
  const stalePrice = structuredClone(order)
  stalePrice.items[0].unitPriceCents = 1
  assert.equal(prepareLocationChange('demo-centro', order, ok(stalePrice), true).ok, true)
})
