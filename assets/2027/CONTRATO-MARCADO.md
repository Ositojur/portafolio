# Contrato de marcado · Portafolio 2027

Dueño: agente 02 (contenido, arquitectura y datos).
Archivos de marcado: `index.html`, `servicio.html`, `en/index.html`, `en/servicio.html`.
Datos: `assets/2027/config.js` (contacto) y `assets/2027/productos.js` (tienda).

La regla: **03 a 08 no editan el HTML.** Todo lo que necesitan está en este contrato como clase,
ID o `data-*`. Si falta un gancho, pedíselo a 02 y lo agrega en los cuatro HTML a la vez.

ES y EN tienen el mismo marcado, los mismos IDs y los mismos valores de `data-*`
(los valores son claves internas en español: `data-kind="tienda"`, `data-bot-scenario="alquiler"`).
Solo cambian los textos y las rutas (`en/` usa `../`).

---

## 1. Reglas generales

1. **Sin JS el sitio está completo.** Nada se oculta con CSS salvo con `html.js` (lo pone un script
   inline del `<head>`). Mejor todavía: estados iniciales de animación con `gsap.set()` / `from()`
   en JS. Si CSS necesita un estado inicial oculto, que sea bajo `html.ld-motion`, una clase que
   agrega `motion.js` al arrancar y saca si algo falla. Si GSAP no cargó, todo se ve.
2. **`hidden` en el HTML = solo con JS.** Los filtros de trabajos, los chips y los controles de la
   demo vienen con `hidden`. El dueño (07 / 06) les saca `hidden` al iniciar.
3. **Reduced motion.** Con `prefers-reduced-motion: reduce` no hay scrub, pin, parallax ni 3D animado.
   El contenido queda en su estado final.
4. **Tema.** `<html data-theme="dark|light">`. El script inline lee `localStorage["ld-theme"]`
   (`LD_CONFIG.STORAGE_THEME_KEY`). Sin atributo manda `prefers-color-scheme`. Lo escribe solo 07.
5. **Idioma.** Leelo de `document.documentElement.lang` (`es-AR` o `en`), o con `LD_CONFIG.lang()`.
   Los textos que cambia JS vienen en el propio elemento como `data-label-*`. Usalos en vez de
   escribir strings en el JS.
6. **Orden de scripts** (todos `defer`, rutas relativas, funciona por `file://`):
   `config.js` → `productos.js` → GSAP (`gsap`, `ScrollTrigger`, `SplitText`, `Flip`,
   `DrawSVGPlugin`, `MotionPathPlugin`, `CustomEase`, `ScrambleTextPlugin`) → `motion.js` → `hero3d.js` → `chatbot-guiones.js` (06) → `chatbot-demo.js` → `ui.js` → `tienda.js` → `assets/plano.js`.
   `three-hero.iife.js` NO va como `<script>`: lo carga `hero3d.js` en forma lazy (después del load,
   solo con WebGL2 y sin reduced-motion).
   `servicio.html` no carga `productos.js`, three, `hero3d.js` ni `tienda.js`.
7. **CSS en el `<head>`**: `tokens.css`, `scenes.css`, `ui.css`, `chatbot-demo.css`, `tienda.css`
   (servicio sin `tienda.css`). Las fuentes las declara `tokens.css`. **`plano.css` ya no se carga**:
   03 tiene que portar a `scenes.css` los estilos del plano y del informe (ver sección 5).

---

## 2. Escenas

Cada sección es `<section class="scene scene--<nombre>" id="…" data-scene="<nombre>">`
con uno o más `.scene-inner` adentro. Las escenas pinneadas tienen un hijo marcado con `pin`.

| Orden | `id` | `data-scene` | `data-moment` | Qué hay |
|---|---|---|---|---|
| 1 | `inicio` | `hero` | `hero` | `[data-3d="hero"]`, `.hero-signal`, `h1`, `.hero-clock` |
| 2 | `stack` | `stack` | | `[data-marquee]` cinta del stack real |
| 3 | `chatbots` | `chatbots` | `bot` | `.scene-pin` con `[data-bot-demo]` + `.feature-list`, `.own-bot` |
| 4 | `web` | `web` | | `[data-web-stack]` capturas apiladas, `.kind-list` |
| 5 | `sistemas` | `sistemas` | | `[data-diagram="sistemas"]` |
| 6 | `trabajos` | `trabajos` | | `[data-work-filter]`, `[data-work-track]` con 14 `.work-item` |
| 7 | `tienda` | `tienda` | `showroom` | `[data-shop]` |
| 8 | `seguridad` | `seguridad` | | `[data-plan]` + `[data-report]` |
| 9 | `proceso` | `proceso` | | `.steps` (6) + `[data-process-line]` |
| 10 | `sobre-mi` | `sobre` | | `.about-copy` + `.ficha` |
| 11 | `contacto` | `cta` | `cta` | `.cta-giant`, botones, `.titleblock` |

