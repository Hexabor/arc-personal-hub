# Ourense · Arc — adaptación móvil

Preparada el 16/11/2026 sobre `main` 2e85bf5 de Hexabor/arc-personal-hub. Destino solicitado por Arc: `ourense.arcdev.app`.

## Fuente y construcción

`viaje/` contiene la entrada independiente, los metadatos de instalación y el icono de maleta de la familia esmeralda, grafito y oro de ARC. Comparte `dist/vacaciones.js` y `dist/vacaciones.css` con el módulo original del Hub. `node viaje/build.cjs` genera exclusivamente recursos públicos en `cloudflare/ourense/`, excluido de Git. Reutiliza la configuración pública del cliente Google y la API existentes; el transporte de esta entrada admite solo getVacationData y saveVacationPlan. No obtiene getHubData ni publica registros del viaje.

La página se instala como acceso independiente, con iconos PNG opacos 180/192/512 y manifest standalone. La ayuda describe Android/iPhone. No tiene caché de datos ni modo sin conexión; la sesión de Google permanece solo en memoria, según el funcionamiento existente. Las fuentes canónicas y la comprobación de propietario se mantienen en Google.

## Interfaz

Cabecera compacta, agenda y planes por encajar en pestañas móviles, día seleccionable, salto a hoy y enlaces originales desde las tarjetas. Por encima de 760 px se ven agenda y planes por encajar juntos. Objetivos táctiles de 44 px; textos de formulario de 16 px y una columna en 320 px. Fechas visibles y editables DD/MM/AAAA, convertidas a ISO antes del mismo contrato de guardado. Valida fechas reales y límites del viaje antes de enviar. Los controles de volver, el descarte de cambios y los reintentos de guardado existentes se conservan. Corregido el botón Reintentar de la primera lectura, que antes quedaba bloqueado si aún no había datos.

## Verificación y publicación

Sintaxis del módulo y del shell, vacaciones (acceso privado, conflictos, reintentos e idempotencia), transporte de Google, navegación de vuelta e inline de Google superados. Navegador local con ejemplos sintéticos: 390×844 y 320×740, sin desbordamiento de la página; navegación día/pestañas, alta con fecha preseleccionada, edición con fechas vacías y rechazo local de fecha inexistente. La instalación en móvil físico queda pendiente de Arc.

Publicado y verificado el 16/11/2026 en https://ourense.arcdev.app/, Worker estático `ourense-arc` de la cuenta personal Cloudflare ya existente. Versión vigente `100d052e`, con calendario y horas de 24 horas; anterior estable `a4388ad8` y primera versión recuperable `407b3fd7`. Dominio enlazado en Production y HTTPS operativo. Se conserva el acceso a los datos de Google exclusivamente por la API privada existente; el paquete público no contiene planes personales. Arc autorizó expresamente la publicación, el dominio y la configuración/comprobación de Google durante esta sesión.

Se añadió solo https://ourense.arcdev.app a los orígenes JavaScript del cliente existente `ARC HUB personal — Pages`, manteniendo https://hexabor.github.io y https://hub.arcdev.app. Google confirmó el guardado; no se cambiaron credenciales, scopes ni audiencia. La conexión y lectura reales funcionaron desde el dominio nuevo: siete planes, cuatro con fecha y tres por encajar. Se comprobó el editor real (fechas DD/MM/AAAA, horas y referencias) sin guardar cambios. Ningún plan modificado durante la adaptación.

QA final publicada: 390×844 y 320×740, anchura del documento no superior a la ventana, cabecera con Instalar/Ayuda/Salir de 44 px como mínimo, selección de día, pestañas móviles y ayuda de instalación. La instalación en un móvil físico queda pendiente de Arc. Captura de comprobación privada en cloudflare/evidence/ourense-movil.jpg, excluida del código y del despliegue.

## Continuación

Para actualizar Ourense: `node viaje/build.cjs`, validar la interfaz y subir solo los 13 archivos de cloudflare/ourense a una nueva versión del mismo Worker. Mantener el dominio y configuración Google existentes. El módulo histórico del Hub y los despliegues independientes de Google/Pages se conservan; sus recursos de vacaciones no se han vuelto a publicar.

Acceso desde el Hub publicado con autorización específica de Arc: Vacaciones pasa a Ourense y abre https://ourense.arcdev.app/. Versión Cloudflare del Hub `04583092`, Ready al 100 %. El enlace Ourense se verificó en el lateral vivo, con su URL correcta. Se detectó divergencia entre el código actual de GitHub y el Hub publicado; para evitar incorporar cambios ajenos se preparó una copia exacta de los 23 recursos vivos, cambiando solo esa línea de app.js y su versión de caché en index.html. Recuperación anterior del Hub: Cloudflare `42c2f7a9`; copia privada en cloudflare/evidence/hub-before-ourense.

El árbol técnico anterior no se marca como aceptado por estas pruebas: el uso real en el teléfono corresponde a Arc. Próximo paso de uso: abrir el dominio en el teléfono y añadirlo a la pantalla de inicio. Para mantenimiento, conservar la diferencia documentada entre el Hub vivo y main hasta reconciliarla en una tarea autorizada; no sustituir la interfaz del Hub por un build completo de main solo para actualizar Ourense.

La vista previa sintética reside en cloudflare/evidence, fuera del repositorio y del paquete. Nunca subirla.

## Fechas con calendario y horas de 24 horas · 16/11/2026

