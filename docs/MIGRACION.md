# GitHub Pages · activación pendiente

## Decisión y alcance

Arc autorizó crear el repositorio y avanzar hacia GitHub Pages el 05/10/2026. El código se conserva en `Hexabor/arc-personal-hub`, inicialmente privado. GitHub confirmó en la configuración de Pages que la cuenta exige cambiarlo a público o ampliar el plan. No se ha cambiado su visibilidad ni contratado un plan.

La publicación incluye interfaz y código, sin registros personales, copias de Sheets, historial de conversaciones ni secretos. Los datos siguen en el backend canónico. Pages no ejecuta Apps Script. El transporte preparado llama con OAuth al mismo servidor mediante Apps Script API y conserva ScriptLock, el ID de solicitud, texto literal, fechas nativas y lectura posterior del recibo. No se añade otro escritor directo de Sheets en el navegador.

## Condición de publicación y sesión · 05/10/2026

Arc acepta hacer público el código **siempre que los datos exijan identificación con su cuenta de Google y la sesión permanezca abierta en cada navegador**. El inicio de sesión debe ser necesario al añadir un navegador/dispositivo, no en cada apertura normal. Esta autorización es condicional: mantener el repositorio privado hasta implementar y verificar el requisito. No se interpreta como autorización de nuevos permisos OAuth, contratación ni cambios de acceso a Sheets.

Estado comprobado: `pages/google-backend.js` conserva un token temporal solo en memoria; cerrar/recargar la página lo pierde y su caducidad exige una nueva interacción. **Ese transporte no satisface la sesión persistente solicitada.** Las pruebas anteriores acreditan su comportamiento temporal, no este requisito nuevo. No resolverlo guardando un token de Google caducado o un indicador «dispositivo autorizado» sin validación en servidor.

Objetivo de implementación:

- Google autentica la cuenta; el servidor acepta únicamente al propietario configurado y comprueba su identidad en todas las lecturas y escrituras. Otra cuenta de Google y una llamada directa a la API deben quedar rechazadas.
- Sesión persistente del HUB, renovable y revocable, separada de la autorización para acceder a Sheets. Mantenerla al cerrar y volver a abrir el mismo navegador y al caducar el token corto. Una contraseña nunca se introduce en el HUB ni se guarda en GitHub.
- Añadir un servicio de sesión y renovación seguro fuera de Pages; Pages sirve archivos estáticos. Elegir proveedor y configuración antes de instalar. El flujo de código de Google permite renovar el acceso desde un servidor; una sesión persistente de Firebase es otra pieza posible, pero por sí sola no renueva el permiso OAuth para Apps Script/Sheets. Ninguna opción está instalada ni aceptada como arquitectura definitiva.
- Conservar el mismo backend canónico y su único circuito de captura. Los secretos y credenciales de renovación se guardan solo en un servicio privado adecuado, nunca en Pages, el repositorio, URLs o registros.
- Permitir cerrar sesión y revocar acceso; una sesión revocada deja de leer y escribir. Al salir se ocultan los datos. Sin autenticación, tampoco se carga una copia de datos privados.
- Pedir de nuevo identificación si se cierra/revoca la sesión, se borran los datos del navegador, se usa otro navegador/incógnito o Google exige reautenticación. «Dispositivo» significa en este caso perfil de navegador, no una huella del hardware. La sesión del HUB no es la sesión de Gmail; cerrar Gmail no garantiza por sí solo cerrar el HUB.

## Plan anterior de activación · requiere adaptar la sesión

Los pasos siguientes documentan la preparación del transporte temporal. **No constituyen una receta aprobada para publicar la versión solicitada**: primero resolver el servicio de sesión persistente, sus permisos y su verificación. Mantener privado el repositorio hasta satisfacer la condición anterior.

