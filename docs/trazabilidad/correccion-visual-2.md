# Corrección puntual sobre la segunda iteración

Base `672f78e`, 7 de noviembre de 2026, America/Lima. No se ejecuta la Fase 8 completa.

- **Avisos:** se retiran `--toast-space`, su medición y el padding dinámico. Solo se mide el header para `offset`/`mobileOffset`. Sonner conserva posición fija, transformaciones y pila nativas; la región flotante tiene desplazamiento vertical limitado al viewport. El contenedor ignora eventos de puntero y los avisos los reciben, sin una capa invisible que intercepte el contenido. Estados, cierre, anuncios y Deshacer infinito se conservan. Superposición y estabilidad reales pendientes de navegador.
- **Cantidades:** `QuantitySelector` compartido por personalización y carrito, con botones −/+ y `output` no editable anunciado. Límites 1–99, estados deshabilitados, nombres específicos y destino de foco conservados. No hay input numérico ni entrada manual.
- **Tarjeta:** vencimiento de texto, placeholder MM/AA y teclado numérico. Se conserva la edición libre; cuatro dígitos completos se normalizan al perder foco o enviar, sin máscara durante escritura/borrado/pegado. La validación anterior sigue comprobando mes/año. Ayuda opcional sin nodos ni referencias ARIA ausentes; ayudas debajo del control. Vencimiento/CVV comparten fila desde 768 px, con campos de altura/bordes uniformes. Alineación real pendiente.
- **Checkout:** retroceso genérico solo en el segundo paso; la revisión mantiene editar entrega/pago/pedido y confirmar. Se retira el control de rechazo del formulario del cliente; los escenarios de rechazo siguen probados en el reducer. El pago de prueba válido mantiene su comportamiento normal, sin servicios bancarios reales.
- **Comprobante:** miniatura desde una referencia copiada al confirmar, nombre sin número añadido, cantidad/configuración/importes separados y detalle inicialmente cerrado. Se guarda solo `image.src` y, cuando corresponde, `duo`; una lista explícita de recursos locales permitidos es independiente del catálogo. Se conservan esos archivos históricos. No se admiten URLs, datos embebidos, consultas ni rutas arbitrarias. Comprobantes anteriores sin foto se recuperan con alternativa; nombres/configuración/precios permanecen en su instantánea. Sin cambios de versión ni ampliación con datos sensibles.

## Fotografías y cobertura pendiente

Doce fotografías oficiales nuevas: mayonesa, ketchup, papas medianas/grandes, queso, tocino y tamaños mediano/grande de Cheese, Royal y Clásica, obtenidos de las opciones públicas de [Bembos](https://www.bembos.com.pe/promo-cheese) y sus páginas de hamburguesas. Dos fotos genéricas ajenas a Bembos: [limonada de Lemur12, con atribución](https://commons.wikimedia.org/wiki/File:Glass_of_lemonade.jpg) y [aros de Jon Sullivan, dominio público](https://commons.wikimedia.org/wiki/File:Onion_rings_fried.jpg). Créditos visibles junto a sus opciones. Bytes sin editar, inspección individual de archivos y referencias locales; no son capturas de la app.

[Manifiesto actualizado](../recursos-correccion-visual.json): fuentes, autor/licencia cuando corresponde, tamaño, hash y cada ocurrencia pendiente. Se reutilizan las fotos anteriores adecuadas. **No se declara cobertura completa.** Permanecen con ilustración/pictograma:

| Opción sin fotografía comprobada | Dónde | Motivo |
| --- | --- | --- |
| Papas rústicas | Cheese, Royal, Clásica, BBQ y los cuatro combos (8 controles) | No localizada en fuentes oficiales consultadas; la descarga de una referencia de Commons devolvió HTTP 429. No se insistió tras ese límite. |
| BBQ mediana y BBQ grande | BBQ (2 controles) | Producto del prototipo, sin fotografía correspondiente verificada. |
| Principal BBQ | Alternativa de Combo Royal e incluido de Combo BBQ (2 controles) | Se retira el uso de una fotografía referencial de otro producto como sustituto. |
| Para dos personas y Para cuatro personas | Familiar (2 controles) | Presentaciones del prototipo sin recurso exacto comprobado. |

Los controles para retirar ingredientes no incorporan fotografías: representan omisiones de receta, no adicionales. No se cambian productos, precios APF2 ni reglas de disponibilidad.

## Verificación

Sin dependencias nuevas ni cambios de lockfile. [Resultados y logs](../evidencias/correccion-visual/README.md). Siete pruebas nuevas cubren cantidades, vencimiento/validación, ayuda opcional, retroceso/conservación, imágenes seguras e instantáneas históricas, compatibilidad sin fotografía y cobertura declarada. Se ajusta la expectativa anterior de ayuda permanente del vencimiento; se mantienen rechazo, confirmación única, privacidad y limpieza interna en la suite existente.

Sin reintentar el navegador. Quedan pendientes superposición/ausencia de saltos, scroll y clic a través del área vacía de avisos, varios Deshacer, alineación de campos, miniaturas/detalle, edición real de vencimiento y teclado/foco en los controles nuevos. Se conservan los demás [pendientes anteriores](iteracion-visual-2.md), incluidos responsive, zoom real, diálogos, consola, axe y NVDA. No se acredita interacción mediante SSR ni se declara conformidad WCAG global. Se detiene para revisión.
