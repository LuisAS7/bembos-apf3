# Evidencias de corrección puntual

Base `672f78e`; 2026-11-07, America/Lima. [Reporte](../../trazabilidad/correccion-visual-2.md).

| Comando reproducible | Resultado | Evidencia |
| --- | --- | --- |
| `npm.cmd run lint` | Exit 0, sin errores ni warnings | [lint.log](lint.log) |
| `npm.cmd test` | 101 aprobados, 0 fallos | [tests.log](tests.log) |
| `npm.cmd run build` | TypeScript + Vite, exit 0 | [build.log](build.log) |

[Fecha y códigos de salida](results.json). Node 22.19.0; runner nativo en serie. En otras terminales se puede usar `npm run lint`, `npm test`, `npm run build`. Sin dependencias nuevas ni modificación del lockfile. Logs reales normalizados a UTF-8, sin ANSI ni espacios finales. `dist/` sigue ignorado.

94 pruebas anteriores más siete nuevas. Se verifican contratos/callbacks de cantidades y límites, formato de vencimiento/validación existente, ayuda y errores asociados, política de retroceso y conservación del checkout, instantáneas con referencias locales permitidas, recuperación sin fotografía, datos históricos sin consultar catálogo y correspondencia entre cobertura fotográfica y pendientes. Los casos anteriores de rechazo y confirmación única siguen activos.

Se inspeccionaron individualmente los catorce recursos descargados como archivos locales; [fuentes, créditos, hashes y opciones pendientes](../../recursos-correccion-visual.json). Son fotografías de recursos, no capturas ni evaluación visual de la app.

Sin reintento de navegador. No se verifican como aprobados: superposición real, estabilidad al aparecer/desaparecer avisos, scroll de varios Deshacer, clic a través del área vacía, alineación de campos, responsive, edición/pegado real, teclado/foco, apertura del detalle, diálogos, zoom, consola ni anuncios con lector. Axe/NVDA y pendientes anteriores se conservan por referencia en el reporte. SSR y callbacks aislados no ejecutan interacción real ni acreditan conformidad WCAG global. Fase 8 no iniciada.
