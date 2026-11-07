import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'
import { configurableProducts, getConfigurableProduct } from '../src/data/customizations.ts'
import { categoryLabels } from '../src/data/catalog.ts'
import { defaultConfiguration, evaluateConfiguration } from '../src/features/customization/configuration.ts'
import { configurationStages, inspectProgress, advanceProgress } from '../src/features/customization/progress.ts'
import { productAvailability } from '../src/data/availability.ts'
import { locations } from '../src/data/locations.ts'
import { createInitialState } from '../src/state/appState.ts'

test('mobile final action shares actual progress validation for every product and cannot skip unreviewed stages', () => {
  for (const product of configurableProducts) {
    const stages = configurationStages(product)
    const configuration = defaultConfiguration(product)
    const location = locations.find((entry) => productAvailability(product, entry.id).available).id
    const result = evaluateConfiguration(product, configuration, 1, location)
    let progress = { current: 0, reviewed: {} }
    assert.equal(inspectProgress(stages, progress, configuration, '1', location, result).canSubmit, stages.length === 1)
    for (let index = 0; index < stages.length - 1; index++) {
      assert.equal(inspectProgress(stages, progress, configuration, '1', location, result).canSubmit, false)
      const next = advanceProgress(stages, progress, configuration, '1', location, result)
      assert.equal(next.ready, false)
      progress = next.progress
    }
    assert.equal(inspectProgress(stages, progress, configuration, '1', location, result).canSubmit, true)
    assert.equal(advanceProgress(stages, progress, configuration, '1', location, result).ready, true)
    const invalid = evaluateConfiguration(product, configuration, 100, location)
    assert.equal(inspectProgress(stages, progress, configuration, '100', location, invalid).canSubmit, false)
    if (stages.length > 1) {
      const before = structuredClone(configuration)
      assert.equal(inspectProgress(stages, { ...progress, current: 0 }, configuration, '1', location, result).canSubmit, false)
      assert.deepEqual(configuration, before)
      const differentLocation = locations.find((entry) => entry.id !== location).id
      assert.equal(inspectProgress(stages, progress, configuration, '1', differentLocation,
        evaluateConfiguration(product, configuration, 1, differentLocation)).canSubmit, false)
    }
  }
})

test('category strip preserves seven native choices, selected image/label and named scroll controls', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null } })
  try {
    const { CategoryCarousel } = await server.ssrLoadModule('/src/features/catalog/CategoryCarousel.tsx')
    const html = renderToStaticMarkup(createElement(CategoryCarousel, { selected: 'loncheritas', onSelect() {} }))
    assert.equal((html.match(/type="radio"/g) ?? []).length, 7)
    assert.equal((html.match(/<img /g) ?? []).length, 7)
    assert.equal((html.match(/checked=""/g) ?? []).length, 1)
    assert.match(html, /<input(?=[^>]*value="loncheritas")(?=[^>]*checked="")[^>]*>/)
    for (const label of Object.values(categoryLabels)) assert.ok(html.includes(label))
    assert.ok(html.includes('aria-label="Ver categorías anteriores"'))
    assert.ok(html.includes('aria-label="Ver categorías siguientes"'))
    const controls = [...html.matchAll(/aria-controls="([^"]+)"/g)].map((match) => match[1])
    assert.equal(controls.length, 2)
    assert.equal(controls[0], controls[1])
    assert.ok(html.includes(`id="${controls[0]}" class="category-options"`))
    assert.ok(!html.includes('role="tab"') && !html.includes('aria-selected'))
    // SSR does not execute touch/trackpad/keyboard scrolling or focus visibility.
  } finally { await server.close() }
})

