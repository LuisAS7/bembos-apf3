# Publicación en Netlify para auditoría

Base `9071b73`; 2026-11-07, America/Lima. El usuario sustituye Vercel por Netlify y autoriza publicar sin otra aprobación. No se modifica la interfaz ni los últimos ajustes visuales.

`netlify.toml` configura `npm run build`, directorio `dist` y Node 22. `public/_redirects` contiene `/* /index.html 200`; Vite lo copia a `dist/_redirects`. La regla no forzada conserva los archivos estáticos existentes y sirve la SPA para accesos directos/recarga, según la [documentación oficial](https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/#history-pushstate-and-single-page-apps). Se retiran `vercel.json` y `.vercelignore`; `.netlify/` queda fuera de Git.

| Comando | Resultado | Evidencia |
| --- | --- | --- |
| `npm.cmd run lint` | Exit 0 | [lint.log](lint.log) |
| `npm.cmd test` | 107 aprobados, 0 fallos | [tests.log](tests.log) |
| `npm.cmd run build` | TypeScript + Vite, exit 0; `dist/_redirects` presente | [build.log](build.log) |

[Fecha/códigos de salida](results.json). Se adapta la prueba de configuración de hosting a Netlify; el resto se conserva. Sin dependencias del proyecto ni cambios de lockfile. CLI oficial ejecutada temporalmente desde npm. Logs reales normalizados a UTF-8, sin ANSI ni espacios finales.

`netlify status --json` confirmó que no hay sesión ni sitio vinculado. Para entregar una URL sin exigir credenciales se puede usar el [despliegue anónimo oficial](https://docs.netlify.com/api-and-cli-guides/cli-guides/get-started-with-cli/#anonymous-deploys): crea un sitio reclamable, que se elimina tras una hora si no se reclama. El enlace de reclamación debe entregarse al usuario, nunca incorporarse al repositorio. Si el servicio rechaza esa modalidad, se necesita iniciar sesión con `npx netlify-cli login`; no enviar contraseñas ni tokens por chat.

Publicación del build ya comprobado: `npm exec --yes --package=netlify-cli -- netlify deploy --prod --allow-anonymous --dir=dist --no-build --json`. Solo se sube `dist`, sin documentos, fuentes de pruebas ni almacenamiento del navegador. Con sesión/sitio vinculado se omite `--allow-anonymous` para actualizarlo.

La primera carga anónima quedó protegida por contraseña y devolvió 404 en enlaces directos. La inspección del código de la CLI identificó que esa modalidad excluye `_redirects` al filtrar archivos, pero no transmite la configuración como el despliegue autenticado. Para el intento de corrección se utilizan los mismos helpers de carga anónima de la CLI incluyendo explícitamente `_redirects` y el origen `cli`. El resultado debe confirmarse por HTTP antes de dar las rutas por válidas. La comprobación de recursos excluye archivos ocultos de control como `.gitkeep`, que no son recursos publicados.

Verificación tras publicar: `node scripts/verify-deployment.mjs https://<sitio>.netlify.app`. Comprueba HTTP, tipos y SHA-256 de raíz, menú, rutas principales, JS/CSS e imágenes contra el build local. Guarda resultados en `remoto/verificacion.json`, ignorado por Git para conservar el commit publicado. El estado remoto se informa al usuario después del intento; no se declara una publicación exitosa sin URL y respuesta del servicio.

**Auditoría de accesibilidad pendiente.** No se reintenta el navegador bloqueado. HTTP y tests no acreditan renderizado/interacción, foco, responsive, barras, zoom, consola, axe ni NVDA. Se conservan los [casos manuales](../cierre-movil/comprobacion-manual.md) y las [fotografías pendientes](../../recursos-correccion-visual.json). Sin conformidad WCAG global. El dominio publicado tendrá almacenamiento propio; los pedidos/comprobantes locales no se transfieren.
