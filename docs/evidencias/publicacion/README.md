# Ajuste final y preparación de publicación

> Informe histórico de la preparación de Vercel. El usuario sustituyó la plataforma por [Netlify](../netlify/README.md); estas instrucciones ya no son las vigentes.


Base `ac78928`; 2026-11-07, America/Lima. Publicación autorizada por el usuario para auditoría, sin otra aprobación de alcance.

**Cambios visuales limitados al carrusel:** retirados el texto de ayuda y los dos botones. Márgenes automáticos en primer/último elemento centran la fila solo si sobra espacio; con overflow quedan en cero, permitiendo alcanzar la primera categoría. Se oculta únicamente el scrollbar móvil, conservando scroll nativo táctil/trackpad, barra de escritorio/Shift+rueda y radios nativos de teclado. El foco visible y `scrollIntoView` permanecen. No hay otros cambios de diseño ni búsqueda de fotografías.

**Vercel preparado:** `vercel.json` declara Vite, `npm run build`, salida `dist` y fallback a `index.html` para acceso directo/recarga de rutas SPA, siguiendo la [documentación oficial](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas). `.vercelignore` excluye documentos, tests, configuraciones privadas y archivos de entorno de la carga; `.vercel/` se ignora por Git. No hay dependencias nuevas del proyecto ni cambios de lockfile. Se ejecutó la CLI oficial 65.12.1 temporalmente desde la caché de npm.

| Comando | Resultado | Evidencia |
| --- | --- | --- |
| `npm.cmd run lint` | Exit 0 | [lint.log](lint.log) |
| `npm.cmd test` | 107 aprobados, 0 fallos | [tests.log](tests.log) |
| `npm.cmd run build` | TypeScript + Vite, exit 0 | [build.log](build.log) |

[Códigos de salida/fecha](results.json). La prueba del carrusel verifica siete radios, selección y ausencia de la fila retirada; una prueba adicional declara el contrato de rutas SPA. No acredita el centrado, scroll o foco reales. Logs normalizados a UTF-8, sin ANSI ni espacios finales.

**Acceso comprobado:** `vercel whoami` devolvió «Logged out». No hay proyecto local vinculado ni credenciales de Vercel disponibles. La CLI rechazó el intento temporal con `login_required`: «Temporary deployments aren't available for this attempt. Log in to continue». Se necesita iniciar sesión con `npx vercel login` en este equipo; no enviar contraseñas ni tokens en el chat. Después se continúa con la publicación ya autorizada, sin otra aprobación de diseño.

Comando reproducible de publicación tras autenticar: `npm exec --yes --package=vercel@65.12.1 -- vercel deploy --prod --yes`. Si existe un proyecto que deba reutilizarse, vincularlo antes con la misma CLI; no sobrescribir un proyecto ajeno.

**Verificación remota preparada:** `node scripts/verify-deployment.mjs https://<deployment>.vercel.app`. Comprueba por HTTP raíz, menú, carrito, checkout, personalización/edición/confirmación, JS/CSS e imágenes; contrasta tipos y SHA-256 con el build local. Guarda resultado en `remoto/verificacion.json`, ignorado por Git para no cambiar el commit publicado. No ejecuta React en navegador ni acredita interacciones. Sin URL publicada, esa comprobación queda pendiente.

**Auditoría de accesibilidad pendiente.** No se reintenta el navegador bloqueado. Se conservan pendientes visual, touch/trackpad/teclado/foco, barras, zoom, consola, axe y NVDA, así como las fotografías no comprobadas del [manifiesto](../../recursos-correccion-visual.json). No se declara conformidad WCAG global. El almacenamiento del dominio publicado será distinto del entorno local; no se transfieren pedidos ni comprobantes del navegador local.