`data-moment` marca los 4 momentos firma que definió 01 (hero 3D, demo bot, showroom, CTA final).

`servicio.html`: `inicio` (`hero`, sin 3D, clase extra `scene--meet`) · `hago` (`offer`) ·
`demo` (`chatbots`, mismo marcado de la demo) · `como` (`proceso`) · `casos` · `alcance` · `preguntas` (`faq`) ·
`contacto` (`cta`).

Capas de fondo: `<div class="scene-bg" data-anim="parallax-depth" data-depth="-0.3" aria-hidden="true">`
en chatbots, sistemas, seguridad (`scene-bg--grid`: la retícula del plano como textura) y CTA.
Están vacías: 03 las pinta (aurora, retícula, grano) con tokens, 04 las mueve.

Renders de escena (05): `<div class="scene-render" data-render="<escena>" aria-hidden="true">` con un
`<picture>` (`<source media="(prefers-color-scheme: light)" srcset="media/renders/<escena>-light.webp">` +
`<img src="media/renders/<escena>.webp" alt="" width="1200" height="900" loading="lazy">`). Es hijo directo de la
`<section>`, justo después de `.scene-bg` (o primer hijo si no hay). Decorativo: alt vacío y `aria-hidden`.
Dónde: `#chatbots` (`chatbots`), `#web` (`web`), `#sistemas` (`sistemas`), `#tienda` (`tienda`), `#seguridad`
(`seguridad`), `#contacto` (`cta`); en servicio, `#demo` (`chatbots`). 03 lo ubica y 04 puede moverlo con parallax.
El `<source>` sigue el tema del sistema, no el toggle: si se quiere que siga a `data-theme`, ui.js cambia el `media`
o el `srcset` al cambiar el tema (lo mismo que el fallback del hero).

---

## 3. Vocabulario `data-anim` (dueño: 04, salvo donde se indica)

`data-anim` es una **lista de tokens separados por espacio**. Seleccioná con `[data-anim~="token"]`,
nunca con `=`. Un elemento puede tener varios: `data-anim="scale-text split-chars"`.

| Token | Dónde está | Qué espera la coreografía |
|---|---|---|
| `split-lines` | `h1`, todos los `h2` de escena | SplitText por líneas con máscara (mask reveal). Hero: 1,2–1,6 s |
| `split-chars` | `.cta-giant` | SplitText por caracteres. Se combina con `scale-text` |
| `scramble` | `.eyebrow`, `.giant-clock` ("03:12") | ScrambleText sobre el texto que ya tiene |
| `mask-reveal` | ledes, párrafos, `.work-media`, `.own-bot`, `.case-media` | Revelado con `clip-path` (no fade-up) |
| `stagger-list` | `.actions` del hero, `.feature-list`, `.kind-list`, `.services`, `.steps`, `.ficha`, `.titleblock`, `.offer-list`, `.case-list`, `.faq-list` | Los hijos directos entran escalonados |
| `scale-text` | `.cta-giant` | Texto gigante que escala con el scroll |
| `marquee` | `[data-marquee]` | Cinta infinita. Duplicá `[data-marquee-track]` en JS con `aria-hidden="true"` e `inert` en la copia |
| `draw` | `[data-diagram]`, `[data-process-line]`, `.work-media--draw` (NextScene) | DrawSVG de los trazos |
| `count` | `.hero-clock span` (24 y 7), `.step-n` | Contador de `data-count-from` (0 por defecto) a `data-count-to`. El texto final ya está escrito |
| `stack-3d` | `[data-web-stack]` | Las `[data-web-shot]` se apilan en 3D con `perspective`. Profundidad en `data-depth` (0–3) |
| `pin` | `.scene-pin` de chatbots, `[data-diagram]`, `[data-work-track]` | ScrollTrigger pin. Largo en `data-pin-length` (`160%`, `120%`). Solo desktop si en mobile molesta |
| `horizontal` | `[data-work-track]` (junto con `pin`) | Scroll horizontal pinneado de `[data-work-list]` en desktop. En mobile: carrusel snap de 03, sin JS |
| `parallax-depth` | `.hero-signal li`, `.scene-bg` | Parallax según `data-depth` (negativo = más lejos, va más lento) |
| `magnetic` | CTAs principales | **Dueño: 07.** Botón magnético solo con `pointer: fine` |
| `cue` | `.scroll-cue` del hero | Indicador de scroll (pulso o línea). Se va al bajar |

