# APF3 BEMBOS — ESPECIFICACIÓN MAESTRA DE DESARROLLO

> Actualización autorizada por el usuario (segunda iteración visual, 2026-11-07): siete categorías/20 productos, salsas nuevas vacías, checkout de tres etapas, textos naturales de pago y comprobante, y retiro de la operación manual de limpieza. Se conservan pagos exclusivamente de prueba, privacidad y limpieza interna tras confirmación. Esta autorización prevalece sobre las cantidades y decisiones visuales históricas siguientes; no inicia la Fase 8 completa. Detalles: [iteración visual 2](docs/trazabilidad/iteracion-visual-2.md).


## 1. ROL

Actúa como un **Senior Frontend Engineer especializado en React, UX/UI, accesibilidad web WCAG 2.1, diseño responsive y pruebas de interfaces**.

Vas a desarrollar el prototipo APF3 del curso **Interacción Hombre Máquina**.

Este proyecto NO es una aplicación comercial real.

Es una implementación académica funcional y verificable cuyo objetivo principal es demostrar la evolución:

**APF1 → diagnóstico heurístico**  
**APF2 → prototipo funcional + validación de usabilidad**  
**APF3 → rediseño inclusivo + accesibilidad WCAG + validación con tecnología de apoyo**

La empresa de referencia es **Bembos**.

---

# 2. OBJETIVO PRINCIPAL

Reconstruir el prototipo móvil validado en APF2 como una:

**Web App responsive, mobile-first, funcional, accesible y desplegable.**

Debe mantener:

- identidad visual reconocible de Bembos
- lógica del flujo APF2
- estructura principal de pedido
- productos y datos existentes en los materiales del proyecto
- mejoras de usabilidad previamente validadas

Debe corregir las barreras detectadas en la auditoría WCAG del APF2.

La implementación debe poder evaluarse realmente mediante:

- navegador
- teclado
- axe
- herramientas de contraste
- zoom al 200 %
- árbol de accesibilidad
- NVDA posteriormente
- pruebas con usuarios

---

# 3. REGLAS DE ALCANCE

Estas reglas son obligatorias.

## 3.1 No ampliar el proyecto sin autorización

NO agregar por iniciativa propia:

- autenticación
- registro de usuarios
- backend
- base de datos
- API externa
- sistema real de pagos
- geolocalización real
- tracking de pedidos
- favoritos
- dark mode
- panel administrativo
- sistema de puntos
- notificaciones push
- recomendaciones inteligentes
- chatbot
- cualquier módulo no definido en esta especificación

Si detectas una mejora potencial fuera del alcance:

1. no la implementes
2. anótala como recomendación
3. solicita aprobación antes de realizarla

---

# 3.2 Dependencias

No instalar nuevas dependencias sin justificar previamente:

- nombre
- propósito
- beneficio
- alternativa sin dependencia

Evitar librerías innecesarias.

No utilizar una librería completa si el comportamiento puede implementarse de manera sencilla y segura con React y APIs web estándar.

---

# 3.3 No modificar archivos ajenos

No eliminar ni reestructurar archivos existentes que no estén relacionados con el objetivo actual.

Antes de una modificación arquitectónica importante, explicar qué se cambiará y por qué.

---

# 3.4 No alterar los criterios WCAG

Los requisitos de accesibilidad definidos en esta especificación son obligatorios.

No eliminar una corrección porque resulte visualmente menos atractiva.

Prioridad:

**Accesibilidad → funcionalidad → claridad → fidelidad visual → decoración.**

---

# 3.5 No inventar resultados académicos

No generar:

- resultados ficticios de axe
- resultados ficticios de NVDA
- pruebas de usuarios inventadas
- contrastes no medidos
- afirmaciones de conformidad no verificadas

El código debe quedar preparado para esas pruebas.

Los resultados se registrarán posteriormente con evidencia real.

---

# 4. STACK TÉCNICO

Utilizar preferentemente:

- React
- Vite
- JavaScript o TypeScript
- React Router solo si realmente aporta al flujo
- CSS moderno, CSS Modules o Tailwind CSS
- estado React
- localStorage

No implementar backend.

Los datos deben almacenarse localmente como mock data.

La aplicación debe ser compatible con despliegue en **Vercel**.

---

# 5. DISEÑO GENERAL

La aplicación debe sentirse como una evolución directa del prototipo APF2.

