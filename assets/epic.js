/* camusdev — interacciones del portafolio. Vanilla, sin dependencias. */
(() => {
  "use strict";

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const rand = (a, b) => a + Math.random() * (b - a);

  /* ───── Estrellas con profundidad y estrellas fugaces ───── */
  const stars = $("#stars");
  if (stars && !reduced) {
    const ctx = stars.getContext("2d");
    let w, h, dpr, pts = [], shoot = null, mx = 0, my = 0;
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = stars.width = innerWidth * dpr;
      h = stars.height = innerHeight * dpr;
      const n = Math.round((innerWidth * innerHeight) / 5200);
      pts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, z: rand(.2, 1), t: rand(0, 6.28) }));
    };
    resize();
    addEventListener("resize", resize);
    addEventListener("pointermove", (e) => { mx = (e.clientX / innerWidth - .5); my = (e.clientY / innerHeight - .5); }, { passive: true });
    const tick = () => {
      if (!document.hidden) {
        ctx.clearRect(0, 0, w, h);
        const sy = scrollY * dpr;
        for (const p of pts) {
          p.t += .02;
          p.x -= p.z * .15 * dpr;
          if (p.x < 0) p.x = w;
          const x = p.x - mx * 30 * p.z * dpr;
          const y = ((p.y - sy * p.z * .15) % h + h) % h - my * 30 * p.z * dpr;
          ctx.globalAlpha = (.35 + Math.sin(p.t) * .25) * p.z + .15;
          ctx.fillStyle = p.z > .8 ? "#c4b5fd" : "#ffffff";
          ctx.fillRect(x, y, p.z * 1.8 * dpr, p.z * 1.8 * dpr);
        }
        if (!shoot && Math.random() < .006) shoot = { x: rand(w * .2, w), y: rand(0, h * .4), l: 0 };
        if (shoot) {
          shoot.l += 1;
          const len = 120 * dpr, sx = shoot.x - shoot.l * 14 * dpr, syy = shoot.y + shoot.l * 6 * dpr;
          const g = ctx.createLinearGradient(sx, syy, sx + len, syy - len * .43);
          g.addColorStop(0, "rgba(255,255,255,.9)"); g.addColorStop(1, "rgba(255,255,255,0)");
          ctx.globalAlpha = 1; ctx.strokeStyle = g; ctx.lineWidth = 2 * dpr;
          ctx.beginPath(); ctx.moveTo(sx, syy); ctx.lineTo(sx + len, syy - len * .43); ctx.stroke();
          if (shoot.l > 50) shoot = null;
        }
      }
      requestAnimationFrame(tick);
    };
    tick();
  }

  /* ───── Candados, escudos y glifos volando ───── */
  const cosmos = $(".cosmos");
  if (cosmos && !reduced) {
    const layer = document.createElement("div");
    layer.className = "flyers";
        const gly = ["</>", "{ }", "0x1F", "1010", "SSL", "2FA", "AES", "sudo", "#!", "TLS"];
    const n = innerWidth < 640 ? 8 : 16;
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      const glyph = i % 3 !== 0;
      s.className = "flyer" + (glyph ? " glyph" : "");
      if (glyph) s.textContent = gly[i % gly.length]; else s.innerHTML = '<span class="lk"></span>';
      s.style.cssText = `--y:${rand(2, 96)}vh;--s:${glyph ? rand(11, 15) : rand(12, 22)}px;--t:${rand(26, 60)}s;--d:${rand(-60, 0)}s;--rot:${rand(-360, 360)}deg;--wave:${rand(-120, 120)}px;--o:${rand(.12, .35)}`;
      layer.appendChild(s);
    }
    cosmos.appendChild(layer);
  }

  /* ───── Spotlight, barra de progreso y nav ───── */
  const spot = $(".spot");
  if (fine && spot) addEventListener("pointermove", (e) => {
    spot.style.setProperty("--mx", e.clientX + "px");
    spot.style.setProperty("--my", e.clientY + "px");
  }, { passive: true });

  const nav = $(".nav");
  const bar = $(".progress span");
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar?.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : 0);
    nav?.classList.toggle("is-scrolled", y > 40);
    nav?.classList.toggle("is-hidden", y > 500 && y > lastY + 4);
    if (y < lastY - 4 || y < 500) nav?.classList.remove("is-hidden");
    lastY = y;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // sección actual en la nav
  const navLinks = $$(".nav-links a[href^='#']");
  const secIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === "#" + en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  navLinks.forEach((a) => { const t = $(a.getAttribute("href")); if (t) secIO.observe(t); });

  /* ───── Reveal al scroll ───── */
  const rvIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); rvIO.unobserve(en.target); }
    });
  }, { threshold: .12, rootMargin: "0px 0px -6% 0px" });
  const startReveal = () => $$(".rv").forEach((el) => (reduced ? el.classList.add("in") : rvIO.observe(el)));

  /* ───── Intro de arranque (una vez por sesión) ───── */
  const boot = $(".boot");
  let seen = false;
  try { seen = sessionStorage.getItem("camus-boot") === "1"; sessionStorage.setItem("camus-boot", "1"); } catch {}
  if (!boot || reduced || seen) { boot?.remove(); startReveal(); }
  else {
    const finish = () => {
      if (boot.classList.contains("is-done")) return;
      boot.classList.add("is-done");
      setTimeout(startReveal, 250);
      setTimeout(() => boot.remove(), 900);
    };
    setTimeout(finish, 1750);
    boot.addEventListener("click", finish);
    addEventListener("keydown", finish, { once: true });
  }

  /* ───── Texto que se "descifra" en los eyebrows ───── */
  const glyphs = "!<>-_\\/[]{}=+*^?#01ABCDEF$%";
  const decrypt = (el) => {
    if (reduced || el.dataset.done) return;
    el.dataset.done = "1";
    const chars = Array.from(el.textContent);
    const keep = chars.findIndex((c) => /[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(c));
    let frame = 0;
    const total = chars.length * 2 + 10;
    const run = () => {
      el.textContent = chars.map((c, i) => (i < keep || c === " " || frame > i * 2 + 10 ? c : glyphs[(Math.random() * glyphs.length) | 0])).join("");
      if (frame++ < total) requestAnimationFrame(run);
    };
    run();
  };
  const decIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { decIO.unobserve(en.target); setTimeout(() => decrypt(en.target), 250); } });
  }, { threshold: 1 });
  $$(".eyebrow").forEach((el) => decIO.observe(el));

  /* ───── Contadores ───── */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      countIO.unobserve(en.target);
      const el = en.target, to = +el.dataset.count, pre = el.dataset.prefix || "";
      if (reduced) return;
      const t0 = performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - t0) / 1600);
        el.textContent = pre + Math.round(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  });
  $$("[data-count]").forEach((el) => countIO.observe(el));

  /* ───── Escena 3D del hero ───── */
  const scene = $("[data-parallax]");
  if (scene && fine && !reduced) {
    addEventListener("pointermove", (e) => {
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      scene.style.setProperty("--ty", (x * 26).toFixed(2) + "deg");
      scene.style.setProperty("--tx", (-y * 18).toFixed(2) + "deg");
    }, { passive: true });
  }

  /* ───── Marquesina infinita ───── */
  if (!reduced) $$(".marquee-track").forEach((t) => {
    $$("li", t).forEach((li) => { const c = li.cloneNode(true); c.setAttribute("aria-hidden", "true"); t.appendChild(c); });
  });

  /* ───── Lluvia hexadecimal en seguridad ───── */
  const rainHost = $("[data-hexrain]");
  if (rainHost && !reduced) {
    const cv = document.createElement("canvas");
    rainHost.appendChild(cv);
    const ctx = cv.getContext("2d");
    const chars = "0123456789ABCDEF<>/{}#$%";
    let cols = [], fs = 16, run = false, W, H;
    const size = () => {
      W = cv.width = rainHost.clientWidth; H = cv.height = rainHost.clientHeight;
      cols = Array.from({ length: Math.ceil(W / fs) }, () => rand(-H / fs, 0));
    };
    size();
    addEventListener("resize", size);
    let last = 0;
    const draw = (t) => {
      if (!run) return;
      if (t - last > 55) {
        last = t;
        ctx.fillStyle = "rgba(7,6,13,.16)";
        ctx.fillRect(0, 0, W, H);
        ctx.font = `600 ${fs - 2}px ui-monospace, Consolas, monospace`;
        cols.forEach((y, i) => {
          const ch = chars[(Math.random() * (chars.length - 1)) | 0];
          ctx.fillStyle = Math.random() < .08 ? "#ff3d5a" : "#34f5a1";
          ctx.fillText(ch, i * fs, y * fs);
          cols[i] = y * fs > H && Math.random() > .97 ? 0 : y + 1;
        });
      }
      requestAnimationFrame(draw);
    };
    new IntersectionObserver(([en]) => {
      const was = run; run = en.isIntersecting;
      if (run && !was) requestAnimationFrame(draw);
    }).observe(rainHost.parentElement.parentElement);
  }

  /* ───── Terminal de auditoría ───── */
  const term = $("[data-term]");
  if (term) {
    const lines = $$("li", term);
    let playing = false;
    const play = () => {
      if (playing) return;
      playing = true;
      lines.forEach((l) => l.classList.remove("on"));
      lines.forEach((l, i) => setTimeout(() => l.classList.add("on"), 300 + i * 650));
      setTimeout(() => { playing = false; if (termVisible) play(); }, 300 + lines.length * 650 + 5000);
    };
    let termVisible = false;
    if (reduced) lines.forEach((l) => l.classList.add("on"));
    else new IntersectionObserver(([en]) => { termVisible = en.isIntersecting; if (termVisible) play(); }, { threshold: .4 }).observe(term);
  }

  /* ───── Candados que se cierran ───── */
  const locks = $$(".locks li");
  if (locks.length) {
    locks.forEach((l, i) => l.style.setProperty("--i", i));
    const lockAll = () => {
      locks.forEach((l, i) => setTimeout(() => l.classList.add("locked"), 200 + i * 220));
      setTimeout(() => {
        locks.forEach((l) => l.classList.remove("locked"));
        if (vaultVisible) setTimeout(lockAll, 900);
      }, 200 + locks.length * 220 + 4200);
    };
    let vaultVisible = false, started = false;
    if (reduced) locks.forEach((l) => l.classList.add("locked"));
    else new IntersectionObserver(([en]) => {
      vaultVisible = en.isIntersecting;
      if (vaultVisible && !started) { started = true; lockAll(); }
      if (!vaultVisible) started = false;
    }, { threshold: .4 }).observe($(".locks"));
  }

  /* ───── Proceso: scrollytelling ───── */
  const steps = $$(".step");
  const scenes = $$(".scene-s");
  const stageTitle = $(".stage-title");
  const typeTarget = $("[data-type-target]");
  const codeSrc = [
    ["k", "async function "], ["f", "armarPedido"], ["", "(cliente) {\n"],
    ["", "  "], ["k", "const "], ["v", "items"], ["", " = "], ["k", "await "], ["f", "carrito"], ["", ".listar();\n"],
    ["", "  "], ["k", "const "], ["v", "total"], ["", " = items."], ["f", "reduce"], ["", "((a, i) => a + i.precio, 0);\n"],
    ["", "  "], ["k", "await "], ["f", "stock"], ["", ".descontar(items);\n"],
    ["", "  "], ["f", "whatsapp"], ["", ".avisar("], ["s", "`Nuevo pedido $${total}`"], ["", ");\n"],
    ["", "  "], ["k", "return "], ["s", "\"ok\""], ["", ";\n}\n"],
    ["c", "// 40 pedidos por día, cero perdidos"],
  ];
  let typeTimer = null;
  const typeCode = () => {
    if (!typeTarget) return;
    clearTimeout(typeTimer);
    typeTarget.innerHTML = "";
    if (reduced) {
      typeTarget.innerHTML = codeSrc.map(([c, t]) => (c ? `<span class="tk-${c}">${esc(t)}</span>` : esc(t))).join("");
      return;
    }
    let seg = 0, ch = 0, span = null;
    const caret = document.createElement("span");
    caret.className = "caret";
    const next = () => {
      if (seg >= codeSrc.length) { typeTarget.appendChild(caret); return; }
      const [cls, txt] = codeSrc[seg];
      if (ch === 0) {
        span = document.createElement("span");
        if (cls) span.className = "tk-" + cls;
        typeTarget.appendChild(span);
      }
      span.textContent += txt[ch++];
      typeTarget.appendChild(caret);
      if (ch >= txt.length) { seg++; ch = 0; }
      typeTimer = setTimeout(next, txt[ch - 1] === "\n" ? 90 : rand(6, 16));
    };
    next();
  };
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const setStep = (n) => {
    steps.forEach((s) => s.classList.toggle("is-active", s.dataset.step === n));
    scenes.forEach((s) => s.classList.toggle("is-on", s.dataset.scene === n));
    const st = steps.find((s) => s.dataset.step === n);
    if (stageTitle && st) stageTitle.textContent = st.dataset.title;
    if (n === "3") typeCode(); else clearTimeout(typeTimer);
  };
  if (steps.length) {
    const stepIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) setStep(en.target.dataset.step); });
    }, { rootMargin: "-48% 0px -48% 0px" });
    steps.forEach((s) => stepIO.observe(s));
    setStep("1");
  }

  /* ───── Tilt 3D + brillo ───── */
  const tilt = (el, max, surface = el) => {
    if (!fine || reduced) return;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      surface.classList.add("is-tilting");
      surface.style.setProperty("--ry", ((x - .5) * max).toFixed(2) + "deg");
      surface.style.setProperty("--rx", ((.5 - y) * max).toFixed(2) + "deg");
      surface.style.setProperty("--gx", x * 100 + "%");
      surface.style.setProperty("--gy", y * 100 + "%");
    });
    el.addEventListener("pointerleave", () => {
      surface.classList.remove("is-tilting");
      surface.style.setProperty("--rx", "0deg");
      surface.style.setProperty("--ry", "0deg");
    });
  };
  $$(".pj").forEach((pj) => tilt(pj, 10, $(".pj-in", pj)));
  $$("[data-tilt]").forEach((b) => tilt(b, 22));
  $$(".svc").forEach((s) => s.addEventListener("pointermove", (e) => {
    const r = s.getBoundingClientRect();
    s.style.setProperty("--gx", e.clientX - r.left + "px");
    s.style.setProperty("--gy", e.clientY - r.top + "px");
  }));

  /* ───── Botones magnéticos ───── */
  if (fine && !reduced) $$(".btn").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.setProperty("--bx", ((e.clientX - r.left - r.width / 2) * .25).toFixed(1) + "px");
      b.style.setProperty("--by", ((e.clientY - r.top - r.height / 2) * .35).toFixed(1) + "px");
    });
    b.addEventListener("pointerleave", () => { b.style.setProperty("--bx", "0px"); b.style.setProperty("--by", "0px"); });
  });

  /* ───── Filtros de proyectos ───── */
  const filterBtns = $$("[data-filter]");
  const projects = $$(".pj");
  filterBtns.forEach((btn) => btn.addEventListener("click", () => {
    const f = btn.dataset.filter;
    filterBtns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    projects.forEach((p, i) => {
      const show = f === "all" || p.dataset.cats.split(" ").includes(f);
      p.classList.toggle("is-out", !show);
      p.classList.remove("is-pop");
      if (show && !reduced) { void p.offsetWidth; p.style.animationDelay = i * 0.04 + "s"; p.classList.add("is-pop"); }
      p.classList.add("in");
    });
  }));

  /* ───── Ficha del proyecto ───── */
  const dialog = $("#ficha");
  const body = $("#ficha-body");
  const openCase = (pj) => {
    const tpl = $("template.pj-detail", pj);
    const frag = tpl.content.cloneNode(true);
    const shots = $$("img[data-shot]", frag);
    const video = $("video[data-video]", frag);
    shots.forEach((s) => s.remove());
    video?.remove();

    const accent = pj.style.getPropertyValue("--accent");
    dialog.style.setProperty("--accent", accent);
    body.innerHTML = "";
    const head = document.createElement("div");
    head.className = "f-head";
    head.innerHTML = `<span class="pj-emoji" style="--accent:${accent}">${$(".pj-emoji", pj).textContent}</span>
      <div><p class="pj-cat" style="--accent:${accent}">${$(".pj-cat", pj).textContent}</p><h3 id="ficha-title">${$("h3", pj).textContent}</h3></div>`;
    const text = document.createElement("div");
    text.className = "f-text";
    text.appendChild(frag);
    const stack = $(".pj-stack", pj).cloneNode(true);
    stack.style.setProperty("--accent", accent);
    text.appendChild(stack);
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
        main.innerHTML = it.type === "video"
          ? `<video src="${it.src}" poster="${it.poster}" controls autoplay muted loop playsinline></video>`
          : `<img src="${it.src}" alt="${it.alt}" />`;
        $$("button", thumbs).forEach((b, j) => b.setAttribute("aria-current", String(i === j)));
      };
      items.forEach((it, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", it.cap || "Imagen " + (i + 1));
        b.innerHTML = it.type === "video" ? `<span class="is-video">▶️</span><small>Video</small>` : `<img src="${it.src}" alt="" loading="lazy" /><small>${it.cap || ""}</small>`;
        b.addEventListener("click", () => show(i));
        thumbs.appendChild(b);
      });
      body.append(main, thumbs);
      show(0);
    }
    dialog.showModal();
    $(".ficha", dialog).scrollTop = 0;
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-open]");
    if (b) openCase(b.closest(".pj"));
  });
  dialog?.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  dialog?.addEventListener("close", () => { body.innerHTML = ""; });

  /* ───── Copiar correo ───── */
  const live = $("#copy-live");
  $("[data-copy-email]")?.addEventListener("click", async (e) => {
    const mail = "lautarodemiannunez32@gmail.com";
    const label = $("span", e.currentTarget);
    try { await navigator.clipboard.writeText(mail); label.textContent = "¡Copiado!"; live.textContent = "Correo copiado."; }
    catch { location.href = "mailto:" + mail; }
    setTimeout(() => (label.textContent = "Copiar correo"), 2200);
  });

  /* ───── Menú móvil ───── */
  const burger = $(".burger");
  const mnav = $("#mnav");
  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    mnav.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger?.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  mnav?.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && mnav?.classList.contains("is-open")) setMenu(false); });

  /* ───── Cursor propio ───── */
  if (fine && !reduced) {
    const ring = document.createElement("div");
    const dot = document.createElement("div");
    ring.className = "cur"; dot.className = "cur-dot";
    ring.setAttribute("aria-hidden", "true"); dot.setAttribute("aria-hidden", "true");
    document.body.append(ring, dot);
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    addEventListener("pointermove", (e) => { x = e.clientX; y = e.clientY; dot.style.transform = `translate3d(${x}px,${y}px,0)`; }, { passive: true });
    const loop = () => {
      rx += (x - rx) * .18; ry += (y - ry) * .18;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener("pointerover", (e) => {
      const view = e.target.closest(".pj");
      const link = e.target.closest("a, button, [data-tilt], .marquee-track li, .locks li");
      ring.classList.toggle("is-view", !!view && !link);
      ring.classList.toggle("is-link", !!link);
      ring.textContent = view && !link ? "Ver" : "";
    });
    document.addEventListener("pointerleave", () => { ring.style.opacity = 0; dot.style.opacity = 0; });
    document.addEventListener("pointerenter", () => { ring.style.opacity = 1; dot.style.opacity = 1; });
  }

  /* ───── Cintas: texto infinito y torsión según velocidad del scroll ───── */
  const tapes = $$(".tape");
  tapes.forEach((t) => $$(".tape-row p", t).forEach((p) => (p.textContent = p.textContent.repeat(2))));
  if (tapes.length && !reduced) {
    let prev = scrollY, sk = 0;
    const skLoop = () => {
      const v = scrollY - prev;
      prev = scrollY;
      sk += (Math.max(-14, Math.min(14, v * .35)) - sk) * .12;
      tapes.forEach((t) => t.style.setProperty("--sk", sk.toFixed(2) + "deg"));
      requestAnimationFrame(skLoop);
    };
    skLoop();
  }

  /* ───── Easter egg: escribí "hack" ───── */
  let buf = "";
  addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea")) return;
    buf = (buf + e.key.toLowerCase()).slice(-4);
    if (buf !== "hack") return;
    const o = document.createElement("div");
    o.className = "hacked";
    o.innerHTML = `<div>ACCESS DENIED<small>Buen intento — este sitio está protegido. Si querés que el tuyo también lo esté, escribime.</small></div>`;
    document.body.appendChild(o);
    setTimeout(() => o.remove(), 3200);
    o.addEventListener("click", () => o.remove());
  });
})();
