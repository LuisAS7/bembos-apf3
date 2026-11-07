import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { createServer } from 'vite'
import { createInitialState } from '../src/state/appState.ts'
import { defaultConfiguration } from '../src/features/customization/configuration.ts'
import { getConfigurableProduct } from '../src/data/customizations.ts'
import { createConfirmation } from '../src/features/confirmation/confirmation.ts'
import { saveOrder, saveLastConfirmation } from '../src/storage/browserStorage.ts'

function fixture() {
  const state = createInitialState()
  state.order.items = [{ itemId: 'confirmed-item', productId: 'cheese', quantity: 2, unitPriceCents: 1, configuration: defaultConfiguration(getConfigurableProduct('cheese')) }]
  state.checkout = { ...state.checkout, fullName: 'PRIVATE-NAME', phone: '987654321', address: 'PRIVATE-ADDRESS 100' }
  state.payment = { status: 'approved', method: 'card', totalCents: 3880, attemptId: 'attempt-markup', revision: 0 }
  state.lastConfirmation = createConfirmation(state, 'BEM-markup', '2026-11-07T08:00:00Z')
  return state
}

test('confirmation renders the snapshot, only-ID QR and clear absent/mismatched/legacy states', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null } })
  try {
    const { ConfirmationPage } = await server.ssrLoadModule('/src/pages/ConfirmationPage.tsx')
    const { AppContext } = await server.ssrLoadModule('/src/state/AppContext.ts')
    const state = fixture()
    const receipt = state.lastConfirmation
    state.order.items = [] // New order no longer supplies any product details to the receipt.
    const render = (id) => renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [`/confirmacion/${id}`] },
      createElement(AppContext.Provider, { value: { state, dispatch() {} } }, createElement(Routes, null,
        createElement(Route, { path: '/confirmacion/:pedidoId', element: createElement(ConfirmationPage) })))))
    const html = render(receipt.orderId)
    assert.ok(html.includes('<h1>Pedido confirmado</h1>'))
    assert.ok(html.includes('Cheese'))
    assert.ok(html.includes('Papas medianas'))
    assert.ok(html.includes('S/33.80'))
    assert.ok(html.includes('S/5.00'))
    assert.ok(html.includes('S/38.80'))
    assert.ok(html.includes('BEM-markup'))
    const qr = renderToStaticMarkup(createElement(QRCodeSVG, { value: receipt.orderId, size: 200, marginSize: 4, role: 'img', title: 'QR del ID ficticio del pedido. Solo contiene el identificador mostrado como texto.' }))
    assert.ok(html.includes(qr), 'exact QR markup generated from only the ID, without JSON/contact/payment payload')
    assert.ok(!html.includes(state.checkout.fullName))
    assert.ok(!html.includes(state.checkout.address))
    assert.ok(render('other-id').includes('El identificador no corresponde'))
    state.lastConfirmation = { orderId: 'legacy', confirmedAt: receipt.confirmedAt, locationId: 'san-miguel', deliveryMethod: 'pickup', paymentMethod: 'cash', totalCents: 1, items: [{ productId: 'unknown', quantity: 1, lineTotalCents: 1 }] }
    assert.ok(render('legacy').includes('Comprobante anterior sin resumen completo'))
    state.lastConfirmation = null
    assert.ok(render('missing').includes('No hay un comprobante disponible'))
    // SSR does not execute actual routing events, focus, announcements or QR scanning.
  } finally { await server.close() }
})

test('provider reload recovers receipt and omits consumed persisted items without writing or reconfirming', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null } })
  const previousWindow = globalThis.window
  const memory = () => { const data = new Map(); return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key) } }
  globalThis.window = { localStorage: memory(), sessionStorage: memory() }
  const state = fixture()
  saveOrder(state.order)
  saveLastConfirmation(state.lastConfirmation)
  let writes = 0
  window.localStorage.setItem = window.localStorage.removeItem = window.sessionStorage.setItem = () => { writes++ }
  try {
    const { AppProviders } = await server.ssrLoadModule('/src/app/providers.tsx')
    const { ConfirmationPage } = await server.ssrLoadModule('/src/pages/ConfirmationPage.tsx')
    const { CartPage } = await server.ssrLoadModule('/src/pages/CartPage.tsx')
    function render(page, path) {
      return renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [path] }, createElement(AppProviders, null,
        createElement(Routes, null, createElement(Route, { path: '/confirmacion/:pedidoId', element: createElement(page) }), createElement(Route, { path: '/pedido', element: createElement(page) })))))
    }
    assert.ok(render(ConfirmationPage, '/confirmacion/BEM-markup').includes('Pedido confirmado'))
    assert.ok(render(CartPage, '/pedido').includes('Tu pedido está vacío'))
    assert.equal(writes, 0)
  } finally { globalThis.window = previousWindow; await server.close() }
})
