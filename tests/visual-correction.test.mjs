import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { createServer } from 'vite'
import { configurableProducts, getConfigurableProduct } from '../src/data/customizations.ts'
import { optionPhoto } from '../src/data/optionPhotos.ts'
import { defaultConfiguration } from '../src/features/customization/configuration.ts'
import { createInitialState, appReducer } from '../src/state/appState.ts'
import { createConfirmation } from '../src/features/confirmation/confirmation.ts'
import { checkoutBackStep, checkoutStep } from '../src/features/checkout/steps.ts'
import { checkoutTotals } from '../src/features/checkout/checkout.ts'
import { formatExpiry } from '../src/features/payments/expiry.ts'
import { emptyPaymentDraft, validatePayment } from '../src/features/payments/payment.ts'
import { saveLastConfirmation, readLastConfirmation, STORAGE_KEYS } from '../src/storage/browserStorage.ts'

function fixture(productId = 'cheese') {
  const state = createInitialState()
  const product = getConfigurableProduct(productId)
  state.order.items = [{ itemId: 'historic-item', productId, quantity: 2, unitPriceCents: product.basePriceCents, configuration: defaultConfiguration(product) }]
  state.checkout = { ...state.checkout, fullName: 'PRIVATE-CONTACT', phone: '987654321', address: 'PRIVATE-ADDRESS 100' }
  state.payment = { status: 'approved', method: 'card', totalCents: checkoutTotals(state.order, 'delivery').totalCents, attemptId: 'test-attempt', revision: 0 }
  return state
}

test('shared quantity control is noneditable, announces the value and enforces button limits', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null } })
  try {
    const { QuantitySelector } = await server.ssrLoadModule('/src/features/customization/QuantitySelector.tsx')
    const { CartPage } = await server.ssrLoadModule('/src/pages/CartPage.tsx')
    const { AppContext } = await server.ssrLoadModule('/src/state/AppContext.ts')
    const descendants = (element) => !element || typeof element !== 'object' ? [] : [element, ...[element.props?.children].flat(Infinity).flatMap(descendants)]
    for (const [value, decrease, increase] of [['1', true, false], ['2', false, false], ['99', false, true]]) {
      const updates = []
      const props = { id: 'quantity', productName: 'Cheese', value, onChange: (next) => updates.push(next) }
      const nodes = descendants(QuantitySelector(props))
      const minus = nodes.find((node) => node.props?.['aria-label'] === 'Disminuir cantidad de Cheese')
      const plus = nodes.find((node) => node.props?.['aria-label'] === 'Aumentar cantidad de Cheese')
      assert.equal(minus.props.disabled, decrease)
      assert.equal(plus.props.disabled, increase)
      if (!decrease) minus.props.onClick()
      if (!increase) plus.props.onClick()
      assert.ok(updates.every((next) => Number(next) >= 1 && Number(next) <= 99))
      if (value === '2') assert.deepEqual(updates, ['1', '3'])
      const html = renderToStaticMarkup(createElement(QuantitySelector, props))
      assert.match(html, /<output[^>]*aria-live="polite"[^>]*>/)
      assert.ok(!html.includes('<input') && !html.includes('contenteditable'))
    }
    const disabled = descendants(QuantitySelector({ id: 'locked', value: '2', disabled: true, onChange() {} })).filter((node) => node.props?.['aria-label']?.includes('cantidad'))
    assert.ok(disabled.every((node) => node.props.disabled))
    const state = fixture()
    const cart = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(AppContext.Provider, { value: { state, dispatch() {} } }, createElement(CartPage))))
    assert.match(cart, /id="cart-quantity-historic-item" class="quantity-field"/)
    assert.ok(cart.includes('<output'))
    // Calling component callbacks checks its contract; this does not execute keyboard/focus events.
  } finally { await server.close() }
})

