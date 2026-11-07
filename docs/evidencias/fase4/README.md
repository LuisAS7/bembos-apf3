# Evidencias de Fase 4 — Carrito

Fecha: 7 de noviembre de 2026, America/Lima. Base `e8cb024`. Se conservan los resultados históricos de fases anteriores; no se dan por cerrados sus pendientes.

## Verificaciones ejecutadas

| Comando | Resultado | Evidencia |
| --- | --- | --- |
| `npm.cmd run lint` | Exit 0, sin errores ni warnings de ESLint | [lint.log](lint.log), [resultado](lint-result.json) |
| `npm.cmd test` | 51 tests aprobados, 0 fallos, 0 omitidos | [tests.log](tests.log), [resultado](tests-result.json) |
| `npm.cmd run build` | TypeScript y Vite completados, exit 0 | [build.log](build.log), [resultado](build-result.json) |

Los comandos equivalentes multiplataforma son `npm run lint`, `npm test` y `npm run build`. PowerShell bloquea el wrapper `npm.ps1` de este entorno; `npm.cmd` ejecuta npm sin modificar la política del sistema. No se instalaron dependencias. Los mensajes del optimizador Vite en SSR corresponden a las dependencias ya existentes, no a instalaciones.

`npm test` es el comando reproducible para toda la suite. Usa Node 22.19.0, runner nativo y archivos en serie. La suite incluye 13 pruebas nuevas de reglas del carrito y 5 de HTML/SSR, más las pruebas previas actualizadas para agregar/editar; total 51. Verifica identidades, edición sin duplicados, cantidades y límites, precios en céntimos, Deshacer y vecinos, múltiples eliminaciones, restauración tras cambio de local, recuperación con precios falsificados, referencias obsoletas, IDs duplicados, versiones incompatibles, almacenamiento bloqueado, protección de pedidos guardados y limpieza selectiva. SSR verifica selección/cantidad inicial exacta en edición, bloqueo de la ruta de pago y recuperación inicial desde el provider sin escrituras ni autofocus.

Las verificaciones iniciales detectaron una etiqueta que duplicaba el nombre del producto en el carrito; se corrigió antes de la ejecución final. También se corrigieron una sintaxis de test y su expectativa de texto. Los logs enlazados corresponden a la ejecución final completa.

- [entorno.json](entorno.json): versiones, base, hashes iguales de `package-lock.json` y resultado literal del intento de navegador.
- [escenarios.json](escenarios.json): salida real de funciones del carrito ejecutadas con fixtures, incluida edición, recuperación de precios, Deshacer e incompatibilidades. El almacenamiento de este archivo es un mock en memoria de Node, no el del navegador del usuario.
- [build.json](build.json): revisión estática del HTML/CSS generado, título base, `lang="es"`, ausencia de media query dark automática, foco visible, reducción de movimiento y `dist` ignorado. No mide layout ni estilos computados.
- [http.json](http.json): respuestas HTTP del servidor de desarrollo existente para menú, configurador, carrito, edición y shell de pago. HTTP 200 indica entrega del HTML SPA; no prueba navegación React ni ausencia de errores en consola.

Los logs solo se normalizaron a UTF-8, sin códigos ANSI y sin espacios finales. No se alteraron resultados, tiempos ni códigos de salida. `dist/` se regeneró y sigue excluido del commit.

## Intento de navegador y límites

Se intentó abrir `http://127.0.0.1:5173/pedido` con `cua.createBrowserTab('iab', …)`. Resultado: **`The browser access host is unavailable`**. No se ejecutaron pruebas de interfaz ni se generaron capturas. No se declara validada la interacción de los diálogos. Los tests SSR no ejecutan efectos, `showModal`, eventos, foco, Tab, Escape, anuncios vivos ni lector de pantalla.

Pendientes detallados en [casos-pendientes.md](casos-pendientes.md). Continúan los [pendientes de Fase 2](../fase2/README.md) y [Fase 3](../fase3/casos-pendientes.md), además de los aplicables de Fase 1. Axe sigue aplazado por autorización del usuario. La revisión manual de zoom al 200 % que reportó el usuario sobre la versión anterior a Fase 2 se conserva como tal y **no acredita las pantallas nuevas**.

No hay resultados nuevos de axe, NVDA, pruebas con usuarios, contraste de controles renderizados ni consola. Los contrastes de pares de tokens siguen verificados numéricamente por la suite; eso no certifica el contraste global de las pantallas. **No se declara conformidad WCAG global.**