Mantener una identidad visual inspirada en Bembos:

- azul principal
- amarillo/naranja para acciones
- fondos claros
- imágenes de producto
- jerarquía visual reconocible

Evitar:

- estética genérica de aplicación creada por IA
- gradientes exagerados
- sombras excesivas
- cards innecesarias
- elementos decorativos sin función
- exceso de bordes
- interfaces sobrecargadas

El diseño debe ser:

- moderno
- limpio
- comercial
- claro
- consistente
- accesible

---

# 6. RESPONSIVE MOBILE-FIRST

Diseñar primero para:

- 360 px
- 390 px
- 430 px

Después adaptar para:

- 768 px
- 1024 px
- escritorio amplio

No estirar simplemente el diseño móvil.

## Menú

Mobile:
una columna principal.

Desktop:
grid de productos con ancho máximo controlado.

## Personalización

Mobile:
producto y opciones apiladas.

Desktop:
información visual/resumen a la izquierda y configuración a la derecha.

## Carrito

Mobile:
contenido vertical.

Desktop:
productos + resumen lateral.

## Checkout

Mobile:
formulario → resumen.

Desktop:
formulario + resumen en dos columnas.

---

# 7. FLUJO PRINCIPAL

Implementar:

**Menú → Personalización → Carrito → Edición → Checkout → Confirmación**

Además debe existir el estado:

**Falta de disponibilidad**

La aplicación debe permitir completar el flujo completo sin mouse.

---

# 8. CATÁLOGO

Crear tres categorías:

## Hamburguesas
4 productos.

## Combos
4 productos.

## Promociones
4 productos.

Total aproximado:

**12 productos.**

Priorizar los productos y precios existentes en los materiales APF2.

Los productos adicionales deben tratarse como datos mock académicos.

No presentarlos como información comercial oficial actual de Bembos.

---

# 9. BÚSQUEDA DE PRODUCTOS

Implementar un buscador funcional.

Debe:

- tener `label`
- ser accesible mediante teclado
- filtrar Hamburguesas, Combos y Promociones
- ignorar mayúsculas/minúsculas
- actualizar resultados dinámicamente

Si no hay resultados:

**“No encontramos productos para «texto».”**

El cambio de resultados debe poder anunciarse mediante una región de estado accesible sin robar el foco.

No implementar favoritos.

---

# 10. MENÚ

Cada ProductCard debe mostrar:

- imagen
- nombre
- descripción
- precio
- categoría
- disponibilidad
- acción principal

Las imágenes informativas deben utilizar `alt`.

Las decorativas deben utilizar `alt=""`.

Todos los botones deben ser elementos HTML semánticos.

No usar `div` clickable sin necesidad.

---

# 11. PERSONALIZACIÓN SEGÚN PRODUCTO

La configuración debe generarse dinámicamente.

## Hamburguesas

Ejemplo:

1. Tamaño
2. Papas
3. Salsas
4. Ingredientes
5. Extras

## Combos

Ejemplo:

1. Producto principal
2. Acompañamiento
3. Bebida
4. Salsas
5. Extras

## Promociones

Mostrar únicamente las etapas aplicables.

No forzar el mismo configurador para todos.

---

# 12. SEMÁNTICA DE PERSONALIZACIÓN

Los grupos de selección deben utilizar:

- `fieldset`
- `legend`

cuando resulte apropiado.

También puede utilizarse:

- `role="radiogroup"`
- `aria-labelledby`

cuando el componente lo requiera.

Las opciones deben comunicar:

- nombre
- precio adicional
- disponibilidad
- estado seleccionado

No depender exclusivamente del color.

Usar combinación de:

- texto
- icono
- borde
- contraste

---

# 13. LOCALES

Local inicial:

**Bembos San Miguel**

Añadir dos locales mock:

- Bembos Local Demo Centro
- Bembos Local Demo Norte

Debe existir una matriz real de disponibilidad local.

Cambiar de local debe modificar:

- productos disponibles
- acompañamientos disponibles
- configuraciones disponibles

---

# 14. PREVENCIÓN DE ERRORES AL CAMBIAR DE LOCAL

Si el nuevo local afecta productos existentes en el carrito:

NO eliminarlos automáticamente.

Mostrar diálogo:

**“Cambiar de local”**

Explicar:

- qué elementos dejarán de estar disponibles
- qué producto se verá afectado
- qué debe hacer el usuario