1. Implementar y verificar la sesión persistente y la autorización del propietario; después aplicar la autorización condicional para publicar el código.
2. Revisar/autorizar la configuración de un cliente OAuth para este HUB. Requiere los mismos ámbitos que el manifiesto: lectura/escritura de hojas de cálculo y correo de la cuenta. El ámbito de Sheets abarca las hojas de la cuenta; el código del servidor restringe el núcleo y la identidad. No presentar este permiso como limitado por Google a una única hoja.
3. Resolver un proyecto **estándar** de Google Cloud y asociarlo al proyecto Apps Script existente; no crear otra hoja ni una instalación alternativa. Este cambio exige revisar la autorización de la web actual y su recuperación antes de ejecutarlo.
4. Habilitar Apps Script API y Sheets API. Crear un cliente OAuth web con el origen HTTPS real de Pages, con audiencia restringida a Arc mediante el servidor y, durante pruebas, la configuración de usuarios de prueba de OAuth.
5. Guardar en las propiedades del script `HUB_CORE_ID`, con el ID del núcleo canónico, y conservar `HUB_OWNER_EMAIL`. No ejecutar `setupHub` desde otra cuenta ni cambiar permisos de Sheets.
6. Instalar los archivos de `google/` en el **mismo** proyecto, probar la web actual y publicar una implementación adicional de tipo **API executable**, acceso **Only myself**. No sustituir la URL `/exec` por ese ID. Esta configuración no está aplicada todavía.
7. Configurar las variables del repositorio `ARC_GOOGLE_CLIENT_ID` y `ARC_API_DEPLOYMENT_ID`, usando el ID de la implementación API, no la de la web. Son identificadores públicos, no contraseñas. No guardar un client secret ni token en el código, variables públicas o registros.
8. Activar Pages con GitHub Actions y ejecutar el flujo manual de publicación; este se bloquea si falta configuración.

## Aceptación

- Sin sesión: no se muestran datos personales ni se ejecuta una captura.
- Cuenta de Arc: lectura correcta; una aportación real guardada una sola vez y contrastada por ID, texto literal y fechas en Sheets. Verificar que la tabla incluye la fila.
- Cancelación/expiración: el borrador sigue disponible, los datos de la sesión desaparecen y la interfaz pide reconectar. No repetir a ciegas una captura cuya respuesta se perdió.
- Cuenta diferente: rechazo real del servidor, no solamente un filtro visual.
- Reabrir el navegador ya identificado y dejar caducar el token corto: los datos vuelven a cargar sin pulsar «Conectar» ni repetir el acceso ordinario. Probar también la renovación del permiso de acceso a Sheets; persistir solo la identidad no basta.
- Navegador nuevo/incógnito: los datos quedan bloqueados hasta identificarse. Cerrar/revocar la sesión: la API rechaza nuevas lecturas y capturas, incluso desde una pestaña anterior.
- Reintento de captura, refresco y cambio de dispositivo: confirmar el mismo ID y no duplicar.
- Móvil y ordenador físicos: aceptación pendiente de Arc.

Hasta superar estas pruebas, mantener el acceso actual como operativo. La preparación y las pruebas locales no acreditan publicación ni autorización real.

## Recuperación y mantenimiento

Conservar la versión Google anterior para volver a publicarla sobre la misma URL si la migración falla. Asociar un Cloud project puede requerir nueva autorización; no dar por segura una recuperación sin probarla. No abrir el backend como «Anyone» para resolver problemas de conexión, no insertar tokens en URLs y no exportar datos al repositorio.

El seguimiento y los enlaces privados viven en PRJ-2026-0001 y su tarea actual del sistema personal. No duplicar el estado operativo en Issues.

## Referencias

- [Ejecución mediante Apps Script API](https://developers.google.com/apps-script/api/how-tos/execute)
- [Modelo de tokens de Google Identity Services](https://developers.google.com/identity/oauth2/web/guides/use-token-model)
- [Modelo de código con renovación en servidor](https://developers.google.com/identity/oauth2/web/guides/use-code-model)
- [Persistencia de la sesión de Firebase](https://firebase.google.com/docs/auth/web/auth-state-persistence)
- [Creación y visibilidad de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
