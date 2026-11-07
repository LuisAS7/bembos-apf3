import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { test } from 'node:test'
import { products, categoryLabels } from '../src/data/catalog.ts'
import { locations, isProductAvailable } from '../src/data/locations.ts'
import { filterProducts, formatPrice } from '../src/features/catalog/filterProducts.ts'
import { prepareLocationChange } from '../src/features/locations/prepareLocationChange.ts'
import { createInitialState } from '../src/state/appState.ts'

test('catalog has 20 unique products, four per original category and two per new category, with local images and explicit provenance', () => {
  assert.equal(products.length, 20)
  assert.equal(new Set(products.map((product) => product.id)).size, 20)
  assert.equal(new Set(products.map((product) => product.slug)).size, 20)
  for (const category of Object.keys(categoryLabels)) {
    assert.equal(products.filter((product) => product.category === category).length, ['hamburguesas', 'combos', 'promociones'].includes(category) ? 4 : 2)
  }
  for (const product of products) {
    assert.ok(Number.isSafeInteger(product.basePriceCents) && product.basePriceCents > 0)
    assert.ok(product.image.alt && product.source.reference)
    assert.ok(existsSync(new URL(`../public${product.image.src}`, import.meta.url)))
    assert.ok(['apf2', 'academic-mock'].includes(product.source.kind))
  }
  assert.equal(products.filter((product) => product.source.kind === 'academic-mock').length, 18)
})

test('APF2 names and prices remain Cheese S/16.90 and Royal S/21.90', () => {
  assert.deepEqual(products.filter((product) => product.source.kind === 'apf2').map(({ name, basePriceCents }) => [name, basePriceCents]),
    [['Cheese', 1690], ['Royal', 2190]])
  assert.equal(formatPrice(1690), 'S/16.90')
  assert.equal(formatPrice(2190), 'S/21.90')
})

test('APF2 photograph bytes match the embedded original; no remote image requests are required', () => {
  const pdf = readFileSync(new URL('../docs/APF2_Grupo6_Bembos.pdf', import.meta.url)).toString('latin1')
  const object = pdf.match(/\b87\s+0\s+obj\b([\s\S]*?)endobj/)[1]
  const stream = object.match(/stream\r?\n([\s\S]*?)\r?\nendstream/)[1]
  assert.deepEqual(readFileSync(new URL('../public/images/products/apf2-menu.jpg', import.meta.url)), Buffer.from(stream, 'latin1'))
  assert.ok(products.every((product) => product.image.src.startsWith('/images/official/')))
  assert.ok(new Set(products.map((product) => product.image.src)).size >= 10)
})

test('search ignores case, accents and outer spaces and crosses the three categories', () => {
  assert.deepEqual(filterProducts(products, '  CHÉESE  ', 'all').map((product) => product.category), ['hamburguesas', 'combos', 'promociones'])
  assert.equal(filterProducts(products, '  ClÁSica  ', 'all').length, 3)
  assert.equal(filterProducts(products, 'promociones', 'all').length, 4)
  assert.equal(filterProducts(products, 'huevo', 'all')[0].id, 'royal')
})

test('category combines with search, no matches returns empty, and clearing restores the category', () => {
  assert.deepEqual(filterProducts(products, 'Royal', 'combos').map((product) => product.id), ['combo-royal-demo'])
  assert.equal(filterProducts(products, 'producto inexistente', 'all').length, 0)
  assert.equal(filterProducts(products, '', 'combos').length, 4)
  assert.equal(filterProducts(products, '', 'all').length, 20)
})

test('availability changes by location and unknown references are unavailable', () => {
  const knownIds = new Set(products.map((product) => product.id))
  assert.equal(locations.length, 3)
  for (const location of locations) assert.ok(location.availableProductIds.every((id) => knownIds.has(id)))
  assert.equal(isProductAvailable('royal', 'san-miguel'), true)
  assert.equal(isProductAvailable('royal', 'demo-norte'), false)
  assert.equal(isProductAvailable('bbq-demo', 'san-miguel'), false)
  assert.equal(isProductAvailable('bbq-demo', 'demo-centro'), true)
  assert.equal(isProductAvailable('unknown', 'san-miguel'), false)
  assert.equal(isProductAvailable('cheese', 'unknown'), false)
})

test('empty-order location selection does not mutate data or erase snapshot metadata', () => {
  const current = createInitialState().order
  const stored = { ...current, catalogVersion: 2 }
  const result = prepareLocationChange('demo-centro', current, { status: 'ok', value: stored })
  assert.equal(result.ok, true)
  assert.equal(result.order.locationId, 'demo-centro')
  assert.equal(result.order.catalogVersion, 2)
  assert.equal(current.locationId, 'san-miguel')
  assert.equal(stored.locationId, 'san-miguel')
  assert.equal(prepareLocationChange('demo-norte', current, { status: 'missing', value: null }).ok, true)
})

test('location selection protects existing cart snapshots and invalid/unavailable storage', () => {
  const current = createInitialState().order
  const stored = { ...current, items: [{ itemId: 'saved', productId: 'cheese', quantity: 2,
    unitPriceCents: 1690, configuration: { variantId: null, selections: {} } }] }
  const before = structuredClone(stored)
  assert.equal(prepareLocationChange('demo-centro', current, { status: 'ok', value: stored }).ok, false)
  assert.equal(prepareLocationChange('demo-centro', stored, { status: 'missing', value: null }).ok, false)
  assert.deepEqual(stored, before)
  for (const status of ['invalid', 'unavailable']) {
    assert.equal(prepareLocationChange('demo-centro', current, { status, value: null }).ok, false)
  }
  assert.equal(prepareLocationChange('unknown', current, { status: 'missing', value: null }).ok, false)
})

test('critical catalog color-token pairs meet the specified contrast thresholds', () => {
  const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8')
  const colors = Object.fromEntries([...css.matchAll(/--color-([\w-]+):\s*(#[0-9a-f]{6})/g)].map((match) => [match[1], match[2]]))
  function luminance(hex) {
    const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255)
      .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
  }
  for (const [foreground, background, threshold] of [
    ['text', 'action', 4.5], ['brand', 'surface', 4.5], ['text-muted', 'surface', 4.5],
    ['text-muted', 'background', 4.5], ['success', 'surface', 4.5], ['error', 'surface', 4.5],
    ['border', 'surface', 3], ['brand', 'background', 3], ['action', 'text', 3],
  ]) {
    const [dark, light] = [luminance(colors[foreground]), luminance(colors[background])].sort((a, b) => a - b)
    assert.ok((light + 0.05) / (dark + 0.05) >= threshold, `${foreground} / ${background}`)
  }
})
