import assert from 'node:assert/strict'
import { test } from 'node:test'
import { configurableProducts, getConfigurableProduct } from '../src/data/customizations.ts'
import { localRestrictions, productAvailability, variantAvailability, optionAvailability } from '../src/data/availability.ts'
import { locations } from '../src/data/locations.ts'
import { defaultConfiguration, evaluateConfiguration, MAX_QUANTITY } from '../src/features/customization/configuration.ts'

const cheese = getConfigurableProduct('cheese')

test('every product has consistent, independent configuration data and explicit provenance', () => {
  assert.equal(configurableProducts.length, 12)
  for (const product of configurableProducts) {
    assert.equal(new Set(product.optionGroups.map((group) => group.id)).size, product.optionGroups.length)
    assert.ok(product.optionGroups.every((group) => group.id !== 'variant'))
    assert.equal(new Set(product.variants.map((variant) => variant.id)).size, product.variants.length)
    for (const variant of product.variants) {
      assert.ok(Number.isSafeInteger(variant.additionalPriceCents) && variant.additionalPriceCents >= 0)
      assert.ok(variant.source.reference)
    }
    for (const group of product.optionGroups) {
      assert.equal(new Set(group.options.map((option) => option.id)).size, group.options.length)
      assert.ok(group.defaultOptionIds.every((id) => group.options.some((option) => option.id === id)))
      assert.ok(group.defaultOptionIds.length >= group.min && group.defaultOptionIds.length <= group.max)
      for (const option of group.options) {
        assert.ok(Number.isSafeInteger(option.additionalPriceCents) && option.additionalPriceCents >= 0)
        assert.ok(option.source.reference)
      }
    }
  }
})

test('burgers, combos and promotions expose only applicable stages', () => {
  assert.equal(cheese.variants.length > 0, true)
  assert.deepEqual(cheese.optionGroups.map((group) => group.id), ['papas', 'salsas', 'ingredientes', 'extras'])
  const combo = getConfigurableProduct('combo-cheese-demo')
  assert.equal(combo.variants.length, 0)
  assert.deepEqual(combo.optionGroups.map((group) => group.id), ['principal', 'papas', 'bebida', 'salsas', 'extras'])
  assert.deepEqual(getConfigurableProduct('duo-royal-demo').optionGroups.map((group) => group.id), ['salsas'])
  assert.equal(getConfigurableProduct('familiar-demo').variantLabel, 'Presentación')
})

test('APF2 Cheese size and potato price points are preserved', () => {
  assert.equal(cheese.basePriceCents, 1690)
  assert.deepEqual(cheese.variants.map((variant) => variant.additionalPriceCents), [0, 300])
  assert.deepEqual(cheese.optionGroups.find((group) => group.id === 'papas').options.map((option) => option.additionalPriceCents), [0, 400, 400])
  assert.ok(cheese.variants.every((variant) => variant.source.kind === 'apf2'))
  assert.ok(cheese.optionGroups.find((group) => group.id === 'extras').options.every((option) => option.source.kind === 'academic-mock'))
})

test('default configurations are valid at a location where the product is available', () => {
  for (const product of configurableProducts) {
    const location = locations.find((entry) => productAvailability(product, entry.id).available)
    const result = evaluateConfiguration(product, defaultConfiguration(product), 1, location.id)
    assert.deepEqual(result.issues, [], product.id)
    assert.equal(result.unitPriceCents, product.basePriceCents)
  }
})

test('size, side and extra are charged once each, then multiplied by quantity', () => {
  const configuration = defaultConfiguration(cheese)
  configuration.selections.papas = ['grandes']
  configuration.selections.extras = ['queso']
  assert.equal(evaluateConfiguration(cheese, configuration, 1, 'san-miguel').totalCents, 2340)
  configuration.variantId = 'grande'
  const result = evaluateConfiguration(cheese, configuration, 2, 'san-miguel')
  assert.deepEqual(result.issues, [])
  assert.equal(result.unitPriceCents, 2640)
  assert.equal(result.totalCents, 5280)
  assert.equal(result.lines.filter((line) => line.label === 'Extra queso').length, 1)
})

test('combo additions and promotion-unit additions do not multiply by internal products', () => {
  const combo = getConfigurableProduct('combo-cheese-demo')
  const configuration = defaultConfiguration(combo)
  configuration.selections.principal = ['alternativo']
  configuration.selections.papas = ['grandes']
  configuration.selections.bebida = ['limonada']
  configuration.selections.extras = ['queso']
  // Limonada is available in Demo Centro, but large potatoes are not; Norte permits both.
  assert.equal(evaluateConfiguration(combo, configuration, 2, 'demo-norte').totalCents, 7280)
  const promotion = getConfigurableProduct('duo-cheese-demo')
  const promoConfiguration = defaultConfiguration(promotion)
  promoConfiguration.selections.extras = ['papas-compartir']
  assert.equal(evaluateConfiguration(promotion, promoConfiguration, 3, 'san-miguel').totalCents, 10170)
})

test('family presentation is a separate variant and its additional is counted once', () => {
  const product = getConfigurableProduct('familiar-demo')
  const configuration = defaultConfiguration(product)
  configuration.variantId = 'cuatro'
  configuration.selections.extras = ['papas-compartir']
  assert.equal(evaluateConfiguration(product, configuration, 2, 'san-miguel').totalCents, 15780)
})