Modificadores opcionales, en el mismo elemento:

- `data-anim-delay="0.5"` (segundos, relativo a la entrada de la escena)
- `data-anim-stagger="0.08"`
- `data-depth="…"` (ver arriba)
- `data-count-from`, `data-count-to`, `data-count-pad="2"` (rellena con ceros: 01…06)
- `data-pin-length="160%"`

Si 04 necesita un token nuevo, lo agrega a esta tabla y avisa a 02 para marcarlo.

---

## 4. Slots por agente

### 05 · 3D WebGL (`hero3d.js`)

```html
<div class="hero-visual" data-3d="hero" aria-hidden="true">
  <canvas class="hero-canvas" data-3d-canvas></canvas>
  <img class="hero-fallback" data-3d-fallback src="media/hero-3d-fallback.webp" alt="" width="1600" height="1200">
</div>
```

- El `<img>` se ve siempre hasta que el canvas pinta su primer frame. Ahí 05 agrega
  `data-3d-ready` al contenedor y 03 hace el crossfade.
- Sin WebGL, con reduced motion o en un equipo lento: queda el `<img>`.
- **Falta crear `media/hero-3d-fallback.webp` (1600×1200).** Hoy da 404. Es tarea de 05.
- Tienda: `[data-3d="shop"]` (div vacío dentro de `[data-shop]`) para el objeto que cambia por nivel.
  Es opcional; si no se usa, queda vacío y no ocupa lugar.

### 06 · Demo del chatbot (`chatbot-demo.js/.css`)

Raíz `[data-bot-demo]` (figure). Todo lo de adentro es de 06.

| Gancho | Uso |
|---|---|
| `[data-bot-badge]` | Rótulo "Demo", siempre visible |
| `[data-bot-scenarios]` + `button[data-bot-scenario="restaurante\|alquiler\|tienda"]` | Chips. Vienen `hidden`, `aria-pressed` |
| `[data-bot-phone]`, `[data-bot-header]`, `[data-bot-name]` | Teléfono CSS. El nombre sale de `data-bot-title` del hilo activo |
| `[data-bot-status]` + `data-label-typing` | "en línea" ↔ "escribiendo…" |
| `[data-bot-clock]` | Reloj 24/7 |
| `ol[data-bot-thread="…"]` | Un hilo por escenario. Sin JS se ve solo el primero, completo |
| `li[data-msg="in\|out\|system"]` | Mensaje. `data-time`, `data-status="read"` (ticks). `data-handoff` en el aviso de derivación |
| `[data-bot-controls]` + `button[data-bot-control="pause\|replay"]` | Vienen `hidden`. `data-label-pause` / `data-label-play` |
| `[data-bot-live]` | `aria-live="polite"`: anunciá cada mensaje nuevo |
| `ol[data-bot-flow]` + `li[data-flow-step="mensaje\|ia\|accion\|panel"]` | Flujo al costado; podés marcar el paso activo con `data-active` |

Con el scroll: 04 pinnea `.scene-pin` (el padre de la demo) y emite en la `<section>` el evento
`ld:scene-progress` con `detail: { scene: "chatbots", progress: 0…1 }`. Si 06 quiere que los mensajes
"lleguen" con el scroll, escucha ese evento. Si no, reproduce al entrar en viewport. **04 no anima
nada dentro de `[data-bot-demo]`.** La misma demo está en `servicio.html#demo` (sin pin).

### 04 · Diagrama de sistemas (`motion.js`)

`figure[data-diagram="sistemas"]` > `svg[data-diagram-svg]` (viewBox 0 0 970 420).

- Líneas: `path[data-link="cliente-api|api-prisma|prisma-db|db-panel|api-bot|api-webhooks"]`, cada una con
  `id="link-…"` para usarlas de `MotionPathPlugin` (`path: "#link-api-bot"`).
- Nodos: `g[data-node="cliente|api|prisma|db|panel|bot|webhooks"]` con `data-step` (1–5) para el orden de encendido.
- Paquetes: `g[data-diagram-packets]` vacío. 04 crea ahí los círculos que viajan.
- El `<title>` y `<desc>` describen el diagrama para lectores. No los toques.

Proceso: `svg[data-process-line] path` se dibuja; `li[data-step="1…6"]` se encienden en orden.

### 07 · Interacciones y tema (`ui.js/.css`)

