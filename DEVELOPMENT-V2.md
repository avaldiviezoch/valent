# Nuestra aventura · desarrollo v2

El mapa completo de desarrollo está en **`index_v2.html`**. Es una copia de producción con progreso separado y dos juegos preparados:

| Isla | Ruta de desarrollo | Estado |
| --- | --- | --- |
| Izar las velas | `islas/rescate_v2.html` | Disponible desde el inicio y para repetir |
| La torre de Gizmo | `islas/encuentro_v2.html` | Disponible tras completar la primera |
| Nuestros recuerdos | `islas/recuerdos_v2.html` | En preparación |
| La luz de encontrarnos | `islas/aventuras_v2.html` | En preparación |
| Un cielo para dos | `islas/constelacion_v2.html` | En preparación |
| Nuestro tesoro | `islas/tesoro_v2.html` | En preparación |

`index.html`, `islas/encuentro.html` y sus recursos de producción no se modifican. Compartimos los recursos visuales, música, retratos originales y motores del juego; el mapa, las rutas y el guardado de desarrollo usan sus propios archivos.

## Progreso

`assets/journey-v2.js` define los seis capítulos y sus claves `valent-development-island-N-v1`. Las victorias se guardan automáticamente en el mismo navegador al completar el juego, antes de volver al mapa. Una isla completada muestra ✓, conserva su color y permite volver a jugar, también mediante un enlace directo. Repetirla no borra victorias ni bloquea niveles posteriores. El siguiente capítulo solo se puede abrir si está preparado y se han completado todos los anteriores.

Si la primera aventura ya está guardada en producción mediante `valent-rescate-familia-v1`, se importa ese recuerdo una sola vez al progreso de desarrollo. No se importan victorias de antiguas demostraciones. Los juegos de desarrollo nunca escriben progreso de producción. Al cerrar y abrir el navegador, el avance se conserva mientras su almacenamiento local siga disponible.

Las dos primeras islas están habilitadas para esta revisión de desarrollo. Las otras cuatro siguen con `ready: false`; aunque se termine Gizmo no se activan juegos antiguos sin preparar. Para futuros capítulos se mantiene también la fecha del mesario en America/Lima.

## Copia de producción

`python scripts/build-development-v2.py` regenera el mapa, el runtime compartido, el rescate y las cuatro rutas futuras a partir de producción. El generador escribe solo rutas de desarrollo; mantiene los cambios de progresión y el guardado automático. `encuentro_v2.html` y el juego de la torre se desarrollan de forma independiente.

## La torre de Gizmo

Adapta la mecánica de `pure_css_stack_juego.html`: bloques isométricos en dos ejes, recorte de bordes sin apoyo y veinte pisos. Los bloques van al doble de su velocidad inicial. HTML/CSS y Canvas permiten integrar pausa, controles táctiles/teclado y diálogos sin bibliotecas adicionales. La ambientación usa mar, piedra, madera e hierro. Gizmo aparece al comenzar, da las gracias a mamá al llegar al piso 20 y después conversan Antonio y Lucero.

## Verificación

Con el servidor local existente y Playwright:

```sh
node tests/journey-v2-state.cjs
node tests/journey-v2.cjs
node tests/stack-v2-engine.cjs
node tests/stack-v2-layout.cjs
node tests/stack-v2.cjs
```

El primer juego también se verifica con `VALENT_DEVELOPMENT=1 node tests/experience.cjs` (en PowerShell: `$env:VALENT_DEVELOPMENT='1'` antes de ejecutar Node). Las pruebas cubren migración, progreso en orden, derrota sin guardado, victoria con guardado automático, recarga, islas completadas disponibles para repetir, rutas futuras bloqueadas y ausencia de escrituras de producción, en Chromium y WebKit.

## Promoción

Solo se actualizan las rutas y el mapa de producción cuando el usuario apruebe el conjunto de desarrollo. El primer rescate debe conservarse y la torre ocupar la segunda isla.
