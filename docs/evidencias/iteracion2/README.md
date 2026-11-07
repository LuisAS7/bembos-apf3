# Evidencias de segunda iteración

Base `86a156a`; 2026-11-07, America/Lima. [Cambios y decisiones](../../trazabilidad/iteracion-visual-2.md).

| Comando reproducible | Resultado | Evidencia real |
| --- | --- | --- |
| `npm.cmd run lint` | Exit 0, sin errores ni warnings | [lint.log](lint.log) |
| `npm.cmd test` | 94 tests aprobados, 0 fallos | [tests.log](tests.log) |
| `npm.cmd run build` | TypeScript + Vite, exit 0 | [build.log](build.log) |

[Códigos de salida y fecha](results.json). En otras terminales se puede usar `npm run lint`, `npm test`, `npm run build`. Node 22.19.0; tests en serie con runner nativo, sin dependencias nuevas. Logs normalizados a UTF-8, sin ANSI ni espacios finales. `dist/` generado permanece ignorado; `lang="es"` conservado en HTML generado.

Se añaden cinco pruebas de reglas y una de markup SSR; se retira una prueba exclusiva de la operación manual eliminada: 89 − 1 + 6 = 94. Permanecen los casos de confirmación única, fallos de guardado, limpieza interna, privacidad, identidad, precios y disponibilidad. Las expectativas actualizadas responden a 20 productos/siete categorías, productos sin opciones artificiales, textos naturales, detalle cerrado y aviso de confirmación; no se relajan las reglas de negocio.

Se descargaron once fotografías públicas oficiales y se inspeccionaron individualmente como archivos locales. [Manifiesto verificable](../../recursos-iteracion2.json): fuente, archivo, bytes y SHA-256. Esta inspección de recursos no es una validación visual de la aplicación.

No se reintentó el navegador. No hay capturas de pantallas de esta iteración ni comprobaciones aprobadas de responsive, teclado real, foco, diálogos, zoom, consola o anuncios. El adjunto accesible solo contiene el texto de la solicitud. SSR verifica contenido/semántica, no efectos, temporizadores, eventos ni layout. Axe/NVDA siguen aplazados. La revisión manual de zoom anterior no acredita estas pantallas. Pendientes nuevos y anteriores enlazados en el reporte; sin conformidad WCAG global y sin iniciar Fase 8.
