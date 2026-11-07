# Evidencias de Fase 3

Fecha: 7 de noviembre de 2026, America/Lima. Base autorizada: `adfcf31`. Se implementan personalización, cantidades, precios, restricciones y diálogos; no operaciones de carrito, checkout ni pagos.

## Ejecuciones reales

| Comprobación | Resultado | Evidencia |
| --- | --- | --- |
| `npm run lint` | Aprobado, salida 0 | [lint.log](lint.log) |
| `npm test` | 33 aprobados, 0 fallidos | [tests.log](tests.log) |
| `npm run build` | TypeScript y Vite aprobados, salida 0 | [build.log](build.log) |
| Cálculo de configuración | 36 casos predeterminados producto/local y tres ejemplos configurados de Cheese evaluados con Node | [precios-disponibilidad.json](precios-disponibilidad.json) |
| Build | HTML en español y título base descriptivo conservados | [build.json](build.json) |
| HTTP local | Seis rutas entregaron HTML con respuesta 200 | [http.json](http.json) |
| Entorno y dependencias | Node 22.19.0; lockfile idéntico a la base, sin instalaciones nuevas | [entorno.json](entorno.json) |

Los 33 tests incluyen los 16 previos y 17 nuevos. Los nuevos verifican definiciones de los 12 productos; etapas aplicables; precios APF2; cálculo sin duplicados; promociones y variantes; grupos obligatorios; límites; referencias ajenas; formatos inválidos; disponibilidad por local; no mutación de borradores; precios inseguros; y markup de configuradores, estados y diálogo.

Ejemplo calculado: Cheese grande + papas grandes + extra queso mock = 2640 céntimos por unidad; cantidad 2 = 5280 céntimos en San Miguel. El mismo borrador es inválido en Demo Centro por variante/papas y en Demo Norte por variante. Los resultados JSON proceden de la función de evaluación; no de una sesión de navegador ni de un pedido real.

El test SSR comprueba el número de grupos de cada producto, leyendas, cantidad, restricciones deshabilitadas y textos, ausencia de acción Agregar al pedido, formularios sin anidamiento, estados de producto desconocido/agotado, edición no habilitada y asociación de título del diálogo. SSR no ejecuta efectos, `showModal`, contención del foco, fondo inerte, Escape, retorno de foco ni eventos de formulario. Esas interacciones no se consideran verificadas.

HTTP 200 acredita entrega del HTML de la SPA, incluido su fallback; no valida el estado renderizado ni títulos dinámicos, cálculos visibles o navegación.

## Navegador y pendientes

Se intentó abrir una pestaña dedicada en `http://127.0.0.1:5173/productos/cheese/personalizar`. La herramienta devolvió `The browser access host is unavailable`. No hay capturas, grabaciones de teclado ni consola de navegador nuevas.

Los [casos de aceptación pendientes](casos-pendientes.md) detallan las comprobaciones necesarias. Se conservan íntegramente los [pendientes de Fase 2](../fase2/README.md): revisión visual por tamaño, interacción de teclado, foco inicial/skip link/historial, lectura de regiones de estado y consola, además del plan posterior con NVDA y usuarios.

Axe sigue aplazado por el usuario y no se ejecutó. La revisión de zoom al 200 % comunicada anteriormente no acredita las nuevas pantallas o diálogos; su zoom real sigue pendiente. No se sustituyó por reducir el viewport y no se declara conformidad WCAG global.

## Decisiones y riesgos

- Los borradores se conservan al cambiar de local y los incompatibles no tienen total utilizable. No se eliminan opciones automáticamente.
- Cambiar el local de un pedido ya guardado sigue bloqueado. La confirmación vuelve a comprobar el almacenamiento antes de aplicar un cambio permitido; no existe edición de carrito en esta fase.
- Los diálogos usan la API nativa `<dialog>`. La implementación de foco depende de su comportamiento real en el navegador, que debe verificarse antes de acreditarla.
- Cantidad de demostración: enteros de 1 a 99. Los precios nuevos no documentados se identifican como mock.
- Las fotografías APF2 siguen siendo referencias de baja resolución; no hay activos fotográficos nuevos.

La siguiente fase es Carrito y requiere aprobación expresa. El commit de esta fase registra implementación y resultados técnicos con estos pendientes, no una conformidad global.