test('configuration has one quantity control, a blocked pending final action and full product description', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null } })
  try {
    const { ProductConfigurator } = await server.ssrLoadModule('/src/features/customization/ProductConfigurator.tsx')
    const { AppContext } = await server.ssrLoadModule('/src/state/AppContext.ts')
    const product = getConfigurableProduct('combo-cheese-demo')
    const state = createInitialState()
    const render = (props) => renderToStaticMarkup(createElement(MemoryRouter, null, createElement(AppContext.Provider, { value: { state, dispatch() {} } }, createElement(ProductConfigurator, { product, ...props }))))
    const html = render()
    assert.ok(html.includes(product.description))
    assert.ok(html.includes('data-page-action-bar="" data-final="false"'))
    assert.equal((html.match(/<output /g) ?? []).length, 1)
    assert.match(html, /class="button configuration-submit"[^>]*disabled=""[^>]*>Agregar al pedido/)
    assert.ok(html.includes('etapas por revisar'))
    assert.ok(html.includes('>Continuar<'))
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1])
    assert.equal(new Set(ids).size, ids.length)
    const item = { itemId: 'same-item', productId: product.id, quantity: 3, unitPriceCents: 2490, configuration: defaultConfiguration(product) }
    const before = structuredClone(item)
    const edit = render({ item })
    assert.match(edit, /class="button configuration-submit"[^>]*disabled=""[^>]*>Guardar cambios/)
    assert.ok(!edit.includes('>Agregar al pedido<'))
    assert.ok(edit.includes('>3</output>'))
    assert.deepEqual(item, before)
  } finally { await server.close() }
})

test('cart keeps closed configuration details, full names and visible restrictions outside them', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null } })
  try {
    const { CartPage } = await server.ssrLoadModule('/src/pages/CartPage.tsx')
    const { AppContext } = await server.ssrLoadModule('/src/state/AppContext.ts')
    const state = createInitialState()
    const product = getConfigurableProduct('cheese')
    const configuration = defaultConfiguration(product)
    configuration.variantId = 'grande'
    state.order.items = [{ itemId: 'a', productId: product.id, quantity: 2, unitPriceCents: 1990, configuration }]
    const render = () => renderToStaticMarkup(createElement(MemoryRouter, null, createElement(AppContext.Provider, { value: { state, dispatch() {} } }, createElement(CartPage))))
    const html = render()
    assert.ok(html.indexOf('Seguir agregando productos') < html.indexOf('class="cart-items"'))
    assert.ok(html.indexOf('Cheese grande</h2>') < html.indexOf('<details'))
    assert.match(html, /<details class="cart-item-details"><summary>Ver detalles/)
    assert.ok(!/<details[^>]*open/.test(html))
    assert.ok(html.includes('class="cart-action-bar mobile-action-bar" data-page-action-bar=""'))
    assert.ok(html.includes('S/39.80'))
    assert.equal((html.match(/>Continuar al pago</g) ?? []).length, 1)
    state.order.locationId = 'demo-centro'
    const incompatible = render()
    const detailEnd = incompatible.indexOf('</details>')
    assert.ok(incompatible.indexOf('class="cart-restrictions"') > detailEnd)
    assert.ok(incompatible.includes('Requiere actualización'))
    assert.ok(!incompatible.includes('href="/pagar"'))
    assert.match(incompatible, /<button[^>]*disabled=""[^>]*>Continuar al pago/)
    state.order.items = []
    assert.ok(!render().includes('data-page-action-bar=""'))
    // Layout, reserved safe-area space and real focus remain manual checks.
  } finally { await server.close() }
})

test('combo descriptions state included quantities and implemented alternatives; optional sides are not implied as included', () => {
  for (const product of configurableProducts.filter((entry) => entry.category === 'combos')) {
    assert.ok(product.description.includes('1 porción de papas'))
    assert.ok(product.description.includes('1 bebida'))
    const main = product.optionGroups.find((group) => group.id === 'principal')
    for (const option of main.options) assert.ok(product.description.includes(option.label))
  }
  assert.match(getConfigurableProduct('duo-cheese-demo').description, /añadir papas/)
  assert.ok(!getConfigurableProduct('duo-royal-demo').description.includes('papas'))
  assert.match(getConfigurableProduct('familiar-demo').description, /Papas para compartir como adicional/)
  assert.match(getConfigurableProduct('loncherita-nuggets-demo').description, /^4 nuggets/)
})
