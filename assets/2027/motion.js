/*!
 * motion.js · Portafolio 2027 "Señal en el abismo"
 * Dueño: agente 04 (motion GSAP + diagrama de sistemas).
 *
 * Reglas que cumple este archivo:
 *  - Sin JS (o si GSAP no cargó) todo queda visible: los estados iniciales se ponen acá, nunca en CSS.
 *  - gsap.matchMedia(): desktop (≥1024), mobile y reduced-motion. Reduced = cero tweens.
 *  - Solo transform, opacity y clip-path (excepción pedida: tween de peso variable del H1).
 *  - Nada anima fuera de vista: los loops (cinta, paquetes, cue) se pausan con ScrollTrigger.
 *  - Sin preloader ni scroll hijack. ScrollTrigger.refresh() tras fuentes, imágenes y layout de otros agentes.
 *  - No toca el interior de [data-bot-demo] (06) ni [data-shop] (08).
 *
 * API pública: window.LD_MOTION = { ready, reduced, ease, dur, refresh() } + evento "ld:motion-ready".
 * Emite "ld:scene-progress" (bubbles) en cada <section data-scene>: detail { scene, progress, direction }.
 * Escucha en document: "ld:work-filtered", "ld:shop-ready", "ld:layout-change" → refresh.
 */
