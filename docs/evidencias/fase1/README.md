# Evidencias de cierre de Fase 1

Fecha: 7 de noviembre de 2026, America/Lima. Base Git: `01d9d34abe752d720db1021a22748bc9b6a8f225`. Este registro distingue la ejecución actual de la auditoría recibida del usuario. No reutiliza sus capturas o resultados como nuevas ejecuciones.

**Estado: ajustes técnicos implementados y checks aprobados; aceptación visual y de interacción pendiente por bloqueo del control del navegador. No se acredita el cierre completo de Fase 1 ni conformidad WCAG global.**

## Actualización aportada por el usuario al autorizar Fase 2

El 7 de noviembre de 2026 el usuario informó: «revisé manualmente el zoom al 200 % y no encontré problemas». Se registra como revisión manual aportada por el usuario sobre el prototipo anterior a la Fase 2; el agente no la repitió ni recibió capturas, medidas de viewport o identificación del navegador de esa revisión. No acredita todavía el nuevo catálogo de Fase 2.

El usuario autorizó continuar Fase 2, pospuso axe y estableció que ese pendiente no bloquea su inicio. Se conservan los demás pendientes de validación. Esta actualización no declara conformidad WCAG global.

## Ejecuciones reales

| Comprobación | Resultado | Evidencia |
| --- | --- | --- |
| `npm run lint` | Código de salida 0 | [lint.log](lint.log) |
| `npm test` | 6 tests aprobados, 0 fallidos; salida 0 | [tests.log](tests.log) |
| `npm run build` | TypeScript y Vite aprobados; salida 0 | [build.log](build.log) |
| Puerto fijo | Segundo `npm run dev` rechaza el puerto 5173 ocupado; salida 1 esperada | [strict-port.log](strict-port.log) |
| Servicio local | 8 direcciones respondieron HTTP 200 con HTML `lang="es"` | [http.json](http.json) |
| Build y Git | Idioma/título base/esquema claro presentes; sin media de dark mode; lockfile idéntico a la base; dist/node_modules ignorados | [build-y-git.json](build-y-git.json) |

El servidor de desarrollo ya estaba activo. No se detuvo ni se sustituyó ese proceso. La prueba del puerto ocupado verifica que Vite falla en vez de desplazarse silenciosamente a otro puerto.

HTTP 200 solo acredita que Vite entrega el HTML. No ejecuta React, no valida redirecciones DOM, títulos dinámicos ni navegación por teclado. El fallback 404 de la SPA también devuelve HTTP 200 en desarrollo.

## Cambios revisados en código

- Dirección y puerto permanentes en `vite.config.ts`: `127.0.0.1`, `5173`, `strictPort: true`.
- `RouteEffects` compara `/` y `/menu` como la misma pantalla. No llama a `focus` por esa redirección inicial. Las transiciones entre otras pantallas conservan foco a `main` y scroll al inicio. Esta revisión no sustituye los casos DOM indicados abajo.
- `npm test` reproduce los tests existentes usando Node 22.19.0. No se añadieron dependencias y `package-lock.json` conserva el mismo blob Git que la base.

## Bloqueo de navegador

Al abrir la URL local explícita mediante `cua.createBrowserTab` en los proveedores `iab` y `chrome`, ambos intentos devolvieron: `The browser access host is unavailable`. El inventario posterior devolvió una lista de navegadores vacía y el mismo error. El entorno y los intentos se registran en [entorno.json](entorno.json).

Por ello no se generaron capturas de pantalla, resultados axe, trazas de teclado ni registros de consola del navegador en esta ejecución. Los logs de Vite, lint y Node no se presentan como evidencia de consola del navegador. Tener axe instalado tampoco se presenta como haberlo ejecutado.

## Aceptación pendiente

| Prueba | Cobertura que falta | Estado |
| --- | --- | --- |
| Visual por pantalla | Menú, personalización, pedido, edición, pago, confirmación y 404 a 360/390/430/768/1024/1440 px | No ejecutada en este cierre |
| Navegación fija móvil | Captura del viewport al inicio y al final de cada pantalla; verificar footer, enlaces y foco sin ocultación | No ejecutada |
| Foco inicial | Cargar `/`, Tab; cargar `/menu`, Tab: ambos deben llegar al skip link | Corrección aplicada; validación DOM pendiente |
| Skip link | Enter mueve el foco a `main`; siguiente Tab llega a la acción del contenido | No repetida tras el ajuste |
| Teclado | Tab/Shift+Tab/Enter en todas las rutas, edición y 404; Atrás/Adelante y títulos/foco | No repetida tras el ajuste |
| Zoom real 200 % | Revisión del prototipo previo a Fase 2 | Usuario informa revisión manual sin problemas; no repetida por el agente |
| axe | Ejecución real por pantalla, con versión, violaciones e incompletos | Pendiente y aplazada por el usuario; no bloquea el inicio de Fase 2 |
| Consola | Errores, warnings y excepciones durante carga y navegación | No capturada |

Espacio en botones y Escape en diálogos no tienen un caso operativo en estos shells: los controles disponibles son enlaces y no hay modales. No se añadieron controles para simular esas pruebas. NVDA y pruebas con usuarios siguen pendientes del plan académico.

## Cómo repetir la aceptación

1. Conectar el control de navegador y abrir una pestaña dedicada en `http://127.0.0.1:5173/menu`. Si no hay servidor, ejecutar `npm run dev`.
2. Recorrer las siete rutas de la tabla, en los seis anchos. Guardar capturas de viewport superior/inferior y registrar tamaño, ruta, navegador y observaciones; no inferir visibilidad desde capturas de página completa.
3. Repetir explícitamente ambos casos de entrada y el flujo con teclado; registrar `document.activeElement`, título y foco visible.
4. Ajustar Chrome desde su menú a 200 %, confirmar el indicador y recorrer todas las pantallas con teclado. Registrar solapamientos, recortes o pérdida de acciones y restaurar 100 %.
5. Ejecutar axe usando la herramienta ya instalada, conservar su salida real y registrar consola. Corregir solo problemas de fundación y repetir los casos afectados.
6. Actualizar este registro con resultados reales antes de declarar terminada la aceptación visual. La Fase 2 requiere aprobación independiente.
