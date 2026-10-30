/* hero3d.js · LautaroDev 2027 · agente 05 (3D WebGL)
 *
 * Escena "Señal": una esfera de partículas que respira al latido del sitio (--beat), con pulsos verde agua
 * que viajan por la superficie como mensajes entrantes, dos órbitas de datos con paquetes que circulan y un
 * núcleo tenue. Reacciona al mouse (o giroscopio) y se disuelve al scrollear.
 *
 * Contrato (assets/2027/CONTRATO-MARCADO.md):
 *   [data-3d="hero"] > canvas[data-3d-canvas] + img[data-3d-fallback]
 *   - Pinta el primer frame → agrega data-3d-ready al contenedor y emite "ld:3d-ready" (burbujea a document).
 *   - Sin WebGL2, reduced-motion, Save-Data, equipo lento o frame test malo → queda el <img> y emite "ld:3d-fallback".
 *   - Cada pulso emite "ld:3d-pulse" (detail.index) en el contenedor, para quien quiera sincronizar.
 *   [data-3d="shop"] (opcional) → objeto chico que cambia de forma por nivel. Escucha "ld:shop-act"
 *   (detail.act | detail.nivel | detail.level 1..3, o detail.index 0..2) y, si nadie lo emite,
 *   "ld:scene-progress" con detail.scene === "tienda".
 *
 * Colores y tiempos: tokens --gl-*, --beat, --dur-cinematic (tokens.css). Se releen al cambiar data-theme.
 * Three.js: window.LD_THREE (assets/vendor/three/three-hero.iife.js). Si no está en la página, este archivo lo
 * carga solo, después del load y en idle (lazy, fuera del camino del LCP).
 * Sin ES modules: abre por file://.
 * Depuración: ?3d=off fuerza el fallback · ?3d=force ignora reduced-motion y la detección de equipo lento.
 */