Acciones:

- Mantener local actual
- Cambiar de local

Si continúa:

- conservar el carrito
- marcar los productos incompatibles como **“Requiere actualización”**
- impedir finalizar el pedido hasta corregirlos
- permitir editarlos o eliminarlos

---

# 15. DIÁLOGOS ACCESIBLES

Todo modal debe:

- usar `role="dialog"`
- utilizar `aria-modal="true"`
- tener título asociado
- mover el foco al abrirse
- mantener el foco dentro mientras esté abierto
- permitir cierre con Escape cuando corresponda
- devolver el foco al elemento que lo abrió

No permitir que el foco permanezca detrás del overlay.

Este requisito responde directamente a WCAG 2.4.3.

---

# 16. DISPONIBILIDAD

No repetir el comportamiento problemático del APF2.

Una opción no disponible debe anunciarse ANTES de que el usuario intente seleccionarla.

Ejemplo:

**Papas rústicas**  
**Agotado en este local**

Debe utilizar:

- texto
- icono
- contraste

No solo color.

Puede ofrecer:

**Cambiar de local**

---

# 17. CARRITO MULTIPRODUCTO

El carrito debe soportar múltiples productos distintos.

Cada item debe conservar independientemente:

- producto
- variante
- opciones
- extras
- cantidad
- precio

Acciones:

- Editar
- Eliminar
- incrementar
- disminuir

---

# 18. EDICIÓN

Editar debe:

- cargar exactamente la configuración anterior
- permitir modificaciones
- guardar sobre el mismo item
- no duplicar el producto

Al guardar:

**“Configuración actualizada.”**

Debe anunciarse mediante:

`role="status"`

o:

`aria-live="polite"`

---

# 19. ELIMINAR + DESHACER

Eliminar no debe mostrar un modal cada vez.

Eliminar inmediatamente el producto y mostrar Toast:

**“Cheese mediana eliminada. Deshacer”**

La acción Deshacer debe:

- ser operable con teclado
- restaurar producto
- restaurar configuración
- restaurar cantidad
- mantener posición lógica cuando sea posible

El Toast debe ser accesible.

---

# 20. TOAST / TOASTER

Crear un sistema reutilizable.

Mensajes típicos:

- Producto agregado al pedido.
- Configuración actualizada.
- Producto eliminado.
- Pedido restaurado.
- Local actualizado.
- Pago simulado aprobado.
- Pedido confirmado.

Éxitos:

`aria-live="polite"`

Errores críticos:

`role="alert"`

No utilizar Toast como única evidencia de error de formulario.

No mover el foco automáticamente a un Toast salvo necesidad específica.

---

# 21. PERSISTENCIA

Utilizar `localStorage`.

Persistir:

- carrito
- configuraciones
- cantidades
- local seleccionado
- preferencias de visualización
- opcionalmente método de entrega

Al recargar:

**“Restauramos tu pedido anterior.”**

anunciado mediante región accesible.

NO guardar:

- número de tarjeta
- CVV
- fecha de vencimiento
- código Yape
- datos sensibles de pago
- datos personales innecesarios

---

# 22. VACIADO DEL PEDIDO

La acción manual de limpieza fue retirada por autorización del usuario en la segunda iteración visual. Se vacía eliminando productos individualmente con Deshacer. Se conserva la limpieza interna tras guardar correctamente el comprobante y la limpieza de datos sensibles. No se borran preferencias de visualización.

---

# 23. CHECKOUT

Permitir:

- Delivery
- Recojo en local

---

# 24. DELIVERY

Campos obligatorios:

## Nombre completo
`autocomplete="name"`

## Teléfono
`autocomplete="tel"`

## Dirección
`autocomplete="street-address"`

## Referencia
Opcional.

---

# 25. RECOJO EN LOCAL

Ocultar campos de dirección.

Mostrar:

- local seleccionado
- ubicación mock
- tiempo estimado
- selector de horario

Opciones:

- Lo antes posible
- horarios posteriores

Los horarios pueden generarse dinámicamente.

---

# 26. VALIDACIÓN

Todo campo obligatorio debe disponer de:

- `label`
- indicador visible de obligatoriedad
- `aria-required`
- validación
- mensaje textual
- `aria-describedby`
- `aria-invalid`

No depender únicamente de borde rojo.

Al enviar un formulario incorrecto:

