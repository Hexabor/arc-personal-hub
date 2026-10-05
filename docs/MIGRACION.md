# GitHub Pages · activación pendiente

## Decisión y alcance

Arc autorizó crear el repositorio y avanzar hacia GitHub Pages el 05/10/2026. El código se conserva en `Hexabor/arc-personal-hub`, inicialmente privado. GitHub confirmó en la configuración de Pages que la cuenta exige cambiarlo a público o ampliar el plan. No se ha cambiado su visibilidad ni contratado un plan.

La publicación incluye interfaz y código, sin registros personales, copias de Sheets, historial de conversaciones ni secretos. Los datos siguen en el backend canónico. Pages no ejecuta Apps Script; la interfaz llama con OAuth al mismo servidor mediante Apps Script API. Se conserva ScriptLock, el ID de solicitud, texto literal, fechas nativas y lectura posterior del recibo. No se añade otro escritor directo de Sheets en el navegador.

## Antes de activar

1. Resolver la visibilidad o el plan de GitHub.
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
- Reintento de captura, refresco y cambio de dispositivo: confirmar el mismo ID y no duplicar.
- Móvil y ordenador físicos: aceptación pendiente de Arc.

Hasta superar estas pruebas, mantener el acceso actual como operativo. La preparación y las pruebas locales no acreditan publicación ni autorización real.

## Recuperación y mantenimiento

Conservar la versión Google anterior para volver a publicarla sobre la misma URL si la migración falla. Asociar un Cloud project puede requerir nueva autorización; no dar por segura una recuperación sin probarla. No abrir el backend como «Anyone» para resolver problemas de conexión, no insertar tokens en URLs y no exportar datos al repositorio.

El seguimiento y los enlaces privados viven en PRJ-2026-0001 y su tarea actual del sistema personal. No duplicar el estado operativo en Issues.

## Referencias

- [Ejecución mediante Apps Script API](https://developers.google.com/apps-script/api/how-tos/execute)
- [Modelo de tokens de Google Identity Services](https://developers.google.com/identity/oauth2/web/guides/use-token-model)
- [Creación y visibilidad de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
