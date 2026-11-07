# Fase 2: menú

Alcance autorizado: catálogo, categorías, búsqueda, productos y selector de local. No se han implementado configuradores, opciones por producto, operaciones de carrito, checkout, pagos, QR ni Toast.

## Datos y activos

El catálogo contiene 12 productos, cuatro por categoría. Los datos APF2 se transcriben de la figura B1 de `APF2_Grupo6_Bembos.pdf`:

| Producto | Precio | Descripción documentada |
| --- | --- | --- |
| Cheese | S/16.90 | Carne a la parrilla, queso fundido, lechuga y tomate. |
| Royal | S/21.90 | Carne, huevo frito, tocino y salsa especial. |

Los otros diez productos y precios son mocks académicos identificados en cada tarjeta. La interfaz aclara que no son ofertas comerciales vigentes. Cada registro conserva su procedencia.

Se extrajo sin alterar sus bytes el JPEG incrustado del menú APF2, objeto PDF 87, de 361 × 692 px. Las tarjetas de Cheese y Royal muestran únicamente las áreas de sus fotos mediante CSS; no se han fabricado nuevas fotos ni afirmado que sean imágenes comerciales actuales. Son referencias de baja resolución procedentes de capturas. Los mocks utilizan cuatro ilustraciones SVG locales, también referenciales. Todos los recursos se sirven desde el proyecto.

## Comportamiento y semántica

- Búsqueda controlada en nombre, descripción y categoría, sin distinguir mayúsculas, acentos ni espacios exteriores. No utiliza HTML inyectado.
- Categorías con radios nativos, `fieldset` y `legend`. La categoría y la búsqueda se combinan; «Todas» permite buscar en las tres categorías.
- Resultados inmediatos y región `role="status"` siempre montada. Los anuncios se agrupan tras 300 ms e incluyen búsqueda, categoría y local, sin mover el foco. Se muestra el mensaje requerido cuando no hay resultados.
- Tarjetas con encabezados, imagen y `alt`, descripción, categoría, precio, procedencia, disponibilidad textual e icono. Los enlaces «Ver producto» abren el shell existente de personalización; no configuran ni agregan productos. Los agotados tienen un botón nativo deshabilitado y motivo visible.
- Menú en una columna móvil, dos desde 768 px y tres desde 1024 px, dentro del ancho máximo de la fundación. La comprobación visual real continúa pendiente.

## Locales y límites de esta fase

Local inicial: Bembos San Miguel. Opciones adicionales: Bembos Local Demo Centro y Bembos Local Demo Norte. Un `select` con etiqueta permite escoger; el botón «Aplicar local» confirma el cambio explícitamente. No hay geolocalización ni consulta de stock real.

La matriz de esta fase solo simula disponibilidad de productos completos. La disponibilidad de acompañamientos, variantes y configuraciones corresponde a Fase 3. No se han definido todavía esos configuradores.

El Header refleja el local seleccionado. Se persiste usando el contrato existente `bembos.apf3.order` y al cargar se recupera exclusivamente el ID del local; los ítems todavía no se hidratan en la interfaz. Si existe un pedido en memoria o almacenamiento, o la instantánea está dañada/inaccesible, se conserva el local y los datos con una explicación. Este resguardo evita borrar o invalidar pedidos sin adelantar el diálogo de impacto de Fase 3 ni el carrito de Fase 4.

## Validación y continuidad

La revisión manual del zoom al 200 % comunicada por el usuario queda registrada en [Fase 1](../evidencias/fase1/README.md). Su alcance es la versión previa al nuevo catálogo. Axe está pospuesto por autorización expresa y no bloquea el inicio de esta fase. No se han eliminado los demás pendientes ni declarado conformidad WCAG global.

Los resultados y límites de la verificación actual se registran en [evidencias de Fase 2](../evidencias/fase2/README.md). La prueba de markup usa renderizado estático de React con Vite; no equivale a eventos del navegador, lectura de anuncios o navegación con teclado.
