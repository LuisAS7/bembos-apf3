# Fase 7 — Confirmación

Base: `0546c20`. Solo confirmación académica, sin pedidos/pagos reales, tracking o historial. Fase 8 y pulido visual requieren autorización posterior.

**Cambios y archivos.** `features/confirmation` contiene validación/instantánea, transacción de guardado y botón explícito; `ConfirmationPage.tsx` muestra el comprobante. `providers.tsx`, Context/reducer, tipos y adaptador de almacenamiento conectan el flujo. Se reutilizan cálculos, disponibilidad, componentes y `qrcode.react`. Sin dependencias nuevas ni cambios APF2.

**Decisiones.** Se revalidan carrito, checkout, disponibilidad, importe, estado aprobado y revisión del pago. La instantánea copia nombres, variantes/opciones seleccionadas, cantidades, precios, subtotal, entrega, total, local y tiempos/horario mock. No consulta el catálogo al mostrar o recuperar el comprobante. El ID `BEM-` + UUID es ficticio, visible y único contenido del QR.

Solo se guarda el último comprobante bajo `bembos.apf3.lastConfirmation`, manteniendo el sobre de versión 1 y la lectura del contrato reducido anterior. Los campos nuevos se validan con listas permitidas, identidades únicas y consistencia aritmética. Un comprobante antiguo sin instantánea muestra su limitación; uno dañado no se acepta. Se excluyen contacto, dirección, tarjeta, CVV, vencimiento y códigos Yape, también en campos anidados. No hay logs de esos datos.

**Guardado y limpieza.** Primero se guarda el comprobante; después se borra la copia de carrito y se limpian ítems, checkout, pago y Deshacer en memoria. Preferencias y otras claves permanecen. Si falla el guardado, se conserva íntegro el pedido/aprobación y el comprobante anterior, con error y reintento. Si falla solo el borrado local, el comprobante ya está guardado, se advierte y sus IDs de ítem evitan restaurar esa copia consumida en esta sesión.

La transacción usa el estado más reciente y es idempotente por intento de pago. Doble clic devuelve el mismo ID sin otra escritura; repetir un intento anterior no limpia un pedido nuevo. La página de confirmación solo lee, sin efectos de confirmar en recarga o navegación. ID ausente, no coincidente y comprobante antiguo tienen mensajes distintos. Cada confirmación posterior reemplaza la anterior.

**Accesibilidad.** Títulos según comprobante disponible, encabezados/listas/dl, ID textual y QR con título, anuncio de confirmación sin foco robado. Se conserva la política SPA de foco a main y skip link inicial. Botón nativo y fallo de guardado con alerta visible. Interacción real todavía pendiente; sin conformidad WCAG global.

**Pruebas.** Lint, 79 tests (68 existentes + 11 nuevos) y build/TypeScript aprobados. Cubren confirmación única, recuperación sin escrituras/reconfirmar, consistencia/instantánea, bloqueo de estados inválidos, fallos de guardado/borrado, limpieza, preferencias y exclusión de datos sensibles. QR contrastado con el SVG generado únicamente desde el ID. [Logs reales](../evidencias/fase7/README.md).

**Pendientes y riesgos.** No se reintentó el navegador. Pendientes nuevos: doble clic/Enter, recarga y Atrás/Adelante reales; fallos de almacenamiento desde UI, foco/anuncios, lectura/escaneo del QR, responsive/zoom/consola del comprobante. Axe/NVDA aplazados; continúan los [pendientes anteriores](fase6-pagos.md). Pruebas SSR/puras no acreditan interacción de navegador. Recuperación y protección de copias consumidas dependen de que el último comprobante siga disponible en sessionStorage; no hay historial ni coordinación entre dispositivos.

**Siguiente fase.** Detenido antes de Fase 8. El pulido visual se abordará posteriormente.
