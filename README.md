# APF3 Bembos

Prototipo académico del curso Interacción Hombre Máquina. El alcance y el trabajo por fases se rigen por [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md).

La Fase 1 contiene navegación, pantallas base, estilos responsive, semántica, foco y contratos de estado/almacenamiento. La Fase 2 incorpora un catálogo académico de 12 productos, categorías, búsqueda y selector de local. Todavía no permite configurar productos ni realizar pedidos o pagos. La Fase 3 requiere aprobación independiente.

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
| `/productos/cheese/personalizar` | Shell de personalización, aún sin configurador |
| `/pedido` | Pedido |
| `/pedido/demo/editar` | Edición; comparte personalización |
| `/pagar` | Pago |
| `/confirmacion/demo` | Confirmación vacía |
| Otras rutas | Página no encontrada |

Los enlaces «Ver producto» del catálogo abren el shell de personalización existente; no agregan nada al pedido. Los identificadores `demo` de edición y confirmación son marcadores de ruta, no pedidos reales.

## Organización

`src/app` contiene routing y providers; `components` los elementos compartidos; `pages` las pantallas; `domain` los tipos; `state` el Context/reducer; `storage` los adaptadores seguros; `styles` los tokens y reglas globales. `data` contiene catálogo y locales; `features/catalog` y `features/locations` contienen los controles de Fase 2. Los recursos gráficos son locales.

## Catálogo y locales

Cuatro hamburguesas, cuatro combos y cuatro promociones. Cheese y Royal conservan nombre, descripción y precio del APF2; los otros diez registros se identifican como mock académico. Los precios y el stock simulado no representan información comercial vigente.

La búsqueda combina texto y categoría sin distinguir mayúsculas o acentos. El selector nativo requiere pulsar «Aplicar local»; cambia la disponibilidad simulada de productos y el local del Header. La aplicación conserva pedidos guardados y bloquea ese cambio si todavía requieren revisión. La disponibilidad de opciones y el diálogo de impacto se reservan para sus fases.

## Accesibilidad y persistencia

Se mantiene `lang="es"`, títulos por ruta, landmarks, enlaces nativos, skip link, targets principales de al menos 44 CSS px, `:focus-visible`, colores claros y reducción de movimiento. La tipografía usa Arial/Segoe UI del sistema. Los formularios y diálogos se incorporarán en sus fases.

La política de navegación trata `/` y `/menu` como la misma pantalla y conserva el foco inicial del documento en ambas cargas. Los cambios posteriores entre pantallas mantienen el traslado del foco a `main`. Su aceptación en navegador se registra separadamente de la revisión de código.

El contrato de `localStorage` reserva pedido y preferencias. `sessionStorage` reserva `bembos.apf3.lastConfirmation` con un comprobante reducido. No se persisten datos de contacto, dirección, tarjeta ni códigos Yape. La conexión del carrito y de la confirmación al flujo pertenece a fases posteriores.

Detalles: [trazabilidad de Fase 1](docs/trazabilidad/fase1-fundacion.md) y [Fase 2](docs/trazabilidad/fase2-menu.md). Evidencia y limitaciones: [Fase 1](docs/evidencias/fase1/README.md) y [Fase 2](docs/evidencias/fase2/README.md).

## Validación y despliegue pendientes

Los tests verifican almacenamiento, reducer, búsqueda, procedencia, disponibilidad de productos, protección del cambio de local, contraste de tokens y markup inicial del menú. No sustituyen la revisión visual ni los eventos del navegador. El usuario informó una revisión manual del zoom al 200 % sin problemas en la versión previa a Fase 2; axe está aplazado por su autorización. Los demás pendientes permanecen en las evidencias. No se declara conformidad WCAG global.

No se ha publicado el prototipo. La preparación de Vercel y las rutas SPA de producción pertenecen a Fase 10.
