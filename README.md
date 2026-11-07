# APF3 Bembos

Prototipo académico del curso Interacción Hombre Máquina. El alcance y el trabajo por fases se rigen por [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md).

La primera evolución visual autorizada sobre `da30ab7` incorpora recursos oficiales locales, selector de local en el header, categorías visuales, progreso real de personalización y Sonner. Las decisiones visuales anteriores se sustituyen según la nueva solicitud; reglas de precios, disponibilidad, privacidad, persistencia y pagos se conservan. [Cambios, fuentes y pendientes](docs/trazabilidad/evolucion-visual.md). La aceptación visual y de interacción sigue pendiente; no se ejecutó la Fase 8 completa.

La segunda iteración amplía a 20 productos y siete categorías, renueva configurador, carrito, avisos superiores y comprobante, y organiza el checkout en tres etapas. [Cambios, fuentes, verificaciones y pendientes](docs/trazabilidad/iteracion-visual-2.md). Sin dependencias nuevas.

Corrección puntual posterior a `672f78e`: avisos flotantes sin reserva de espacio, cantidades mediante botones, fotografías de opciones, ajustes de tarjeta/checkout y miniaturas históricas del comprobante. [Reporte y cobertura pendiente](docs/trazabilidad/correccion-visual-2.md).

Últimos ajustes móviles sobre `78a386f`: carrusel nativo, descripciones precisadas, barra de personalización y carrito con reserva de espacio, detalles plegables y revisión antes de confirmar. [Cambios y pendientes](docs/trazabilidad/cierre-diseno-movil.md) · [Checklist en teléfono](docs/evidencias/cierre-movil/comprobacion-manual.md). Validación visual pendiente; sin publicación.

La Fase 1 contiene la fundación y la Fase 2 incorpora catálogo, búsqueda y locales. La Fase 3 permite personalizar los 12 productos; la Fase 4 conecta el carrito multiproducto. La Fase 5 añade entrega y resumen; la Fase 6 incorpora pagos simulados y la Fase 7 confirma el pedido de demostración y guarda su último comprobante reducido. Auditoría y pulido posteriores requieren su aprobación.

## Entorno y comandos

Entorno verificado: Node **22.19.0**, npm **10.9.3**. Los tests usan el runner nativo de Node y sus imports TypeScript; usar Node 22.19.0 o posterior compatible. No requieren dependencias adicionales.

```sh
npm run dev
npm run lint
npm test
npm run build
npm run preview -- --host 127.0.0.1
```

En Windows PowerShell con scripts `.ps1` bloqueados, ejecutar los mismos comandos mediante `npm.cmd` (por ejemplo, `npm.cmd test`); no es necesario modificar la política del sistema. `npm test` ejecuta todos los tests, incluidos los de carrito, sin instalar paquetes.

Las dependencias ya están presentes en este entorno. En una copia nueva se restauran desde `package-lock.json` con `npm ci`; ese comando no forma parte de este cierre y no se han instalado paquetes nuevos.

Desarrollo: **http://127.0.0.1:5173/menu**. Vite fija dirección `127.0.0.1`, puerto `5173` y `strictPort: true`. Si el puerto está ocupado, el arranque falla. Usar siempre `127.0.0.1`, ya que `localhost` tiene otro almacenamiento de navegador. Preview sirve el build en otro puerto y también tiene almacenamiento separado.

El build ejecuta TypeScript y Vite y regenera `dist/`, excluido por Git junto con `node_modules/`.

## Pantallas base

| Ruta | Pantalla |
| --- | --- |
| `/` | Redirección inicial al menú |
| `/menu` | Catálogo, búsqueda, categorías y local |
| `/productos/cheese/personalizar` | Configurador del producto; también aplica a otros IDs del catálogo |
| `/pedido` | Pedido |
| `/pedido/:itemId/editar` | Edición del ítem exacto del carrito; un ID ausente muestra un estado explicativo |
| `/pagar` | Entrega, resumen y pagos exclusivamente simulados; bloqueado con pedido vacío o incompatible |
| `/confirmacion/:pedidoId` | Último comprobante de esta sesión, o explicación si no existe/no corresponde |
| Otras rutas | Página no encontrada |

Los enlaces «Ver producto» abren su configurador. «Agregar al pedido» crea un ítem independiente; «Guardar cambios» actualiza ese ítem. La confirmación requiere una aprobación simulada vigente y guardar correctamente el comprobante; acceder a su ruta nunca confirma por sí solo.

## Organización

