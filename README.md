# Nuestra aventura

Una experiencia romántica estática, compatible con GitHub Pages. Abre `index.html` desde un servidor web; no requiere compilación ni dependencias JavaScript.

## El recorrido

1. **El encuentro:** enciende la linterna para revelar una carta.
2. **La ruta:** conecta letras vecinas, incluidas las diagonales. El tablero gira en cada visita; se pueden compartir letras entre palabras.
3. **Los recuerdos:** abre las cuatro fotos. El álbum permite teclado y deslizamiento táctil.
4. **La travesía:** conduce el velero y recoge cinco luces. Puedes usar arrastre, flechas o botones. Las rocas desvían el rumbo sin quitar vidas ni reiniciar el recorrido.
5. **La constelación:** observa y repite tres secuencias de estrellas. Puedes volver a ver cada secuencia.
6. **El tesoro:** se abre al guardar los cinco capítulos.

El avance se guarda en el navegador. Los efectos de sonido se activan por defecto tras la primera interacción; no hay botón de música. La pista musical de fondo se incorporará cuando se seleccione el recurso. Se conservan las claves de progreso de la versión anterior. El tesoro es una sorpresa personal, no un sistema de seguridad.

## Diseño y accesibilidad

Mar y seis paisajes originales en WebP: isla tropical, bahía en media luna, islas gemelas, volcán, acantilados con cascada y atolón de coral. Cada destino utiliza su propio recurso transparente con una silueta y un terreno distintos. Luz ambiental, estela del barco y partículas al descubrir recuerdos. Mapa visible desde el primer momento, con título centrado y sin botones de zoom ni música. El encuadre automático reserva espacio para el encabezado y el pie, y muestra siempre las seis islas y sus nombres: dos columnas en espacios verticales, tres en horizontales. Se mantienen el arrastre y el pellizco; el doble toque sobre el mar vuelve a encuadrar. El fondo combina dos capas de agua que se desplazan suavemente para simular corrientes y oleaje. Controles con nombres accesibles, navegación por teclado, foco de diálogos y compatibilidad con `prefers-reduced-motion`. En el juego del barco el movimiento es parte de la mecánica; con movimiento reducido se desactivan la estela y las ondas decorativas.

Las cuatro fotografías mantienen sus enlaces originales al repositorio Wedding. Las tipografías usan Google Fonts con alternativas locales. El resto de la experiencia está incluido en este repositorio. `semivalentin.html` y los audios anteriores se conservan.

## Verificación

Probado con Chromium mediante Playwright: recorrido completo hasta el tesoro, persistencia, 12 tableros de letras aleatorios, álbum con las cuatro imágenes cargadas, las tres rondas de memoria y recogida de cinco luces en el velero. Las siete páginas se revisaron a 320, 390, 768 y 1440 píxeles de ancho, sin desbordes horizontales ni errores JavaScript. También se verificaron selección por arrastre, rechazo de saltos entre letras, controles táctiles, pellizco, teclado y movimiento reducido. Las comprobaciones de navegador no sustituyen pruebas en un iPhone físico.

## Recursos originales

Los fondos se generaron con la herramienta integrada ImageGen y se optimizaron a WebP. Los prompts están en [assets/ART-DIRECTION.md](assets/ART-DIRECTION.md).


### Repetir las pruebas

Estas dependencias son solo de desarrollo; el sitio publicado sigue siendo estático.

```sh
npm install
npx playwright install chromium
python -m http.server 8765 --bind 127.0.0.1
```

Con el servidor abierto, ejecuta `npm test` en otra terminal. Las pruebas usan un navegador limpio y no modifican la información del navegador personal.

La revisión de paisajes tiene una prueba específica: `npm run test:islands`. Comprueba los seis recursos distintos, su carga, el mapa a cuatro anchos de pantalla y la navegación a los seis destinos.

La prueba `npm run test:responsive` verifica los seis destinos y sus nombres completos en nueve tamaños y orientaciones (desde 320 × 568 hasta 1440 × 900), ausencia de solapamientos, controles retirados, movimiento del fondo, movimiento reducido y desbloqueo de sonido con la primera interacción.