(function () {
  "use strict";

  var w = window, d = document, root = d.documentElement;
  var gsap = w.gsap, ScrollTrigger = w.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return; // sin GSAP: el sitio queda completo y quieto

  var SplitText = w.SplitText, DrawSVG = w.DrawSVGPlugin, MotionPath = w.MotionPathPlugin,
    CustomEase = w.CustomEase, Scramble = w.ScrambleTextPlugin, Flip = w.Flip;
  gsap.registerPlugin.apply(gsap, [ScrollTrigger, SplitText, DrawSVG, MotionPath, CustomEase, Scramble, Flip].filter(Boolean));
  gsap.config({ nullTargetWarn: false });
  ScrollTrigger.config({ ignoreMobileResize: true });

  root.classList.add("ld-motion");

  /* ───────────────────────── tokens ───────────────────────── */
  var cs = getComputedStyle(root);
  function css(name) { return cs.getPropertyValue(name).trim(); }
  function sec(name, fb) {
    var v = css(name);
    if (!v) return fb;
    var n = parseFloat(v);
    if (isNaN(n)) return fb;
    return /ms$/.test(v) ? n / 1000 : n;
  }
  function px(name, fb) { var n = parseFloat(css(name)); return isNaN(n) ? fb : n; }

  var easeN = 0;
  function easeFrom(ptsVar, cssVar, fallback) {
    if (!CustomEase) return fallback;
    try {
      var pts = ptsVar ? css(ptsVar).replace(/["']/g, "") : "";
      if (pts) return CustomEase.create("ld" + (easeN++), pts);
      var v = cssVar ? css(cssVar) : "";
      var m = /cubic-bezier\(([^)]+)\)/.exec(v);
      if (m) return CustomEase.create("ld" + (easeN++), m[1]);
      m = /^linear\(([^)]+)\)$/.exec(v);
      if (m) { // linear(v0, v1, …) equiespaciado → path SVG para CustomEase
        var ys = m[1].split(",").map(function (s) { return parseFloat(s); });
        if (ys.length > 2 && ys.every(function (y) { return !isNaN(y); })) {
          var path = "M0,0";
          ys.forEach(function (y, i) { if (i) path += " L" + (i / (ys.length - 1)).toFixed(4) + "," + y; });
          return CustomEase.create("ld" + (easeN++), path);
        }
      }
    } catch (e) { /* cae al fallback */ }
    return fallback;
  }

  var E = {
    expo: easeFrom("--ease-out-expo-pts", null, "expo.out"),
    quart: easeFrom("--ease-out-quart-pts", null, "power3.out"),
    circ: easeFrom("--ease-out-circ-pts", null, "circ.out"),
    quint: easeFrom("--ease-in-out-quint-pts", null, "power4.inOut"),
    spring: easeFrom(null, "--ease-spring", "back.out(1.7)"),
    springSoft: easeFrom(null, "--ease-spring-soft", "back.out(1.2)"),
    exit: easeFrom(null, "--ease-exit", "power3.in")
  };
  var D = {
    slow: sec("--dur-slow", 0.52), slower: sec("--dur-slower", 0.9),
    cinematic: sec("--dur-cinematic", 1.4), epic: sec("--dur-epic", 2.2), beat: sec("--beat", 2.8)
  };
  var S = {
    chars: sec("--stagger-chars", 0.018), words: sec("--stagger-words", 0.045), lines: sec("--stagger-lines", 0.09),
    rows: sec("--stagger-rows", 0.12), blocks: sec("--stagger-blocks", 0.18)
  };
  // Con reduced-motion los tokens valen 1 ms: si el usuario lo apaga en vivo, uso valores sanos.
  if (D.cinematic < 0.1) { D.slow = 0.52; D.slower = 0.9; D.cinematic = 1.4; D.epic = 2.2; S = { chars: 0.018, words: 0.045, lines: 0.09, rows: 0.12, blocks: 0.18 }; }
  var SCRUB = sec("--scrub", 0.8) || 0.8;
  var PERSPECTIVE = px("--perspective", 1400), DEPTH_STEP = px("--depth-step", -140), DEPTH_TILT = px("--depth-tilt", 14);

  /* ───────────────────────── utilidades ───────────────────────── */
  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function anim(el, token) { return (" " + (el.getAttribute("data-anim") || "") + " ").indexOf(" " + token + " ") > -1; }
  function num(v, fb) { var n = parseFloat(v); return isNaN(n) ? fb : n; }
  function sceneOf(el) { var s = el.closest("[data-scene]"); return s ? s.getAttribute("data-scene") : ""; }
  function vh() { return w.innerHeight; }
  function fits(el) { return el.offsetHeight <= vh() * 0.94; }
  function navH() { var n = d.querySelector("[data-nav]"); return n ? Math.round(n.getBoundingClientRect().bottom) + 8 : 0; }
  // Inicio de pin: centrado si entra en pantalla; si es más alto, pegado debajo del nav
  function pinStart(el) { return function () { return fits(el) ? "center center" : "top " + navH() + "px"; }; }
  function pad(n, len) { var s = String(n); while (s.length < len) s = "0" + s; return s; }

  var INSET = {
    full: "inset(0% 0% 0% 0%)",
    up: "inset(100% 0% 0% 0%)",     // aparece de abajo hacia arriba
    down: "inset(0% 0% 100% 0%)",   // aparece de arriba hacia abajo (barrido)
    ltr: "inset(0% 100% 0% 0%)",    // izquierda → derecha (señal que llega)
    rtl: "inset(0% 0% 0% 100%)",
    center: "inset(0% 50% 0% 50%)"
  };
  var NUDGE = { up: { y: "1.1rem" }, down: { y: "-0.9rem" }, ltr: { x: "-1.4rem" }, rtl: { x: "1.4rem" }, center: { scale: 0.97 } };

  // Valor neutro (estado final) para cada propiedad que aparece en un "from".
  function neutral(from) {
    var to = {};
    for (var k in from) {
      if (k === "transformOrigin" || k === "transformPerspective") continue;
      if (k === "clipPath") to[k] = INSET.full;
      else if (k === "opacity" || k === "autoAlpha" || k === "scale" || k === "scaleX" || k === "scaleY") to[k] = 1;
      else to[k] = 0;
    }
    return to;
  }
  function assign(a) { for (var i = 1; i < arguments.length; i++) { var b = arguments[i]; if (b) for (var k in b) a[k] = b[k]; } return a; }

  function emit(sectionEl, scene, progress, direction, extra) {
    sectionEl.dispatchEvent(new CustomEvent("ld:scene-progress", {
      bubbles: true,
      detail: assign({ scene: scene, progress: Math.round(progress * 10000) / 10000, direction: direction || 1 }, extra)
    }));
  }

  // Contador numérico (proxy → textContent). El texto final ya está en el HTML.
  function counter(el, opts) {
    var to = num(el.getAttribute("data-count-to"), num(el.textContent, 0));
    var from = num(el.getAttribute("data-count-from"), 0);
    var len = parseInt(el.getAttribute("data-count-pad") || "0", 10) || 0;
    var finalText = el.textContent;
    var o = { v: from };
    return gsap.fromTo(o, { v: from }, assign({
      v: to, ease: E.circ, duration: D.slower,
      onUpdate: function () { el.textContent = pad(Math.round(o.v), len); },
      onComplete: function () { el.textContent = finalText; }
    }, opts));
  }

  /* ───────────────────────── refresh coordinado ───────────────────────── */
  var refreshTimer = 0;
  function refresh() {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(function () {
      try { ScrollTrigger.sort(); ScrollTrigger.refresh(); } catch (e) { /* noop */ }
    }, 120);
  }

  /* ───────────────────────── variantes por escena ─────────────────────────
     Ninguna escena repite la coreografía de otra. */
  var LINES = { // h1/h2 [data-anim~=split-lines]
    chatbots: "rise", web: "flip", sistemas: "wipe", trabajos: "slide", tienda: "weight",
    seguridad: "scan", proceso: "quint", sobre: "drop",
    offer: "rise", demo: "rise", casos: "slide", alcance: "scan", faq: "wipe"
  };
  var MASK = { // [data-anim~=mask-reveal]
    hero: "ltr", stack: "up", chatbots: "up", web: "rtl", sistemas: "ltr", trabajos: "ltr", tienda: "up",
    seguridad: "down", proceso: "down", sobre: "up", cta: "center", offer: "up", casos: "ltr", alcance: "down", faq: "up"
  };
  var LIST = { // [data-anim~=stagger-list]
    chatbots: "ltr", web: "flip", sistemas: "log", seguridad: "down", sobre: "tape", cta: "cells",
    offer: "rise", casos: "ltr", alcance: "down", faq: "rise"
  };

  function linesFrom(kind) {
    switch (kind) {
      case "flip": return { yPercent: 55, rotationX: -88, opacity: 0, transformOrigin: "50% 100%", transformPerspective: 900 };
      case "wipe": return { clipPath: INSET.ltr, x: "-0.4em" };
      case "slide": return { xPercent: 104 };
      case "scan": return { clipPath: INSET.down, yPercent: -18 };
      case "drop": return { yPercent: -112, rotate: -2, transformOrigin: "100% 0%" };
      case "weight": return { yPercent: 105 };
      default: return { yPercent: 112, rotate: 2.5, transformOrigin: "0% 100%" }; // rise / quint
    }
  }

  /* ───────────────────────── arranque ───────────────────────── */
  var mm = gsap.matchMedia();
  var api = w.LD_MOTION = {
    ready: false, reduced: false, ease: E, dur: D, stagger: S,
    refresh: refresh, matchMedia: mm
  };

  function fontsReady(maxMs) {
    return new Promise(function (res) {
      var done = false; function ok() { if (!done) { done = true; res(); } }
      setTimeout(ok, maxMs);
      if (d.fonts && d.fonts.ready) d.fonts.ready.then(ok, ok); else ok();
    });
  }

  try {
    mm.add({
      desk: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      mob: "(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)",
      reduce: "(prefers-reduced-motion: reduce)"
    }, function (ctx) {
      var c = ctx.conditions;
      api.reduced = !!c.reduce;
      if (c.reduce) return reducedSetup();
      return build(!!c.desk, ctx);
    });
  } catch (err) {
    failSafe(err);
  }

  function failSafe(err) {
    try { mm.revert(); } catch (e) { /* noop */ }
    root.classList.remove("ld-motion");
    if (w.console && console.warn) console.warn("[motion] desactivado:", err);
  }

  /* reduced-motion: ningún tween. Solo aviso a 06 que la demo puede mostrarse completa. */
  function reducedSetup() {
    $$("section[data-scene='chatbots']").forEach(function (s) { emit(s, "chatbots", 1, 1, { reduced: true }); });
    // Estado final directo (sin scroll-driven): todos los pasos del proceso encendidos
    var lit = $$(".steps li[data-step]");
    lit.forEach(function (li) { li.classList.add("is-lit"); });
    return function () { lit.forEach(function (li) { li.classList.remove("is-lit"); }); };
  }

  /* ═══════════════════════════ build ═══════════════════════════ */
  function build(desk, ctx) {
    var cleanups = [];
    var handled = new Set();
    api._ctx = ctx; // contexto activo: lo asíncrono (intro del hero) se registra acá y se revierte con él
    cleanups.push(function () { if (api._ctx === ctx) api._ctx = null; });
    function mark(list) { (list || []).forEach(function (el) { if (el) handled.add(el); }); }

    try {
      hero(desk, mark, cleanups);
      stack(desk, mark, cleanups);
      chatbots(desk, mark);
      web(desk, mark);
      sistemas(desk, mark, cleanups);
      trabajos(desk, mark);
      seguridad(desk, mark, cleanups);
      proceso(desk, mark, cleanups);
      sobre(desk, mark);
      cta(desk, mark, cleanups);
      generic(desk, handled);
      parallax(desk);
      progressEmitters();
    } catch (err) {
      setTimeout(function () { failSafe(err); }, 0);
    }

    return function () { cleanups.forEach(function (fn) { try { fn(); } catch (e) { /* noop */ } }); };
  }

  /* ───────────── 1 · HERO: la señal se enciende ───────────── */
  function hero(desk, mark, cleanups) {
    $$("section[data-scene='hero']").forEach(function (heroEl) {
      var h1 = $("h1", heroEl);
      var eyebrow = $(".eyebrow", heroEl);
      var lead = $(".lead", heroEl);
      var actions = $(".actions", heroEl);
      var sign = $(".hero-sign", heroEl);
      var visual = $("[data-3d='hero']", heroEl);
      var signal = $$(".hero-signal li", heroEl);
      var clockNums = $$(".hero-clock [data-anim~='count']", heroEl);
      var clock = $(".hero-clock", heroEl);
      var cue = $("[data-anim~='cue']", heroEl);
      var copy = $(".hero-copy", heroEl) || (h1 && h1.parentElement);
      var btns = actions ? Array.prototype.slice.call(actions.children) : [];
      var leadDelay = lead ? num(lead.getAttribute("data-anim-delay"), 0.5) : 0.5;
      var actDelay = actions ? num(actions.getAttribute("data-anim-delay"), 0.8) : 0.8;
      var signDelay = sign ? num(sign.getAttribute("data-anim-delay"), 1) : 1;
      mark([h1, eyebrow, lead, actions, sign, cue].concat(clockNums));

      var at = desk ? "68% 46%" : "50% 32%";
      // Estados de partida inmediatos (evitan el destello del texto antes del split)
      if (h1) gsap.set(h1, { autoAlpha: 0 });
      if (visual) gsap.set(visual, { clipPath: "circle(0% at " + at + ")" });
      if (lead) gsap.set(lead, { clipPath: INSET.ltr });
      if (sign) gsap.set(sign, { clipPath: INSET.ltr });
      if (eyebrow) gsap.set(eyebrow, { clipPath: INSET.ltr });
      if (btns.length) gsap.set(btns, { autoAlpha: 0, scale: 0.6 });
      if (signal.length) gsap.set(signal, { autoAlpha: 0, scale: 0.82, x: desk ? 40 : 16, transformOrigin: "100% 100%" });
      if (cue) gsap.set(cue, { clipPath: INSET.up });

      var started = false;
      var safety = setTimeout(go, 700); // jamás bloquea: a los 0.7 s arranca igual
      cleanups.push(function () { clearTimeout(safety); });

      // Coordinación con 05: esperamos data-3d-ready hasta 450 ms (no es un preloader: el fallback ya se ve)
      var wait3d = new Promise(function (res) {
        if (!visual || visual.hasAttribute("data-3d-ready")) return res();
        var t = setTimeout(res, 350);
        var mo = new MutationObserver(function () { if (visual.hasAttribute("data-3d-ready")) { clearTimeout(t); mo.disconnect(); res(); } });
        mo.observe(visual, { attributes: true, attributeFilter: ["data-3d-ready"] });
        cleanups.push(function () { mo.disconnect(); clearTimeout(t); });
      });
      Promise.all([fontsReady(400), wait3d]).then(go);

      function go() {
        if (started) return; started = true; clearTimeout(safety);
        ctxAdd(function () { intro(); });
      }

      function intro() {
        var tl = gsap.timeline({
          defaults: { ease: E.expo },
          onStart: function () { d.dispatchEvent(new CustomEvent("ld:hero-intro", { detail: { phase: "start", ready3d: !!(visual && visual.hasAttribute("data-3d-ready")) } })); },
          onComplete: function () { d.dispatchEvent(new CustomEvent("ld:hero-intro", { detail: { phase: "done" } })); heroEl.classList.add("is-intro-done"); }
        });

        if (visual) tl.to(visual, { clipPath: "circle(150% at " + at + ")", duration: 1.6, ease: E.quint, clearProps: "clipPath" }, 0);

        if (eyebrow) {
          var txt = eyebrow.textContent;
          tl.to(eyebrow, { clipPath: INSET.full, duration: 0.55, clearProps: "clipPath" }, 0.05);
          if (Scramble) tl.to(eyebrow, { duration: 1, scrambleText: { text: txt, chars: "01<>/·→", speed: 0.7, revealDelay: 0.25 } }, 0.05);
        }

        if (h1 && SplitText) {
          var finalW = parseFloat(getComputedStyle(h1).fontWeight) || 720;
          var thin = num(css("--weight-display-thin"), 260);
          var first = true;
          SplitText.create(h1, {
            type: "lines", mask: "lines", linesClass: "ld-line", autoSplit: true, aria: "auto",
            onSplit: function (self) {
              gsap.set(h1, { autoAlpha: 1 });
              if (!first) return; // re-split por resize: el texto queda en su estado final
              first = false;
              var weightTargets = self.lines.concat($$(".accent", h1));
              tl.from(self.lines, { yPercent: 115, rotate: 2.5, transformOrigin: "0% 100%", duration: 1.15, stagger: S.lines }, 0.2);
              tl.fromTo(weightTargets, { fontWeight: thin }, { fontWeight: finalW, duration: 1.35, ease: E.quart, stagger: S.lines }, 0.2);
            }
          });
        } else if (h1) {
          gsap.set(h1, { autoAlpha: 1 });
        }

        if (lead) tl.to(lead, { clipPath: INSET.full, duration: D.slower, clearProps: "clipPath" }, leadDelay + 0.15);
        if (btns.length) tl.to(btns, { autoAlpha: 1, scale: 1, duration: 0.7, ease: E.spring, stagger: 0.08 }, actDelay);
        if (sign) tl.to(sign, { clipPath: INSET.full, duration: D.slower, clearProps: "clipPath" }, signDelay);
        if (signal.length) tl.to(signal, { autoAlpha: 1, scale: 1, x: 0, duration: D.slow * 1.4, ease: E.springSoft, stagger: D.beat / 10 }, 0.9);
        clockNums.forEach(function (n) { tl.add(counter(n, { duration: 1.3 }), 0.45); });
        if (cue) tl.to(cue, { clipPath: INSET.full, duration: 0.6, clearProps: "clipPath" }, 1.25);
      }

      // gsap.context de matchMedia: lo que se crea tarde (después de esperar fuentes/3D) también se revierte
      function ctxAdd(fn) { if (api._ctx) api._ctx.add(fn); else fn(); }

      // Salida del hero con el scroll (scrub): el hero "manda" la señal a la escena siguiente
      var out = gsap.timeline({ scrollTrigger: { trigger: heroEl, start: "top top", end: "bottom top", scrub: SCRUB } });
      if (copy) out.to(copy, { y: function () { return -vh() * 0.14; }, opacity: 0.12, ease: "none" }, 0);
      if (visual) out.to(visual, { yPercent: 10, scale: 0.9, ease: "none" }, 0);
      if (clock) out.to(clock, { y: function () { return -vh() * 0.3; }, ease: "none" }, 0);
      if (cue) out.to(cue, { opacity: 0, ease: "none", duration: 0.25 }, 0);

      // Cue: latido vertical solo mientras el hero se ve
      if (cue) {
        var bob = gsap.to(cue, { y: 8, duration: D.beat / 2, ease: "sine.inOut", yoyo: true, repeat: -1, paused: true });
        ScrollTrigger.create({ trigger: heroEl, start: "top bottom", end: "bottom top", onToggle: function (s) { s.isActive ? bob.play() : bob.pause(); } });
      }
    });
  }

  /* ───────────── 2 · STACK: cinta atada a la velocidad del scroll ───────────── */
  function stack(desk, mark, cleanups) {
    $$("[data-marquee]").forEach(function (mq) {
      var track = $("[data-marquee-track]", mq);
      if (!track) return;
      var clone = track.cloneNode(true);
      clone.removeAttribute("data-marquee-track");
      clone.setAttribute("data-marquee-clone", "");
      clone.setAttribute("aria-hidden", "true");
      clone.setAttribute("inert", "");
      mq.appendChild(clone);
      cleanups.push(function () { clone.remove(); });

      var disp = getComputedStyle(mq).display;
      if (disp !== "flex" && disp !== "inline-flex") gsap.set(mq, { display: "flex", overflow: "hidden" });
      var tracks = [track, clone];
      gsap.set(tracks, { flexShrink: 0 });

      var speed = desk ? 70 : 45; // px por segundo a velocidad base
      var loop = gsap.to(tracks, { xPercent: -100, ease: "none", duration: Math.max(12, track.scrollWidth / speed), repeat: -1, paused: true });
      var skewTo = gsap.quickTo(tracks, "skewX", { duration: 0.5, ease: "power3" });
      var dir = 1, settle;

      ScrollTrigger.create({
        trigger: mq, start: "top bottom", end: "bottom top",
        onToggle: function (s) { s.isActive ? loop.play() : loop.pause(); },
        onUpdate: function (s) {
          var v = s.getVelocity();
          dir = v < 0 ? -1 : 1;
          var ts = dir * Math.min(7, 1 + Math.abs(v) / 260);
          gsap.to(loop, { timeScale: ts, duration: 0.25, overwrite: true });
          skewTo(gsap.utils.clamp(-7, 7, v / -320));
          clearTimeout(settle);
          settle = setTimeout(function () {
            gsap.to(loop, { timeScale: dir, duration: 1.4, ease: "power2.out", overwrite: true });
            skewTo(0);
          }, 140);
        }
      });
      cleanups.push(function () { clearTimeout(settle); });
    });
  }

  /* ───────────── 3 · CHATBOTS: escena pinneada, el scroll es el reloj ───────────── */
  function chatbots(desk, mark) {
    $$("section[data-scene='chatbots']").forEach(function (s) {
      var pinEl = $(".scene-pin", s);
      var demo = $("[data-bot-demo]", s);
      var feats = $(".scene-pin .feature-list", s);
      var clock = $(".giant-clock", s);
      var items = feats ? Array.prototype.slice.call(feats.children) : [];

      // El reloj gigante: scramble de dígitos al entrar y deriva lateral con el scroll
      if (clock) {
        mark([clock]);
        var txt = clock.textContent;
        ScrollTrigger.create({
          trigger: clock, start: "top 85%",
          onEnter: function () { if (Scramble) gsap.to(clock, { duration: 1.1, scrambleText: { text: txt, chars: "0123456789", speed: 0.5 } }); }
        });
        gsap.fromTo(clock, { x: desk ? "6vw" : "3vw" }, { x: desk ? "-6vw" : "-3vw", ease: "none", scrollTrigger: { trigger: s, start: "top bottom", end: "bottom top", scrub: SCRUB } });
      }

      var canPin = desk && pinEl && anim(pinEl, "pin");
      if (canPin) {
        mark([feats]);
        var len = pinEl.getAttribute("data-pin-length") || "160%";
        var tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: pinEl, pin: true, scrub: SCRUB, anticipatePin: 1, invalidateOnRefresh: true,
            start: pinStart(pinEl),
            end: "+=" + len,
            onUpdate: function (st) { emit(s, "chatbots", st.progress, st.direction, { pinned: true }); },
            onRefresh: function (st) { emit(s, "chatbots", st.progress, 1, { pinned: true }); }
          }
        });
        // Cada capacidad se "enciende" a medida que la charla avanza (fuera del DOM de 06)
        var step = 1;
        items.forEach(function (it, i) {
          tl.fromTo(it, { opacity: 0.22, x: -18, clipPath: "inset(0% 12% 0% 0%)" }, { opacity: 1, x: 0, clipPath: INSET.full, duration: step * 0.7, ease: E.quart }, i * step + 0.3);
        });
        tl.to({}, { duration: 0.6 }); // cola: la última burbuja respira antes de soltar el pin
      } else if (demo || pinEl) {
        // Mobile / sin pin: el progreso es el paso de la demo por la pantalla
        var tgt = demo || pinEl;
        ScrollTrigger.create({
          trigger: tgt, start: "top 78%", end: "bottom 45%",
          onUpdate: function (st) { emit(s, "chatbots", st.progress, st.direction, { pinned: false }); }
        });
      }
    });
  }

  /* ───────────── 4 · WEB: capturas que se apilan en 3D ───────────── */
  function web(desk, mark) {
    $$("[data-web-stack]").forEach(function (stackEl) {
      var shots = $$("[data-web-shot]", stackEl);
      if (!shots.length) return;
      shots.sort(function (a, b) { return num(a.getAttribute("data-depth"), 0) - num(b.getAttribute("data-depth"), 0); });
      var r0 = shots[0].getBoundingClientRect();
      var overlapped = shots.every(function (sh) {
        var r = sh.getBoundingClientRect();
        return Math.abs(r.top - r0.top) < 60 && Math.abs(r.left - r0.left) < 60;
      });

      if (overlapped) {
        gsap.set(stackEl, { perspective: PERSPECTIVE, transformStyle: "preserve-3d" });
        var tilt = DEPTH_TILT * (desk ? 0.55 : 0.4);
        var tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: stackEl, start: "top 92%", end: "bottom 15%", scrub: SCRUB } });
        // Fase 1: llegan de atrás hacia adelante (la más profunda primero) y aterrizan en la pila
        shots.slice().reverse().forEach(function (sh, i) {
          var dep = num(sh.getAttribute("data-depth"), 0);
          gsap.set(sh, { zIndex: 10 - dep, transformOrigin: "50% 100%", force3D: true });
          tl.fromTo(sh,
            { y: function () { return vh() * (desk ? 0.55 : 0.35); }, z: desk ? 420 : 200, rotationX: -38, rotationY: desk ? 14 : 0, opacity: 0 },
            { y: dep * (desk ? -26 : -14), x: dep * (desk ? 22 : 10), z: dep * DEPTH_STEP * (desk ? 1 : 0.6), rotationX: tilt, rotationY: desk ? -9 : 0, opacity: 1 - dep * 0.12, duration: 1, ease: E.expo },
            i * 0.32);
        });
        // Teclado: la captura con foco pasa al frente y queda opaca; al salir vuelve a la pila
        stackEl.addEventListener("focusin", function (e) {
          var sh = e.target.closest("[data-web-shot]"); if (!sh) return;
          var st = tl.scrollTrigger, r = stackEl.getBoundingClientRect();
          if (st) { // deja la pila centrada y ya armada, sin el retardo del scrub
            w.scrollTo({ top: Math.round(r.top + w.scrollY - Math.max(0, (vh() - r.height) / 2)), behavior: "instant" });
            ScrollTrigger.update();
            var lag = st.getTween && st.getTween(); if (lag) lag.progress(1);
          }
          gsap.set(sh, { zIndex: 30, opacity: 1, z: 220, rotationX: 0, rotationY: 0, y: 0, x: 0 });
        });
        stackEl.addEventListener("focusout", function (e) {
          var sh = e.target.closest("[data-web-shot]"); if (!sh || sh.contains(e.relatedTarget)) return;
          gsap.set(sh, { zIndex: 10 - num(sh.getAttribute("data-depth"), 0) });
          var t = tl.time(); tl.time(t + 0.001, true).time(t, true); // re-render del scrub: vuelve a su lugar
        });
        // Fase 2: la pila respira en profundidad mientras sigue subiendo
        tl.to(shots, {
          z: function (i, el) { return num(el.getAttribute("data-depth"), 0) * DEPTH_STEP * (desk ? 1.7 : 1); },
          rotationY: desk ? 7 : 0, rotationX: tilt * 0.4,
          duration: 1.1
        }, ">-0.1");
      } else {
        // Layout en grilla (sin pila): cada captura gira desde la profundidad al entrar
        shots.forEach(function (sh) {
          gsap.fromTo(sh,
            { rotationX: -55, z: -220, opacity: 0, transformPerspective: PERSPECTIVE, transformOrigin: "50% 100%" },
            { rotationX: 0, z: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: sh, start: "top 96%", end: "top 55%", scrub: SCRUB } });
        });
      }
    });
  }

  /* ───────────── 5 · SISTEMAS: diagrama vivo con paquetes ───────────── */
  function sistemas(desk, mark, cleanups) {
    $$("figure[data-diagram]").forEach(function (fig) {
      var svg = $("[data-diagram-svg]", fig);
      var packetsG = $("[data-diagram-packets]", fig);
      if (!svg || !DrawSVG || !MotionPath) return;
      mark([fig]);
      var NS = "http://www.w3.org/2000/svg";
      var L = {}, N = {}, R = {};
      $$("[data-link]", svg).forEach(function (p) { L[p.getAttribute("data-link")] = p; });
      $$("[data-node]", svg).forEach(function (g) { N[g.getAttribute("data-node")] = g; });
      var created = [];

      // Anillos de pulso (uno por nodo, decorativos)
      Object.keys(N).forEach(function (k) {
        var rect = $("rect", N[k]);
        if (!rect) return;
        var ring = rect.cloneNode(false);
        ring.setAttribute("class", "diagram-ring");
        ring.setAttribute("aria-hidden", "true");
        ring.style.cssText = "fill:none;stroke:var(--aqua);stroke-width:2;opacity:0;pointer-events:none";
        N[k].appendChild(ring);
        R[k] = ring; created.push(ring);
      });
      function packet(extraCls) {
        var g = d.createElementNS(NS, "g");
        g.setAttribute("class", "diagram-packet-g" + (extraCls ? " " + extraCls : ""));
        var halo = d.createElementNS(NS, "circle"); halo.setAttribute("r", "11"); halo.style.cssText = "fill:var(--aqua);opacity:.22";
        var core = d.createElementNS(NS, "circle"); core.setAttribute("r", "4.5"); core.setAttribute("class", "diagram-packet");
        g.appendChild(halo); g.appendChild(core);
        (packetsG || svg).appendChild(g);
        created.push(g);
        gsap.set(g, { opacity: 0 });
        return g;
      }
      cleanups.push(function () { created.forEach(function (n) { n.remove(); }); Object.keys(N).forEach(function (k) { N[k].classList.remove("is-on"); }); });

      function ride(tl, pkt, link, at, dur) {
        var p = L[link]; if (!p) return;
        tl.set(pkt, { opacity: 1 }, at);
        tl.fromTo(pkt, { motionPath: { path: p, align: p, alignOrigin: [0.5, 0.5], start: 0, end: 0 } },
          { motionPath: { path: p, align: p, alignOrigin: [0.5, 0.5], start: 0, end: 1 }, duration: dur, ease: "none", immediateRender: false }, at);
        tl.set(pkt, { opacity: 0 }, at + dur);
      }
      function pulse(tl, k, at) {
        if (!R[k]) return;
        tl.fromTo(R[k], { opacity: 0.9, scale: 1, transformOrigin: "50% 50%" }, { opacity: 0, scale: 1.28, duration: 0.6, ease: E.expo, immediateRender: false }, at);
      }

      var nodes = Object.keys(N).map(function (k) { return N[k]; });
      var links = Object.keys(L).map(function (k) { return L[k]; });
      gsap.set(nodes, { opacity: 0.18, scale: 0.94, transformOrigin: "50% 50%" });
      gsap.set(links, { drawSVG: "0%" });

      // ── Construcción (scrub en desktop, una vez en mobile)
      var onAt = {};
      var build = gsap.timeline({ paused: !desk, defaults: { ease: "none" } });
      function on(k, at) { if (!N[k]) return; onAt[k] = at; build.to(N[k], { opacity: 1, scale: 1, duration: 0.35, ease: E.spring }, at); pulse(build, k, at); }
      function draw(link, at, dur) { if (!L[link]) return; build.to(L[link], { drawSVG: "100%", duration: dur }, at); ride(build, packet(), link, at, dur); }
      on("cliente", 0);
      draw("cliente-api", 0.3, 0.5);
      on("api", 0.8);
      draw("api-prisma", 1.0, 0.5); draw("api-bot", 1.0, 0.5); draw("api-webhooks", 1.0, 0.5);
      on("prisma", 1.5); on("bot", 1.5); on("webhooks", 1.5);
      draw("prisma-db", 1.8, 0.5);
      on("db", 2.3);
      draw("db-panel", 2.5, 0.5);
      on("panel", 3.0);
      build.to({}, { duration: 0.4 });
      build.eventCallback("onUpdate", function () {
        var t = build.time();
        for (var k in onAt) N[k].classList.toggle("is-on", t >= onAt[k] + 0.05);
        sync();
      });

      // ── Flujo continuo: paquetes viajando por las líneas (solo si se ve y ya está construido)
      var pm = packet("is-loop"), pb = packet("is-loop"), ph = packet("is-loop");
      var flow = gsap.timeline({ paused: true, repeat: -1, repeatDelay: D.beat * 0.18 });
      ride(flow, pm, "cliente-api", 0, 0.45); pulse(flow, "api", 0.45);
      ride(flow, pm, "api-prisma", 0.5, 0.45); ride(flow, pb, "api-bot", 0.5, 0.45); ride(flow, ph, "api-webhooks", 0.5, 0.45);
      pulse(flow, "prisma", 0.95); pulse(flow, "bot", 0.95); pulse(flow, "webhooks", 0.95);
      ride(flow, pm, "prisma-db", 1.0, 0.45); pulse(flow, "db", 1.45);
      ride(flow, pm, "db-panel", 1.5, 0.45); pulse(flow, "panel", 1.95);
      pulse(flow, "cliente", 0);

      var inView = false, flowing = false;
      function sync() {
        var go = inView && build.progress() > 0.97;
        if (go && !flowing) { flowing = true; flow.restart(); }
        else if (!go && flowing) { flowing = false; flow.pause(0); gsap.set([pm, pb, ph], { opacity: 0 }); }
      }
      ScrollTrigger.create({ trigger: fig, start: "top bottom", end: "bottom top", onToggle: function (st) { inView = st.isActive; sync(); } });

      if (desk && anim(fig, "pin")) {
        ScrollTrigger.create({
          animation: build, trigger: fig, pin: true, scrub: SCRUB, anticipatePin: 1, invalidateOnRefresh: true,
          start: pinStart(fig),
          end: "+=" + (fig.getAttribute("data-pin-length") || "120%")
        });
      } else if (desk) {
        ScrollTrigger.create({ animation: build, trigger: fig, start: "top 80%", end: "bottom 40%", scrub: SCRUB });
      } else {
        ScrollTrigger.create({ trigger: fig, start: "top 75%", once: true, onEnter: function () { build.timeScale(1.15).play(); } });
      }
    });
  }

  /* ───────────── 6 · TRABAJOS: scroll horizontal pinneado ───────────── */
  function trabajos(desk, mark) {
    $$("[data-work-track]").forEach(function (track) {
      var list = $("[data-work-list]", track);
      if (!list) return;
      var items = $$(".work-item", list);
      var medias = $$("[data-work-media]", list);
      mark(medias);
      var horizontal = desk && anim(track, "horizontal") && list.scrollWidth > track.clientWidth + 40;

      function drawMedia(fig, stVars) { // NextScene: el esquema se dibuja y las barras de votos crecen
        var strokes = $$("rect:not(.fill), circle", fig);
        var fills = $$("rect.fill", fig);
        var texts = $$("text", fig);
        var tl = gsap.timeline({ scrollTrigger: stVars });
        if (DrawSVG && strokes.length) tl.fromTo(strokes, { drawSVG: "0%" }, { drawSVG: "100%", duration: 1, stagger: 0.06, ease: E.quint }, 0);
        if (fills.length) tl.fromTo(fills, { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 0.9, ease: E.circ, stagger: 0.15 }, 0.5);
        if (texts.length) tl.fromTo(texts, { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.05 }, 0.4);
        return tl;
      }

      if (horizontal) {
        track.scrollLeft = 0;
        gsap.set(track, { overflow: "clip" });
        var dist = function () { return Math.max(0, list.scrollWidth - track.clientWidth); };
        var move = gsap.to(list, {
          x: function () { return -dist(); }, ease: "none",
          scrollTrigger: {
            trigger: track, pin: true, scrub: SCRUB * 0.75, anticipatePin: 1, invalidateOnRefresh: true,
            start: pinStart(track),
            end: function () { return "+=" + dist(); }
          }
        });
        items.forEach(function (it) {
          var media = $("[data-work-media]", it), img = media && $("img", media);
          var text = $(".work-text", it), n = $(".work-n", it);
          var base = { containerAnimation: move, trigger: it, scrub: true };
          if (media && media.classList.contains("work-media--draw")) {
            drawMedia(media, assign({}, base, { start: "left 95%", end: "right 100%" }));
          } else if (media) {
            gsap.fromTo(media, { clipPath: INSET.rtl }, { clipPath: INSET.full, ease: "none", scrollTrigger: assign({}, base, { start: "left 100%", end: "right 100%" }) });
            if (img) gsap.fromTo(img, { scale: 1.22, xPercent: -6 }, { scale: 1.04, xPercent: 6, ease: "none", scrollTrigger: assign({}, base, { start: "left right", end: "right left" }) });
          }
          if (text) gsap.fromTo(text, { x: 90, opacity: 0.15 }, { x: 0, opacity: 1, ease: "none", scrollTrigger: assign({}, base, { start: "left 96%", end: "right 100%" }) });
          if (n) gsap.fromTo(n, { x: 70 }, { x: -70, ease: "none", scrollTrigger: assign({}, base, { start: "left right", end: "right left" }) });
        });
        // Teclado: el trabajo con foco se trae a la vista dentro del pin (sin smooth) y queda opaco
        track.addEventListener("focusin", function (e) {
          var it = e.target.closest(".work-item"), st = move.scrollTrigger;
          if (!it || !st) return;
          var dx = dist(); if (!dx) return;
          var curX = num(gsap.getProperty(list, "x"), 0);
          var lr = list.getBoundingClientRect(), ir = it.getBoundingClientRect();
          var left = ir.left - lr.left; // posición dentro de la lista, sin el transform
          var want = gsap.utils.clamp(0, dx, left - (track.clientWidth - ir.width) / 2);
          var y = st.start + (want / dx) * (st.end - st.start);
          if (Math.abs(-want - curX) > 2) w.scrollTo({ top: Math.round(y), behavior: "instant" });
          var text = $(".work-text", it);
          if (text) gsap.set(text, { opacity: 1, x: 0 });
          ScrollTrigger.update();
          var lag = st.getTween && st.getTween(); if (lag) lag.progress(1); // sin el retardo del scrub
          if (text) gsap.set(text, { opacity: 1, x: 0 });
        });
        // Entrada vertical de los primeros trabajos visibles (el resto lo maneja el horizontal)
        var firsts = items.filter(function (it) { return it.getBoundingClientRect().left < w.innerWidth; }).map(function (it) { return $(".work-entry", it) || it; });
        if (firsts.length) gsap.fromTo(firsts, { x: function () { return w.innerWidth * 0.12; }, opacity: 0 }, { x: 0, opacity: 1, duration: D.slower * 1.2, ease: E.expo, stagger: S.blocks, scrollTrigger: { trigger: track, start: "top 82%", once: true } });
      } else {
        // Mobile (carrusel snap de 03) o layout vertical: revelado por trabajo al entrar
        items.forEach(function (it, i) {
          var media = $("[data-work-media]", it);
          if (!media) return;
          var vis = it.getBoundingClientRect().left < w.innerWidth; // en carrusel solo los visibles
          if (!vis) return;
          var st = { trigger: it, start: "top 85%", once: true };
          if (media.classList.contains("work-media--draw")) drawMedia(media, st);
          else gsap.fromTo(media, { clipPath: INSET.ltr }, { clipPath: INSET.full, duration: D.slower, ease: E.expo, delay: (i % 3) * 0.08, clearProps: "clipPath", scrollTrigger: st });
        });
      }
    });
  }

  /* ───────────── 8 · SEGURIDAD: el plano se revela con un barrido ───────────── */
  function seguridad(desk, mark, cleanups) {
    $$("[data-plan]").forEach(function (plan) {
      var base = $(".plan-base", plan);
      var strokes = base ? $$(".ln > *", base) : [];
      var texts = base ? $$(".tx > *", base) : [];
      var scan = d.createElement("span");
      scan.className = "ld-scan";
      scan.setAttribute("aria-hidden", "true");
      scan.style.cssText = "position:absolute;left:0;right:0;top:0;height:34%;pointer-events:none;background:var(--scan-line);opacity:0;z-index:2";
      if (getComputedStyle(plan).position === "static") gsap.set(plan, { position: "relative" });
      plan.appendChild(scan);
      cleanups.push(function () { scan.remove(); });

      var tl = gsap.timeline({ scrollTrigger: { trigger: plan, start: "top 72%", once: true } });
      tl.fromTo(plan, { clipPath: INSET.down }, { clipPath: INSET.full, duration: D.cinematic, ease: E.quint, clearProps: "clipPath" }, 0);
      tl.fromTo(scan, { yPercent: -100, opacity: 1 }, { yPercent: 300, duration: D.cinematic, ease: E.quint }, 0);
      tl.to(scan, { opacity: 0, duration: 0.3 }, D.cinematic - 0.2);
      if (DrawSVG && strokes.length) tl.fromTo(strokes, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.9, ease: E.quart, stagger: { each: 0.025, from: "start" } }, 0.15);
      if (texts.length) tl.fromTo(texts, { opacity: 0 }, { opacity: 1, duration: 0.35, stagger: 0.05 }, 0.7);
    });

    $$("[data-report]").forEach(function (rep) {
      mark([rep]);
      var rows = $$("tbody tr", rep);
      var tl = gsap.timeline({ scrollTrigger: { trigger: rep, start: "top 80%", once: true } });
      tl.fromTo(rep, { clipPath: INSET.down, rotate: -2.5, yPercent: 6, transformOrigin: "0% 0%" }, { clipPath: INSET.full, rotate: 0, yPercent: 0, duration: 1.1, ease: E.expo, clearProps: "clipPath" }, 0);
      if (rows.length) tl.fromTo(rows, { opacity: 0, x: -22 }, { opacity: 1, x: 0, duration: 0.6, ease: E.quart, stagger: S.rows }, 0.45);
    });
  }

  /* ───────────── 9 · PROCESO: la línea se dibuja y los pasos se encienden ───────────── */
  function proceso(desk, mark, cleanups) {
    $$("[data-process-line]").forEach(function (lineSvg) {
      var wrap = lineSvg.parentElement;
      var path = $("path", lineSvg);
      var stepsList = $(".steps", wrap);
      var steps = stepsList ? $$("li[data-step]", stepsList) : [];
      if (!path || !DrawSVG) return;
      mark([stepsList].concat($$(".step-n", wrap)));
      var wr = wrap.getBoundingClientRect();
      var tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: wrap, start: "top 72%", end: "bottom 62%", scrub: SCRUB }
      });
      tl.fromTo(path, { drawSVG: "0%" }, { drawSVG: "100%", duration: 1 }, 0);
      var litAt = [];
      steps.forEach(function (li) {
        var r = li.getBoundingClientRect();
        var pos = gsap.utils.clamp(0, 0.92, (r.top - wr.top + r.height * 0.25) / Math.max(1, wr.height));
        litAt.push(pos);
        var nEl = $(".step-n", li);
        var rest = Array.prototype.slice.call(li.children).filter(function (c) { return c !== nEl; });
        if (nEl) {
          tl.fromTo(nEl, { scale: 0.55, opacity: 0.2, transformOrigin: "0% 50%" }, { scale: 1, opacity: 1, duration: 0.08, ease: E.spring }, pos);
          var to = num(nEl.getAttribute("data-count-to"), 0), len = parseInt(nEl.getAttribute("data-count-pad") || "0", 10) || 0, o = { v: 0 };
          tl.fromTo(o, { v: 0 }, { v: to, duration: 0.08, onUpdate: function () { nEl.textContent = pad(Math.round(o.v), len); } }, pos);
        }
        if (rest.length) tl.fromTo(rest, { opacity: 0.18, x: -16 }, { opacity: 1, x: 0, duration: 0.1, stagger: 0.02, ease: E.quart }, pos);
      });
      tl.eventCallback("onUpdate", function () {
        var p = tl.progress();
        steps.forEach(function (li, i) { li.classList.toggle("is-lit", p >= litAt[i]); });
      });
      cleanups.push(function () {
        steps.forEach(function (li) {
          li.classList.remove("is-lit");
          var n = $(".step-n", li);
          if (n) n.textContent = pad(num(n.getAttribute("data-count-to"), 0), parseInt(n.getAttribute("data-count-pad") || "0", 10) || 0);
        });
      });
    });
  }

  /* ───────────── 10 · SOBRE MÍ: máscaras ───────────── */
  function sobre(desk, mark) {
    $$("section[data-scene='sobre']").forEach(function (s) {
      var paras = $$(".about-copy p[data-anim~='mask-reveal']", s);
      if (!SplitText) return;
      mark(paras);
      paras.forEach(function (p, i) {
        SplitText.create(p, {
          type: "lines", mask: "lines", autoSplit: true, aria: "none",
          onSplit: function (self) {
            return gsap.from(self.lines, {
              yPercent: 102, duration: D.slower, ease: E.expo, stagger: S.lines * 0.8,
              scrollTrigger: { trigger: p, start: "top 86%", once: true }
            });
          }
        });
      });
    });
  }

  /* ───────────── 11 · CTA: el texto gigante llega y escala ───────────── */
  function cta(desk, mark, cleanups) {
    $$("[data-anim~='scale-text']").forEach(function (h) {
      var section = h.closest("section") || h;
      mark([h]);
      var scaleFrom = desk ? 0.74 : 0.86;
      function makeTl(chars) {
        var tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section, start: "top 82%", end: desk ? "center 58%" : "center 62%", scrub: SCRUB,
            onUpdate: function (st) { section.classList.toggle("is-arrived", st.progress > 0.985); }
          }
        });
        tl.fromTo(h, { scale: scaleFrom, transformOrigin: "0% 60%" }, { scale: 1, duration: 1 }, 0);
        if (chars && chars.length) tl.fromTo(chars, { opacity: 0.06, yPercent: 32 }, { opacity: 1, yPercent: 0, duration: 0.35, ease: E.quart, stagger: { each: 0.65 / chars.length } }, 0);
        else tl.fromTo(h, { clipPath: INSET.ltr }, { clipPath: INSET.full, duration: 1 }, 0);
        return tl;
      }
      if (SplitText && anim(h, "split-chars")) {
        SplitText.create(h, { type: "words,chars", aria: "auto", onSplit: function (self) { return makeTl(self.chars); } });
      } else makeTl(null);
      cleanups.push(function () { section.classList.remove("is-arrived"); });
    });
  }

  /* ───────────── genéricos: split-lines, mask-reveal, stagger-list, scramble, count ───────────── */
  function generic(desk, handled) {
    // Titulares por líneas (cada escena con su variante)
    if (SplitText) $$("[data-anim~='split-lines']").forEach(function (h) {
      if (handled.has(h)) return;
      var scene = sceneOf(h);
      var kind = LINES[scene] || "rise";
      var delay = num(h.getAttribute("data-anim-delay"), 0);
      SplitText.create(h, {
        type: "lines", mask: "lines", linesClass: "ld-line", autoSplit: true, aria: "auto",
        onSplit: function (self) {
          var from = linesFrom(kind);
          var st = { trigger: h, start: "top 86%", once: true };
          if (kind === "weight") {
            var fw = parseFloat(getComputedStyle(h).fontWeight) || 720;
            var tl = gsap.timeline({ scrollTrigger: st, delay: delay });
            tl.fromTo(self.lines, from, assign(neutral(from), { duration: D.slower, ease: E.expo, stagger: S.lines }), 0);
            tl.fromTo(self.lines, { fontWeight: num(css("--weight-display-thin"), 260) }, { fontWeight: fw, duration: D.slower * 1.3, ease: E.quart, stagger: S.lines }, 0);
            return tl;
          }
          return gsap.fromTo(self.lines, from, assign(neutral(from), {
            duration: kind === "quint" ? D.slower * 1.2 : D.slower, delay: delay,
            ease: kind === "quint" ? E.quint : (kind === "wipe" || kind === "scan" ? E.quart : E.expo),
            stagger: kind === "slide" ? S.lines * 1.4 : S.lines,
            scrollTrigger: st
          }));
        }
      });
    });

    // Máscaras con clip-path (dirección según la escena)
    $$("[data-anim~='mask-reveal']").forEach(function (el) {
      if (handled.has(el)) return;
      var scene = sceneOf(el);
      var dir = MASK[scene] || "up";
      var heroScene = scene === "hero";
      var from = assign({ clipPath: INSET[dir] }, NUDGE[dir]);
      var img = (el.tagName === "FIGURE") ? $("img", el) : null;
      var tl = gsap.timeline({
        delay: num(el.getAttribute("data-anim-delay"), 0) * (heroScene ? 1 : 0.5),
        scrollTrigger: heroScene ? null : { trigger: el, start: "top 88%", once: true }
      });
      tl.fromTo(el, from, assign(neutral(from), { duration: D.slower, ease: E.expo, clearProps: "clipPath,transform" }), 0);
      if (img) tl.fromTo(img, { scale: 1.16 }, { scale: 1, duration: D.slower * 1.4, ease: E.expo, clearProps: "transform" }, 0);
    });

    // Listas escalonadas
    $$("[data-anim~='stagger-list']").forEach(function (list) {
      if (handled.has(list)) return;
      var scene = sceneOf(list);
      if (scene === "proceso" || scene === "hero") return;
      var kids = Array.prototype.slice.call(list.children).filter(function (k) { return !k.hidden; });
      if (!kids.length) return;
      var v = LIST[scene] || "rise";
      var stg = num(list.getAttribute("data-anim-stagger"), S.rows);
      var delay = num(list.getAttribute("data-anim-delay"), 0) * 0.5;
      var from;
      switch (v) {
        case "flip": from = { rotationX: -75, opacity: 0, transformOrigin: "50% 0%", transformPerspective: 900 }; break;
        case "log": from = { clipPath: INSET.ltr }; stg = Math.min(stg, 0.08); break;
        case "down": from = { clipPath: INSET.down, y: -12 }; break;
        case "tape": from = { clipPath: INSET.ltr, x: -10 }; stg = 0.09; break;
        case "cells": from = { clipPath: INSET.center }; stg = 0.06; break;
        case "ltr": from = { clipPath: INSET.ltr, x: -24 }; break;
        default: from = { clipPath: INSET.up, y: "1.2rem" };
      }
      var tl = gsap.timeline({ delay: delay, scrollTrigger: { trigger: list, start: "top 85%", once: true } });
      tl.fromTo(kids, from, assign(neutral(from), {
        duration: v === "log" ? D.slow : D.slower, ease: v === "flip" ? E.springSoft : E.expo,
        stagger: v === "cells" ? { each: stg, grid: "auto", from: "start" } : stg,
        clearProps: "clipPath,transform"
      }), 0);
      if (v === "log" && Scramble) {
        $$("dt", list).forEach(function (dt, i) {
          var t = dt.textContent;
          tl.to(dt, { duration: 0.7, scrambleText: { text: t, chars: "01<>{}/_", speed: 0.8 } }, i * stg);
        });
      }
    });

    // Scramble suelto (eyebrows de otras páginas)
    if (Scramble) $$("[data-anim~='scramble']").forEach(function (el) {
      if (handled.has(el)) return;
      var t = el.textContent;
      ScrollTrigger.create({
        trigger: el, start: "top 88%", once: true,
        onEnter: function () { gsap.to(el, { duration: 0.9, scrambleText: { text: t, chars: /\d/.test(t) ? "0123456789" : "01<>/·", speed: 0.7 } }); }
      });
    });

    // Contadores sueltos
    $$("[data-anim~='count']").forEach(function (el) {
      if (handled.has(el)) return;
      var tw = counter(el, { paused: true });
      ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: function () { tw.play(0); } });
    });
  }

  /* ───────────── parallax por profundidad ───────────── */
  function parallax(desk) {
    var amp = desk ? 0.25 : 0.12;
    $$("[data-anim~='parallax-depth']").forEach(function (el) {
      var depth = num(el.getAttribute("data-depth"), 0);
      if (!depth) return;
      var section = el.closest("section") || el;
      var isHero = section.getAttribute("data-scene") === "hero";
      gsap.fromTo(el,
        { y: function () { return isHero ? 0 : vh() * amp * depth; } },
        {
          y: function () { return -vh() * amp * depth * (isHero ? 1.4 : 1); }, ease: "none",
          scrollTrigger: { trigger: section, start: isHero ? "top top" : "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true }
        });
    });
  }

  /* ───────────── progreso por escena (para 05, 06, 08) ───────────── */
  function progressEmitters() {
    $$("section[data-scene]").forEach(function (s) {
      var name = s.getAttribute("data-scene");
      if (name === "chatbots") return; // lo emite el pin / el paso de la demo
      ScrollTrigger.create({
        trigger: s, start: "top bottom", end: "bottom top",
        onUpdate: function (st) { emit(s, name, st.progress, st.direction); }
      });
    });
  }

  /* ───────────── ciclo de vida ───────────── */
  function onReady() { refresh(); }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", onReady, { once: true }); else onReady();
  w.addEventListener("load", refresh, { once: true });
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(refresh);
  ["ld:work-filtered", "ld:shop-ready", "ld:layout-change"].forEach(function (ev) { d.addEventListener(ev, refresh); });
  $$("main img").forEach(function (img) { if (!img.complete) img.addEventListener("load", refresh, { once: true }); });

  api.ready = true;
  d.dispatchEvent(new CustomEvent("ld:motion-ready", { detail: { reduced: api.reduced } }));
})();
