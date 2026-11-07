# Fase 3: personalización

Base autorizada: `adfcf31`. Se implementan configuradores, cantidades, cálculo, disponibilidad y diálogos. No se implementan operaciones de carrito, edición de ítems guardados, checkout, pagos o QR.

## Definiciones por producto

`src/data/customizations.ts` compone cada producto del catálogo con sus variantes, valores iniciales y grupos. Las hamburguesas tienen tamaño, papas, salsas, ingredientes retirables y extras. Royal y BBQ tienen ingredientes propios. Los combos tienen principal, papas, bebida, salsas y extras; no se les fuerza un grupo de ingredientes de hamburguesa. Las promociones tienen de una a tres etapas aplicables: por ejemplo, Dúo Royal solo tiene salsas y Familiar tiene presentación, bebida y acompañamiento adicional.

Los datos base del APF2 se conservan. En Cheese, la mediana está incluida, la grande añade S/3.00 y las papas grandes/rústicas añaden S/4.00, según figuras B2/B5. Los demás datos nuevos de opciones y sus precios se identifican como mocks académicos. Extra queso S/2.50 y extra tocino S/3.50 son precios mock; no se presentan como precios documentados ni comerciales actuales. Cada variante/opción conserva procedencia.

## Precio y restricciones

`evaluateConfiguration` valida antes de devolver un precio utilizable. La fórmula es: precio base + una variante aplicable + cada opción seleccionada una sola vez; después se multiplica por cantidad. Los adicionales de una promoción se cobran por promoción completa, sin volver a multiplicarlos por sus hamburguesas internas.

Se usan enteros seguros en céntimos. Se rechazan duplicados, grupos/opciones/variantes ajenos, formatos inválidos, selecciones fuera de mínimos/máximos, referencias agotadas, precios fraccionarios/negativos y desbordamientos. La cantidad admite de 1 a 99 unidades, límite de demostración indicado junto al campo. Una configuración inválida conserva sus selecciones, explica los errores y no muestra un total utilizable.

El borrador vive en el estado local de la pantalla y se reinicia al abrir otro producto. «Revisar configuración» valida ese borrador; no lo agrega, edita ni persiste como ítem de pedido. La ruta de edición de carrito continúa mostrando un estado informativo sin operaciones.

## Disponibilidad y cambio de local

`src/data/availability.ts` extiende la matriz de productos de Fase 2 con restricciones de variantes y opciones. Solo se consideran disponibles referencias conocidas del producto y local. Todo resultado no disponible contiene un motivo textual. Se mantienen las papas rústicas agotadas en San Miguel como caso APF2; los demás cambios por local son simulados.

Las opciones agotadas se muestran deshabilitadas con texto explicativo antes de intentar seleccionarlas. «Ver locales» abre un diálogo informativo de esa opción/variante. No se abre un aviso inesperado al marcar una opción.

Cambiar a un local incompatible abre «Cambiar de local», con producto, elementos afectados, explicación y acciones explícitas. Cancelar/Escape conserva el local. Confirmar conserva el borrador y vuelve inválidas las selecciones incompatibles, sin sustituirlas automáticamente. Los grupos múltiples permiten limpiar explícitamente la selección para retirar también opciones agotadas; en radios se elige otra opción disponible.

Se conserva `prepareLocationChange`: si existen ítems en memoria o almacenamiento, o la instantánea no puede leerse, el cambio se bloquea y se explica en un diálogo. No se alteran ni eliminan esos ítems. Se vuelve a leer la instantánea al confirmar para proteger pedidos guardados entre la apertura y la confirmación. La gestión completa de impacto sobre el carrito pertenece a Fase 4.

## Semántica y foco implementados

- Grupos con `fieldset`/`legend`, radios/checkboxes nativos, obligatoriedad, instrucciones, precios, selección visible y mensajes relacionados.
- Indicador de etapas con lista ordenada de elementos `li` y enlaces a secciones; no impone cinco etapas a todos los productos.
- Cantidad con etiqueta, límites, botones nativos y errores asociados. El envío inválido dirige el foco al primer campo afectado.
- Resumen de precios y resultado de revisión con regiones de estado; errores visibles además de anuncios.
- `<dialog>` nativo en la capa superior: título asociado, foco inicial en el título, fondo inerte suministrado por `showModal`, contención adicional de Tab/Shift+Tab, cancelación con Escape y devolución del foco al disparador conectado. El botón que abre el cambio de local permanece habilitado para poder recuperar el foco tras confirmar.
- Targets principales con mínimo `max(44px, 2.75rem)` y foco visible. Se conservan idioma español, esquema claro y reducción de movimiento.

Estos son comportamientos implementados, no resultados de una prueba de interacción ni una declaración de conformidad WCAG global. Los tests SSR no ejecutan `showModal` ni comprueban foco real.

## Evidencias y pendientes

Véase [validación de Fase 3](../evidencias/fase3/README.md). Se conservan los [pendientes de Fase 2](../evidencias/fase2/README.md). Axe sigue aplazado. El reporte previo del usuario sobre zoom al 200 % no acredita estas pantallas o diálogos nuevos.
