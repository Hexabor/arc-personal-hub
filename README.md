# ARC · HUB personal

Interfaz adaptable a móvil y ordenador para capturar en Incoming y consultar el sistema personal existente en Google Sheets.

## Estado · 5 de octubre de 2026

Repositorio público. [HUB en GitHub Pages](https://hexabor.github.io/arc-personal-hub/) publicado mediante Actions y conectado con la cuenta del propietario. Reautorización, lectura y captura real verificadas desde el navegador. La web privada anterior también carga tras asociar el proyecto estándar y conserva su URL.

Arc ha elegido conexión **por sesión**: pulsar Conectar con Google al abrir o al caducar el acceso, usando la sesión de Google que ya esté abierta. Esta decisión sustituye el requisito previo de persistencia entre aperturas y permite avanzar con código público y datos privados solo para el propietario. No se crean Firebase ni servidores adicionales.

**Completado:** proyecto estándar compartido, OAuth web, propiedades privadas del script, implementación API con acceso Solo yo y variables de Actions. Pruebas de lógica y transporte, compilación y publicación superadas. Recargar exige reconectar y conserva el borrador; la captura devuelve un recibo contrastado con Sheets. **Pendiente:** comprobación física en móvil y ordenador, rechazo real de otra cuenta, caducidad y revocación reales. El repositorio contiene código y pruebas sintéticas, sin una exportación de registros personales.

La ruta de activación está en [docs/MIGRACION.md](docs/MIGRACION.md). Los IDs y enlaces privados de operación se conservan en el proyecto del sistema personal, no en este repositorio.

## Estructura

- `ui/index.html`, `dist/app.js`, `dist/styles.css`: interfaz compartida.
- `google/`: Apps Script, manifiesto y HTML generado. La configuración del núcleo se guarda en propiedades del script.
- `pages/google-backend.js`: conexión OAuth con Apps Script API; mantiene el guardado, bloqueo y verificación en servidor.
- `tests/`: datos sintéticos y pruebas de captura, reintentos, autorización y transporte.
- `build.py`: genera Google HTML y, cuando se solicita, únicamente los archivos públicos de Pages en `site/`.

## Comprobaciones

```sh
python3 build.py
node --check dist/app.js
node --check pages/google-backend.js
node tests/logic.cjs
node tests/pages.cjs
node tests/task-edits.cjs
python3 build.py --pages --allow-unconfigured
```

El último comando sirve para comprobar una compilación sin credenciales configuradas. Publicar requiere los valores reales y verificación viva; las pruebas locales no acreditan una conexión real.

En el transporte temporal actual, el token de Google permanece en memoria y la lectura no se guarda en disco. Cerrar/recargar la página pierde el token; no hay sesión persistente implementada. El borrador de captura se conserva solo en el dispositivo, como en el HUB anterior. Desconectar oculta los datos de la sesión; no revoca permisos de Google ni borra un borrador. El servidor sigue validando al propietario en cada operación. Esta es la modalidad por sesión aceptada; consultar la guía para distinguir las comprobaciones ejecutadas de la aceptación todavía pendiente.

La versión 0.2.0 incorpora orden manual compartido, selección de orden de vista y fichas editables de tareas activas/archivadas. Conserva IDs, fechas nativas, autor de edición, revisión vinculada al contenido y feedback. Cada cambio tiene un recibo privado en Cambios HUB; rechaza versiones obsoletas y admite reintentos sin duplicar. Cerrar/reabrir copia y verifica antes de retirar la fila original. Requiere el esquema 6 y el contrato task_edit_status activo. No instala revisiones automáticas de IA, consolidación ni notificaciones.

