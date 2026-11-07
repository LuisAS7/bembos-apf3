import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve, relative, join } from 'node:path'
import { execFileSync } from 'node:child_process'

const base = new URL(process.argv[2])
if (base.protocol !== 'https:' || !base.hostname.endsWith('.netlify.app') || base.username || base.password) throw new Error('Indica la URL HTTPS pública de Netlify, sin credenciales.')
const dist = resolve('dist')
const index = await readFile(join(dist, 'index.html'), 'utf8')
const assets = [...index.matchAll(/(?:src|href)="(\/[^"?#]+)"/g)].map((match) => match[1])
const paths = ['/', '/menu', '/pedido', '/pagar', '/productos/cheese/personalizar', '/productos/menu-taypa-demo/personalizar', '/pedido/ausente/editar', '/confirmacion/ausente']
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex')
async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? files(join(directory, entry.name)) : [join(directory, entry.name)]))).flat()
}
const images = (await files(join(dist, 'images'))).map((file) => `/${relative(dist, file).replaceAll('\\', '/')}`)
const checks = [...paths.map((path) => ({ path, kind: 'spa' })), ...[...new Set([...assets, ...images])].map((path) => ({ path, kind: 'asset' }))]
const results = []
// HTTP only: this does not launch a browser or execute client-side React.
for (let offset = 0; offset < checks.length; offset += 4) {
  results.push(...await Promise.all(checks.slice(offset, offset + 4).map(async ({ path, kind }) => {
    try {
      const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(30000), headers: { 'Cache-Control': 'no-cache' } })
      const bytes = Buffer.from(await response.arrayBuffer())
      const contentType = response.headers.get('content-type') ?? ''
      const expected = kind === 'spa' ? Buffer.from(index) : await readFile(join(dist, path.slice(1)))
      const sameBytes = hash(bytes) === hash(expected)
      const validType = kind === 'spa' ? contentType.includes('text/html')
        : /\.css$/.test(path) ? contentType.includes('text/css')
        : /\.js$/.test(path) ? /javascript/.test(contentType) : /\.(?:svg|jpg|jpeg|png|webp)$/.test(path) ? contentType.startsWith('image/') : true
      return { path, kind, status: response.status, contentType, bytes: bytes.length, sha256: hash(bytes), sameBytes, ok: response.ok && sameBytes && validType }
    } catch (error) { return { path, kind, ok: false, error: error.message } }
  })))
}
const report = { url: base.origin, commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), checkedAt: new Date().toISOString(),
  scope: 'HTTP: rutas SPA y bytes del build/recursos. No verifica renderizado, interacción, foco, consola, axe ni NVDA.',
  ok: results.every((result) => result.ok), results }
const destination = resolve('docs/evidencias/netlify/remoto')
await mkdir(destination, { recursive: true })
await writeFile(join(destination, 'verificacion.json'), `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify({ url: report.url, commit: report.commit, checks: results.length, passed: results.filter((result) => result.ok).length, ok: report.ok, failures: results.filter((result) => !result.ok) }, null, 2))
if (!report.ok) process.exitCode = 1
