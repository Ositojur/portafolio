# TOKENS 2027 · "Señal en la galaxia" (v3)

Dueño: agente 01 (arte & tokens). Archivo: `assets/2027/tokens.css` (v3 galáctica; la v2 "Abismo/Bruma" quedó en `_respaldo/2026-10-29-pre-2027/agente01-borradores/`). Prueba visual: `assets/2027/_tile.html`.
Verificación: `node _demo-build/check-tokens-2027.mjs` (AA, paridad de bloques claros, claves iguales en los dos temas).
Capturas: `node _demo-build/capturar-tile-2027.mjs` → `_orquesta/capturas/01/`.

## 0. La idea en una línea

Espacio profundo azul noche, nebulosas en capas (verde agua, tinta azul y un toque de índigo-cobalto) y una sola luz viva. El verde agua es **señal**: aparece donde algo se transmite (un mensaje que llega, un dato en vivo, el precio, el botón que te contesta). Todo lo demás es tinta, bruma y retícula fina. Y todo el sitio late a **un solo ritmo**: `--beat: 2.8s`. El pulso del hero, los pulsos del 3D, el "escribiendo…" del bot, la respiración del precio premium y el barrido del CTA son múltiplos de ese latido. Eso es lo que hace que el motion se sienta de estudio y no "animaciones sueltas".

## 1. Reglas que nadie rompe (03–11)

1. **Ningún hex, rgb(), hsl() ni `font-family` fuera de tokens.css.** Si falta un color, se pide al 01.
2. **Animaciones solo vía `--anim-*`** (nunca `animation: lt-pulse …` directo). Con `prefers-reduced-motion` todos los `--anim-*` valen `none` y las distancias/staggers valen 0: el contenido queda en su estado final, visible.
3. **Estado por defecto = visible.** `--reveal` arranca en 100 %. Un elemento solo se esconde mientras su animación corre (`animation-fill-mode: both` ya va en los tokens). Sin JS se ve todo.
4. **Verde agua con criterio.** Dos niveles: `--aqua-fill` (un paso más bajo) para controles (botón primario, chip activo, badge) y `--aqua` / `--aqua-soft` plenos SOLO para lo vivo (pulso, tick leído, precio del acto 3, CTA final). Nunca en fondos de sección enteros, nunca en titulares, nunca degradado en texto.
5. **Vidrio cósmico solo en dos superficies:** la nav cápsula y el teléfono de la demo (`.lt-glass-cosmic` = `--surface-glass-cosmic` + `--glass-blur`, fallback `--glass-solid`). Ningún otro panel usa vidrio.
6. **Emojis con regla** (ver §3b). **Sin etiquetas en mayúsculas ni eyebrows** sobre las secciones; la jerarquía la hace el tamaño (`--fs-*`).
7. Solo `transform`, `opacity`, `clip-path` (y `filter` en elementos chicos). Las recetas que pintan (`lt-breathe`, `lt-aurora-spin`) están marcadas y tienen tope.

## 2. Convención de nombres

| Prefijo | Qué es | Ejemplos |
|---|---|---|
| `--bg`, `--surface`, `--text`, `--line` | neutros por rol | `--bg-2`, `--surface-2`, `--text-muted`, `--text-faint`, `--line-strong` |
| `--aqua*`, `--ink-blue*` | marca (cambian por tema) | `--aqua` (señal), `--aqua-fill` (controles), `--aqua-text`, `--aqua-soft`, `--aqua-deep` |
| `--on-*` | texto sobre un relleno | `--on-aqua`, `--on-aqua-soft`, `--on-ink` |
| `--btn-*`, `--btn2-*`, `--chip-*`, `--nav-*` | componente compartido | `--btn-bg-hover`, `--chip-active-bg` |
| `--fs-*`, `--lh-*`, `--tracking-*`, `--weight-*`, `--font-*` | tipografía | `--fs-display`, `--fs-price`, `--font-price` |
| `--space-*`, `--gutter`, `--scene-*`, `--grid-gap` | espacio | `--space-xl`, `--scene-pad`, `--scene-pin` |
| `--radius-*`, `--hairline`, `--focus-*` | forma | `--radius-pill`, `--focus-offset` |
| `--ease-*`, `--dur-*`, `--stagger-*`, `--reveal-*`, `--beat` | motion | `--ease-out-expo`, `--dur-epic`, `--stagger-rows` |
| `--anim-*` | animación lista (respeta reduced-motion) | `--anim-pulse`, `--anim-mask-up` |
| `--glow-*`, `--shadow-*`, `--aurora*`, `--signal-line`, `--sweep` | luz y profundidad | `--glow-solid`, `--aurora-cta`, `--aurora-c1` |
| `--gl-*` | 3D (agente 05 los lee con `getComputedStyle`) | `--gl-particle`, `--gl-additive`, `--gl-bloom` |
| `--bot-*`, `--bubble-*`, `--tick-*` | demo del bot (06) | `--bubble-out`, `--tick-read` |
| `--shop-*`, `--badge-*` | showroom (08) | `--shop-3`, `--shop-intensity-2` |
| `--cta-*` | CTA final | `--cta-bg` |
| `--z-*` | capas | `--z-canvas`, `--z-nav`, `--z-grain` |
| `lt-*` (keyframes) y `.lt-*` (recetas) | motion base de 01 | `lt-signal-pulse`, `.lt-glow`, `.lt-wipe` |

Tokens nuevos de un agente para su propio archivo: prefijo de su área y definidos en su archivo **referenciando** tokens de 01 (ej. en tienda.css `--price-shift: var(--reveal-y-lg)`). Nunca un valor de color nuevo.

Capas (declararlas igual en scenes.css, primera línea después del comentario):
`@layer tokens, reset, scenes, components, motion, ui, shop, utilities;`

## 3. Paletas

