# Nuestra aventura

Una aventura romántica estática para GitHub Pages, sin compilación ni dependencias JavaScript en producción.

## La etapa actual

Solo está disponible **Izar las velas**, en la primera isla (`islas/encuentro.html`). Ahora es **Lucero al rescate**: Antonio deja a 18 familiares a la deriva y Lucero debe recoger a todos con su barco. La introducción y el desenlace conservan sus textos y usan un cuadro de diálogo con un sprite lateral, mostrando un personaje por turno: Antonio entra por la izquierda y Lucero por la derecha; sus textos aparecen progresivamente y se pueden completar con un toque. Con movimiento reducido, el texto se muestra inmediatamente. El lector de pantalla recibe cada frase completa una sola vez. Se conserva el velero original visto desde arriba, el mar fotográfico y las rocas que desvían el barco al chocar. Las luces se sustituyen por cabezas transparentes más grandes, sin nombres ni adornos, y las cabezas y rocas caen exactamente al doble de velocidad. Al llegar a 4, 8 y 12 rescates aparece Antonio sorprendido con comentarios de ánimo, en un espacio reservado que no tapa el mar ni desplaza los controles. Las rocas incorporan relieve, grano mineral, grietas, sombra y espuma. Un solo familiar perdido termina la partida; cada intento baraja la familia y sortea posiciones, velocidad y pausas con `crypto.getRandomValues`. Al ganar aparecen ambos protagonistas, una felicitación y la carta de su bebito. Solo entonces se permite guardar el recuerdo, con una clave nueva que no hereda victorias del juego de luces.

Los PNG originales de `familia/` no se modifican. Las animaciones reutilizan clases de respiración, inclinación, reacción al puntero y al clic, y gestos ocasionales. No hay variantes de expresión, por lo que no se deforman caras ni se simulan parpadeos. `prefers-reduced-motion` desactiva todos los movimientos decorativos. El juego se pausa al ocultar la pestaña; los controles admiten ratón, dedo, botones y teclado. Los retratos deben cargar antes de comenzar; si falla la conexión, hay un botón para reintentarlo. La física está separada en `assets/rescue-engine.js` y las imágenes se dibujan conservando su proporción. La antigua linterna se trasladó a `islas/aventuras.html`, en la cuarta isla, y queda bloqueada para personalizarla después.

Las otras cinco islas se ven en blanco y negro y no permiten jugar, tampoco entrando por sus enlaces directos. Cada estado bloqueado utiliza un WebP realmente monocromo, conservando la transparencia, en vez de depender de combinar filtros SVG y CSS en el navegador. Al habilitar una isla se recupera automáticamente el recurso original a color. Las variantes se regeneran con `python scripts/build-locked-islands.py` (Pillow es solo una herramienta de desarrollo). El progreso de las versiones de demostración se conserva en el navegador, pero no se usa para dar por completados ni desbloquear los nuevos juegos personales.

El mapa mantiene las seis islas visibles en un archipiélago irregular. El menú de hamburguesa reúne capítulos, disponibilidad y progreso; ya no hay una barra inferior permanente. La carta inicial aparece una vez por sesión y se puede volver a abrir desde el menú.

## Nuestro mesario: cada día 14

La carta explica que cada día 14 del mes llegará un juego preparado especialmente para ella, con un mensaje de amor de su bebito al completarlo.

La configuración `chapters` en `assets/experience.js` define título, ruta, fecha prevista y `ready`. Una isla solo se habilita cuando está preparada (`ready: true`) y ha llegado su fecha en **America/Lima**. Por ahora únicamente el primer juego está preparado. Los otros no se abrirán automáticamente con los juegos antiguos sin personalizar, aunque pase la fecha: primero hay que preparar y activar cada capítulo. La planificación inicial comienza el 14 de octubre de 2026 y continúa el día 14 de los siguientes meses.

## Agua en movimiento

`assets/ocean.js` deforma en tiempo real la textura del mar con ondas y reflejos mediante WebGL. No mueve las islas ni las letras. Limita la resolución y la frecuencia de dibujo, y pausa el renderizado con la pestaña oculta. Si WebGL no está disponible, utiliza las corrientes animadas de CSS como alternativa. Con movimiento reducido se conserva el fondo estático.

Los efectos de sonido están activados por defecto tras la primera interacción. La música de fondo se incorporará cuando se elija la pista.

## Recursos

El mar y los seis paisajes están incluidos en WebP. Sus prompts originales de ImageGen están en [assets/ART-DIRECTION.md](assets/ART-DIRECTION.md). Las cuatro fotografías mantienen sus enlaces originales al repositorio Wedding. Se conservan los archivos y audios de las versiones anteriores. Google Fonts tiene fuentes locales de respaldo.

## Pruebas

```sh
npm install
npx playwright install chromium
python -m http.server 8765 --bind 127.0.0.1
```

En otra terminal:

```sh
npm test
npm run test:islands
npm run test:responsive
npm run test:water
npm run test:colors
```

Se simulan 30 rescates completos para comprobar que las caídas aleatorias son alcanzables y que solo se gana con los 18 familiares. Se juega la derrota y la victoria completas en Chromium de escritorio, Chromium móvil y WebKit móvil; se prueban pausa, reintento, carta final, guardado y controles táctiles. También se verifican cinco tamaños del juego, proporciones originales de los PNG, reacción al clic y movimiento reducido. Se verifican la carta del mesario, el menú y su foco, las cinco islas bloqueadas, los enlaces directos, la disponibilidad por fecha y preparación, el aislamiento del progreso anterior y el primer juego completo con su mensaje y guardado. Las pruebas de mapa cubren nueve tamaños y orientaciones de 320×568 a 1440×900 y comprueban los seis paisajes y sus nombres. Se comprueban los píxeles del agua entre fotogramas, movimiento reducido, cambios de tamaño y alternativa sin WebGL. Las pruebas de Chromium no sustituyen una prueba en un iPhone físico.

La prueba de color comprueba los píxeles de las cinco islas bloqueadas con los filtros desactivados, además del cambio a color al habilitar una isla. Se ejecuta en Chromium móvil, WebKit móvil y Chromium de escritorio. Para instalar el motor adicional de pruebas: `npx playwright install webkit`.
