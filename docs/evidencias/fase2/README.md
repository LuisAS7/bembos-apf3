# Evidencias de Fase 2

Fecha: 7 de noviembre de 2026, America/Lima. Base: `6e6fa86`. Alcance: catálogo, categorías, búsqueda, tarjetas de producto y selector de local. Sin configuradores, operaciones de carrito, checkout ni pagos.

La Fase 2 se inició por autorización expresa del usuario. Se conservaron los pendientes anteriores: axe está aplazado y no bloquea esta fase. No se declara conformidad WCAG global.

## Resultados ejecutados

| Comprobación | Resultado | Evidencia |
| --- | --- | --- |
| `npm run lint` | Aprobado, salida 0 | [lint.log](lint.log) |
| `npm test` | 16 aprobados, 0 fallidos | [tests.log](tests.log) |
| `npm run build` | TypeScript y Vite aprobados, salida 0 | [build.log](build.log) |
| HTTP local | Menú y cinco recursos gráficos respondieron 200; tipos HTML/JPEG/SVG correctos | [http.json](http.json) |
| Build y recursos | Idioma español, título base descriptivo, esquema claro, SVG bien formados y todos los recursos gráficos copiados al build | [build-y-activos.json](build-y-activos.json) |
| Dependencias | Lockfile idéntico a la base; ninguna instalación nueva | [entorno.json](entorno.json) |

Los 16 tests incluyen los seis de fundación, nueve de datos/lógica/contraste y uno de markup integrado. Cubren doce IDs únicos, cuatro productos por categoría, procedencia de datos, precios APF2, conservación exacta del JPEG fuente, búsqueda combinada, ausencia de resultados, disponibilidad de productos por local y protección de pedidos guardados al cambiar de local.

La comprobación integrada renderiza React estáticamente con Vite y comprueba etiquetas asociadas, input de búsqueda, select con tres opciones, radios nativos, doce tarjetas, imágenes con alt y agotados visibles. El servidor de esa prueba se cierra al terminar. No ejecuta eventos del navegador, foco, temporizadores de anuncios o lectores de pantalla.

El contraste verifica nueve pares de tokens contra los umbrales 4.5:1 para texto y 3:1 para elementos no textuales. No mide fotografías, colores efectivos de controles nativos ni todos los estados renderizados.

## Reporte manual del usuario

El usuario informó que revisó el zoom real al 200 % y no encontró problemas. Se registró en [Fase 1](../fase1/README.md), con procedencia explícita. La revisión corresponde al prototipo anterior al catálogo nuevo; el agente no la ejecutó, no recibió capturas y no la extiende automáticamente a los controles de Fase 2.

## Validación que sigue pendiente

Se intentó abrir `http://127.0.0.1:5173/menu` en una pestaña dedicada del navegador integrado. El resultado fue `The browser access host is unavailable`. No se utilizó una alternativa que evitara esa restricción.

| Validación | Estado real |
| --- | --- |
| Visual del menú a 360/390/430/768/1024/1440 px, al inicio y al final | Pendiente; no hay capturas nuevas |
| Tab, Shift+Tab, Enter y Espacio en búsqueda, radios, select, botones y enlaces | Semántica implementada; eventos reales pendientes |
| Permanencia del foco al filtrar, borrar y aplicar local | Pendiente de navegador |
| Anuncios de resultados y de cambio de local | Región de estado implementada; lectura real pendiente |
| Foco inicial, skip link, rutas restantes e historial de Fase 1 | Se conserva el pendiente anterior |
| Zoom real 200 % del nuevo menú | Pendiente de revisión propia de Fase 2 |
| axe | Aplazado por el usuario; no ejecutado ni acreditado |
| Consola del navegador | No capturada; los logs de Node/Vite no la sustituyen |
| NVDA y pruebas con usuarios | Pendientes del plan académico |

El HTTP 200 verifica entrega de recursos; no prueba el funcionamiento de React ni elimina los pendientes de interacción.

## Decisiones y límites

- Fotografías APF2 de Cheese y Royal: referencia de baja resolución extraída de la figura B1 y encuadrada con CSS. Los SVG de productos adicionales son ilustraciones académicas locales. El encuadre final necesita revisión visual.
- La disponibilidad simulada se limita a productos completos. Los acompañamientos, variantes y configuradores permanecen en Fase 3.
- El local se aplica explícitamente, se refleja en el Header y se conserva usando el contrato de almacenamiento existente. Solo se recupera su ID; no se hidrata ni opera el carrito.
- Si ya hay productos guardados o no se puede leer la instantánea, el selector conserva local y datos con explicación. El diálogo de impacto se implementará en su fase autorizada.
- Los enlaces de producto abren el shell existente. No agregan productos, no abren configuradores funcionales ni confirman pedidos.

La siguiente fase propuesta es Personalización. Requiere una nueva aprobación del usuario.
