# Validaciones manuales pendientes — Fase 4

Todos los casos de esta lista están **pendientes**, no ejecutados: el host de navegador es inaccesible. Preparar fixtures desde la UI, sin sustituir ni borrar datos reales del usuario. Mantener los pendientes de Fases 1, 2 y 3. Axe aplazado por el usuario.

1. Revisar menú, alta de hamburguesa/combo/promoción, carrito vacío/múltiple/incompatible, edición y ambos diálogos a 360, 390, 430, 768, 1024 px y escritorio amplio. Buscar desbordamientos, texto truncado, controles ocultos y solapamiento con navegación inferior.
2. Repetir las pantallas/estados anteriores con zoom **real de navegador al 200 %**, incluyendo varios avisos Deshacer. El reporte de zoom anterior no cierra este caso.
3. Navegar con Tab/Shift+Tab desde el skip link hasta todos los controles del carrito y avisos, comprobando orden, foco visible y targets computados de al menos 44 × 44 CSS px. Probar salto a `main` y navegación SPA.
4. Agregar dos configuraciones distintas de Cheese y un combo/promoción. Comprobar identidades independientes, cantidades, resumen y precio esperado. Agregar dos configuraciones idénticas y verificar que no se fusionan.
5. Editar cada ítem, comprobar todas sus selecciones exactas, guardar y cancelar. Guardar conserva número de ítems, identidad y posición; cancelar mantiene el original. Verificar título de página y anuncio «Configuración actualizada».
6. Incrementar/disminuir mediante teclado, incluyendo 1 y 99. Comprobar actualización de importes, botones en límites y que el foco no se pierda al deshabilitarse el control.
7. Eliminar primero, intermedio, último y único ítem usando teclado. Verificar foco al siguiente, anterior o encabezado vacío. La aparición del Toast no debe moverlo.
8. Operar Deshacer tras una y varias eliminaciones, en ambos órdenes, tras agregar otro producto y tras cambiar de local. Comprobar selección, cantidad, identidad, vecinos y restricciones actuales. Sin espera límite para Deshacer.
9. Recorrer avisos con teclado, activar Deshacer y Cerrar aviso. Verificar nombre accesible, foco al control restante/aviso vecino/main y que cerrar no anuncie otra vez un mensaje viejo. Comprobar varios ítems del mismo producto.
10. Cambiar de San Miguel a Demo Centro con Cheese grande/papas grandes y a Norte con Royal/tocino. El diálogo describe número/producto y motivos antes de confirmar. Cancelar/Escape conserva local e ítems; confirmar los retiene y muestra «Requiere actualización».
11. En cambio de local: comprobar foco inicial al título, Tab/Shift+Tab contenidos, fondo inerte, Escape y retorno al disparador conectado. Repetir con texto largo/zoom. No hay interacción de diálogo validada todavía.
12. Corregir/eliminar incompatibilidades, comprobar que solo entonces se habilita Continuar al pago. Intentar `/pagar` directamente con pedido vacío/incompatible: mostrar bloqueo. Con válido, seguir mostrando únicamente el shell de Fase 5, sin formulario ni confirmación.
13. Recargar un pedido válido e incompatible. Confirmar conservación de selecciones/cantidades e importe recalculado; anuncio de recuperación sin mover el foco inicial ni ocultar el skip link.
14. En un perfil aislado, probar almacenamiento bloqueado y cuota agotada. La UI sigue operativa en memoria, advierte falta de guardado, permite local temporal y explica fallo de borrado si ocurre. Reabrir con permiso restaurado y revisar estado real guardado.
15. En un perfil aislado, probar JSON dañado, versiones de sobre/catálogo incompatibles, referencias obsoletas, cantidad fuera de límite, precios falsos e IDs repetidos. Verificar aviso y ausencia de sobrescritura al montar. Los ítems semánticamente recuperables siguen visibles y bloqueados hasta actualización.
16. Abrir dos pestañas del mismo origen: guardar un pedido diferente en otra pestaña mientras el diálogo está abierto. Confirmar debe proteger el pedido guardado y explicar el conflicto. No se promete sincronización concurrente para otras operaciones.
18. Revisar con NVDA los anuncios de agregar, editar, cantidades, eliminación/Deshacer y recuperación: completos, sin duplicación molesta ni foco robado. Evaluar si el retardo de montaje de la región viva funciona en navegador/lector reales.
19. Revisar consola y errores de runtime durante todos los flujos, recarga y acceso directo. HTTP/SSR/build no acreditan consola limpia.
20. Medir contraste de controles/estados renderizados y revisar árbol de accesibilidad. Axe se ejecutará solo cuando se retome expresamente. No hay declaración WCAG global ni prueba de usabilidad nueva.

El caso 17 de limpieza manual fue retirado del alcance en la segunda iteración visual. Los logs históricos conservan lo realmente ejecutado en su momento; no representan funcionalidad actual.
