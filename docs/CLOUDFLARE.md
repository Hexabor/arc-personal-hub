# Hub personal en Cloudflare · 01/11/2026

## Ajuste del lateral · 02/11/2026

Aplicado el mockup aprobado: Inicio, los cinco últimos módulos abiertos y los desplegables, en ese orden. El orden compartido se conserva también en Más del móvil. La zona de opciones expandida del lateral usa gris #454B47, texto claro y esquinas inferiores de 8 px; la cabecera conserva el grafito y la selección continúa amarilla. Se mantienen las claves de recientes y desplegables, sus estados y las rutas existentes. No cambia el ancho de 176 px ni los datos, conexiones o backends.

La caché usa 20261102-sidebar. Recuperación anterior: Cloudflare b59a6a28. Validación: sintaxis, navegación/memoria, apps y Google inline; comprobación del orden y fondo en navegador y contraste de archivos publicados con el paquete. No se envían capturas ni se editan registros personales durante la verificación.

## Equilibrio · 02/11/2026

Arc elige y autoriza aplicar la propuesta Equilibrio al Hub: esmeralda #228974, grafito #1C211E y oro suave #DDB84D, con selección amarilla y acabado satinado contenido en Inicio y Capturar. Contenido claro, lateral de 176 px, secciones sin paneles adicionales y tarjetas de 44 px; móvil con secciones apiladas y dos tarjetas por fila. Se retiran los rótulos «TU ESPACIO PERSONAL» y «TU ESPACIO» de la marca y cabeceras. La marca incorpora Órbita y los accesos a Watch Tracker, Playtracker y FlowGrid usan sus iconos aprobados.

Se conservan las funciones reales de captura, los cinco recientes, los desplegables, las rutas de apps, los marcos existentes y la nueva vista de cumpleaños publicada en 86666cd4 (commit 8cead29). Inicio queda accesible y seleccionado en amarillo en el lateral; los filtros y pestañas seleccionados comparten el oro. Las fechas completas del cliente compartido se presentan como DD/MM/AAAA; el almacenamiento y los cálculos mantienen sus formatos originales.

La paleta se aplica al marco y a los controles compartidos del Hub; los interiores de las apps enlazadas mantienen su diseño. No cambian hojas, datos, API, autenticación ni permisos. Recuperación de interfaz: Cloudflare 86666cd4. La caché de estilos y scripts usa la versión 20261102-equilibrio. Los tres PNG de módulos se copian al paquete público junto al icono de Hub ya existente. La vista local de comprobación usa solo datos sintéticos y queda en cloudflare/evidence, fuera del paquete público.

Publicación: Cloudflare b59a6a28, código 9497168; sustituye a9529f3e, la primera aplicación de Equilibrio. La versión definitiva retira también el rótulo de la pantalla de conexión y renueva la caché con 20261102-equilibrio-r2. Los 23 recursos públicos coinciden byte por byte con el paquete; _headers se aplica como configuración y no se sirve como recurso. Evidencia local excluida de Git: cloudflare/evidence/equilibrio-publication.json. Para recuperar el aspecto anterior completo se conserva 86666cd4.

Validación: construcción de Google y Cloudflare; comprobación de sintaxis; batería existente de lógica, transporte, edición, navegación, calendario, apps y cumpleaños. Revisión visual de escritorio y móvil, búsqueda, captura plegable, menú móvil e imágenes. Conexión viva de Google y directorio real comprobados; Personas conserva las pestañas Próximos cumpleaños, Recientes y Fichas. La comprobación de un teléfono físico sigue pendiente. Se ha publicado hub.arcdev.app; los accesos heredados de Google y Pages no se han desplegado de nuevo.

El hub se sirve en https://hub.arcdev.app/ con un Worker de archivos estáticos llamado `arc-personal-hub`. Conserva la API privada de Apps Script, el cliente Google existente y la hoja original. El cliente Google admite el origen nuevo y conserva https://hexabor.github.io para el acceso anterior. No se crearon credenciales ni un segundo escritor de datos.

## Construcción y publicación

`node cloudflare/build.cjs` produce exclusivamente archivos públicos en `cloudflare/site/`. `pages/public-config.json` contiene identificadores públicos tomados de la configuración del hub ya publicado; no contiene secretos. No subir respaldos, evidencias, instantáneas ni el árbol del proyecto completo.

En Cloudflare, abrir el Worker → New deployment y subir todos los archivos de `cloudflare/site/` a la raíz. El dominio propio se conserva al actualizar. El despliegue manual es independiente de GitHub Pages, cuyo flujo se mantiene manual y no se ha ejecutado en esta migración.

## Aplicaciones

