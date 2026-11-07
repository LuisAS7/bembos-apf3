import assert from 'node:assert/strict'
import { test } from 'node:test'
import { products } from '../src/data/catalog.ts'
import { locations } from '../src/data/locations.ts'
import { getConfigurableProduct, configurableProducts } from '../src/data/customizations.ts'
import { productAvailability } from '../src/data/availability.ts'
import { menuProducts } from '../src/features/catalog/filterProducts.ts'
import { defaultConfiguration, evaluateConfiguration } from '../src/features/customization/configuration.ts'
import { configurationStages, inspectProgress, advanceProgress } from '../src/features/customization/progress.ts'
import { planLocationChange } from '../src/features/locations/prepareLocationChange.ts'
import { notificationDuration, notificationEntries, notificationPlan } from '../src/components/ui/notificationPlan.ts'
import { appReducer, createInitialState } from '../src/state/appState.ts'

const cheese = getConfigurableProduct('cheese')
function inspect(product, progress, configuration, quantity = '1', location = 'san-miguel') {
  return inspectProgress(configurationStages(product), progress, configuration, quantity, location, evaluateConfiguration(product, configuration, Number(quantity), location))
}
function advance(product, progress, configuration, quantity = '1', location = 'san-miguel') {
  return advanceProgress(configurationStages(product), progress, configuration, quantity, location, evaluateConfiguration(product, configuration, Number(quantity), location))
}

test('browsing starts per category but every nonempty search crosses all three, with case/accent normalization', () => {
  assert.equal(menuProducts(products, '', 'hamburguesas').length, 4)
  assert.ok(menuProducts(products, '', 'combos').every((product) => product.category === 'combos'))
  assert.deepEqual(menuProducts(products, ' CHÉESE ', 'promociones').map((product) => product.category), ['hamburguesas', 'combos', 'promociones'])
  assert.equal(menuProducts(products, 'not-found', 'hamburguesas').length, 0)
  assert.equal(menuProducts(products, ' ', 'promociones').length, 4)
})

test('default-valid selections and visited/forged future indices never count as reviewed stages', () => {
  const configuration = defaultConfiguration(cheese)
  const initial = { current: 0, reviewed: {} }
  assert.ok(inspect(cheese, initial, configuration).completed.every((value) => value === false))
  const skipped = { current: 5, reviewed: {} }
  assert.equal(inspect(cheese, skipped, configuration).current, 0)
  const next = advance(cheese, skipped, configuration)
  assert.equal(next.ready, false)
  assert.equal(Object.keys(next.progress.reviewed).length, 1)
})

test('every product has its own ordered groups and only explicit validated advances unlock the final action', () => {
  for (const product of configurableProducts) {
    const stages = configurationStages(product)
    assert.equal(stages.length, product.optionGroups.length + (product.variants.length ? 1 : 0) + 1)
    const location = locations.find((entry) => productAvailability(product, entry.id).available).id
    const configuration = defaultConfiguration(product)
    let progress = { current: 0, reviewed: {} }
    for (let index = 0; index < stages.length; index++) {
      const next = advance(product, progress, configuration, '1', location)
      assert.deepEqual(next.issues, [], product.id)
      assert.equal(next.ready, index === stages.length - 1, product.id)
      progress = next.progress
    }
    assert.ok(inspect(product, progress, configuration, '1', location).completed.every(Boolean))
  }
  assert.deepEqual(configurationStages(getConfigurableProduct('duo-royal-demo')).map((stage) => stage.id), ['group-salsas', 'summary'])
})

test('optional steps are explicitly completed without options; invalid stages do not advance or erase data', () => {
  const configuration = defaultConfiguration(cheese)
  let progress = advance(cheese, { current: 0, reviewed: {} }, configuration).progress
  configuration.selections.papas = ['rusticas']
  const before = structuredClone(configuration)
  const blocked = advance(cheese, progress, configuration)
  assert.equal(blocked.progress, progress)
  assert.ok(blocked.issues.some((issue) => issue.availability))
  assert.deepEqual(configuration, before)
  configuration.selections.papas = ['medianas']
  progress = advance(cheese, progress, configuration).progress
  configuration.selections.salsas = []
  const acceptedEmpty = advance(cheese, progress, configuration)
  assert.deepEqual(acceptedEmpty.issues, [])
  assert.ok(acceptedEmpty.progress.reviewed['group-salsas'])
  assert.deepEqual(configuration.selections.salsas, [])
})

