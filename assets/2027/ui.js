/* LautaroDev 2027 · ui.js (dueño: agente 07 · interacciones, tema y transiciones)
   Carga con defer, después de motion.js / hero3d.js / chatbot-demo.js y antes de tienda.js y plano.js.
   Todo es opcional: si un gancho no está en la página (servicio.html no tiene trabajos), se saltea.

   Expone:
   - Evento `ld:theme-change` en document (burbujea a window) → detail { theme: "dark"|"light", source: "user"|"system" }.
     Se emite apenas cambia data-theme (dentro de la View Transition), para que 05 relea los tokens --gl-*.
   - Evento `ld:work-filtered` en document → detail { filter, count }. 04 hace ScrollTrigger.refresh().
   - `--mx` / `--my` en <html>: posición del puntero en px de viewport (solo puntero fino, sin reduced-motion).
   - `--lx` / `--ly` en el .btn bajo el puntero: posición local en %.
   - window.LD_UI = { getTheme(), setTheme(theme, originEl?) }.
   No toca .menu-btn (es de plano.js) ni reemplaza la apertura de #ficha (también de plano.js). */
(() => {
  "use strict";

  const d = document;
  const root = d.documentElement;
  const mq = (q) => window.matchMedia(q);
  const reducedMQ = mq("(prefers-reduced-motion: reduce)");
  const fineMQ = mq("(hover: hover) and (pointer: fine)");
  const lightMQ = mq("(prefers-color-scheme: light)");
  const reduced = () => reducedMQ.matches;
  const fine = () => fineMQ.matches;
  const $ = (s, r = d) => r.querySelector(s);
  const $$ = (s, r = d) => Array.from(r.querySelectorAll(s));
  const cfg = window.LD_CONFIG || null;
  const KEY = (cfg && cfg.STORAGE_THEME_KEY) || "ld-theme";
  const lang = () => (cfg ? cfg.lang() : ((root.lang || "es").toLowerCase().startsWith("en") ? "en" : "es"));
  const css = (name) => getComputedStyle(root).getPropertyValue(name).trim();
  const ms = (name, fallback) => {
    const v = css(name);
    if (!v) return fallback;
    const n = parseFloat(v);
    if (!isFinite(n)) return fallback;
    return v.endsWith("ms") ? n : n * 1000;
  };
  const ease = (name, fallback) => css(name) || fallback;
  const emit = (type, detail) => d.dispatchEvent(new CustomEvent(type, { bubbles: true, detail }));
  const inView = (r) => r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;

  /* ═══════════════════════ 1 · Tema oscuro / claro ═══════════════════════ */
  const storeGet = () => {
    try {
      const t = localStorage.getItem(KEY);
      return t === "dark" || t === "light" ? t : null;
    } catch (e) { return null; }
  };
  const storeSet = (t) => { try { localStorage.setItem(KEY, t); } catch (e) { /* modo privado: sigue sin recordar */ } };
  const getTheme = () => {
    const t = root.getAttribute("data-theme");
    if (t === "dark" || t === "light") return t;
    return lightMQ.matches ? "light" : "dark";
  };

  const toggles = $$("[data-theme-toggle]");
  const syncToggles = () => {
    const t = getTheme();
    toggles.forEach((b) => {
      /* Label fijo en el HTML ("Tema oscuro" / "Dark theme"): acá solo cambia el estado. */
      b.setAttribute("aria-pressed", String(t === "dark"));
    });
  };

  let vtBusy = false;
  let fadeTimer = 0;
  const setTheme = (next, origin) => {
    if (next !== "dark" && next !== "light") return;
    const apply = () => {
      root.setAttribute("data-theme", next);
      storeSet(next);
      syncToggles();
      emit("ld:theme-change", { theme: next, source: "user" });
    };

    if (reduced()) { apply(); return; }

    if (typeof d.startViewTransition === "function" && !vtBusy) {
      const r = origin && origin.getBoundingClientRect ? origin.getBoundingClientRect() : null;
      const x = r && r.width ? r.left + r.width / 2 : innerWidth - 40;
      const y = r && r.height ? r.top + r.height / 2 : 40;
      const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      vtBusy = true;
      root.classList.add("ui-theme-vt");
      let vt;
      try { vt = d.startViewTransition(apply); }
      catch (e) { root.classList.remove("ui-theme-vt"); vtBusy = false; apply(); return; }
      vt.ready.then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: ms("--dur-theme", 700), easing: ease("--ease-in-out-quint", "ease-in-out"), pseudoElement: "::view-transition-new(root)" }
        );
      }).catch(() => {});
      vt.finished.catch(() => {}).then(() => { root.classList.remove("ui-theme-vt"); vtBusy = false; });
      return;
    }

    /* Fallback: crossfade de colores en las superficies. */
    root.classList.add("ui-theme-fade");
    apply();
    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => root.classList.remove("ui-theme-fade"), ms("--dur-theme", 700) + 80);
  };

  toggles.forEach((b) => b.addEventListener("click", () => setTheme(getTheme() === "light" ? "dark" : "light", b)));
  syncToggles();

  /* Sin elección guardada manda el sistema: si cambia, seguimos y avisamos. */
  const onSystemTheme = () => {
    if (storeGet()) return;
    const t = root.getAttribute("data-theme");
    if (t === "dark" || t === "light") return;
    syncToggles();
    emit("ld:theme-change", { theme: getTheme(), source: "system" });
  };
  if (lightMQ.addEventListener) lightMQ.addEventListener("change", onSystemTheme);

  window.LD_UI = Object.freeze({ getTheme, setTheme });

  /* ═══════════════════════ 2 · Scroll: progreso, nav, sección activa ═══════════════════════ */
  const bar = $("[data-scroll-progress]");
  const nav = $("[data-nav]");
  const cssProgress = !!(bar && window.CSS && CSS.supports && CSS.supports("animation-timeline: scroll()"));
  if (cssProgress) bar.classList.add("is-css-driven");

  const menu = $("#menu") || (nav && $("nav", nav));
  const navLinks = menu ? $$('a[href^="#"]', menu).filter((a) => a.hash.length > 1 && d.getElementById(decodeURIComponent(a.hash.slice(1)))) : [];
  const targets = navLinks.map((a) => d.getElementById(decodeURIComponent(a.hash.slice(1))));
  let activeLink = null;
  let peekLink = null;

  /* Indicador que se desliza: una pastilla detrás del link activo (o del que tiene hover/foco). */
  let indicator = null;
  if (menu && navLinks.length) {
    indicator = d.createElement("span");
    indicator.className = "ui-nav-indicator is-instant";
    indicator.setAttribute("aria-hidden", "true");
    menu.prepend(indicator);
  }

  const placeIndicator = () => {
    if (!indicator) return;
    const link = peekLink || activeLink;
    const visible = menu.offsetParent !== null && getComputedStyle(menu).visibility !== "hidden";
    if (!link || !visible) { indicator.classList.remove("is-on", "is-peek"); return; }
    const mr = menu.getBoundingClientRect();
    const lr = link.getBoundingClientRect();
    if (!lr.width) { indicator.classList.remove("is-on"); return; }
    /* En el panel mobile los links no tienen padding lateral: la pastilla se abre un poco para no pegarse al texto. */
    const padX = parseFloat(getComputedStyle(link).paddingLeft) < 4 ? 12 : 0;
    const x = lr.left - mr.left - menu.clientLeft + menu.scrollLeft - padX;
    const y = lr.top - mr.top - menu.clientTop + menu.scrollTop;
    indicator.style.setProperty("--ui-ind-x", x.toFixed(1) + "px");
    indicator.style.setProperty("--ui-ind-y", y.toFixed(1) + "px");
    indicator.style.setProperty("--ui-ind-w", (lr.width + padX * 2).toFixed(1) + "px");
    indicator.style.setProperty("--ui-ind-h", lr.height.toFixed(1) + "px");
    indicator.classList.toggle("is-peek", !!peekLink && peekLink !== activeLink);
    indicator.classList.add("is-on");
    if (indicator.classList.contains("is-instant")) requestAnimationFrame(() => requestAnimationFrame(() => indicator.classList.remove("is-instant")));
  };

  const setActive = (link) => {
    if (link === activeLink) return;
    if (activeLink) activeLink.removeAttribute("aria-current");
    activeLink = link;
    if (activeLink) activeLink.setAttribute("aria-current", "location");
    placeIndicator();
  };

  if (menu && indicator) {
    menu.addEventListener("pointerover", (e) => {
      if (!fine()) return;
      const a = e.target.closest('a[href^="#"]');
      if (a && navLinks.includes(a) && a !== peekLink) { peekLink = a; placeIndicator(); }
    });
    menu.addEventListener("pointerleave", () => { if (peekLink) { peekLink = null; placeIndicator(); } });
    menu.addEventListener("focusin", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (a && navLinks.includes(a)) { peekLink = a; placeIndicator(); }
    });
    menu.addEventListener("focusout", () => { peekLink = null; placeIndicator(); });
    if ("ResizeObserver" in window) new ResizeObserver(() => placeIndicator()).observe(menu);
    /* El menú mobile lo abre plano.js con .open: reubicamos cuando cambia. */
    new MutationObserver(() => requestAnimationFrame(placeIndicator)).observe(menu, { attributes: true, attributeFilter: ["class", "style", "hidden"] });
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(placeIndicator).catch(() => {});
  }

  let scrollQueued = false;
  const onScrollFrame = () => {
    scrollQueued = false;
    const y = window.scrollY || root.scrollTop;
    if (nav) {
      if (y > 24) nav.setAttribute("data-scrolled", "");
      else nav.removeAttribute("data-scrolled");
    }
    if (bar && !cssProgress) {
      const max = Math.max(1, root.scrollHeight - innerHeight);
      bar.style.setProperty("--ui-progress", Math.min(1, Math.max(0, y / max)).toFixed(4));
    }
    if (targets.length) {
      /* Activa la sección que cruza la línea del 40 % de la pantalla. Fuera de las del nav, ninguna. */
      const line = innerHeight * 0.4;
      let found = null;
      for (let i = 0; i < targets.length; i++) {
        const r = targets[i].getBoundingClientRect();
        if (r.top <= line && r.bottom > line) { found = navLinks[i]; break; }
      }
      setActive(found);
    }
  };
  const queueScroll = () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(onScrollFrame);
  };
  window.addEventListener("scroll", queueScroll, { passive: true });
  window.addEventListener("resize", () => { queueScroll(); placeIndicator(); }, { passive: true });
  window.addEventListener("load", queueScroll);
  queueScroll();

  /* ═══════════════════════ 3 · Puntero: spotlight, --mx/--my, luz en botones ═══════════════════════ */
  let spot = null;
  let px = -9999, py = -9999;     // puntero
  let sx = -9999, sy = -9999;     // spotlight (con inercia)
  let spotRaf = 0;

  const spotFrame = () => {
    spotRaf = 0;
    if (!spot) return;
    sx += (px - sx) * 0.2;
    sy += (py - sy) * 0.2;
    if (Math.abs(px - sx) < 0.3 && Math.abs(py - sy) < 0.3) { sx = px; sy = py; }
    spot.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0)`;
    if (sx !== px || sy !== py) spotRaf = requestAnimationFrame(spotFrame);
  };

  let varsQueued = false;
  const writeVars = () => {
    varsQueued = false;
    root.style.setProperty("--mx", px.toFixed(0) + "px");
    root.style.setProperty("--my", py.toFixed(0) + "px");
  };

  const onPointerMove = (e) => {
    if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") return;
    if (!fine() || reduced()) { if (spot) spot.classList.remove("is-on"); return; }
    px = e.clientX; py = e.clientY;
    if (!varsQueued) { varsQueued = true; requestAnimationFrame(writeVars); }
    if (!spot) {
      spot = d.createElement("div");
      spot.className = "ui-spotlight";
      spot.setAttribute("aria-hidden", "true");
      d.body.appendChild(spot);
      sx = px; sy = py;
    }
    spot.classList.add("is-on");
    if (!spotRaf) spotRaf = requestAnimationFrame(spotFrame);

    const btn = e.target && e.target.closest ? e.target.closest(".btn") : null;
    if (btn) {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty("--lx", (((px - r.left) / r.width) * 100).toFixed(1) + "%");
      btn.style.setProperty("--ly", (((py - r.top) / r.height) * 100).toFixed(1) + "%");
    }
  };
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  d.addEventListener("pointerleave", () => { if (spot) spot.classList.remove("is-on"); });
  root.addEventListener("pointerleave", () => { if (spot) spot.classList.remove("is-on"); });
  window.addEventListener("blur", () => { if (spot) spot.classList.remove("is-on"); });

  /* ═══════════════════════ 4 · Botones magnéticos (solo puntero fino) ═══════════════════════ */
  const MAX_PULL = 12; // px: tope del desplazamiento, así el botón nunca "se escapa" del cursor
  $$('[data-anim~="magnetic"]').forEach((el) => {
    let active = false;
    let raf = 0;
    let mx = 0, my = 0, m = 0;
    /* El rect se mide en cada frame (sin el translate propio), así sirve aunque la página scrollee o 04 lo mueva. */
    const write = () => {
      raf = 0;
      if (!active) return;
      const r = el.getBoundingClientRect();
      const cur = (el.style.translate || "0px 0px").split(" ").map(parseFloat);
      const cx = r.left - (cur[0] || 0) + r.width / 2;
      const cy = r.top - (cur[1] || 0) + r.height / 2;
      const tx = Math.max(-MAX_PULL, Math.min(MAX_PULL, (mx - cx) * m));
      const ty = Math.max(-MAX_PULL, Math.min(MAX_PULL, (my - cy) * m));
      el.style.translate = `${tx.toFixed(1)}px ${ty.toFixed(1)}px`;
    };
    const track = (e) => {
      if (e.pointerType !== "mouse" || !fine() || reduced()) return;
      m = parseFloat(css("--magnet")) || 0;
      if (!m) return;
      if (!active) { active = true; el.classList.add("is-magnet"); }
      mx = e.clientX; my = e.clientY;
      if (!raf) raf = requestAnimationFrame(write);
    };
    el.addEventListener("pointerenter", track);
    el.addEventListener("pointermove", track);
    const release = () => {
      active = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      el.classList.remove("is-magnet");
      el.style.translate = "";
    };
    el.addEventListener("pointerleave", release);
    el.addEventListener("pointercancel", release);
  });

  /* ═══════════════════════ 5 · Filtros de trabajos con Flip ═══════════════════════ */
  const filterBox = $("[data-work-filter]");
  const workItems = $$(".work-item");
  const workLive = $("[data-work-live]");
  const workTrack = $("[data-work-track]");
  let currentFilter = "all";
  let flipAnim = null;

  const announce = (btn, count) => {
    if (!workLive) return;
    const en = lang() === "en";
    const name = (btn && btn.textContent.trim()) || "";
    const tpl = count === 1 ? workLive.dataset.labelOne : workLive.dataset.labelMany;
    let text;
    if (tpl) text = tpl.replace("{n}", String(count)).replace("{filtro}", name);
    else if (en) text = `${name}: ${count} ${count === 1 ? "project" : "projects"}.`;
    else text = `${name}: ${count} ${count === 1 ? "trabajo" : "trabajos"}.`;
    workLive.textContent = "";
    setTimeout(() => { workLive.textContent = text; }, 60);
  };

  /* Al filtrar, la lista (y el pin de 04) cambian de largo y el navegador puede mover el scroll.
     Mantenemos los filtros quietos en pantalla mientras dura la animación y el refresh de 04.
     Si la persona scrollea en ese rato, soltamos. */
  let holdTop = 0, holdUntil = 0, holdRaf = 0;
  const holdFix = () => {
    const diff = filterBox.getBoundingClientRect().top - holdTop;
    if (Math.abs(diff) > 1) window.scrollBy(0, diff);
  };
  const holdLoop = () => {
    holdRaf = 0;
    if (performance.now() > holdUntil) return;
    holdFix();
    holdRaf = requestAnimationFrame(holdLoop);
  };
  const holdView = (msLong) => {
    holdUntil = performance.now() + msLong;
    if (!holdRaf) holdRaf = requestAnimationFrame(holdLoop);
  };
  ["wheel", "touchstart", "keydown"].forEach((t) => window.addEventListener(t, (e) => {
    if (t === "keydown" && !/^(Arrow(Up|Down)|Page(Up|Down)|Home|End| )$/.test(e.key)) return;
    holdUntil = 0;
  }, { passive: true }));

  const applyFilter = (kind, btn) => {
    if (kind === currentFilter) return;
    currentFilter = kind;
    holdTop = filterBox.getBoundingClientRect().top;
    const matches = (it) => kind === "all" || (it.dataset.kind || "").split(/\s+/).includes(kind);
    const F = window.Flip;
    const G = window.gsap;
    const animate = !!(F && G && !reduced());
    const state = animate ? F.getState(workItems, { props: "opacity" }) : null;
    if (flipAnim) { flipAnim.kill(); flipAnim = null; }

    let count = 0;
    workItems.forEach((it) => {
      const show = matches(it);
      it.hidden = !show;
      if (show) count++;
    });
    $$("button[data-filter]", filterBox).forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));

    /* Carrusel mobile (scroll-snap de 03): volver al principio de la lista. */
    const scroller = workTrack && workTrack.scrollWidth > workTrack.clientWidth + 1 ? workTrack : null;
    if (scroller) scroller.scrollLeft = 0;
    const list = $("[data-work-list]");
    if (list && list.scrollWidth > list.clientWidth + 1) list.scrollLeft = 0;

    /* El anuncio no espera a la animación; el evento sí (04 mide el layout final). */
    announce(btn, count);
    const finish = () => { emit("ld:work-filtered", { filter: kind, count }); holdFix(); holdView(400); };

    if (!animate) { holdFix(); finish(); return; }

    const dur = ms("--dur-slow", 520) / 1000;
    const out = ms("--dur-base", 240) / 1000;
    flipAnim = F.from(state, {
      duration: dur,
      ease: "expo.out",
      absolute: true,
      stagger: 0.03,
      onEnter: (els) => G.fromTo(els, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: dur, ease: "expo.out", stagger: 0.03, clearProps: "opacity,transform" }),
      onLeave: (els) => G.to(els, { opacity: 0, scale: 0.96, duration: out, ease: "power2.out" }),
      onComplete: () => { flipAnim = null; G.set(workItems, { clearProps: "opacity,transform" }); finish(); }
    });
    holdFix();
    holdView(ms("--dur-slow", 520) + 400);
  };

  if (filterBox && workItems.length) {
    const buttons = $$("button[data-filter]", filterBox);
    filterBox.hidden = false;
    buttons.forEach((b) => b.addEventListener("click", () => applyFilter(b.dataset.filter || "all", b)));
    /* Flechas para moverse entre los filtros (todos siguen siendo alcanzables con Tab). */
    filterBox.addEventListener("keydown", (e) => {
      const i = buttons.indexOf(d.activeElement);
      if (i < 0) return;
      let j = -1;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") j = (i + 1) % buttons.length;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") j = (i - 1 + buttons.length) % buttons.length;
      else if (e.key === "Home") j = 0;
      else if (e.key === "End") j = buttons.length - 1;
      if (j < 0) return;
      e.preventDefault();
      buttons[j].focus();
    });
  }

  /* Carrusel mobile (scroll-snap horizontal): al tabular, traer la tarjeta con foco entera a la vista.
     En desktop el track es el pin horizontal de 04 (overflow clip): ahí no hacemos nada. */
  if (workTrack) {
    workTrack.addEventListener("focusin", (e) => {
      const item = e.target.closest(".work-item");
      if (!item) return;
      const sc = [workTrack, $("[data-work-list]")].find((el) => el && el.scrollWidth > el.clientWidth + 1 && /(auto|scroll)/.test(getComputedStyle(el).overflowX));
      if (!sc) return;
      const ir = item.getBoundingClientRect();
      const sr = sc.getBoundingClientRect();
      if (ir.left < sr.left || ir.right > sr.right) sc.scrollBy({ left: ir.left - sr.left - 16, behavior: reduced() ? "auto" : "smooth" });
    });
  }

  /* ═══════════════════════ 6 · Vista previa que sigue al cursor (Trabajos, desktop) ═══════════════════════ */
  const peek = $("[data-work-peek]");
  const workSection = peek ? (peek.closest("section") || $("#trabajos")) : null;
  if (peek && workSection) {
    let shownFor = null;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, hideTimer = 0;
    const OFFSET = 28;
    const frame = () => {
      raf = 0;
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      if (Math.abs(tx - cx) < 0.3 && Math.abs(ty - cy) < 0.3) { cx = tx; cy = ty; }
      peek.style.translate = `${cx.toFixed(1)}px ${cy.toFixed(1)}px`;
      if (cx !== tx || cy !== ty) raf = requestAnimationFrame(frame);
    };
    const aim = (x, y) => {
      const w = peek.offsetWidth || 320;
      const h = peek.offsetHeight || 200;
      /* Arriba y a la derecha del cursor (no tapa el título que se está leyendo); si no entra, del otro lado. */
      tx = x + OFFSET + w > innerWidth - 12 ? x - OFFSET - w : x + OFFSET;
      ty = y - OFFSET - h >= 12 ? y - OFFSET - h : Math.min(y + OFFSET, innerHeight - h - 12);
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const hide = () => {
      if (!shownFor) return;
      shownFor = null;
      peek.classList.remove("is-on");
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => { if (!shownFor) peek.hidden = true; }, ms("--dur-slow", 520));
    };
    const show = (item, x, y) => {
      clearTimeout(hideTimer);
      const src = item.dataset.thumb;
      const first = peek.hidden;
      shownFor = item;
      if (peek.getAttribute("src") !== src) peek.src = src;
      peek.hidden = false;
      if (first) {
        aim(x, y);
        cx = tx; cy = ty;
        peek.style.translate = `${cx}px ${cy}px`;
      }
      const on = () => { if (shownFor === item) peek.classList.add("is-on"); };
      if (peek.complete && peek.naturalWidth) requestAnimationFrame(on);
      else peek.addEventListener("load", on, { once: true });
    };
    workSection.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse" || !fine() || reduced()) return;
      const item = e.target.closest(".work-item");
      /* Sin thumb (NextScene) o con la captura ya a la vista bajo el cursor (Happy Ride): sin vista previa.
         03 oculta la .work-media de los demás lomos en desktop, así que acá la preview es la única imagen. */
      const media = e.target.closest("[data-work-media]");
      if (!item || !item.dataset.thumb || (media && media.getBoundingClientRect().width > 0)) { hide(); return; }
      if (shownFor !== item) show(item, e.clientX, e.clientY);
      aim(e.clientX, e.clientY);
    }, { passive: true });
    workSection.addEventListener("pointerleave", hide);
    window.addEventListener("scroll", hide, { passive: true });
  }

  /* ═══════════════════════ 7 · Diálogo #ficha: transición compartida ═══════════════════════
     plano.js arma el contenido y llama showModal(). Acá solo animamos: el panel crece desde la
     captura del trabajo (FLIP con escala uniforme + clip-path, así el texto no se deforma) y al
     cerrar vuelve a ella si sigue en pantalla. Escape, el botón Cerrar y el clic en el fondo pasan por acá. */
  const dlg = $("#ficha");
  if (dlg && typeof dlg.showModal === "function") {
    const modal = $(".modal", dlg) || dlg;
    let source = null;
    let opener = null;
    let anims = [];
    let closing = false;

    const stopAnims = () => { anims.forEach((a) => { try { a.cancel(); } catch (e) {} }); anims = []; };

    d.addEventListener("click", (e) => {
      const b = e.target.closest && e.target.closest("[data-open]");
      if (!b) return;
      const item = b.closest("[data-name]");
      source = (item && $("[data-work-media]", item)) || b;
      opener = b;
    }, true);

    /* FLIP: devuelve los keyframes desde el rect de origen hasta el panel en su lugar. */
    const fromSource = () => {
      const m = modal.getBoundingClientRect();
      const s = source && source.isConnected ? source.getBoundingClientRect() : null;
      if (!s || !inView(s) || !m.width || !m.height) return null;
      const k = s.width / m.width;
      const clipH = s.height / k;
      const insetY = Math.max(0, (m.height - clipH) / 2);
      const dx = s.left + s.width / 2 - (m.left + m.width / 2);
      const dy = s.top + s.height / 2 - (m.top + m.height / 2);
      const endR = parseFloat(getComputedStyle(modal).borderTopLeftRadius) || 0;
      const srcR = parseFloat(getComputedStyle(source).borderTopLeftRadius) || 0;
      return [
        { transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${k.toFixed(4)})`, clipPath: `inset(${insetY.toFixed(1)}px 0px round ${(srcR / k).toFixed(1)}px)` },
        { transform: "translate(0px, 0px) scale(1)", clipPath: `inset(0px 0px round ${endR}px)` }
      ];
    };

    const onOpen = () => {
      closing = false;
      stopAnims();
      if (reduced()) return;
      const frames = fromSource();
      const dur = ms("--dur-slow", 520);
      const easing = ease("--ease-out-expo", "ease-out");
      if (frames) {
        anims.push(modal.animate(frames, { duration: dur, easing }));
        anims.push(modal.animate({ opacity: [0, 1] }, { duration: ms("--dur-base", 240), easing: "linear" }));
      } else {
        anims.push(modal.animate({ opacity: [0, 1], transform: ["translateY(8px) scale(0.96)", "translateY(0px) scale(1)"] }, { duration: ms("--dur-base", 240), easing }));
      }
      try { anims.push(dlg.animate({ opacity: [0, 1] }, { duration: ms("--dur-base", 240), easing: "linear", pseudoElement: "::backdrop" })); } catch (e) {}
    };

    new MutationObserver(() => { if (dlg.open) onOpen(); }).observe(dlg, { attributes: true, attributeFilter: ["open"] });

    const closeAnimated = (returnValue) => {
      if (!dlg.open) return;
      if (closing) return;
      if (reduced()) { dlg.close(returnValue); return; }
      closing = true;
      stopAnims();
      const frames = fromSource();
      const dur = ms("--dur-base", 240);
      const easing = ease("--ease-out-quart", "ease-out");
      let main;
      if (frames) {
        main = modal.animate(frames.slice().reverse(), { duration: dur, easing, fill: "forwards" });
        anims.push(modal.animate({ opacity: [1, 0] }, { duration: dur, delay: dur * 0.45, easing: "linear", fill: "forwards" }));
      } else {
        main = modal.animate({ opacity: [1, 0], transform: ["scale(1)", "scale(0.96)"] }, { duration: ms("--dur-fast", 160), easing, fill: "forwards" });
      }
      anims.push(main);
      try { anims.push(dlg.animate({ opacity: [1, 0] }, { duration: dur, easing: "linear", fill: "forwards", pseudoElement: "::backdrop" })); } catch (e) {}
      main.finished.catch(() => {}).then(() => {
        if (!closing) return;
        dlg.close(returnValue);
      });
    };

    /* Escape */
    dlg.addEventListener("cancel", (e) => {
      if (reduced() || closing) return;
      e.preventDefault();
      closeAnimated();
    });
    /* Botón Cerrar (<form method="dialog">) */
    dlg.addEventListener("submit", (e) => {
      const form = e.target;
      if (!form || (form.getAttribute("method") || "").toLowerCase() !== "dialog") return;
      if (reduced()) return;
      e.preventDefault();
      closeAnimated(e.submitter && e.submitter.value);
    }, true);
    /* Clic en el fondo: ui.js carga antes que plano.js, así este listener corre primero. */
    dlg.addEventListener("click", (e) => {
      if (e.target !== dlg || reduced()) return;
      e.stopImmediatePropagation();
      closeAnimated();
    });
    dlg.addEventListener("close", () => {
      closing = false;
      stopAnims();
      /* Devolver el foco al botón que abrió la ficha (si el navegador no lo hizo). */
      const a = d.activeElement;
      if (opener && opener.isConnected && opener.offsetParent !== null && (!a || a === d.body || a === dlg || dlg.contains(a) || !a.closest("[data-name]"))) {
        try { opener.focus({ preventScroll: true }); } catch (e) { opener.focus(); }
      }
    });
  }
})();
