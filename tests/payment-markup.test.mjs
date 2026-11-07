import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { MemoryRouter } from 'react-router-dom'
import { createInitialState } from '../src/state/appState.ts'
import { defaultConfiguration } from '../src/features/customization/configuration.ts'
import { getConfigurableProduct } from '../src/data/customizations.ts'

test('payment markup uses native controls, fictional QR, associated labels and no final-confirmation link', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null } })
  try {
    const { PaymentPanel } = await server.ssrLoadModule('/src/features/payments/PaymentPanel.tsx')
    const { YapeDemo } = await server.ssrLoadModule('/src/features/payments/YapeDemo.tsx')
    const { AppContext } = await server.ssrLoadModule('/src/state/AppContext.ts')
    const state = createInitialState()
    state.order.items = [{ itemId: 'a', productId: 'cheese', quantity: 1, unitPriceCents: 1690, configuration: defaultConfiguration(getConfigurableProduct('cheese')) }]
    state.checkout = { ...state.checkout, fullName: 'Persona Ficticia', phone: '987654321', address: 'Calle Ficticia 100' }
    const render = () => renderToStaticMarkup(createElement(MemoryRouter, null, createElement(AppContext.Provider, { value: { state, dispatch() {} } }, createElement(PaymentPanel))))
    const cash = render()
    assert.ok(cash.includes('Usa datos de prueba.'))
    assert.ok(cash.includes('Pagar al recibir'))
    assert.ok(cash.includes('¿Necesitas vuelto?'))
    assert.ok(cash.includes('S/21.90'))
    assert.ok(cash.includes('role="status"'))
    assert.ok(!cash.includes('/confirmacion'))
    state.payment.method = 'card'
    const card = render()
    for (const name of ['holder', 'number', 'expiry', 'cvv']) {
      assert.ok(card.includes(`for="payment-${name}"`))
      if (name !== 'expiry') assert.ok(card.includes(`aria-describedby="payment-${name}-help"`))
    }
    assert.match(card, /id="payment-cvv"[^>]*autoComplete="off"[^>]*type="password"/)
    assert.ok(card.includes('Visa o Mastercard'))
    assert.match(card, /id="payment-expiry"[^>]*placeholder="MM\/AA"[^>]*type="text"[^>]*inputMode="numeric"/)
    assert.ok(!card.includes('payment-expiry-help'))
    assert.ok(!card.includes('Probar pago rechazado'))
    state.payment.method = 'yape'
    const yape = render()
    assert.ok(yape.includes('Generar código de prueba'))
    assert.ok(yape.includes('Código Yape'))
    const qr = renderToStaticMarkup(createElement(YapeDemo, { challenge: { operationId: 'DEMO-markup', code: '123456' } }))
    assert.ok(qr.includes('<svg'))
    assert.ok(qr.includes('QR de prueba. No inicia transferencias.'))
    assert.ok(qr.includes('DEMO-markup'))
    state.payment = { status: 'processing', method: 'card', totalCents: 2190, attemptId: 'SIM-markup', revision: 0 }
    const pending = render()
    assert.ok(pending.includes('aria-busy="true"'))
    assert.match(pending, /aria-disabled="true"[^>]*>Procesando pago/)
    state.payment.status = 'approved'
    const approved = render()
    assert.ok(approved.includes('Pago aprobado. Continúa a la revisión del pedido.'))
    assert.ok(!approved.includes('id="payment-number"'))
    assert.ok(!approved.includes('id="payment-cvv"'))
    // SSR does not execute user events, processing timers, cleanup, focus or live announcements.
  } finally { await server.close() }
})
