# La torre de Gizmo · desarrollo

La siguiente isla se prepara en `islas/encuentro_v2.html`. Su nombre de trabajo es **La torre de Gizmo**. Esta ruta se puede publicar como vista previa independiente, pero no sustituye `islas/encuentro.html`, no modifica el mapa y no activa ni completa capítulos de producción.

## Juego

Se adapta la mecánica del archivo entregado `pure_css_stack_juego.html`: bloques isométricos que se desplazan alternando dos ejes, alineación al tocar y recorte de lo que queda sin apoyo. La versión de desarrollo utiliza HTML/CSS y Canvas con JavaScript para poder integrar el objetivo de **20 pisos**, pausa, controles accesibles y los diálogos. No añade dependencias ni servicios externos.

La ambientación usa la textura de mar existente, piedra envejecida, madera e hierro. Los PNG originales de Antonio, Lucero y `familia/gizmo.png` se conservan sin cambios. Gizmo aparece al iniciar la partida y da las gracias a mamá al alcanzar la cima; después conversan Antonio y Lucero y aparece la carta final.

La música reutiliza el MP3 local de juego y su volumen de producción. La página no tiene `data-island`, por lo que puede probarse antes de la fecha del segundo mesario sin alterar los bloqueos existentes. No escribe progreso en `localStorage` ni permite guardar la segunda isla como completada.

## Verificación

Con el servidor local existente:

```sh
node tests/stack-v2-engine.cjs
node tests/stack-v2-layout.cjs
node tests/stack-v2.cjs
```

Se verifican intersecciones en ambos ejes, bordes que caen, alineaciones perfectas, derrota, exactamente 20 pisos, pausa, reintento, teclado, toque, diálogos iniciales/finales, movimiento reducido y ausencia de progreso de producción. La partida completa se prueba en Chromium de escritorio, Chromium móvil y WebKit móvil.

## Paso a producción

Primero se revisa esta vista previa con el usuario. Solo después de su aprobación se prepara la ruta definitiva de la segunda isla y se actualizan su nombre y configuración en el mapa. El primer rescate de la familia debe conservarse. La configuración del mesario y el guardado definitivo se incorporan en esa promoción, no en esta vista de desarrollo.