| Gancho | Uso |
|---|---|
| `button[data-theme-toggle]` | Toggle con View Transition circular. **Label fijo**: `aria-label="Tema oscuro"` ("Dark theme" en EN). ui.js no lo cambia. Solo actualiza `aria-pressed`: `"true"` con el tema oscuro activo y `"false"` con el claro. El HTML trae `"true"` porque Abismo es el default, y ui.js lo sincroniza al iniciar según `data-theme` o `prefers-color-scheme` |
| `[data-scroll-progress]` | Barra de progreso (div vacío, `aria-hidden`) |
| `[data-nav]` | El `<header>` (nav cápsula de vidrio). Podés agregarle `data-scrolled` |
| `[data-work-filter]` + `button[data-filter="all\|sistema\|tienda\|sitio\|propuesta"]` | Viene `hidden`. Filtra `.work-item` por `data-kind` (lista separada por espacios: `data-kind="tienda sistema"`) con Flip. Anunciá el resultado en `[data-work-live]`. Después de filtrar, emití `ld:work-filtered` en `document` para que 04 haga `ScrollTrigger.refresh()` |
| `img[data-work-peek]` | Vista previa que sigue al cursor en desktop. La fuente es `data-thumb` de cada `.work-item` (NextScene no tiene: no mostrar) |
| `[data-anim~="magnetic"]` | Botones magnéticos (solo `pointer: fine`) |
| `#ficha` (dialog) | Lo abre `plano.js`. 07 puede sumarle la transición compartida desde `.work-media`, pero sin reemplazar `plano.js` |

**Menú mobile:** lo maneja `plano.js` (`.menu-btn`, `#menu`, clase `.open`, `aria-expanded`). Se cierra con Escape (el foco vuelve al botón) y también cuando el foco sale del panel y del botón (Tab fuera o clic afuera).
Marca el botón con `data-menu-bound="plano"`. `ui.js` no enlaza `.menu-btn`.

### 08 · Tienda (`tienda.js/.css`)

```html
<div class="shop" data-shop data-shop-lang="es|en" data-shop-currency="USD">
  <div class="shop-3d" data-3d="shop" aria-hidden="true"></div>
  <div class="shop-stage" data-shop-stage></div>   ← montá acá
  <noscript>…los 9 productos estáticos + mail…</noscript>
</div>
<p class="visually-hidden" data-shop-live aria-live="polite"></p>
```

- Datos: `window.PRODUCTOS` (9), `window.PRODUCTOS_NIVELES` (3 actos), `window.LD_PRODUCTO(id)`,
  `window.LD_PRECIO(producto, lang)` → "USD 350 de setup + USD 39 por mes". Textos EN en `producto.en`.
- Headings que tiene que generar: `h3` por acto (nivel) y `h4` por producto. Así no se rompe el orden
  (la escena tiene `h2#tienda-title`).
- Cada fila renderizada lleva `id="producto-<id>"` (`producto-01`…`producto-09`).
- **Los CTA comerciales llevan a la tienda, no al mail** (decisión de Lautaro). Son `<a href="#producto-NN" data-shop-goto="NN">`;
  tienda.js intercepta el click, lleva el showroom al acto del producto y abre su fila, donde está "Pagar anticipo" (Stripe si
  `stripeLink` está cargado; si no, el estado "Pago online próximamente"). Sin JS, el ancla cae en la fila del `<noscript>`.
  Mapa: chatbot → `04` (hero, escena Chatbots, CTA final) · web → `05` · sistemas → `08` · seguridad → `03`.
- `servicio.html` no tiene tienda: su CTA final y los links `.offer-go` de "Qué hago" van a `index.html#producto-NN`
  (mismo mapa). tienda.js tiene que resolver `location.hash` = `#producto-NN` al cargar (abrir esa fila).
- Badge del 04: usá `producto.etiqueta` ("Recomendado" / "Recommended"). **No "Más elegido"**: es un
  dato de ventas que no tenemos.
- Contacto por producto: `LD_CONFIG.contactLink({ tema: "producto", producto: nombre })`, o un
  `<a data-contact data-contact-product="Nombre">` y después `LD_CONFIG.applyContactLinks(stage)`.
- 08 es dueño de su pin y de su contador de precio. 04 no toca `[data-shop]`.

### `config.js` (todos)

`window.LD_CONFIG`: `WHATSAPP_NUMERO` (vacío), `MAIL`, `GITHUB`, `SITIO`, `STORAGE_THEME_KEY`, `lang()`,
`hasWhatsApp()`, `mailtoLink()`, `whatsappLink()`, `contactLink({tema, producto, mensaje, asunto, lang})`,
`applyContactLinks(root)`.