`src/app` contiene routing y providers; `components` los elementos compartidos; `pages` las pantallas; `domain` los tipos; `state` el Context/reducer; `storage` los adaptadores seguros; `styles` los tokens y reglas globales. `data` contiene catálogo y locales; `features/catalog`, `features/locations`, `features/customization` y `features/cart` agrupan sus controles y funciones. Los recursos gráficos son locales.

## Catálogo y locales

Cuatro hamburguesas, cuatro combos y cuatro promociones, más dos productos en cada categoría nueva: Menús Bembos, Complementos, Pollo y Loncherita por la Educación. Cheese y Royal conservan nombre, descripción y precio del APF2; los otros dieciocho registros se identifican como mock académico. Los precios y el stock simulado no representan información comercial vigente.

Hamburguesas es la categoría inicial; no hay opción Todas. La búsqueda ignora mayúsculas/acentos y cruza siempre las siete categorías; elegir una categoría vuelve a la exploración y limpia la búsqueda. El botón del local en el header abre un selector con confirmación explícita. Si afecta al carrito o borrador, explica el impacto antes de cambiar. Conserva ítems incompatibles con «Requiere actualización» y protege pedidos guardados diferentes. Los IDs siguen siendo `san-miguel`, `demo-centro` y `demo-norte`; sus nombres visibles son San Miguel, Real Plaza y Mall del Sur, ubicaciones simuladas.

## Personalización

Los grupos y variantes se definen por producto: hamburguesas, combos y promociones tienen etapas distintas, más una revisión final de cantidad/resumen. Cada etapa requiere Continuar explícito y válido, incluso si usa opciones predeterminadas o es opcional sin extras. Volver conserva selecciones; cambiar local revalida el progreso. Precios en céntimos, adicionales una vez y cantidad 1–99. Las restricciones se muestran antes de seleccionar y los datos inválidos se conservan para corregirlos.

Las salsas nuevas parten vacías; la edición conserva las guardadas. Se usan fieldsets, radios, checkboxes y botones nativos. Los diálogos se implementan con `<dialog>`, título, foco inicial, contención de Tab, Escape y retorno al disparador. La comprobación real de esos comportamientos sigue pendiente de acceso al navegador.

## Carrito y recuperación

Cada alta usa un `itemId` independiente, incluso para el mismo producto. Editar carga la configuración y cantidad guardadas; cancelar no modifica el ítem. Los límites de cantidad siguen siendo 1–99 y los precios se recalculan desde el catálogo en céntimos.

Sonner presenta centralmente los avisos del estado existente. Eliminar ofrece Deshacer sin caducidad automática, con botón nativo; conserva identidad, configuración, cantidad y posición lógica. No hay foco automático al aparecer. Se preparan destinos de foco tras eliminar, Deshacer y cerrar avisos, con navegación protegida y avisos flotantes sin desplazar el contenido. La integración real y sus anuncios siguen pendientes de prueba en navegador.

Se recupera el pedido completo al abrir, revalidando catálogo, selecciones y disponibilidad. Los precios guardados no autorizan importes. Ítems obsoletos o agotados se conservan para revisión; precios imposibles de recalcular se muestran pendientes. Datos dañados/versiones incompatibles no se sobrescriben al montar; el aviso explica cómo iniciar un pedido nuevo. El almacenamiento bloqueado permite trabajar en memoria y muestra la limitación. La recuperación se anuncia mediante una región de estado, sin mover el foco.

El carrito se vacía eliminando sus productos individualmente, con Deshacer. No hay una acción manual de limpieza. El borrado interno del pedido guardado se conserva exclusivamente al completar correctamente la confirmación.

## Checkout

Delivery solicita nombre, teléfono, dirección y referencia opcional. Recojo conserva el contacto, oculta dirección/referencia y ofrece información y horarios relativos mock del local. Tarifas de entrega mock: San Miguel S/5.00, Centro S/6.00 y Norte S/7.00; recojo S/0.00. El resumen recalcula desde el catálogo y permite editar el pedido.

Los datos personales se conservan solo en Context en memoria, también al editar el pedido; recargar o confirmar correctamente los descarta. Continuar valida, conserva los valores y prepara foco al primer campo inválido. Con datos válidos avanza al método de pago; después de aprobarlo pasa a revisión/confirmación. Volver conserva el borrador en memoria y permite editar entrega, pago o pedido. Cambiar de local reinicia el horario a «Lo antes posible». Detalles de entrega en el [reporte de Fase 5](docs/trazabilidad/fase5-checkout.md).

## Pagos simulados

