/* LautaroDev · TIENDA "showroom" + páginas de pago (dueño: agente 08).
   Lee window.PRODUCTOS / PRODUCTOS_NIVELES (productos.js) y window.LD_CONFIG (config.js). No toca la API de Stripe:
   cada producto tiene un Payment Link público (stripeLink) que cobra SOLO el anticipo. Link vacío → "Pago online
   próximamente" + contacto prellenado. Link lleno → https://buy.stripe.com/… en la misma pestaña.

   Monta en [data-shop-stage] (index ES/EN). En gracias.html / pago-cancelado.html completa los [data-pay-*].

   Eventos que emite (burbujean hasta document):
     ld:shop-ready (document) al montar → motion.js refresca.
     ld:shop-act  detail { act: 1|2|3, nivel: 1|2|3 (alias), intensity: 0.22|0.55|1, mode: "pin"|"stack" }  → 05 sincroniza el objeto 3D.
   Idioma: al tocar "Pagar anticipo" guarda localStorage["ld:lang"]; gracias/pago-cancelado (ES) redirige a en/ si es "en".
   JSON-LD: NO lo inyecta este archivo (el 02 pega el estático que generó el 10).
   API: window.LD_TIENDA = { act, mode, goTo(id) }.

   Modos:
     pin   → ≥1024 px de ancho y ≥680 px de alto, con GSAP + ScrollTrigger y sin reduced-motion: tres actos pinneados.
     stack → mobile, reduced-motion o sin GSAP: actos apilados, cada uno con su entrada. Sin JS: <noscript> de 02. */
