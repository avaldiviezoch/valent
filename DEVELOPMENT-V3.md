# La isla del amor de madre · Desarrollo v3

Vista completa: `index_v3.html`. Tercera isla: `islas/amor_de_madre_v3.html`.

V3 conserva los dos juegos anteriores y prepara **El tablero pirata de los tóxicos** como tercera aventura. Producción (`index.html`) y desarrollo v2 (`index_v2.html`) permanecen intactos. La publicación de las rutas de prueba no promueve un capítulo a producción.

## Versiones y mesarios

La segunda aventura queda en v2 para el próximo mesario, **14 de noviembre de 2026**. La tercera se prepara en v3 para el siguiente, **14 de diciembre de 2026**. Son fechas del plan de publicación: no se ha programado ninguna promoción automática. En desarrollo se pueden revisar los tres capítulos desde ahora, completándolos en orden.

Las claves de v3 son `valent-development-v3-island-N-v1`. Se importan las victorias reales de las dos primeras islas de v2 y la primera de producción, en el mismo navegador. V3 nunca escribe en esas versiones. Una isla superada conserva color, marca ✓ y acceso para repetirla; terminarla desbloquea la siguiente que esté preparada. Las islas IV–VI siguen bloqueadas.

## Mecánica y niveles

Adaptación de `juego_salva_el_planeta.html` proporcionado por el usuario:

- Las treinta casillas conservan el tablero de cinco columnas y seis filas.
- Cada toque coloca una ficha de Mamá (antes, árbol).
- Un Hijo (antes, fábrica) ocupa al azar una casilla que todavía no tenga otro Hijo. Puede reemplazar una Mamá.
- Treinta Mamás simultáneas ganan el nivel; treinta Hijos lo pierden.
- Solo hay tres niveles: **800 ms**, **750 ms**, **700 ms** entre apariciones, respectivamente. Cada nivel comienza con el tablero vacío.
- Perder permite reintentar el mismo nivel. Reiniciar pide confirmar y conserva los niveles anteriores de la partida. Recargar comienza una partida nueva; las victorias de isla ya guardadas permanecen.
- Solo superar los tres niveles guarda la tercera isla como completada. No hay cuarto nivel ni guardado de victoria parcial.

Los diálogos iniciales y finales reutilizan los retratos originales de Antonio y Lucero, un personaje a la vez, escritura progresiva y movimiento suave. La carta final está firmada por Antonio. Música y mar reutilizan los recursos locales existentes.

## Retratos del tablero

| Nivel | Mamá | Hijos elegidos al azar por aparición |
| --- | --- | --- |
| 1 · 800 ms | Jenny | Megan y Logan |
| 2 · 750 ms | Ficha provisional | Ficha provisional |
| 3 · 700 ms | Mamá | Iván, Jhon y Harry |

`assets/mother-v3-portraits.js` agrupa los retratos en `levels`. Para completar el segundo nivel, editar `levels[1].mother.src` y añadir los retratos definitivos en `levels[1].children`. Un `src: null` conserva la ficha de texto. Cada aparición de un Hijo selecciona una cara al azar dentro de su nivel y la conserva hasta que esa casilla cambie; las actualizaciones de otras casillas no vuelven a sortearla. Los retratos ocupan la ficha sin nombres visibles.

Las rutas son relativas a la página de la isla. Se conserva la transparencia y proporción del PNG mediante `object-fit: contain`. Si falta una imagen, queda la ficha de texto. No se deforman ni modifican los archivos originales.

## Archivos

- `scripts/build-development-v3.py` copia las rutas y recursos de v2 en archivos v3 y adapta mapa, títulos, navegación y claves. No reemplaza v2 ni producción. No regenera el juego nuevo.
- `assets/mother-v3-engine.js` contiene el estado, las treinta casillas, la aparición aleatoria y los tres tiempos exactos.
- `assets/mother-v3.js` contiene controles, pausa, diálogos, modal de resultados y guardado al finalizar.
- `assets/mother-v3.css` contiene cubierta de madera, latón, fichas y presentación responsive.

La pausa congela tanto apariciones como reloj, incluso al cambiar de pestaña. El tablero funciona con tacto, ratón, Enter/Espacio y flechas. Los modales gestionan foco e impiden interactuar con el tablero; las animaciones respetan `prefers-reduced-motion`.

## Verificación

Con el servidor local en el repositorio y Playwright disponible:

```sh
node tests/mother-v3-engine.cjs
node tests/journey-v3-state.cjs
node tests/mother-v3.cjs
node tests/mother-v3-layout.cjs
node tests/mother-v3-portraits.cjs
```

Las pruebas cubren tiempos exactos, casillas reemplazadas, aleatoriedad, pérdida, reintento, pausa, teclado, tres victorias, carta final, repetición, persistencia, rutas bloqueadas, importación y aislamiento de v2/producción. `VALENT_TEST_URL` permite ejecutar las pruebas de navegador contra GitHub Pages.
