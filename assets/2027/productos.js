/* LautaroDev · TIENDA · archivo de datos ÚNICO (dueño: agente 02; los stripeLink los completa el agente 08).
   Precios en USD: propuesta inicial que Lautaro confirma. Para cambiar un precio, editá este archivo
   Y creá un Price + Payment Link nuevo en Stripe (ver LEEME.txt). Nunca pongas claves acá.

   Campos:
     id            "01".."09"
     nivel         1 accesibles · 2 intermedios · 3 premium
     nombre, bajada, incluye[]   texto ES (en: {...} borrador EN, lo refina el agente 11)
     precio        número en USD (setup o pago único; en los "desde", el piso del rango)
     moneda        "USD"
     modalidad     "pago único" | "+ mensual" | "anticipo"
     mensual       número USD por mes, o null
     desde         true si el precio es "desde" (se cotiza el total; online se paga el anticipo)
     anticipoPct   porcentaje que se cobra online para arrancar (50 en 01–06, 30 en los "desde").
                   El saldo se abona al terminar. La mensualidad, si hay, empieza recién con la entrega:
                   el Payment Link cobra SOLO el anticipo (decisión de Lautaro, 29/10/2026).
     stripeLink    URL pública https://buy.stripe.com/... o "" (vacío = "Pago online próximamente")
     plazoEstimado "a coordinar" hasta que Lautaro confirme plazos
     destacado     true solo en el 04
     etiqueta      texto del badge del destacado ("Recomendado"). No usar "Más elegido": sería un dato
                   de ventas que no tenemos. Solo existe en el 04.
   En el HTML cada fila renderizada lleva id="producto-<id>" (los links #producto-03 apuntan ahí).
   Expone también window.LD_PRODUCTO(id) → producto, y window.LD_PRECIO(p, lang) → texto de precio. */
