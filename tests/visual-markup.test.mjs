import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'
import { createInitialState } from '../src/state/appState.ts'

test('official resources are local and header uses a native explicit location dialog with one accessible logo name', async () => {
  const manifest = JSON.parse(readFileSync(new URL('../docs/recursos-visuales.json', import.meta.url)))
  assert.ok(manifest.resources.length >= 11)
  for (const resource of manifest.resources) {
    assert.ok(resource.url.startsWith('https://www.bembos.com.pe/'))
    assert.ok(existsSync(new URL(`../${resource.file}`, import.meta.url)))
  }
  const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null } })
  try {
    const { Header } = await server.ssrLoadModule('/src/components/layout/Header.tsx')
    const { AppContext } = await server.ssrLoadModule('/src/state/AppContext.ts')
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(AppContext.Provider, { value: { state: createInitialState(), dispatch() {} } }, createElement(Header))))
    assert.ok(html.includes('alt="Bembos, inicio"'))
    assert.match(html, /<a class="brand"[^>]*><img[^>]*src="\/images\/official\/logo.svg"/)
    assert.match(html, /<button class="header-location"[^>]*type="button"[^>]*aria-haspopup="dialog"[^>]*aria-expanded="false"/)
    assert.ok(html.includes('Bembos Real Plaza'))
    assert.ok(html.includes('Bembos Mall del Sur'))
    assert.ok(html.includes('Usar este local'))
    assert.ok(!html.includes('Aplicar local'))
    assert.ok(html.includes('role="dialog"'))
    assert.equal((html.match(/name="location"/g) ?? []).length, 3)
    assert.equal((html.match(/type="submit"/g) ?? []).length, 1)
    // Closed SSR dialog is not an interaction or focus test.
  } finally { await server.close() }
})

test('iteration 2 markup keeps native category controls, icon names, removable unavailable selections and no manual clearing', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null } })
  try {
    const { MenuPage } = await server.ssrLoadModule('/src/pages/MenuPage.tsx')
    const { CartPage } = await server.ssrLoadModule('/src/pages/CartPage.tsx')
    const { BottomNavigation } = await server.ssrLoadModule('/src/components/layout/BottomNavigation.tsx')
    const { QuantitySelector } = await server.ssrLoadModule('/src/features/customization/QuantitySelector.tsx')
    const { OptionGroup } = await server.ssrLoadModule('/src/features/customization/OptionGroup.tsx')
    const { ProductConfigurator } = await server.ssrLoadModule('/src/features/customization/ProductConfigurator.tsx')
    const { getConfigurableProduct } = await server.ssrLoadModule('/src/data/customizations.ts')
    const { defaultConfiguration } = await server.ssrLoadModule('/src/features/customization/configuration.ts')
    const { AppContext } = await server.ssrLoadModule('/src/state/AppContext.ts')
    const state = createInitialState()
    const cheese = getConfigurableProduct('cheese')
    state.order.items = [{ itemId: 'a', productId: 'cheese', quantity: 3, unitPriceCents: 1690, configuration: defaultConfiguration(cheese) }]
    const render = (component, props) => renderToStaticMarkup(createElement(MemoryRouter, null, createElement(AppContext.Provider, { value: { state, dispatch() {} } }, createElement(component, props))))
    const menu = render(MenuPage)
    assert.equal((menu.match(/class="sr-only" type="radio"/g) ?? []).length, 7)
    const cart = render(CartPage)
    assert.ok(cart.indexOf('Seguir agregando productos') < cart.indexOf('class="cart-items"'))
    assert.ok(!cart.includes('Limpiar pedido'))
    assert.ok(cart.includes('aria-label="Editar Cheese mediana, ítem 1"'))
    assert.ok(cart.includes('aria-label="Eliminar Cheese mediana, ítem 1"'))
    assert.ok(cart.includes('aria-label="Disminuir cantidad de Cheese mediana, ítem 1"'))
    const navigation = render(BottomNavigation)
    assert.ok(navigation.includes('aria-label="Carrito, 3 unidades"'))
    assert.ok(!navigation.includes('>Pedido'))
    const quantity = render(QuantitySelector, { id: 'count', productName: 'Cheese', value: '1', onChange() {} })
    assert.ok(quantity.includes('aria-label="Aumentar cantidad de Cheese"'))
    assert.ok(!quantity.includes('>Menos<') && !quantity.includes('>Más<'))
    const sauces = cheese.optionGroups.find((group) => group.id === 'salsas')
    const options = render(OptionGroup, { group: sauces, fieldId: 'sauces', selectedIds: ['aji'], errors: [], availability: () => ({ available: false, reason: 'Agotado en este local' }), onChange() {}, onViewLocations() {} })
    const selected = options.match(/<input id="sauces-aji"[^>]+>/)[0]
    assert.ok(selected.includes('checked=""'))
    assert.ok(!selected.includes('disabled'), 'a recovered unavailable checkbox can be deselected')
    assert.match(options, /id="sauces-ketchup"[^>]*disabled=""/)
    assert.ok(options.includes('alt=""'))
    assert.ok(!options.includes('Limpiar selección'))
    const config = render(ProductConfigurator, { product: cheese })
    assert.ok(!config.includes('>Volver</button>'))
    assert.ok(config.includes('Volver al menú'))
    assert.ok(!config.includes('Desde'))
    // SSR checks semantics/content, not keyboard execution, focus or responsive rendering.
  } finally { await server.close() }
})
