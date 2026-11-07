# Evidencias técnicas — Fase 5

7 de noviembre de 2026, America/Lima. Base `84a67cb`.

| Comando ejecutado | Resultado | Log |
| --- | --- | --- |
| `npm.cmd run lint` | Exit 0 | [lint.log](lint.log) |
| `npm.cmd test` | 58 aprobados, 0 fallos | [tests.log](tests.log) |
| `npm.cmd run build` | TypeScript + Vite, exit 0 | [build.log](build.log) |

Reproducir con `npm run lint`, `npm test`, `npm run build`; en este PowerShell se usa `npm.cmd` por la política existente de scripts. Sin instalación de paquetes. Logs normalizados a UTF-8, sin ANSI ni espacios finales; resultados intactos. Códigos de salida en los archivos `*-result.json`.

Las siete pruebas nuevas cubren validación, entrega, horarios, totales, estado temporal y HTML/relaciones de errores. La suite existente se ejecutó como solicitó el usuario; no se repitieron auditorías independientes ni mediciones de contraste.

No se intentó abrir/reparar el navegador. Capturas, responsive visual, teclado/foco/diálogos, zoom y consola se omiten y quedan pendientes. Axe/NVDA aplazados. Nuevos pendientes y decisiones en el [reporte breve](../../trazabilidad/fase5-checkout.md); se conservan los [pendientes anteriores](../fase4/casos-pendientes.md). Los tests SSR no acreditan interacción. No se declara conformidad WCAG global.
