# GitHub Pages · conexión por sesión

## Decisión vigente · 05/10/2026

Arc acepta la opción de conexión temporal: pulsar **Conectar con Google** al abrir el HUB o al caducar el acceso. Si la cuenta ya está abierta en Google, normalmente basta con seleccionarla; Google puede exigir contraseña o una comprobación adicional. Esta decisión sustituye la condición anterior de mantener automáticamente la sesión entre aperturas. No se promete persistencia al cerrar o recargar la página.

Se autoriza avanzar con código público y datos privados accesibles únicamente por la cuenta del propietario. El repositorio contiene interfaz, lógica y pruebas sintéticas, sin registros personales, copias de Sheets, conversaciones, IDs privados del núcleo ni secretos. No se crean Firebase, Firestore, Cloud Run ni un servicio de renovación de sesiones. El borrador local de esa alternativa no está publicado ni forma parte del despliegue.

Estado verificado · 05/10/2026: [HUB Pages](https://hexabor.github.io/arc-personal-hub/) publicado y conectado con la cuenta del propietario. Apps Script asociado al proyecto estándar compartido, propiedades privadas instaladas y permiso Sheets reautorizado. setupHub y getHubData terminaron sin errores; la web privada anterior también vuelve a cargar datos. Implementación adicional API executable con acceso Solo yo creada; ambos identificadores de Actions guardados y contrastados.

La publicación 37328703828 superó pruebas de lógica/transporte, compilación y despliegue sobre b2c87f0973f1ccf6731aa5ffaa581413f65dbb69. Se corrigió el flujo para separar build/deploy y pasar un artefacto único por ejecución e intento: el primer despliegue no encontró el recién subido y el reintento generó duplicados. La consola Cloud ya es accesible; el origen JavaScript del cliente existente se verificó como https://hexabor.github.io. No se creó otro cliente ni se guardó un secreto en Pages.

En el navegador se verificaron: bloqueo sin conexión; lectura real del propietario; recarga que exige reconectar; conservación del borrador al reconectar; captura literal con recibo contrastado con Sheets y fechas nativas; desconexión que oculta registros y reconexión que recupera lectura. Las comprobaciones físicas, otra cuenta, caducidad y revocación reales siguen pendientes.

## Acceso y seguridad

- Pages sirve únicamente los archivos públicos. Los datos se solicitan al mismo Apps Script mediante un token OAuth temporal, conservado solo en memoria; no se guardan tokens en URLs, GitHub ni almacenamiento del navegador.
- Sin conexión, no se cargan registros personales ni se permite capturar. Otra cuenta debe ser rechazada por la implementación API y por la comprobación del propietario en el servidor, no solo por la interfaz.
- El acceso nuevo debe cubrir Sheets y correo de la cuenta. El permiso de Sheets abarca las hojas de esa cuenta: Google no lo limita a una hoja, aunque el servidor sí restringe el núcleo. Revisar y confirmar el permiso en el momento de concederlo.
- El token caducado exige reconectar mediante una acción del usuario. Se mantiene margen de seis minutos antes de ejecutar Apps Script. Desconectar oculta los datos y elimina el token local; no equivale a revocar los permisos de Google ni invalida instantáneamente un token copiado anteriormente. Se pueden revocar permisos desde la cuenta de Google.
- El borrador conserva texto e ID en el dispositivo. No reintentar una escritura incierta con otro ID. La captura sigue pasando por ScriptLock y el circuito canónico; no añadir otro escritor directo de Sheets.

## Activación y avance

Los pasos de configuración y publicación están completados: proyecto estándar dedicado común al script y cliente, APIs Apps Script/Sheets habilitadas, audiencia externa en pruebas solo para el propietario, cliente OAuth web con origen real, propiedades HUB_CORE_ID y HUB_OWNER_EMAIL privadas, API executable Solo yo y variables ARC_GOOGLE_CLIENT_ID / ARC_API_DEPLOYMENT_ID. Se conservó la implementación web anterior y su URL.

Para futuras actualizaciones, comprobar el contrato y código instalados, publicar una versión de la API privada y ejecutar el flujo manual Pages con los identificadores vigentes. El build bloquea una configuración ausente; --allow-unconfigured sirve solo para comprobaciones locales. Los secretos, datos y enlaces privados de operación permanecen fuera de los archivos públicos. No repetir la creación del proyecto/cliente ni cambiar el acceso del núcleo.

## Aceptación real

- Sin token: no hay lectura ni captura. Cuenta diferente: rechazo real en Google/servidor.
- Cuenta del propietario: getHubData carga las fuentes actuales; una aportación real queda guardada una vez, con el mismo ID, texto literal, fechas nativas y cobertura de la tabla Incoming.
- Caducidad/cierre/recarga: se pide conectar, no se muestran datos de la sesión anterior y el borrador se conserva. Volver a conectar restaura lectura sin duplicar una captura incierta.
- Respuesta tardía de otra sesión: se rechaza. Revocación del permiso en Google: las llamadas dejan de funcionar.
- Móvil y ordenador físicos: comprobación pendiente del propietario. Las pruebas locales y entre pestañas no la sustituyen.

## Recuperación y continuidad

La web privada existente se ha reautorizado y comprobado tras asociar el proyecto estándar: carga los datos actuales. Se conserva su implementación, versión anterior y URL como acceso alternativo. La asociación al proyecto estándar no permite volver al proyecto predeterminado administrado por Apps Script; conservar versiones no revierte esa asociación. No abrir el backend a Anyone ni exportar datos al repositorio.

El estado operativo y los enlaces privados permanecen en PRJ-2026-0001 y su tarea existente. No duplicar ese seguimiento en Issues.

## Referencias

- [Ejecución mediante Apps Script API](https://developers.google.com/apps-script/api/how-tos/execute)
- [Modelo de tokens de Google Identity Services](https://developers.google.com/identity/oauth2/web/guides/use-token-model)
- [Proyectos estándar de Google Cloud para Apps Script](https://developers.google.com/apps-script/guides/cloud-platform-projects)
- [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)


## Edición y ordenación de tareas · 0.2.0

El backend admite lectura/captura con esquemas 5 y 6. La edición requiere 6, rutas de activas/archivadas, fuente Cambios HUB y task_edit_status=activo. Las nuevas columnas son Orden manual, Última edición por, Revisado por, Fecha revisión, Huella revisada y Feedback revisión. Se añaden al final; en archivadas se conservan también las dos columnas de cierre. La migración inicial conserva el orden actual y no atribuye autores históricos. Catálogos determina estados y prioridades.

Las fichas admiten todos los campos operativos y protegen IDs, creación, fórmulas/chips y metadata. Un cambio de proyecto deriva su nombre desde el ID único. Las ediciones usan una huella completa para detectar conflictos y una solicitud con recibo atómico para reintentos. Guardar o reordenar marca Arc y actualiza la fecha; las revisiones previas permanecen como antecedente y pierden vigencia si cambia el contenido.

La revisión real se realiza en ChatGPT según la norma canónica. Registrar Sistema, fecha, feedback y la huella del contenido leído, con comprobación fresca antes y después. No hay botón que invente una revisión ni un agente automático en Pages. La receta exacta de huella está en taskFingerprint_ de Code.gs y Sistema.task_review_fingerprint.

Las escrituras ajenas a este script no comparten su bloqueo: se comprueba de nuevo antes de retirar una copia. Una discrepancia conserva las dos filas para revisión; no se borra una versión no contrastada. Una edición directa en Sheets no puede atribuirse automáticamente a una persona.

Validación local: tests/task-edits.cjs cubre edición, texto literal, fechas, proyecto, permisos, campos protegidos, fórmulas, conflictos, recibos, reintentos, orden global, cierre con fallo parcial, reapertura y revisión invalidada. Los fixtures son sintéticos. La evidencia de instalación y pruebas reales pertenece al proyecto privado; no se exportan registros personales.


## Ordenación de Incoming · 0.2.1

Incoming ofrece Mi orden, Más recientes primero y Más antiguas primero. Mi orden se guarda en Sheets y se comparte entre dispositivos; la preferencia del selector permanece en cada navegador. Las flechas reordenan solo las entradas abiertas, con una lista completa y versiones comprobadas. El texto original, estado y recibos de consolidación permanecen intactos. Las nuevas capturas sin orden se muestran al final.

Incoming conserva Orden manual, Última edición por y los campos de revisión ya usados por tareas. Cada reordenación registra Arc, fecha nativa y un recibo atómico en Cambios HUB; otra edición invalida la revisión por huella. Revisión y consolidación son operaciones diferentes. La migración no atribuye autores históricos y requiere incoming_order_status=activo. El esquema 6 sigue admitido; los consumidores deben resolver los encabezados vigentes A:P.

Pruebas sintéticas: fechas con hora, orden manual sin alterar la fuente, autorización, lista abierta exacta, conflictos, reintentos y preservación de entradas procesadas. La prueba viva cambia y recupera un orden existente, contrastando texto y estado mediante Sheets.
