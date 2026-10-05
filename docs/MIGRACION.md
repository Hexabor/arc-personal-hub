# GitHub Pages · conexión por sesión

## Decisión vigente · 05/10/2026

Arc acepta la opción de conexión temporal: pulsar **Conectar con Google** al abrir el HUB o al caducar el acceso. Si la cuenta ya está abierta en Google, normalmente basta con seleccionarla; Google puede exigir contraseña o una comprobación adicional. Esta decisión sustituye la condición anterior de mantener automáticamente la sesión entre aperturas. No se promete persistencia al cerrar o recargar la página.

Se autoriza avanzar con código público y datos privados accesibles únicamente por la cuenta del propietario. El repositorio contiene interfaz, lógica y pruebas sintéticas, sin registros personales, copias de Sheets, conversaciones, IDs privados del núcleo ni secretos. No se crean Firebase, Firestore, Cloud Run ni un servicio de renovación de sesiones. El borrador local de esa alternativa no está publicado ni forma parte del despliegue.

Estado: repositorio público y fuente de Pages guardada como GitHub Actions; sin despliegue publicado. Transporte temporal preparado y pruebas locales superadas. El propietario completó manualmente la configuración de Google Cloud desde su navegador: proyecto estándar dedicado creado, Apps Script API y Sheets API habilitadas, Google Auth Platform en pruebas con solo el propietario como usuario de prueba, y permisos userinfo.email y spreadsheets guardados. Las capturas aportadas verifican esos pasos. El ID de cliente OAuth facilitado por el propietario está guardado y verificado en la variable ARC_GOOGLE_CLIENT_ID de GitHub Actions.

La consola de Google Cloud sigue sin estar accesible desde el navegador remoto. El Apps Script ya está asociado al proyecto estándar del cliente OAuth: se ha recargado su configuración y verificado el número de proyecto. La instalación del código con sus propiedades privadas, la reautorización, la implementación API, la conexión real y la publicación de Pages siguen pendientes. No interpretar la configuración del cliente OAuth como conexión operativa.

## Acceso y seguridad

- Pages sirve únicamente los archivos públicos. Los datos se solicitan al mismo Apps Script mediante un token OAuth temporal, conservado solo en memoria; no se guardan tokens en URLs, GitHub ni almacenamiento del navegador.
- Sin conexión, no se cargan registros personales ni se permite capturar. Otra cuenta debe ser rechazada por la implementación API y por la comprobación del propietario en el servidor, no solo por la interfaz.
- El acceso nuevo debe cubrir Sheets y correo de la cuenta. El permiso de Sheets abarca las hojas de esa cuenta: Google no lo limita a una hoja, aunque el servidor sí restringe el núcleo. Revisar y confirmar el permiso en el momento de concederlo.
- El token caducado exige reconectar mediante una acción del usuario. Se mantiene margen de seis minutos antes de ejecutar Apps Script. Desconectar oculta los datos y elimina el token local; no equivale a revocar los permisos de Google ni invalida instantáneamente un token copiado anteriormente. Se pueden revocar permisos desde la cuenta de Google.
- El borrador conserva texto e ID en el dispositivo. No reintentar una escritura incierta con otro ID. La captura sigue pasando por ScriptLock y el circuito canónico; no añadir otro escritor directo de Sheets.

## Activación y avance

1. **Completado por el propietario:** crear un proyecto **estándar** de Google Cloud dedicado al HUB, sin Firebase, servidores ni vinculación de facturación para esta ruta. Si Google solicita condiciones o facturación, detenerse y revisar antes de aceptar. Conservar versiones y recuperación de la web privada actual.
2. **Completado y verificado por capturas:** configurar Google Auth Platform: app personal, audiencia externa en pruebas y solo el propietario como usuario de prueba. No añadir otros usuarios.
3. **Completado:** habilitar Apps Script API y Sheets API. Crear un cliente OAuth de aplicación web con el origen HTTPS real que GitHub asigne a Pages. No confundir el origen con la URL completa del repositorio. No subir un client secret.
4. **Asociación completada y verificada en Apps Script:** el script usa el mismo proyecto estándar del cliente OAuth. Google avisa de que se revocan las autorizaciones anteriores y no se puede volver al proyecto predeterminado administrado por Apps Script. **Pendiente:** volver a autorizar y comprobar la web tras el cambio; conservar código, versiones y URL no permite restaurar ese proyecto predeterminado.
5. Configurar HUB_CORE_ID en las propiedades privadas del script, conservar HUB_OWNER_EMAIL e instalar los archivos de google/ en el mismo proyecto. Comprobar primero la web actual. No crear otra hoja ni cambiar sus permisos.
6. Publicar una implementación adicional **API executable**, acceso **Only myself**. Conservar la URL /exec de la web existente. El valor para scripts.run es el ID de esa implementación API.
7. **Parcial:** ARC_GOOGLE_CLIENT_ID ya está guardada y verificada; sigue pendiente ARC_API_DEPLOYMENT_ID. Son identificadores públicos. No se requiere ni se guarda un secreto OAuth en Pages.
8. Pages ya está configurado con GitHub Actions. Verificar primero el servidor y la web privada; ejecutar después el flujo manual con los dos identificadores reales para publicar un candidato, y comprobar la conexión desde el origen real de Pages antes de declararlo operativo. El build bloquea la publicación sin esos valores; --allow-unconfigured es solo una comprobación local.
9. Ejecutar las pruebas reales siguientes antes de considerar Pages como acceso operativo. La publicación de archivos por sí sola no acredita la conexión.

## Aceptación real

- Sin token: no hay lectura ni captura. Cuenta diferente: rechazo real en Google/servidor.
- Cuenta del propietario: getHubData carga las fuentes actuales; una aportación real queda guardada una vez, con el mismo ID, texto literal, fechas nativas y cobertura de la tabla Incoming.
- Caducidad/cierre/recarga: se pide conectar, no se muestran datos de la sesión anterior y el borrador se conserva. Volver a conectar restaura lectura sin duplicar una captura incierta.
- Respuesta tardía de otra sesión: se rechaza. Revocación del permiso en Google: las llamadas dejan de funcionar.
- Móvil y ordenador físicos: comprobación pendiente del propietario. Las pruebas locales y entre pestañas no la sustituyen.

## Recuperación y continuidad

La web privada existente fue el acceso operativo antes de asociar el proyecto estándar. Su reautorización y comprobación tras ese cambio siguen pendientes; no darla por verificada ahora solo por conservar su URL. Conservar su versión anterior y su URL; asociar un Cloud project puede exigir reautorización, por lo que no prometer una recuperación sin probarla. No abrir el backend a Anyone ni exportar datos al repositorio.

El estado operativo y los enlaces privados permanecen en PRJ-2026-0001 y su tarea existente. No duplicar ese seguimiento en Issues.

## Referencias

- [Ejecución mediante Apps Script API](https://developers.google.com/apps-script/api/how-tos/execute)
- [Modelo de tokens de Google Identity Services](https://developers.google.com/identity/oauth2/web/guides/use-token-model)
- [Proyectos estándar de Google Cloud para Apps Script](https://developers.google.com/apps-script/guides/cloud-platform-projects)
- [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
