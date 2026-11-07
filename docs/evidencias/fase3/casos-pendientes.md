# Casos de aceptación pendientes de navegador

Todos los casos siguientes están **pendientes / no ejecutados en navegador** por falta de acceso a la herramienta. Los resultados esperados no son resultados observados. Axe continúa aplazado.

| Caso | Acción | Resultado esperado que debe comprobarse |
| --- | --- | --- |
| P3-01 | Abrir Cheese en San Miguel | Mediana y papas medianas iniciales; papas rústicas deshabilitadas con motivo previo; nombres, selección y precios legibles |
| P3-02 | Elegir grande, papas grandes, extra queso y cantidad 2; revisar | Unidad S/26.40, total S/52.80; mensaje de revisión; no se agrega ni persiste un ítem |
| P3-03 | Desde ese borrador, elegir Demo Centro y Aplicar local | Diálogo con título, producto y restricciones de variante/papas; foco dentro y fondo inaccesible |
| P3-04 | En el diálogo anterior, cancelar, usar Escape y luego confirmar en reapertura | Cancelar/Escape conservan San Miguel; confirmar cambia el local, conserva borrador y marca restricciones; foco devuelto a Aplicar local |
| P3-05 | Abrir Ver locales de papas rústicas | Estado explicado por local; Tab/Shift+Tab contenidos, cierre con botón/Escape y devolución al botón exacto |
| P3-06 | Seleccionar extra tocino de Cheese y cambiar a Demo Norte | Advertencia; selección agotada conservada y deshabilitada tras confirmar; Limpiar selección permite corregirla |
| P3-07 | Recorrer hamburguesas, combos, Dúo Royal y Familiar en un local disponible | Etapas distintas; no se fuerza tamaño/ingredientes a todos; cantidades y adicionales aplicados por unidad/promoción |
| P3-08 | Abrir Royal directamente en Demo Norte | Estado agotado, motivo y alternativas; no se ofrecen opciones configurables mientras esté agotado |
| P3-09 | Abrir producto desconocido y ruta de edición de pedido | Estado explícito; no se duplica, guarda ni modifica un ítem de carrito |
| P3-10 | Probar cantidad vacía, 0, fracción y mayor de 99; exceder salsas; revisar con varios errores | Errores textuales asociados, total no utilizable y foco en el primer campo inválido según orden de la pantalla |
| P3-11 | Preparar una instantánea académica de pedido guardado y solicitar otro local | Diálogo bloqueante sin acción de confirmar cambio; datos/local conservados, también si la instantánea está dañada o es inaccesible |
| P3-12 | Guardar un pedido en otra pestaña mientras está abierto el diálogo de confirmación del borrador | Relectura impide sobrescribir el pedido; cierre y explicación visible, sin cambio de local |
| P3-13 | Recorrer con Tab, Shift+Tab, Enter, Espacio y flechas todos los radios, checkboxes, cantidad, selector y acciones | Orden lógico, estados nativos y foco visible; ausencia de trampas fuera de los diálogos; Escape cierra los diálogos |
| P3-14 | Revisar 360/390/430/768/1024/1440 px y zoom real del navegador al 200 %, al principio y al final | Sin pérdidas de controles o textos, targets principales ≥44×44 CSS px y navegación fija sin ocultaciones; revisar también diálogos largos |
| P3-15 | Capturar consola durante carga, cambios, revisión, apertura/cierre de diálogos y rutas | Ausencia de errores importantes; guardar resultados reales con navegador y versión |
| P3-16 | Probar lectura de selección, disponibilidad, errores y precios con tecnología de apoyo cuando corresponda | Nombres, agrupación, estado y anuncios comprensibles; registrar evidencia real sin inferirla de SSR |

Los pendientes de Fase 2 no se eliminan con esta lista. La revisión previa de zoom comunicada por el usuario no cubre estas pantallas nuevas.