Inicio presenta una tarjeta por módulo: Tareas, Proyectos, Personas, Memoria, Incoming, Vacaciones, las apps del catálogo y los destinos adicionales del registro privado. El núcleo se representa con sus secciones y los viajes con Vacaciones, sin duplicar sus hojas como tarjetas. Las apps abren directamente su vista integrada; los módulos que aún no tienen vista propia abren su hoja actual. Añadir una app al catálogo o un módulo al registro lo incorpora al inicio.

La portada aplica la preferencia de Arc de mostrar la mayor cantidad de información útil sin scroll: filas de 44 px agrupadas por Organización, Personas y memoria, Ocio y viajes, Salud y bienestar y Finanzas y gestión. Las secciones llevan fondo, borde y cabecera propios. `›` indica navegación dentro del Hub y `↗`, apertura de otra pestaña. Sin destino o con estado pendiente/inactivo, el módulo aparece atenuado y sin acción. Las descripciones completas se conservan en el título y nombre accesible de cada tarjeta.

El lateral y Más en móvil reutilizan este catálogo: cinco recientes únicos primero, seguidos por cinco desplegables. `arc-hub-recent-modules-v1` guarda solo claves de módulos (no datos ni URLs); `arc-hub-open-sections-v1` guarda los desplegables abiertos. Ambos son locales al navegador. Entrar en un módulo, una app o un enlace del catálogo actualiza recientes; leer de nuevo los datos no cambia su orden. Las apps notifican selecciones explícitas con `arc-module-open` sin reconstruir sus marcos.

Memoria distingue planificación y realización. Lo vivido incluye solo Ocurrido, con fecha real descendente y recuerdos sin fecha al final. Planes ofrece Agenda y Calendario mensual, filtros Lo próximo, En curso, Sin fecha, Pendientes de confirmar, Cerrados y Todos. Las fechas no cambian estados. Recomendaciones e Ideas conservan sus fuentes propias. Clasificaciones desconocidas van a Por aclarar. La edición explícita conserva previsión y vivencia, comprueba versiones y registra recibos privados. Contrato y recuperación en MEMORIA.md.

«Que no se te escape» es un desplegable compacto cerrado por defecto; conserva el borrador al plegarse y se abre también desde Capturar o la tecla N. La barra inferior móvil empieza por Inicio. Las actualizaciones de datos conservan la apertura elegida; volver a Inicio o guardar correctamente la cierra. El diseño de tarjetas del inicio se publica también en el acceso anterior de GitHub Pages.

`pages/apps.js` define el catálogo cerrado de apps: Watch Tracker y FlowGrid. Se cargan bajo sus direcciones originales; no se duplican datos ni se comparten tokens entre ventanas o apps. Las rutas `#apps`, `#apps/watch` y `#apps/flowgrid` permiten entrada directa.

Desde GitHub Pages, las tarjetas de apps llevan a su vista en `hub.arcdev.app`, el origen autorizado para incrustarlas. Los archivos de la nueva portada llevan una versión en su URL para renovar las copias guardadas en el navegador.

Cada marco se crea solo la primera vez que se abre y se conserva al navegar por el hub y en sus actualizaciones de lectura. Recargar la página inicia una sesión nueva según las reglas originales de cada app. Cada app mantiene su cierre de sesión propio.

Los marcos permiten scripts, origen original, formularios, diálogos, ventanas auxiliares y descargas para conservar las funciones existentes. No permiten que una app navegue la ventana del hub. El hub permite marcos solo desde las apps del catálogo y Google Identity Services; no puede ser incrustado a su vez por otra web.

Watch Tracker admite únicamente https://hub.arcdev.app como padre. `?hub=1` dentro de un marco activa una cabecera compacta; abrirlo directamente conserva su aspecto completo, incluso con ese parámetro. Sus controles y backend se mantienen.

## Recuperación

Calendario en foco (02/11/2026): construido desde los mismos recursos de `dist/`, compartidos por Cloudflare, Pages y la web privada. Seis semanas ajustadas a la ventana, con filtros y detalles superpuestos. La interfaz previa es Cloudflare `ca66aa34`; para reconstruir la web privada anterior, conservar la corrección de enlaces de Google 13. API 10, esquema 7 y contrato 15 permanecen compatibles. Añadir `node tests/calendar-focus.cjs` a la validación. Detalles en [MEMORIA.md](MEMORIA.md).

Publicación vigente del modo foco: Cloudflare `d207c503`, once recursos públicos verificados contra el paquete, y web privada Google 13. La API sigue en 10. La publicación de Pages se ejecuta mediante su flujo manual habitual. La construcción de Google protege los enlaces del script incrustado frente a la reescritura de HtmlService; prueba adicional: `node tests/google-inline.cjs`.

