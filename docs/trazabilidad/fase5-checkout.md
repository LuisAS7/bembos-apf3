# Fase 5 — Checkout

Base autorizada: `84a67cb`. Solo entrega, validación y resumen; pagos y confirmación final requieren aprobación de sus fases.

**Cambios y archivos.** `CheckoutPage.tsx` contiene el formulario Delivery/Recojo; `FormField.tsx` comparte etiquetas, instrucciones y errores. `features/checkout` contiene validación, horarios relativos y `OrderSummary`. `locations.ts` incorpora direcciones ficticias, tiempos y tarifas mock: San Miguel S/5.00, Centro S/6.00, Norte S/7.00; recojo gratuito. No se modifican catálogo ni precios APF2. `appState.ts` mantiene el borrador solo en memoria y lo borra internamente tras confirmar (la acción manual original fue retirada en iteración visual 2); cambia el título de `/pagar` y la ayuda del carrito.

**Decisiones.** Nombre y teléfono son comunes a ambos métodos. Recojo oculta dirección/referencia y no valida sus valores retenidos. Nombre admite distintos alfabetos y no exige dos palabras; teléfono valida formato de 7–15 dígitos, sin verificar identidad ni conexión real. Dirección requiere 5–180 caracteres y referencia opcional hasta 200. Horarios mock: lo antes posible según preparación del local, en 60 o 90 minutos; no reservan una hora real. Cambiar de local reinicia el horario. Los datos permanecen al editar el pedido, pero no se escriben en localStorage ni sessionStorage y desaparecen al recargar/limpiar.

**Accesibilidad.** Radios, fieldset/legend, controles nativos, obligatoriedad visible, autocomplete `name`/`tel`/`street-address`, instrucciones y errores con `aria-describedby`/`aria-invalid`. Al enviar se validan todos los campos, se mantienen sus valores y se prepara foco al primero inválido después de renderizar los errores. Targets usan el mínimo CSS existente y foco global. Se trabajan 1.3.1, 1.3.5, 2.4.2, 2.4.3 y 3.3.2, sin declarar conformidad WCAG.

**Resumen y límites.** Reutiliza `inspectOrder` y precios del catálogo; costo de entrega se suma una vez. Presenta productos, variantes/opciones, cantidades, subtotal, entrega y total, con enlace Editar pedido. Pedido vacío/incompatible bloquea el formulario. Continuar con datos válidos anuncia que el pago aún no está disponible; no cobra ni confirma.

**Resultados.** Lint, 58 tests (51 existentes + 7 nuevos) y build con TypeScript aprobados. Casos nuevos: validación/orden de errores, límites, datos ocultos, horarios, entrega/totales, estado temporal y HTML asociado. Se actualiza la expectativa del test anterior que comprobaba el shell reemplazado. [Logs reales](../evidencias/fase5/README.md). Sin dependencias nuevas ni auditorías adicionales.

**Pendientes y riesgos.** No se reintentó el navegador. Nuevos casos pendientes: Delivery/Recojo a los anchos acordados y zoom real 200 %; teclado/foco al primer error; ocultación de campos y cambio de costos; conservación al editar y borrado al limpiar; anuncios y consola. Se mantienen por referencia los [pendientes anteriores](../evidencias/fase4/casos-pendientes.md). Axe y NVDA aplazados. SSR no verifica interacción, estilos computados ni foco real. Recargar descarta deliberadamente los datos personales temporales.

**Siguiente fase.** Fase 6 — Pagos, únicamente tras aprobación. Se detiene el trabajo al cerrar este commit.
