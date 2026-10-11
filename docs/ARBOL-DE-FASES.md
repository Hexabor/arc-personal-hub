# Árbol de fases del HUB personal

Fuente única de presentación: [mapa-fases.html](mapa-fases.html). Acceso principal en la misma app: [Árbol de fases](https://hexabor.github.io/arc-personal-hub/mapa-fases.html), desde la barra lateral y el pie del HUB, también antes de conectar Google.

Mantiene el formato aprobado con Día, Esmeralda y Noche, ficha, subapartados, dependencias y recursos. Es una vista técnica fechada del código y la documentación pública del HUB, sin datos personales ni localizadores del núcleo. No llama al backend. Las marcas de terminado/recurso del navegador solo afectan a esa vista local.

Fuentes al 12/10/2026: README, docs/MIGRACION.md, dist/app.js, google/Code.gs y pruebas sintéticas. La conexión por sesión está aceptada desde 05/10/2026; edición e Incoming tienen construcción presente y su aceptación de uso se conserva pendiente. Los ensayos reales de otra cuenta, caducidad/revocación y móvil/ordenador siguen pendientes según la guía. Publicar el mapa no acepta estas fases. Las dependencias de aceptación se señalan como propuestas por confirmar.

Mantenedor: equipo que trabaja en el HUB personal, con Arc como titular. Tras cada avance reseñable, actualizar solo RAMAS/RECURSOS/FASES/SUB y la fecha/hito, contrastando documentación técnica viva y aceptación expresa. No convertir una prueba sintética ni presencia de código en aceptación real. Si no hay cambios: «Árbol comprobado: sin cambios».

Publicación: build.py copia exactamente docs/mapa-fases.html a site/mapa-fases.html. Actualizar el mismo repositorio y workflow Publish HUB to Pages, conservando el enlace y sus variables actuales. No publicar otra copia independiente. La copia Git y el paquete local son recuperación; Drive es respaldo si se usa, no otro alojamiento.

Pruebas previas: compilación Pages, sintaxis JavaScript y suites logic/pages/task-edits/task-ui con datos ficticios; validación de nueve fases, posiciones únicas, dependencias hacia niveles mayores y recursos existentes; plantilla invariable fuera de datos/marcadores. QA visual Día/Noche aproximadamente1536×860, cero superposiciones y recursos externos visibles; ficha Base publicada y sus subapartados operativos. La salida incorpora UTF-8 BOM para seleccionar codificación sin cambiar la plantilla.

Comprobación publicada: tras cada despliegue, abrir HUB desconectado, comprobar enlace visible y clicar mapa-fases.html; revisar fecha/hito, temas, ficha y consola. Esta comprobación aislada no requiere cargar registros ni editar datos. Documentar run/commit y cualquier fallo real en el recibo del encargo.

Recuperación: base anterior al árbol603ca5cac40420b10780a46d62afee1de682010a. Revertir únicamente el commit del árbol y volver a ejecutar el workflow vigente; releer head antes, conservar avances posteriores. La API privada, permisos, cálculos y datos operativos no son parte de este cambio.