**Contacto directo = opción secundaria.** Solo queda en `p.contact-alt` ("¿Preferís hablar antes?" + mail/WhatsApp + copiar
correo) dentro de `#contacto`, y en `p.foot-alt` del footer, en las 4 páginas. Ningún CTA principal (`btn-solid`) es mailto.

En el HTML: `<a data-contact="general|producto">` (los temas chatbot/web/sistemas/seguridad/servicio siguen en config.js para tienda.js) ya tiene un
`mailto` real como `href` (funciona sin JS). `config.js` lo reescribe a WhatsApp cuando haya número
y marca `data-contact-channel="whatsapp|mail"`. Un hijo `[data-contact-label]` cambia de texto con
`data-label-whatsapp` / `data-label-mail`.

---

## 5. Lo que necesita `assets/plano.js` (no renombrar)

| Selector | Qué hace |
|---|---|
| `.menu-btn`, `#menu`, `.open` | Menú mobile (`data-label-open` / `data-label-close`) |
| `[data-plan]`, `.plan-base`, `.plan .ln > *` (`--i`), `.uv`, `.pen`, `.ink`, `.print`, `.torch` | Linterna UV. Variables `--x`, `--y`, `--r`. Clases `is-lit`, `is-all`, `is-sweeping` |
| `.reveal-all` | Mostrar u ocultar todas las fallas (`data-label-show` / `data-label-hide`) |
| `[data-report]`, `.report`, `.report-head`, `.note`, `.note-1`, `.note-2`, `.scribble`, `.stamp`, `mark` | Informe. Clase `is-marked` al aparecer |
| `[data-open]` dentro de `[data-name]` con `<template>` | Abre `#ficha` con `#ficha-body` (`.f-head`, `.f-text`, `.f-main`, `.f-thumbs`) |
| `template img[data-shot][data-caption]`, `template video[data-video]` | Galería de la ficha |
| `[data-copy-email]` + `#copy-live` | Copiar correo (`data-label-copy` / `data-label-copied`) |

El barrido automático de la linterna solo corre cuando el plano está al 40% en pantalla, una vez por
visita, y se corta si sale de vista o si la persona mueve el cursor. Con reduced motion queda fija
sobre la huella.

**03:** `plano.css` ya no se carga. Portá a `scenes.css` las reglas de `.plan`, `.uv`, `.torch`, `.pen`,
`.ink`, `.print`, `.ln`, `.tx`, `.report*`, `.note*`, `.scribble`, `.stamp`, `.services`, `.sec-grid`,
`#ficha`/`.modal`/`.f-*` y `.visually-hidden`, con tokens (verde agua en vez del azul tinta), sin hex.

---

## 6. Trabajos

`li.work-item#trabajo-<slug>` con `data-name`, `data-cat`, `data-stack`, `data-thumb` (menos NextScene),
`data-kind`. Adentro: `article.work-entry` > `figure.work-media[data-work-media]`, `.work-text`
(`.work-n` decorativo, `h3`, `.work-cat`, `.work-what`, `.work-stack`, `.work-links` opcional,
`button[data-open]`) y `<template>` para la ficha.

Orden fijo, Happy Ride primero (`.work-item--main`): happy-ride, nextscene, agrostock, joyeria-acacio,
dar-automotores, smartgps, auralv, absa, os-tigerlab, selvora, alimentos-en-regla, holistica,
departamento-capri, tiro-federal.

Reglas que no se tocan: AuraLV no tiene link "Ver sitio" (el dominio no resolvió). Capri usa
`media/capri-publico.svg`. Happy Ride: solicitud en 4 pasos con código, confirmación manual por
WhatsApp, "precio a consultar" y nada de cobro online.

---

## 7. Accesibilidad que el marcado ya resuelve

- Un `h1` por página. Headings sin saltos (verificado por script).
- Landmarks: `header` > `nav[aria-label]`, `main#contenido`, `footer`, `dialog#ficha`. Skip link a `#contenido`. `main` lleva `tabindex="-1"` para que el skip link mueva el foco; 03 le saca el outline con `main:focus { outline: none }`.
- Cada escena con `aria-labelledby` a su `h2`.
- Decorativos con `aria-hidden="true"`: `.hero-visual`, `.hero-signal`, `.hero-clock`, `.giant-clock`,
  `.scene-bg`, `.work-n`, `.step-n`, `.work-media--draw`, `.uv`, `.torch`.
- Regiones vivas: `#copy-live`, `[data-bot-live]`, `[data-work-live]`, `[data-shop-live]`.
- Si un JS transforma texto (SplitText, Scramble), dejá el texto original accesible
  (`aria-label` en el padre o `SplitText({ aria: "auto" })`) y devolvé el texto final al terminar.
