# Segunda iteración visual y de interacción

Base: `86a156a`, 7 de noviembre de 2026, America/Lima. Autorización específica del usuario; no se ejecuta la Fase 8 completa.

## Cambios y decisiones

- Siete categorías con radios nativos ocultos visualmente, selección con borde/subrayado y foco sobre la etiqueta. Carrito del navbar con icono y contador de unidades. Cantidades, edición y eliminación usan iconos lucide con nombres específicos y targets CSS mínimos de 44 px.
- Salsas nuevas vacías, mínimo cero y máximo dos; editar/recuperar conserva la selección guardada. Se retiran las acciones de limpieza/restablecimiento del configurador. Un checkbox recuperado pero agotado permite desmarcarse; no permite volver a seleccionarlo. Los grupos obligatorios conservan sus reglas.
- Miniaturas compactas, etiquetas completas seleccionables y alternativa ilustrativa para recursos no comprobados. Progreso con círculos conectados y estados textuales; Continuar valida cada etapa, Volver conserva opciones y no aparece al inicio. Resumen con nombre, foto proporcionada, selección, cantidad, precio unitario y total calculado.
- Sonner arriba a la derecha y centrado en móvil. ResizeObserver mide header y avisos; se reserva espacio superior y margen de desplazamiento. Éxito verde, error rojo y advertencia diferenciada. Pago aprobado/rechazado y confirmación notifican desde operaciones completadas; cantidades no crean Toast. Deshacer conserva duración infinita e identidad. Integración/foco reales pendientes.
- Carrito con detalles y acciones agrupadas; enlace para seguir agregando antes del listado. Se elimina la operación manual de vaciado, su diálogo, acción del reducer, rama del provider y test exclusivo. Eliminar individualmente/Deshacer siguen disponibles. Se conserva el borrado interno tras guardar correctamente el comprobante y la limpieza sensible.
- Checkout con un panel activo: entrega/contacto, pago, revisión/confirmación. Reutiliza los motores anteriores. Entrega vive en Context; el formulario de pago permanece montado, oculto con `hidden` al retroceder dentro del asistente, para conservar su borrador exclusivamente en memoria. Se limpia al validar, cambiar método o abandonar el checkout. Etapas ocultas no ofrecen controles mediante Tab. El procesamiento bloquea retrocesos; un cambio de pedido/checkout invalida la aprobación y la revisión. Confirmación está fuera de los formularios.
- Textos naturales en pago/comprobante y ayuda «Usa datos de prueba». El prototipo sigue siendo exclusivamente académico: sin pedidos, donaciones, cobros, servicios bancarios, credenciales reales ni seguimiento. QR Yape de prueba; QR del comprobante contiene solo su ID. Comprobante principal y productos en `details/summary` inicialmente cerrado. Instantánea y recuperación segura se conservan.

## Catálogo, recursos y dependencias

20 productos: se conservan los doce anteriores y se añaden exactamente dos en cada categoría nueva. Menús: Taypá/A Lo Pobre; complementos: Papas Fritas/Nuggets; pollo: Chicken Grill/Bembroster Clásica; loncheritas: Faber Hamburguesa/Faber Nuggets. Los nuevos menús, complementos y loncheritas tienen composición fija; pollo ofrece salsas opcionales y retiro de ingredientes. Todos los nuevos productos están disponibles en los tres locales del prototipo.

Nombres/composición de [Menús Bembos](https://www.bembos.com.pe/menu/bembos-menus), [Complementos](https://www.bembos.com.pe/menu/complementos), [Pollo](https://www.bembos.com.pe/menu/pollo) y [Loncheritas](https://www.bembos.com.pe/menu/loncheritas). Descripciones resumidas; precio, configuración y disponibilidad son mocks académicos documentados en `source`. Cheese S/16.90 y Royal S/21.90 siguen APF2, sin cambiar IDs existentes ni versiones persistidas.

Once fotografías nuevas locales (ocho productos, cola, agua, ají): [procedencia, tamaño y SHA-256](../recursos-iteracion2.json). El sitio no requiere peticiones a Bembos en runtime. Mayonesa, ketchup, rústicas, papas grandes, limonada, tamaños y extras usan pictogramas/ilustraciones, sin atribución oficial. No se usa una misma fotografía para las distintas elecciones de tamaño de papas. Las fotos ya existentes siguen en su [manifiesto anterior](../recursos-visuales.json).

Sin dependencias nuevas; se reutilizan Sonner, lucide-react, qrcode.react, CSS y HTML nativo. Lockfile sin cambios. Se conserva el aviso previo de vulnerabilidades del árbol; no se ejecutan correcciones ajenas a esta iteración.

## Verificación y pendientes

Resultados finales y logs: [evidencias](../evidencias/iteracion2/README.md). Pruebas nuevas: salsas iniciales/edición, ocho altas en tres locales, recuperación/identidad/importes/comprobantes sin datos sensibles, avance del checkout, invalidación, notificación única y eliminación individual reversible. Se actualizan expectativas sustituidas explícitamente por esta autorización. Los tests anteriores de confirmación única, fallo de guardado, limpieza interna y privacidad siguen activos.

No se reintenta el navegador. El adjunto accesible contiene texto; no incluye archivos de capturas utilizables. Se conservan por referencia los [pendientes anteriores](evolucion-visual.md). Pendientes nuevos: revisar las siete categorías, miniaturas, círculos, resumen compacto, avisos superiores con varios Deshacer y header variable; recorrer carrito con iconos y los tres pasos con teclado; comprobar preservación/limpieza de formularios, Enter, foco al error/etapa, diálogos, detalle cerrado y anuncios únicos. Revisar responsive a 360/390/430/768/1024 px, zoom real 200 %, consola y contraste renderizado. Axe y NVDA siguen aplazados. SSR no ejecuta eventos, efectos, foco, temporizadores ni layout; las pruebas de reglas no acreditan interacción real ni conformidad WCAG global.

Se detiene para revisión antes de Fase 8.