(() => {
  "use strict";

  window.PRODUCTOS_NIVELES = [
    { nivel: 1, nombre: "Accesibles", bajada: "Para entrar rápido.", en: { nombre: "Starter", bajada: "Get started fast." } },
    { nivel: 2, nombre: "Intermedios", bajada: "El negocio funcionando.", en: { nombre: "Growth", bajada: "Your business, up and running." } },
    { nivel: 3, nombre: "Premium", bajada: "Sistemas a medida.", en: { nombre: "Premium", bajada: "Custom-built systems." } }
  ];

  window.PRODUCTOS = [
    {
      id: "01",
      nivel: 1,
      nombre: "Landing Express",
      bajada: "Una página a medida para que te encuentren y te escriban.",
      incluye: [
        "Landing de 1 página a medida",
        "Responsive",
        "Botón de WhatsApp",
        "Formulario",
        "SSL y publicación"
      ],
      precio: 290,
      moneda: "USD",
      modalidad: "pago único",
      mensual: null,
      desde: false,
      anticipoPct: 50,
      stripeLink: "https://buy.stripe.com/00w14pfy99GZguTeTFfAc04",
      plazoEstimado: "a coordinar",
      destacado: false,
      en: {
        nombre: "Express Landing Page",
        bajada: "A custom one-page site so people find you and get in touch.",
        incluye: [
          "Custom one-page landing",
          "Responsive",
          "WhatsApp button",
          "Contact form",
          "SSL and launch"
        ]
      }
    },
    {
      id: "02",
      nivel: 1,
      nombre: "Bot WhatsApp Starter",
      bajada: "Respuestas automáticas las 24 horas a lo que más te preguntan.",
      incluye: [
        "Respuestas automáticas 24/7",
        "Horarios, precios, catálogo y preguntas frecuentes",
        "1 número"
      ],
      precio: 350,
      moneda: "USD",
      modalidad: "+ mensual",
      mensual: 39,
      desde: false,
      anticipoPct: 50,
      stripeLink: "https://buy.stripe.com/8x2aEZdq13iB1zZeTFfAc05",
      plazoEstimado: "a coordinar",
      destacado: false,
      en: {
        nombre: "WhatsApp Bot Starter",
        bajada: "Automatic 24/7 replies to the questions you get asked most.",
        incluye: [
          "24/7 automatic replies",
          "Hours, prices, catalog and FAQs",
          "1 phone number"
        ]
      }
    },
    {
      id: "03",
      nivel: 1,
      nombre: "Chequeo de Seguridad Web",
      bajada: "Sabé qué fallas tiene tu sitio y en qué orden arreglarlas.",
      incluye: [
        "Revisión externa de tu sitio: HTTPS, cabeceras, plugins, accesos por defecto y backups expuestos",
        "Informe con fallas priorizadas y cómo arreglarlas",
        "Sin ataques invasivos",
        "Alcance por escrito"
      ],
      precio: 190,
      moneda: "USD",
      modalidad: "pago único",
      mensual: null,
      desde: false,
      anticipoPct: 50,
      stripeLink: "https://buy.stripe.com/fZudRbfy9dXf3I78vhfAc06",
      plazoEstimado: "a coordinar",
      destacado: false,
      en: {
        nombre: "Website Security Check",
        bajada: "Find out what's wrong with your site and what to fix first.",
        incluye: [
          "External review of your site: HTTPS, headers, plugins, default logins and exposed backups",
          "Report with prioritized issues and how to fix them",
          "No invasive attacks",
          "Scope agreed in writing"
        ]
      }
    },
    {
      id: "04",
      nivel: 2,
      nombre: "Chatbot WhatsApp IA Pro 24/7",
      bajada: "Un asistente con IA que conoce tu negocio, vende y agenda solo.",
      incluye: [
        "IA entrenada con la info del negocio",
        "Toma pedidos y reservas",
        "Deriva a una persona",
        "Panel de conversaciones",
        "Reporte mensual"
      ],
      precio: 890,
      moneda: "USD",
      modalidad: "+ mensual",
      mensual: 79,
      desde: false,
      anticipoPct: 50,
      stripeLink: "https://buy.stripe.com/7sY7sNeu51at1zZ5j5fAc07",
      plazoEstimado: "a coordinar",
      destacado: true,
      etiqueta: "Recomendado",
      en: {
        etiqueta: "Recommended",
        nombre: "AI WhatsApp Chatbot Pro 24/7",
        bajada: "An AI assistant that knows your business and sells and books on its own.",
        incluye: [
          "AI trained on your business information",
          "Takes orders and bookings",
          "Hands off to a human when needed",
          "Conversation dashboard",
          "Monthly report"
        ]
      }
    },
    {
      id: "05",
      nivel: 2,
      nombre: "Sitio Profesional + Reservas",
      bajada: "Tu sitio completo, en dos idiomas, recibiendo solicitudes con código.",
      incluye: [
        "Hasta 6 secciones",
        "Bilingüe",
        "Sistema de solicitudes con código",
        "Panel (estilo Happy Ride)"
      ],
      precio: 1200,
      moneda: "USD",
      modalidad: "pago único",
      mensual: null,
      desde: false,
      anticipoPct: 50,
      stripeLink: "https://buy.stripe.com/aFa5kFdq1dXf5QfeTFfAc08",
      plazoEstimado: "a coordinar",
      destacado: false,
      en: {
        nombre: "Professional Website + Bookings",
        bajada: "Your full site, in two languages, taking requests with a tracking code.",
        incluye: [
          "Up to 6 sections",
          "Bilingual",
          "Request system with tracking code",
          "Admin dashboard (Happy Ride style)"
        ]
      }
    },
    {
      id: "06",
      nivel: 2,
      nombre: "Tienda Online",
      bajada: "Vendé online y controlá stock y pedidos desde un panel.",
      incluye: [
        "Catálogo",
        "Carrito",
        "Pagos online",
        "Panel de stock y pedidos (estilo Acacio / AuraLV)"
      ],
      precio: 1600,
      moneda: "USD",
      modalidad: "pago único",
      mensual: null,
      desde: false,
      anticipoPct: 50,
      stripeLink: "https://buy.stripe.com/6oU14p2Ln2ex3I7eTFfAc09",
      plazoEstimado: "a coordinar",
      destacado: false,
      en: {
        nombre: "Online Store",
        bajada: "Sell online and manage stock and orders from one dashboard.",
        incluye: [
          "Catalog",
          "Cart",
          "Online payments",
          "Stock and order dashboard (Acacio / AuraLV style)"
        ]
      }
    },
    {
      id: "07",
      nivel: 3,
      nombre: "Ecosistema WhatsApp + Web + CRM",
      bajada: "Bot, sitio y panel conectados en un solo sistema.",
      incluye: [
        "Bot IA",
        "Sitio",
        "Panel",
        "Integraciones: planillas, CRM, turnos y stock",
        "Todo en un solo sistema"
      ],
      precio: 3500,
      moneda: "USD",
      modalidad: "anticipo",
      mensual: 149,
      desde: true,
      anticipoPct: 30,
      stripeLink: "https://buy.stripe.com/4gM7sN2LncTb2E3cLxfAc01",
      plazoEstimado: "a coordinar",
      destacado: false,
      en: {
        nombre: "WhatsApp + Web + CRM Ecosystem",
        bajada: "Bot, website and dashboard, connected in one system.",
        incluye: [
          "AI bot",
          "Website",
          "Dashboard",
          "Integrations: spreadsheets, CRM, appointments and stock",
          "Everything in one system"
        ]
      }
    },
    {
      id: "08",
      nivel: 3,
      nombre: "Sistema Backend a Medida",
      bajada: "La API, la base de datos y el panel que tu operación necesita.",
      incluye: [
        "API",
        "Base de datos",
        "Panel admin con roles",
        "Tiempo real",
        "Informes (estilo AgroStock / NextScene)"
      ],
      precio: 4500,
      moneda: "USD",
      modalidad: "anticipo",
      mensual: null,
      desde: true,
      anticipoPct: 30,
      stripeLink: "https://buy.stripe.com/aFa3cx99LcTb92r8vhfAc02",
      plazoEstimado: "a coordinar",
      destacado: false,
      en: {
        nombre: "Custom Backend System",
        bajada: "The API, database and dashboard your operation needs.",
        incluye: [
          "API",
          "Database",
          "Admin dashboard with roles",
          "Real-time updates",
          "Reports (AgroStock / NextScene style)"
        ]
      }
    },
    {
      id: "09",
      nivel: 3,
      nombre: "Pentest + Hardening Empresarial",
      bajada: "Encontramos las fallas antes que un atacante, y las cerramos.",
      incluye: [
        "Prueba de intrusión web/red con alcance firmado",
        "Informe ejecutivo y técnico",
        "Corrección",
        "Re-test"
      ],
      precio: 2800,
      moneda: "USD",
      modalidad: "anticipo",
      mensual: null,
      desde: true,
      anticipoPct: 30,
      stripeLink: "https://buy.stripe.com/28E00ladPaL3ceD6n9fAc03",
      plazoEstimado: "a coordinar",
      destacado: false,
      en: {
        nombre: "Enterprise Pentest + Hardening",
        bajada: "We find the gaps before an attacker does, and close them.",
        incluye: [
          "Web/network penetration test with signed scope",
          "Executive and technical report",
          "Remediation",
          "Re-test"
        ]
      }
    }
  ];

  /* Ayudas de lectura (no cambian datos). Las usa tienda.js y el JSON-LD si quiere. */
  window.LD_PRODUCTO = (id) => window.PRODUCTOS.find((p) => p.id === String(id).padStart(2, "0")) || null;

  window.LD_PRECIO = (p, lang = "es") => {
    const en = lang === "en";
    const n = (v) => "USD " + v.toLocaleString(en ? "en-US" : "es-AR");
    let s = (p.desde ? (en ? "From " : "Desde ") : "") + n(p.precio);
    if (p.mensual) s += en ? (p.desde ? "" : " setup") + " + " + n(p.mensual) + "/month" : (p.desde ? "" : " de setup") + " + " + n(p.mensual) + " por mes";
    if (p.anticipoPct) s += en ? " · " + p.anticipoPct + "% deposit to start" : " · anticipo del " + p.anticipoPct + "% para arrancar";
    return s;
  };

  /* Monto que cobra el Payment Link (solo el anticipo) y texto del saldo.
     corto = true omite la palabra "Saldo"/"Balance", para usarlo al lado de un rótulo que ya la dice. */
  window.LD_ANTICIPO = (p) => Math.round((p.precio * p.anticipoPct) / 100);
  window.LD_SALDO = (p, lang = "es", corto = false) => {
    const en = lang === "en";
    const n = (v) => "USD " + v.toLocaleString(en ? "en-US" : "es-AR");
    const resto = n(p.precio - window.LD_ANTICIPO(p));
    let s = p.desde
      ? (corto
          ? (en ? "Set by scope, due on delivery" : "Se define con el alcance y se abona al terminar")
          : (en ? "Balance set by scope, due on delivery" : "El saldo se define con el alcance y se abona al terminar"))
      : (corto
          ? (en ? resto + ", due on delivery" : resto + " al terminar")
          : (en ? "Balance of " + resto + " due on delivery" : "Saldo de " + resto + " al terminar"));
    if (p.mensual) s += en ? ". Monthly fee starts on delivery." : ". La mensualidad empieza con la entrega.";
    return s;
  };
})();