(function () {
  "use strict";

  var D = document;
  var W = window;
  var ROOT = D.documentElement;
  var SCRIPT_SRC = (D.currentScript && D.currentScript.src) || "";
  var MODE = "";
  try { MODE = new URLSearchParams(W.location.search).get("3d") || ""; } catch (e) {}
  var FORCE = MODE === "force";
  var mqReduce = W.matchMedia ? W.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var mqLight = W.matchMedia ? W.matchMedia("(prefers-color-scheme: light)") : null;
  var mqCoarse = W.matchMedia ? W.matchMedia("(pointer: coarse)") : null;
  var DPR_MAX = 1.75;
  var TAU = Math.PI * 2;

  var api = {
    state: "idle",          // idle | loading | ready | fallback
    reason: "",
    particles: 0,
    fps: 0,
    shop: null,
    pulse: function () {},
    snapshot: null
  };
  W.LD_HERO3D = api;

  function reduced() { return !FORCE && !!(mqReduce && mqReduce.matches); }
  function onMQ(mq, fn) { if (!mq) return; if (mq.addEventListener) mq.addEventListener("change", fn); else if (mq.addListener) mq.addListener(fn); }
  function emit(el, name, detail) {
    try { el.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail || {} })); } catch (e) {}
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function easeOutExpo(x) { return x >= 1 ? 1 : 1 - Math.pow(2, -10 * x); }

  /* ---------- tokens ---------- */
  function parseColor(str, fb) {
    str = (str || "").trim();
    var m = /^#([0-9a-f]{3}|[0-9a-f]{6})([0-9a-f]{2})?$/i.exec(str);
    if (m) {
      var h = m[1];
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
    }
    m = /rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/i.exec(str);
    if (m) return [+m[1] / 255, +m[2] / 255, +m[3] / 255];
    return fb.slice();
  }
  function parseTime(str, fb) {
    str = (str || "").trim();
    var n = parseFloat(str);
    if (!isFinite(n)) return fb;
    return /ms$/.test(str) ? n / 1000 : n;
  }
  /* Alfa de un #RRGGBBAA (1 si no trae). */
  function parseAlpha(str, fb) {
    var m = /^#[0-9a-f]{6}([0-9a-f]{2})$/i.exec((str || "").trim());
    return m ? parseInt(m[1], 16) / 255 : fb;
  }
  /* Primer o último #hex dentro de un valor compuesto (box-shadow, gradiente). */
  function hexIn(str, last, fb) {
    var all = (str || "").match(/#[0-9a-f]{6}(?:[0-9a-f]{2})?/gi);
    if (!all) return fb.slice();
    return parseColor(all[last ? all.length - 1 : 0].slice(0, 7), fb);
  }
  function num(str, fb) { var n = parseFloat(str); return isFinite(n) ? n : fb; }
  function themeName() {
    var t = ROOT.getAttribute("data-theme");
    if (t === "light" || t === "dark") return t;
    return mqLight && mqLight.matches ? "light" : "dark";
  }
  function readTokens() {
    var cs = getComputedStyle(ROOT);
    function v(n) { return cs.getPropertyValue(n); }
    var additive = num(v("--gl-additive"), 1) >= 0.5;
    var particle = parseColor(v("--gl-particle"), [0.18, 0.9, 0.77]);
    var pulse = parseColor(v("--gl-pulse"), [0.5, 1, 0.88]);
    var core = parseColor(v("--gl-core"), [0.086, 0.25, 0.42]);
    return {
      // galaxia (tokens v3 de 01): --nebula-c1/2/3 son #RRGGBBAA; --rim-light y --glow-planet son
      // box-shadow, de los que se toma el color; --gl-nebula es el tono frío sólido.
      nebula1: parseColor(v("--nebula-c2"), parseColor(v("--ink-blue"), [0.06, 0.17, 0.29])),
      nebula2: parseColor(v("--nebula-c1"), parseColor(v("--aqua-deep"), [0.055, 0.49, 0.42])),
      nebula3: parseColor(v("--nebula-c3"), parseColor(v("--gl-nebula"), core)),
      nebAlpha: (function () {
        var a = Math.max(parseAlpha(v("--nebula-c1"), 0), parseAlpha(v("--nebula-c2"), 0), parseAlpha(v("--nebula-c3"), 0)) || 0.5;
        return additive ? Math.min(0.9, a * 1.5) : Math.min(0.26, a * 0.6);
      })(),
      rim: hexIn(v("--rim-light"), false, pulse),
      planet: hexIn(v("--glow-planet"), true, particle),
      star: parseColor(v("--text"), [0.9, 0.96, 0.95]),
      starAlpha: num(v("--star-opacity"), 0.85),
      bg: parseColor(v("--gl-bg"), [0.02, 0.035, 0.043]),
      particle: parseColor(v("--gl-particle"), [0.18, 0.9, 0.77]),
      pulse: parseColor(v("--gl-pulse"), [0.5, 1, 0.88]),
      core: parseColor(v("--gl-core"), [0.086, 0.25, 0.42]),
      dim: parseColor(v("--gl-dim"), [0.055, 0.49, 0.42]),
      additive: num(v("--gl-additive"), 1) >= 0.5,
      alpha: num(v("--gl-particle-alpha"), 0.85),
      bloom: num(v("--gl-bloom"), 1),
      beat: parseTime(v("--beat"), 2.8) || 2.8,
      intro: parseTime(v("--dur-cinematic"), 1.4) || 1.4
    };
  }
  var TOKENS = readTokens();
  var themeListeners = [];
  function onThemeChange() {
    TOKENS = readTokens();
    syncFallbackImage();
    for (var i = 0; i < themeListeners.length; i++) themeListeners[i](TOKENS);
  }
  try {
    new MutationObserver(function () { onThemeChange(); }).observe(ROOT, { attributes: true, attributeFilter: ["data-theme"] });
  } catch (e) {}
  onMQ(mqLight, onThemeChange);
  D.addEventListener("ld:theme-change", function () { onThemeChange(); });

  /* Variantes por tema: x.webp (oscuro) / x-light.webp (claro).
   * Aplica al fallback del hero (img[data-3d-fallback]) y a los renders de escena ([data-render]).
   * El <source media="(prefers-color-scheme: light)"> de cada <picture> sigue al sistema, no al toggle:
   * se reescribe su srcset con la variante del tema activo para que no pise el cambio. */
  function variant(url, light) {
    return url.replace(/(-light)?\.webp(?=\s|$)/, light ? "-light.webp" : ".webp");
  }
  function syncFallbackImage() {
    var light = themeName() === "light";
    var imgs = D.querySelectorAll("img[data-3d-fallback], [data-render] img");
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      var src = img.getAttribute("src") || "";
      if (!/\.webp$/.test(src)) continue;
      var want = variant(src, light);
      if (want !== src) img.setAttribute("src", want);
      var pic = img.parentNode && img.parentNode.nodeName === "PICTURE" ? img.parentNode : null;
      if (!pic) continue;
      var srcs = pic.querySelectorAll("source");
      for (var k = 0; k < srcs.length; k++) {
        var ss = srcs[k].getAttribute("srcset") || "";
        if (!/\.webp/.test(ss)) continue;
        var ws = variant(ss, light);
        if (ws !== ss) srcs[k].setAttribute("srcset", ws);
      }
    }
  }
  syncFallbackImage();

  /* ---------- carga lazy de three ---------- */
  var threeWaiters = null;
  function loadThree(cb) {
    if (W.LD_THREE) { cb(W.LD_THREE); return; }
    if (threeWaiters) { threeWaiters.push(cb); return; }
    threeWaiters = [cb];
    function done() {
      var list = threeWaiters; threeWaiters = null;
      for (var i = 0; i < list.length; i++) list[i](W.LD_THREE || null);
    }
    var src = SCRIPT_SRC ? SCRIPT_SRC.replace(/assets\/2027\/hero3d\.js.*$/, "assets/vendor/three/three-hero.iife.js") : "assets/vendor/three/three-hero.iife.js";
    var s = D.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = done;
    s.onerror = done;
    D.head.appendChild(s);
  }

  function afterLoadIdle(cb) {
    function idle() {
      if (W.requestIdleCallback) W.requestIdleCallback(cb, { timeout: 1200 });
      else setTimeout(cb, 120);
    }
    if (D.readyState === "complete") idle();
    else W.addEventListener("load", idle, { once: true });
  }

  function whenNear(el, margin, cb) {
    if (!("IntersectionObserver" in W)) { cb(); return; }
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) { io.disconnect(); cb(); return; }
      }
    }, { rootMargin: margin });
    io.observe(el);
  }

  function lowEndDevice() {
    if (FORCE) return "";
    var c = navigator.connection;
    if (c && c.saveData) return "save-data";
    var mem = navigator.deviceMemory;
    var cores = navigator.hardwareConcurrency || 4;
    if (mem && mem <= 2 && cores <= 4) return "low-memory";
    if (cores <= 2) return "low-cpu";
    return "";
  }

  function getGL(canvas) {
    var attrs = {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
      failIfMajorPerformanceCaveat: !FORCE
    };
    try { return canvas.getContext("webgl2", attrs); } catch (e) { return null; }
  }

  /* ---------- shaders ---------- */
  var FRAG = [
    "uniform vec3 uColA;",
    "uniform vec3 uColPulse;",
    "uniform vec3 uColCore;",
    "uniform vec3 uColDim;",
    "uniform vec3 uColRim;",
    "uniform vec3 uColPlanet;",
    "uniform vec3 uColStar;",
    "uniform float uAlpha;",
    "uniform float uBloom;",
    "varying float vAlpha;",
    "varying float vHeat;",
    "varying float vKind;",
    "varying float vFacing;",
    "varying float vRim;",
    "void main() {",
    "  vec2 c = gl_PointCoord * 2.0 - 1.0;",
    "  float d = dot(c, c);",
    "  if (d > 1.0) discard;",
    "  float core = exp(-d * 9.0);",
    "  float halo = exp(-d * 2.4) * 0.38 * uBloom;",
    "  float edge = 1.0 - smoothstep(0.7, 1.0, d);",
    "  vec3 base = vKind > 3.5 ? uColStar : vKind > 2.5 ? mix(uColDim, uColPlanet, vFacing) : vKind > 1.5 ? uColCore : mix(uColDim, uColA, vFacing);",
    "  float h = clamp(vHeat, 0.0, 1.0);",
    "  vec3 col = mix(base, uColPulse, h);",
    "  col = mix(col, uColRim, clamp(vRim, 0.0, 1.0));",
    "  col += uColPulse * core * max(vHeat - 0.85, 0.0) * 0.6 * uBloom;",
    "  float a = (core + halo) * edge * vAlpha * uAlpha * (1.0 + h * 0.9 + vRim * 0.8);",
    "  gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));",
    "}"
  ].join("\n");

  var HERO_VERT = [
    "uniform float uTime;",
    "uniform float uBeat;",
    "uniform float uIntro;",
    "uniform float uScroll;",
    "uniform float uSize;",
    "uniform vec4 uPulses[4];",
    "uniform vec3 uLight;",
    "attribute vec4 aRand;",
    "attribute float aKind;",
    "varying float vAlpha;",
    "varying float vHeat;",
    "varying float vKind;",
    "varying float vFacing;",
    "varying float vRim;",
    "mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }",
    "mat3 rotZ(float a) { float c = cos(a), s = sin(a); return mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0); }",
    "void main() {",
    "  float TAU = 6.2831853;",
    "  float breath = sin(uTime * TAU / uBeat);",
    "  float size = mix(0.55, 1.35, aRand.z);",
    "  float alpha = 1.0;",
    "  float heat = 0.0;",
    "  vec3 p; vec3 dir;",
    "  float born;",
    "  if (aKind < 0.5) {",
    // cáscara: esfera que respira con ruido barato y pulsos que viajan como frentes de onda
    "    dir = normalize(position);",
    "    float n = sin(dot(dir, vec3(3.1, 2.7, 4.3)) * 1.7 + uTime * 0.55) * 0.5 + sin(dot(dir, vec3(-4.1, 5.3, 1.9)) * 2.3 - uTime * 0.4) * 0.5;",
    "    float r = 1.0 + 0.035 * breath + 0.055 * n + (aRand.x - 0.5) * 0.1;",
    "    for (int i = 0; i < 4; i++) {",
    "      vec4 P = uPulses[i];",
    "      float age = uTime - P.w;",
    "      if (age > 0.0 && age < 3.4) {",
    "        float ang = acos(clamp(dot(dir, P.xyz), -1.0, 1.0));",
    "        float dd = ang - age * 1.1;",
    "        float fade = 1.0 - age / 3.4;",
    "        heat += exp(-dd * dd * 48.0) * fade * fade + exp(-ang * ang * 70.0) * exp(-age * 2.2);",
    "      }",
    "    }",
    "    heat = min(heat, 1.6);",
    "    r += heat * 0.065;",
    "    p = dir * r * mix(0.84, 1.0, uIntro);",
    "    born = mix(0.3, 1.0, smoothstep(aRand.y * 0.5, aRand.y * 0.5 + 0.5, uIntro));",
    "  } else if (aKind < 1.5) {",
    // órbitas: dos anillos inclinados con paquetes de datos que circulan
    "    float ring = position.y;",
    "    float spd = (ring < 0.5 ? 0.2 : -0.14) * (0.85 + 0.3 * aRand.y);",
    "    float a = position.x + uTime * spd;",
    "    float R = (ring < 0.5 ? 1.45 : 1.72) + (aRand.z - 0.5) * 0.06 + 0.015 * breath;",
    "    p = vec3(cos(a) * R, (aRand.w - 0.5) * 0.04, sin(a) * R);",
    "    p = ring < 0.5 ? rotX(1.14) * p : rotZ(0.62) * rotX(-0.38) * p;",
    "    dir = normalize(p);",
    "    float k = fract(position.x * (ring < 0.5 ? 3.0 : 2.0) / TAU - uTime * 0.16);",
    "    heat = pow(max(1.0 - abs(k - 0.5) * 2.0, 0.0), 26.0) * 1.3;",
    "    size *= 0.75;",
    "    alpha = 0.7;",
    "    p *= mix(0.55, 1.0, uIntro);",
    "    born = smoothstep(0.35 + aRand.y * 0.35, 1.0, uIntro);",
    "  } else if (aKind < 2.5) {",
    // núcleo: polvo tenue adentro
    "    dir = normalize(position + vec3(1e-4));",
    "    p = position * (1.0 + 0.07 * breath);",
    "    size *= 1.2;",
    "    alpha = 0.5;",
    "    heat = 0.15 + 0.2 * (0.5 + 0.5 * breath);",
    "    born = smoothstep(0.0, 0.6, uIntro);",
    "  } else {",
    // anillo planetario: banda ancha con huecos, rotación kepleriana (lo de adentro gira más rápido)
    "    float R = position.y;",
    "    float a = position.x + uTime * 0.11 * pow(1.7 / R, 1.5);",
    "    p = vec3(cos(a) * R, (aRand.w - 0.5) * 0.025, sin(a) * R);",
    "    p = rotZ(-0.36) * rotX(0.34) * p;",
    "    dir = normalize(p);",
    "    size *= 0.6;",
    "    alpha = 0.85;",
    "    p *= mix(0.7, 1.0, uIntro);",
    "    born = smoothstep(0.2 + aRand.y * 0.45, 1.0, uIntro);",
    "  }",
    // disolución con el scroll: cada partícula se va a su ritmo
    "  float s = uScroll;",
    "  float drift = s * (1.0 + aRand.y * 2.4);",
    "  vec3 scatter = normalize(dir + (aRand.xyz - 0.5) * 1.3);",
    "  p += scatter * drift * drift * 0.6 - vec3(0.0, s * 0.25, 0.0);",
    "  float gone = smoothstep(aRand.x * 0.55, aRand.x * 0.55 + 0.38, s);",
    "  alpha *= born * (1.0 - gone);",
    "  vec3 vn = normalize(normalMatrix * dir);",
    "  float lit = max(dot(vn, uLight), 0.0);",
    "  vFacing = clamp(0.5 + 0.5 * vn.z, 0.0, 1.0);",
    "  vHeat = clamp(heat + lit * lit * lit * 0.35, 0.0, 1.6);",
    "  vAlpha = alpha * mix(0.22, 1.0, vFacing);",
    "  vKind = aKind;",
    // rim light: borde de la esfera encendido desde arriba a la derecha
    "  float rimDir = 0.35 + 0.65 * max(dot(normalize(vn.xy + vec2(1e-4)), vec2(0.6, 0.8)), 0.0);",
    "  vRim = aKind < 0.5 ? pow(1.0 - abs(vn.z), 3.0) * rimDir * (1.0 - s) : 0.0;",
    "  vec4 mv = modelViewMatrix * vec4(p, 1.0);",
    // sombra: los anillos detrás de la esfera se apagan
    "  if ((aKind > 0.5 && aKind < 1.5) || aKind > 2.5) {",
    "    vec4 cc = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);",
    "    float behind = step(mv.z, cc.z - 0.05);",
    "    float inside = 1.0 - smoothstep(0.92, 1.1, length(mv.xy - cc.xy));",
    "    vAlpha *= 1.0 - 0.88 * behind * inside * (1.0 - s);",
    "  }",
    "  gl_PointSize = vAlpha < 0.004 ? 0.0 : uSize * size * (1.0 + min(heat, 1.0) * 1.3) / -mv.z;",
    "  gl_Position = projectionMatrix * mv;",
    "}"
  ].join("\n");

  var SHOP_VERT = [
    "uniform float uTime;",
    "uniform float uBeat;",
    "uniform float uLevel;",
    "uniform float uSize;",
    "attribute vec3 aB;",
    "attribute vec3 aC;",
    "attribute vec4 aRand;",
    "varying float vAlpha;",
    "varying float vHeat;",
    "varying float vKind;",
    "varying float vFacing;",
    "varying float vRim;",
    "void main() {",
    "  float breath = sin(uTime * 6.2831853 / uBeat);",
    "  float d = aRand.x * 0.35;",
    "  vRim = 0.0;",
    "  float t1 = smoothstep(0.0, 1.0, clamp((uLevel - d) / 0.65, 0.0, 1.0));",
    "  float t2 = smoothstep(0.0, 1.0, clamp((uLevel - 1.0 - d) / 0.65, 0.0, 1.0));",
    "  vec3 p = mix(mix(position, aB, t1), aC, t2);",
    "  float trans = sin(3.14159 * clamp(uLevel - floor(uLevel + 0.0001), 0.0, 1.0));",
    "  p += (aRand.yzw - 0.5) * 0.35 * trans;",
    "  p *= 1.0 + 0.03 * breath;",
    "  float k = fract(aRand.w * (1.0 + floor(uLevel + 0.5)) - uTime * 0.22);",
    "  float heat = pow(max(1.0 - abs(k - 0.5) * 2.0, 0.0), 22.0) * 1.2;",
    "  vec3 vn = normalize(normalMatrix * normalize(p + vec3(1e-4)));",
    "  vFacing = clamp(0.5 + 0.5 * vn.z, 0.0, 1.0);",
    "  vHeat = heat + uLevel * 0.12;",
    "  vAlpha = mix(0.3, 1.0, vFacing) * (0.55 + uLevel * 0.22);",
    "  vKind = 0.0;",
    "  vec4 mv = modelViewMatrix * vec4(p, 1.0);",
    "  gl_PointSize = uSize * mix(0.6, 1.3, aRand.z) * (1.0 + min(heat, 1.0)) / -mv.z;",
    "  gl_Position = projectionMatrix * mv;",
    "}"
  ].join("\n");

  var STAR_VERT = [
    "uniform float uTime;",
    "uniform float uScroll;",
    "uniform float uIntro;",
    "uniform float uStarSize;",
    "uniform float uStarAlpha;",
    "uniform vec2 uMouse;",
    "attribute vec4 aRand;",
    "varying float vAlpha;",
    "varying float vHeat;",
    "varying float vKind;",
    "varying float vFacing;",
    "varying float vRim;",
    "void main() {",
    "  vec3 p = position;",
    "  float depth = aRand.x;",
    "  p.xy += uMouse * (1.0 - depth) * 0.35;",
    "  p.y += uScroll * (1.0 - depth) * 1.4;",
    "  vec4 cp = projectionMatrix * modelViewMatrix * vec4(p, 1.0);",
    "  vec2 ndc = cp.xy / cp.w;",
    "  float edge = 1.0 - smoothstep(0.5, 1.0, length(ndc * vec2(0.85, 1.0)));",
    "  float tw = 0.55 + 0.45 * sin(uTime * (0.7 + aRand.y * 2.4) + aRand.z * 40.0);",
    "  vAlpha = uStarAlpha * edge * tw * mix(1.0, 0.4, depth) * smoothstep(0.0, 0.8, uIntro) * (1.0 - uScroll * 0.6);",
    "  vHeat = step(0.97, aRand.w) * 0.5;",
    "  vKind = 4.0; vFacing = 1.0; vRim = 0.0;",
    "  gl_PointSize = vAlpha < 0.004 ? 0.0 : uStarSize * mix(0.9, 2.4, aRand.w * aRand.w) * mix(1.0, 0.6, depth);",
    "  gl_Position = cp;",
    "}"
  ].join("\n");

  var COMET_VERT = [
    "uniform float uTime;",
    "uniform float uStarSize;",
    "uniform vec4 uComet;",
    "attribute vec4 aRand;",
    "varying float vAlpha;",
    "varying float vHeat;",
    "varying float vKind;",
    "varying float vFacing;",
    "varying float vRim;",
    "void main() {",
    "  float idx = aRand.w;",
    "  float prog = (uTime - uComet.w) / 2.4;",
    "  vec2 dv = vec2(cos(uComet.z), sin(uComet.z));",
    "  vec2 head = uComet.xy + dv * prog * 7.5;",
    "  vec2 q = head - dv * idx * 1.6 + vec2(-dv.y, dv.x) * (aRand.x - 0.5) * 0.09 * idx;",
    "  vec4 cp = projectionMatrix * modelViewMatrix * vec4(q, -1.5, 1.0);",
    "  vec2 ndc = cp.xy / cp.w;",
    "  float on = step(0.0, prog) * step(prog, 1.0);",
    "  vAlpha = on * pow(1.0 - idx, 2.0) * sin(3.14159 * clamp(prog, 0.0, 1.0)) * (1.0 - smoothstep(0.55, 1.0, length(ndc)));",
    "  vHeat = 1.0 - idx * 0.7;",
    "  vKind = 0.0; vFacing = 1.0; vRim = 0.0;",
    "  gl_PointSize = vAlpha < 0.004 ? 0.0 : uStarSize * mix(3.4, 0.8, idx) * (0.7 + aRand.y * 0.6);",
    "  gl_Position = cp;",
    "}"
  ].join("\n");

  var NEB_VERT = "varying vec2 vUv; void main() { vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }";
  var NEB_FRAG = [
    "uniform vec2 uRes;",
    "uniform float uTime;",
    "uniform float uScroll;",
    "uniform float uIntro;",
    "uniform vec2 uMouse;",
    "uniform vec3 uN1;",
    "uniform vec3 uN2;",
    "uniform vec3 uN3;",
    "uniform float uNebAlpha;",
    "varying vec2 vUv;",
    "float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }",
    "float noise(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);",
    "  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y); }",
    "float fbm(vec2 p) { float v = 0.0, a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);",
    "  for (int i = 0; i < OCT; i++) { v += a * noise(p); p = m * p; a *= 0.5; } return v; }",
    "void main() {",
    "  vec2 p = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);",
    "  vec2 pp = p * 1.7 + uMouse * 0.06 + vec2(0.0, uScroll * 0.5);",
    "  float t = uTime * 0.018;",
    "  float q = fbm(pp + vec2(t, -t * 0.6));",
    "  float n = fbm(pp * 1.35 + q * 1.6 + vec2(-t * 0.7, t * 0.4) + 3.1);",
    "  float dens = smoothstep(0.36, 0.8, n);",
    "  vec3 col = mix(uN1, uN2, smoothstep(0.35, 0.75, q));",
    "  col = mix(col, uN3, smoothstep(0.55, 0.85, n) * 0.7);",
    "  vec2 e = min(vUv, 1.0 - vUv);",
    "  float mask = (1.0 - smoothstep(0.3, 0.98, length(vUv - 0.5) * 2.0)) * smoothstep(0.0, 0.2, min(e.x, e.y));",
    "  float dust = smoothstep(0.55, 0.78, fbm(pp * 2.4 - 7.3 + t));",
    "  float a = dens * mask * uNebAlpha * smoothstep(0.0, 1.0, uIntro) * (1.0 - uScroll * 0.85) * (1.0 - dust * 0.45);",
    "  gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));",
    "}"
  ].join("\n");

  function colorUniforms() {
    return {
      uColA: { value: TOKENS.particle.slice() },
      uColPulse: { value: TOKENS.pulse.slice() },
      uColCore: { value: TOKENS.core.slice() },
      uColDim: { value: TOKENS.dim.slice() },
      uColRim: { value: TOKENS.rim.slice() },
      uColPlanet: { value: TOKENS.planet.slice() },
      uColStar: { value: TOKENS.star.slice() },
      uAlpha: { value: TOKENS.alpha },
      uBloom: { value: TOKENS.bloom }
    };
  }
  /* Interpola los colores hacia los tokens actuales (cambio de tema suave). */
  function lerpColors(u, k) {
    var pairs = [["uColA", "particle"], ["uColPulse", "pulse"], ["uColCore", "core"], ["uColDim", "dim"], ["uColRim", "rim"], ["uColPlanet", "planet"], ["uColStar", "star"], ["uN1", "nebula1"], ["uN2", "nebula2"], ["uN3", "nebula3"]];
    var moving = false;
    if (u.uNebAlpha) u.uNebAlpha.value += (TOKENS.nebAlpha - u.uNebAlpha.value) * k;
    if (u.uStarAlpha) u.uStarAlpha.value += (TOKENS.starAlpha - u.uStarAlpha.value) * k;
    for (var i = 0; i < pairs.length; i++) {
      if (!u[pairs[i][0]]) continue;
      var cur = u[pairs[i][0]].value, tgt = TOKENS[pairs[i][1]];
      for (var c = 0; c < 3; c++) {
        var dv = tgt[c] - cur[c];
        if (Math.abs(dv) > 0.002) { cur[c] += dv * k; moving = true; } else cur[c] = tgt[c];
      }
    }
    u.uAlpha.value += (TOKENS.alpha - u.uAlpha.value) * k;
    u.uBloom.value += (TOKENS.bloom - u.uBloom.value) * k;
    return moving;
  }

  function rand() { return Math.random(); }
  function randDir(out, o) {
    // dirección uniforme en la esfera (Marsaglia)
    var x, y, s;
    do { x = rand() * 2 - 1; y = rand() * 2 - 1; s = x * x + y * y; } while (s >= 1 || s === 0);
    var f = 2 * Math.sqrt(1 - s);
    out[o] = x * f; out[o + 1] = y * f; out[o + 2] = 1 - 2 * s;
  }

  /* =====================================================================
   * HERO
   * ===================================================================== */
  function Hero(container) {
    var canvas = container.querySelector("canvas[data-3d-canvas]");
    var section = container.closest("section") || container.parentNode;
    var self = this;
    var THREE, gl, renderer, scene, camera, points, geo, mat, u, stars, comet, nebula, mats = [];
    var nextComet = 4.5, cometCount = 0;
    var small = Math.min(W.innerWidth, W.innerHeight) < 700 || !!(mqCoarse && mqCoarse.matches);
    var MAX = small ? 12000 : 20000;
    var MIN = small ? 3000 : 5000;
    var count = MAX;
    var raf = 0, running = false, visible = true, pageVisible = !D.hidden, firstFrame = true;
    var clock = 0, lastNow = 0, introStart = -1;
    var scrollT = 0, scroll = 0, heroTop = 0, heroH = 1;
    var mouseT = [0, 0], mouse = [0, 0];
    var pulses = new Float32Array(16), pulseIdx = 0, nextPulse = 0.15, pulseCount = 0;
    var frames = [], test = 0, govWin = [], slowWins = 0;
    var vw = 1, vh = 1;

    function setState(st, reason) {
      api.state = st;
      api.reason = reason || "";
      container.setAttribute("data-3d-state", st);
    }

    function fallback(reason) {
      stop();
      container.removeAttribute("data-3d-ready");
      setState("fallback", reason);
      emit(container, "ld:3d-fallback", { target: "hero", reason: reason });
      if (renderer) {
        try { renderer.dispose(); } catch (e) {}
        if (geo) geo.dispose();
        if (mat) mat.dispose();
        renderer = null;
      }
    }
    this.fallback = fallback;

    function measure() {
      var r = section.getBoundingClientRect();
      heroTop = r.top + (W.pageYOffset || 0);
      heroH = Math.max(1, r.height);
      var cw = container.clientWidth, ch = container.clientHeight;
      if (!cw || !ch) return;
      vw = cw; vh = ch;
      if (!renderer) return;
      renderer.setPixelRatio(Math.min(W.devicePixelRatio || 1, DPR_MAX));
      renderer.setSize(cw, ch, false);
      camera.aspect = cw / ch;
      // encuadre: la escena (radio ~1.95 con órbitas) entra entera en el lado más chico
      camera.position.z = frameZ(camera.aspect);
      camera.updateProjectionMatrix();
      u.uSize.value = 26 * renderer.getPixelRatio() * (ch / 900) * (small ? 1.25 : 1);
      u.uStarSize.value = 2.1 * renderer.getPixelRatio() * (small ? 1.15 : 1);
      u.uRes.value[0] = canvas.width; u.uRes.value[1] = canvas.height;
    }

    // encuadre: esfera (r ~1.1) + anillo planetario (r 2.55) entran enteros
    function frameZ(aspect) {
      var half = Math.tan((camera.fov * Math.PI) / 360);
      return Math.max(1.75 / half, 2.6 / (half * aspect)) + 0.4;
    }

    function fireComet() {
      u.uComet.value = [-3.6 + rand() * 2.2, 1.6 + rand() * 1.2, -0.42 - rand() * 0.32, clock];
      cometCount++;
      emit(container, "ld:3d-comet", { target: "hero", index: cometCount });
    }

    function onScroll() {
      scrollT = clamp(((W.pageYOffset || 0) - heroTop) / (heroH * 0.85), 0, 1);
    }

    function onPointer(e) {
      mouseT[0] = (e.clientX / W.innerWidth) * 2 - 1;
      mouseT[1] = -((e.clientY / W.innerHeight) * 2 - 1);
    }
    function onTilt(e) {
      if (e.gamma == null) return;
      mouseT[0] = clamp(e.gamma / 30, -1, 1);
      mouseT[1] = clamp((45 - (e.beta || 45)) / 30, -1, 1);
    }

    function firePulse(dirX, dirY, dirZ) {
      var o = (pulseIdx % 4) * 4;
      var v = [dirX, dirY, dirZ];
      if (dirX == null) {
        randDir(v, 0);
        // sesgo hacia la cara visible (que se vean llegar)
        v[2] = Math.abs(v[2]) * 0.8 + 0.25;
        var l = Math.hypot(v[0], v[1], v[2]);
        v[0] /= l; v[1] /= l; v[2] /= l;
      }
      // a espacio objeto: deshacer la rotación actual en Y y X (aprox. suficiente)
      if (points) {
        var ry = -points.rotation.y, rx = -points.rotation.x;
        var x = v[0], y = v[1], z = v[2];
        var y1 = y * Math.cos(rx) - z * Math.sin(rx), z1 = y * Math.sin(rx) + z * Math.cos(rx);
        var x2 = x * Math.cos(ry) + z1 * Math.sin(ry), z2 = -x * Math.sin(ry) + z1 * Math.cos(ry);
        v = [x2, y1, z2];
      }
      pulses[o] = v[0]; pulses[o + 1] = v[1]; pulses[o + 2] = v[2]; pulses[o + 3] = clock;
      pulseIdx++;
      pulseCount++;
      emit(container, "ld:3d-pulse", { target: "hero", index: pulseCount });
    }
    api.pulse = function () { if (api.state === "ready") firePulse(); };

    function build() {
      var nShell = Math.round(MAX * 0.6), nRing = Math.round(MAX * 0.1), nPlanet = Math.round(MAX * 0.24);
      var pos = new Float32Array(MAX * 3), rnd = new Float32Array(MAX * 4), kind = new Float32Array(MAX);
      var order = new Uint32Array(MAX), i, j, t;
      for (i = 0; i < MAX; i++) order[i] = i;
      for (i = MAX - 1; i > 0; i--) { j = (rand() * (i + 1)) | 0; t = order[i]; order[i] = order[j]; order[j] = t; }
      var tmp = [0, 0, 0];
      for (i = 0; i < MAX; i++) {
        var k = order[i], o = k * 3;
        if (i < nShell) {
          // fibonacci para un muestreo parejo
          var y = 1 - (i / (nShell - 1)) * 2, rr = Math.sqrt(1 - y * y), th = i * 2.399963229728653;
          pos[o] = Math.cos(th) * rr; pos[o + 1] = y; pos[o + 2] = Math.sin(th) * rr;
          kind[k] = 0;
        } else if (i < nShell + nRing) {
          pos[o] = rand() * TAU; pos[o + 1] = 0; pos[o + 2] = 0;
          kind[k] = 1;
        } else if (i < nShell + nRing + nPlanet) {
          // bandas con huecos (tipo Saturno)
          var R, ok = false;
          while (!ok) { R = 1.75 + rand() * 0.8; ok = rand() < (0.25 + 0.75 * Math.pow(0.5 + 0.5 * Math.sin(R * 23.0), 2)) * (R > 2.08 && R < 2.16 ? 0.05 : 1); }
          pos[o] = rand() * TAU; pos[o + 1] = R; pos[o + 2] = 0;
          kind[k] = 3;
        } else {
          randDir(tmp, 0);
          var rc = 0.12 + Math.pow(rand(), 0.6) * 0.5;
          pos[o] = tmp[0] * rc; pos[o + 1] = tmp[1] * rc; pos[o + 2] = tmp[2] * rc;
          kind[k] = 2;
        }
        rnd[k * 4] = rand(); rnd[k * 4 + 1] = rand(); rnd[k * 4 + 2] = rand(); rnd[k * 4 + 3] = rand();
      }
      geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("aRand", new THREE.BufferAttribute(rnd, 4));
      geo.setAttribute("aKind", new THREE.BufferAttribute(kind, 1));
      geo.setDrawRange(0, count);
      u = colorUniforms();
      u.uTime = { value: 0 };
      u.uBeat = { value: TOKENS.beat };
      u.uIntro = { value: 0 };
      u.uScroll = { value: 0 };
      u.uSize = { value: 26 };
      u.uPulses = { value: pulses };
      u.uLight = { value: [0, 0.3, 0.95] };
      mat = new THREE.ShaderMaterial({
        uniforms: u,
        vertexShader: HERO_VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: TOKENS.additive ? THREE.AdditiveBlending : THREE.NormalBlending
      });
      points = new THREE.Points(geo, mat);
      points.frustumCulled = false;
      points.rotation.x = 0.28;
      mats.push(mat);
      scene = new THREE.Scene();

      u.uMouse = { value: [0, 0] };
      u.uStarSize = { value: 1.5 };
      u.uStarAlpha = { value: TOKENS.starAlpha };
      u.uComet = { value: [0, 0, 0, -99] };
      u.uRes = { value: [1, 1] };
      u.uN1 = { value: TOKENS.nebula1.slice() };
      u.uN2 = { value: TOKENS.nebula2.slice() };
      u.uN3 = { value: TOKENS.nebula3.slice() };
      u.uNebAlpha = { value: TOKENS.nebAlpha };

      // nebulosa: triángulo de pantalla completa con fbm en capas
      var ng = new THREE.BufferGeometry();
      ng.setAttribute("position", new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
      var nm = new THREE.ShaderMaterial({ uniforms: u, vertexShader: NEB_VERT, fragmentShader: NEB_FRAG, defines: { OCT: small ? 3 : 4 }, transparent: true, depthWrite: false, depthTest: false, blending: THREE.NormalBlending });
      nebula = new THREE.Mesh(ng, nm);
      nebula.frustumCulled = false;
      nebula.renderOrder = -2;

      // estrellas: un solo Points, profundidad en aRand.x
      var NS = small ? 700 : 1400, sp = new Float32Array(NS * 3), sr = new Float32Array(NS * 4);
      for (var si = 0; si < NS; si++) {
        var dz = rand();
        sp[si * 3] = (rand() - 0.5) * 14; sp[si * 3 + 1] = (rand() - 0.5) * 10; sp[si * 3 + 2] = -2.5 - dz * 7;
        sr[si * 4] = dz; sr[si * 4 + 1] = rand(); sr[si * 4 + 2] = rand(); sr[si * 4 + 3] = rand();
      }
      var sg = new THREE.BufferGeometry();
      sg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
      sg.setAttribute("aRand", new THREE.BufferAttribute(sr, 4));
      var sm = new THREE.ShaderMaterial({ uniforms: u, vertexShader: STAR_VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, depthTest: false, blending: TOKENS.additive ? THREE.AdditiveBlending : THREE.NormalBlending });
      stars = new THREE.Points(sg, sm);
      stars.frustumCulled = false;
      stars.renderOrder = -1;

      // cometa ocasional
      var NC = 110, cpos = new Float32Array(NC * 3), cr = new Float32Array(NC * 4);
      for (var ci = 0; ci < NC; ci++) { cr[ci * 4] = rand(); cr[ci * 4 + 1] = rand(); cr[ci * 4 + 2] = rand(); cr[ci * 4 + 3] = Math.pow(ci / (NC - 1), 1.5); }
      var cg = new THREE.BufferGeometry();
      cg.setAttribute("position", new THREE.BufferAttribute(cpos, 3));
      cg.setAttribute("aRand", new THREE.BufferAttribute(cr, 4));
      var cm = new THREE.ShaderMaterial({ uniforms: u, vertexShader: COMET_VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, depthTest: false, blending: TOKENS.additive ? THREE.AdditiveBlending : THREE.NormalBlending });
      comet = new THREE.Points(cg, cm);
      comet.frustumCulled = false;
      comet.renderOrder = 1;
      mats.push(sm, cm);

      scene.add(nebula);
      scene.add(stars);
      scene.add(points);
      scene.add(comet);
      camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
      camera.position.set(0, 0, 9);
    }

    function setCount(n) {
      count = Math.max(MIN, Math.min(MAX, Math.round(n)));
      geo.setDrawRange(0, count);
      api.particles = count;
    }

    function render() {
      renderer.render(scene, camera);
    }

    function tick(now) {
      raf = W.requestAnimationFrame(tick);
      var dtMs = lastNow ? now - lastNow : 16.7;
      lastNow = now;
      if (dtMs > 250) dtMs = 16.7;               // volvimos de una pausa
      var dt = Math.min(dtMs / 1000, 0.05);
      clock += dt;

      // frame test (adaptativo) y gobernador
      if (!firstFrame) adapt(dtMs);
      if (api.state === "fallback") return;

      if (introStart < 0) introStart = clock;
      var ip = clamp((clock - introStart) / TOKENS.intro, 0, 1);
      u.uIntro.value = easeOutExpo(ip);

      if (clock >= nextPulse) {
        if (pulseCount === 0) firePulse(0, 0.12, 1); else firePulse();
        nextPulse = clock + TOKENS.beat * (pulseCount % 3 === 0 ? 0.5 : 1);
      }

      scroll += (scrollT - scroll) * Math.min(1, dt * 7);
      mouse[0] += (mouseT[0] - mouse[0]) * Math.min(1, dt * 2.2);
      mouse[1] += (mouseT[1] - mouse[1]) * Math.min(1, dt * 2.2);

      if (clock >= nextComet) { fireComet(); nextComet = clock + 8 + rand() * 7; }

      u.uTime.value = clock;
      u.uScroll.value = scroll;
      u.uMouse.value[0] = mouse[0]; u.uMouse.value[1] = mouse[1];
      var lx = mouse[0] * 0.8, ly = mouse[1] * 0.6, lz = 0.7, ll = Math.hypot(lx, ly, lz);
      u.uLight.value[0] = lx / ll; u.uLight.value[1] = ly / ll; u.uLight.value[2] = lz / ll;
      lerpColors(u, Math.min(1, dt * 5));

      points.rotation.y = clock * 0.055 + mouse[0] * 0.38;
      points.rotation.x = 0.28 - mouse[1] * 0.22 + scroll * 0.35;
      points.position.y = -scroll * 0.6;          // parallax lejano: se queda atrás, no sube hacia el texto
      camera.position.x = mouse[0] * 0.12;
      camera.position.y = mouse[1] * 0.08;

      if (scroll < 0.999) render();
      else if (!self._cleared) renderer.clear();
      self._cleared = scroll >= 0.999;

      if (firstFrame) {
        firstFrame = false;
        // el frame ya se envió: ahora el contenedor puede hacer el crossfade
        W.requestAnimationFrame(function () {
          if (api.state !== "loading") return;
          container.setAttribute("data-3d-ready", "");
          setState("ready");
          emit(container, "ld:3d-ready", { target: "hero", particles: count, dpr: renderer.getPixelRatio(), intro: TOKENS.intro, beat: TOKENS.beat });
        });
      }
    }

    function adapt(dtMs) {
      frames.push(dtMs);
      if (test < 2) {
        // dos ventanas de 30 frames: la primera puede bajar la carga a la mitad, la segunda decide fallback
        if (frames.length < 34) return;
        var arr = frames.slice(4).sort(function (a, b) { return a - b; });
        var med = arr[arr.length >> 1];
        frames.length = 0;
        test++;
        if (med > 22) {
          if (count > MIN) setCount(count * 0.5);
          else if (med > 34) fallback("slow-device");
          else test = 2;
        } else test = 2;
        if (test === 2) frames.length = 0;
        return;
      }
      // gobernador: cada ~2 s
      if (frames.length < 120) return;
      var sum = 0;
      for (var i = 0; i < frames.length; i++) sum += frames[i];
      var avg = sum / frames.length;
      frames.length = 0;
      api.fps = Math.round(1000 / avg);
      if (avg > 20.5) {                         // debajo de ~48 fps en promedio: aliviar
        if (count > MIN) { setCount(count * 0.72); slowWins = 0; }
        else if (++slowWins >= 2 && avg > 40) fallback("slow-device");
      } else slowWins = 0;
    }

    function start() {
      if (running || api.state === "fallback" || !renderer) return;
      if (!visible || !pageVisible) return;
      running = true;
      lastNow = 0;
      raf = W.requestAnimationFrame(tick);
    }
    function stop() {
      running = false;
      if (raf) W.cancelAnimationFrame(raf);
      raf = 0;
    }
    this.start = start;
    this.stop = stop;

    this.init = function () {
      setState("loading");
      gl = getGL(canvas);
      if (!gl) { fallback("no-webgl2"); return; }
      loadThree(function (T) {
        if (!T) { fallback("three-missing"); return; }
        if (reduced()) { fallback("reduced-motion"); return; }
        THREE = T;
        try {
          renderer = new THREE.WebGLRenderer({ canvas: canvas, context: gl, alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: true, powerPreference: "high-performance" });
          renderer.setClearColor(0x000000, 0);
          build();
        } catch (e) { fallback("init-error"); return; }
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.addEventListener("webglcontextlost", function (e) { e.preventDefault(); fallback("context-lost"); }, false);
        api.particles = count;
        measure();
        onScroll();
        scroll = scrollT;

        W.addEventListener("scroll", onScroll, { passive: true });
        W.addEventListener("resize", function () { measure(); onScroll(); }, { passive: true });
        if ("ResizeObserver" in W) new ResizeObserver(function () { measure(); }).observe(container);
        if (mqCoarse && mqCoarse.matches) W.addEventListener("deviceorientation", onTilt, { passive: true });
        else W.addEventListener("pointermove", onPointer, { passive: true });

        if ("IntersectionObserver" in W) {
          new IntersectionObserver(function (entries) {
            visible = entries[entries.length - 1].isIntersecting;
            if (visible) start(); else stop();
          }).observe(container);
        }
        D.addEventListener("visibilitychange", function () {
          pageVisible = !D.hidden;
          if (pageVisible) start(); else stop();
        });
        themeListeners.push(function (tk) {
          if (!mat) return;
          for (var mi = 0; mi < mats.length; mi++) mats[mi].blending = tk.additive ? THREE.AdditiveBlending : THREE.NormalBlending;
          u.uBeat.value = tk.beat;
          if (!running) lerpColors(u, 1);
        });
        onMQ(mqReduce, function () { if (reduced()) fallback("reduced-motion"); });

        api.snapshot = snapshot;
        start();
      });
    };

    /* Render estático para el fallback (lo usa el script de capturas). */
    function snapshot(opts) {
      opts = opts || {};
      var w = opts.width || 1600, h = opts.height || 1200;
      stop();
      var prevDpr = renderer.getPixelRatio(), prevCount = count;
      setCount(opts.count || MAX);
      renderer.setPixelRatio(1);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.set(0, 0, frameZ(camera.aspect));
      camera.updateProjectionMatrix();
      u.uSize.value = 26 * (h / 900) * (opts.sizeScale || 1);
      u.uStarSize.value = 2.1 * (h / 900) * (opts.sizeScale || 1);
      u.uRes.value = [w, h];
      u.uMouse.value = [0, 0];
      lerpColors(u, 1);
      var t = opts.time != null ? opts.time : 4.2;
      u.uTime.value = t;
      u.uIntro.value = 1;
      u.uScroll.value = 0;
      u.uLight.value = [0.25, 0.3, 0.92];
      for (var i = 0; i < 16; i++) pulses[i] = 0;
      // tres mensajes en distintas etapas de su viaje
      var P = [[0.2, 0.25, 0.95, t - 0.35], [-0.75, 0.35, 0.56, t - 1.25], [0.55, -0.6, 0.58, t - 2.1], [0, 0, 1, t - 9]];
      for (i = 0; i < 4; i++) {
        var l = Math.hypot(P[i][0], P[i][1], P[i][2]);
        pulses[i * 4] = P[i][0] / l; pulses[i * 4 + 1] = P[i][1] / l; pulses[i * 4 + 2] = P[i][2] / l; pulses[i * 4 + 3] = P[i][3];
      }
      u.uComet.value = [-3.3, 2.2, -0.52, t - 0.85];
      points.rotation.set(0.28, 0.4, 0);
      points.position.y = 0;
      if (opts.opaque) { var b = TOKENS.bg; renderer.setClearColor(((b[0] * 255) << 16) | ((b[1] * 255) << 8) | (b[2] * 255 | 0), 1); }
      render();
      var url = canvas.toDataURL(opts.type || "image/webp", opts.quality || 0.86);
      // restaurar
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(prevDpr);
      setCount(prevCount);
      camera.position.set(0, 0, 9);
      u.uRes.value = [1, 1];
      measure();
      start();
      return url;
    }
  }

  /* =====================================================================
   * TIENDA (opcional): objeto chico que cambia de forma por nivel
   * ===================================================================== */
  function Shop(container) {
    var THREE, renderer, scene, camera, points, geo, mat, u, canvas;
    var N = 2600;
    var level = 0, levelT = 0, gotActEvent = false;
    var raf = 0, running = false, visible = false, pageVisible = !D.hidden, clock = 0, lastNow = 0;

    function setLevel(n) {
      levelT = clamp(n, 0, 2);
      if (!running && renderer) start();
    }
    D.addEventListener("ld:shop-act", function (e) {
      var d = e.detail || {};
      gotActEvent = true;
      if (d.index != null) setLevel(+d.index);
      else setLevel((+(d.act != null ? d.act : d.nivel != null ? d.nivel : d.level) || 1) - 1);
    });
    D.addEventListener("ld:scene-progress", function (e) {
      var d = e.detail || {};
      if (gotActEvent || d.scene !== "tienda") return;
      setLevel(Math.min(2, Math.floor(clamp(+d.progress || 0, 0, 0.999) * 3)));
    });

    function shapes() {
      var A = new Float32Array(N * 3), B = new Float32Array(N * 3), C = new Float32Array(N * 3), R = new Float32Array(N * 4);
      for (var i = 0; i < N; i++) {
        var f = i / N, o = i * 3;
        // 1 · simple: un anillo
        var a = f * TAU, rj = 1 + (rand() - 0.5) * 0.05;
        A[o] = Math.cos(a) * rj; A[o + 1] = (rand() - 0.5) * 0.05; A[o + 2] = Math.sin(a) * rj;
        // 2 · intermedio: esfera
        var y = 1 - f * 2, rr = Math.sqrt(1 - y * y), th = i * 2.399963229728653;
        B[o] = Math.cos(th) * rr * 0.95; B[o + 1] = y * 0.95; B[o + 2] = Math.sin(th) * rr * 0.95;
        // 3 · premium: nudo toroidal (2,3) con tubo
        var t = f * TAU, q = 2 + Math.cos(3 * t);
        var kx = q * Math.cos(2 * t), ky = q * Math.sin(2 * t), kz = Math.sin(3 * t);
        var tube = 0.16 * Math.sqrt(rand()), ang = rand() * TAU;
        C[o] = (kx + Math.cos(ang) * tube * 2) * 0.36; C[o + 1] = (ky + Math.sin(ang) * tube * 2) * 0.36; C[o + 2] = (kz + Math.cos(ang + 1.3) * tube * 2) * 0.36;
        R[i * 4] = rand(); R[i * 4 + 1] = rand(); R[i * 4 + 2] = rand(); R[i * 4 + 3] = f;
      }
      return [A, B, C, R];
    }

    function measure() {
      var w = container.clientWidth, h = container.clientHeight;
      if (!w || !h || !renderer) return false;
      renderer.setPixelRatio(Math.min(W.devicePixelRatio || 1, DPR_MAX));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      var half = Math.tan((camera.fov * Math.PI) / 360);
      camera.position.z = 1.35 / (half * Math.min(1, camera.aspect)) + 0.3;
      camera.updateProjectionMatrix();
      u.uSize.value = 30 * renderer.getPixelRatio() * Math.min(1.4, Math.max(0.6, h / 360));
      return true;
    }

    function tick(now) {
      raf = W.requestAnimationFrame(tick);
      var dt = Math.min((lastNow ? now - lastNow : 16.7) / 1000, 0.05);
      lastNow = now;
      clock += dt;
      level += (levelT - level) * Math.min(1, dt * 2.4);
      u.uTime.value = clock;
      u.uLevel.value = level;
      lerpColors(u, Math.min(1, dt * 5));
      points.rotation.y = clock * 0.25;
      points.rotation.x = 0.35 + Math.sin(clock * 0.3) * 0.12;
      renderer.render(scene, camera);
    }
    function start() {
      if (running || !renderer || !visible || !pageVisible) return;
      running = true; lastNow = 0;
      raf = W.requestAnimationFrame(tick);
    }
    function stop() { running = false; if (raf) W.cancelAnimationFrame(raf); raf = 0; }

    this.init = function () {
      loadThree(function (T) {
        if (!T || reduced()) return;
        THREE = T;
        canvas = D.createElement("canvas");
        canvas.className = "shop-canvas";
        canvas.setAttribute("aria-hidden", "true");
        canvas.style.cssText = "display:block;width:100%;height:100%;pointer-events:none";
        var gl = getGL(canvas);
        if (!gl) return;
        try {
          renderer = new THREE.WebGLRenderer({ canvas: canvas, context: gl, alpha: true, antialias: false, depth: false, stencil: false });
          renderer.setClearColor(0x000000, 0);
        } catch (e) { renderer = null; return; }
        var s = shapes();
        geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(s[0], 3));
        geo.setAttribute("aB", new THREE.BufferAttribute(s[1], 3));
        geo.setAttribute("aC", new THREE.BufferAttribute(s[2], 3));
        geo.setAttribute("aRand", new THREE.BufferAttribute(s[3], 4));
        u = colorUniforms();
        u.uTime = { value: 0 };
        u.uBeat = { value: TOKENS.beat };
        u.uLevel = { value: 0 };
        u.uSize = { value: 30 };
        mat = new THREE.ShaderMaterial({ uniforms: u, vertexShader: SHOP_VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, depthTest: false, blending: TOKENS.additive ? THREE.AdditiveBlending : THREE.NormalBlending });
        points = new THREE.Points(geo, mat);
        points.frustumCulled = false;
        scene = new THREE.Scene();
        scene.add(points);
        camera = new THREE.PerspectiveCamera(34, 1, 0.1, 30);
        camera.position.set(0, 0, 5);
        container.appendChild(canvas);
        measure();
        if ("ResizeObserver" in W) new ResizeObserver(function () { measure(); }).observe(container);
        new IntersectionObserver(function (entries) {
          visible = entries[entries.length - 1].isIntersecting;
          if (visible) start(); else stop();
        }).observe(container);
        D.addEventListener("visibilitychange", function () { pageVisible = !D.hidden; if (pageVisible) start(); else stop(); });
        themeListeners.push(function (tk) { if (mat) { mat.blending = tk.additive ? THREE.AdditiveBlending : THREE.NormalBlending; u.uBeat.value = tk.beat; } });
        onMQ(mqReduce, function () { if (reduced()) { stop(); if (canvas.parentNode) canvas.parentNode.removeChild(canvas); renderer.dispose(); renderer = null; } });
        container.setAttribute("data-3d-ready", "");
        emit(container, "ld:3d-ready", { target: "shop", particles: N });
        api.shop = { setLevel: setLevel, get level() { return levelT; } };
      });
    };
  }

  /* =====================================================================
   * Arranque
   * ===================================================================== */
  function boot() {
    var heroEl = D.querySelector('[data-3d="hero"]');
    var shopEl = D.querySelector('[data-3d="shop"]');
    var hero = null;

    if (heroEl && heroEl.querySelector("canvas[data-3d-canvas]")) {
      hero = new Hero(heroEl);
      var why = MODE === "off" ? "disabled" : reduced() ? "reduced-motion" : lowEndDevice();
      if (why) hero.fallback(why);
      else {
        heroEl.setAttribute("data-3d-state", "waiting");
        afterLoadIdle(function () { whenNear(heroEl, "100px", function () { hero.init(); }); });
      }
      // si después se activa reduced-motion antes de cargar, no arranca (lo chequea init)
    }

    if (shopEl && MODE !== "off" && !reduced() && !lowEndDevice()) {
      var shop = new Shop(shopEl);
      afterLoadIdle(function () {
        whenNear(shopEl, "300px", function () {
          // el slot es opcional: si 08 no le da tamaño, no hay nada que pintar
          if (shopEl.clientWidth && shopEl.clientHeight) { shop.init(); return; }
          if (!("ResizeObserver" in W)) return;
          var ro = new ResizeObserver(function () {
            if (shopEl.clientWidth && shopEl.clientHeight) { ro.disconnect(); shop.init(); }
          });
          ro.observe(shopEl);
        });
      });
    }
  }

  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
