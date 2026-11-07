import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { createServer } from 'vite'
import { configurableProducts, getConfigurableProduct } from '../src/data/customizations.ts'
import { productAvailability } from '../src/data/availability.ts'
import { locations } from '../src/data/locations.ts'
import { createInitialState } from '../src/state/appState.ts'
import { optionAvailability } from '../src/data/availability.ts'

test('configuration markup varies by product and starts with one active stage without marking defaults complete', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null } })
  try {
    const { ProductConfigurator } = await server.ssrLoadModule('/src/features/customization/ProductConfigurator.tsx')
    const { AppContext } = await server.ssrLoadModule('/src/state/AppContext.ts')
    for (const product of configurableProducts) {
      const state = createInitialState()
      state.order.locationId = locations.find((location) => productAvailability(product, location.id).available).id
      const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(AppContext.Provider, { value: { state, dispatch() {} } }, createElement(ProductConfigurator, { product }))))
      const expectedGroups = product.optionGroups.length + (product.variants.length ? 1 : 0)
      assert.equal((html.match(/class="config-group"/g) ?? []).length, expectedGroups ? 1 : 0, product.id)
      assert.equal((html.match(/data-state=/g) ?? []).length, expectedGroups + 1, product.id)
      assert.equal((html.match(/aria-current="step"/g) ?? []).length, 1, product.id)
      assert.ok(!html.includes('data-state="completed"'))
      assert.ok(html.includes(expectedGroups ? 'Continuar' : 'Agregar al pedido'))
      assert.equal(html.includes('>Agregar al pedido<'), expectedGroups === 0)
      assert.ok(!html.includes('Guardar cambios'))
      assert.equal((html.match(/<form /g) ?? []).length, 1, 'no nested location form')
    }
    const { OptionGroup } = await server.ssrLoadModule('/src/features/customization/OptionGroup.tsx')
    const cheese = getConfigurableProduct('cheese')
    const potatoes = renderToStaticMarkup(createElement(OptionGroup, { group: cheese.optionGroups.find((group) => group.id === 'papas'), fieldId: 'group-cheese-papas', selectedIds: ['medianas'], errors: [],
      availability: (id) => optionAvailability(cheese, 'papas', id, 'san-miguel'), onChange() {}, onViewLocations() {} }))
    assert.ok(potatoes.includes('Papas rústicas agotadas en Bembos San Miguel'))
    assert.match(potatoes, /id="group-cheese-papas-rusticas"[^>]*disabled=""/)
    assert.ok(potatoes.includes('Ver locales'))
  } finally { await server.close() }
})

test('unknown product, sold-out product and missing cart item have explicit states', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null } })
  try {
    const { CustomizePage } = await server.ssrLoadModule('/src/pages/CustomizePage.tsx')
    const { ProductConfigurator } = await server.ssrLoadModule('/src/features/customization/ProductConfigurator.tsx')
    const { AppContext } = await server.ssrLoadModule('/src/state/AppContext.ts')
    const context = { state: createInitialState(), dispatch() {} }
    const unknown = renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: ['/productos/unknown/personalizar'] }, createElement(AppContext.Provider, { value: context }, createElement(Routes, null,
      createElement(Route, { path: '/productos/:productId/personalizar', element: createElement(CustomizePage) })))))
    assert.ok(unknown.includes('Producto no encontrado'))
    const edit = renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: ['/pedido/demo/editar'] }, createElement(AppContext.Provider, { value: context }, createElement(Routes, null,
      createElement(Route, { path: '/pedido/:itemId/editar', element: createElement(CustomizePage) })))))
    assert.ok(edit.includes('Ítem no encontrado'))
    assert.ok(!edit.includes('Guardar cambios'))
    const state = createInitialState()
    state.order.locationId = 'demo-norte'
    const soldOut = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(AppContext.Provider, { value: { state, dispatch() {} } },
      createElement(ProductConfigurator, { product: getConfigurableProduct('royal') }))))
    assert.ok(soldOut.includes('Producto agotado en este local'))
    assert.ok(soldOut.includes('Ver otros locales'))
    assert.ok(!soldOut.includes('class="configuration-form"'))
  } finally { await server.close() }
})

test('dialog markup declares a native dialog and an associated title; interaction is not simulated', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null } })
  try {
    const { AccessibleModal } = await server.ssrLoadModule('/src/components/ui/AccessibleModal.tsx')
    const html = renderToStaticMarkup(createElement(AccessibleModal, { open: true, title: 'Cambiar de local', onClose() {} }, createElement('button', { type: 'button' }, 'Mantener local actual')))
    const titleId = html.match(/aria-labelledby="([^"]+)"/)[1]
    assert.ok(html.startsWith('<dialog'))
    assert.ok(html.includes('role="dialog"'))
    assert.ok(html.includes('aria-modal="true"'))
    assert.ok(html.includes(`id="${titleId}"`))
    assert.ok(html.includes('Cambiar de local'))
    // SSR does not run showModal, focus, inertness, Tab wrapping or Escape.
  } finally { await server.close() }
})
