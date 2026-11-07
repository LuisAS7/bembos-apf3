import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'

test('rendered menu exposes labeled native controls, products and unavailable state', async () => {
  // SSR is a markup integration check; it does not execute browser events or effects.
  const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null } })
  try {
    const { MenuPage } = await server.ssrLoadModule('/src/pages/MenuPage.tsx')
    const { AppProviders } = await server.ssrLoadModule('/src/app/providers.tsx')
    const html = renderToStaticMarkup(createElement(MemoryRouter, null,
      createElement(AppProviders, null, createElement(MenuPage))))
    assert.equal((html.match(/<h1>/g) ?? []).length, 1)
    assert.equal((html.match(/<article /g) ?? []).length, 12)
    assert.equal((html.match(/type="radio"/g) ?? []).length, 4)
    assert.equal((html.match(/<option /g) ?? []).length, 3)
    assert.ok(html.includes('<label for="product-search">Buscar productos</label>'))
    assert.ok(html.includes('<label for="order-location">Local del pedido</label>'))
    assert.ok(html.includes('type="search"'))
    assert.ok(html.includes('<legend>Categorías</legend>'))
    assert.ok(html.includes('role="status"'))
    assert.ok(html.includes('Agotado en este local'))
    assert.ok(html.includes('href="/productos/cheese/personalizar"'))
    assert.equal((html.match(/Mock académico/g) ?? []).length, 10)
    assert.equal((html.match(/<img [^>]*alt="[^"]+"/g) ?? []).length, 12)
  } finally {
    await server.close()
  }
})
