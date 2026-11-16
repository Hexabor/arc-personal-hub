# Ourense · Arc — adaptación móvil

Preparada el 16/11/2026 sobre `main` 2e85bf5 de Hexabor/arc-personal-hub. Destino solicitado por Arc: `ourense.arcdev.app`.

## Fuente y construcción

`viaje/` contiene la entrada independiente, los metadatos de instalación y el icono de maleta de la familia esmeralda, grafito y oro de ARC. Comparte `dist/vacaciones.js` y `dist/vacaciones.css` con el módulo original del Hub. `node viaje/build.cjs` genera exclusivamente recursos públicos en `cloudflare/ourense/`, excluido de Git. Reutiliza la configuración pública del cliente Google y la API existentes; el transporte de esta entrada admite solo getVacationData y saveVacationPlan. No obtiene getHubData ni publica registros del viaje.

La página se instala como acceso independiente, con iconos PNG opacos 180/192/512 y manifest standalone. La ayuda describe Android/iPhone. No tiene caché de datos ni modo sin conexión; la sesión de Google permanece solo en memoria, según el funcionamiento existente. Las fuentes canónicas y la comprobación de propietario se mantienen en Google.

## Interfaz

Cabecera compacta, agenda y planes por encajar en pestañas móviles, día seleccionable, salto a hoy y enlaces originales desde las tarjetas. Por encima de 760 px se ven agenda y planes por encajar juntos. Objetivos táctiles de 44 px; textos de formulario de 16 px y una columna en 320 px. Fechas visibles y editables DD/MM/AAAA, convertidas a ISO antes del mismo contrato de guardado. Valida fechas reales y límites del viaje antes de enviar. Los controles de volver, el descarte de cambios y los reintentos de guardado existentes se conservan. Corregido el botón Reintentar de la primera lectura, que antes quedaba bloqueado si aún no había datos.

## Verificación y publicación

Sintaxis del módulo y del shell, vacaciones (acceso privado, conflictos, reintentos e idempotencia), transporte de Google, navegación de vuelta e inline de Google superados. Navegador local con ejemplos sintéticos: 390×844 y 320×740, sin desbordamiento de la página; navegación día/pestañas, alta con fecha preseleccionada, edición con fechas vacías y rechazo local de fecha inexistente. La instalación en móvil físico queda pendiente de Arc.

Publicado y verificado el 16/11/2026 en https://ourense.arcdev.app/, Worker estático `ourense-arc` de la cuenta personal Cloudflare ya existente. Versión final `a4388ad8`; primera versión recuperable `407b3fd7`. Dominio enlazado en Production y HTTPS operativo. Se conserva el acceso a los datos de Google exclusivamente por la API privada existente; el paquete público no contiene planes personales. Arc autorizó expresamente la publicación, el dominio y la configuración/comprobación de Google durante esta sesión.

Se añadió solo https://ourense.arcdev.app a los orígenes JavaScript del cliente existente `ARC HUB personal — Pages`, manteniendo https://hexabor.github.io y https://hub.arcdev.app. Google confirmó el guardado; no se cambiaron credenciales, scopes ni audiencia. La conexión y lectura reales funcionaron desde el dominio nuevo: siete planes, cuatro con fecha y tres por encajar. Se comprobó el editor real (fechas DD/MM/AAAA, horas y referencias) sin guardar cambios. Ningún plan modificado durante la adaptación.

QA final publicada: 390×844 y 320×740, anchura del documento no superior a la ventana, cabecera con Instalar/Ayuda/Salir de 44 px como mínimo, selección de día, pestañas móviles y ayuda de instalación. La instalación en un móvil físico queda pendiente de Arc. Captura de comprobación privada en cloudflare/evidence/ourense-movil.jpg, excluida del código y del despliegue.

## Continuación

Para actualizar Ourense: `node viaje/build.cjs`, validar la interfaz y subir solo los 13 archivos de cloudflare/ourense a una nueva versión del mismo Worker. Mantener el dominio y configuración Google existentes. El módulo histórico del Hub y los despliegues independientes de Google/Pages se conservan; sus recursos de vacaciones no se han vuelto a publicar.

Acceso desde el Hub publicado con autorización específica de Arc: Vacaciones pasa a Ourense y abre https://ourense.arcdev.app/. Versión Cloudflare del Hub `04583092`, Ready al 100 %. El enlace Ourense se verificó en el lateral vivo, con su URL correcta. Se detectó divergencia entre el código actual de GitHub y el Hub publicado; para evitar incorporar cambios ajenos se preparó una copia exacta de los 23 recursos vivos, cambiando solo esa línea de app.js y su versión de caché en index.html. Recuperación anterior del Hub: Cloudflare `42c2f7a9`; copia privada en cloudflare/evidence/hub-before-ourense.

El árbol técnico anterior no se marca como aceptado por estas pruebas: el uso real en el teléfono corresponde a Arc. Próximo paso de uso: abrir el dominio en el teléfono y añadirlo a la pantalla de inicio. Para mantenimiento, conservar la diferencia documentada entre el Hub vivo y main hasta reconciliarla en una tarea autorizada; no sustituir la interfaz del Hub por un build completo de main solo para actualizar Ourense.

La vista previa sintética reside en cloudflare/evidence, fuera del repositorio y del paquete. Nunca subirla.

## Copia mantenible de la fuente

La fuente mantenible se versiona en `main` del repositorio `Hexabor/arc-personal-hub`, con la implementación inicial en `9fb45862660eb480589352ce95cc7f547742c69e` y sus notas posteriores. Arc autorizó expresamente publicar el código y la documentación en esa rama el 16/11/2026. El paquete no contiene planes personales, capturas ni credenciales privadas. Las publicaciones de Cloudflare se verificaron byte a byte: 12 recursos de Ourense y 23 del Hub coinciden con los paquetes enviados. Para retomar mantenimiento consultar este documento y el inventario privado; conservar la diferencia documentada entre el Hub vivo y el código de main. La publicación de la fuente no vuelve a desplegar Cloudflare ni ejecuta el flujo manual de Pages.
