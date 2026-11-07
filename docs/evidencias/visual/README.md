# Verificación de evolución visual

Base funcional: `da30ab7`, 7 de noviembre de 2026, America/Lima.

| Comando | Resultado | Evidencia |
| --- | --- | --- |
| `npm.cmd run lint` | Exit 0; sin errores ni warnings | [lint.log](lint.log) |
| `npm.cmd test` | 89 aprobados, 0 fallos | [tests.log](tests.log) |
| `npm.cmd run build` | TypeScript + Vite, exit 0 | [build.log](build.log) |

Reproducir con `npm run lint`, `npm test`, `npm run build` (este PowerShell usa `npm.cmd`). Resultados en `*-result.json`. Los logs finales solo se normalizan a UTF-8, sin ANSI ni espacios finales.

Los tests verifican lógica y HTML SSR, no eventos o renderizado visual. Se añaden diez casos y se actualizan las expectativas de presentación reemplazadas; las pruebas de negocio siguen activas. El test existente de contraste de tokens pasó con la superficie neutra nueva; no es una medición de controles renderizados.

Se leyeron los tipos/código de Sonner instalado para revisar semántica y duración; SSR verifica su región `aria-live` y los botones nativos propios. Los tests del adaptador verifican IDs, ausencia de actualizaciones duplicadas y duración infinita de Deshacer. Esto **no valida** su comportamiento real con teclado/lector.

No se intentó acceder al navegador; sin capturas antes/después, responsive visual, foco/teclado, zoom ni consola nuevos. No hubo imágenes adjuntas disponibles, solo el texto. Los archivos oficiales descargados se inspeccionaron como recursos, sin presentarlos como evidencia de pantallas. [Fuentes](../../recursos-visuales.json) y [reporte con pendientes](../../trazabilidad/evolucion-visual.md). Axe/NVDA aplazados; no hay conformidad WCAG global ni Fase 8 completa.