El hub anterior sigue en https://hexabor.github.io/arc-personal-hub/. La migración no cambió los despliegues de Apps Script ni las hojas. Para revertir una publicación de interfaz, seleccionar la versión anterior en Deployments del Worker; la versión de Watch Tracker anterior a esta integración es `37a83dfe`.

## Validación

Ejecutar `node tests/logic.cjs`, `node tests/pages.cjs`, `node tests/task-edits.cjs`, `node tests/task-ui.cjs`, `node tests/vacaciones.cjs` y `node tests/apps.cjs`. La aceptación viva y sus límites se registran por separado en `cloudflare/evidence/`, excluido de Git.

## Playtracker · 02/11/2026

Añadido al catálogo, Inicio y lateral en Ocio y viajes. Su enlace abre https://arc-playtracker.j-arc-main.chatgpt.site/ en una pestaña propia; usa su acceso privado de ChatGPT y su almacenamiento D1. No se incrusta ni comparte tokens. Watch Tracker y FlowGrid conservan sus marcos. La primera versión comienza vacía por decisión de Arc, sin importación de Notion. Recuperación del hub: versión anterior d207c503.

## Enlaces directos a trackers · 02/11/2026

Watch Tracker y Playtracker aparecen en Ocio y viajes, tanto en Inicio como en el menú lateral y Más en móvil, como enlaces externos a sus direcciones originales. Abren pestaña nueva con noopener/noreferrer. La clave de recientes sigue siendo app:watch/app:play. El catálogo Apps conserva el acceso integrado anterior de Watch Tracker para las rutas históricas; FlowGrid se mantiene igual. No hay cambios de datos, autenticación ni permisos. Recuperación de interfaz: versión anterior 6a10cab4.
## Icono de móvil · 02/11/2026

Icono ARC en azul noche, familia visual con Watch Tracker y Playtracker, generado con image_gen. Fuentes PNG en ui/icons; manifest y enlaces apple-touch-icon/favicon en ui. Exportaciones opacas 180 px para iOS y 192/512 px para Android, incluida variante maskable con fondo completo. El build de Cloudflare y Pages copia los recursos; la CSP permite manifest-src self. No se añade modo offline ni se cambian datos, autenticación o permisos. Recuperación previa de interfaz: 288a73eb. El uso en un móvil físico queda pendiente.

## Identidad aprobada · 02/11/2026

Arc aprueba la familia esmeralda y oro suave: esmeralda #228974, grafito #1C211E y oro #DDB84D, con acabado satinado contenido. Hub: Órbita grafito con núcleo dorado. Recuperación: Cloudflare aacd8672. PNG opacos con nombres v2, metadatos de inicio e iconos any/maskable; se conservan los originales v1. Se modifica únicamente identidad del icono y color del navegador, sin rediseñar pantallas ni cambiar autenticación, datos o backend. Playtracker continúa en D1: la migración solicitada a Drive permanece pendiente y es independiente. Exportaciones y prompts en el paquete ARC-esmeralda-oro-20261102. Comprobación en teléfono físico pendiente.

## Personas y cumpleaños · 02/11/2026

Personas abre en Próximos cumpleaños. Recientes muestra la última ocurrencia anual de cada cumpleaños; Fichas conserva el contexto anterior. Las dos listas incluyen hoy y ordenan por distancia en días a la fecha de Madrid: próximos hacia delante y recientes hacia atrás, con un ciclo anual completo. Salir del módulo y volver restaura Próximos; la actualización de datos conserva la pestaña abierta.

Las fechas se leen del registro canónico ya disponible en dates/history, con una fila por persona y mes/día aunque las dos lecturas compartan registros. Se vincula la ficha mediante el ID, conservando los nombres actuales y las personas distintas. La edad corresponde al año de la ocurrencia mostrada, nunca al año actual sin ajustar. Un año ausente, dudoso o contradictorio no genera edad. Los cumpleaños sin año usan solo la declaración explícita de mes/día del relato; no fechas de importación ni años citados como dudosos. El 29 de febrero se muestra con su fecha original y se sitúa el 28 de febrero en años no bisiestos.

Validación: node tests/personas-birthdays.cjs, además de la batería habitual. Incluye orden, cambio de año, edades, hoy, años dudosos, duplicados, identidades, fecha inválida, año bisiesto y navegación entre las tres pestañas. El paquete público no contiene registros personales. La muestra privada de validación se conserva fuera del repositorio.

Publicado en Cloudflare 86666cd4; recuperación anterior 83b7da99. Los 20 recursos servidos coinciden byte a byte con el paquete público. Comprobación conectada: 69 cumpleaños, orden correcto en ambas pestañas, 13 edades sin confirmar, 74 fichas conservadas y vínculo de Nerea Morales a PER-0074. La web privada de Google y GitHub Pages tienen su paquete actualizado en el repositorio; sus despliegues independientes no forman parte de esta publicación.
