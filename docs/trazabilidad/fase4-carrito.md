# Fase 4: carrito

Base autorizada: `e8cb02425ce2a5a992a72725e229731b5c6a22b0`. Alcance: sección Fase 4 de PROJECT_CONTEXT y precisiones del usuario. No se implementan checkout, formularios de entrega/pago, pagos, QR o confirmación final. Fase 5 requiere nueva aprobación.

## Implementado y archivos principales

- `src/features/cart/cart.ts`: operaciones puras, identidad, edición, eliminación, restauración, revisión de compatibilidad e hidratación del pedido.
- `src/state/appState.ts` y `src/app/providers.tsx`: acciones de carrito, anuncios/avisos en memoria, lectura inicial sin escrituras, persistencia de acciones explícitas y tolerancia a fallos.
- `src/features/customization/ProductConfigurator.tsx` y `src/pages/CustomizePage.tsx`: agregar y editar, carga exacta y cancelación sin guardar. Un ítem ausente no se convierte en un alta accidental.
- `src/pages/CartPage.tsx` y `src/features/cart/Cart.css`: productos, selecciones, cantidades, importes, restricciones, limpieza y disposición vertical/lateral según ancho.
- `src/components/ui/Toaster.*` y `src/components/accessibility/LiveAnnouncement.tsx`: avisos persistentes con Deshacer y región de estado sin foco automático.
- `src/features/locations/*`: descripción de impacto, confirmación y relectura de la copia guardada. `CheckoutPage.tsx` solo protege la pantalla base existente, también en acceso directo.
- `src/storage/browserStorage.ts`: conserva el contrato y agrega eliminación exclusiva de la clave de pedido. No se alteran datos APF2, matriz, imágenes ni dependencias.
- Tests de carrito y SSR; README, comando `npm test` y evidencias de esta fase.

## Identidad, edición, cantidades e importes

Cada alta usa `crypto.randomUUID()` y mantiene un `itemId` independiente. Dos configuraciones idénticas se conservan como dos ítems; no se fusionan. El reducer rechaza IDs repetidos en altas, referencias inválidas y cantidades fuera de 1–99. Editar identifica el ítem por su ID, carga una copia exacta de selección/cantidad y actualiza solo esa posición. No recalcula una selección predeterminada al abrir la edición. La acción global de restablecimiento fue retirada en la segunda iteración visual. Las opciones se cambian mediante sus controles; cancelar conserva el pedido original. Si una referencia obsoleta no se puede corregir, se puede eliminar el ítem y agregarlo nuevamente.

Agregar, editar y cantidades reutilizan la validación completa de Fase 3. Los importes usan enteros seguros en céntimos: base + variante + cada adicional una vez, multiplicado por cantidad. `quoteConfiguration` comparte el mismo evaluador, omitiendo únicamente disponibilidad para mostrar el importe informativo de un ítem retenido. Esa cotización nunca autoriza agregar ni continuar al pago. Si los datos no permiten cotizar, no se usa el precio guardado ni se presenta cero como precio válido.

## Eliminar, Deshacer y foco

Eliminar no abre diálogo. Guarda en memoria copia de ítem, índice y IDs de vecinos anteriores/posteriores. Deshacer restaura la misma identidad, selección y cantidad, usando el vecino superviviente o índice original. Se recalcula y revisa disponibilidad en el local actual; puede quedar «Requiere actualización». Cada eliminación conserva su propio Deshacer, sin caducidad automática. Cerrar su aviso descarta esa oportunidad. Los avisos informativos sin Deshacer se sustituyen por el aviso nuevo para evitar acumulación.

La implementación prepara el foco tras eliminar al encabezado del siguiente ítem, anterior o estado vacío. Al llegar a los límites de cantidad, se prepara el foco al texto de cantidad para evitar perderlo en un botón que se deshabilita. No se mueve al Toast al aparecer. El botón Deshacer y Cerrar aviso son nativos; cuando el control activado desaparece se prepara un destino conectado. Los diálogos de limpieza/local reutilizan `AccessibleModal`: título, `showModal`, contención de Tab, Escape y devolución al disparador. Los botones que los abren se mantienen montados. Si una relectura cambia los motivos del diálogo de local, se vuelve a abrir con foco preparado al título, conservando el disparador. **Ninguna de estas interacciones se declara ejecutada en navegador.**

