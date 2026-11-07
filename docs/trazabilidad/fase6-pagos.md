# Fase 6 — Pagos simulados

Base: `177bc41`. Solo simulación académica; sin cobros, servicios externos ni confirmación/comprobante final de Fase 7.

**Implementado y archivos.** `features/payments/payment.ts` valida efectivo, tarjeta y Yape; `PaymentPanel.tsx`, `YapeDemo.tsx` y `Payments.css` presentan los controles. `CheckoutPage.tsx` habilita pago tras validar entrega. `appState.ts` controla intentos, resultado y revisión del pedido; `FormField.tsx` añade modo de entrada y password para CVV. Se reutilizan precios, validación de checkout, componentes y `qrcode.react`; no se añaden dependencias ni se cambian datos APF2.

**Decisiones.** Efectivo sin vuelto o monto estrictamente mayor al total, calculado en céntimos con coma/punto, sin miles. Visa admite 13/16/19 dígitos; Mastercard 16, prefijos 51–55 y 2221–2720. Se verifica Luhn, titular, MM/AA (mes actual completo válido) y CVV de 3 dígitos. Son controles académicos, no validación bancaria. Yape genera operación `DEMO-…` y código ficticio de 6 dígitos; el QR contiene solo `APF3-DEMO-YAPE:DEMO-…`, sin cuentas, teléfono, código ni enlaces de transferencia. Regenerar invalida el código anterior.

Procesamiento local de 800 ms; casilla explícita para probar rechazo, sin resultados aleatorios. La referencia de envío y el reducer impiden duplicados. Iniciar/finalizar comprueba checkout, catálogo, disponibilidad e importe actual. Cada mutación del pedido/checkout incrementa una revisión y descarta la aprobación; callbacks antiguos no la recuperan al deshacer cambios. Preferencias visuales no invalidan el pago. Salir cancela procesamiento pendiente; cambiar método inicia una revisión de pago limpia.

**Privacidad.** Tarjeta, vencimiento, CVV y códigos viven solo en estado local del formulario: se limpian al enviar datos válidos, cambiar método o descartar la pantalla/contexto. No se copian a acciones compartidas, almacenamiento, logs ni comprobantes. El estado global solo contiene estado, método, importe, ID de intento y revisión. Los contratos persistidos anteriores permanecen con listas permitidas y no hay recibo nuevo. No se registra contenido de campos en errores o mensajes técnicos.

**Accesibilidad.** Fieldsets, radios, checkbox y botones nativos; instrucciones, obligatoriedad, errores asociados y foco preparado al primer error tras renderizar. Detección de marca con texto; QR con título y código alternativo textual. Procesamiento/aprobación se anuncian fuera de la región ocupada, sin robar foco. CVV oculto, campos ficticios con autocomplete desactivado. Se mantienen foco/targets CSS existentes. No hay conformidad WCAG global declarada.

**Pruebas.** Lint, 68 tests (58 anteriores + 10 nuevos) y build/TypeScript aprobados. Validación de importes, rangos/Luhn/fechas, desafío Yape/QR, rechazo/reintento, duplicados, invalidación, callbacks tardíos y exclusión de campos sensibles de metadatos/almacenamiento/comprobante existente; HTML estático de los tres métodos. [Logs reales](../evidencias/fase6/README.md).

**Pendientes y riesgos.** Sin reintento de navegador. Pendientes nuevos: envío repetido con ratón/Enter, cancelación durante procesamiento, borrado real de campos al cambiar/salir, foco al error, anuncios y QR/ingreso de código; revisión responsive, zoom y consola de los controles nuevos. Axe/NVDA aplazados. Se conservan por referencia los [pendientes de Fase 5 y anteriores](fase5-checkout.md). Los tests SSR no ejecutan eventos, temporizadores de UI, limpieza de componentes ni foco real; esos comportamientos no se declaran validados.

**Siguiente fase.** Fase 7 — Confirmación, únicamente tras aprobación. La aprobación actual solo valida la simulación y no confirma un pedido.
