import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'
import { createInitialState } from '../src/state/appState.ts'
import { defaultConfiguration } from '../src/features/customization/configuration.ts'
import { getConfigurableProduct } from '../src/data/customizations.ts'

test('checkout markup exposes delivery/pickup semantics, exact summary and associated field errors', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null } })
  try {
    const { CheckoutPage } = await server.ssrLoadModule('/src/pages/CheckoutPage.tsx')
    const { AppContext } = await server.ssrLoadModule('/src/state/AppContext.ts')
    const { FormField } = await server.ssrLoadModule('/src/components/ui/FormField.tsx')
    const state = createInitialState()
    const configuration = defaultConfiguration(getConfigurableProduct('cheese'))
    configuration.selections.extras = ['queso']
    state.order.items = [{ itemId: 'a', productId: 'cheese', quantity: 2, unitPriceCents: 1, configuration }]
    const render = () => renderToStaticMarkup(createElement(MemoryRouter, null,
      createElement(AppContext.Provider, { value: { state, dispatch() {} } }, createElement(CheckoutPage))))
    const delivery = render()
    assert.ok(delivery.includes('<fieldset'))
    assert.ok(delivery.includes('Forma de entrega (obligatoria)'))
    assert.match(delivery, /type="radio"[^>]*name="deliveryMethod"/)
    for (const token of ['name', 'tel', 'street-address']) assert.ok(delivery.includes(`autoComplete="${token}"`))
    assert.ok(delivery.includes('Referencia <span>(opcional)</span>'))
    assert.ok(delivery.includes('Extra queso'))
    assert.ok(delivery.includes('S/38.80'))
    assert.ok(delivery.includes('S/5.00'))
    assert.ok(delivery.includes('S/43.80'))
    assert.ok(delivery.includes('>Editar pedido<'))
    assert.ok(!delivery.includes('/confirmacion/'))
    assert.ok(!delivery.includes('cardNumber'))
    state.checkout = { ...state.checkout, deliveryMethod: 'pickup', pickupSlot: 'in-60' }
    const pickup = render()
    assert.ok(!pickup.includes('id="checkout-address"'))
    assert.ok(!pickup.includes('id="checkout-reference"'))
    assert.ok(pickup.includes('dirección ficticia'))
    assert.ok(pickup.includes('Preparación estimada: 25 minutos'))
    assert.match(pickup, /<option value="in-60" selected=""/)
    assert.ok(pickup.includes('S/0.00'))
    const field = renderToStaticMarkup(createElement(FormField, { id: 'test-phone', label: 'Teléfono', help: 'Instrucción', value: 'bad', onChange() {}, error: 'Corrige el teléfono', type: 'tel', autoComplete: 'tel', maxLength: 40 }))
    assert.ok(field.includes('for="test-phone"'))
    assert.ok(field.includes('aria-invalid="true"'))
    assert.ok(field.includes('aria-required="true"'))
    assert.ok(field.includes('aria-describedby="test-phone-help test-phone-error"'))
    assert.ok(field.includes('id="test-phone-error"'))
    // SSR verifies markup only, not events, actual focus or live announcements.
  } finally { await server.close() }
})