1. validar todos los campos
2. conservar los datos válidos
3. mostrar mensajes
4. mover foco al primer campo inválido

---

# 27. MÉTODOS DE PAGO

Implementar simulaciones de:

- Efectivo
- Tarjeta
- Yape

Nunca realizar pagos reales.

---

# 28. EFECTIVO

Mostrar:

**“Pagarás al recibir tu pedido.”**

Agregar opcional:

**¿Necesitas vuelto?**

Si se activa:

**¿De cuánto pagarás?**

Validar que el monto ingresado sea mayor al total.

---

# 29. TARJETA SIMULADA

Campos:

- Nombre del titular
- Número de tarjeta
- MM/AA
- CVV

Validar:

- campos requeridos
- número
- longitud
- vencimiento
- CVV

Aplicar Luhn cuando corresponda.

No almacenar datos.

Mostrar:

**“Simulación académica. No se procesarán datos reales.”**

---

# 30. DETECCIÓN DE TARJETA

Implementar detección simulada:

- Visa
- Mastercard

Mostrar icono y texto.

Ejemplo accesible:

**“Tipo de tarjeta detectado: Visa.”**

No depender exclusivamente del icono.

---

# 31. YAPE SIMULADO

Mostrar:

- QR de demostración
- monto
- identificador de operación
- teléfono cuando corresponda
- acción para generar código
- código de aprobación ficticio
- botón Confirmar pago simulado

Mostrar siempre:

**“Simulación académica. No se realizará ningún pago real.”**

No conectarse a Yape.

---

# 32. RESUMEN ANTES DE CONFIRMAR

Mostrar:

- productos
- configuraciones
- cantidades
- subtotal
- costo delivery
- total
- método de entrega
- local
- dirección si corresponde
- método de pago

Agregar:

**Editar pedido**

para prevenir errores antes de confirmar.

---

# 33. CONFIRMACIÓN FINAL

Mostrar:

- Pedido confirmado
- ID ficticio
- QR
- resumen
- total
- entrega
- local
- pago
- tiempo estimado cuando corresponda

El QR debe codificar únicamente el ID del pedido.

También mostrar el ID como texto.

No implementar tracking:

Confirmado → Preparando → Listo.

Queda fuera del alcance.

---

# 34. ACCESIBILIDAD NATIVA

La aplicación debe ser accesible POR DEFECTO.

No crear un “modo accesible” que active las correcciones WCAG.

La accesibilidad base siempre debe incluir:

- contraste
- teclado
- foco
- semántica
- lector de pantalla
- labels
- targets
- mensajes

---

# 35. PREFERENCIAS DE VISUALIZACIÓN

Opcionalmente crear:

**Preferencias de visualización**

Puede permitir:

## Tamaño de texto

- Predeterminado
- Grande
- Muy grande

## Reducir movimiento

- Activado
- Desactivado

Opcional:

- Subrayar enlaces

Estas preferencias NO sustituyen accesibilidad base.

No implementar toggle de “Alto contraste” para corregir una interfaz que deba cumplir contraste desde el inicio.

---

# 36. MOVIMIENTO

Utilizar animaciones discretas.

Respetar:

`prefers-reduced-motion: reduce`

Reducir o eliminar:

- animaciones decorativas
- desplazamientos
- transiciones innecesarias

cuando el usuario lo solicite.

---

# 37. CORRECCIONES WCAG OBLIGATORIAS

La auditoría APF2 identificó 11 criterios que requieren intervención.

Todos deben tratarse como requisitos de aceptación.

## 1.3.1 Información y relaciones

Corregir:

- estructura del indicador de pasos
- agrupación semántica
- relaciones accesibles

---

## 1.3.5 Identificar propósito de entrada

Implementar tokens `autocomplete`.

---

## 1.4.3 Contraste mínimo

Texto normal:

**≥4.5:1**

---

## 1.4.11 Contraste no textual

Elementos visuales relevantes:

**≥3:1**

---

## 2.4.2 Página titulada

Configurar títulos descriptivos.

Ejemplos:

- Bembos | Menú
- Bembos | Personaliza
- Bembos | Tu pedido
- Bembos | Pagar
- Bembos | Pedido confirmado

---

## 2.4.3 Orden del foco

Garantizar secuencia lógica.

Especialmente modales.

---

## 2.5.3 Etiqueta en el nombre

El nombre accesible debe incluir correctamente el texto visible.

