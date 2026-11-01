# Hub personal en Cloudflare · 01/11/2026

El hub se sirve en https://hub.arcdev.app/ con un Worker de archivos estáticos llamado `arc-personal-hub`. Conserva la API privada de Apps Script, el cliente Google existente y la hoja original. El cliente Google admite el origen nuevo y conserva https://hexabor.github.io para el acceso anterior. No se crearon credenciales ni un segundo escritor de datos.

## Construcción y publicación

`node cloudflare/build.cjs` produce exclusivamente archivos públicos en `cloudflare/site/`. `pages/public-config.json` contiene identificadores públicos tomados de la configuración del hub ya publicado; no contiene secretos. No subir respaldos, evidencias, instantáneas ni el árbol del proyecto completo.

En Cloudflare, abrir el Worker → New deployment y subir todos los archivos de `cloudflare/site/` a la raíz. El dominio propio se conserva al actualizar. El despliegue manual es independiente de GitHub Pages, cuyo flujo se mantiene manual y no se ha ejecutado en esta migración.

## Aplicaciones

`pages/apps.js` define el catálogo cerrado de apps: Watch Tracker y FlowGrid. Se cargan bajo sus direcciones originales; no se duplican datos ni se comparten tokens entre ventanas o apps. Las rutas `#apps`, `#apps/watch` y `#apps/flowgrid` permiten entrada directa.

Cada marco se crea solo la primera vez que se abre y se conserva al navegar por el hub y en sus actualizaciones de lectura. Recargar la página inicia una sesión nueva según las reglas originales de cada app. Cada app mantiene su cierre de sesión propio.

Los marcos permiten scripts, origen original, formularios, diálogos, ventanas auxiliares y descargas para conservar las funciones existentes. No permiten que una app navegue la ventana del hub. El hub permite marcos solo desde las apps del catálogo y Google Identity Services; no puede ser incrustado a su vez por otra web.

Watch Tracker admite únicamente https://hub.arcdev.app como padre. `?hub=1` dentro de un marco activa una cabecera compacta; abrirlo directamente conserva su aspecto completo, incluso con ese parámetro. Sus controles y backend se mantienen.

## Recuperación

El hub anterior sigue en https://hexabor.github.io/arc-personal-hub/. La migración no cambió los despliegues de Apps Script ni las hojas. Para revertir una publicación de interfaz, seleccionar la versión anterior en Deployments del Worker; la versión de Watch Tracker anterior a esta integración es `37a83dfe`.

## Validación

Ejecutar `node tests/logic.cjs`, `node tests/pages.cjs`, `node tests/task-edits.cjs`, `node tests/task-ui.cjs`, `node tests/vacaciones.cjs` y `node tests/apps.cjs`. La aceptación viva y sus límites se registran por separado en `cloudflare/evidence/`, excluido de Git.
