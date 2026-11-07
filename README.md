# APF3 Bembos

Prototipo académico del curso Interacción Hombre Máquina. El alcance y el trabajo por fases se rigen por [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md).

La Fase 1 contiene la fundación y la Fase 2 incorpora catálogo, búsqueda y locales. La Fase 3 permite personalizar los 12 productos, revisar cantidades, precios y restricciones por local, con diálogos accesibles implementados. Todavía no permite agregar o editar ítems de carrito, realizar pedidos ni pagar. La Fase 4 requiere aprobación independiente.

## Entorno y comandos

Entorno verificado: Node **22.19.0**, npm **10.9.3**. Los tests usan el runner nativo de Node y sus imports TypeScript; usar Node 22.19.0 o posterior compatible. No requieren dependencias adicionales.

```sh
npm run dev
npm run lint
npm test
npm run build
npm run preview -- --host 127.0.0.1
```

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
| `/pedido/demo/editar` | Estado informativo; edición de carrito aún no habilitada |
| `/pagar` | Pago |
| `/confirmacion/demo` | Confirmación vacía |
| Otras rutas | Página no encontrada |

Los enlaces «Ver producto» abren su configurador; «Revisar configuración» valida el borrador sin agregar nada al pedido. Los identificadores `demo` de edición y confirmación son marcadores de ruta, no pedidos reales.

## Organización

`src/app` contiene routing y providers; `components` los elementos compartidos; `pages` las pantallas; `domain` los tipos; `state` el Context/reducer; `storage` los adaptadores seguros; `styles` los tokens y reglas globales. `data` contiene catálogo y locales; `features/catalog` y `features/locations` contienen los controles de Fase 2. Los recursos gráficos son locales.

## Catálogo y locales

Cuatro hamburguesas, cuatro combos y cuatro promociones. Cheese y Royal conservan nombre, descripción y precio del APF2; los otros diez registros se identifican como mock académico. Los precios y el stock simulado no representan información comercial vigente.

La búsqueda combina texto y categoría sin distinguir mayúsculas o acentos. «Aplicar local» cambia explícitamente la disponibilidad simulada y el Header. En personalización se advierte mediante diálogo si el cambio afecta al borrador. Los pedidos ya guardados siguen protegidos: no se cambia su local ni se alteran sus ítems en esta fase.

## Personalización

Los grupos y variantes se definen por producto: hamburguesas, combos y promociones tienen etapas distintas. Precios en céntimos, adicionales contabilizados una vez y cantidad entre 1 y 99. Las restricciones se muestran antes de seleccionar. Las configuraciones inválidas conservan sus datos y explican cómo corregirlos. No se calcula un total utilizable hasta corregirlas.

Se usan fieldsets, radios, checkboxes y botones nativos. Los diálogos se implementan con `<dialog>`, título, foco inicial, contención de Tab, Escape y retorno al disparador. La comprobación real de esos comportamientos sigue pendiente de acceso al navegador.

## Accesibilidad y persistencia

Se mantiene `lang="es"`, títulos por ruta, landmarks, enlaces nativos, skip link, targets principales de al menos 44 CSS px, `:focus-visible`, colores claros y reducción de movimiento. La tipografía usa Arial/Segoe UI del sistema. Los formularios y diálogos se incorporarán en sus fases.

La política de navegación trata `/` y `/menu` como la misma pantalla y conserva el foco inicial del documento en ambas cargas. Los cambios posteriores entre pantallas mantienen el traslado del foco a `main`. Su aceptación en navegador se registra separadamente de la revisión de código.

El contrato de `localStorage` reserva pedido y preferencias. `sessionStorage` reserva `bembos.apf3.lastConfirmation` con un comprobante reducido. No se persisten datos de contacto, dirección, tarjeta ni códigos Yape. La conexión del carrito y de la confirmación al flujo pertenece a fases posteriores.

Detalles: trazabilidad de [Fase 1](docs/trazabilidad/fase1-fundacion.md), [Fase 2](docs/trazabilidad/fase2-menu.md) y [Fase 3](docs/trazabilidad/fase3-personalizacion.md). Evidencia y limitaciones: [Fase 1](docs/evidencias/fase1/README.md), [Fase 2](docs/evidencias/fase2/README.md) y [Fase 3](docs/evidencias/fase3/README.md).

## Validación y despliegue pendientes

Los tests verifican almacenamiento, reducer, catálogo, configuraciones, precios, límites, disponibilidad, protección del cambio de local, contraste de tokens y markup estático. Los archivos de tests se ejecutan en serie para no competir por la caché de Vite usada por SSR. No sustituyen los eventos de navegador ni el lector de pantalla. El reporte de zoom del usuario corresponde a la versión previa a Fase 2 y no acredita las pantallas nuevas. Axe sigue aplazado; se conservan los demás pendientes. No se declara conformidad WCAG global.

No se ha publicado el prototipo. La preparación de Vercel y las rutas SPA de producción pertenecen a Fase 10.