Especial atención al selector:

**Bembos San Miguel**

---

## 2.5.5 Tamaño del objetivo

Aunque WCAG 2.1 lo clasifica AAA, la consigna lo exige.

Todos los targets interactivos importantes:

**≥44×44 px**

---

## 3.1.1 Idioma

Configurar:

`<html lang="es">`

---

## 3.2.2 Al recibir entradas

No provocar cambios inesperados de contexto.

---

## 3.3.2 Etiquetas o instrucciones

Todos los formularios deben tener:

- label
- instrucciones
- obligatoriedad
- formatos esperados

cuando corresponda.

---

# 38. EVITAR REGRESIONES

Los 18 criterios que ya cumplían en APF2 deben mantenerse.

Especialmente:

- 1.1.1 contenido no textual
- 1.3.3 características sensoriales
- 1.4.1 uso del color
- 1.4.4 cambio de tamaño
- 2.1.1 teclado
- 2.1.2 sin trampas
- 2.2.1 tiempo
- 2.4.4 propósito
- 2.4.6 encabezados
- 2.4.7 foco visible
- 3.2.3 navegación coherente
- 3.2.4 identificación coherente
- 3.3.1 identificación de errores
- 3.3.3 sugerencias
- 3.3.4 prevención
- 4.1.2 nombre/función/valor
- 4.1.3 mensajes de estado

No solucionar un criterio rompiendo otro.

---

# 39. FOCO

Crear un estilo claro mediante:

`:focus-visible`

Nunca utilizar:

`outline: none`

sin una alternativa visible.

---

# 40. SEMÁNTICA HTML

Utilizar:

- `header`
- `nav`
- `main`
- `section`
- `footer`
- `button`
- `form`
- `fieldset`
- `legend`
- labels reales

Mantener jerarquía correcta de:

- h1
- h2
- h3

---

# 41. TARGETS

Todos los elementos interactivos principales deben alcanzar:

**44 × 44 CSS px**

Incluyendo:

- +/-
- volver
- editar
- eliminar
- tabs
- selector de local
- botones de opciones
- acciones de Toast

---

# 42. ESTADOS

Diseñar:

- default
- hover
- focus
- active
- selected
- disabled
- unavailable
- error
- success
- loading

Ninguno puede comunicarse únicamente mediante color.

---

# 43. COMPONENTES

Preferir componentes reutilizables:

- Header
- BottomNavigation
- SearchField
- ProductCard
- StepIndicator
- OptionGroup
- QuantitySelector
- AccessibleModal
- Toast
- ToastProvider
- FormField
- ErrorMessage
- OrderSummary
- LocalSelector
- PaymentSelector
- CardPaymentForm
- YapePayment
- LiveRegion
- AccessibleButton

No sobrearquitecturar.

---

# 44. TESTS MANUALES OBLIGATORIOS

Antes de marcar una fase como terminada revisar:

## Responsive

- 360
- 390
- 430
- 768
- 1024
- desktop amplio

## Teclado

- Tab
- Shift+Tab
- Enter
- Space
- Escape

## Zoom

200 %

## Contraste

Todos los pares críticos.

## axe

Ejecutar sobre estados principales.

## Consola

Sin errores importantes.

---

# 45. NVDA

Preparar DOM para prueba posterior con NVDA.

No inventar resultados.

El usuario debe poder escuchar correctamente:

- pantalla actual
- producto
- precio
- opciones
- selección
- disponibilidad
- errores
- cantidades
- total
- Toast
- confirmación

---

# 46. DEPLOY

Preparar proyecto para Vercel.

El build debe funcionar mediante:

`npm run build`

No depender de configuración local no versionada.

Si se utiliza React Router, configurar correctamente las rutas SPA.

---

# 47. DOCUMENTACIÓN

Crear README con:

- descripción
- stack
- instalación
- desarrollo
- build
- estructura
- deploy
- funcionalidades
- accesibilidad
- pruebas pendientes

---

# 48. CRITERIOS DE ACEPTACIÓN FINALES

El proyecto NO está terminado hasta cumplir:

