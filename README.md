# ARC · HUB personal

Interfaz adaptable a móvil y ordenador para capturar en Incoming y consultar el sistema personal existente en Google Sheets.

## Estado · 5 de octubre de 2026

Repositorio privado creado. Conserva la interfaz y la lógica de captura del HUB reparado (esquema 5), y prepara el transporte autenticado para GitHub Pages. **La migración todavía no está activada ni verificada en Google.** La instalación actual sigue siendo el acceso operativo.

GitHub muestra «Upgrade or make this repository public to enable Pages» para esta cuenta. Arc acepta publicar el código con una condición: acceso exclusivo con su cuenta de Google y sesión persistente por navegador, sin identificarse en cada apertura normal. **La sesión temporal preparada aún no cumple esa condición; el repositorio sigue privado.** Primero hay que implementar y verificar la persistencia y renovación segura. El repositorio contiene código y pruebas sintéticas; no contiene una exportación de los registros personales.

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
python3 build.py --pages --allow-unconfigured
```

El último comando sirve para comprobar una compilación sin credenciales configuradas. Publicar requiere los valores reales y verificación viva; las pruebas locales no acreditan una conexión real.

En el transporte temporal actual, el token de Google permanece en memoria y la lectura no se guarda en disco. Cerrar/recargar la página pierde el token; no hay sesión persistente implementada. El borrador de captura se conserva solo en el dispositivo, como en el HUB anterior. Desconectar oculta los datos de la sesión; no revoca permisos de Google ni borra un borrador. El servidor sigue validando al propietario en cada operación. Ver el requisito nuevo y las pruebas de aceptación en la guía antes de activar/publicar.

No se implementan cierres de tareas, consolidación automática, notificaciones ni nuevas tablas.
