# Fundación APF3

Esta fase prepara navegación, semántica, estilos y contratos de estado/almacenamiento. Las cinco pantallas son shells sin productos, importes ni operaciones de pedido. La edición comparte el shell de personalización. Los enlaces entre shells permiten revisar la navegación; no agregan, pagan ni confirman pedidos.

## Organización

Un provider de aplicación, un reducer y contratos TypeScript compartidos. Las carpetas `features` y `data` quedan reservadas. No hay servicios, repositorios, motor de reglas ni librería adicional de estado. `AccessibleButton` solo estiliza un botón nativo; la navegación usa enlaces.

## Almacenamiento

Todos los valores se envuelven en `{ schemaVersion: 1, data }`. Las claves son:

| Medio | Clave | Datos permitidos |
| --- | --- | --- |
| localStorage | bembos.apf3.order | Versión de catálogo, local, IDs/configuración de ítems, cantidades, precio unitario en céntimos |
| localStorage | bembos.apf3.preferences | Tamaño de texto, reducción de movimiento, subrayado de enlaces |
| sessionStorage | bembos.apf3.lastConfirmation | ID ficticio, fecha, local, método de entrega, tipo de pago, total, IDs/cantidades/importes de productos |

Las listas explícitas de propiedades excluyen nombre, teléfono, dirección, referencia, número de tarjeta, titular, vencimiento, CVV, códigos Yape y objetos completos de pago. La sesión conserva únicamente el último comprobante reducido, permite recargar la pestaña y no constituye un historial de pedidos. Algunos navegadores pueden restaurar sesiones tras reiniciarse; no se depende del cierre como protección de datos sensibles.

La fundación recupera preferencias y el comprobante seguro. La recuperación del carrito, su revalidación contra catálogo/local y el anuncio «Restauramos tu pedido anterior» se conectarán en fase 4. El guardado del comprobante y su presentación se conectarán al flujo en fase 7. No se escribe almacenamiento automáticamente al montar los shells, ni se sobrescriben datos dañados al iniciar.

Los datos JSON o versiones inválidas se rechazan. El almacenamiento bloqueado se comunica y no impide navegar. La validación actual es estructural; precios vigentes, límites por producto y disponibilidad se comprobarán en sus fases.

## Trazabilidad de accesibilidad

- APF1: conservar claridad de etiquetas y control del pedido.
- APF2: conservar identidad azul/amarillo/crema y navegación Menú/Pedido. Las fotos originales se incorporarán cuando estén disponibles.
- Auditoría APF3: abordar desde la base idioma (3.1.1), títulos (2.4.2), orden de foco (2.4.3), targets (2.5.5), nombres coherentes (2.5.3) y relaciones semánticas (1.3.1).
- Los criterios de formularios, configuradores y diálogos requieren las fases posteriores. No se declara conformidad global.

## Pendiente de fases posteriores

Catálogo, búsqueda, selector de local, configuradores, matriz de disponibilidad, operaciones de carrito, checkout, pagos, QR y Toast. La adaptación de rutas SPA en Vercel pertenece a la preparación de deploy; no se ha publicado este proyecto.

## Ajustes de cierre tras la auditoría local

- Git existe y el commit inicial es `01d9d34abe752d720db1021a22748bc9b6a8f225`. El informe anterior sobre ausencia de Git no describe el estado actual. No se ha reinicializado el repositorio.
- `npm run dev` usa `127.0.0.1:5173` y falla si el puerto está ocupado. El origen del almacenamiento queda estable.
- `RouteEffects` compara la ruta canónica de pantalla: `/` y `/menu` corresponden al menú. La redirección de carga no se interpreta como navegación de usuario. Las transiciones posteriores entre pantallas mantienen el foco a `main` y el desplazamiento al inicio.
- `npm test` ejecuta los seis tests existentes con el runner nativo de Node. Entorno usado: Node 22.19.0 / npm 10.9.3.
- La revisión de código del foco no acredita la interacción DOM. El registro de [evidencias de cierre](../evidencias/fase1/README.md) distingue comprobaciones ejecutadas y bloqueadas.
