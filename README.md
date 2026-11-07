# APF3 Bembos

Prototipo académico del curso Interacción Hombre Máquina. El alcance y el trabajo por fases se rigen por [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md).

La Fase 1 contiene navegación, pantallas base, estilos responsive, semántica, foco y contratos de estado/almacenamiento. Todavía no permite realizar pedidos ni pagos. No se ha iniciado la Fase 2.

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
| `/menu` | Menú |
| `/productos/demo/personalizar` | Personalización |
| `/pedido` | Pedido |
| `/pedido/demo/editar` | Edición; comparte personalización |
| `/pagar` | Pago |
| `/confirmacion/demo` | Confirmación vacía |
| Otras rutas | Página no encontrada |

Los enlaces entre shells sirven para revisar navegación. Los identificadores `demo` son marcadores de ruta, no productos o pedidos reales.

## Organización

`src/app` contiene routing y providers; `components` los elementos compartidos; `pages` las pantallas; `domain` los tipos; `state` el Context/reducer; `storage` los adaptadores seguros; `styles` los tokens y reglas globales. `features`, `data` e imágenes quedan reservados para fases posteriores.

## Accesibilidad y persistencia

Se mantiene `lang="es"`, títulos por ruta, landmarks, enlaces nativos, skip link, targets principales de al menos 44 CSS px, `:focus-visible`, colores claros y reducción de movimiento. La tipografía usa Arial/Segoe UI del sistema. Los formularios y diálogos se incorporarán en sus fases.

La política de navegación trata `/` y `/menu` como la misma pantalla y conserva el foco inicial del documento en ambas cargas. Los cambios posteriores entre pantallas mantienen el traslado del foco a `main`. Su aceptación en navegador se registra separadamente de la revisión de código.

El contrato de `localStorage` reserva pedido y preferencias. `sessionStorage` reserva `bembos.apf3.lastConfirmation` con un comprobante reducido. No se persisten datos de contacto, dirección, tarjeta ni códigos Yape. La conexión del carrito y de la confirmación al flujo pertenece a fases posteriores.

Detalles: [trazabilidad de Fase 1](docs/trazabilidad/fase1-fundacion.md). Evidencia y limitaciones: [validaciones de Fase 1](docs/evidencias/fase1/README.md).

## Validación y despliegue pendientes

Los tests de Node verifican almacenamiento y reducer. No sustituyen la revisión visual, teclado, zoom real al 200 %, axe ni consola del navegador. El estado real de cada comprobación está en las evidencias; no se declara conformidad WCAG global.

No se ha publicado el prototipo. La preparación de Vercel y las rutas SPA de producción pertenecen a Fase 10.
