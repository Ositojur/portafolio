/* LautaroDev · configuración única del sitio (dueño: agente 02).
   Para cambiar el contacto, editá SOLO las dos constantes de abajo.
   Se carga con defer antes que el resto de los scripts y expone window.LD_CONFIG. */
(() => {
  "use strict";

  /* TODO Lautaro: cargá tu número con código de país y sin espacios ni "+", ej. "5493510000000".
     Mientras esté vacío, todos los botones de WhatsApp caen al mail. No inventes uno. */
  const WHATSAPP_NUMERO = "";
  const MAIL = "lautarodemiannunez32@gmail.com";

  const GITHUB = "https://github.com/Ositojur";
  const SITIO = "https://ositojur.github.io/portafolio/";

  const lang = () => ((document.documentElement.lang || "es").toLowerCase().startsWith("en") ? "en" : "es");

  /* Mensajes prellenados por tema. data-contact="<tema>" en el HTML elige uno. */
  const TEMAS = {
    es: {
      general:   { asunto: "Consulta desde el portafolio", cuerpo: "Hola Lautaro, te escribo desde tu portafolio. Quiero contarte lo que necesito:" },
      chatbot:   { asunto: "Quiero un chatbot de WhatsApp 24/7", cuerpo: "Hola Lautaro, quiero un chatbot de WhatsApp para mi negocio. Mi rubro es:" },
      web:       { asunto: "Quiero un sitio o una tienda", cuerpo: "Hola Lautaro, necesito un sitio web o una tienda. Te cuento:" },
      sistemas:  { asunto: "Quiero un sistema a medida", cuerpo: "Hola Lautaro, necesito un sistema (panel, stock, API o base de datos). Te cuento:" },
      seguridad: { asunto: "Quiero revisar la seguridad de mi sitio", cuerpo: "Hola Lautaro, quiero que revises la seguridad de mi sitio o sistema. La dirección es:" },
      servicio:  { asunto: "Reunión: chatbots, sitios y sistemas", cuerpo: "Hola Lautaro, me gustaría coordinar una reunión. Te cuento qué necesito:" },
      producto:  { asunto: "Consulta por {producto}", cuerpo: "Hola Lautaro, me interesa \"{producto}\". ¿Me contás cómo seguimos?" }
    },
    en: {
      general:   { asunto: "Inquiry from your portfolio", cuerpo: "Hi Lautaro, I'm writing from your portfolio. Here's what I need:" },
      chatbot:   { asunto: "I want a 24/7 WhatsApp chatbot", cuerpo: "Hi Lautaro, I want a WhatsApp chatbot for my business. My industry is:" },
      web:       { asunto: "I need a website or an online store", cuerpo: "Hi Lautaro, I need a website or an online store. Here's the idea:" },
      sistemas:  { asunto: "I need a custom system", cuerpo: "Hi Lautaro, I need a system (dashboard, inventory, API or database). Here's the idea:" },
      seguridad: { asunto: "Security review for my site", cuerpo: "Hi Lautaro, I'd like you to review the security of my site or system. The address is:" },
      servicio:  { asunto: "Meeting: chatbots, websites and systems", cuerpo: "Hi Lautaro, I'd like to set up a meeting. Here's what I need:" },
      producto:  { asunto: "Question about {producto}", cuerpo: "Hi Lautaro, I'm interested in \"{producto}\". How do we get started?" }
    }
  };

  const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => (vars && vars[k] != null ? vars[k] : ""));
  const clean = (n) => String(n || "").replace(/\D/g, "");

  const hasWhatsApp = () => clean(WHATSAPP_NUMERO).length >= 8;

  const mailtoLink = (asunto, cuerpo) =>
    "mailto:" + MAIL + "?subject=" + encodeURIComponent(asunto || "") + "&body=" + encodeURIComponent(cuerpo || "");

  const whatsappLink = (mensaje) =>
    hasWhatsApp() ? "https://wa.me/" + clean(WHATSAPP_NUMERO) + "?text=" + encodeURIComponent(mensaje || "") : null;

  /* contactLink({ tema, producto, mensaje, asunto, lang })
     → { href, canal: "whatsapp" | "mail", label }
     Si WHATSAPP_NUMERO está vacío devuelve un mailto con asunto y cuerpo prellenados. */
  const contactLink = (opts = {}) => {
    const l = opts.lang || lang();
    const base = (TEMAS[l] && TEMAS[l][opts.tema]) || TEMAS[l].general;
    const vars = { producto: opts.producto || "" };
    const asunto = opts.asunto || fill(base.asunto, vars);
    const cuerpo = opts.mensaje || fill(base.cuerpo, vars);
    const wa = whatsappLink(cuerpo);
    if (wa) return { href: wa, canal: "whatsapp", label: l === "en" ? "Message on WhatsApp" : "Escribir por WhatsApp" };
    return { href: mailtoLink(asunto, cuerpo), canal: "mail", label: l === "en" ? "Send an email" : "Escribir por mail" };
  };

  /* Reescribe los <a data-contact="tema"> del documento.
     - data-contact-product="Nombre" usa el tema "producto".
     - data-contact-msg="..." pisa el cuerpo.
     - Marca data-contact-channel="whatsapp|mail" para que CSS/JS ajusten íconos o textos.
     - Si el link tiene un hijo [data-contact-label], su texto cambia según el canal
       (atributos data-label-whatsapp / data-label-mail del mismo hijo). */
  const applyContactLinks = (root = document) => {
    root.querySelectorAll("a[data-contact]").forEach((a) => {
      const tema = a.dataset.contactProduct ? "producto" : (a.dataset.contact || "general");
      const r = contactLink({ tema, producto: a.dataset.contactProduct, mensaje: a.dataset.contactMsg });
      a.href = r.href;
      a.dataset.contactChannel = r.canal;
      if (r.canal === "whatsapp") { a.target = "_blank"; a.rel = "noopener"; }
      const lbl = a.querySelector("[data-contact-label]");
      if (lbl) {
        const t = r.canal === "whatsapp" ? lbl.dataset.labelWhatsapp : lbl.dataset.labelMail;
        if (t) lbl.textContent = t;
      }
    });
  };

  window.LD_CONFIG = Object.freeze({
    WHATSAPP_NUMERO,
    MAIL,
    GITHUB,
    SITIO,
    STORAGE_THEME_KEY: "ld-theme",
    lang,
    hasWhatsApp,
    mailtoLink,
    whatsappLink,
    contactLink,
    applyContactLinks
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => applyContactLinks());
  else applyContactLinks();
})();