**Galaxia (oscuro, default)**: `--bg #040812` (azul noche, más azulado que el #05090B anterior) · `--bg-2 #070D1A` · `--surface #0B1422` · `--surface-2 #0F1C2C` · `--text #E8F4F1` · `--text-muted #A0B8BF` · `--aqua #2EE6C5` (señal) · `--aqua-fill #27C9AD` (controles) · `--aqua-soft #7FFFE1` · `--ink-blue #0F2B4A` · `--indigo #2C58A6`.
**Amanecer orbital (clara)**: `--bg #F2F9FA` · `--bg-2 #E7F3F6` · `--surface #FBFEFD` · `--text #06201C` · `--text-muted #3D5A5E` · `--aqua #0A8F79` (relleno/gráfico) · `--aqua-text #066656` (texto/link/botón) · `--aqua-deep #054D42`. Fondo con degradado celeste → verde agua (`--aurora`) y estrellas tenues en tinta.

Cómo se aplica: `:root` y `:root[data-theme="dark"]` = Galaxia. `:root[data-theme="light"]` = Amanecer orbital. Sin `data-theme`, `prefers-color-scheme: light` aplica Amanecer orbital (funciona sin JS). El toggle (07) solo escribe `data-theme` en `<html>`. Los dos bloques claros son idénticos a propósito; el script lo verifica.

### 3a. Galaxia: nebulosas, estrellas, objetos de render

| Token | Qué es | Uso |
|---|---|---|
| `--nebula-c1/c2/c3` | colores de nebulosa (verde agua, tinta azul, índigo-cobalto) con alfa baja | los usa `.lt-nebula` |
| `--nebula-1/2/3` | radiales listos (posición fija) | fondos estáticos |
| `--galaxy` (= `--aurora`) | las 3 nebulosas + base azul noche | fondo de hero y escenas de espacio |
| `@property --nebula-x / --nebula-y / --nebula-rot` | centro y giro de la nebulosa | `.lt-nebula` + `var(--anim-nebula)`, o atado al scroll |
| `--star-field-1/2/3`, `--star-field`, `--star-size-1/2/3`, `--star-sizes`, `--star-opacity` | estrellas SVG en 3 capas (polvo denso 240 px, medias 520 px, pocas grandes 960 px) | una capa por elemento para parallax (`--parallax-far` la 1, `--parallax-near` la 3) + `var(--anim-twinkle)` con duración × 1 / 1.6 / 2.3 |
| `--planet-fill`, `--rim-light`, `--glow-planet` | esfera con luz clave arriba a la izquierda, borde iluminado y atmósfera | `.lt-planet` (nodo del hero, fallback 3D, objeto del showroom) |
| `--surface-glass-cosmic`, `--glass-solid`, `--glass-border`, `--glass-highlight`, `--glass-blur` | vidrio cósmico | `.lt-glass-cosmic`, SOLO nav y teléfono |
| `--comet-tail`, `--comet-angle`, `--comet-dist` | cola de cometa | `var(--anim-comet)` (uno por pantalla: cruza y descansa) |
| `--orbit-r`, `--dur-orbit` | satélite en órbita | `var(--anim-orbit)` |
| `--gl-nebula` | tercer color para el shader de 05 | Three.js |

**Índigo con criterio:** el tercer color es índigo-cobalto `#2C58A6` (hue OKLCH ≈ 261), no `#3A49A0` (≈ 272). Con 272, el linter de hallmark lo marca como "degradado violeta → azul", justo lo que Lautaro rechazó antes. Va solo en atmósfera, con alfa ≤ 25 %, nunca en texto, botones ni titulares. En claro, el velo es `#A9C6F0`.

**Estrellas y texto:** las capas de estrellas son fondo. No van detrás de párrafos sin máscara: el dueño de la escena les pone `mask-image` para despejar la columna de texto o baja `--star-opacity`. Sigue vigente la regla "nada de partículas sobre texto".

### 3b. Emojis: dónde sí y dónde no

Fuente: `--emoji-font` ("Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", …). Para burbujas y chips existe `--font-chat` = Atkinson + emoji.

- **Sí:** dentro de las conversaciones de la demo del bot (es lo que escribe la gente real), en los chips de nichos (🍝 Restaurante, 🛵 Alquiler, 🛍️ Tienda) y en microcopy puntual (una línea de confirmación, un "gracias").
- **Cómo:** en los chips, el emoji va en un `<span aria-hidden="true">` y el nombre accesible es la palabra. Máximo uno por elemento. Nunca reemplaza a la palabra.
- **Nunca:** como ícono de sección, en H1/H2/H3, en botones de compra o CTA, en la nav ni en las filas de la tienda. Los íconos son SVG propios.
- Aviso: el linter de hallmark (regla 30a, que no admite excepción) marca los emojis de los chips como falla. Están ahí por pedido explícito de Lautaro; si retira el pedido, los chips quedan con la palabra sola.

### 3c. Informe de seguridad: papel, tinta y birome

El informe impreso del plano es **papel** en los dos temas (no se invierte en oscuro). Reemplazan los `color-mix()` de `scenes-plano.css` (`--sp-pen`, `--sp-paper-muted`, `--sp-paper-rule`, `--sp-highlight`): 03 puede apuntar sus `--sp-*` a estos tokens.

| Token | Galaxia | Amanecer orbital | Uso | AA (peor caso) |
|---|---|---|---|---|
| `--paper` | #E4EEEB | #F7FBF9 | la hoja (en oscuro, un punto más apagada para no encandilar) | — |
| `--paper-rule` | #B7C8CC | #B7C8CC | filas de la tabla (decorativo) | — |
| `--ink` | #0F2B4A | #0F2B4A | tinta de imprenta | 11.23 sobre el resaltador |
| `--ink-muted` | #4A5F72 | #4A5F72 | texto secundario del informe | 5.19 sobre el resaltador |
| `--pen` | #B0213F | #B0213F | birome roja: correcciones, sello, trazos | 5.24 sobre el resaltador |
| `--highlight` | #A8F2E0 | #B5F5E6 | resaltador verde agua | — |

Kalam (`--font-note`) sobre papel usa `--pen`. El `--note` de antes sigue para anotaciones sobre el fondo oscuro o claro, fuera del papel.

### Desvíos respecto del documento maestro (todos por contraste medido)

| Token | Documento | v2 | Por qué |
|---|---|---|---|
| `--bg` y neutros oscuros | #05090B… | **#040812…** | pedido galáctico: azul noche más azulado |
| `--text-muted` oscuro | #8EA9A3 | **#A0B8BF** | pasa 4.5 sobre el peor punto de las nebulosas |
| `--aqua` claro | #0B9E86 | **#0A8F79** | 2.89:1 sobre surface-2 como gráfico; ahora ≥ 3:1 en todos los fondos. #0B9E86 vive como `--glow-solid` (solo luz) |
| `--aqua-text` claro | #07705F | **#066656** | 3.95:1 sobre la aurora del CTA; ahora 4.54 |
| `--text-muted` claro | #4A6661 | **#3D5A5E** | con el valor original daba 3.65:1 sobre la aurora del CTA |
| `--pulse-ring` claro | #0B9E86 | **#0A8F79** | daba 2.97 sobre el nuevo `--bg-2` |
| `--glass-border` claro | — | **#86ABB6** | el borde del vidrio tiene que verse sobre la nebulosa celeste |
| `--surface` claro | #FFFFFF | **#FBFEFD** | sin blanco puro (hallmark 7b): blanco con tinte verde agua |
| `--btn-bg` | aqua / aqua-deep | **`--aqua-fill`** (#27C9AD oscuro, #066656 claro) | en oscuro el aqua pleno repetido en botones, chips y badges se acercaba al neón de template; en claro el casi negro no se leía como señal. |
| `--badge-bg` claro | aqua-deep | **`--aqua`** con `--on-aqua` oscuro | (ver fila anterior) |
| `--btn2-border` | `--line-strong` | **#7A9F98 / #4E6F69** | el contorno del botón secundario vive sobre la aurora: ≥ 3.37:1 en su peor punto |
| Auroras | — | alfas más bajas | el pico apilado de las manchas no puede comerse el texto (ver "peor punto" en la tabla) |

## 4. Tipografía

- **Display** Bricolage Grotesque variable (wght 200–800, **opsz 12–96**, local `assets/fonts/bricolage-*.woff2`). `font-optical-sizing: auto` (default) lleva los titulares grandes al corte de 96 pt, más apretado y dramático. Hero `--fs-display` 52→144 px, CTA `--fs-colossal` 60→200 px (una vez en el sitio).
- **Texto** Atkinson Hyperlegible 400/400i/700 (local `fonts/plano/`).
- **Datos** `--font-data` (= Bricolage tabular) para montos, horas y contadores chicos: Atkinson dibuja el cero barrado (Ø) y "USD 29Ø" se leía técnico.
- **Tracking**: `--tracking-display` -0.03em (a -0.038 chocaban "ne"/"go" en opsz 96), `--tracking-colossal` -0.026em para el 800 del CTA.
- **Precio** `--font-price` = Bricolage con `--numeric-price` (tabular + lining). **No** mono: IBM Plex Mono no existe en local (los `plex-*.woff2` son Plex **Sans**) y en mono del sistema el precio se veía distinto en cada equipo. Bricolage tiene `tnum`, así el contador no "baila".
- **Mono** `--font-mono` solo para lo que ES dato crudo (log de la API, horas, rutas). Cae a Cascadia/Consolas si Plex Mono no está instalada.
- **Kalam** solo anotaciones del plano de seguridad, `--note`.
- `--weight-display-thin` (260) existe para el tween de peso del hero: el titular entra fino y "se carga" a 720 mientras sube de su máscara.

## 5. Motion: el sistema

| Token | Valor | Para qué |
|---|---|---|
| `--ease-out-expo` | cubic-bezier(.16,1,.3,1) | firma del sitio: reveals y entradas |
| `--ease-out-quart` | (.25,1,.5,1) | hovers, UI chica |
| `--ease-out-circ` | (0,.55,.45,1) | contador del precio (frena con peso) |
| `--ease-in-out-quint` | (.83,0,.17,1) | cambio de acto, tema, línea que se dibuja |
| `--ease-in-out-sine` | (.37,0,.63,1) | loops (respirar, derivar, typing) |
| `--ease-spring` | linear() ~12 % sobrepaso | chips, toggle, badge |
| `--ease-spring-soft` | linear() ~1.5 % | botones magnéticos, burbujas que llegan |
| `--ease-exit` | (.7,0,.84,0) | SOLO salidas de escena con scrub (nunca UI) |
| `--dur-instant/fast/base` | 90 / 160 / 240 ms | UI (siempre < 300 ms) |
| `--dur-slow/slower` | 520 / 900 ms | filas, burbujas / líneas de titular |
| `--dur-cinematic` | 1400 ms | intro del hero completa |
| `--dur-epic` | 2200 ms | contador, línea del proceso, CTA final |
| `--beat` | 2.8 s | el latido; `--dur-sweep` 1.5×, `--dur-breathe` 2×, `--dur-drift` 10×, `--dur-aurora` 20× |
| `--stagger-chars/words/lines/rows/blocks` | 18 / 45 / 90 / 120 / 180 ms | más chico el ítem, más corto el escalón; tope 8 ítems |
| `--reveal-y-sm/md/lg`, `--reveal-x-lg` | .75rem / 2rem / 6rem / 12vw | distancias de entrada |
| `--reveal-scale/blur/rotate` | .94 / 10px / 2.5deg | partida de media y líneas |
| `--perspective`, `--depth-step`, `--depth-tilt` | 1400px / -140px / 14deg | pila 3D de capturas (escena Web) |
| `--parallax-near/far` | .18 / .42 | factores de parallax |
| `--scrub`, `--magnet`, `--spotlight-size` | .8 / .28 / 38rem | ScrollTrigger, botones magnéticos, spotlight |

**Para GSAP (04, 08):** los tiempos se leen en ms/s con `getComputedStyle(document.documentElement).getPropertyValue('--dur-slower')` → `parseFloat(v) / (v.endsWith('ms') ? 1000 : 1)`. Curvas: `CustomEase.create('outExpo', JSON.parse(css('--ease-out-expo-pts')))` (están como texto: `--ease-out-expo-pts`, `--ease-out-quart-pts`, `--ease-out-circ-pts`, `--ease-in-out-quint-pts`). En `gsap.matchMedia()` el bloque reduced-motion no crea tweens: el CSS ya deja todo visible.

### @property registradas

| Propiedad | Sintaxis | Inicial | Hereda | Uso |
|---|---|---|---|---|
| `--glow-intensity` | number | 0.6 | sí | intensidad de la señal; un acto del showroom la fija con `--shop-intensity-1/2/3` y todo su contenido responde |
| `--aurora-angle` | angle | 0deg | no | gira la luz de `.lt-aurora-live` (scroll o loop) |
| `--reveal` | percentage | 100% | no | progreso de `.lt-wipe` / `.lt-curtain` |

Ojo (trampa de CSS): una custom property que usa `var(--glow-intensity)` declarada en `:root` se resuelve en `:root` y **no ve** la animación del hijo. Por eso existen las recetas `.lt-*`, que escriben la fórmula en el propio elemento:
`.lt-glow` (box-shadow que escala con la intensidad), `.lt-text-glow` (solo datos vivos; apagado en claro), `.lt-aurora-live` (conic + máscara radial), `.lt-wipe` (izq → der), `.lt-curtain` (abajo → arriba). Están en `@layer tokens`: cualquier capa posterior las pisa.

### Keyframes base (via `--anim-*`)

| Token | Keyframe | Costo | Uso |
|---|---|---|---|
| `--anim-pulse` | `lt-signal-pulse` | composite | anillos del nodo de señal; 3 anillos con delay `calc(var(--beat) / -3)` |
| `--anim-sweep` | `lt-sweep` | composite | barrido de luz por una línea (`--signal-line`) o una superficie (`--sweep`) |
| `--anim-breathe` | `lt-breathe` | **pinta** | respiración del glow (máx. 2 elementos en pantalla) |
| `--anim-breathe-soft` | `lt-breathe-soft` | composite | igual pero por opacidad, para superficies grandes |
| `--anim-aurora` | `lt-aurora-spin` | **pinta** | aurora viva en áreas acotadas (acto Premium) |
| `--anim-drift` | `lt-drift` | composite | aurora a pantalla completa (capa sobredimensionada) |
| `--anim-reveal` | `lt-reveal` | clip-path | con `.lt-wipe` / `.lt-curtain` |
| `--anim-mask-up` | `lt-mask-up` | composite | línea de titular que sube desde su máscara (fallback CSS de SplitText) |
| `--anim-arrive` | `lt-arrive` | composite | mensaje que llega (burbujas, filas) con spring suave |
| `--anim-typing` | `lt-typing` | composite | "escribiendo…": delay `n × var(--beat) / 12` |
| `--anim-draw` | `lt-draw` | pinta (SVG) | path con `pathLength="1"` y `stroke-dasharray: 1` |
| `--anim-scan` | `lt-scan` | composite | franja que baja por el plano de seguridad (`--scan-line`) |
| `--anim-caret` | `lt-caret` | composite | cursor del input del bot / terminal |
| `--anim-twinkle` | `lt-twinkle` | composite | titileo de una capa de estrellas |
| `--anim-nebula` | `lt-nebula-drift` | **pinta** | deriva de `.lt-nebula` (una capa por pantalla, pausar fuera de vista) |
| `--anim-orbit` | `lt-orbit` | composite | satélite alrededor de un nodo o planeta (`--orbit-r`) |
| `--anim-comet` | `lt-comet` | composite | cometa ocasional (cruza en el 22 % del ciclo) |

Loops fuera de pantalla: el dueño de la escena pausa con `animation-play-state: paused` cuando no está en viewport (IntersectionObserver de 04). "Nada anima fuera de vista."

## 6. Los 4 momentos firma

### Momento 1 · Hero 3D: "la señal se enciende" (dueños 05 + 04)
Tokens: `--aurora`, `.lt-aurora-live` + `--anim-drift`, `--grid-line*`, `--gl-*`, `--pulse-ring`, `--pulse-core`, `--fs-display`, `--weight-display-thin → --weight-display`, `--anim-mask-up`, `--stagger-lines`, `--dur-cinematic`, `--signal-line` + `--anim-sweep`, `--z-canvas`, `--z-scene-fg`.
Galaxia: el fondo es la nebulosa viva (`.lt-nebula` + `--anim-nebula`) y las 3 capas de estrellas con parallax. El nodo es un planeta con look de render (`.lt-planet`) que emite los pulsos, con un satélite en órbita (`--anim-orbit`) y un cometa ocasional (`--anim-comet`).
Coreografía (1.4 s, `--ease-out-expo`): 0 ms la retícula ya está (fina, enmascarada); 0–300 ms el núcleo 3D aparece como un punto y emite el primer pulso; 200 ms en adelante las 3 líneas del H1 suben de su máscara con `--stagger-lines`, cada una entrando en peso 260 y llegando a 720 (tween de `font-weight`, Bricolage variable); 650 ms la bajada se revela; 800 ms los CTA llegan con spring suave; desde ahí el campo de partículas respira a `--beat` y cada pulso es un "mensaje entrante" que viaja por la esfera. Al scrollear: las partículas se disuelven (`--parallax-far`) y la línea de señal barre el borde inferior: el hero "manda" el mensaje a la escena siguiente.
Fallback: mismo encuadre en `media/hero-3d-fallback.webp` + los anillos CSS quietos (reduced-motion).

### Momento 2 · Demo del bot: "03:12 y alguien contesta" (dueño 06)
Tokens: teléfono en `.lt-glass-cosmic`, `--font-chat` (emojis permitidos en las burbujas), `--bot-*`, `--bubble-*` (cliente en verde tinta, bot en **tinta azul**: el verde agua queda para la señal), `--tick-read`, `--handoff` (ámbar = humano), `--demo-label`, `--anim-arrive`, `--anim-typing`, `--anim-caret`, `--stagger-rows`, `--ease-spring-soft`, `--aurora-soft`.
Coreografía: escena pinneada (`--scene-pin`); el scroll es el reloj. Cada mensaje del cliente llega desde abajo-derecha (`transform-origin` en su esquina), el bot muestra "escribiendo…" durante exactamente medio latido y su burbuja llega desde abajo-izquierda; el tick pasa de `--tick-sent` a `--tick-read` (el único verde de la conversación). En el handoff la línea ámbar se dibuja de lado a lado (`.lt-wipe`) y el flujo de al lado (mensaje → IA → acción → panel) enciende su nodo con `.lt-glow`. Los chips cambian de escenario con `--ease-spring`.

### Momento 3 · Showroom de precios: "la intensidad sube" (dueño 08, con 04)
Tokens: `--shop-1/2/3`, `--shop-intensity-1/2/3` → `--glow-intensity`, `--shop-price-1/2/3` (apagado → aqua → aqua-soft; en claro gris verdoso → aqua-text → aqua), `--shop-scale-1/2/3` (0.62 / 0.8 / 1 × `--fs-price`), `--fs-price`, `--font-price`, `--numeric-price`, `--tracking-price`, `--ease-out-circ`, `--dur-epic`, `.lt-text-glow`, `.lt-aurora-live` + `--aurora-angle`, `--anim-breathe`, `--badge-*` + `.lt-glow`, `--stagger-rows`, `--space-5xl`.
Coreografía: tres actos pinneados. Al pasar de acto, en el mismo scroll: el fondo cruza de `--shop-1` a `--shop-2` a `--shop-3`, `--glow-intensity` tweenea 0.22 → 0.55 → 1 (el precio y el badge se encienden juntos, porque hereda), el número gigante crece (`--shop-scale-*`), cambia de color (`--shop-price-*`) y cuenta hasta el nuevo precio con `--ease-out-circ` en `--dur-epic` (cifras tabulares: no tiembla), y en Premium la aurora viva empieza a girar con el scroll (`--aurora-angle` atado al progreso). Las filas entran con `--anim-arrive` escalonadas por `--stagger-rows`; hover/foco expande lo que incluye. El precio premium respira (`--anim-breathe`) cuando el acto queda quieto.

### Momento 4 · CTA final: "la señal llega" (dueños 04 + 07)
Tokens: `--cta-bg` (`--aurora-cta`), `.lt-aurora-live` + `--anim-drift` (reverse), `--fs-colossal`, `--weight-display-x`, `.lt-wipe` + `--anim-reveal` con `--dur-epic`, `--signal-line` + `--anim-sweep`, `.lt-glow` + `--anim-breathe` en el botón, `--magnet`.
Coreografía: el texto gigante se revela de izquierda a derecha como una línea de señal que llega (`--reveal` atado al scroll con scrub), escalando levemente hacia 1; cuando termina, el botón primario empieza a respirar al latido y se vuelve magnético; la línea bajo los botones barre una vez por latido y medio. Es el único lugar donde el glow es protagonista: el cierre del pico-final.

## 7. Grano y retícula
`body::after` fijo con `background-image: var(--grain)`, `background-size: var(--grain-size)`, `opacity: var(--grain-opacity)`, `mix-blend-mode: var(--grain-blend)`, `z-index: var(--z-grain)`, `pointer-events: none`. Retícula: dos capas `linear-gradient` con `--grid-line` / `--grid-line-major` cada `--grid-cell` / `--grid-cell-major`, enmascaradas con un radial (no a pantalla completa).

## 8. Pendientes y avisos para otros agentes
- **02 (copy):** hallmark marca el H1 sugerido con 8 palabras (techo 7) y la bajada larga (techo 12). Opción sin inventar nada: "Tu WhatsApp responde las 24 horas." y bajada "Chatbots que atienden, venden y agendan solos, con el sistema detrás."
- **03 / 05 / 06:** cambiaron los nombres de los temas (Galaxia / Amanecer orbital), pero los selectores y los tokens existentes siguen igual: nada se rompe. Los tokens nuevos están en §3a y §3b.
- **05:** leer `--gl-*` (incluido `--gl-nebula`) del `<html>` y volver a leerlos al cambiar `data-theme` (MutationObserver). `--gl-additive` 1/0 decide el blending; `--gl-bloom` la fuerza del glow.
- **07:** el toggle escribe `data-theme`; `color-scheme` ya viene en cada bloque. `--dur-theme` para la View Transition.
- **IBM Plex Mono** no está en local. Si Lautaro la quiere de verdad, hay que sumar el woff2 a `assets/fonts/` (no se descargó por regla).

## 9. Tabla AA (generada por `node _demo-build/check-tokens-2027.mjs --md`)
Mínimos: 4.5 texto normal, 3 texto grande y elementos gráficos/bordes de control. "Peor punto" de aurora = todas las manchas radiales en su pico apiladas sobre el fondo (cota superior, más dura que cualquier render real). Resultado actual: **336 pares, 0 fallas.** Peores puntos nuevos: `--@galaxy-peak-*` (las 3 nebulosas apiladas) y `--@glass-worst-*` (cada parada del vidrio cósmico sobre el peor fondo).

| Tema | Texto / elemento | Fondo | Ratio | Mínimo | Resultado | Uso |
|---|---|---|---:|---:|---|---|
| Galaxia (oscuro) | `--text` #E8F4F1 | `--bg` #040812 | 17.78 | 4.5 | pasa | texto principal (incluye vidrio cósmico) |
| Galaxia (oscuro) | `--text` #E8F4F1 | `--bg-2` #070D1A | 17.24 | 4.5 | pasa | texto principal (incluye vidrio cósmico) |
| Galaxia (oscuro) | `--text` #E8F4F1 | `--surface` #0B1422 | 16.39 | 4.5 | pasa | texto principal (incluye vidrio cósmico) |
| Galaxia (oscuro) | `--text` #E8F4F1 | `--surface-2` #0F1C2C | 15.25 | 4.5 | pasa | texto principal (incluye vidrio cósmico) |
| Galaxia (oscuro) | `--text` #E8F4F1 | `--shop-1` #060C18 | 17.36 | 4.5 | pasa | texto principal (incluye vidrio cósmico) |
| Galaxia (oscuro) | `--text` #E8F4F1 | `--shop-2` #081822 | 16.01 | 4.5 | pasa | texto principal (incluye vidrio cósmico) |
| Galaxia (oscuro) | `--text` #E8F4F1 | `--shop-3` #0B2629 | 14.09 | 4.5 | pasa | texto principal (incluye vidrio cósmico) |
| Galaxia (oscuro) | `--text` #E8F4F1 | `--@glass-worst-light` #102235 | 14.31 | 4.5 | pasa | texto principal (incluye vidrio cósmico) |
| Galaxia (oscuro) | `--text` #E8F4F1 | `--@glass-worst-dark` #09101D | 16.89 | 4.5 | pasa | texto principal (incluye vidrio cósmico) |
| Galaxia (oscuro) | `--text-muted` #A0B8BF | `--bg` #040812 | 9.63 | 4.5 | pasa | texto secundario (incluye vidrio cósmico) |
| Galaxia (oscuro) | `--text-muted` #A0B8BF | `--bg-2` #070D1A | 9.34 | 4.5 | pasa | texto secundario (incluye vidrio cósmico) |
| Galaxia (oscuro) | `--text-muted` #A0B8BF | `--surface` #0B1422 | 8.88 | 4.5 | pasa | texto secundario (incluye vidrio cósmico) |
| Galaxia (oscuro) | `--text-muted` #A0B8BF | `--surface-2` #0F1C2C | 8.26 | 4.5 | pasa | texto secundario (incluye vidrio cósmico) |
| Galaxia (oscuro) | `--text-muted` #A0B8BF | `--shop-1` #060C18 | 9.41 | 4.5 | pasa | texto secundario (incluye vidrio cósmico) |
| Galaxia (oscuro) | `--text-muted` #A0B8BF | `--shop-2` #081822 | 8.68 | 4.5 | pasa | texto secundario (incluye vidrio cósmico) |
| Galaxia (oscuro) | `--text-muted` #A0B8BF | `--shop-3` #0B2629 | 7.63 | 4.5 | pasa | texto secundario (incluye vidrio cósmico) |
| Galaxia (oscuro) | `--text-muted` #A0B8BF | `--@glass-worst-light` #102235 | 7.76 | 4.5 | pasa | texto secundario (incluye vidrio cósmico) |
| Galaxia (oscuro) | `--text-muted` #A0B8BF | `--@glass-worst-dark` #09101D | 9.16 | 4.5 | pasa | texto secundario (incluye vidrio cósmico) |
| Galaxia (oscuro) | `--link` #2EE6C5 | `--bg` #040812 | 12.63 | 4.5 | pasa | links |
| Galaxia (oscuro) | `--link` #2EE6C5 | `--bg-2` #070D1A | 12.24 | 4.5 | pasa | links |
| Galaxia (oscuro) | `--link` #2EE6C5 | `--surface` #0B1422 | 11.64 | 4.5 | pasa | links |
| Galaxia (oscuro) | `--link` #2EE6C5 | `--surface-2` #0F1C2C | 10.83 | 4.5 | pasa | links |
| Galaxia (oscuro) | `--link` #2EE6C5 | `--shop-1` #060C18 | 12.33 | 4.5 | pasa | links |
| Galaxia (oscuro) | `--link` #2EE6C5 | `--shop-2` #081822 | 11.37 | 4.5 | pasa | links |
| Galaxia (oscuro) | `--link` #2EE6C5 | `--shop-3` #0B2629 | 10.00 | 4.5 | pasa | links |
| Galaxia (oscuro) | `--link-hover` #7FFFE1 | `--bg` #040812 | 16.49 | 4.5 | pasa | link en hover |
| Galaxia (oscuro) | `--link-hover` #7FFFE1 | `--bg-2` #070D1A | 15.99 | 4.5 | pasa | link en hover |
| Galaxia (oscuro) | `--link-hover` #7FFFE1 | `--surface` #0B1422 | 15.20 | 4.5 | pasa | link en hover |
| Galaxia (oscuro) | `--link-hover` #7FFFE1 | `--surface-2` #0F1C2C | 14.14 | 4.5 | pasa | link en hover |
| Galaxia (oscuro) | `--text-faint` #5F7A85 | `--bg` #040812 | 4.40 | 3 | pasa | cotas decorativas (no informativo) |
| Galaxia (oscuro) | `--text-faint` #5F7A85 | `--bg-2` #070D1A | 4.26 | 3 | pasa | cotas decorativas (no informativo) |
| Galaxia (oscuro) | `--btn-text` #031412 | `--btn-bg` #27C9AD | 9.03 | 4.5 | pasa | texto de botón primario |
| Galaxia (oscuro) | `--btn-text` #031412 | `--btn-bg-hover` #7FFFE1 | 15.54 | 4.5 | pasa | texto de botón primario |
| Galaxia (oscuro) | `--btn-bg` #27C9AD | `--bg` #040812 | 9.58 | 3 | pasa | botón primario vs fondo (no-texto) |
| Galaxia (oscuro) | `--btn-bg` #27C9AD | `--bg-2` #070D1A | 9.29 | 3 | pasa | botón primario vs fondo (no-texto) |
| Galaxia (oscuro) | `--btn-bg` #27C9AD | `--surface` #0B1422 | 8.83 | 3 | pasa | botón primario vs fondo (no-texto) |
| Galaxia (oscuro) | `--btn-bg` #27C9AD | `--surface-2` #0F1C2C | 8.21 | 3 | pasa | botón primario vs fondo (no-texto) |
| Galaxia (oscuro) | `--btn-bg` #27C9AD | `--shop-1` #060C18 | 9.36 | 3 | pasa | botón primario vs fondo (no-texto) |
| Galaxia (oscuro) | `--btn-bg` #27C9AD | `--shop-2` #081822 | 8.63 | 3 | pasa | botón primario vs fondo (no-texto) |
| Galaxia (oscuro) | `--btn-bg` #27C9AD | `--shop-3` #0B2629 | 7.59 | 3 | pasa | botón primario vs fondo (no-texto) |
| Galaxia (oscuro) | `--btn2-text` #E8F4F1 | `--bg` #040812 | 17.78 | 4.5 | pasa | botón secundario |
| Galaxia (oscuro) | `--btn2-text` #E8F4F1 | `--bg-2` #070D1A | 17.24 | 4.5 | pasa | botón secundario |
| Galaxia (oscuro) | `--btn2-text` #E8F4F1 | `--surface` #0B1422 | 16.39 | 4.5 | pasa | botón secundario |
| Galaxia (oscuro) | `--btn2-text` #E8F4F1 | `--surface-2` #0F1C2C | 15.25 | 4.5 | pasa | botón secundario |
| Galaxia (oscuro) | `--btn2-border` #7A9F98 | `--bg` #040812 | 6.90 | 3 | pasa | borde de control |
| Galaxia (oscuro) | `--btn2-border` #7A9F98 | `--bg-2` #070D1A | 6.69 | 3 | pasa | borde de control |
| Galaxia (oscuro) | `--btn2-border` #7A9F98 | `--surface` #0B1422 | 6.37 | 3 | pasa | borde de control |
| Galaxia (oscuro) | `--btn2-border` #7A9F98 | `--surface-2` #0F1C2C | 5.92 | 3 | pasa | borde de control |
| Galaxia (oscuro) | `--btn2-border` #7A9F98 | `--shop-1` #060C18 | 6.74 | 3 | pasa | borde de control |
| Galaxia (oscuro) | `--btn2-border` #7A9F98 | `--shop-2` #081822 | 6.22 | 3 | pasa | borde de control |
| Galaxia (oscuro) | `--btn2-border` #7A9F98 | `--shop-3` #0B2629 | 5.47 | 3 | pasa | borde de control |
| Galaxia (oscuro) | `--line-strong` #5A7E8A | `--bg` #040812 | 4.56 | 3 | pasa | bordes de inputs/controles |
| Galaxia (oscuro) | `--line-strong` #5A7E8A | `--bg-2` #070D1A | 4.43 | 3 | pasa | bordes de inputs/controles |
| Galaxia (oscuro) | `--line-strong` #5A7E8A | `--surface` #0B1422 | 4.21 | 3 | pasa | bordes de inputs/controles |
| Galaxia (oscuro) | `--line-strong` #5A7E8A | `--surface-2` #0F1C2C | 3.91 | 3 | pasa | bordes de inputs/controles |
| Galaxia (oscuro) | `--focus` #2EE6C5 | `--bg` #040812 | 12.63 | 3 | pasa | anillo de foco |
| Galaxia (oscuro) | `--focus` #2EE6C5 | `--bg-2` #070D1A | 12.24 | 3 | pasa | anillo de foco |
| Galaxia (oscuro) | `--focus` #2EE6C5 | `--surface` #0B1422 | 11.64 | 3 | pasa | anillo de foco |
| Galaxia (oscuro) | `--focus` #2EE6C5 | `--surface-2` #0F1C2C | 10.83 | 3 | pasa | anillo de foco |
| Galaxia (oscuro) | `--focus` #2EE6C5 | `--shop-1` #060C18 | 12.33 | 3 | pasa | anillo de foco |
| Galaxia (oscuro) | `--focus` #2EE6C5 | `--shop-2` #081822 | 11.37 | 3 | pasa | anillo de foco |
| Galaxia (oscuro) | `--focus` #2EE6C5 | `--shop-3` #0B2629 | 10.00 | 3 | pasa | anillo de foco |
| Galaxia (oscuro) | `--aqua` #2EE6C5 | `--bg` #040812 | 12.63 | 3 | pasa | aqua como relleno / gráfico |
| Galaxia (oscuro) | `--aqua` #2EE6C5 | `--bg-2` #070D1A | 12.24 | 3 | pasa | aqua como relleno / gráfico |
| Galaxia (oscuro) | `--aqua` #2EE6C5 | `--surface` #0B1422 | 11.64 | 3 | pasa | aqua como relleno / gráfico |
| Galaxia (oscuro) | `--aqua` #2EE6C5 | `--surface-2` #0F1C2C | 10.83 | 3 | pasa | aqua como relleno / gráfico |
| Galaxia (oscuro) | `--warn` #FFB547 | `--bg` #040812 | 11.40 | 4.5 | pasa | aviso como texto |
| Galaxia (oscuro) | `--warn` #FFB547 | `--bg-2` #070D1A | 11.05 | 4.5 | pasa | aviso como texto |
| Galaxia (oscuro) | `--warn` #FFB547 | `--surface` #0B1422 | 10.51 | 4.5 | pasa | aviso como texto |
| Galaxia (oscuro) | `--warn` #FFB547 | `--surface-2` #0F1C2C | 9.77 | 4.5 | pasa | aviso como texto |
| Galaxia (oscuro) | `--danger` #FF5C7A | `--bg` #040812 | 6.74 | 4.5 | pasa | error como texto |
| Galaxia (oscuro) | `--danger` #FF5C7A | `--bg-2` #070D1A | 6.53 | 4.5 | pasa | error como texto |
| Galaxia (oscuro) | `--danger` #FF5C7A | `--surface` #0B1422 | 6.21 | 4.5 | pasa | error como texto |
| Galaxia (oscuro) | `--danger` #FF5C7A | `--surface-2` #0F1C2C | 5.78 | 4.5 | pasa | error como texto |
| Galaxia (oscuro) | `--ok` #3BE38B | `--bg` #040812 | 11.96 | 4.5 | pasa | ok como texto |
| Galaxia (oscuro) | `--ok` #3BE38B | `--bg-2` #070D1A | 11.60 | 4.5 | pasa | ok como texto |
| Galaxia (oscuro) | `--ok` #3BE38B | `--surface` #0B1422 | 11.03 | 4.5 | pasa | ok como texto |
| Galaxia (oscuro) | `--ok` #3BE38B | `--surface-2` #0F1C2C | 10.26 | 4.5 | pasa | ok como texto |
| Galaxia (oscuro) | `--note` #FF8FA3 | `--bg` #040812 | 9.26 | 4.5 | pasa | anotación Kalam |
| Galaxia (oscuro) | `--note` #FF8FA3 | `--bg-2` #070D1A | 8.98 | 4.5 | pasa | anotación Kalam |
| Galaxia (oscuro) | `--note` #FF8FA3 | `--surface` #0B1422 | 8.54 | 4.5 | pasa | anotación Kalam |
| Galaxia (oscuro) | `--selection-text` #F2FFFB | `--selection-bg` #123E52 | 11.15 | 4.5 | pasa | texto seleccionado |
| Galaxia (oscuro) | `--bubble-in-text` #E8F4F1 | `--bubble-in` #12302C | 12.55 | 4.5 | pasa | burbuja cliente |
| Galaxia (oscuro) | `--bubble-out-text` #E8F4F1 | `--bubble-out` #0E2036 | 14.58 | 4.5 | pasa | burbuja bot |
| Galaxia (oscuro) | `--bubble-meta` #9FB5BE | `--bubble-in` #12302C | 6.62 | 4.5 | pasa | hora / escribiendo… |
| Galaxia (oscuro) | `--bubble-meta` #9FB5BE | `--bubble-out` #0E2036 | 7.69 | 4.5 | pasa | hora / escribiendo… |
| Galaxia (oscuro) | `--bubble-meta` #9FB5BE | `--bot-screen` #060C16 | 9.17 | 4.5 | pasa | hora / escribiendo… |
| Galaxia (oscuro) | `--tick-read` #2EE6C5 | `--bubble-in` #12302C | 8.92 | 3 | pasa | tick leído (ícono) |
| Galaxia (oscuro) | `--tick-read` #2EE6C5 | `--bubble-out` #0E2036 | 10.36 | 3 | pasa | tick leído (ícono) |
| Galaxia (oscuro) | `--handoff` #FFB547 | `--bot-screen` #060C16 | 11.15 | 4.5 | pasa | handoff a persona |
| Galaxia (oscuro) | `--handoff` #FFB547 | `--bubble-out` #0E2036 | 9.35 | 4.5 | pasa | handoff a persona |
| Galaxia (oscuro) | `--chip-text` #E8F4F1 | `--chip-bg` #0F1C2C | 15.25 | 4.5 | pasa | chip de escenario |
| Galaxia (oscuro) | `--chip-active-text` #031412 | `--chip-active-bg` #27C9AD | 9.03 | 4.5 | pasa | chip activo |
| Galaxia (oscuro) | `--chip-border` #5A7E8A | `--bot-screen` #060C16 | 4.46 | 3 | pasa | borde de chip |
| Galaxia (oscuro) | `--chip-border` #5A7E8A | `--bg` #040812 | 4.56 | 3 | pasa | borde de chip |
| Galaxia (oscuro) | `--chip-border` #5A7E8A | `--surface` #0B1422 | 4.21 | 3 | pasa | borde de chip |
| Galaxia (oscuro) | `--text` #E8F4F1 | `--bot-header` #0C1624 | 16.13 | 4.5 | pasa | texto en el teléfono |
| Galaxia (oscuro) | `--text` #E8F4F1 | `--bot-screen` #060C16 | 17.39 | 4.5 | pasa | texto en el teléfono |
| Galaxia (oscuro) | `--shop-price` #2EE6C5 | `--shop-1` #060C18 | 12.33 | 3 | pasa | precio gigante (texto grande) |
| Galaxia (oscuro) | `--shop-price` #2EE6C5 | `--shop-2` #081822 | 11.37 | 3 | pasa | precio gigante (texto grande) |
| Galaxia (oscuro) | `--shop-price` #2EE6C5 | `--shop-3` #0B2629 | 10.00 | 3 | pasa | precio gigante (texto grande) |
| Galaxia (oscuro) | `--shop-price` #2EE6C5 | `--shop-1` #060C18 | 12.33 | 4.5 | pasa | precio (si se usa chico) |
| Galaxia (oscuro) | `--shop-price` #2EE6C5 | `--shop-2` #081822 | 11.37 | 4.5 | pasa | precio (si se usa chico) |
| Galaxia (oscuro) | `--shop-price` #2EE6C5 | `--shop-3` #0B2629 | 10.00 | 4.5 | pasa | precio (si se usa chico) |
| Galaxia (oscuro) | `--shop-price-premium` #7FFFE1 | `--shop-3` #0B2629 | 13.07 | 3 | pasa | precio premium (grande) |
| Galaxia (oscuro) | `--badge-text` #031412 | `--badge-bg` #27C9AD | 9.03 | 4.5 | pasa | badge Más elegido |
| Galaxia (oscuro) | `--cta-text` #E8F4F1 | `--bg` #040812 | 17.78 | 4.5 | pasa | CTA final sobre su fondo base |
| Galaxia (oscuro) | `--cta-text` #E8F4F1 | `--bg-2` #070D1A | 17.24 | 4.5 | pasa | CTA final sobre su fondo base |
| Galaxia (oscuro) | `--demo-label` #FFB547 | `--surface` #0B1422 | 10.51 | 4.5 | pasa | rótulo Demo |
| Galaxia (oscuro) | `--demo-label` #FFB547 | `--bot-screen` #060C16 | 11.15 | 4.5 | pasa | rótulo Demo |
| Galaxia (oscuro) | `--demo-label` #FFB547 | `--bg` #040812 | 11.40 | 4.5 | pasa | rótulo Demo |
| Galaxia (oscuro) | `--text` #E8F4F1 | `--@hero-peak-light` #173F66 | 9.61 | 4.5 | pasa | texto sobre aurora (peor punto) |
| Galaxia (oscuro) | `--text` #E8F4F1 | `--@hero-peak-dark` #040812 | 17.78 | 4.5 | pasa | texto sobre aurora (peor punto) |
| Galaxia (oscuro) | `--text` #E8F4F1 | `--@cta-peak-light` #19446B | 8.96 | 4.5 | pasa | texto sobre aurora (peor punto) |
| Galaxia (oscuro) | `--text` #E8F4F1 | `--@cta-peak-dark` #040812 | 17.78 | 4.5 | pasa | texto sobre aurora (peor punto) |
| Galaxia (oscuro) | `--text` #E8F4F1 | `--@soft-peak-light` #102C48 | 12.63 | 4.5 | pasa | texto sobre aurora (peor punto) |
| Galaxia (oscuro) | `--text` #E8F4F1 | `--@soft-peak-dark` #040812 | 17.78 | 4.5 | pasa | texto sobre aurora (peor punto) |
| Galaxia (oscuro) | `--text` #E8F4F1 | `--@live-peak-light` #0D3939 | 11.22 | 4.5 | pasa | texto sobre aurora (peor punto) |
| Galaxia (oscuro) | `--text` #E8F4F1 | `--@live-peak-dark` #091224 | 16.59 | 4.5 | pasa | texto sobre aurora (peor punto) |
| Galaxia (oscuro) | `--text` #E8F4F1 | `--@galaxy-peak-light` #173F66 | 9.61 | 4.5 | pasa | texto sobre aurora (peor punto) |
| Galaxia (oscuro) | `--text` #E8F4F1 | `--@galaxy-peak-dark` #040812 | 17.78 | 4.5 | pasa | texto sobre aurora (peor punto) |
| Galaxia (oscuro) | `--text-muted` #A0B8BF | `--@hero-peak-light` #173F66 | 5.21 | 4.5 | pasa | bajada sobre aurora (peor punto) |
| Galaxia (oscuro) | `--text-muted` #A0B8BF | `--@hero-peak-dark` #040812 | 9.63 | 4.5 | pasa | bajada sobre aurora (peor punto) |
| Galaxia (oscuro) | `--text-muted` #A0B8BF | `--@cta-peak-light` #19446B | 4.86 | 4.5 | pasa | bajada sobre aurora (peor punto) |
| Galaxia (oscuro) | `--text-muted` #A0B8BF | `--@cta-peak-dark` #040812 | 9.63 | 4.5 | pasa | bajada sobre aurora (peor punto) |
| Galaxia (oscuro) | `--text-muted` #A0B8BF | `--@soft-peak-light` #102C48 | 6.85 | 4.5 | pasa | bajada sobre aurora (peor punto) |
| Galaxia (oscuro) | `--text-muted` #A0B8BF | `--@soft-peak-dark` #040812 | 9.63 | 4.5 | pasa | bajada sobre aurora (peor punto) |
| Galaxia (oscuro) | `--text-muted` #A0B8BF | `--@live-peak-light` #0D3939 | 6.08 | 4.5 | pasa | bajada sobre aurora (peor punto) |
| Galaxia (oscuro) | `--text-muted` #A0B8BF | `--@live-peak-dark` #091224 | 8.99 | 4.5 | pasa | bajada sobre aurora (peor punto) |
| Galaxia (oscuro) | `--text-muted` #A0B8BF | `--@galaxy-peak-light` #173F66 | 5.21 | 4.5 | pasa | bajada sobre aurora (peor punto) |
| Galaxia (oscuro) | `--text-muted` #A0B8BF | `--@galaxy-peak-dark` #040812 | 9.63 | 4.5 | pasa | bajada sobre aurora (peor punto) |
| Galaxia (oscuro) | `--link` #2EE6C5 | `--@hero-peak-light` #173F66 | 6.83 | 4.5 | pasa | link sobre aurora |
| Galaxia (oscuro) | `--link` #2EE6C5 | `--@hero-peak-dark` #040812 | 12.63 | 4.5 | pasa | link sobre aurora |
| Galaxia (oscuro) | `--link` #2EE6C5 | `--@cta-peak-light` #19446B | 6.36 | 4.5 | pasa | link sobre aurora |
| Galaxia (oscuro) | `--link` #2EE6C5 | `--@cta-peak-dark` #040812 | 12.63 | 4.5 | pasa | link sobre aurora |
| Galaxia (oscuro) | `--btn-bg` #27C9AD | `--@hero-peak-light` #173F66 | 5.18 | 3 | pasa | botón primario sobre aurora |
| Galaxia (oscuro) | `--btn-bg` #27C9AD | `--@hero-peak-dark` #040812 | 9.58 | 3 | pasa | botón primario sobre aurora |
| Galaxia (oscuro) | `--btn-bg` #27C9AD | `--@cta-peak-light` #19446B | 4.83 | 3 | pasa | botón primario sobre aurora |
| Galaxia (oscuro) | `--btn-bg` #27C9AD | `--@cta-peak-dark` #040812 | 9.58 | 3 | pasa | botón primario sobre aurora |
| Galaxia (oscuro) | `--btn2-border` #7A9F98 | `--@hero-peak-light` #173F66 | 3.73 | 3 | pasa | borde botón secundario sobre aurora |
| Galaxia (oscuro) | `--btn2-border` #7A9F98 | `--@hero-peak-dark` #040812 | 6.90 | 3 | pasa | borde botón secundario sobre aurora |
| Galaxia (oscuro) | `--btn2-border` #7A9F98 | `--@cta-peak-light` #19446B | 3.48 | 3 | pasa | borde botón secundario sobre aurora |
| Galaxia (oscuro) | `--btn2-border` #7A9F98 | `--@cta-peak-dark` #040812 | 6.90 | 3 | pasa | borde botón secundario sobre aurora |
| Galaxia (oscuro) | `--pulse-ring` #2EE6C5 | `--bg` #040812 | 12.63 | 3 | pasa | anillo de pulso (gráfico) |
| Galaxia (oscuro) | `--pulse-ring` #2EE6C5 | `--bg-2` #070D1A | 12.24 | 3 | pasa | anillo de pulso (gráfico) |
| Galaxia (oscuro) | `--pulse-core` #7FFFE1 | `--bg` #040812 | 16.49 | 3 | pasa | nodo de señal (gráfico) |
| Galaxia (oscuro) | `--pulse-core` #7FFFE1 | `--bg-2` #070D1A | 15.99 | 3 | pasa | nodo de señal (gráfico) |
| Galaxia (oscuro) | `--text` #E8F4F1 | `--nav-bg-solid` #0B1422 | 16.39 | 4.5 | pasa | nav / teléfono sin backdrop-filter |
| Galaxia (oscuro) | `--text` #E8F4F1 | `--glass-solid` #0B1422 | 16.39 | 4.5 | pasa | nav / teléfono sin backdrop-filter |
| Galaxia (oscuro) | `--glass-border` #2A4152 | `--@galaxy-peak-dark` #040812 | 1.88 | 1.5 | pasa | borde del vidrio (decorativo) |
| Galaxia (oscuro) | `--glass-border` #2A4152 | `--bg` #040812 | 1.88 | 1.5 | pasa | borde del vidrio (decorativo) |
| Galaxia (oscuro) | `--btn-bg` #27C9AD | `--@glass-worst-light` #102235 | 7.71 | 3 | pasa | botón primario dentro de la nav |
| Galaxia (oscuro) | `--btn-bg` #27C9AD | `--@glass-worst-dark` #09101D | 9.10 | 3 | pasa | botón primario dentro de la nav |
| Galaxia (oscuro) | `--shop-price-1` #3FA898 | `--shop-1` #060C18 | 6.77 | 4.5 | pasa | precio acto 1 |
| Galaxia (oscuro) | `--shop-price-2` #2EE6C5 | `--shop-2` #081822 | 11.37 | 4.5 | pasa | precio acto 2 |
| Galaxia (oscuro) | `--shop-price-3` #7FFFE1 | `--shop-3` #0B2629 | 13.07 | 3 | pasa | precio acto 3 (gigante) |
| Galaxia (oscuro) | `--btn-text` #031412 | `--aqua-fill` #27C9AD | 9.03 | 4.5 | pasa | texto sobre relleno de control |
| Galaxia (oscuro) | `--ink` #0F2B4A | `--paper` #E4EEEB | 12.10 | 4.5 | pasa | informe: tinta sobre papel / resaltador |
| Galaxia (oscuro) | `--ink` #0F2B4A | `--highlight` #A8F2E0 | 11.23 | 4.5 | pasa | informe: tinta sobre papel / resaltador |
| Galaxia (oscuro) | `--ink-muted` #4A5F72 | `--paper` #E4EEEB | 5.59 | 4.5 | pasa | informe: texto secundario |
| Galaxia (oscuro) | `--ink-muted` #4A5F72 | `--highlight` #A8F2E0 | 5.19 | 4.5 | pasa | informe: texto secundario |
| Galaxia (oscuro) | `--pen` #B0213F | `--paper` #E4EEEB | 5.65 | 4.5 | pasa | informe: birome sobre papel / resaltador |
| Galaxia (oscuro) | `--pen` #B0213F | `--highlight` #A8F2E0 | 5.24 | 4.5 | pasa | informe: birome sobre papel / resaltador |
| Galaxia (oscuro) | `--on-aqua` #031412 | `--aqua` #2EE6C5 | 11.90 | 4.5 | pasa | texto sobre relleno aqua |
| Galaxia (oscuro) | `--on-aqua-soft` #031412 | `--aqua-soft` #7FFFE1 | 15.54 | 4.5 | pasa | texto sobre aqua-soft |
| Galaxia (oscuro) | `--on-ink` #E8F4F1 | `--ink-blue` #0F2B4A | 12.73 | 4.5 | pasa | texto sobre tinta |
| Galaxia (oscuro) | `--on-ink` #E8F4F1 | `--ink-blue-2` #16406B | 9.42 | 4.5 | pasa | texto sobre tinta |
| Galaxia (oscuro) | `--on-ink` #E8F4F1 | `--aqua-deep` #0E7C6B | 4.53 | 4.5 | pasa | texto sobre tinta |
| Amanecer orbital (claro) | `--text` #06201C | `--bg` #F2F9FA | 16.01 | 4.5 | pasa | texto principal (incluye vidrio cósmico) |
| Amanecer orbital (claro) | `--text` #06201C | `--bg-2` #E7F3F6 | 15.07 | 4.5 | pasa | texto principal (incluye vidrio cósmico) |
| Amanecer orbital (claro) | `--text` #06201C | `--surface` #FBFEFD | 16.81 | 4.5 | pasa | texto principal (incluye vidrio cósmico) |
| Amanecer orbital (claro) | `--text` #06201C | `--surface-2` #E1F0F3 | 14.59 | 4.5 | pasa | texto principal (incluye vidrio cósmico) |
| Amanecer orbital (claro) | `--text` #06201C | `--shop-1` #F2F9FA | 16.01 | 4.5 | pasa | texto principal (incluye vidrio cósmico) |
| Amanecer orbital (claro) | `--text` #06201C | `--shop-2` #E0F3F0 | 14.82 | 4.5 | pasa | texto principal (incluye vidrio cósmico) |
| Amanecer orbital (claro) | `--text` #06201C | `--shop-3` #CCECE6 | 13.57 | 4.5 | pasa | texto principal (incluye vidrio cósmico) |
| Amanecer orbital (claro) | `--text` #06201C | `--@glass-worst-light` #FBFEFD | 16.81 | 4.5 | pasa | texto principal (incluye vidrio cósmico) |
| Amanecer orbital (claro) | `--text` #06201C | `--@glass-worst-dark` #E2F1F6 | 14.74 | 4.5 | pasa | texto principal (incluye vidrio cósmico) |
| Amanecer orbital (claro) | `--text-muted` #3D5A5E | `--bg` #F2F9FA | 6.98 | 4.5 | pasa | texto secundario (incluye vidrio cósmico) |
| Amanecer orbital (claro) | `--text-muted` #3D5A5E | `--bg-2` #E7F3F6 | 6.57 | 4.5 | pasa | texto secundario (incluye vidrio cósmico) |
| Amanecer orbital (claro) | `--text-muted` #3D5A5E | `--surface` #FBFEFD | 7.33 | 4.5 | pasa | texto secundario (incluye vidrio cósmico) |
| Amanecer orbital (claro) | `--text-muted` #3D5A5E | `--surface-2` #E1F0F3 | 6.36 | 4.5 | pasa | texto secundario (incluye vidrio cósmico) |
| Amanecer orbital (claro) | `--text-muted` #3D5A5E | `--shop-1` #F2F9FA | 6.98 | 4.5 | pasa | texto secundario (incluye vidrio cósmico) |
| Amanecer orbital (claro) | `--text-muted` #3D5A5E | `--shop-2` #E0F3F0 | 6.47 | 4.5 | pasa | texto secundario (incluye vidrio cósmico) |
| Amanecer orbital (claro) | `--text-muted` #3D5A5E | `--shop-3` #CCECE6 | 5.92 | 4.5 | pasa | texto secundario (incluye vidrio cósmico) |
| Amanecer orbital (claro) | `--text-muted` #3D5A5E | `--@glass-worst-light` #FBFEFD | 7.33 | 4.5 | pasa | texto secundario (incluye vidrio cósmico) |
| Amanecer orbital (claro) | `--text-muted` #3D5A5E | `--@glass-worst-dark` #E2F1F6 | 6.43 | 4.5 | pasa | texto secundario (incluye vidrio cósmico) |
| Amanecer orbital (claro) | `--link` #066656 | `--bg` #F2F9FA | 6.48 | 4.5 | pasa | links |
| Amanecer orbital (claro) | `--link` #066656 | `--bg-2` #E7F3F6 | 6.10 | 4.5 | pasa | links |
| Amanecer orbital (claro) | `--link` #066656 | `--surface` #FBFEFD | 6.80 | 4.5 | pasa | links |
| Amanecer orbital (claro) | `--link` #066656 | `--surface-2` #E1F0F3 | 5.90 | 4.5 | pasa | links |
| Amanecer orbital (claro) | `--link` #066656 | `--shop-1` #F2F9FA | 6.48 | 4.5 | pasa | links |
| Amanecer orbital (claro) | `--link` #066656 | `--shop-2` #E0F3F0 | 6.00 | 4.5 | pasa | links |
| Amanecer orbital (claro) | `--link` #066656 | `--shop-3` #CCECE6 | 5.49 | 4.5 | pasa | links |
| Amanecer orbital (claro) | `--link-hover` #054D42 | `--bg` #F2F9FA | 9.18 | 4.5 | pasa | link en hover |
| Amanecer orbital (claro) | `--link-hover` #054D42 | `--bg-2` #E7F3F6 | 8.64 | 4.5 | pasa | link en hover |
| Amanecer orbital (claro) | `--link-hover` #054D42 | `--surface` #FBFEFD | 9.64 | 4.5 | pasa | link en hover |
| Amanecer orbital (claro) | `--link-hover` #054D42 | `--surface-2` #E1F0F3 | 8.37 | 4.5 | pasa | link en hover |
| Amanecer orbital (claro) | `--text-faint` #688489 | `--bg` #F2F9FA | 3.75 | 3 | pasa | cotas decorativas (no informativo) |
| Amanecer orbital (claro) | `--text-faint` #688489 | `--bg-2` #E7F3F6 | 3.53 | 3 | pasa | cotas decorativas (no informativo) |
| Amanecer orbital (claro) | `--btn-text` #F3FAF8 | `--btn-bg` #066656 | 6.52 | 4.5 | pasa | texto de botón primario |
| Amanecer orbital (claro) | `--btn-text` #F3FAF8 | `--btn-bg-hover` #054D42 | 9.24 | 4.5 | pasa | texto de botón primario |
| Amanecer orbital (claro) | `--btn-bg` #066656 | `--bg` #F2F9FA | 6.48 | 3 | pasa | botón primario vs fondo (no-texto) |
| Amanecer orbital (claro) | `--btn-bg` #066656 | `--bg-2` #E7F3F6 | 6.10 | 3 | pasa | botón primario vs fondo (no-texto) |
| Amanecer orbital (claro) | `--btn-bg` #066656 | `--surface` #FBFEFD | 6.80 | 3 | pasa | botón primario vs fondo (no-texto) |
| Amanecer orbital (claro) | `--btn-bg` #066656 | `--surface-2` #E1F0F3 | 5.90 | 3 | pasa | botón primario vs fondo (no-texto) |
| Amanecer orbital (claro) | `--btn-bg` #066656 | `--shop-1` #F2F9FA | 6.48 | 3 | pasa | botón primario vs fondo (no-texto) |
| Amanecer orbital (claro) | `--btn-bg` #066656 | `--shop-2` #E0F3F0 | 6.00 | 3 | pasa | botón primario vs fondo (no-texto) |
| Amanecer orbital (claro) | `--btn-bg` #066656 | `--shop-3` #CCECE6 | 5.49 | 3 | pasa | botón primario vs fondo (no-texto) |
| Amanecer orbital (claro) | `--btn2-text` #06201C | `--bg` #F2F9FA | 16.01 | 4.5 | pasa | botón secundario |
| Amanecer orbital (claro) | `--btn2-text` #06201C | `--bg-2` #E7F3F6 | 15.07 | 4.5 | pasa | botón secundario |
| Amanecer orbital (claro) | `--btn2-text` #06201C | `--surface` #FBFEFD | 16.81 | 4.5 | pasa | botón secundario |
| Amanecer orbital (claro) | `--btn2-text` #06201C | `--surface-2` #E1F0F3 | 14.59 | 4.5 | pasa | botón secundario |
| Amanecer orbital (claro) | `--btn2-border` #4E6F69 | `--bg` #F2F9FA | 5.18 | 3 | pasa | borde de control |
| Amanecer orbital (claro) | `--btn2-border` #4E6F69 | `--bg-2` #E7F3F6 | 4.88 | 3 | pasa | borde de control |
| Amanecer orbital (claro) | `--btn2-border` #4E6F69 | `--surface` #FBFEFD | 5.44 | 3 | pasa | borde de control |
| Amanecer orbital (claro) | `--btn2-border` #4E6F69 | `--surface-2` #E1F0F3 | 4.72 | 3 | pasa | borde de control |
| Amanecer orbital (claro) | `--btn2-border` #4E6F69 | `--shop-1` #F2F9FA | 5.18 | 3 | pasa | borde de control |
| Amanecer orbital (claro) | `--btn2-border` #4E6F69 | `--shop-2` #E0F3F0 | 4.80 | 3 | pasa | borde de control |
| Amanecer orbital (claro) | `--btn2-border` #4E6F69 | `--shop-3` #CCECE6 | 4.39 | 3 | pasa | borde de control |
| Amanecer orbital (claro) | `--line-strong` #5B7E84 | `--bg` #F2F9FA | 4.14 | 3 | pasa | bordes de inputs/controles |
| Amanecer orbital (claro) | `--line-strong` #5B7E84 | `--bg-2` #E7F3F6 | 3.89 | 3 | pasa | bordes de inputs/controles |
| Amanecer orbital (claro) | `--line-strong` #5B7E84 | `--surface` #FBFEFD | 4.35 | 3 | pasa | bordes de inputs/controles |
| Amanecer orbital (claro) | `--line-strong` #5B7E84 | `--surface-2` #E1F0F3 | 3.77 | 3 | pasa | bordes de inputs/controles |
| Amanecer orbital (claro) | `--focus` #066656 | `--bg` #F2F9FA | 6.48 | 3 | pasa | anillo de foco |
| Amanecer orbital (claro) | `--focus` #066656 | `--bg-2` #E7F3F6 | 6.10 | 3 | pasa | anillo de foco |
| Amanecer orbital (claro) | `--focus` #066656 | `--surface` #FBFEFD | 6.80 | 3 | pasa | anillo de foco |
| Amanecer orbital (claro) | `--focus` #066656 | `--surface-2` #E1F0F3 | 5.90 | 3 | pasa | anillo de foco |
| Amanecer orbital (claro) | `--focus` #066656 | `--shop-1` #F2F9FA | 6.48 | 3 | pasa | anillo de foco |
| Amanecer orbital (claro) | `--focus` #066656 | `--shop-2` #E0F3F0 | 6.00 | 3 | pasa | anillo de foco |
| Amanecer orbital (claro) | `--focus` #066656 | `--shop-3` #CCECE6 | 5.49 | 3 | pasa | anillo de foco |
| Amanecer orbital (claro) | `--aqua` #0A8F79 | `--bg` #F2F9FA | 3.78 | 3 | pasa | aqua como relleno / gráfico |
| Amanecer orbital (claro) | `--aqua` #0A8F79 | `--bg-2` #E7F3F6 | 3.55 | 3 | pasa | aqua como relleno / gráfico |
| Amanecer orbital (claro) | `--aqua` #0A8F79 | `--surface` #FBFEFD | 3.97 | 3 | pasa | aqua como relleno / gráfico |
| Amanecer orbital (claro) | `--aqua` #0A8F79 | `--surface-2` #E1F0F3 | 3.44 | 3 | pasa | aqua como relleno / gráfico |
| Amanecer orbital (claro) | `--warn` #8A5300 | `--bg` #F2F9FA | 5.94 | 4.5 | pasa | aviso como texto |
| Amanecer orbital (claro) | `--warn` #8A5300 | `--bg-2` #E7F3F6 | 5.59 | 4.5 | pasa | aviso como texto |
| Amanecer orbital (claro) | `--warn` #8A5300 | `--surface` #FBFEFD | 6.24 | 4.5 | pasa | aviso como texto |
| Amanecer orbital (claro) | `--warn` #8A5300 | `--surface-2` #E1F0F3 | 5.41 | 4.5 | pasa | aviso como texto |
| Amanecer orbital (claro) | `--danger` #B3243F | `--bg` #F2F9FA | 6.08 | 4.5 | pasa | error como texto |
| Amanecer orbital (claro) | `--danger` #B3243F | `--bg-2` #E7F3F6 | 5.72 | 4.5 | pasa | error como texto |
| Amanecer orbital (claro) | `--danger` #B3243F | `--surface` #FBFEFD | 6.39 | 4.5 | pasa | error como texto |
| Amanecer orbital (claro) | `--danger` #B3243F | `--surface-2` #E1F0F3 | 5.54 | 4.5 | pasa | error como texto |
| Amanecer orbital (claro) | `--ok` #12703F | `--bg` #F2F9FA | 5.77 | 4.5 | pasa | ok como texto |
| Amanecer orbital (claro) | `--ok` #12703F | `--bg-2` #E7F3F6 | 5.43 | 4.5 | pasa | ok como texto |
| Amanecer orbital (claro) | `--ok` #12703F | `--surface` #FBFEFD | 6.06 | 4.5 | pasa | ok como texto |
| Amanecer orbital (claro) | `--ok` #12703F | `--surface-2` #E1F0F3 | 5.26 | 4.5 | pasa | ok como texto |
| Amanecer orbital (claro) | `--note` #B3243F | `--bg` #F2F9FA | 6.08 | 4.5 | pasa | anotación Kalam |
| Amanecer orbital (claro) | `--note` #B3243F | `--bg-2` #E7F3F6 | 5.72 | 4.5 | pasa | anotación Kalam |
| Amanecer orbital (claro) | `--note` #B3243F | `--surface` #FBFEFD | 6.39 | 4.5 | pasa | anotación Kalam |
| Amanecer orbital (claro) | `--selection-text` #06201C | `--selection-bg` #BFEDE2 | 13.34 | 4.5 | pasa | texto seleccionado |
| Amanecer orbital (claro) | `--bubble-in-text` #06201C | `--bubble-in` #FBFEFD | 16.81 | 4.5 | pasa | burbuja cliente |
| Amanecer orbital (claro) | `--bubble-out-text` #06201C | `--bubble-out` #DCEBF7 | 14.03 | 4.5 | pasa | burbuja bot |
| Amanecer orbital (claro) | `--bubble-meta` #4A6661 | `--bubble-in` #FBFEFD | 6.15 | 4.5 | pasa | hora / escribiendo… |
| Amanecer orbital (claro) | `--bubble-meta` #4A6661 | `--bubble-out` #DCEBF7 | 5.13 | 4.5 | pasa | hora / escribiendo… |
| Amanecer orbital (claro) | `--bubble-meta` #4A6661 | `--bot-screen` #E7F3F6 | 5.51 | 4.5 | pasa | hora / escribiendo… |
| Amanecer orbital (claro) | `--tick-read` #066656 | `--bubble-in` #FBFEFD | 6.80 | 3 | pasa | tick leído (ícono) |
| Amanecer orbital (claro) | `--tick-read` #066656 | `--bubble-out` #DCEBF7 | 5.68 | 3 | pasa | tick leído (ícono) |
| Amanecer orbital (claro) | `--handoff` #8A5300 | `--bot-screen` #E7F3F6 | 5.59 | 4.5 | pasa | handoff a persona |
| Amanecer orbital (claro) | `--handoff` #8A5300 | `--bubble-out` #DCEBF7 | 5.20 | 4.5 | pasa | handoff a persona |
| Amanecer orbital (claro) | `--chip-text` #06201C | `--chip-bg` #FBFEFD | 16.81 | 4.5 | pasa | chip de escenario |
| Amanecer orbital (claro) | `--chip-active-text` #FBFEFD | `--chip-active-bg` #066656 | 6.80 | 4.5 | pasa | chip activo |
| Amanecer orbital (claro) | `--chip-border` #5B7E84 | `--bot-screen` #E7F3F6 | 3.89 | 3 | pasa | borde de chip |
| Amanecer orbital (claro) | `--chip-border` #5B7E84 | `--bg` #F2F9FA | 4.14 | 3 | pasa | borde de chip |
| Amanecer orbital (claro) | `--chip-border` #5B7E84 | `--surface` #FBFEFD | 4.35 | 3 | pasa | borde de chip |
| Amanecer orbital (claro) | `--text` #06201C | `--bot-header` #FBFEFD | 16.81 | 4.5 | pasa | texto en el teléfono |
| Amanecer orbital (claro) | `--text` #06201C | `--bot-screen` #E7F3F6 | 15.07 | 4.5 | pasa | texto en el teléfono |
| Amanecer orbital (claro) | `--shop-price` #066656 | `--shop-1` #F2F9FA | 6.48 | 3 | pasa | precio gigante (texto grande) |
| Amanecer orbital (claro) | `--shop-price` #066656 | `--shop-2` #E0F3F0 | 6.00 | 3 | pasa | precio gigante (texto grande) |
| Amanecer orbital (claro) | `--shop-price` #066656 | `--shop-3` #CCECE6 | 5.49 | 3 | pasa | precio gigante (texto grande) |
| Amanecer orbital (claro) | `--shop-price` #066656 | `--shop-1` #F2F9FA | 6.48 | 4.5 | pasa | precio (si se usa chico) |
| Amanecer orbital (claro) | `--shop-price` #066656 | `--shop-2` #E0F3F0 | 6.00 | 4.5 | pasa | precio (si se usa chico) |
| Amanecer orbital (claro) | `--shop-price` #066656 | `--shop-3` #CCECE6 | 5.49 | 4.5 | pasa | precio (si se usa chico) |
| Amanecer orbital (claro) | `--shop-price-premium` #0A8F79 | `--shop-3` #CCECE6 | 3.20 | 3 | pasa | precio premium (grande) |
| Amanecer orbital (claro) | `--badge-text` #021010 | `--badge-bg` #0A8F79 | 4.81 | 4.5 | pasa | badge Más elegido |
| Amanecer orbital (claro) | `--cta-text` #06201C | `--bg` #F2F9FA | 16.01 | 4.5 | pasa | CTA final sobre su fondo base |
| Amanecer orbital (claro) | `--cta-text` #06201C | `--bg-2` #E7F3F6 | 15.07 | 4.5 | pasa | CTA final sobre su fondo base |
| Amanecer orbital (claro) | `--demo-label` #8A5300 | `--surface` #FBFEFD | 6.24 | 4.5 | pasa | rótulo Demo |
| Amanecer orbital (claro) | `--demo-label` #8A5300 | `--bot-screen` #E7F3F6 | 5.59 | 4.5 | pasa | rótulo Demo |
| Amanecer orbital (claro) | `--demo-label` #8A5300 | `--bg` #F2F9FA | 5.94 | 4.5 | pasa | rótulo Demo |
| Amanecer orbital (claro) | `--text` #06201C | `--@hero-peak-light` #F2F9FA | 16.01 | 4.5 | pasa | texto sobre aurora (peor punto) |
| Amanecer orbital (claro) | `--text` #06201C | `--@hero-peak-dark` #B2D7EB | 11.22 | 4.5 | pasa | texto sobre aurora (peor punto) |
| Amanecer orbital (claro) | `--text` #06201C | `--@cta-peak-light` #E7F3F6 | 15.07 | 4.5 | pasa | texto sobre aurora (peor punto) |
| Amanecer orbital (claro) | `--text` #06201C | `--@cta-peak-dark` #B2D9EC | 11.40 | 4.5 | pasa | texto sobre aurora (peor punto) |
| Amanecer orbital (claro) | `--text` #06201C | `--@soft-peak-light` #F2F9FA | 16.01 | 4.5 | pasa | texto sobre aurora (peor punto) |
| Amanecer orbital (claro) | `--text` #06201C | `--@soft-peak-dark` #C2E0F0 | 12.36 | 4.5 | pasa | texto sobre aurora (peor punto) |
| Amanecer orbital (claro) | `--text` #06201C | `--@live-peak-light` #E3EFF8 | 14.60 | 4.5 | pasa | texto sobre aurora (peor punto) |
| Amanecer orbital (claro) | `--text` #06201C | `--@live-peak-dark` #CDE1F1 | 12.70 | 4.5 | pasa | texto sobre aurora (peor punto) |
| Amanecer orbital (claro) | `--text` #06201C | `--@galaxy-peak-light` #F2F9FA | 16.01 | 4.5 | pasa | texto sobre aurora (peor punto) |
| Amanecer orbital (claro) | `--text` #06201C | `--@galaxy-peak-dark` #B2D7EB | 11.22 | 4.5 | pasa | texto sobre aurora (peor punto) |
| Amanecer orbital (claro) | `--text-muted` #3D5A5E | `--@hero-peak-light` #F2F9FA | 6.98 | 4.5 | pasa | bajada sobre aurora (peor punto) |
| Amanecer orbital (claro) | `--text-muted` #3D5A5E | `--@hero-peak-dark` #B2D7EB | 4.89 | 4.5 | pasa | bajada sobre aurora (peor punto) |
| Amanecer orbital (claro) | `--text-muted` #3D5A5E | `--@cta-peak-light` #E7F3F6 | 6.57 | 4.5 | pasa | bajada sobre aurora (peor punto) |
| Amanecer orbital (claro) | `--text-muted` #3D5A5E | `--@cta-peak-dark` #B2D9EC | 4.97 | 4.5 | pasa | bajada sobre aurora (peor punto) |
| Amanecer orbital (claro) | `--text-muted` #3D5A5E | `--@soft-peak-light` #F2F9FA | 6.98 | 4.5 | pasa | bajada sobre aurora (peor punto) |
| Amanecer orbital (claro) | `--text-muted` #3D5A5E | `--@soft-peak-dark` #C2E0F0 | 5.39 | 4.5 | pasa | bajada sobre aurora (peor punto) |
| Amanecer orbital (claro) | `--text-muted` #3D5A5E | `--@live-peak-light` #E3EFF8 | 6.37 | 4.5 | pasa | bajada sobre aurora (peor punto) |
| Amanecer orbital (claro) | `--text-muted` #3D5A5E | `--@live-peak-dark` #CDE1F1 | 5.54 | 4.5 | pasa | bajada sobre aurora (peor punto) |
| Amanecer orbital (claro) | `--text-muted` #3D5A5E | `--@galaxy-peak-light` #F2F9FA | 6.98 | 4.5 | pasa | bajada sobre aurora (peor punto) |
| Amanecer orbital (claro) | `--text-muted` #3D5A5E | `--@galaxy-peak-dark` #B2D7EB | 4.89 | 4.5 | pasa | bajada sobre aurora (peor punto) |
| Amanecer orbital (claro) | `--link` #066656 | `--@hero-peak-light` #F2F9FA | 6.48 | 4.5 | pasa | link sobre aurora |
| Amanecer orbital (claro) | `--link` #066656 | `--@hero-peak-dark` #B2D7EB | 4.54 | 4.5 | pasa | link sobre aurora |
| Amanecer orbital (claro) | `--link` #066656 | `--@cta-peak-light` #E7F3F6 | 6.10 | 4.5 | pasa | link sobre aurora |
| Amanecer orbital (claro) | `--link` #066656 | `--@cta-peak-dark` #B2D9EC | 4.61 | 4.5 | pasa | link sobre aurora |
| Amanecer orbital (claro) | `--btn-bg` #066656 | `--@hero-peak-light` #F2F9FA | 6.48 | 3 | pasa | botón primario sobre aurora |
| Amanecer orbital (claro) | `--btn-bg` #066656 | `--@hero-peak-dark` #B2D7EB | 4.54 | 3 | pasa | botón primario sobre aurora |
| Amanecer orbital (claro) | `--btn-bg` #066656 | `--@cta-peak-light` #E7F3F6 | 6.10 | 3 | pasa | botón primario sobre aurora |
| Amanecer orbital (claro) | `--btn-bg` #066656 | `--@cta-peak-dark` #B2D9EC | 4.61 | 3 | pasa | botón primario sobre aurora |
| Amanecer orbital (claro) | `--btn2-border` #4E6F69 | `--@hero-peak-light` #F2F9FA | 5.18 | 3 | pasa | borde botón secundario sobre aurora |
| Amanecer orbital (claro) | `--btn2-border` #4E6F69 | `--@hero-peak-dark` #B2D7EB | 3.63 | 3 | pasa | borde botón secundario sobre aurora |
| Amanecer orbital (claro) | `--btn2-border` #4E6F69 | `--@cta-peak-light` #E7F3F6 | 4.88 | 3 | pasa | borde botón secundario sobre aurora |
| Amanecer orbital (claro) | `--btn2-border` #4E6F69 | `--@cta-peak-dark` #B2D9EC | 3.69 | 3 | pasa | borde botón secundario sobre aurora |
| Amanecer orbital (claro) | `--pulse-ring` #0A8F79 | `--bg` #F2F9FA | 3.78 | 3 | pasa | anillo de pulso (gráfico) |
| Amanecer orbital (claro) | `--pulse-ring` #0A8F79 | `--bg-2` #E7F3F6 | 3.55 | 3 | pasa | anillo de pulso (gráfico) |
| Amanecer orbital (claro) | `--pulse-core` #066656 | `--bg` #F2F9FA | 6.48 | 3 | pasa | nodo de señal (gráfico) |
| Amanecer orbital (claro) | `--pulse-core` #066656 | `--bg-2` #E7F3F6 | 6.10 | 3 | pasa | nodo de señal (gráfico) |
| Amanecer orbital (claro) | `--text` #06201C | `--nav-bg-solid` #FBFEFD | 16.81 | 4.5 | pasa | nav / teléfono sin backdrop-filter |
| Amanecer orbital (claro) | `--text` #06201C | `--glass-solid` #FBFEFD | 16.81 | 4.5 | pasa | nav / teléfono sin backdrop-filter |
| Amanecer orbital (claro) | `--glass-border` #86ABB6 | `--@galaxy-peak-dark` #B2D7EB | 1.62 | 1.5 | pasa | borde del vidrio (decorativo) |
| Amanecer orbital (claro) | `--glass-border` #86ABB6 | `--bg` #F2F9FA | 2.31 | 1.5 | pasa | borde del vidrio (decorativo) |
| Amanecer orbital (claro) | `--btn-bg` #066656 | `--@glass-worst-light` #FBFEFD | 6.80 | 3 | pasa | botón primario dentro de la nav |
| Amanecer orbital (claro) | `--btn-bg` #066656 | `--@glass-worst-dark` #E2F1F6 | 5.96 | 3 | pasa | botón primario dentro de la nav |
| Amanecer orbital (claro) | `--shop-price-1` #46766F | `--shop-1` #F2F9FA | 4.83 | 4.5 | pasa | precio acto 1 |
| Amanecer orbital (claro) | `--shop-price-2` #066656 | `--shop-2` #E0F3F0 | 6.00 | 4.5 | pasa | precio acto 2 |
| Amanecer orbital (claro) | `--shop-price-3` #0A8F79 | `--shop-3` #CCECE6 | 3.20 | 3 | pasa | precio acto 3 (gigante) |
| Amanecer orbital (claro) | `--btn-text` #F3FAF8 | `--aqua-fill` #066656 | 6.52 | 4.5 | pasa | texto sobre relleno de control |
| Amanecer orbital (claro) | `--ink` #0F2B4A | `--paper` #F7FBF9 | 13.74 | 4.5 | pasa | informe: tinta sobre papel / resaltador |
| Amanecer orbital (claro) | `--ink` #0F2B4A | `--highlight` #B5F5E6 | 11.72 | 4.5 | pasa | informe: tinta sobre papel / resaltador |
| Amanecer orbital (claro) | `--ink-muted` #4A5F72 | `--paper` #F7FBF9 | 6.35 | 4.5 | pasa | informe: texto secundario |
| Amanecer orbital (claro) | `--ink-muted` #4A5F72 | `--highlight` #B5F5E6 | 5.41 | 4.5 | pasa | informe: texto secundario |
| Amanecer orbital (claro) | `--pen` #B0213F | `--paper` #F7FBF9 | 6.42 | 4.5 | pasa | informe: birome sobre papel / resaltador |
| Amanecer orbital (claro) | `--pen` #B0213F | `--highlight` #B5F5E6 | 5.48 | 4.5 | pasa | informe: birome sobre papel / resaltador |
| Amanecer orbital (claro) | `--on-aqua` #021010 | `--aqua` #0A8F79 | 4.81 | 4.5 | pasa | texto sobre relleno aqua |
| Amanecer orbital (claro) | `--on-aqua-soft` #031412 | `--aqua-soft` #2EE6C5 | 11.90 | 4.5 | pasa | texto sobre aqua-soft |
| Amanecer orbital (claro) | `--on-ink` #F3FAF8 | `--ink-blue` #0F2B4A | 13.55 | 4.5 | pasa | texto sobre tinta |
| Amanecer orbital (claro) | `--on-ink` #F3FAF8 | `--ink-blue-2` #16406B | 10.02 | 4.5 | pasa | texto sobre tinta |
| Amanecer orbital (claro) | `--on-ink` #F3FAF8 | `--aqua-deep` #054D42 | 9.24 | 4.5 | pasa | texto sobre tinta |