Por instrucción fundacional de Arc, las horas se muestran y editan siempre en HH:mm (24 horas), independientemente de la configuración regional del dispositivo. El formulario usa dos selectores numéricos: horas 00–23 y minutos 00–59, con valor vacío opcional; ya no depende del control de hora nativo que podía mostrar AM/PM. La última lectura fija también `hourCycle: h23`.

Los campos de fecha mantienen el texto DD/MM/AAAA y añaden un botón de calendario propio. La ventana mensual empieza en lunes, permite teclado y navegación entre meses dentro del viaje, destaca la fecha seleccionada y ofrece borrar o cancelar. Solo admite fechas dentro del período original. Seleccionar un día convierte su valor visible a DD/MM/AAAA; guardar conserva el contrato ISO de la API. Escape cierra solo el calendario y conserva la ficha del plan.

Pruebas con datos sintéticos: selección de 18/11/2026 y envío 2026-11-18 con 23:59; cambio de mes y envío 2026-12-01 con 00:00; borrado de fecha y hora conserva valores vacíos. Revisión a 390×844 y 320×740, incluida la lectura completa del campo de fecha, límites del calendario y cierre con Escape. No se modifican planes reales en estas pruebas. Criterio general guardado en la memoria de instrucciones de Arc.

Publicación `100d052e`, Ready al 100 %. Comprobación del editor real en el dominio: fecha completa, valores de hora/minuto y calendario; sin guardar cambios de planes. La variante intermedia `31e0e10f` se sustituyó para conservar la anchura original de Tipo/Estado, dando espacio adicional solo a las parejas fecha/hora. Fuente compartida actualizada; no se vuelven a desplegar los accesos históricos de Google, Pages o la vista integrada del Hub.

## Copia mantenible de la fuente

La fuente mantenible se versiona en `main` del repositorio `Hexabor/arc-personal-hub`, con la implementación inicial en `9fb45862660eb480589352ce95cc7f547742c69e` y sus notas posteriores. Arc autorizó expresamente publicar el código y la documentación en esa rama el 16/11/2026. El paquete no contiene planes personales, capturas ni credenciales privadas. Las publicaciones de Cloudflare se verificaron byte a byte: 12 recursos de Ourense y 23 del Hub coinciden con los paquetes enviados. Para retomar mantenimiento consultar este documento y el inventario privado; conservar la diferencia documentada entre el Hub vivo y el código de main. La publicación de la fuente no vuelve a desplegar Cloudflare ni ejecuta el flujo manual de Pages.

## Lista de equipaje · 16/11/2026

La entrada independiente incorpora las pestañas Agenda y Maleta. La segunda presenta la lista privada por categorías, casillas de preparación, contador y progreso, además de un enlace directo al repaso final. Las cantidades incluyen lo puesto. La lista acordada se cargó desde la interfaz privada, con todas las casillas inicialmente desmarcadas; su contenido no forma parte del paquete público ni del repositorio.

Se conserva la misma fuente y el mismo escritor: un registro de tipo Otro en Planes contiene notas legibles con primera línea `ARC_EQUIPAJE_V1`, encabezados `## ` y casillas Markdown. `viaje/packing.js` interpreta esas notas; cada cambio usa `saveVacationPlan` con la versión leída, el mismo ID y un requestId conservado ante respuesta incierta. El servidor existente comprueba propietario, conflicto de versión y recibo atómico. No hay una nueva hoja, API, permiso ni almacenamiento local de datos personales. Actualizar relee la fuente y permite comparar el estado confirmado. Las respuestas de una sesión anterior se descartan al desconectar.

El shell filtra solo ese registro de la agenda independiente para no contarlo como plan pendiente; las vistas históricas siguen pudiendo mostrarlo como un plan con notas legibles. El resto de planes y las notas meteorológicas actuales se mantienen en su fuente. La lista solo se obtiene tras conectar con Google. Los archivos nuevos `packing.js` y `packing.css` se incluyen desde `viaje/build.cjs`; el paquete contiene 15 archivos, contando `_headers`, que se aplica como configuración.

Verificación local: pruebas de parseo, texto escapado, guardado, reintento con solicitud idéntica, actualización ante cambios externos y descarte de respuestas después de salir. Pruebas existentes de vacaciones, transporte Google y navegación superadas. Vista sintética a 390 y 320 px sin desbordamiento; marcado y contador comprobados. Publicación Cloudflare `b1b97caa`, Ready al 100 %, en el mismo dominio. Recuperación anterior de interfaz: `100d052e`; conservar el registro privado al revertir. La instalación y uso físico en el teléfono siguen pendientes de Arc.

Continuación: mantener el texto de la lista únicamente en la fuente privada; modificar desde allí sin sustituir estados ya marcados. Para actualizar la interfaz, generar con `node viaje/build.cjs` y subir solo `cloudflare/ourense/` al mismo Worker. La vista previa de prueba permanece en `cloudflare/evidence/packing-preview`, excluida de Git y del despliegue.

Comprobación publicada: conexión privada, lista real, guardado de una casilla, lectura posterior y desmarcado de la prueba verificados. Los 14 recursos públicos servidos coinciden byte a byte con el paquete; `_headers` es configuración. Mantener cualquier progreso del usuario posterior a la prueba. Mantenimiento privado actualizado en LOCAL-0016, conservando las notas del trabajo concurrente de Bloques; ese trabajo deberá conciliar el shell y los dos archivos nuevos antes de publicar. La copia de esta mejora en GitHub quedó pendiente de autorización en el chat por rechazo automático; el código está guardado localmente y la app sigue publicada.