## Recuperación y almacenamiento

Se conserva `bembos.apf3.order` en `localStorage`, sobre `schemaVersion: 1`, `catalogVersion: 1`. La lectura estructural aplica listas permitidas; la recuperación semántica vuelve a consultar productos, grupos, opciones, variantes, cantidades y disponibilidad. Recalcula precios; las restricciones son derivadas, no flags de confianza guardados. Ítems obsoletos se conservan con sus referencias originales y se bloquea continuar. IDs duplicados dañados se reparan de forma determinista sin fusionar ni perder ítems; se explica al usuario.

No se escribe durante la inicialización, incluso con StrictMode. JSON/formato dañado o versiones de sobre/catálogo incompatibles dejan un pedido temporal y un aviso; la copia se mantiene hasta una acción explícita que guarde un nuevo pedido o limpieza confirmada. No se intenta una migración adivinando estructuras futuras. El acceso bloqueado o cuota agotada no arrojan excepciones hacia la UI: permanece el estado en memoria con advertencia. Si falla borrar la copia se explica que puede reaparecer al recargar.

«Restauramos tu pedido anterior» se coloca en una región `role="status"` montada vacía y se actualiza después del montaje, sin llamada a `focus`. La eficacia de su anuncio con NVDA sigue pendiente. La persistencia guarda solo producto, configuración, cantidad, precio recalculado, local y versión; los avisos/Deshacer no se persisten.

La operación manual de limpieza de esta fase fue retirada en la segunda iteración visual; ya no está disponible. Se conservan eliminación individual, Deshacer y limpieza interna tras confirmar.

## Cambio de local y protección

Se revisan todos los ítems contra el destino y se describen por número, producto y motivos. Si hay impacto o afecta al borrador del configurador, se exige confirmar «Cambiar de local». Cancelar/Escape conserva el pedido. Confirmar conserva los ítems y sus selecciones, deriva «Requiere actualización» y bloquea continuar hasta editar/eliminar o elegir un local compatible. La ruta `/pagar` también verifica esa condición, pero sigue siendo un shell.

Se relee `localStorage` al abrir y confirmar; un pedido guardado diferente no se sobrescribe al cambiar de local. La comparación ignora precios antiguos y considera la reparación determinista de IDs. Los datos ilegibles requieren revisión/limpieza explícita; almacenamiento inaccesible permite cambiar en memoria y advierte del fallo de guardado. No se implementa sincronización de pestañas: otras operaciones explícitas siguen el modelo de un pedido por pestaña.

## Accesibilidad trabajada

Se conservan HTML nativo, labels, idioma español, títulos, targets con mínimo CSS 44 × 44 px y foco visible. Listas de ítems, encabezados y listas de definición relacionan selección y producto (1.3.1); textos explícitos comunican restricciones sin solo color (1.4.1), etiquetas visibles están incluidas en los nombres (2.5.3), confirmaciones y destinos de foco abordan 2.4.3/3.2.2, instrucciones y límites mantienen 3.3.2. Los colores usan tokens existentes. No se han medido nuevos controles renderizados ni se declara conformidad WCAG global.

## Pruebas, evidencias y pendientes

Comandos reproducibles y resultados reales en [evidencias de Fase 4](../evidencias/fase4/README.md). Los tests unitarios/SSR verifican reglas y markup, incluida recuperación desde el provider sin escrituras iniciales. SSR no ejecuta eventos, foco, `showModal`, regiones vivas ni estilos de navegador.

Se conservan pendientes de [Fase 2](../evidencias/fase2/README.md) y [Fase 3](../evidencias/fase3/casos-pendientes.md). Axe sigue aplazado por el usuario. El zoom manual previo al 200 % reportado por el usuario no acredita pantallas nuevas. El navegador volvió a estar inaccesible en esta fase; no se fabrican capturas ni resultados.

Riesgos pendientes: interacción real de diálogos/anuncios/foco y revisión responsive/zoom; persistencia limitada al origen y permisos del navegador; ausencia de sincronización concurrente general entre pestañas. Ninguno se presenta como validado por las pruebas de lógica.

Siguiente fase propuesta: Fase 5 — Checkout, únicamente tras aprobación expresa.