Efectivo admite vuelto con monto estrictamente mayor al total. Tarjeta valida titular, Visa/Mastercard, longitud, Luhn, MM/AA y CVV ficticio. Yape genera una operación, QR y código de demostración sin iniciar transferencias. Hay procesamiento de 800 ms, rechazo explícito de prueba y aprobación simulada. Después se confirma el pedido académico mediante una acción separada.

Los datos de tarjeta y códigos permanecen en el formulario, se limpian al iniciar una simulación válida/cambiar de método y se descartan al salir del checkout. Retroceder entre etapas conserva el formulario oculto exclusivamente en memoria. El estado compartido solo conserva metadatos, nunca esos campos. Cambiar pedido o checkout invalida los intentos/aprobaciones, incluso si luego se deshace el cambio; el cierre cancela intentos pendientes. Sin persistencia de pagos ni conexiones externas. [Reporte y evidencias de Fase 6](docs/trazabilidad/fase6-pagos.md).

## Confirmación

«Confirmar pedido» revalida carrito, disponibilidad, entrega e importe aprobado. Guarda una instantánea no sensible y solo después limpia carrito, checkout y pago. El ID ficticio se muestra como texto y es el único contenido del QR. El comprobante conserva productos/opciones/precios/local y una referencia de imagen local permitida, sin depender del catálogo o de pedidos posteriores. Comprobantes anteriores sin foto tienen una alternativa. Su detalle de productos se abre mediante details/summary y comienza cerrado.

Solo se conserva `bembos.apf3.lastConfirmation` en sessionStorage. Si falla guardarlo, el pedido permanece intacto y se permite reintentar. Si falla borrar la copia local del carrito, se advierte y sus ítems confirmados no se restauran mientras este comprobante esté disponible. Repetir el mismo intento devuelve el mismo comprobante; recargar y Atrás/Adelante no ejecutan confirmaciones. No hay tracking ni historial. [Reporte y evidencias de Fase 7](docs/trazabilidad/fase7-confirmacion.md).

## Accesibilidad y persistencia

Se mantiene `lang="es"`, títulos por ruta, landmarks, enlaces nativos, skip link, targets principales con mínimo CSS de 44 px, `:focus-visible`, colores claros y reducción de movimiento. La tipografía usa Arial/Segoe UI del sistema. Checkout y pagos simulados incorporan etiquetas, instrucciones, errores asociados y anuncios; se conserva autocomplete para entrega y se desactiva para los campos ficticios de pago.

La política de navegación trata `/` y `/menu` como la misma pantalla y conserva el foco inicial del documento en ambas cargas. Los cambios posteriores entre pantallas mantienen el traslado del foco a `main`. Su aceptación en navegador se registra separadamente de la revisión de código.

El contrato de `localStorage` utiliza pedido y preferencias bajo sobres `schemaVersion: 1`; el catálogo actual usa `catalogVersion: 1`. `sessionStorage` utiliza `bembos.apf3.lastConfirmation` con un comprobante reducido. No se persisten datos de contacto, dirección, tarjeta ni códigos Yape. Los comprobantes anteriores sin instantánea se identifican sin inventar su resumen.

Detalles: trazabilidad de [Fase 1](docs/trazabilidad/fase1-fundacion.md), [Fase 2](docs/trazabilidad/fase2-menu.md), [Fase 3](docs/trazabilidad/fase3-personalizacion.md) y [Fase 4](docs/trazabilidad/fase4-carrito.md). Evidencia y limitaciones: [Fase 1](docs/evidencias/fase1/README.md), [Fase 2](docs/evidencias/fase2/README.md), [Fase 3](docs/evidencias/fase3/README.md) y [Fase 4](docs/evidencias/fase4/README.md).

## Validación y despliegue pendientes

Los tests verifican almacenamiento, reducer, catálogo, configuraciones, precios, límites, disponibilidad, identidad y edición de ítems, Deshacer, recuperación, protección del cambio de local, contraste de tokens y markup estático. Los archivos de tests se ejecutan en serie para no competir por la caché de Vite usada por SSR. No sustituyen los eventos de navegador ni el lector de pantalla. El reporte de zoom del usuario corresponde a la versión previa a Fase 2 y no acredita las pantallas nuevas. Axe sigue aplazado; se conservan los demás pendientes. No se declara conformidad WCAG global.

La publicación en Vercel está autorizada para auditoría. El fallback SPA y la comprobación HTTP están preparados; falta iniciar sesión en Vercel. [Acceso, comandos, resultados y pendientes](docs/evidencias/publicacion/README.md). La auditoría de accesibilidad sigue pendiente.
