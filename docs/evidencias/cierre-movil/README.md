# Evidencias técnicas del cierre móvil

Base `78a386f`, 2026-11-07, America/Lima. [Cambios](../../trazabilidad/cierre-diseno-movil.md) · [Checklist manual](comprobacion-manual.md).

| Comando reproducible | Resultado | Evidencia |
| --- | --- | --- |
| `npm.cmd run lint` | Exit 0, sin errores ni warnings | [lint.log](lint.log) |
| `npm.cmd test` | 106 aprobados, 0 fallos | [tests.log](tests.log) |
| `npm.cmd run build` | TypeScript + Vite, exit 0 | [build.log](build.log) |

[Fecha y códigos de salida](results.json). En otras terminales: `npm run lint`, `npm test`, `npm run build`. Node 22.19.0, runner nativo en serie; sin dependencias nuevas ni cambios de lockfile. Los logs reales se normalizan a UTF-8, sin ANSI ni espacios finales.

101 pruebas anteriores y cinco nuevas: validación compartida de la acción final para todos los productos, markup nativo del carrusel, una sola cantidad/acción de edición y descripción completa, detalles del carrito con restricciones fuera y descripciones coherentes con opciones. Se ajustan tres pruebas anteriores a las alternativas ahora descritas y la acción móvil deshabilitada, sin relajar precios, identidad, disponibilidad, recuperación, privacidad ni confirmación única.

No se reintentó el navegador. No hay capturas ni aprobación visual de esta iteración. SSR verifica contenido/semántica y las funciones puras verifican reglas; no ejecutan touch, trackpad, teclado/foco, scroll, ResizeObserver, safe areas ni layout real. Quedan pendientes superposición, contenido alcanzable bajo barras, responsive, zoom, consola, axe y NVDA, además de los casos previos. No se declara conformidad WCAG global ni se publica.