test('duplicates, foreign groups, unknown variants and unknown options invalidate the price', () => {
  const duplicate = defaultConfiguration(cheese)
  duplicate.selections.extras = ['queso', 'queso']
  assert.equal(evaluateConfiguration(cheese, duplicate, 1, 'san-miguel').totalCents, null)
  assert.ok(evaluateConfiguration(cheese, duplicate, 1, 'san-miguel').issues.some((issue) => issue.message.includes('repetidas')))
  for (const change of [
    (config) => { config.selections.variant = ['grande'] },
    (config) => { config.variantId = 'unknown' },
    (config) => { config.selections.extras = ['unknown'] },
  ]) {
    const configuration = defaultConfiguration(cheese)
    change(configuration)
    assert.equal(evaluateConfiguration(cheese, configuration, 1, 'san-miguel').totalCents, null)
  }
})

test('required groups, multi-select limits and malformed configurations are rejected', () => {
  const required = defaultConfiguration(cheese)
  required.selections.papas = []
  assert.ok(evaluateConfiguration(cheese, required, 1, 'san-miguel').issues.some((issue) => issue.groupId === 'papas'))
  const tooMany = defaultConfiguration(cheese)
  tooMany.selections.salsas = ['mayonesa', 'ketchup', 'aji']
  assert.equal(evaluateConfiguration(cheese, tooMany, 1, 'san-miguel').totalCents, null)
  for (const malformed of [null, {}, { variantId: 'mediana', selections: [] }, { variantId: 'mediana', selections: { papas: null } }]) {
    assert.equal(evaluateConfiguration(cheese, malformed, 1, 'san-miguel').totalCents, null)
  }
})

test('invalid quantities and unsafe or fractional prices never produce a usable total', () => {
  for (const quantity of [0, -1, 1.5, NaN, Infinity, MAX_QUANTITY + 1]) {
    const result = evaluateConfiguration(cheese, defaultConfiguration(cheese), quantity, 'san-miguel')
    assert.equal(result.totalCents, null)
    assert.ok(result.issues.some((issue) => issue.field === 'quantity'))
  }
  assert.equal(evaluateConfiguration(cheese, defaultConfiguration(cheese), MAX_QUANTITY, 'san-miguel').totalCents, 1690 * MAX_QUANTITY)
  for (const price of [-1, 0.5, NaN, Number.MAX_SAFE_INTEGER]) {
    const changed = structuredClone(cheese)
    changed.basePriceCents = price
    assert.equal(evaluateConfiguration(changed, defaultConfiguration(changed), 2, 'san-miguel').totalCents, null)
  }
})

test('potato restriction is explained before selection and changes by local', () => {
  const status = optionAvailability(cheese, 'papas', 'rusticas', 'san-miguel')
  assert.equal(status.available, false)
  assert.ok(status.reason.includes('Papas rústicas'))
  assert.equal(optionAvailability(cheese, 'papas', 'rusticas', 'demo-centro').available, true)
  const configuration = defaultConfiguration(cheese)
  configuration.selections.papas = ['rusticas']
  assert.equal(evaluateConfiguration(cheese, configuration, 1, 'san-miguel').totalCents, null)
  assert.equal(evaluateConfiguration(cheese, configuration, 1, 'demo-centro').totalCents, 2090)
})

test('changing local revalidates without mutating the prior configuration', () => {
  const configuration = defaultConfiguration(cheese)
  configuration.variantId = 'grande'
  configuration.selections.extras = ['tocino']
  const before = structuredClone(configuration)
  assert.equal(evaluateConfiguration(cheese, configuration, 1, 'san-miguel').issues.length, 0)
  const changed = evaluateConfiguration(cheese, configuration, 1, 'demo-norte')
  assert.equal(changed.totalCents, null)
  assert.ok(changed.issues.some((issue) => issue.field === 'variant' && issue.availability))
  assert.ok(changed.issues.some((issue) => issue.groupId === 'extras' && issue.availability))
  assert.deepEqual(configuration, before)
  const corrected = { ...configuration, variantId: 'mediana', selections: { ...configuration.selections, extras: [] } }
  assert.equal(evaluateConfiguration(cheese, corrected, 1, 'demo-norte').totalCents, 1690)
})

test('product, variant and option availability fail closed for unknown references', () => {
  assert.equal(getConfigurableProduct('unknown'), undefined)
  assert.equal(productAvailability(cheese, 'unknown').available, false)
  assert.equal(variantAvailability(cheese, 'unknown', 'san-miguel').available, false)
  assert.equal(optionAvailability(cheese, 'unknown', 'medianas', 'san-miguel').available, false)
  assert.equal(optionAvailability(cheese, 'papas', 'unknown', 'san-miguel').available, false)
  const royal = getConfigurableProduct('royal')
  assert.equal(productAvailability(royal, 'demo-norte').available, false)
  assert.equal(evaluateConfiguration(royal, defaultConfiguration(royal), 1, 'demo-norte').totalCents, null)
})

test('the complete local matrix has explanatory reasons and restrictions reference known choices', () => {
  for (const location of locations) for (const product of configurableProducts) {
    const statuses = [productAvailability(product, location.id), ...product.variants.map((variant) => variantAvailability(product, variant.id, location.id)),
      ...product.optionGroups.flatMap((group) => group.options.map((option) => optionAvailability(product, group.id, option.id, location.id)))]
    for (const status of statuses) {
      assert.equal(typeof status.available, 'boolean')
      if (!status.available) assert.ok(status.reason?.length > 0)
    }
  }
  for (const [locationId, restrictions] of Object.entries(localRestrictions)) {
    assert.ok(locations.some((location) => location.id === locationId))
    for (const [productId, variants] of Object.entries(restrictions.variants)) for (const variantId of Object.keys(variants)) {
      assert.ok(getConfigurableProduct(productId).variants.some((variant) => variant.id === variantId))
    }
    for (const [groupId, options] of Object.entries(restrictions.options)) for (const optionId of Object.keys(options)) {
      assert.ok(configurableProducts.some((product) => product.optionGroups.some((group) => group.id === groupId && group.options.some((option) => option.id === optionId))))
    }
  }
})
