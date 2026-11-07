import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { createServer } from 'vite'
import { createInitialState, appReducer } from '../src/state/appState.ts'
import { getConfigurableProduct } from '../src/data/customizations.ts'
import { defaultConfiguration } from '../src/features/customization/configuration.ts'
import { STORAGE_KEYS } from '../src/storage/browserStorage.ts'

function item(itemId = 'a') {
  const configuration = defaultConfiguration(getConfigurableProduct('cheese'))
  configuration.variantId = 'grande'
  configuration.selections.extras = ['queso']
  return { itemId, productId: 'cheese', configuration, quantity: 3, unitPriceCents: 2240 }
}

test('cart markup exposes exact selections, independent edit routes, totals and disabled continuation', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null } })
  try {
    const { CartPage } = await server.ssrLoadModule('/src/pages/CartPage.tsx')
    const { AppContext } = await server.ssrLoadModule('/src/state/AppContext.ts')
    const render = (state) => renderToStaticMarkup(createElement(MemoryRouter, null,
      createElement(AppContext.Provider, { value: { state, dispatch() {} } }, createElement(CartPage))))
    let state = createInitialState()
    const empty = render(state)
    assert.ok(empty.includes('Tu pedido está vacío'))
    assert.match(empty, /<button[^>]*disabled=""[^>]*>Continuar al pago/)
    state.order.items = [item('a'), item('b')]
    const html = render(state)
    assert.ok(html.includes('href="/pedido/a/editar"'))
    assert.ok(html.includes('href="/pedido/b/editar"'))
    assert.ok(html.includes('Extra queso'))
    assert.ok(html.includes('S/134.40'))
    assert.ok(html.includes('href="/pagar"'))
    assert.ok(html.includes('aria-label="Eliminar Cheese grande, ítem 1"'))
    assert.ok(html.includes('id="cart-item-a" tabindex="-1"'))
    state = { ...state, order: { ...state.order, locationId: 'demo-centro' } }
    const incompatible = render(state)
    assert.ok(incompatible.includes('Requiere actualización'))
    assert.ok(incompatible.includes('Cheese grande agotada en este local Demo.'))
    assert.ok(!incompatible.includes('href="/pagar"'))
    assert.match(incompatible, /<button[^>]*disabled=""[^>]*>Continuar al pago/)
  } finally { await server.close() }
})

test('edit route loads the exact saved configuration and quantity without mutating it', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null } })
  try {
    const { CustomizePage } = await server.ssrLoadModule('/src/pages/CustomizePage.tsx')
    const { AppContext } = await server.ssrLoadModule('/src/state/AppContext.ts')
    const state = createInitialState()
    state.order.items = [item()]
    const before = structuredClone(state)
    const html = renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: ['/pedido/a/editar'] },
      createElement(AppContext.Provider, { value: { state, dispatch() {} } }, createElement(Routes, null,
        createElement(Route, { path: '/pedido/:itemId/editar', element: createElement(CustomizePage) })))))
    assert.ok(html.includes('<h1>Editar Cheese</h1>'))
    assert.ok(html.includes('>Guardar cambios<'))
    assert.ok(!html.includes('>Agregar al pedido<'))
    assert.match(html, /id="variant-cheese-grande"[^>]*checked=""/)
    assert.match(html, /id="group-cheese-extras-queso"[^>]*checked=""/)
    assert.match(html, /id="quantity-cheese"[^>]*value="3"/)
    assert.ok(html.includes('Cancelar edición y volver al pedido'))
    assert.deepEqual(state, before)
  } finally { await server.close() }
})

test('Toast exposes native Undo and dismiss controls without autofocus or automatic expiration', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null } })
  try {
    const { Toaster } = await server.ssrLoadModule('/src/components/ui/Toaster.tsx')
    const { AppContext } = await server.ssrLoadModule('/src/state/AppContext.ts')
    let state = appReducer(createInitialState(), { type: 'cart/add', item: item() })
    state = appReducer(state, { type: 'cart/remove', itemId: 'a' })
    const html = renderToStaticMarkup(createElement(AppContext.Provider, { value: { state, dispatch() {} } }, createElement(Toaster)))
    assert.ok(html.includes('aria-label="Avisos del pedido"'))
    assert.match(html, /<button[^>]*aria-label="Deshacer:[^"]+"[^>]*>Deshacer/)
    assert.ok(html.includes('>Cerrar aviso<'))
    assert.ok(html.includes('role="status"'))
    assert.ok(!/autofocus/i.test(html))
    // No click, timing, focus or screen-reader event is claimed by this SSR test.
  } finally { await server.close() }
})

test('direct checkout shell blocks empty and incompatible carts and has no payment form', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null } })
  try {
    const { CheckoutPage } = await server.ssrLoadModule('/src/pages/CheckoutPage.tsx')
    const { AppContext } = await server.ssrLoadModule('/src/state/AppContext.ts')
    const render = (state) => renderToStaticMarkup(createElement(MemoryRouter, null,
      createElement(AppContext.Provider, { value: { state, dispatch() {} } }, createElement(CheckoutPage))))
    const state = createInitialState()
    assert.ok(render(state).includes('Revisa tu pedido'))
    state.order.items = [item()]
    const valid = render(state)
    assert.ok(valid.includes('La entrega y el pago estarán disponibles pronto'))
    assert.ok(!valid.includes('<form'))
    assert.ok(!valid.includes('/confirmacion/'))
    state.order.locationId = 'demo-centro'
    assert.ok(render(state).includes('Revisa tu pedido'))
  } finally { await server.close() }
})

test('provider recovers and recalculates saved cart on initialization without writing storage or autofocus', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null } })
  const previousWindow = globalThis.window
  const saved = { ...createInitialState().order, items: [{ ...item(), unitPriceCents: 1 }] }
  const raw = JSON.stringify({ schemaVersion: 1, data: saved })
  let writes = 0
  globalThis.window = { localStorage: {
    getItem: (key) => key === STORAGE_KEYS.order ? raw : null,
    setItem() { writes++ }, removeItem() { writes++ },
  }, sessionStorage: { getItem: () => null } }
  try {
    const { AppProviders } = await server.ssrLoadModule('/src/app/providers.tsx')
    const { AppLayout } = await server.ssrLoadModule('/src/components/layout/AppLayout.tsx')
    const { CartPage } = await server.ssrLoadModule('/src/pages/CartPage.tsx')
    const html = renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: ['/pedido'] }, createElement(AppProviders, null,
      createElement(Routes, null, createElement(Route, { element: createElement(AppLayout) },
        createElement(Route, { path: '/pedido', element: createElement(CartPage) }))))))
    assert.equal(writes, 0)
    assert.ok(html.includes('Restauramos tu pedido anterior.'))
    assert.ok(html.includes('S/67.20'))
    assert.ok(html.includes('role="status"'))
    assert.ok(!/autofocus/i.test(html))
    // Announcement effects, browser focus and persistence events are not executed by SSR.
  } finally { globalThis.window = previousWindow; await server.close() }
})