test('expiry formatting leaves partial edits untouched and existing validation rejects bad months/dates', () => {
  for (const value of ['', '1', '12', '12/', '12/2', '1/28', '12/28']) assert.equal(formatExpiry(value), value)
  assert.equal(formatExpiry('1228'), '12/28')
  assert.equal(formatExpiry('0028'), '00/28')
  const state = fixture()
  const card = { ...emptyPaymentDraft('card'), holder: 'Titular de prueba', number: '4242424242424242', cvv: '123' }
  const issues = (expiry) => validatePayment(state.order, state.checkout, { ...card, expiry: formatExpiry(expiry) }, null, new Date('2026-11-07T12:00:00Z'))
  for (const value of ['1228', '12/28']) assert.deepEqual(issues(value), [])
  for (const value of ['0028', '13/28', '10/26', '12/2', '']) assert.ok(issues(value).some((issue) => issue.field === 'expiry'))
})

test('FormField omits absent help and associates only existing error/help elements', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null } })
  try {
    const { FormField } = await server.ssrLoadModule('/src/components/ui/FormField.tsx')
    const props = { id: 'expiry', label: 'Vencimiento (MM/AA)', placeholder: 'MM/AA', inputMode: 'numeric', value: '12/2', autoComplete: 'off', maxLength: 5, onChange() {} }
    const clean = renderToStaticMarkup(createElement(FormField, props))
    assert.ok(clean.includes('placeholder="MM/AA"') && clean.includes('inputMode="numeric"') && clean.includes('type="text"'))
    assert.ok(!clean.includes('<p') && !clean.includes('aria-describedby'))
    const invalid = renderToStaticMarkup(createElement(FormField, { ...props, error: 'Usa MM/AA' }))
    assert.ok(invalid.includes('aria-describedby="expiry-error"'))
    assert.ok(invalid.includes('aria-invalid="true"'))
    assert.ok(!invalid.includes('expiry-help'))
    const helped = renderToStaticMarkup(createElement(FormField, { ...props, help: 'Ayuda', error: 'Error' }))
    assert.ok(helped.includes('aria-describedby="expiry-help expiry-error"'))
  } finally { await server.close() }
})

test('checkout only offers generic back from payment, preserving delivery and current approval', () => {
  assert.equal(checkoutBackStep(0), null)
  assert.equal(checkoutBackStep(1), 0)
  assert.equal(checkoutBackStep(2), null)
  const state = fixture()
  const before = structuredClone(state)
  assert.equal(checkoutStep(2, state), 2)
  assert.equal(checkoutStep(checkoutBackStep(1), state), 0)
  assert.deepEqual(state, before)
  const changed = appReducer(state, { type: 'checkout/replace', value: { ...state.checkout, deliveryMethod: 'pickup' } })
  assert.equal(checkoutStep(2, changed), 1)
  assert.equal(changed.payment.status, 'invalidated')
  assert.equal(changed.checkout.fullName, before.checkout.fullName)
})

test('receipt photos are independent safe references; older receipts without photos still recover', () => {
  const previousWindow = globalThis.window
  const data = new Map()
  globalThis.window = { sessionStorage: { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) } }
  const product = getConfigurableProduct('cheese')
  const originalSrc = product.image.src
  try {
    const receipt = createConfirmation(fixture(), 'BEM-photo', '2026-11-07T12:00:00Z')
    assert.deepEqual(receipt.items[0].snapshot.image, { src: originalSrc })
    product.image.src = '/images/official/royal.jpg'
    assert.equal(receipt.items[0].snapshot.image.src, originalSrc)
    receipt.items[0].snapshot.image.contact = 'PRIVATE-IMAGE-CONTACT'
    assert.equal(saveLastConfirmation(receipt).ok, true)
    assert.deepEqual(readLastConfirmation().value.items[0].snapshot.image, { src: originalSrc })
    const saved = data.get(STORAGE_KEYS.lastConfirmation)
    assert.ok(!saved.includes('PRIVATE-'))
    for (const src of ['https://example.com/track.jpg', 'data:image/png;base64,x', '/images/official/../private.jpg', '/images/official/cheese.jpg?contact=x', '/images/official/%2e%2e/x.jpg', '/images/official/PRIVATE-CONTACT.jpg']) {
      const invalid = structuredClone(receipt)
      invalid.items[0].snapshot.image = { src }
      assert.equal(saveLastConfirmation(invalid).ok, false)
      assert.equal(data.get(STORAGE_KEYS.lastConfirmation), saved)
    }
    const old = structuredClone(receipt)
    delete old.items[0].snapshot.image
    assert.equal(saveLastConfirmation(old).ok, true)
    assert.ok(!readLastConfirmation().value.items[0].snapshot.image)
    const duo = createConfirmation(fixture('duo-cheese-demo'), 'BEM-duo-photo', receipt.confirmedAt)
    assert.equal(duo.items[0].snapshot.image.duo, true)
    assert.equal(saveLastConfirmation(duo).ok, true)
    assert.equal(readLastConfirmation().value.items[0].snapshot.image.duo, true)
  } finally { product.image.src = originalSrc; globalThis.window = previousWindow }
})

