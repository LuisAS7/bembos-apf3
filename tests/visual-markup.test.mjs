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
