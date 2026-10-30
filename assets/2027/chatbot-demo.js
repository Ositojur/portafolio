/* ═══════════════════════════════════════════════════════════════
   chatbot-demo.js · Portafolio 2027 · agente 06
   Demo guionada de un chatbot de mensajería. NO llama a ninguna API.
   Guiones: window.LD_GUIONES (assets/2027/chatbot-guiones.js, 13 nichos, ES/EN). Si no cargó, usa los
   3 hilos del HTML (ol[data-bot-thread]), que además son lo que se ve sin JS.

   · Teléfono CSS con marco, isla, barra de estado, inclinación 3D (pointer:fine), teclado que sube.
   · Tipos de mensaje: texto, respuestas rápidas, tarjeta (reserva/pedido/turno), nota de voz,
     ubicación, reacción, handoff con una persona que entra.
   · Chips de nichos = tablist (flechas, Home/End, Enter/Espacio activa). Pausar/seguir y repetir.
   · aria-live polite: cada mensaje nuevo. Pausa con foco de teclado adentro y fuera de vista.
   · ld:scene-progress (04) solo adelanta la charla en la segunda mitad del pin. No toca triggers de 04.
   · prefers-reduced-motion: todo visible, sin animar.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var roots = document.querySelectorAll("[data-bot-demo]");
  if (!roots.length) return;

  var reduceMQ = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  var fineMQ = window.matchMedia ? window.matchMedia("(hover: hover) and (pointer: fine)") : { matches: false };
  var LANG = /^en/i.test(document.documentElement.lang || "") ? "en" : "es";

  /* Microcopy que el JS genera (lo que no está en el HTML). */
  var L = {
    es: { today: "Hoy", customer: "Cliente:", bot: "Bot:", human: "Persona del equipo:", verified: "Cuenta verificada",
          voice: "Nota de voz", location: "Ubicación", quick: "Respuestas rápidas:", reacted: "reaccionó con",
          conv: "Conversación de ejemplo:", recording: "Grabando", tablist: "Elegí un rubro" },
    en: { today: "Today", customer: "Customer:", bot: "Bot:", human: "Team member:", verified: "Verified account",
          voice: "Voice note", location: "Location", quick: "Quick replies:", reacted: "reacted with",
          conv: "Sample conversation:", recording: "Recording", tablist: "Pick a business" }
  }[LANG];

  function cssTime(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    var n = parseFloat(v);
    if (!v || isNaN(n)) return fallback;
    return v.slice(-2) === "ms" ? n : n * 1000;
  }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function hide(n) { n.setAttribute("aria-hidden", "true"); return n; }
  function txt(tag, cls, s) { var n = el(tag, cls); n.textContent = s == null ? "" : s; return n; }
  function textOf(node) { return node ? node.textContent.replace(/\s+/g, " ").trim() : ""; }
  function snippet(s, max) { s = s || ""; return s.length > max ? s.slice(0, max - 1).trim() + "…" : s; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function tr(v) {
    if (v == null) return "";
    if (typeof v === "string" || Array.isArray(v)) return v;
    return v[LANG] != null ? v[LANG] : (v.es != null ? v.es : "");
  }

  /* ── Reloj pausable ─────────────────────────────────────────── */
  /* ?botspeed=4 acelera la demo (solo para QA con Playwright; no cambia nada sin el parámetro). */
  var SPEED = (function () { var m = /[?&]botspeed=(\d+(?:\.\d+)?)/.exec(location.search); return m ? Math.max(0.25, Math.min(10, +m[1])) : 1; })();
  function Clock() { this.playing = false; this.waiters = []; }
  Clock.prototype.wait = function (ms) {
    var self = this;
    ms = ms / SPEED;
    return new Promise(function (resolve) {
      var w = { remain: Math.max(0, ms), resolve: resolve, t: 0, start: 0 };
      self.waiters.push(w);
      if (self.playing) self._arm(w);
    });
  };
  Clock.prototype._arm = function (w) {
    var self = this;
    w.start = performance.now();
    w.t = setTimeout(function () {
      var i = self.waiters.indexOf(w);
      if (i > -1) self.waiters.splice(i, 1);
      w.resolve();
    }, w.remain);
  };
  Clock.prototype.play = function () {
    if (this.playing) return;
    this.playing = true;
    for (var i = 0; i < this.waiters.length; i++) this._arm(this.waiters[i]);
  };
  Clock.prototype.pause = function () {
    if (!this.playing) return;
    this.playing = false;
    var now = performance.now();
    for (var i = 0; i < this.waiters.length; i++) {
      var w = this.waiters[i];
      clearTimeout(w.t);
      w.remain = Math.max(0, w.remain - (now - w.start));
    }
  };
  Clock.prototype.clear = function () {
    for (var i = 0; i < this.waiters.length; i++) clearTimeout(this.waiters[i].t);
    this.waiters = [];
  };

  /* ── Íconos (trazo propio, currentColor) ────────────────────── */
  function svg(d, extra) { return '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"' + (extra || "") + ">" + d + "</svg>"; }
  var S = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  var IC = {
    pause: svg('<path d="M8 5v14M16 5v14" ' + S + ' stroke-width="2.4"/>'),
    play: svg('<path d="M8 5.5v13a.7.7 0 0 0 1.07.6l10-6.5a.7.7 0 0 0 0-1.2l-10-6.5A.7.7 0 0 0 8 5.5z" fill="currentColor"/>'),
    replay: svg('<path d="M4.5 12a7.5 7.5 0 1 0 2.3-5.4M4.2 3.8v4h4" ' + S + ' stroke-width="2.2"/>'),
    back: svg('<path d="M15 5l-7 7 7 7" ' + S + ' stroke-width="2.2"/>'),
    verified: svg('<path d="M12 2.8l2.2 1.6 2.7-.1.9 2.6 2.2 1.6-.8 2.6.8 2.6-2.2 1.6-.9 2.6-2.7-.1L12 21.2l-2.2-1.6-2.7.1-.9-2.6L4 15.5l.8-2.6L4 10.3l2.2-1.6.9-2.6 2.7.1z" fill="currentColor"/><path d="M8.6 12.2l2.3 2.3 4.6-4.8" fill="none" stroke="var(--bot-header)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
    emoji: svg('<circle cx="12" cy="12" r="8.5" ' + S + '/><path d="M8.5 14.2a4.2 4.2 0 0 0 7 0" ' + S + '/><circle cx="9.2" cy="10" r="1" fill="currentColor"/><circle cx="14.8" cy="10" r="1" fill="currentColor"/>'),
    clip: svg('<path d="M15.5 7.5l-6.4 6.4a2 2 0 0 0 2.8 2.8l7-7a4 4 0 0 0-5.6-5.6l-7.2 7.2a6 6 0 0 0 8.5 8.5l5.4-5.4" ' + S + '/>'),
    camera: svg('<path d="M4 8.5h3l1.6-2.5h6.8L17 8.5h3v10H4z" ' + S + '/><circle cx="12" cy="13.3" r="3.3" ' + S + '/>'),
    mic: svg('<rect x="9" y="3.5" width="6" height="11" rx="3" ' + S + '/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5" ' + S + '/>'),
    send: svg('<path d="M4.5 12h12.5M12.5 6.5L18 12l-5.5 5.5" ' + S + ' stroke-width="2.2"/>'),
    voicePlay: svg('<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>'),
    pin: svg('<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" fill="currentColor"/><circle cx="12" cy="10" r="2.4" fill="var(--bot-screen)"/>'),
    wifi: svg('<path d="M3.5 9.5a12 12 0 0 1 17 0M6.5 12.6a7.6 7.6 0 0 1 11 0M9.5 15.6a3.4 3.4 0 0 1 5 0" ' + S + ' stroke-width="2.2"/><circle cx="12" cy="18.6" r="1.3" fill="currentColor"/>'),
    video: svg('<rect x="3.5" y="7" width="11.5" height="10" rx="2" ' + S + '/><path d="M15 10.5l5-3v9l-5-3" ' + S + '/>'),
    phone: svg('<path d="M6.6 4h2.6l1.4 3.8-1.9 1.3a10.5 10.5 0 0 0 6.2 6.2l1.3-1.9 3.8 1.4v2.6A1.7 1.7 0 0 1 18.3 19 14.3 14.3 0 0 1 5 5.7 1.7 1.7 0 0 1 6.6 4z" ' + S + '/>')
  };

  var KEY_ROWS = [
    "qwertyuiop".split(""),
    "asdfghjklñ".split(""),
    ["⇧"].concat("zxcvbnm".split("")).concat(["⌫"]),
    ["123", "☺", " ", ".", "↵"]
  ];

  /* ── Datos: LD_GUIONES o los hilos del HTML ─────────────────── */
  function fromGuiones() {
    var g = window.LD_GUIONES;
    var list = g && (Array.isArray(g) ? g : g.escenarios);
    if (!list || !list.length) return null;
    var out = [];
    list.forEach(function (sc) {
      if (!sc || !sc.id || !sc.mensajes || !sc.mensajes.length) return;
      out.push({
        id: sc.id,
        emoji: sc.emoji || "",
        nombre: tr(sc.nombre) || sc.id,
        negocio: tr(sc.negocio) || tr(sc.nombre),
        humano: sc.humano ? { nombre: tr(sc.humano.nombre) || "Caro", rol: tr(sc.humano.rol) } : { nombre: "Caro", rol: "" },
        mensajes: sc.mensajes.map(function (m) {
          var o = { de: m.de || "bot", tipo: m.tipo || "texto", hora: m.hora || "", texto: tr(m.texto), reaccion: m.reaccion || "", flujo: m.flujo || "" };
          if (o.de === "sistema") o.tipo = "handoff";
          if (m.opciones) o.opciones = tr(m.opciones) || [];
          if (m.elige != null) o.elige = +m.elige;
          if (m.tarjeta) o.tarjeta = { emoji: m.tarjeta.emoji || "", titulo: tr(m.tarjeta.titulo), lineas: tr(m.tarjeta.lineas) || [], precio: tr(m.tarjeta.precio) };
          if (m.voz) o.voz = { segundos: +m.voz.segundos || 6, transcripcion: tr(m.voz.transcripcion) };
          if (m.ubicacion) o.ubicacion = { nombre: tr(m.ubicacion.nombre), direccion: tr(m.ubicacion.direccion) };
          return o;
        })
      });
    });
    return out.length ? out : null;
  }
  function fromHTML(root) {
    var out = [];
    [].forEach.call(root.querySelectorAll("ol[data-bot-thread]"), function (ol) {
      var id = ol.getAttribute("data-bot-thread");
      var chip = root.querySelector('[data-bot-scenario="' + id + '"]');
      var title = ol.getAttribute("data-bot-title") || id;
      out.push({
        id: id, emoji: "", nombre: chip ? textOf(chip) : title, negocio: title.replace(/\s*·\s*demo\s*$/i, ""),
        ariaLabel: ol.getAttribute("aria-label") || "",
        humano: null,
        mensajes: [].slice.call(ol.children).filter(function (li) { return li.hasAttribute("data-msg"); }).map(function (li) {
          var k = li.getAttribute("data-msg");
          return { de: k === "in" ? "cliente" : k === "out" ? "bot" : "sistema", tipo: k === "system" ? "handoff" : "texto",
                   hora: li.getAttribute("data-time") || "", texto: k === "system" ? textOf(li) : textOf(li.querySelector("p")) };
        })
      });
    });
    return out;
  }

  /* ═══ La demo ═══════════════════════════════════════════════ */
  function BotDemo(root) {
    this.root = root;
    this.section = root.closest("section");
    this.pinned = !!root.closest('[data-anim~="pin"]');
    this.phone = root.querySelector("[data-bot-phone]");
    this.header = root.querySelector("[data-bot-header]");
    this.nameEl = root.querySelector("[data-bot-name]");
    this.statusEl = root.querySelector("[data-bot-status]");
    this.clockEl = root.querySelector("[data-bot-clock]");
    this.live = root.querySelector("[data-bot-live]");
    this.chipsWrap = root.querySelector("[data-bot-scenarios]");
    this.controls = root.querySelector("[data-bot-controls]");
    this.pauseBtn = root.querySelector('[data-bot-control="pause"]');
    this.replayBtn = root.querySelector('[data-bot-control="replay"]');
    this.flow = root.querySelector("[data-bot-flow]");
    if (!this.phone) return;

    // Etiquetas desde el HTML (sirven para /en/ sin tocar el JS)
    var firstIn = root.querySelector('li[data-msg="in"] .visually-hidden');
    var firstOut = root.querySelector('li[data-msg="out"] .visually-hidden');
    if (firstIn) L.customer = textOf(firstIn);
    if (firstOut) L.bot = textOf(firstOut);
    if (this.chipsWrap && this.chipsWrap.getAttribute("aria-label")) L.tablist = this.chipsWrap.getAttribute("aria-label");
    this.labelOnline = this.statusEl ? textOf(this.statusEl) : "";
    this.labelTyping = this.statusEl ? (this.statusEl.getAttribute("data-label-typing") || "") : "";
    this.labelPause = this.pauseBtn ? (this.pauseBtn.getAttribute("data-label-pause") || textOf(this.pauseBtn)) : "";
    this.labelPlay = this.pauseBtn ? (this.pauseBtn.getAttribute("data-label-play") || "") : "";
    this.labelReplay = this.replayBtn ? textOf(this.replayBtn) : "";

    var html = fromHTML(root);
    this.ariaById = {};
    html.forEach(function (s) { this.ariaById[s.id] = s.ariaLabel; }, this);
    this.scenarios = fromGuiones() || html;
    if (!this.scenarios.length) return;
    var pressed = root.querySelector('[data-bot-scenario][aria-pressed="true"]');
    this.current = pressed ? pressed.getAttribute("data-bot-scenario") : this.scenarios[0].id;
    if (!this.byId(this.current)) this.current = this.scenarios[0].id;

    this.clock = new Clock();
    this.gen = 0;
    this.started = false;
    this.finished = false;
    this.userPaused = false;
    this.focusPaused = false;   // foco de teclado adentro: el autoplay espera
    this.focusOverride = false; // la persona eligió reproducir con el foco adentro
    this.inView = false;
    this.userChose = false;
    this.autoAdvanced = 0;
    this.skipTo = -1;
    this.shown = -1;
    this.mode = "";

    this.build();
    this.bind();
    this.setMode(reduceMQ.matches ? "static" : "live");
  }

  BotDemo.prototype.byId = function (id) {
    for (var i = 0; i < this.scenarios.length; i++) if (this.scenarios[i].id === id) return this.scenarios[i];
    return null;
  };

  /* ── Construcción ─────────────────────────────────────────── */
  BotDemo.prototype.build = function () {
    var self = this, root = this.root;
    var uid = "bd" + Math.random().toString(36).slice(2, 7);
    this.uid = uid;

    // Marco del equipo: aluminio, botones laterales, sombra de contacto. La inclinación va acá.
    this.device = el("div", "bd-device");
    this.phone.parentNode.insertBefore(this.device, this.phone);
    this.device.appendChild(hide(el("span", "bd-btns")));
    this.device.appendChild(this.phone);
    this.device.appendChild(hide(el("span", "bd-floor")));
    this.phone.appendChild(hide(el("span", "bd-glass")));

    // Barra de estado
    this.statusbar = hide(el("div", "bd-statusbar"));
    this.statusbar.innerHTML = '<span class="bd-time"><span class="bd-hh">03</span><span class="bd-colon">:</span><span class="bd-mm">12</span></span>' +
      '<span class="bd-island"><i class="bd-cam"></i></span>' +
      '<span class="bd-sys"><span class="bd-bars"><i></i><i></i><i></i><i></i></span>' + IC.wifi + '<span class="bd-battery"></span></span>';
    this.phone.insertBefore(this.statusbar, this.phone.firstChild);

    // Header del chat: volver, avatar, nombre + verificado, estado, acciones, reloj 24/7
    if (this.header) {
      this.header.insertBefore(hide(el("span", "bd-back", IC.back)), this.header.firstChild);
      this.avatar = hide(el("span", "bd-avatar"));
      this.avatarBot = el("span", "bd-avatar-face bd-avatar-bot");
      this.avatarHuman = el("span", "bd-avatar-face bd-avatar-human");
      this.avatar.appendChild(this.avatarBot);
      this.avatar.appendChild(this.avatarHuman);
      this.header.insertBefore(this.avatar, this.header.children[1]);
      if (this.nameEl) {
        this.nameText = el("span", "bd-name-text");
        this.nameEl.textContent = "";
        this.nameEl.appendChild(this.nameText);
        var v = el("span", "bd-verified", IC.verified);
        v.appendChild(txt("span", "visually-hidden", L.verified));
        this.nameEl.appendChild(v);
      }
    }
    if (this.clockEl && !this.clockEl.querySelector(".bd-face")) this.clockEl.insertBefore(hide(el("span", "bd-face")), this.clockEl.firstChild);

    // Hilo único que se re-renderiza por escenario (los del HTML quedan para sin-JS)
    this.htmlThreads = [].slice.call(root.querySelectorAll("ol[data-bot-thread]"));
    this.htmlThreads.forEach(function (t) { t.hidden = true; t.setAttribute("data-bd-fallback", ""); });
    this.thread = el("ol", "thread bd-thread");
    var after = this.htmlThreads.length ? this.htmlThreads[this.htmlThreads.length - 1] : this.header;
    after.parentNode.insertBefore(this.thread, after.nextSibling);

    // Composer + teclado
    this.dock = hide(el("div", "bd-dock"));
    this.dock.innerHTML = '<div class="bd-composer">' +
      '<span class="bd-field"><span class="bd-ico">' + IC.emoji + '</span><span class="bd-typed"></span><span class="bd-caret"></span>' +
      '<span class="bd-rec"><i></i><span class="bd-rec-t">0:00</span></span>' +
      '<span class="bd-ico bd-ico--clip">' + IC.clip + '</span><span class="bd-ico bd-ico--cam">' + IC.camera + "</span></span>" +
      '<span class="bd-send"><span class="bd-send-mic">' + IC.mic + '</span><span class="bd-send-go">' + IC.send + "</span></span></div>";
    var kbd = el("div", "bd-kbd");
    this.keys = {};
    KEY_ROWS.forEach(function (row) {
      var r = el("div", "bd-row");
      row.forEach(function (k) {
        var cls = "bd-key";
        if (k === " ") cls += " bd-key--space";
        else if (k.length > 1 || "⇧⌫↵☺".indexOf(k) > -1) cls += " bd-key--wide";
        var key = el("span", cls);
        key.textContent = k === " " ? "" : k;
        if (/^[a-zñ.]$/.test(k)) key.setAttribute("data-k", k);
        self.keys[k] = key;
        r.appendChild(key);
      });
      kbd.appendChild(r);
    });
    this.dock.appendChild(kbd);
    this.phone.appendChild(this.dock);
    this.typed = this.dock.querySelector(".bd-typed");
    this.sendKey = this.dock.querySelector(".bd-send");
    this.recT = this.dock.querySelector(".bd-rec-t");

    // Flujo: anillos, log y paquete
    this.steps = {};
    if (this.flow) {
      [].forEach.call(this.flow.querySelectorAll("[data-flow-step]"), function (li) {
        self.steps[li.getAttribute("data-flow-step")] = li;
        li.insertBefore(hide(el("span", "bd-ring")), li.firstChild);
        li.insertBefore(hide(el("span", "bd-ring")), li.firstChild);
        li.appendChild(hide(el("span", "bd-log")));
      });
      this.packet = hide(el("span", "bd-packet"));
      this.flow.appendChild(this.packet);
    }

    // Tablist de nichos (los 3 botones del HTML se reemplazan por los N del guion)
    if (this.chipsWrap) {
      this.chipsWrap.setAttribute("role", "tablist");
      this.chipsWrap.setAttribute("aria-label", L.tablist);
      this.chipsWrap.innerHTML = "";
      this.phone.id = this.phone.id || uid + "-panel";
      this.phone.setAttribute("role", "tabpanel");
      this.chips = this.scenarios.map(function (sc) {
        var b = el("button", "bd-tab");
        b.type = "button";
        b.id = uid + "-tab-" + sc.id;
        b.setAttribute("role", "tab");
        b.setAttribute("data-bot-scenario", sc.id);
        b.setAttribute("aria-controls", self.phone.id);
        if (sc.emoji) b.appendChild(hide(txt("span", "bd-tab-emoji", sc.emoji)));
        b.appendChild(txt("span", "bd-tab-label", sc.nombre));
        self.chipsWrap.appendChild(b);
        return b;
      });
    } else this.chips = [];

    // Controles con ícono
    if (this.pauseBtn) {
      this.pauseBtn.innerHTML = '<span class="bd-btn-ico">' + IC.pause + '</span><span class="bd-btn-label"></span>';
      this.pauseIco = this.pauseBtn.querySelector(".bd-btn-ico");
      this.pauseLabel = this.pauseBtn.querySelector(".bd-btn-label");
      this.pauseLabel.textContent = this.labelPause;
    }
    if (this.replayBtn) {
      this.replayBtn.innerHTML = '<span class="bd-btn-ico">' + IC.replay + '</span><span class="bd-btn-label"></span>';
      this.replayBtn.querySelector(".bd-btn-label").textContent = this.labelReplay;
    }
  };

  BotDemo.prototype.bind = function () {
    var self = this;
    this.chips.forEach(function (chip, i) {
      chip.addEventListener("click", function () {
        self.userChose = true;
        self.focusOverride = true; self.focusPaused = false; self.userPaused = false;
        chip.classList.remove("is-picked");
        void chip.offsetWidth;
        chip.classList.add("is-picked");
        self.select(chip.getAttribute("data-bot-scenario"), true);
      });
      chip.addEventListener("keydown", function (e) {
        var k = e.key, n = self.chips.length, to = -1;
        if (k === "ArrowRight" || k === "ArrowDown") to = (i + 1) % n;
        else if (k === "ArrowLeft" || k === "ArrowUp") to = (i - 1 + n) % n;
        else if (k === "Home") to = 0;
        else if (k === "End") to = n - 1;
        if (to < 0) return;
        e.preventDefault();
        self.chips.forEach(function (c, j) { c.tabIndex = j === to ? 0 : -1; });
        self.chips[to].focus();
        self.scrollChip(self.chips[to]);
      });
      chip.addEventListener("animationend", function () { chip.classList.remove("is-picked"); });
    });
    // Si el foco sale del tablist, el tab activo vuelve a ser el que recibe Tab
    if (this.chipsWrap) this.chipsWrap.addEventListener("focusout", function (e) {
      if (e.relatedTarget && self.chipsWrap.contains(e.relatedTarget)) return;
      self.chips.forEach(function (c) { c.tabIndex = c.getAttribute("aria-selected") === "true" ? 0 : -1; });
    });

    if (this.pauseBtn) this.pauseBtn.addEventListener("click", function () {
      if (self.pauseBtn.getAttribute("aria-disabled") === "true") return;
      if (self.userPaused || self.focusPaused) { self.userPaused = false; self.focusPaused = false; self.focusOverride = true; }
      else self.userPaused = true;
      self.sync();
    });
    if (this.replayBtn) this.replayBtn.addEventListener("click", function () {
      self.userPaused = false; self.focusPaused = false; self.focusOverride = true;
      self.select(self.current, true);
    });

    // Foco de teclado adentro: pausa el autoplay (WCAG 2.2.2; no esconder lo que se está leyendo)
    this.root.addEventListener("focusin", function (e) {
      if (self.mode !== "live" || self.focusOverride) return;
      var kb = true;
      try { kb = e.target.matches(":focus-visible"); } catch (err) {}
      if (!kb) return;
      self.focusPaused = true;
      self.sync();
    });
    this.root.addEventListener("focusout", function (e) {
      if (e.relatedTarget && self.root.contains(e.relatedTarget)) return;
      self.focusPaused = false;
      self.focusOverride = false;
      self.sync();
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.intersectionRatio >= 0.35) self.inView = true;
          else if (en.intersectionRatio < 0.08) self.inView = false;
        });
        self.sync();
      }, { threshold: [0, 0.08, 0.35, 0.6] }).observe(this.phone);
    } else this.inView = true;
    document.addEventListener("visibilitychange", function () { self.sync(); });

    if (this.section) this.section.addEventListener("ld:scene-progress", function (e) {
      var d = e.detail || {};
      if (d.scene && d.scene !== "chatbots") return;
      self.onProgress(+d.progress || 0);
    });

    // Inclinación 3D que sigue al mouse (solo puntero fino, sin reduced-motion)
    var raf = 0, tx = 0, ty = 0;
    this.root.addEventListener("pointermove", function (e) {
      if (!fineMQ.matches || reduceMQ.matches || e.pointerType !== "mouse") return;
      var r = self.device.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * 1.2)));
      ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height * 1.2)));
      if (!raf) raf = requestAnimationFrame(function () {
        raf = 0;
        self.device.style.transform = "perspective(1400px) rotateY(" + (tx * 7).toFixed(2) + "deg) rotateX(" + (-ty * 5).toFixed(2) + "deg)";
        self.device.style.setProperty("--bd-sheen-x", (50 + tx * 30).toFixed(1) + "%");
      });
    });
    this.root.addEventListener("pointerleave", function () { self.device.style.transform = ""; self.device.style.removeProperty("--bd-sheen-x"); });

    var onReduce = function () { self.device.style.transform = ""; self.setMode(reduceMQ.matches ? "static" : "live"); };
    if (reduceMQ.addEventListener) reduceMQ.addEventListener("change", onReduce);
    else if (reduceMQ.addListener) reduceMQ.addListener(onReduce);
  };

  BotDemo.prototype.scrollChip = function (chip) {
    var w = this.chipsWrap;
    if (!w || w.scrollWidth <= w.clientWidth) return;
    var left = chip.offsetLeft - w.offsetLeft, right = left + chip.offsetWidth;
    var to = null;
    if (left < w.scrollLeft + 8) to = left - 16;
    else if (right > w.scrollLeft + w.clientWidth - 8) to = right - w.clientWidth + 16;
    if (to != null) w.scrollTo({ left: Math.max(0, to), behavior: reduceMQ.matches ? "auto" : "smooth" });
  };

  /* ── Render de mensajes ──────────────────────────────────── */
  var WHO = { cliente: "in", bot: "out", humano: "human", sistema: "system" };

  BotDemo.prototype.renderScenario = function (sc) {
    var self = this, t = this.thread;
    t.innerHTML = "";
    t.setAttribute("data-bot-thread", sc.id);
    t.setAttribute("aria-label", this.ariaById[sc.id] || (L.conv + " " + sc.nombre));
    t.appendChild(hide(txt("li", "bd-day", L.today)));
    var prev = null;
    this.items = sc.mensajes.map(function (m, i) {
      var li = self.renderMsg(m, sc, prev);
      li.setAttribute("data-i", String(i));
      t.appendChild(li);
      prev = m;
      return li;
    });
  };

  BotDemo.prototype.renderMsg = function (m, sc, prev) {
    var li = el("li");
    var kind = WHO[m.de] || "out";
    li.setAttribute("data-msg", kind);
    li.setAttribute("data-type", m.tipo);
    if (m.hora) li.setAttribute("data-time", m.hora);
    if (!prev || prev.de !== m.de) li.setAttribute("data-tail", "");

    if (kind === "system") {
      li.setAttribute("data-handoff", "");
      li.appendChild(hide(el("span", "bd-handoff-line")));
      li.appendChild(txt("span", "bd-handoff-text", m.texto));
      return li;
    }

    var who = kind === "in" ? L.customer : kind === "human" ? L.human : L.bot;
    li.appendChild(txt("span", "visually-hidden", who + " "));
    var bub = el("div", "bd-bubble");
    li.appendChild(bub);

    if (kind === "human") {
      var h = sc.humano || { nombre: "Caro", rol: "" };
      bub.appendChild(txt("span", "bd-author", h.nombre + (h.rol ? " · " + h.rol : "")));
      li.insertBefore(hide(txt("span", "bd-human-av", (h.nombre || "C").charAt(0).toUpperCase())), bub);
    }

    if (m.tipo === "tarjeta" && m.tarjeta) {
      var c = m.tarjeta, card = el("div", "bd-card");
      card.appendChild(hide(el("span", "bd-card-art", "<span>" + (c.emoji || "📅") + "</span>")));
      var body = el("div", "bd-card-body");
      body.appendChild(txt("strong", "bd-card-title", c.titulo));
      (c.lineas || []).forEach(function (ln) { body.appendChild(txt("span", "bd-card-line", ln)); });
      if (c.precio) body.appendChild(txt("span", "bd-card-price", c.precio));
      card.appendChild(body);
      bub.appendChild(card);
      if (m.texto) bub.appendChild(txt("p", "", m.texto));
    } else if (m.tipo === "voz" && m.voz) {
      var secs = m.voz.segundos || 6;
      var dur = Math.floor(secs / 60) + ":" + ("0" + (secs % 60)).slice(-2);
      var voice = el("div", "bd-voice");
      voice.appendChild(hide(el("span", "bd-voice-play", IC.voicePlay)));
      var wave = hide(el("span", "bd-wave"));
      var seed = (m.voz.transcripcion || "x").length;
      for (var i = 0; i < 26; i++) {
        var hgt = 22 + Math.round(70 * Math.abs(Math.sin(i * 1.7 + seed) * Math.cos(i * 0.6 + seed / 3)));
        var bar = el("i");
        bar.style.setProperty("--h", hgt + "%");
        bar.style.setProperty("--i", String(i));
        wave.appendChild(bar);
      }
      voice.appendChild(wave);
      voice.appendChild(hide(txt("span", "bd-voice-dur", dur)));
      bub.appendChild(voice);
      bub.appendChild(txt("span", "visually-hidden", L.voice + ", " + dur + ": "));
      if (m.voz.transcripcion) bub.appendChild(txt("p", "bd-voice-tr", "“" + m.voz.transcripcion + "”"));
    } else if (m.tipo === "ubicacion" && m.ubicacion) {
      var map = hide(el("span", "bd-map", '<span class="bd-map-pin">' + IC.pin + "</span>"));
      bub.appendChild(map);
      bub.appendChild(txt("span", "visually-hidden", L.location + ": "));
      bub.appendChild(txt("strong", "bd-place", m.ubicacion.nombre));
      bub.appendChild(txt("span", "bd-addr", m.ubicacion.direccion));
      if (m.texto) bub.appendChild(txt("p", "", m.texto));
    } else {
      bub.appendChild(txt("p", "", m.texto));
    }

    var meta = el("span", "bd-meta");
    if (m.hora) meta.appendChild(txt("time", "", m.hora));
    if (kind === "in") meta.appendChild(hide(el("span", "bd-ticks", '<i class="bd-t1"></i><i class="bd-t2"></i>')));
    bub.appendChild(meta);

    if (m.tipo === "rapidas" && m.opciones && m.opciones.length) {
      var qr = el("div", "bd-quick");
      qr.appendChild(txt("span", "visually-hidden", L.quick + " " + m.opciones.join(", ") + "."));
      var row = hide(el("span", "bd-quick-row"));
      m.opciones.forEach(function (o, j) {
        var b = txt("span", "bd-qr", o);
        b.style.setProperty("--j", String(j));
        row.appendChild(b);
      });
      qr.appendChild(row);
      li.appendChild(qr);
    }
    if (m.reaccion) {
      var r = hide(txt("span", "bd-react", m.reaccion));
      li.appendChild(r);
      li.appendChild(txt("span", "visually-hidden bd-react-sr", ""));
    }
    return li;
  };

  /* ── Modos y escenarios ──────────────────────────────────── */
  BotDemo.prototype.setMode = function (mode) {
    this.mode = mode;
    this.root.setAttribute("data-mode", mode);
    if (this.chipsWrap) this.chipsWrap.hidden = false;
    if (this.controls) this.controls.hidden = mode === "static";
    this.gen++;
    this.clock.clear();
    this.showScenario(this.current);
    if (mode === "static") {
      this.clock.pause();
      this.thread.removeAttribute("tabindex");
      this.renderAllStatic();
    } else {
      this.thread.setAttribute("tabindex", "0");
      this.started = false;
      this.resetThread();
      this.sync();
    }
  };

  BotDemo.prototype.showScenario = function (id) {
    var self = this;
    var sc = this.byId(id) || this.scenarios[0];
    this.current = sc.id;
    this.sc = sc;
    this.chips.forEach(function (c) {
      var on = c.getAttribute("data-bot-scenario") === sc.id;
      c.setAttribute("aria-selected", String(on));
      c.tabIndex = on ? 0 : -1;
      if (on) self.phone.setAttribute("aria-labelledby", c.id);
    });
    var active = this.chips.filter(function (c) { return c.getAttribute("aria-selected") === "true"; })[0];
    if (active) this.scrollChip(active);
    if (this.nameText) this.nameText.textContent = sc.negocio;
    else if (this.nameEl) this.nameEl.textContent = sc.negocio;
    if (this.avatarBot) this.avatarBot.textContent = sc.emoji || (sc.negocio || "?").trim().charAt(0).toUpperCase();
    if (this.avatarHuman) this.avatarHuman.textContent = ((sc.humano && sc.humano.nombre) || "C").charAt(0).toUpperCase();
    this.root.removeAttribute("data-human");
    this.renderScenario(sc);
    this.setStatus(false);
  };

  BotDemo.prototype.renderAllStatic = function () {
    var self = this;
    this.items.forEach(function (li) {
      li.removeAttribute("data-state");
      if (li.getAttribute("data-msg") === "in") li.setAttribute("data-tick", "read");
      self.fillReaction(li);
      if (li.getAttribute("data-msg") === "human") self.root.setAttribute("data-human", "");
    });
    this.root.removeAttribute("data-kbd");
    this.root.removeAttribute("data-paused");
    ["mensaje", "ia", "accion", "panel"].forEach(function (s) {
      var st = self.steps[s];
      if (st) { st.setAttribute("data-done", ""); st.removeAttribute("data-active"); }
    });
    if (this.steps.accion) this.steps.accion.setAttribute("data-handoff", "");
    if (this.flow) { this.flow.style.setProperty("--bd-flow-p", "1"); this.flow.removeAttribute("data-running"); }
    var last = this.sc.mensajes.filter(function (m) { return m.hora; }).pop();
    if (last) this.setTime(last.hora);
  };

  BotDemo.prototype.resetThread = function () {
    var self = this;
    this.removeTyping();
    this.shown = -1;
    this.skipTo = -1;
    this.finished = false;
    this.items.forEach(function (li) { li.setAttribute("data-state", "pending"); });
    this.thread.scrollTop = 0;
    if (this.typed) this.typed.textContent = "";
    this.root.removeAttribute("data-kbd");
    this.root.removeAttribute("data-typing");
    this.root.removeAttribute("data-rec");
    this.root.removeAttribute("data-human");
    Object.keys(this.steps).forEach(function (k) {
      var s = self.steps[k];
      s.removeAttribute("data-active"); s.removeAttribute("data-done"); s.removeAttribute("data-handoff");
      var log = s.querySelector(".bd-log"); if (log) log.textContent = "";
    });
    if (this.flow) { this.flow.style.setProperty("--bd-flow-p", "0"); this.flow.removeAttribute("data-running"); this.flow.removeAttribute("data-reached"); }
    var first = this.sc.mensajes[0];
    this.setTime(first && first.hora ? first.hora : "03:12");
    this.setStatus(false);
    if (this.pauseBtn) this.pauseBtn.removeAttribute("aria-disabled");
    if (this.replayBtn) this.replayBtn.removeAttribute("data-attention");
  };

  BotDemo.prototype.select = function (id, fromUser) {
    if (!this.byId(id)) return;
    this.gen++;
    this.clock.clear();
    this.showScenario(id);
    if (this.mode === "static") { this.renderAllStatic(); return; }
    this.resetThread();
    this.started = false;
    if (fromUser) this.inView = true;
    this.sync();
  };

  BotDemo.prototype.sync = function () {
    if (this.mode !== "live") return;
    var shouldPlay = this.inView && !document.hidden && !this.userPaused && !this.focusPaused;
    if (shouldPlay) {
      this.clock.play();
      this.root.removeAttribute("data-paused");
      if (!this.started) { this.started = true; this.run(this.gen); }
    } else {
      this.clock.pause();
      if (this.started) this.root.setAttribute("data-paused", "");
    }
    if (this.pauseLabel) {
      var paused = this.userPaused || this.focusPaused;
      this.pauseLabel.textContent = paused ? this.labelPlay : this.labelPause;
      this.pauseIco.innerHTML = paused ? IC.play : IC.pause;
    }
  };

  BotDemo.prototype.onProgress = function (p) {
    if (this.mode !== "live" || this.userChose || this.finished) return;
    if (p > 0.02 && !this.started) { this.inView = true; this.sync(); }
    // Solo con pin y en la segunda mitad: el arranque "03:12" siempre se ve completo.
    if (!this.pinned || p < 0.5) return;
    var n = this.items.length;
    var target = Math.floor((p - 0.5) / 0.5 * n * 1.1) - 1;
    if (target > this.shown + 1) this.skipTo = Math.min(n - 1, target);
  };

  /* ── Piezas de la coreografía ────────────────────────────── */
  BotDemo.prototype.setStatus = function (typing) {
    if (!this.statusEl) return;
    this.statusEl.textContent = typing ? this.labelTyping : this.labelOnline;
    if (typing) this.statusEl.setAttribute("data-typing", ""); else this.statusEl.removeAttribute("data-typing");
  };
  BotDemo.prototype.setTime = function (hhmm) {
    if (!hhmm || !this.statusbar) return;
    var p = hhmm.split(":");
    this.statusbar.querySelector(".bd-hh").textContent = p[0];
    this.statusbar.querySelector(".bd-mm").textContent = p[1] || "00";
  };
  BotDemo.prototype.announce = function (msg) {
    if (!this.live || !msg) return;
    var live = this.live;
    live.textContent = "";
    setTimeout(function () { live.textContent = msg; }, 60);
  };
  BotDemo.prototype.announceItem = function (li) {
    var parts = [];
    [].forEach.call(li.querySelectorAll(".visually-hidden:not(.bd-react-sr), p, .bd-card-title, .bd-card-line, .bd-card-price, .bd-place, .bd-addr, .bd-author, .bd-handoff-text"), function (n) { parts.push(textOf(n)); });
    this.announce(parts.join(" ").replace(/\s+/g, " ").trim());
  };
  BotDemo.prototype.fillReaction = function (li) {
    var sr = li.querySelector(".bd-react-sr"), r = li.querySelector(".bd-react");
    if (!sr || !r) return;
    li.setAttribute("data-reacted", "");
    sr.textContent = " (" + L.reacted + " " + r.textContent + ")";
  };

  BotDemo.prototype.flowTo = function (step, logText, handoff) {
    var order = ["mensaje", "ia", "accion", "panel"];
    var idx = order.indexOf(step), self = this;
    if (!this.flow || idx < 0) return;
    order.forEach(function (k, i) {
      var s = self.steps[k];
      if (!s) return;
      if (i === idx) s.setAttribute("data-active", ""); else s.removeAttribute("data-active");
      if (i < idx || (i === idx && step === "panel")) s.setAttribute("data-done", "");
    });
    var target = this.steps[step];
    if (!target) return;
    if (handoff) target.setAttribute("data-handoff", "");
    var reached = Math.max(idx, parseInt(this.flow.getAttribute("data-reached") || "-1", 10));
    this.flow.setAttribute("data-reached", String(reached));
    this.flow.style.setProperty("--bd-flow-p", String(reached / (order.length - 1)));
    this.flow.setAttribute("data-running", "");
    var first = this.steps[order[0]];
    if (this.packet && first) this.packet.style.setProperty("--bd-packet-y", (target.offsetTop - first.offsetTop) + "px");
    if (logText) {
      var log = target.querySelector(".bd-log");
      if (log) { log.textContent = logText; log.classList.remove("is-new"); void log.offsetWidth; log.classList.add("is-new"); }
    }
  };

  BotDemo.prototype.removeTyping = function () {
    if (this.typingLi && this.typingLi.parentNode) this.typingLi.parentNode.removeChild(this.typingLi);
    this.typingLi = null;
  };

  /* Muestra un li: spring desde su lado; los anteriores suben (FLIP) o el hilo scrollea suave. */
  BotDemo.prototype.reveal = function (li, animate) {
    var t = this.thread;
    var prev = [].slice.call(t.children).filter(function (n) { return n !== li && n.getAttribute("data-state") !== "pending"; });
    var overflowBefore = t.scrollHeight > t.clientHeight + 2;
    var before = !overflowBefore && animate ? prev.map(function (n) { return n.getBoundingClientRect().top; }) : null;
    li.removeAttribute("data-state");
    var overflowAfter = t.scrollHeight > t.clientHeight + 2;
    if (!animate) { t.scrollTop = t.scrollHeight; return; }
    li.classList.remove("is-arriving");
    void li.offsetWidth;
    li.classList.add("is-arriving");
    if (overflowAfter) {
      t.scrollTo({ top: t.scrollHeight, behavior: "smooth" });
    } else if (before) {
      var dur = cssTime("--dur-slow", 520);
      prev.forEach(function (n, i) {
        var d = before[i] - n.getBoundingClientRect().top;
        if (Math.abs(d) < 1 || !n.animate) return;
        n.animate([{ transform: "translate3d(0," + d + "px,0)" }, { transform: "none" }], { duration: dur, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
      });
    }
  };

  BotDemo.prototype.press = function (key, ms) {
    var k = this.keys[key];
    if (!k) return;
    k.classList.add("is-down");
    setTimeout(function () { k.classList.remove("is-down"); }, ms || 110);
  };
  BotDemo.prototype.keyFor = function (ch) {
    var c = ch.toLowerCase();
    if (c === "ñ") return "ñ";
    if (c.normalize) c = c.normalize("NFD").replace(/[̀-ͯ]/g, "");
    if (/[a-z]/.test(c)) return c;
    if (c === " " || c === ".") return c;
    if (/[☀-➿]|[\ud800-\udbff]/.test(ch)) return "☺";
    return "123";
  };

  BotDemo.prototype.typeOut = function (text, gen) {
    var self = this;
    var chars = Array.from ? Array.from(text) : text.split("");
    var per = Math.min(62, 2300 / Math.max(1, chars.length));
    var i = 0;
    this.root.setAttribute("data-typing", "");
    return new Promise(function (resolve) {
      function step() {
        if (gen !== self.gen) return;
        if (i >= chars.length) { resolve(); return; }
        var ch = chars[i++];
        if (ch !== ch.toLowerCase()) self.press("⇧", 90);
        self.press(self.keyFor(ch));
        self.typed.textContent += ch;
        var d = per * rand(0.55, 1.45);
        if (ch === " ") d += per * 0.4;
        if (/[,.?!:]/.test(ch)) d += 150;
        if (Math.random() < 0.04) d += 260;   // la pausa de pensar qué escribir
        self.clock.wait(d).then(step);
      }
      step();
    });
  };

  /* ── El guion ────────────────────────────────────────────── */
  BotDemo.prototype.run = function (gen) {
    var self = this;
    var msgs = this.sc.mensajes, items = this.items;
    var beat = cssTime("--beat", 2800);
    var idx = 0, lastIns = [], handoffIdx = -1;
    msgs.forEach(function (m, i) { if (m.tipo === "handoff") handoffIdx = i; });

    function alive() { return gen === self.gen; }
    function wait(ms) { return self.clock.wait(ms).then(function () { if (!alive()) throw "stale"; }); }

    function readAll() { lastIns.forEach(function (li) { li.setAttribute("data-tick", "read"); }); lastIns = []; }

    function flowFor(m, i) {
      var body = m.texto || (m.tarjeta && m.tarjeta.titulo) || (m.voz && m.voz.transcripcion) || (m.ubicacion && m.ubicacion.nombre) || "";
      if (m.de === "cliente") self.flowTo("mensaje", (m.hora || "") + "  “" + snippet(body, 34) + "”");
      else if (m.de === "sistema") self.flowTo("panel", "▣ " + snippet(body, 42), true);
      else if (m.de === "humano") self.flowTo("panel", "◉ " + snippet(body, 40));
      else if (handoffIdx > -1 && i === handoffIdx - 1) self.flowTo("accion", "→ " + snippet(body, 38), true);
      else if (m.flujo === "accion" || m.tipo === "tarjeta") self.flowTo("accion", "✓ " + snippet(body, 38));
      else self.flowTo("ia", "↳ " + snippet(body, 38));
    }

    function after(li, m) {
      if (m.hora) self.setTime(m.hora);
      if (m.de === "humano") self.root.setAttribute("data-human", "");
    }

    function react(li) {
      if (!li.querySelector(".bd-react")) return Promise.resolve();
      return wait(rand(520, 760)).then(function () { self.fillReaction(li); });
    }

    function instant(li, m, i) {
      self.removeTyping();
      self.reveal(li, false);
      if (m.de === "cliente") li.setAttribute("data-tick", "read");
      self.fillReaction(li);
      if (m.tipo === "handoff") self.root.setAttribute("data-human", "");
      after(li, m);
      flowFor(m, i);
      self.shown = i;
    }

    function clientTurn(li, m, i) {
      var prevM = msgs[i - 1];
      var picked = prevM && prevM.tipo === "rapidas" && m.elige != null ? items[i - 1].querySelectorAll(".bd-qr")[m.elige] : null;
      var p;
      if (picked) {
        p = wait(rand(700, 950)).then(function () {
          picked.classList.add("is-chosen");
          return wait(320);
        });
      } else if (m.tipo === "voz") {
        self.root.setAttribute("data-kbd", "closed");
        p = wait(420).then(function () {
          self.root.setAttribute("data-rec", "");
          var secs = (m.voz && m.voz.segundos) || 5, shown = Math.min(secs, 3), k = 0;
          function tick() {
            self.recT.textContent = "0:0" + Math.min(9, Math.round(k / shown * secs));
            if (k++ >= shown) return Promise.resolve();
            return wait(380).then(tick);
          }
          return tick();
        }).then(function () { self.root.removeAttribute("data-rec"); self.recT.textContent = "0:00"; });
      } else {
        var opened = self.root.getAttribute("data-kbd") === "open";
        self.root.setAttribute("data-kbd", "open");
        p = wait(opened ? rand(260, 520) : cssTime("--dur-slow", 520) + 140)
          .then(function () { return self.typeOut(m.texto || "", gen); })
          .then(function () { if (!alive()) throw "stale"; return wait(rand(160, 280)); });
      }
      return p.then(function () {
        self.root.removeAttribute("data-typing");
        self.sendKey.classList.add("is-down");
        setTimeout(function () { self.sendKey.classList.remove("is-down"); }, 140);
        self.press("↵", 120);
        self.typed.textContent = "";
        li.setAttribute("data-tick", "sent");
        self.reveal(li, true);
        after(li, m);
        self.announceItem(li);
        flowFor(m, i);
        self.shown = i;
        lastIns.push(li);
        return wait(440);
      }).then(function () { li.setAttribute("data-tick", "delivered"); return wait(240); })
        .then(function () { return react(li); });
    }

    function botTurn(li, m, i) {
      var len = (m.texto || "").length + (m.tarjeta ? 60 : 0) + (m.voz ? 40 : 0) + (m.ubicacion ? 30 : 0);
      var typingMs = Math.max(beat / 2 * 0.7, Math.min(beat * 1.15, 650 + len * 24));
      return wait(rand(240, 420))
        .then(function () { readAll(); self.flowTo("ia", null); return wait(300); })
        .then(function () {
          if (m.tipo === "voz") self.statusEl && (self.statusEl.textContent = L.recording + "…");
          else self.setStatus(true);
          self.typingLi = hide(el("li", "bd-typing" + (m.de === "humano" ? " bd-typing--human" : ""), "<i></i><i></i><i></i>"));
          self.thread.appendChild(self.typingLi);
          self.reveal(self.typingLi, true);
          return wait(typingMs);
        })
        .then(function () {
          self.removeTyping();
          self.setStatus(false);
          self.reveal(li, true);
          after(li, m);
          self.announceItem(li);
          flowFor(m, i);
          self.shown = i;
          return wait(m.tipo === "rapidas" ? 900 : m.tipo === "tarjeta" ? 1300 : m.tipo === "voz" ? 1500 : rand(760, 980));
        })
        .then(function () { return react(li); });
    }

    function handoffTurn(li, m, i) {
      return wait(380).then(function () {
        self.root.setAttribute("data-kbd", "closed");
        var line = li.querySelector(".bd-handoff-line");
        if (line) line.classList.add("lt-wipe");
        self.reveal(li, true);
        self.announceItem(li);
        flowFor(m, i);
        self.shown = i;
        return wait(700);
      }).then(function () {
        self.root.setAttribute("data-human", "");   // la persona entra: el avatar del header cambia
        return wait(700);
      });
    }

    function next() {
      if (!alive()) return Promise.reject("stale");
      if (idx >= items.length) return finish();
      var i = idx++, li = items[i], m = msgs[i];
      if (i <= self.skipTo) {
        instant(li, m, i);
        if (i === self.skipTo || i === items.length - 1) self.announceItem(li);
        return Promise.resolve().then(next);
      }
      var turn = m.de === "cliente" ? clientTurn : m.tipo === "handoff" ? handoffTurn : botTurn;
      return turn(li, m, i).then(next);
    }

    function finish() {
      self.finished = true;
      self.removeTyping();
      readAll();
      self.root.removeAttribute("data-kbd");
      self.flowTo("panel", null);
      if (self.flow) self.flow.removeAttribute("data-running");
      if (self.pauseBtn) self.pauseBtn.setAttribute("aria-disabled", "true");
      if (self.replayBtn) self.replayBtn.setAttribute("data-attention", "");
      // Sin elección de la persona: pasa solo al siguiente nicho, una vuelta completa, y después se queda quieto.
      if (!self.userChose && self.autoAdvanced < self.scenarios.length - 1) {
        return wait(beat * 1.5).then(function () {
          if (self.userChose) return;
          var ids = self.scenarios.map(function (s) { return s.id; });
          self.autoAdvanced++;
          self.select(ids[(ids.indexOf(self.current) + 1) % ids.length], false);
        });
      }
      return Promise.resolve();
    }

    wait(beat / 4).then(next).catch(function (e) { if (e !== "stale" && window.console) console.warn("chatbot-demo:", e); });
  };

  [].forEach.call(roots, function (r) {
    if (r.__botDemo) return;
    try { r.__botDemo = new BotDemo(r); }
    catch (e) {
      r.removeAttribute("data-mode");
      if (window.console) console.warn("chatbot-demo: sin animación", e);
    }
  });
})();