test('backtracking preserves choices while changes recalculate price and invalidate the final summary review', () => {
  const configuration = defaultConfiguration(cheese)
  let progress = { current: 0, reviewed: {} }
  for (const _stage of configurationStages(cheese)) progress = advance(cheese, progress, configuration).progress
  configuration.variantId = 'grande'
  progress = { ...progress, current: 0 }
  const status = inspect(cheese, progress, configuration)
  assert.equal(status.completed[0], false)
  assert.equal(status.completed.at(-1), false)
  assert.equal(status.completed[1], true, 'unaffected reviewed potato choice remains valid')
  assert.equal(evaluateConfiguration(cheese, configuration, 2, 'san-miguel').totalCents, 3980)
})

test('local changes recheck completed choices and quantity errors are enforced at the final step', () => {
  const configuration = defaultConfiguration(cheese)
  let progress = { current: 0, reviewed: {} }
  const stages = configurationStages(cheese)
  for (let index = 0; index < stages.length - 1; index++) progress = advance(cheese, progress, configuration).progress
  assert.equal(inspect(cheese, progress, configuration, '1', 'demo-centro').current, 0)
  assert.ok(inspect(cheese, progress, configuration, '1', 'demo-centro').completed.every((value) => !value))
  const invalidQuantity = advance(cheese, progress, configuration, '100')
  assert.equal(invalidQuantity.ready, false)
  assert.ok(invalidQuantity.issues.some((issue) => issue.field === 'quantity'))
})

test('editing configuration survives the full review unchanged, including extras and quantity', () => {
  const configuration = defaultConfiguration(cheese)
  configuration.variantId = 'grande'
  configuration.selections.extras = ['queso']
  const before = structuredClone(configuration)
  let progress = { current: 0, reviewed: {} }, ready = false
  for (const _stage of configurationStages(cheese)) {
    const next = advance(cheese, progress, configuration, '3')
    progress = next.progress; ready = next.ready
  }
  assert.equal(ready, true)
  assert.deepEqual(configuration, before)
  assert.equal(evaluateConfiguration(cheese, configuration, 3, 'san-miguel').totalCents, 6720)
})

test('header location planning retains IDs, protects stored carts and explains both items and unsaved selections', () => {
  assert.deepEqual(locations.map((location) => location.id), ['san-miguel', 'demo-centro', 'demo-norte'])
  assert.deepEqual(locations.map((location) => location.name), ['Bembos San Miguel', 'Bembos Real Plaza', 'Bembos Mall del Sur'])
  const state = createInitialState()
  const configuration = defaultConfiguration(cheese)
  configuration.variantId = 'grande'
  state.order.items = [{ itemId: 'a', productId: 'cheese', configuration, quantity: 1, unitPriceCents: 1990 }]
  const before = structuredClone(state.order)
  const plan = planLocationChange('demo-centro', state.order, { status: 'ok', value: state.order }, { product: cheese, configuration, quantity: 1 })
  assert.equal(plan.blocked, false)
  assert.ok(plan.issues.some((issue) => issue.startsWith('Ítem 1: Cheese')))
  assert.ok(plan.issues.some((issue) => issue.startsWith('Cheese:')))
  assert.deepEqual(plan.order.items, before.items)
  assert.deepEqual(state.order, before, 'exploring a plan is read-only')
  const divergent = { ...state.order, items: [...state.order.items, { ...state.order.items[0], itemId: 'other' }] }
  assert.equal(planLocationChange('demo-centro', state.order, { status: 'ok', value: divergent }).blocked, true)
})

test('Sonner adapter plans one update per message, preserves indefinite Undo and updates its original identity', () => {
  let state = appReducer(createInitialState(), { type: 'cart/add', item: { itemId: 'a', productId: 'cheese', configuration: defaultConfiguration(cheese), quantity: 2, unitPriceCents: 1 } })
  state = appReducer(state, { type: 'cart/remove', itemId: 'a' })
  state.recoveryNotice = 'Restauramos tu pedido anterior.'
  const entries = notificationEntries(state)
  assert.equal(entries.length, 2)
  const first = notificationPlan(new Map(), entries)
  assert.equal(first.upsert.length, 2)
  assert.equal(notificationPlan(first.next, entries).upsert.length, 0)
  const removed = entries.find((entry) => entry.removed)
  assert.equal(notificationDuration(removed), Infinity)
  state = appReducer(state, { type: 'cart/undo', toastId: removed.id })
  const update = notificationPlan(first.next, notificationEntries(state))
  assert.equal(update.upsert.length, 1)
  assert.equal(update.upsert[0].id, removed.id)
  assert.equal(notificationDuration(update.upsert[0]), 6000)
  assert.equal(state.order.items[0].itemId, 'a')
  assert.equal(state.order.items[0].quantity, 2)
  const close = notificationPlan(update.next, [])
  assert.ok(close.remove.includes(removed.id))
})