- mínimo 5 pantallas accesibles
- flujo completo operativo
- 12 productos aproximadamente
- búsqueda funcional
- configuradores dinámicos
- múltiples locales
- disponibilidad simulada
- carrito multiproducto
- localStorage
- editar
- eliminar
- deshacer
- Delivery
- Recojo
- validaciones completas
- Efectivo
- Tarjeta simulada
- Visa/Mastercard detectada
- Yape simulado
- resumen editable
- confirmación
- QR final
- responsive
- teclado completo
- foco correcto
- targets ≥44×44
- contraste conforme
- `lang="es"`
- títulos correctos
- autocomplete
- Toast accesibles
- regiones dinámicas
- `prefers-reduced-motion`
- sin errores críticos de consola
- build correcto
- listo para Vercel

---

# 49. METODOLOGÍA DE IMPLEMENTACIÓN

No implementar todo en una sola operación.

Trabajar estrictamente por fases.

## FASE 0 — INSPECCIÓN

Antes de escribir código:

1. leer este documento completo
2. inspeccionar todos los archivos existentes
3. identificar tecnología actual
4. identificar activos reutilizables
5. revisar materiales APF2/APF3 disponibles
6. generar una propuesta de arquitectura
7. identificar riesgos
8. proponer backlog

DETENERSE.

No programar hasta recibir aprobación.

---

## FASE 1 — FUNDACIÓN

Preparar:

- estructura
- estilos globales
- tokens
- layout
- responsive
- navegación
- almacenamiento de estado

DETENERSE y reportar.

---

## FASE 2 — MENÚ

Implementar:

- catálogo
- categorías
- búsqueda
- productos
- selector de local

DETENERSE y reportar.

---

## FASE 3 — PERSONALIZACIÓN

Implementar:

- configuradores
- disponibilidad
- cantidades
- semántica accesible
- modal de local/indisponibilidad

DETENERSE y reportar.

---

## FASE 4 — CARRITO

Implementar:

- múltiples productos
- edición
- eliminación
- Deshacer
- localStorage

DETENERSE y reportar.

---

## FASE 5 — CHECKOUT

Implementar:

- Delivery
- Recojo
- formularios
- validación
- resumen

DETENERSE y reportar.

---

## FASE 6 — PAGOS

Implementar:

- efectivo
- tarjeta
- Visa/Mastercard
- Luhn
- Yape

DETENERSE y reportar.

---

## FASE 7 — CONFIRMACIÓN

Implementar:

- pedido
- ID
- QR
- resumen final

DETENERSE y reportar.

---

## FASE 8 — AUDITORÍA

Revisar:

- WCAG
- 11 criterios pendientes
- 18 criterios previos
- teclado
- foco
- contraste
- targets
- zoom
- responsive
- axe

No ocultar problemas.

Registrar pendientes reales.

---

## FASE 9 — CORRECCIÓN

Corregir únicamente problemas encontrados.

Evitar refactors estéticos innecesarios.

---

## FASE 10 — DEPLOY

Preparar:

- build
- README
- Vercel
- checklist final

---

# 50. FORMATO DE REPORTE DE CADA FASE

Al terminar cada fase responder:

### Implementado
Qué se agregó.

### Archivos modificados
Archivos principales.

### Decisiones
Decisiones técnicas relevantes.

### Accesibilidad
Qué criterios WCAG se trabajaron.

### Pruebas
Qué se verificó.

### Pendientes
Qué falta.

### Riesgos
Solo si existen.

### Siguiente fase
Qué se propone hacer.

No continuar automáticamente a la siguiente fase.

Esperar aprobación.

---

# 51. REGLA DE CAMBIOS

Si una tarea implica:

- cambiar arquitectura
- instalar dependencia
- eliminar funcionalidad
- alterar datos APF2
- cambiar alcance
- reemplazar framework

DETENERSE y pedir autorización.

---

# 52. DEFINICIÓN DE TERMINADO

“Funciona visualmente” NO significa terminado.

Una función se considera completa únicamente cuando:

1. funciona con mouse
2. funciona con teclado
3. tiene estados
4. tiene validación
5. es responsive
6. mantiene semántica
7. no produce error de consola
8. cumple sus criterios WCAG asociados

---

# 53. PRINCIPIO FINAL

No diseñes una nueva aplicación de comida.

Construye una **evolución accesible, verificable y defendible académicamente del prototipo APF2 de Bembos**.

Cada decisión importante debe poder explicarse mediante:

- hallazgo APF1
- solución APF2
- auditoría WCAG
- mejora APF3
- principio de accesibilidad
- prevención o recuperación de errores

La implementación debe dejar evidencia clara de:

**APF1 → APF2 → APF3**