(() => {
  "use strict";

  const doc = document;
  const root = doc.documentElement;
  const CFG = window.LD_CONFIG;
  const PRODUCTOS = window.PRODUCTOS;
  const NIVELES = window.PRODUCTOS_NIVELES;
  if (!CFG || !Array.isArray(PRODUCTOS) || !Array.isArray(NIVELES)) return;

  const lang = CFG.lang();
  const EN = lang === "en";

  /* ── Textos de interfaz que genera JS (11 pule el EN acá) ───────────────── */
  const STR = {
    es: {
      rail: "Niveles de la tienda",
      from: "desde",
      perMonth: "/mes",
      includes: "Qué incluye",
      price: "Precio",
      mode: "Modalidad",
      term: "Plazo",
      modes: { "pago único": "Pago único", "+ mensual": "Setup + mensualidad", anticipo: "Se cotiza según el alcance" },
      plazo: (t) => t,
      pay: (amt) => "Pagar anticipo · " + amt,
      secure: "Pago seguro con Stripe, en esta misma pestaña.",
      soon: "Pago online próximamente",
      askLink: { mail: "Pedir el link de pago por mail", whatsapp: "Pedir el link de pago por WhatsApp" },
      consult: { mail: "Consultar por mail", whatsapp: "Consultar por WhatsApp" },
      askMsg: (n, amt) => "Hola Lautaro, quiero contratar \"" + n + "\". Vi que el pago online todavía no está activo: ¿me pasás cómo abonar el anticipo de " + amt + " para arrancar?",
      live: (n, c) => "Nivel " + n + ": " + c + " servicios.",
      group: "es-AR"
    },
    en: {
      rail: "Pricing tiers",
      from: "from",
      perMonth: "/mo",
      includes: "What's included",
      price: "Price",
      mode: "Billing",
      term: "Timeline",
      modes: { "pago único": "One-time payment", "+ mensual": "Setup + monthly fee", anticipo: "Quoted by scope" },
      plazo: (t) => (t === "a coordinar" ? "set case by case" : t),
      pay: (amt) => "Pay deposit · " + amt,
      secure: "Secure checkout by Stripe. Opens in this tab.",
      soon: "Online checkout coming soon",
      askLink: { mail: "Email me for the deposit link", whatsapp: "Get the deposit link on WhatsApp" },
      consult: { mail: "Ask by email", whatsapp: "Ask on WhatsApp" },
      askMsg: (n, amt) => "Hi Lautaro, I'd like to get started with \"" + n + "\". Online checkout isn't live yet, so how can I pay the " + amt + " deposit?",
      live: (n, c) => "Tier " + n + ": " + c + " services.",
      group: "en-US"
    }
  }[EN ? "en" : "es"];

  /* ── Utilidades ─────────────────────────────────────────────────────────── */
  const num = (v) => Number(v).toLocaleString(STR.group);
  const usd = (v) => "USD " + num(v);
  const dot = (t) => (/[.!?]$/.test(t) ? t : t + ".");
  const T = (p, k) => (EN && p.en && p.en[k] != null ? p.en[k] : p[k]);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const cssTime = (name, fallback) => {
    const v = getComputedStyle(root).getPropertyValue(name).trim();
    if (!v) return fallback;
    const n = parseFloat(v);
    return isNaN(n) ? fallback : (v.endsWith("ms") ? n / 1000 : n);
  };
  const intensityOf = (lvl) => {
    const v = parseFloat(getComputedStyle(root).getPropertyValue("--shop-intensity-" + lvl));
    return isNaN(v) ? [0.22, 0.55, 1][lvl - 1] : v;
  };

  /* Solo URLs públicas de Payment Links. Cualquier otra cosa se trata como vacío (no se navega a nada raro). */
  const STRIPE_RE = /^https:\/\/buy\.stripe\.com\/[A-Za-z0-9_\-/]+$/;
  const payLink = (p) => {
    const raw = String(p.stripeLink || "").trim();
    if (!raw) return null;
    if (!STRIPE_RE.test(raw)) {
      console.warn("[tienda] stripeLink inválido en el producto " + p.id + ": se usa el contacto.");
      return null;
    }
    const u = new URL(raw);
    u.searchParams.set("locale", EN ? "en" : "es-419");
    return u.href;
  };

  /* Crea elementos sin innerHTML: todo texto entra por textContent. */
  const h = (tag, attrs, ...kids) => {
    const el = doc.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : doc.createTextNode(String(kid)));
    return el;
  };

  /* Contador con ease-out-circ (frena con peso). Interrumpible: arranca desde lo que está mostrando. */
  const easeOutCirc = (t) => Math.sqrt(1 - Math.pow(t - 1, 2));
  const countTo = (el, to, dur) => {
    cancelAnimationFrame(el._raf);
    const from = el._val == null ? to : el._val;
    if (reduce.matches || from === to || !dur) { el._val = to; el.textContent = num(to); return; }
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, Math.max(0, (now - t0) / (dur * 1000)));
      el._val = Math.round(from + (to - from) * easeOutCirc(t));
      el.textContent = num(el._val);
      if (t < 1) el._raf = requestAnimationFrame(step);
    };
    el._raf = requestAnimationFrame(step);
  };

  /* Scramble: las cifras giran como un contador mecánico y se asientan de izquierda a derecha. */
  const GLYPHS = "0123456789";
  const scramble = (el, text, dur = 0.6) => {
    cancelAnimationFrame(el._sraf);
    if (reduce.matches) { el.textContent = text; return; }
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, Math.max(0, (now - t0) / (dur * 1000)));
      const settled = Math.floor(text.length * t);
      let out = "";
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        out += i < settled || c === " " || c === "/" ? c : GLYPHS[(Math.random() * 10) | 0];
      }
      el.textContent = out;
      if (t < 1) el._sraf = requestAnimationFrame(step);
    };
    el._sraf = requestAnimationFrame(step);
  };

  /* ═════════════════════════════════════════════════════════════════════════
     PÁGINAS DE PAGO (gracias / pago-cancelado)
     ═════════════════════════════════════════════════════════════════════════ */
  const LANG_KEY = "ld:lang";
  const payPage = doc.querySelector("[data-pay-page]");
  if (payPage) {
    /* Cada Payment Link redirige a una sola URL (la gracias en ES). Si la persona pagó desde el sitio en
       inglés, tienda.js guardó "en" antes de salir a Stripe: la mandamos a la versión EN con el mismo ?producto. */
    let saved = null;
    try { saved = localStorage.getItem(LANG_KEY); } catch (e) { /* sin storage: queda en ES */ }
    if (!EN && saved === "en") {
      const alt = payPage.querySelector("a[data-pay-keep-query]");
      if (alt) { location.replace(alt.getAttribute("href").replace(/[?#].*$/, "") + location.search); return; }
    }
    const raw = new URLSearchParams(location.search).get("producto") || "";
    const p = /^\d{1,2}$/.test(raw) ? window.LD_PRODUCTO(raw) : null;
    const nombre = p ? T(p, "nombre") : "";
    if (p) {
      payPage.querySelectorAll("[data-pay-if-product]").forEach((el) => { el.hidden = false; });
      payPage.querySelectorAll("[data-pay-if-generic]").forEach((el) => { el.hidden = true; });
      payPage.querySelectorAll("[data-pay-product]").forEach((el) => { el.textContent = nombre; });
      payPage.querySelectorAll("[data-pay-amount]").forEach((el) => { el.textContent = usd(window.LD_ANTICIPO(p)); });
      payPage.querySelectorAll("[data-pay-pct]").forEach((el) => { el.textContent = p.anticipoPct + "%"; });
      payPage.querySelectorAll("[data-pay-saldo]").forEach((el) => { el.textContent = dot(window.LD_SALDO(p, lang, true)); });
      payPage.querySelectorAll("[data-pay-price]").forEach((el) => { el.textContent = window.LD_PRECIO(p, lang); });
      payPage.querySelectorAll("[data-pay-back]").forEach((a) => {
        a.href = a.getAttribute("href").replace(/#.*$/, "") + "#producto-" + p.id;
      });
      /* Reintentar: el mismo Payment Link si existe; si no, la fila del producto en la tienda. */
      payPage.querySelectorAll("[data-pay-retry]").forEach((a) => {
        const link = payLink(p);
        if (link) { a.href = link; a.rel = "noopener"; }
        else a.href = a.getAttribute("href").replace(/#.*$/, "") + "#producto-" + p.id;
      });
    }
    /* Cambio de idioma conservando ?producto=NN */
    payPage.querySelectorAll("a[data-pay-keep-query]").forEach((a) => {
      /* Elegir idioma a mano pisa la preferencia (si no, ES → EN → ES sería un bucle). */
      a.addEventListener("click", () => { try { localStorage.setItem(LANG_KEY, EN ? "es" : "en"); } catch (e) { /* opcional */ } });
      if (p) a.href = a.getAttribute("href").replace(/[?#].*$/, "") + "?producto=" + p.id;
    });
    /* Contacto prellenado: data-pay-msg (con producto) o data-pay-msg-generic. {producto} se reemplaza. */
    payPage.querySelectorAll("a[data-pay-contact]").forEach((a) => {
      const tpl = p ? a.dataset.payMsg : a.dataset.payMsgGeneric;
      const r = CFG.contactLink({
        tema: p ? "producto" : "general",
        producto: nombre,
        mensaje: tpl ? tpl.replace(/\{producto\}/g, nombre) : undefined,
        asunto: a.dataset.paySubject
          ? (p ? a.dataset.paySubject.replace(/\{producto\}/g, nombre) : a.dataset.paySubject.replace(/\s*[·:\-–]\s*\{producto\}|\{producto\}/g, ""))
          : undefined
      });
      a.href = r.href;
      a.dataset.contactChannel = r.canal;
      if (r.canal === "whatsapp") { a.target = "_blank"; a.rel = "noopener"; }
      const lbl = a.querySelector("[data-contact-label]");
      if (lbl) {
        const t = r.canal === "whatsapp" ? lbl.dataset.labelWhatsapp : lbl.dataset.labelMail;
        if (t) lbl.textContent = t;
      }
    });
    return;
  }

  /* ═════════════════════════════════════════════════════════════════════════
     SHOWROOM
     ═════════════════════════════════════════════════════════════════════════ */
  const shop = doc.querySelector("[data-shop]");
  const stage = shop && shop.querySelector("[data-shop-stage]");
  if (!stage) return;
  const live = doc.querySelector("[data-shop-live]");
  const announce = (msg) => { if (live) { live.textContent = ""; setTimeout(() => { live.textContent = msg; }, 40); } };

  const byLevel = NIVELES.map((n) => ({ n, items: PRODUCTOS.filter((p) => p.nivel === n.nivel) }));
  const actCount = byLevel.length;
  const pad2 = (n) => String(n).padStart(2, "0");

  /* ── Fila editorial de un producto ── */
  const buildRow = (p, i) => {
    const nombre = T(p, "nombre");
    const detId = "producto-" + p.id + "-detalle";
    const etiqueta = p.destacado ? T(p, "etiqueta") : null;
    const anticipo = usd(window.LD_ANTICIPO(p));
    const link = payLink(p);
    const consult = CFG.contactLink({ tema: "producto", producto: nombre });

    const headPrice = h("span", { class: "row-price" },
      p.desde ? h("span", { class: "row-price-pre", text: STR.from + " " }) : null,
      usd(p.precio),
      p.mensual ? h("span", { class: "row-price-month", text: " + " + usd(p.mensual) + STR.perMonth }) : null
    );

    let payBlock;
    if (link) {
      payBlock = h("div", { class: "row-pay", "data-pay-state": "live" },
        h("a", { class: "shop-btn shop-btn--pay", href: link, rel: "noopener", "data-shop-pay": p.id }, STR.pay(anticipo)),
        h("p", { class: "row-saldo", text: dot(window.LD_SALDO(p, lang)) }),
        h("p", { class: "row-secure", text: STR.secure })
      );
    } else {
      const ask = CFG.contactLink({ tema: "producto", producto: nombre, mensaje: STR.askMsg(nombre, anticipo) });
      payBlock = h("div", { class: "row-pay", "data-pay-state": "soon" },
        h("p", { class: "row-soon" }, h("span", { class: "row-soon-dot", "aria-hidden": "true" }), STR.soon),
        h("a", {
          class: "shop-btn shop-btn--pay", href: ask.href, "data-shop-ask": p.id, "data-contact-channel": ask.canal,
          target: ask.canal === "whatsapp" ? "_blank" : null, rel: ask.canal === "whatsapp" ? "noopener" : null
        }, STR.askLink[ask.canal]),
        h("p", { class: "row-saldo" }, h("strong", { text: STR.pay(anticipo) }), " — " + dot(window.LD_SALDO(p, lang)))
      );
    }

    const li = h("li", {
      class: "row" + (p.destacado ? " row--featured" : ""), id: "producto-" + p.id, "data-product": p.id, style: "--i:" + i
    },
      h("h4", { class: "row-title" },
        h("button", { class: "row-toggle", type: "button", "aria-expanded": "false", "aria-controls": detId },
          h("span", { class: "row-n", "aria-hidden": "true", text: p.id }),
          h("span", { class: "row-name" }, nombre, etiqueta ? h("span", { class: "row-badge lt-glow", text: etiqueta }) : null),
          headPrice,
          h("span", { class: "row-plus", "aria-hidden": "true" })
        )
      ),
      h("p", { class: "row-bajada", text: T(p, "bajada") }),
      h("div", { class: "row-detail", id: detId },
        h("div", { class: "row-detail-in" },
          h("div", { class: "row-cols" },
            h("div", { class: "row-incluye-wrap" },
              h("p", { class: "row-label", text: STR.includes }),
              h("ul", { class: "row-incluye" }, T(p, "incluye").map((t) => h("li", { text: t })))
            ),
            h("dl", { class: "row-terms" },
              h("div", null, h("dt", { text: STR.price }), h("dd", { text: window.LD_PRECIO(p, lang) })),
              h("div", null, h("dt", { text: STR.mode }), h("dd", { text: STR.modes[p.modalidad] || p.modalidad })),
              h("div", null, h("dt", { text: STR.term }), h("dd", { text: STR.plazo(p.plazoEstimado) }))
            )
          ),
          payBlock,
          h("a", {
            class: "shop-btn shop-btn--ghost", href: consult.href, "data-shop-consult": p.id, "data-contact-channel": consult.canal,
            target: consult.canal === "whatsapp" ? "_blank" : null, rel: consult.canal === "whatsapp" ? "noopener" : null
          }, STR.consult[consult.canal])
        )
      )
    );
    return li;
  };

  /* ── Acto (nivel) ── */
  const buildAct = ({ n, items }, idx) => {
    const lvl = n.nivel;
    const nombre = EN && n.en ? n.en.nombre : n.nombre;
    const bajada = EN && n.en ? n.en.bajada : n.bajada;
    const lead = items.find((p) => p.destacado) || items[0];
    const titleId = "tienda-nivel-" + lvl + "-title";
    const act = h("section", { class: "act", "data-level": lvl, id: "tienda-nivel-" + lvl, "aria-labelledby": titleId },
      h("div", { class: "act-lead" },
        h("p", { class: "act-index", "aria-hidden": "true", text: pad2(idx + 1) + " / " + pad2(actCount) }),
        h("h3", { class: "act-title", id: titleId, tabindex: "-1", text: nombre }),
        h("p", { class: "act-bajada", text: bajada }),
        h("div", { class: "act-price", "aria-hidden": "true" },
          h("span", { class: "act-price-pre" }),
          h("span", { class: "act-price-fig" },
            h("span", { class: "act-price-cur", text: "USD" }),
            h("span", { class: "act-price-num lt-text-glow", text: num(lead.precio) })
          ),
          h("span", { class: "act-price-cap" }),
          h("ul", { class: "act-peek" })
        )
      ),
      h("ol", { class: "act-rows" }, items.map(buildRow))
    );
    act._lead = lead;
    return act;
  };

  /* ── Montaje ── */
  const showroom = h("div", { class: "showroom", "data-mode": "stack", "data-act": "1" });
  const viewport = h("div", { class: "showroom-viewport" });
  const glow = h("div", { class: "showroom-glow lt-aurora-live", "aria-hidden": "true" });
  const sweep = h("div", { class: "showroom-sweep", "aria-hidden": "true" });
  const railBtns = [];
  const railBar = h("span", { class: "rail-bar" });
  const rail = h("nav", { class: "showroom-rail", "aria-label": STR.rail },
    h("ol", null, byLevel.map(({ n }, i) => {
      const b = h("button", { type: "button", class: "rail-btn", "data-goto-act": n.nivel, "aria-current": i === 0 ? "true" : null },
        h("span", { class: "rail-n", "aria-hidden": "true", text: pad2(i + 1) }),
        EN && n.en ? n.en.nombre : n.nombre
      );
      railBtns.push(b);
      return h("li", null, b);
    })),
    h("span", { class: "rail-track", "aria-hidden": "true" }, railBar)
  );
  const actsWrap = h("div", { class: "showroom-acts" });
  const acts = byLevel.map(buildAct);
  actsWrap.append(...acts);
  /* Objeto 3D del agente 05: se muda adentro del viewport para que viaje con el pin. */
  const obj3d = shop.querySelector('[data-3d="shop"]');
  viewport.append(glow, ...(obj3d ? [obj3d] : []), sweep, rail, actsWrap);
  showroom.append(viewport);
  stage.replaceChildren(showroom);
  shop.setAttribute("data-shop-ready", "");

  /* ── Estado ── */
  let mode = "stack";
  let current = 0;          /* acto activo (1..3); 0 = ninguno todavía */
  let st = null;            /* ScrollTrigger del pin */
  let io = null;            /* IntersectionObserver del modo stack */
  let ioIn = null;
  let tl = null;            /* timeline de transición entre actos */
  let enterST = null;       /* primera entrada del acto 1 (pin) */

  const rowsOf = (act) => [...act.querySelectorAll(".row")];
  const productOf = (row) => window.LD_PRODUCTO(row.dataset.product);

  /* Precio gigante del acto: cuenta hasta el producto activo y actualiza la leyenda y el "incluye". */
  const showPrice = (act, p, dur) => {
    const numEl = act.querySelector(".act-price-num");
    act.querySelector(".act-price-pre").textContent = p.desde ? STR.from : "";
    const cap = act.querySelector(".act-price-cap");
    const capText = T(p, "nombre") + (p.mensual ? " · + " + usd(p.mensual) + STR.perMonth : "");
    if (cap.textContent !== capText) cap.textContent = capText;
    act.querySelector(".act-peek").replaceChildren(...T(p, "incluye").slice(0, 4).map((t) => h("li", { text: t })));
    act.dataset.active = p.id;
    rowsOf(act).forEach((r) => r.toggleAttribute("data-current", r.dataset.product === p.id));
    countTo(numEl, p.precio, dur);
  };

  /* Acordeón: una fila abierta por acto (abrir otra cierra la anterior). */
  const setOpen = (row, open) => {
    const act = row.closest(".act");
    if (open) rowsOf(act).forEach((r) => { if (r !== row) setOpen(r, false); });
    if (!open && row.contains(doc.activeElement) && !doc.activeElement.classList.contains("row-toggle")) row.querySelector(".row-toggle").focus({ preventScroll: true });
    row.toggleAttribute("data-open", open);
    row.querySelector(".row-toggle").setAttribute("aria-expanded", String(open));
    if (open) showPrice(act, productOf(row), cssTime("--dur-slower", 0.9));
    if (mode === "stack") refreshSoon();
  };

  let refreshT = 0;
  const refreshSoon = () => {
    if (!window.ScrollTrigger) return;
    clearTimeout(refreshT);
    refreshT = setTimeout(() => window.ScrollTrigger.refresh(), (cssTime("--dur-slow", 0.52) * 1000) + 60);
  };

  const emit = (lvl) => {
    showroom.dataset.act = String(lvl);
    railBtns.forEach((b, i) => { if (i === lvl - 1) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
    shop.dispatchEvent(new CustomEvent("ld:shop-act", { bubbles: true, detail: { act: lvl, nivel: lvl, intensity: intensityOf(lvl), mode } }));
  };

  /* Valor que muestra el acto anterior: el contador del nuevo arranca desde ahí ("el número se transforma"). */
  const lastShown = () => {
    const prev = acts[current - 1];
    const el = prev && prev.querySelector(".act-price-num");
    return el && el._val != null ? el._val : null;
  };

  const enterAct = (lvl, dir) => {
    if (lvl === current) return;
    const prevIdx = current;
    const from = lastShown();
    current = lvl;
    const act = acts[lvl - 1];
    const p = productOf(act.querySelector(".row[data-open]") || act.querySelector("#producto-" + act._lead.id));
    const numEl = act.querySelector(".act-price-num");
    if (from != null) { numEl._val = from; numEl.textContent = num(from); }
    showPrice(act, p, cssTime("--dur-epic", 2.2));
    scramble(act.querySelector(".act-index"), pad2(lvl) + " / " + pad2(actCount), 0.7);
    if (mode === "pin") {
      transition(prevIdx, lvl, dir);
      /* Nunca un foco invisible: si el foco quedó en el acto que se tapa, pasa al título del acto visible. */
      const out = prevIdx && acts[prevIdx - 1];
      if (out && out.contains(doc.activeElement)) act.querySelector(".act-title").focus({ preventScroll: true });
    }
    emit(lvl);
  };

  /* ── Transición entre actos (pin): barrido de señal + máscara que viaja con él ── */
  const transition = (fromLvl, toLvl, dir) => {
    const g = window.gsap;
    const inc = acts[toLvl - 1];
    const out = fromLvl ? acts[fromLvl - 1] : null;
    const fwd = dir >= 0;
    if (tl) tl.progress(1).kill();
    acts.forEach((a) => { if (a !== inc && a !== out) g.set(a, { clipPath: "inset(0% 0% 0% 100%)", pointerEvents: "none", zIndex: 0 }); });
    if (!out) { g.set(inc, { clipPath: "inset(0% 0% 0% 0%)", pointerEvents: "auto", zIndex: 2 }); return; }
    const d = cssTime("--dur-slower", 0.9);
    const ease = easeM("quint", "power3.inOut");
    const W = viewport.clientWidth;   /* la línea de señal viaja con el borde de la máscara */
    tl = g.timeline({ defaults: { ease, duration: d } });
    tl.set(inc, { zIndex: 2, pointerEvents: "auto" }).set(out, { zIndex: 1, pointerEvents: "none" })
      .fromTo(sweep, { x: fwd ? 0 : W, autoAlpha: 1 }, { x: fwd ? W : 0 }, 0)
      .fromTo(inc, { clipPath: fwd ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 0%)" }, 0)
      .to(out, { clipPath: fwd ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)" }, 0)
      .fromTo(inc.querySelector(".act-price-fig"), { scale: fromLvl < toLvl ? 0.86 : 1.12 }, { scale: 1, duration: cssTime("--dur-epic", 2.2), ease: easeM("expo", "expo.out") }, 0)
      .fromTo(rowsOf(inc), { y: fwd ? 28 : -28, opacity: 0 }, { y: 0, opacity: 1, duration: cssTime("--dur-slow", 0.52), ease: easeM("expo", "expo.out"), stagger: cssTime("--stagger-rows", 0.12), clearProps: "transform,opacity" }, d * 0.35)
      .set(sweep, { autoAlpha: 0 });
  };

  /* Mismo lenguaje que motion.js (04): eases de LD_MOTION si está, si no los equivalentes de GSAP. */
  const easeM = (k, fb) => (window.LD_MOTION && window.LD_MOTION.ease && window.LD_MOTION.ease[k]) || fb;

  /* ── Modo pin (desktop) ── */
  const mqPin = matchMedia("(min-width: 1024px) and (min-height: 680px)");
  const canPin = () => !!(window.gsap && window.ScrollTrigger) && mqPin.matches && !reduce.matches;

  const actFromProgress = (pr) => Math.min(actCount, 1 + Math.floor(pr * actCount * 0.9999));

  const setupPin = () => {
    const g = window.gsap;
    g.registerPlugin(window.ScrollTrigger);
    mode = "pin";
    showroom.dataset.mode = "pin";
    current = 0;
    acts.forEach((a) => a.removeAttribute("data-pending"));
    st = window.ScrollTrigger.create({
      trigger: showroom,
      start: "top top",
      end: () => "+=" + Math.round(innerHeight * (actCount - 1)),
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        railBar.style.transform = "scaleX(" + self.progress.toFixed(4) + ")";
        glow.style.setProperty("--aurora-angle", (self.progress * 360).toFixed(1) + "deg");
        const lvl = actFromProgress(self.progress);
        if (lvl !== current) enterAct(lvl, self.direction);
      }
    });
    enterAct(actFromProgress(st.progress), 1);
    /* Primera llegada: si el showroom todavía está abajo, el acto 1 entra cuando aparece (precio desde 0). */
    if (showroom.getBoundingClientRect().top > innerHeight) {
      const a1 = acts[0];
      const rows = rowsOf(a1);
      enterST = window.ScrollTrigger.create({
        trigger: showroom, start: "top 70%", once: true,
        onEnter: () => {
          const numEl = a1.querySelector(".act-price-num");
          numEl._val = 0;
          if (current === 1) showPrice(a1, productOf(a1.querySelector(".row[data-open]") || rows[0]), cssTime("--dur-epic", 2.2));
          scramble(a1.querySelector(".act-index"), "01 / " + pad2(actCount), 0.7);
          /* a "top 70%" las filas (centradas en 100svh) siguen abajo del viewport: no hay parpadeo */
          g.fromTo(rows, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: cssTime("--dur-slow", 0.52), ease: easeM("expo", "expo.out"), stagger: cssTime("--stagger-rows", 0.12), clearProps: "transform,opacity" });
        }
      });
    }
    window.ScrollTrigger.sort && window.ScrollTrigger.sort();
    window.ScrollTrigger.refresh();
  };

  const teardownPin = () => {
    if (tl) { tl.kill(); tl = null; }
    if (st) { st.kill(true); st = null; }
    if (enterST) { enterST.kill(); enterST = null; }
    if (window.gsap) window.gsap.set([...acts, sweep, ...acts.flatMap(rowsOf), ...acts.map((a) => a.querySelector(".act-price-fig"))], { clearProps: "all" });
    railBar.style.transform = "";
  };

  /* ── Modo stack (mobile / reduced-motion / sin GSAP) ── */
  const setupStack = () => {
    mode = "stack";
    showroom.dataset.mode = "stack";
    current = 0;
    const animate = !reduce.matches && "IntersectionObserver" in window;
    /* Entrada de cada acto: solo se esconden los que todavía están abajo del viewport. */
    if (animate) {
      acts.forEach((a) => { if (a.getBoundingClientRect().top > innerHeight * 0.9) a.setAttribute("data-pending", ""); });
      ioIn = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const a = e.target;
          if (a.hasAttribute("data-pending")) {
            a.removeAttribute("data-pending");
            a.setAttribute("data-in", "");
            const lvl = +a.dataset.level;
            const numEl = a.querySelector(".act-price-num");
            const prev = acts[lvl - 2] && acts[lvl - 2].querySelector(".act-price-num");
            numEl._val = prev && prev._val != null ? prev._val : 0;
            numEl.textContent = num(numEl._val);
            showPrice(a, productOf(a.querySelector(".row[data-open]") || a.querySelector("#producto-" + a._lead.id)), cssTime("--dur-epic", 2.2));
            scramble(a.querySelector(".act-index"), pad2(lvl) + " / " + pad2(actCount), 0.7);
          }
          ioIn.unobserve(a);
        });
      }, { rootMargin: "0px 0px -15% 0px" });
      acts.forEach((a) => ioIn.observe(a));
    }
    /* Acto "activo" = el que cruza la mitad de la pantalla → evento para el 3D. */
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const lvl = +e.target.dataset.level;
          if (lvl !== current) { current = lvl; emit(lvl); }
        });
      }, { rootMargin: "-50% 0px -50% 0px" });
      acts.forEach((a) => io.observe(a));
    }
  };

  const teardownStack = () => {
    if (io) { io.disconnect(); io = null; }
    if (ioIn) { ioIn.disconnect(); ioIn = null; }
    acts.forEach((a) => { a.removeAttribute("data-pending"); a.removeAttribute("data-in"); });
  };

  const setup = () => {
    if (canPin()) setupPin(); else setupStack();
  };
  const rebuild = () => {
    const want = canPin() ? "pin" : "stack";
    if (want === mode) return;
    if (mode === "pin") teardownPin(); else teardownStack();
    setup();
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  };

  /* ── Navegar a un producto (data-shop-goto, #producto-NN, rail) ── */
  const scrollToAct = (lvl, smooth) => {
    const behavior = smooth && !reduce.matches ? "smooth" : "auto";
    if (mode === "pin" && st) {
      const seg = (st.end - st.start) / actCount;
      const y = Math.round(st.start + seg * (lvl - 1) + seg * 0.5);
      window.scrollTo({ top: y, behavior });
      return behavior === "smooth" && Math.abs(y - scrollY) > 2 ? Math.min(1400, Math.abs(y - scrollY) * 0.5 + 300) : 0;
    }
    acts[lvl - 1].scrollIntoView({ behavior, block: "start" });
    return behavior === "smooth" ? 700 : 0;
  };

  const goTo = (id, opts = {}) => {
    const p = window.LD_PRODUCTO(id);
    if (!p) return;
    const row = doc.getElementById("producto-" + p.id);
    if (!row) return;
    const lvl = p.nivel;
    const wait = scrollToAct(lvl, opts.smooth !== false);
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setOpen(row, true);
      if (mode === "stack") row.scrollIntoView({ block: "center", behavior: "auto" });
      if (opts.focus) row.querySelector(".row-toggle").focus({ preventScroll: true });
      const n = byLevel[lvl - 1].n;
      announce(STR.live(EN && n.en ? n.en.nombre : n.nombre, byLevel[lvl - 1].items.length));
    };
    if (!wait) return finish();
    /* Termina cuando el scroll suave llega (scrollend); si el navegador no lo soporta, por tiempo. */
    /* un frame de gracia: que no lo dispare un scrollend viejo */
    if ("onscrollend" in window) requestAnimationFrame(() => window.addEventListener("scrollend", finish, { once: true }));
    setTimeout(finish, "onscrollend" in window ? 2500 : wait);
  };

  /* ── Eventos ── */
  showroom.addEventListener("click", (e) => {
    if (e.target.closest("[data-shop-pay]")) { try { localStorage.setItem(LANG_KEY, lang); } catch (err) { /* opcional */ } }
    const tog = e.target.closest(".row-toggle");
    if (tog) { const row = tog.closest(".row"); setOpen(row, !row.hasAttribute("data-open")); return; }
    const rb = e.target.closest("[data-goto-act]");
    if (rb) {
      const lvl = +rb.dataset.gotoAct;
      scrollToAct(lvl, true);
      const n = byLevel[lvl - 1].n;
      announce(STR.live(EN && n.en ? n.en.nombre : n.nombre, byLevel[lvl - 1].items.length));
    }
  });

  /* Hover (solo puntero fino) y foco: el precio gigante cuenta hasta esa fila y el costado muestra lo que incluye. */
  const hoverFine = matchMedia("(hover: hover) and (pointer: fine)");
  let hoverT = 0;
  showroom.addEventListener("pointerover", (e) => {
    if (!hoverFine.matches || e.pointerType === "touch") return;
    const row = e.target.closest(".row");
    if (!row || row.dataset.product === row.closest(".act").dataset.active) return;
    clearTimeout(hoverT);
    hoverT = setTimeout(() => showPrice(row.closest(".act"), productOf(row), cssTime("--dur-slower", 0.9)), 90);
  });
  showroom.addEventListener("pointerout", (e) => {
    if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest(".row")) clearTimeout(hoverT);
  });
  /* Al salir de la lista, el precio vuelve a la fila abierta (si hay). */
  showroom.addEventListener("pointerleave", () => {
    clearTimeout(hoverT);
    acts.forEach((a) => {
      const open = a.querySelector(".row[data-open]");
      if (open && a.dataset.active !== open.dataset.product) showPrice(a, productOf(open), cssTime("--dur-slower", 0.9));
    });
  });
  showroom.addEventListener("focusin", (e) => {
    const act = e.target.closest(".act");
    if (!act) return;
    const lvl = +act.dataset.level;
    /* Teclado en modo pin: si el foco entra a un acto que no está a la vista, el scroll lo trae. */
    if (mode === "pin" && lvl !== current) scrollToAct(lvl, false);
    const row = e.target.closest(".row");
    if (row && row.dataset.product !== act.dataset.active) showPrice(act, productOf(row), cssTime("--dur-slower", 0.9));
  });

  doc.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("[data-shop-goto]");
    if (!a) return;
    e.preventDefault();
    goTo(a.dataset.shopGoto, { focus: true });
    if (history.replaceState) history.replaceState(null, "", "#producto-" + window.LD_PRODUCTO(a.dataset.shopGoto).id);
  });

  /* ── Estado inicial: la fila destacada (o la primera) de cada acto abierta ── */
  acts.forEach((a) => {
    const row = a.querySelector("#producto-" + a._lead.id);
    row.setAttribute("data-open", "");
    row.querySelector(".row-toggle").setAttribute("aria-expanded", "true");
    showPrice(a, a._lead, 0);
  });

  setup();
  if (mode === "stack" && !current) { current = 1; emit(1); }
  /* Avisar a motion.js (04) para que recalcule sus pins con el showroom ya montado. */
  doc.dispatchEvent(new CustomEvent("ld:shop-ready", { detail: { mode } }));
  if (!(window.LD_MOTION && window.LD_MOTION.refresh) && window.ScrollTrigger) window.ScrollTrigger.refresh();

  [mqPin, reduce].forEach((mq) => mq.addEventListener && mq.addEventListener("change", rebuild));

  const hash = location.hash.match(/^#producto-(0[1-9])$/);
  if (hash) requestAnimationFrame(() => goTo(hash[1], { smooth: false }));
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(() => { if (window.ScrollTrigger) window.ScrollTrigger.refresh(); });

  window.LD_TIENDA = Object.freeze({
    get act() { return current; },
    get mode() { return mode; },
    goTo: (id) => goTo(id, { focus: true })
  });
})();
