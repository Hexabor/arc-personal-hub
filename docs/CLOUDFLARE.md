# Hub personal en Cloudflare · 01/11/2026

El hub se sirve en https://hub.arcdev.app/ con un Worker de archivos estáticos llamado `arc-personal-hub`. Conserva la API privada de Apps Script, el cliente Google existente y la hoja original. El cliente Google admite el origen nuevo y conserva https://hexabor.github.io para el acceso anterior. No se crearon credenciales ni un segundo escritor de datos.

## Construcción y publicación

`node cloudflare/build.cjs` produce exclusivamente archivos públicos en `cloudflare/site/`. `pages/public-config.json` contiene identificadores públicos tomados de la configuración del hub ya publicado; no contiene secretos. No subir respaldos, evidencias, instantáneas ni el árbol del proyecto completo.

En Cloudflare, abrir el Worker → New deployment y subir todos los archivos de `cloudflare/site/` a la raíz. El dominio propio se conserva al actualizar. El despliegue manual es independiente de GitHub Pages, cuyo flujo se mantiene manual y no se ha ejecutado en esta migración.

## Aplicaciones

Inicio presenta una tarjeta por módulo: Tareas, Proyectos, Personas, Memoria, Incoming, Vacaciones, las apps del catálogo y los destinos adicionales del registro privado. El núcleo se representa con sus secciones y los viajes con Vacaciones, sin duplicar sus hojas como tarjetas. Las apps abren directamente su vista integrada; los módulos que aún no tienen vista propia abren su hoja actual. Añadir una app al catálogo o un módulo al registro lo incorpora al inicio.

La portada aplica la preferencia de Arc de mostrar la mayor cantidad de información útil sin scroll: filas de 44 px agrupadas por Organización, Personas y memoria, Ocio y viajes, Salud y bienestar y Finanzas y gestión. Las secciones llevan fondo, borde y cabecera propios. `›` indica navegación dentro del Hub y `↗`, apertura de otra pestaña. Sin destino o con estado pendiente/inactivo, el módulo aparece atenuado y sin acción. Las descripciones completas se conservan en el título y nombre accesible de cada tarjeta.

«Que no se te escape» es un desplegable compacto cerrado por defecto; conserva el borrador al plegarse y se abre también desde Capturar o la tecla N. La barra inferior móvil empieza por Inicio. Las actualizaciones de datos conservan la apertura elegida; volver a Inicio o guardar correctamente la cierra. El diseño de tarjetas del inicio se publica también en el acceso anterior de GitHub Pages.

`pages/apps.js` define el catálogo cerrado de apps: Watch Tracker y FlowGrid. Se cargan bajo sus direcciones originales; no se duplican datos ni se comparten tokens entre ventanas o apps. Las rutas `#apps`, `#apps/watch` y `#apps/flowgrid` permiten entrada directa.

Desde GitHub Pages, las tarjetas de apps llevan a su vista en `hub.arcdev.app`, el origen autorizado para incrustarlas. Los archivos de la nueva portada llevan una versión en su URL para renovar las copias guardadas en el navegador.

Cada marco se crea solo la primera vez que se abre y se conserva al navegar por el hub y en sus actualizaciones de lectura. Recargar la página inicia una sesión nueva según las reglas originales de cada app. Cada app mantiene su cierre de sesión propio.

Los marcos permiten scripts, origen original, formularios, diálogos, ventanas auxiliares y descargas para conservar las funciones existentes. No permiten que una app navegue la ventana del hub. El hub permite marcos solo desde las apps del catálogo y Google Identity Services; no puede ser incrustado a su vez por otra web.

Watch Tracker admite únicamente https://hub.arcdev.app como padre. `?hub=1` dentro de un marco activa una cabecera compacta; abrirlo directamente conserva su aspecto completo, incluso con ese parámetro. Sus controles y backend se mantienen.

## Recuperación

El hub anterior sigue en https://hexabor.github.io/arc-personal-hub/. La migración no cambió los despliegues de Apps Script ni las hojas. Para revertir una publicación de interfaz, seleccionar la versión anterior en Deployments del Worker; la versión de Watch Tracker anterior a esta integración es `37a83dfe`.

## Validación

Ejecutar `node tests/logic.cjs`, `node tests/pages.cjs`, `node tests/task-edits.cjs`, `node tests/task-ui.cjs`, `node tests/vacaciones.cjs` y `node tests/apps.cjs`. La aceptación viva y sus límites se registran por separado en `cloudflare/evidence/`, excluido de Git.
