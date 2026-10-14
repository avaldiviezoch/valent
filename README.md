# Nuestra aventura

Una aventura romántica estática para GitHub Pages, sin compilación ni dependencias JavaScript en producción.

## La etapa actual

Solo está disponible **Izar las velas**, en la primera isla (`islas/encuentro.html`). El juego de navegación conserva su mecánica existente; al completarlo aparece un mensaje de tu bebito y se guarda el recuerdo. La antigua linterna se trasladó a `islas/aventuras.html`, en la cuarta isla, y queda bloqueada para personalizarla después.

Las otras cinco islas se ven en blanco y negro y no permiten jugar, tampoco entrando por sus enlaces directos. El progreso de las versiones de demostración se conserva en el navegador, pero no se usa para dar por completados ni desbloquear los nuevos juegos personales.

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
```

Se verifican la carta del mesario, el menú y su foco, las cinco islas bloqueadas, los enlaces directos, la disponibilidad por fecha y preparación, el aislamiento del progreso anterior y el primer juego completo con su mensaje y guardado. Las pruebas de mapa cubren nueve tamaños y orientaciones de 320×568 a 1440×900 y comprueban los seis paisajes y sus nombres. Se comprueban los píxeles del agua entre fotogramas, movimiento reducido, cambios de tamaño y alternativa sin WebGL. Las pruebas de Chromium no sustituyen una prueba en un iPhone físico.