test('receipt detail uses snapshot photo/name/prices, with fallback and no duplicate numbering', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null } })
  try {
    const { ConfirmationPage } = await server.ssrLoadModule('/src/pages/ConfirmationPage.tsx')
    const { AppContext } = await server.ssrLoadModule('/src/state/AppContext.ts')
    const state = fixture()
    state.lastConfirmation = createConfirmation(state, 'BEM-historic', '2026-11-07T12:00:00Z')
    state.lastConfirmation.items[0].productId = 'no-longer-in-catalog'
    state.lastConfirmation.items[0].snapshot.name = 'Nombre histórico'
    const render = () => renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: ['/confirmacion/BEM-historic'] }, createElement(AppContext.Provider, { value: { state, dispatch() {} } }, createElement(Routes, null, createElement(Route, { path: '/confirmacion/:pedidoId', element: createElement(ConfirmationPage) })))) )
    const html = render()
    assert.ok(html.includes('src="/images/official/cheese.jpg"'))
    assert.ok(html.includes('<h3>Nombre histórico</h3>'))
    assert.ok(html.includes('S/16.90') && html.includes('S/33.80'))
    assert.ok(!/<h3>1\./.test(html))
    assert.ok(!/<details[^>]*open/.test(html))
    assert.ok(html.indexOf('Ver detalle del pedido') < html.indexOf('Productos confirmados'))
    assert.ok(html.indexOf('Productos confirmados') < html.indexOf('<h3>Nombre histórico'))
    delete state.lastConfirmation.items[0].snapshot.image
    const old = render()
    assert.ok(old.includes('Fotografía no disponible'))
    assert.ok(!old.includes('src="/images/official/'))
    // Static markup cannot prove spacing, details interaction or focus in a browser.
  } finally { await server.close() }
})

test('photo manifest matches resources and explicitly enumerates every remaining pictogram option', () => {
  const manifest = JSON.parse(readFileSync(new URL('../docs/recursos-correccion-visual.json', import.meta.url), 'utf8'))
  for (const resource of manifest.resources) {
    const bytes = readFileSync(new URL(`../${resource.file}`, import.meta.url))
    assert.equal(bytes.length, resource.bytes)
    assert.equal(createHash('sha256').update(bytes).digest('hex'), resource.sha256)
    if (resource.file.includes('/reference/')) assert.ok(resource.author && resource.license && resource.page.includes('commons.wikimedia.org'))
  }
  const pending = []
  for (const product of configurableProducts) {
    const groups = [{ id: 'variant', options: product.variants }, ...product.optionGroups.filter((group) => group.id !== 'ingredientes')]
    for (const group of groups) for (const option of group.options) {
      const photo = optionPhoto(group.id, option)
      if (photo) assert.ok(existsSync(new URL(`../public${photo.src}`, import.meta.url)))
      else pending.push([product.id, group.id, option.id])
    }
  }
  assert.deepEqual(manifest.pending.map((entry) => [entry.productId, entry.groupId, entry.optionId]), pending)
})
