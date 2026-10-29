# App de vacaciones del HUB personal

La navegación Vacaciones, el acceso de Inicio y el enlace de Módulos abren la app dentro del mismo HUB. Usa el mismo inicio de sesión y un archivo de Sheets propio resuelto por Módulos, sin incluir su identificador o registros en el repositorio público.

## Contrato

Fuente separada con Viaje, Planes, Cambios y Sistema. Esquema arc_vacations v1, timezone Europe/Madrid. IDs PLAN permanentes. Fechas y horas nativas; ausencia de fecha u hora se conserva vacía. Estados: Idea, Por concretar, En espera, Confirmado, Realizado, Cancelado. Confirmado necesita fecha, la hora es opcional. No sincroniza Calendar ni crea tareas de preparación automáticamente.

El archivo google/Vacaciones.gs se instala junto al Código.gs existente. Reutiliza assertOwner_, checkCore_, cellJSON_ y el servicio avanzado Sheets. No añade permisos. getVacationData lee el módulo; saveVacationPlan valida campos, vigencia de versión e ID de solicitud bajo ScriptLock. Plan e historial se escriben en un batch atómico; reintentar el mismo request recupera su recibo sin duplicar. Las ediciones manuales de Sheets invalidan la versión de la ficha. Los escritores externos no comparten el bloqueo de Apps Script: evitar editar simultáneamente y refrescar antes de guardar.

La app conserva datos y edición en memoria, sin tokens ni registros persistidos en el navegador. Al desconectar borra el módulo y cierra su ficha. Una respuesta de sesión anterior se descarta. El formulario conserva el mismo payload de un guardado incierto; reintentar no crea otro plan.

## Construir y publicar

Ejecutar las pruebas existentes y tests/vacaciones.cjs, y build.py. El HTML generado incluye la interfaz del módulo para la web privada alternativa. Instalar Vacaciones.gs e Index.html y publicar una versión de las implementaciones existentes conservando Solo yo. Publicar Pages con el workflow actual y variables existentes; no reconstruir OAuth ni copiar datos del viaje a fixtures.

## Mantenimiento

Publicación del 29/10/2026: código y Pages publicados sobre el repositorio y flujo existentes. API y web privadas actualizadas a versión 8, conservando identificadores y Solo yo. El titular autorizó expresamente los permisos de identidad y Hojas de cálculo; no repetir esa solicitud para el mismo alcance.

Validación real completada en Google y en Pages: lectura de los seis planes tras conectar, edición de una nota temporal y restauración del texto original, con dos recibos contrastados en Cambios. Guardar un transporte con los mismos valores conservó fecha, horas, coste y referencias. Se contrastaron los valores nativos en Sheets. Las pruebas sintéticas cubren además validación, conflictos y reintentos; no se confunden con las comprobaciones reales. La aceptación física en el móvil del titular sigue pendiente.

Actualizar este contrato, la documentación privada del proyecto y docs/mapa-vacaciones.html al avanzar. El árbol conserva el formato existente y solo cambia sus datos; las marcas locales no modifican el backend. Diferenciar pruebas sintéticas, prueba real en Google y aceptación física. Enlace estable: https://hexabor.github.io/arc-personal-hub/mapa-vacaciones.html.
