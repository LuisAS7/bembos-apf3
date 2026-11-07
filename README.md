# APF3 Bembos

Prototipo académico del curso Interacción Hombre Máquina. El alcance y el trabajo por fases se rigen por [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md).

La Fase 1 contiene la fundación y la Fase 2 incorpora catálogo, búsqueda y locales. La Fase 3 permite personalizar los 12 productos, revisar cantidades, precios y restricciones por local. La Fase 4 conecta el carrito multiproducto: agregar, editar, cantidades, eliminar, Deshacer, recuperación y limpieza con confirmación. Checkout, pagos y confirmación final siguen pendientes de sus fases y aprobación independiente.

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
| `/pagar` | Pantalla base protegida si el pedido está vacío o tiene incompatibilidades; sin checkout |
| `/confirmacion/demo` | Confirmación vacía |
| Otras rutas | Página no encontrada |

Los enlaces «Ver producto» abren su configurador. «Agregar al pedido» valida y agrega un nuevo ítem con identidad independiente; «Guardar cambios» actualiza el mismo ítem y vuelve al pedido. El ID `demo` de confirmación sigue siendo un marcador de pantalla vacía.

## Organización

`src/app` contiene routing y providers; `components` los elementos compartidos; `pages` las pantallas; `domain` los tipos; `state` el Context/reducer; `storage` los adaptadores seguros; `styles` los tokens y reglas globales. `data` contiene catálogo y locales; `features/catalog`, `features/locations`, `features/customization` y `features/cart` agrupan sus controles y funciones. Los recursos gráficos son locales.

## Catálogo y locales

Cuatro hamburguesas, cuatro combos y cuatro promociones. Cheese y Royal conservan nombre, descripción y precio del APF2; los otros diez registros se identifican como mock académico. Los precios y el stock simulado no representan información comercial vigente.

La búsqueda combina texto y categoría sin distinguir mayúsculas o acentos. «Aplicar local» cambia explícitamente la disponibilidad simulada y el Header. Si afecta al carrito o al borrador, muestra los productos y motivos y pide confirmación. Conserva las selecciones incompatibles con «Requiere actualización» y bloquea continuar al pago hasta corregirlas o eliminarlas. Antes de confirmar vuelve a leer el pedido guardado y evita sobrescribir uno diferente.

## Personalización

Los grupos y variantes se definen por producto: hamburguesas, combos y promociones tienen etapas distintas. Precios en céntimos, adicionales contabilizados una vez y cantidad entre 1 y 99. Las restricciones se muestran antes de seleccionar. Las configuraciones inválidas conservan sus datos y explican cómo corregirlos. No se calcula un total utilizable hasta corregirlas.

Se usan fieldsets, radios, checkboxes y botones nativos. Los diálogos se implementan con `<dialog>`, título, foco inicial, contención de Tab, Escape y retorno al disparador. La comprobación real de esos comportamientos sigue pendiente de acceso al navegador.

## Carrito y recuperación

Cada alta usa un `itemId` independiente, incluso para el mismo producto. Editar carga la configuración y cantidad guardadas; cancelar no modifica el ítem. Los límites de cantidad siguen siendo 1–99 y los precios se recalculan desde el catálogo en céntimos.

Eliminar ofrece Deshacer sin caducidad automática, con botón nativo. Se conservan identidad, configuración, cantidad y vecinos para recuperar la posición lógica. Los avisos no reciben foco al aparecer. Después de eliminar se prepara el foco al ítem siguiente, anterior o estado vacío; al accionar Deshacer o cerrar un aviso se mantiene una posición de foco disponible. Estos movimientos están implementados y pendientes de prueba real.

Se recupera el pedido completo al abrir, revalidando catálogo, selecciones y disponibilidad. Los precios guardados no autorizan importes. Ítems obsoletos o agotados se conservan para revisión; precios imposibles de recalcular se muestran pendientes. Datos dañados/versiones incompatibles no se sobrescriben al montar; el aviso explica cómo iniciar un pedido nuevo. El almacenamiento bloqueado permite trabajar en memoria y muestra la limitación. La recuperación se anuncia mediante una región de estado, sin mover el foco.

«Limpiar pedido» solicita confirmación y elimina solo `bembos.apf3.order` e historial temporal de Deshacer. Conserva preferencias, otras claves y el comprobante independiente de una confirmación anterior. El local actual permanece en memoria; tras recargar sin instantánea vuelve al inicial. No hay estado de checkout implementado.

## Accesibilidad y persistencia

Se mantiene `lang="es"`, títulos por ruta, landmarks, enlaces nativos, skip link, targets principales con mínimo CSS de 44 px, `:focus-visible`, colores claros y reducción de movimiento. La tipografía usa Arial/Segoe UI del sistema. Los formularios de entrega y pago se incorporarán en sus fases.

La política de navegación trata `/` y `/menu` como la misma pantalla y conserva el foco inicial del documento en ambas cargas. Los cambios posteriores entre pantallas mantienen el traslado del foco a `main`. Su aceptación en navegador se registra separadamente de la revisión de código.

El contrato de `localStorage` utiliza pedido y preferencias bajo sobres `schemaVersion: 1`; el catálogo actual usa `catalogVersion: 1`. `sessionStorage` reserva `bembos.apf3.lastConfirmation` con un comprobante reducido. No se persisten datos de contacto, dirección, tarjeta ni códigos Yape. La confirmación aún no se conecta al flujo.

Detalles: trazabilidad de [Fase 1](docs/trazabilidad/fase1-fundacion.md), [Fase 2](docs/trazabilidad/fase2-menu.md), [Fase 3](docs/trazabilidad/fase3-personalizacion.md) y [Fase 4](docs/trazabilidad/fase4-carrito.md). Evidencia y limitaciones: [Fase 1](docs/evidencias/fase1/README.md), [Fase 2](docs/evidencias/fase2/README.md), [Fase 3](docs/evidencias/fase3/README.md) y [Fase 4](docs/evidencias/fase4/README.md).

## Validación y despliegue pendientes

Los tests verifican almacenamiento, reducer, catálogo, configuraciones, precios, límites, disponibilidad, identidad y edición de ítems, Deshacer, recuperación, protección del cambio de local, contraste de tokens y markup estático. Los archivos de tests se ejecutan en serie para no competir por la caché de Vite usada por SSR. No sustituyen los eventos de navegador ni el lector de pantalla. El reporte de zoom del usuario corresponde a la versión previa a Fase 2 y no acredita las pantallas nuevas. Axe sigue aplazado; se conservan los demás pendientes. No se declara conformidad WCAG global.

No se ha publicado el prototipo. La preparación de Vercel y las rutas SPA de producción pertenecen a Fase 10.
