/* Lautaro Núñez — interacciones del plano. Vanilla, sin dependencias. */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* Menú en pantallas chicas */
  const menuBtn = $(".menu-btn");
  const menu = $("#menu");
  const setMenu = (open) => {
    menu.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.textContent = open ? "Cerrar" : "Menú";
  };
  menuBtn?.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
  menu?.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });

  /* El plano se dibuja una vez al cargar */
  $$(".plan .ln > *").forEach((el, i) => el.style.setProperty("--i", i));

  /* Linterna UV */
  const plan = $("[data-plan]");
  if (plan) {
    const base = $(".plan-base", plan);
    const toggle = $(".reveal-all", plan);
    let sweeping = null;

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
    const sweep = (points, ms) => {
      const start = performance.now();
      const seg = ms / (points.length - 1);
      const ease = (t) => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const step = (now) => {
        const t = Math.max(0, Math.min(ms, now - start));
        const i = Math.min(points.length - 2, Math.floor(t / seg));
        const k = ease((t - i * seg) / seg);
        const [ax, ay] = toPx(points[i]), [bx, by] = toPx(points[i + 1]);
        place(ax + (bx - ax) * k, ay + (by - ay) * k);
        if (t < ms) sweeping = requestAnimationFrame(step);
      };
      sweeping = requestAnimationFrame(step);
    };
    const stopSweep = () => { if (sweeping) cancelAnimationFrame(sweeping); sweeping = null; };

    size();
    addEventListener("resize", size);

    const fromEvent = (e) => {
      const r = base.getBoundingClientRect();
      place(e.clientX - r.left, e.clientY - r.top);
    };
    plan.addEventListener("pointermove", (e) => { stopSweep(); fromEvent(e); });
    plan.addEventListener("pointerdown", (e) => { stopSweep(); fromEvent(e); });

    if (reduced) place(...toPx([112, 168]));
    else setTimeout(() => { if (!sweeping) sweep([[60, 420], [130, 32], [112, 168], [360, 262], [478, 380], [112, 168]], 5200); }, 1500);

    toggle?.addEventListener("click", () => {
      const all = plan.classList.toggle("is-all");
      toggle.setAttribute("aria-pressed", String(all));
      toggle.textContent = all ? "Ocultar las fallas" : "Mostrar todas las fallas";
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

  /* Vista previa al pasar por el índice */
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
    const frag = $("template", item).content.cloneNode(true);
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
    cat.textContent = `${item.dataset.cat}. Hecho con ${item.dataset.stack}.`;
    head.append(h, cat);
    const text = document.createElement("div");
    text.className = "f-text";
    text.appendChild(frag);
    body.append(head, text);

    const items = shots.map((s) => ({ type: "img", src: s.getAttribute("src"), alt: s.alt, cap: s.dataset.caption }));
    if (video) items.unshift({ type: "video", src: video.getAttribute("src"), poster: video.getAttribute("poster"), cap: "Video" });
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
        if (it.type === "video") b.innerHTML = `<span class="vid">Video</span><small>Video</small>`;
        else b.innerHTML = `<img src="${it.src}" alt="" loading="lazy" /><small>${it.cap}</small>`;
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

  /* Copiar correo */
  const live = $("#copy-live");
  $("[data-copy-email]")?.addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    const mail = "lautarodemiannunez32@gmail.com";
    try {
      await navigator.clipboard.writeText(mail);
      btn.textContent = "Correo copiado";
      live.textContent = "Correo copiado.";
      setTimeout(() => (btn.textContent = "Copiar correo"), 2200);
    } catch {
      location.href = "mailto:" + mail;
    }
  });
})();
