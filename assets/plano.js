/* Lautaro Núñez — interacciones del plano. Vanilla, sin dependencias.
   2027 (agente 02): textos según <html lang> (o data-label-* del propio elemento),
   el barrido de la linterna solo corre con el plano a la vista, y todo es tolerante
   a que falten piezas (servicio.html no tiene plano ni fichas).
   Respaldo previo: _respaldo/2026-10-29-pre-2027/assets/plano.pre-i18n.js */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  const LANG = (document.documentElement.lang || "es").toLowerCase().startsWith("en") ? "en" : "es";
  const TXT = {
    es: { menu: "Menú", close: "Cerrar", show: "Mostrar todas las fallas", hide: "Ocultar las fallas", built: "Hecho con", video: "Video", copy: "Copiar correo", copied: "Correo copiado", copiedLive: "Correo copiado." },
    en: { menu: "Menu", close: "Close", show: "Show all the flaws", hide: "Hide the flaws", built: "Built with", video: "Video", copy: "Copy email", copied: "Email copied", copiedLive: "Email copied." }
  }[LANG];
  const label = (el, key, fallback) => (el && el.dataset[key]) || fallback;
  const MAIL = (window.LD_CONFIG && window.LD_CONFIG.MAIL) || "lautarodemiannunez32@gmail.com";

  /* Menú en pantallas chicas. ui.js no debe enlazar .menu-btn: lo marca data-menu-bound. */
  const menuBtn = $(".menu-btn");
  const menu = $("#menu");
  if (menuBtn && menu && !menuBtn.dataset.menuBound) {
    menuBtn.dataset.menuBound = "plano";
    const setMenu = (open) => {
      menu.classList.toggle("open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.textContent = open ? label(menuBtn, "labelClose", TXT.close) : label(menuBtn, "labelOpen", TXT.menu);
    };
    menuBtn.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("open")) { setMenu(false); menuBtn.focus(); }
    });
    // Si el foco sale del panel y del botón (Tab fuera, clic afuera), el menú se cierra.
    const onFocusOut = (e) => {
      if (!menu.classList.contains("open")) return;
      const next = e.relatedTarget;
      if (next && (menu.contains(next) || menuBtn.contains(next))) return;
      setMenu(false);
    };
    menu.addEventListener("focusout", onFocusOut);
    menuBtn.addEventListener("focusout", onFocusOut);
  }

  /* El plano se dibuja una vez al cargar */
  $$(".plan .ln > *").forEach((el, i) => el.style.setProperty("--i", i));

  /* Linterna UV */
  const plan = $("[data-plan]");
  const base = plan && $(".plan-base", plan);
  if (plan && base) {
    const toggle = $(".reveal-all", plan);
    let sweeping = null;
    let touched = false;   // si la persona ya movió la linterna, no la pisamos con el barrido
    let swept = false;     // el barrido automático corre una sola vez por visita
    let waitTimer = null;

    const size = () => {
      const w = base.getBoundingClientRect().width;
      plan.style.setProperty("--r", Math.round(Math.max(64, Math.min(120, w * 0.19))) + "px");
    };
    const place = (x, y) => {
      plan.style.setProperty("--x", x + "px");
      plan.style.setProperty("--y", y + "px");
      plan.classList.add("is-lit");
    };
    // puntos del plano (en coordenadas del viewBox 640 × 460) donde hay algo para encontrar
    const toPx = ([vx, vy]) => {
      const r = base.getBoundingClientRect();
      return [vx * r.width / 640, vy * r.height / 460];
    };
    const stopSweep = () => {
      if (sweeping) cancelAnimationFrame(sweeping);
      sweeping = null;
      plan.classList.remove("is-sweeping");
    };
    const sweep = (points, ms) => {
      const start = performance.now();
      const seg = ms / (points.length - 1);
      const ease = (t) => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      plan.classList.add("is-sweeping");
      const step = (now) => {
        const t = Math.max(0, Math.min(ms, now - start));
        const i = Math.min(points.length - 2, Math.floor(t / seg));
        const k = ease((t - i * seg) / seg);
        const [ax, ay] = toPx(points[i]), [bx, by] = toPx(points[i + 1]);
        place(ax + (bx - ax) * k, ay + (by - ay) * k);
        if (t < ms) sweeping = requestAnimationFrame(step);
        else { sweeping = null; swept = true; plan.classList.remove("is-sweeping"); }
      };
      sweeping = requestAnimationFrame(step);
    };
    const ROUTE = [[60, 420], [130, 32], [112, 168], [360, 262], [478, 380], [112, 168]];

    size();
    addEventListener("resize", size);

    const fromEvent = (e) => {
      const r = base.getBoundingClientRect();
      place(e.clientX - r.left, e.clientY - r.top);
    };
    const takeOver = (e) => { touched = true; clearTimeout(waitTimer); stopSweep(); fromEvent(e); };
    plan.addEventListener("pointermove", takeOver);
    plan.addEventListener("pointerdown", takeOver);

    if (reduced) place(...toPx([112, 168]));
    else if ("IntersectionObserver" in window) {
      // Solo barre cuando el plano está a la vista; si sale de pantalla a mitad, se corta y vuelve a intentar al volver.
      const io = new IntersectionObserver(([en]) => {
        if (en.isIntersecting) {
          if (touched || swept || sweeping) return;
          clearTimeout(waitTimer);
          waitTimer = setTimeout(() => { if (!touched && !document.hidden) sweep(ROUTE, 5200); }, 600);
        } else {
          clearTimeout(waitTimer);
          if (sweeping) stopSweep();
        }
      }, { threshold: .4 });
      io.observe(plan);
      document.addEventListener("visibilitychange", () => { if (document.hidden) { clearTimeout(waitTimer); stopSweep(); } });
    } else {
      place(...toPx([112, 168]));
    }

    toggle?.addEventListener("click", () => {
      const all = plan.classList.toggle("is-all");
      toggle.setAttribute("aria-pressed", String(all));
      toggle.textContent = all ? label(toggle, "labelHide", TXT.hide) : label(toggle, "labelShow", TXT.show);
    });
  }

  /* El informe se marca cuando aparece */
  const report = $("[data-report]");
  if (report) {
    if (reduced || !("IntersectionObserver" in window)) report.classList.add("is-marked");
    else {
      const io = new IntersectionObserver(([en]) => {
        if (en.isIntersecting) { report.classList.add("is-marked"); io.disconnect(); }
      }, { threshold: .45 });
      io.observe(report);
    }
  }

  /* Vista previa al pasar por el índice (marcado 2026; en 2027 la vista previa la hace ui.js con [data-work-peek]) */
  const wrap = $(".index-wrap");
  const peek = $(".peek");
  if (wrap && peek && canHover) {
    $$("tbody tr", wrap).forEach((tr) => {
      tr.addEventListener("pointerenter", () => { peek.src = tr.dataset.thumb; peek.classList.add("on"); });
      tr.addEventListener("pointerleave", () => peek.classList.remove("on"));
      tr.addEventListener("pointermove", (e) => {
        const r = wrap.getBoundingClientRect();
        const x = Math.min(r.width - 290, e.clientX - r.left + 28);
        peek.style.setProperty("--px", x + "px");
        peek.style.setProperty("--py", e.clientY - r.top - 90 + "px");
      });
    });
  }

  /* Ficha de cada proyecto */
  const dialog = $("#ficha");
  const body = $("#ficha-body");
  const open = (item) => {
    const tpl = item && $("template", item);
    if (!tpl || !dialog || !body) return;
    const frag = tpl.content.cloneNode(true);
    const shots = $$("img[data-shot]", frag);
    const video = $("video[data-video]", frag);
    shots.forEach((s) => s.remove());
    video?.remove();

    body.innerHTML = "";
    const head = document.createElement("div");
    head.className = "f-head";
    const h = document.createElement("h3");
    h.id = "ficha-title";
    h.textContent = item.dataset.name;
    const cat = document.createElement("p");
    cat.textContent = `${item.dataset.cat}. ${TXT.built} ${item.dataset.stack}.`;
    head.append(h, cat);
    const text = document.createElement("div");
    text.className = "f-text";
    text.appendChild(frag);
    body.append(head, text);

    const items = shots.map((s) => ({ type: "img", src: s.getAttribute("src"), alt: s.alt, cap: s.dataset.caption }));
    if (video) items.unshift({ type: "video", src: video.getAttribute("src"), poster: video.getAttribute("poster"), cap: TXT.video });
    if (items.length) {
      const main = document.createElement("div");
      main.className = "f-main";
      const thumbs = document.createElement("div");
      thumbs.className = "f-thumbs";
      const show = (i) => {
        const it = items[i];
        main.innerHTML = "";
        let el;
        if (it.type === "video") {
          el = document.createElement("video");
          Object.assign(el, { src: it.src, poster: it.poster, controls: true, muted: true, loop: true, playsInline: true, autoplay: !reduced });
        } else {
          el = document.createElement("img");
          el.src = it.src; el.alt = it.alt;
        }
        main.appendChild(el);
        $$("button", thumbs).forEach((b, j) => b.setAttribute("aria-current", String(i === j)));
      };
      if (items.length > 1) items.forEach((it, i) => {
        const b = document.createElement("button");
        b.type = "button";
        if (it.type === "video") b.innerHTML = `<span class="vid">${TXT.video}</span><small>${TXT.video}</small>`;
        else {
          const im = document.createElement("img");
          im.src = it.src; im.alt = ""; im.loading = "lazy";
          const sm = document.createElement("small");
          sm.textContent = it.cap || "";
          b.append(im, sm);
        }
        b.addEventListener("click", () => show(i));
        thumbs.appendChild(b);
      });
      body.append(main, thumbs);
      show(0);
    }
    dialog.showModal();
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-open]");
    if (b) open(b.closest("[data-name]"));
  });
  dialog?.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  dialog?.addEventListener("close", () => { body.innerHTML = ""; });

  /* Copiar correo (puede haber más de un botón) */
  const live = $("#copy-live");
  $$("[data-copy-email]").forEach((btn) => {
    const idle = label(btn, "labelCopy", TXT.copy);
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(MAIL);
        btn.textContent = label(btn, "labelCopied", TXT.copied);
        if (live) live.textContent = TXT.copiedLive;
        setTimeout(() => (btn.textContent = idle), 2200);
      } catch {
        location.href = "mailto:" + MAIL;
      }
    });
  });
})();
