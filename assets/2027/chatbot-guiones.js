/* ═══════════════════════════════════════════════════════════════
   chatbot-guiones.js · Portafolio 2027 · agente 06x
   Guiones de la demo del chatbot: 13 nichos, ES (voseo) y EN.
   Todo es ficticio: negocios, direcciones, precios ("de ejemplo") y personas.
   Lo lee chatbot-demo.js. Validador: node _demo-build/check-guiones-06.mjs
   ═══════════════════════════════════════════════════════════════ */
window.LD_GUIONES = {
  version: 1,
  escenarios: [
    /* ── 1 · Restaurante ─────────────────────────────────── */
    {
      id: "restaurante",
      emoji: "🍕",
      nombre: { es: "Restaurante", en: "Restaurant" },
      negocio: { es: "Cantina La Esquina", en: "La Esquina Kitchen" },
      humano: { nombre: "Caro", rol: { es: "equipo", en: "team" } },
      mensajes: [
        { de: "cliente", hora: "03:12", texto: { es: "Hola, ¿mañana abren al mediodía? Seríamos 4.", en: "Hi, are you open for lunch tomorrow? There are 4 of us." } },
        { de: "bot", hora: "03:12", tipo: "rapidas",
          texto: { es: "¡Hola! 😊 Sí, mañana abrimos de 12 a 16. El menú del mediodía sale $14.000 por persona (precio de ejemplo). ¿A qué hora los espero?", en: "Hi! 😊 Yes, tomorrow we're open 12 to 4 p.m. The lunch menu is $14,000 per person (sample price). What time should we expect you?" },
          opciones: { es: ["12:30", "13:30", "15:00"], en: ["12:30 p.m.", "1:30 p.m.", "3:00 p.m."] } },
        { de: "cliente", hora: "03:13", elige: 1, texto: { es: "13:30", en: "1:30 p.m." } },
        { de: "bot", hora: "03:13", texto: { es: "Perfecto. ¿A nombre de quién dejo la mesa?", en: "Great. What name should I put the table under?" } },
        { de: "cliente", hora: "03:13", texto: { es: "Martina.", en: "Martina." } },
        { de: "bot", hora: "03:13", tipo: "tarjeta", reaccion: "👍",
          texto: { es: "Reservada, Martina 🍕", en: "You're booked, Martina 🍕" },
          tarjeta: {
            emoji: "📅",
            titulo: { es: "Reserva confirmada", en: "Booking confirmed" },
            lineas: { es: ["Mesa para 4", "Mañana, 13:30", "A nombre de Martina"], en: ["Table for 4", "Tomorrow, 1:30 p.m.", "Under Martina"] },
            precio: { es: "Menú $14.000 por persona (precio de ejemplo)", en: "Menu $14,000 per person (sample price)" }
          },
          flujo: "accion" },
        { de: "cliente", hora: "03:14", tipo: "voz",
          texto: { es: "¿Puedo encargar una torta para un cumpleaños?", en: "Can I order a birthday cake too?" },
          voz: { segundos: 6, transcripcion: { es: "¿Puedo encargar una torta para un cumpleaños?", en: "Can I order a birthday cake too?" } } },
        { de: "bot", hora: "03:14", texto: { es: "Eso lo arregla el equipo. Te paso con una persona y te responde apenas abra.", en: "The team handles that. I'm passing you to a person, and they'll reply as soon as they open." } },
        { de: "sistema", hora: "03:14", tipo: "handoff", texto: { es: "Derivada a Caro, del equipo. La reserva quedó en el panel.", en: "Handed off to Caro from the team. The booking is in the dashboard." } },
        { de: "humano", hora: "03:15", texto: { es: "¡Hola, Martina! Soy Caro 👋 A la mañana te paso sabores y precio de la torta.", en: "Hi Martina! I'm Caro 👋 I'll send you cake flavors and prices in the morning." } }
      ]
    },

    /* ── 2 · Alquiler de vehículos (estilo Happy Ride) ───── */
    {
      id: "alquiler",
      emoji: "🛵",
      nombre: { es: "Alquiler", en: "Rentals" },
      negocio: { es: "Rodá Alquileres", en: "Roda Rentals" },
      humano: { nombre: "Caro", rol: { es: "equipo", en: "team" } },
      mensajes: [
        { de: "cliente", hora: "03:12", texto: { es: "Hola, ¿tienen scooters para el sábado y el domingo?", en: "Hi, do you have scooters for Saturday and Sunday?" } },
        { de: "bot", hora: "03:12", tipo: "rapidas",
          texto: { es: "¡Hola! Para esas fechas hay scooters y e-bikes 🛵 ¿Cuántas personas son?", en: "Hi! For those dates we have scooters and e-bikes 🛵 How many people?" },
          opciones: { es: ["1 persona", "2 personas", "3 o más"], en: ["Just me", "2 people", "3 or more"] } },
        { de: "cliente", hora: "03:12", elige: 1, texto: { es: "2 personas", en: "2 people" } },
        { de: "bot", hora: "03:13", tipo: "tarjeta",
          texto: { es: "Listo, te dejo la solicitud cargada ✅", en: "Done, your request is in ✅" },
          tarjeta: {
            emoji: "🛵",
            titulo: { es: "Solicitud DEMO-4821", en: "Request DEMO-4821" },
            lineas: { es: ["2 scooters", "Sábado y domingo", "Retiro o entrega a coordinar"], en: ["2 scooters", "Saturday and Sunday", "Pickup or drop-off to be arranged"] },
            precio: { es: "Te lo confirma una persona", en: "A person will confirm the price" }
          },
          flujo: "accion" },
        { de: "bot", hora: "03:13", tipo: "ubicacion",
          texto: { es: "Podés retirarlos acá, o te los llevamos al alojamiento:", en: "You can pick them up here, or we'll bring them to where you're staying:" },
          ubicacion: { nombre: { es: "Rodá Alquileres", en: "Roda Rentals" }, direccion: { es: "Calle Ejemplo 456 (ficticia)", en: "456 Sample St. (fictional)" } } },
        { de: "cliente", hora: "03:14", reaccion: "👍", texto: { es: "¿Cuánto sale?", en: "How much is it?" } },
        { de: "bot", hora: "03:14", texto: { es: "La tarifa te la confirma una persona del equipo junto con la disponibilidad. Acá no se cobra nada. Te paso con ella.", en: "A person from the team will confirm the rate along with availability. Nothing is charged here. I'm passing you to them." } },
        { de: "sistema", hora: "03:14", tipo: "handoff", texto: { es: "Derivada a Caro, del equipo. La solicitud DEMO-4821 quedó en el panel.", en: "Handed off to Caro from the team. Request DEMO-4821 is in the dashboard." } },
        { de: "humano", hora: "03:15", texto: { es: "¡Hola! Soy Caro 👋 Ya vi tu solicitud. Te confirmo precio y horario de entrega en un rato.", en: "Hi! I'm Caro 👋 I've got your request. I'll confirm the price and delivery time shortly." } }
      ]
    },

    /* ── 3 · Tienda de ropa ──────────────────────────────── */
    {
      id: "tienda",
      emoji: "👕",
      nombre: { es: "Tienda", en: "Store" },
      negocio: { es: "Ropero Sur", en: "Ropero Sur Clothing" },
      humano: { nombre: "Caro", rol: { es: "equipo", en: "team" } },
      mensajes: [
        { de: "cliente", hora: "03:12", texto: { es: "¿Tienen la campera negra en talle M?", en: "Do you have the black jacket in a medium?" } },
        { de: "bot", hora: "03:12", tipo: "rapidas",
          texto: { es: "Sí, la campera negra talle M está en stock 🙌 ¿Cómo la querés recibir?", en: "Yes, the black jacket in medium is in stock 🙌 How would you like to get it?" },
          opciones: { es: ["Envío a domicilio", "Retiro en el local"], en: ["Home delivery", "Store pickup"] } },
        { de: "cliente", hora: "03:13", elige: 0, texto: { es: "Envío a domicilio", en: "Home delivery" } },
        { de: "bot", hora: "03:13", texto: { es: "Dale. ¿Me pasás tu código postal para calcular el envío?", en: "Sure. What's your ZIP code, so I can work out shipping?" } },
        { de: "cliente", hora: "03:13", texto: { es: "5000.", en: "5000." } },
        { de: "bot", hora: "03:14", tipo: "tarjeta",
          texto: { es: "Te armé el pedido:", en: "Here's your order:" },
          tarjeta: {
            emoji: "👕",
            titulo: { es: "Pedido armado", en: "Order ready" },
            lineas: { es: ["Campera negra, talle M", "Envío a CP 5000"], en: ["Black jacket, size M", "Shipping to ZIP 5000"] },
            precio: { es: "$58.000 + envío (precio de ejemplo)", en: "$58,000 + shipping (sample price)" }
          },
          flujo: "accion" },
        { de: "cliente", hora: "03:14", tipo: "voz",
          texto: { es: "¿Y si me queda grande la puedo cambiar?", en: "And if it's too big, can I exchange it?" },
          voz: { segundos: 5, transcripcion: { es: "¿Y si me queda grande la puedo cambiar?", en: "And if it's too big, can I exchange it?" } } },
        { de: "bot", hora: "03:14", texto: { es: "Sí, los cambios los coordina el equipo. Te paso con una persona para el pago y el envío.", en: "Yes, the team handles exchanges. I'm passing you to a person for payment and shipping." } },
        { de: "sistema", hora: "03:15", tipo: "handoff", texto: { es: "Derivada a Caro, del equipo. El pedido quedó en el panel.", en: "Handed off to Caro from the team. The order is in the dashboard." } },
        { de: "humano", hora: "03:15", texto: { es: "¡Hola! Soy Caro 👋 Tenés 30 días para cambiarla. Te paso cómo pagar.", en: "Hi! I'm Caro 👋 You have 30 days to exchange it. Here's how to pay." } }
      ]
    },

    /* ── 4 · Clínica (turnos) ────────────────────────────── */
    {
      id: "clinica",
      emoji: "🩺",
      nombre: { es: "Clínica", en: "Clinic" },
      negocio: { es: "Consultorios Del Parque", en: "Del Parque Clinic" },
      humano: { nombre: "Caro", rol: { es: "equipo", en: "team" } },
      mensajes: [
        { de: "cliente", hora: "03:12", texto: { es: "Hola, necesito un turno con clínica médica.", en: "Hi, I need an appointment with a general doctor." } },
        { de: "bot", hora: "03:12", tipo: "rapidas",
          texto: { es: "¡Hola! Tengo lugar esta semana. ¿Qué día te queda mejor?", en: "Hi! There's availability this week. Which day works best?" },
          opciones: { es: ["Martes", "Jueves"], en: ["Tuesday", "Thursday"] } },
        { de: "cliente", hora: "03:13", elige: 1, texto: { es: "Jueves", en: "Thursday" } },
        { de: "bot", hora: "03:13", tipo: "tarjeta", reaccion: "🙌",
          texto: { es: "Te reservé este turno 📅", en: "I've booked this for you 📅" },
          tarjeta: {
            emoji: "📅",
            titulo: { es: "Turno reservado", en: "Appointment booked" },
            lineas: { es: ["Clínica médica", "Jueves, 10:30", "Traé DNI y credencial"], en: ["General medicine", "Thursday, 10:30 a.m.", "Bring your ID and insurance card"] }
          },
          flujo: "accion" },
        { de: "bot", hora: "03:13", tipo: "ubicacion",
          texto: { es: "Te esperamos acá:", en: "Here's where to find us:" },
          ubicacion: { nombre: { es: "Consultorios Del Parque", en: "Del Parque Clinic" }, direccion: { es: "Av. Ejemplo 1234, piso 2 (ficticia)", en: "1234 Sample Ave., 2nd floor (fictional)" } } },
        { de: "cliente", hora: "03:14", texto: { es: "¿Atienden por mi obra social?", en: "Do you take my insurance?" } },
        { de: "bot", hora: "03:14", texto: { es: "Eso lo revisa el equipo con tu plan. Te paso con una persona.", en: "The team checks that against your plan. I'm passing you to a person." } },
        { de: "sistema", hora: "03:14", tipo: "handoff", texto: { es: "Derivada a Caro, del equipo. El turno quedó en el panel.", en: "Handed off to Caro from the team. The appointment is in the dashboard." } },
        { de: "humano", hora: "03:15", texto: { es: "¡Hola! Soy Caro 👋 Pasame el nombre de tu obra social y te confirmo a primera hora.", en: "Hi! I'm Caro 👋 Send me your insurance provider and I'll confirm first thing in the morning." } }
      ]
    },

    /* ── 5 · Inmobiliaria (visitas) ──────────────────────── */
    {
      id: "inmobiliaria",
      emoji: "🏠",
      nombre: { es: "Inmobiliaria", en: "Real estate" },
      negocio: { es: "Inmobiliaria Norte", en: "Norte Realty" },
      humano: { nombre: "Caro", rol: { es: "equipo", en: "team" } },
      mensajes: [
        { de: "cliente", hora: "03:12", tipo: "voz",
          texto: { es: "Hola, vi el depto de dos ambientes en alquiler. ¿Sigue disponible?", en: "Hi, I saw the one-bedroom apartment for rent. Is it still available?" },
          voz: { segundos: 7, transcripcion: { es: "Hola, vi el depto de dos ambientes en alquiler. ¿Sigue disponible?", en: "Hi, I saw the one-bedroom apartment for rent. Is it still available?" } } },
        { de: "bot", hora: "03:12", tipo: "rapidas",
          texto: { es: "¡Hola! Sí, sigue disponible 😊 ¿Querés coordinar una visita?", en: "Hi! Yes, it's still available 😊 Want to set up a viewing?" },
          opciones: { es: ["Sí, esta semana", "Prefiero el finde"], en: ["Yes, this week", "Weekend is better"] } },
        { de: "cliente", hora: "03:13", elige: 0, texto: { es: "Sí, esta semana", en: "Yes, this week" } },
        { de: "bot", hora: "03:13", tipo: "tarjeta",
          texto: { es: "Te agendé el primer horario libre:", en: "I've booked the first free slot:" },
          tarjeta: {
            emoji: "🏠",
            titulo: { es: "Visita agendada", en: "Viewing booked" },
            lineas: { es: ["Depto de 2 ambientes", "Miércoles, 18:00", "Te espera alguien del equipo"], en: ["One-bedroom apartment", "Wednesday, 6:00 p.m.", "Someone from the team will meet you"] }
          },
          flujo: "accion" },
        { de: "bot", hora: "03:13", tipo: "ubicacion",
          texto: { es: "La dirección del depto:", en: "The apartment's address:" },
          ubicacion: { nombre: { es: "Depto en alquiler", en: "Apartment for rent" }, direccion: { es: "Calle Ejemplo 789, 3.º B (ficticia)", en: "789 Sample St., Apt 3B (fictional)" } } },
        { de: "cliente", hora: "03:14", reaccion: "👍", texto: { es: "Genial. ¿Aceptan mascotas?", en: "Great. Are pets allowed?" } },
        { de: "bot", hora: "03:14", texto: { es: "Eso depende del dueño. Te paso con una persona del equipo para confirmarlo.", en: "That's up to the owner. I'm passing you to a person on the team to confirm." } },
        { de: "sistema", hora: "03:14", tipo: "handoff", texto: { es: "Derivada a Caro, del equipo. La visita quedó en el panel.", en: "Handed off to Caro from the team. The viewing is in the dashboard." } },
        { de: "humano", hora: "03:15", texto: { es: "¡Hola! Soy Caro 👋 Le consulto al dueño por la mascota y te aviso antes de la visita.", en: "Hi! I'm Caro 👋 I'll ask the owner about pets and let you know before the viewing." } }
      ]
    },

    /* ── 6 · Gimnasio (planes y clases) ──────────────────── */
    {
      id: "gimnasio",
      emoji: "🏋️",
      nombre: { es: "Gimnasio", en: "Gym" },
      negocio: { es: "Club Fuerza", en: "Fuerza Club" },
      humano: { nombre: "Caro", rol: { es: "equipo", en: "team" } },
      mensajes: [
        { de: "cliente", hora: "03:12", texto: { es: "Hola, ¿qué planes tienen?", en: "Hi, what memberships do you have?" } },
        { de: "bot", hora: "03:12", tipo: "rapidas",
          texto: { es: "¡Hola! 💪 Tenemos pase libre y planes de clases. ¿Qué buscás?", en: "Hi! 💪 We have open-gym passes and class plans. What are you after?" },
          opciones: { es: ["Pase libre", "Clases", "Las dos cosas"], en: ["Open gym", "Classes", "Both"] } },
        { de: "cliente", hora: "03:12", elige: 1, texto: { es: "Clases", en: "Classes" } },
        { de: "bot", hora: "03:13", texto: { es: "Hay funcional, spinning y yoga, de lunes a sábado. La primera clase es de prueba y sin cargo.", en: "We run functional training, spinning and yoga, Monday to Saturday. Your first class is a free trial." } },
        { de: "cliente", hora: "03:13", texto: { es: "Quiero probar spinning mañana.", en: "I'd like to try spinning tomorrow." } },
        { de: "bot", hora: "03:13", tipo: "tarjeta",
          texto: { es: "¡Anotado! ✅", en: "You're in! ✅" },
          tarjeta: {
            emoji: "📅",
            titulo: { es: "Clase de prueba", en: "Trial class" },
            lineas: { es: ["Spinning", "Mañana, 19:00", "Traé toalla y agua"], en: ["Spinning", "Tomorrow, 7:00 p.m.", "Bring a towel and water"] }
          },
          flujo: "accion" },
        { de: "cliente", hora: "03:14", texto: { es: "¿Tienen descuento si vamos con una amiga?", en: "Is there a discount if I bring a friend?" } },
        { de: "bot", hora: "03:14", texto: { es: "Las promos las define el equipo. Te paso con una persona.", en: "The team sets the promos. I'm passing you to a person." } },
        { de: "sistema", hora: "03:14", tipo: "handoff", texto: { es: "Derivada a Caro, del equipo. La clase de prueba quedó en el panel.", en: "Handed off to Caro from the team. The trial class is in the dashboard." } },
        { de: "humano", hora: "03:15", texto: { es: "¡Hola! Soy Caro 👋 Si vienen las dos, tu amiga también prueba gratis. ¡Nos vemos!", en: "Hi! I'm Caro 👋 If you both come, your friend gets a free trial too. See you there!" } }
      ]
    },

    /* ── 7 · Peluquería (turnos) ─────────────────────────── */
    {
      id: "peluqueria",
      emoji: "💇",
      nombre: { es: "Peluquería", en: "Hair salon" },
      negocio: { es: "Estudio Tijera", en: "Tijera Studio" },
      humano: { nombre: "Caro", rol: { es: "equipo", en: "team" } },
      mensajes: [
        { de: "cliente", hora: "03:12", texto: { es: "¡Hola! ¿Tenés turno para corte el sábado?", en: "Hi! Any slots for a haircut on Saturday?" } },
        { de: "bot", hora: "03:12", tipo: "rapidas",
          texto: { es: "¡Hola! El sábado tengo estos horarios:", en: "Hi! On Saturday I have these times:" },
          opciones: { es: ["10:00", "11:30", "16:00"], en: ["10:00 a.m.", "11:30 a.m.", "4:00 p.m."] } },
        { de: "cliente", hora: "03:13", elige: 2, texto: { es: "16:00", en: "4:00 p.m." } },
        { de: "bot", hora: "03:13", tipo: "tarjeta",
          texto: { es: "Agendado ✅", en: "Booked ✅" },
          tarjeta: {
            emoji: "💇",
            titulo: { es: "Turno confirmado", en: "Appointment confirmed" },
            lineas: { es: ["Corte", "Sábado, 16:00"], en: ["Haircut", "Saturday, 4:00 p.m."] },
            precio: { es: "$9.000 (precio de ejemplo)", en: "$9,000 (sample price)" }
          },
          flujo: "accion" },
        { de: "bot", hora: "03:13", tipo: "ubicacion",
          texto: { es: "Estamos acá:", en: "Here's where we are:" },
          ubicacion: { nombre: { es: "Estudio Tijera", en: "Tijera Studio" }, direccion: { es: "Pasaje Ejemplo 321 (ficticia)", en: "321 Sample Lane (fictional)" } } },
        { de: "cliente", hora: "03:14", tipo: "voz",
          texto: { es: "Y si me quiero hacer color también, ¿cuánto tiempo lleva?", en: "And if I want color too, how long does that take?" },
          voz: { segundos: 6, transcripcion: { es: "Y si me quiero hacer color también, ¿cuánto tiempo lleva?", en: "And if I want color too, how long does that take?" } } },
        { de: "bot", hora: "03:14", texto: { es: "Para color, el equipo tiene que ver tu pelo antes. Te paso con una persona.", en: "For color, the team needs to see your hair first. I'm passing you to a person." } },
        { de: "sistema", hora: "03:14", tipo: "handoff", texto: { es: "Derivada a Caro, del equipo. El turno quedó en el panel.", en: "Handed off to Caro from the team. The appointment is in the dashboard." } },
        { de: "humano", hora: "03:15", texto: { es: "¡Hola! Soy Caro 👋 Mandame una foto de tu pelo y te digo si llegamos con el color el sábado.", en: "Hi! I'm Caro 👋 Send me a photo of your hair and I'll tell you if we can fit color in on Saturday." } }
      ]
    },

    /* ── 8 · Hotel (reservas) ────────────────────────────── */
    {
      id: "hotel",
      emoji: "🏨",
      nombre: { es: "Hotel", en: "Hotel" },
      negocio: { es: "Hotel Las Lomas", en: "Las Lomas Hotel" },
      humano: { nombre: "Caro", rol: { es: "equipo", en: "team" } },
      mensajes: [
        { de: "cliente", hora: "03:12", texto: { es: "Hola, ¿tienen habitación doble del 12 al 14?", en: "Hi, do you have a double room from the 12th to the 14th?" } },
        { de: "bot", hora: "03:12", tipo: "rapidas",
          texto: { es: "¡Hola! Sí, hay disponibilidad 😊 ¿Qué habitación preferís?", en: "Hi! Yes, we have availability 😊 Which room would you like?" },
          opciones: { es: ["Doble estándar", "Doble con vista"], en: ["Standard double", "Double with a view"] } },
        { de: "cliente", hora: "03:13", elige: 1, texto: { es: "Doble con vista", en: "Double with a view" } },
        { de: "bot", hora: "03:13", tipo: "tarjeta", reaccion: "🙌",
          texto: { es: "Te dejo la reserva tomada:", en: "Your reservation is on hold:" },
          tarjeta: {
            emoji: "🏨",
            titulo: { es: "Reserva tomada", en: "Reservation on hold" },
            lineas: { es: ["Doble con vista", "Del 12 al 14 (2 noches)", "Desayuno incluido"], en: ["Double with a view", "12th to 14th (2 nights)", "Breakfast included"] },
            precio: { es: "$85.000 por noche (precio de ejemplo)", en: "$85,000 per night (sample price)" }
          },
          flujo: "accion" },
        { de: "cliente", hora: "03:14", texto: { es: "¿Puedo hacer el check-in tarde? Llegamos a la noche.", en: "Can we check in late? We're arriving at night." } },
        { de: "bot", hora: "03:14", texto: { es: "Eso lo coordina recepción. Te paso con una persona.", en: "Reception sorts that out. I'm passing you to a person." } },
        { de: "sistema", hora: "03:14", tipo: "handoff", texto: { es: "Derivada a Caro, del equipo. La reserva quedó en el panel.", en: "Handed off to Caro from the team. The reservation is in the dashboard." } },
        { de: "humano", hora: "03:15", texto: { es: "¡Hola! Soy Caro 👋 Recepción está abierta toda la noche, así que llegá a la hora que puedas.", en: "Hi! I'm Caro 👋 Reception is open all night, so arrive whenever suits you." } }
      ]
    },

    /* ── 9 · Concesionaria (test drive, estilo Dar Automotores) ─ */
    {
      id: "concesionaria",
      emoji: "🚗",
      nombre: { es: "Concesionaria", en: "Car dealer" },
      negocio: { es: "Autos del Centro", en: "Downtown Motors" },
      humano: { nombre: "Caro", rol: { es: "equipo", en: "team" } },
      mensajes: [
        { de: "cliente", hora: "03:12", texto: { es: "Hola, me interesa el sedán automático que publicaron.", en: "Hi, I'm interested in the automatic sedan you listed." } },
        { de: "bot", hora: "03:12", tipo: "rapidas",
          texto: { es: "¡Hola! 🚗 Está disponible. ¿Querés manejarlo antes de decidir?", en: "Hi! 🚗 It's available. Would you like to drive it before deciding?" },
          opciones: { es: ["Sí, quiero probarlo", "Solo info por ahora"], en: ["Yes, book a test drive", "Just info for now"] } },
        { de: "cliente", hora: "03:13", elige: 0, texto: { es: "Sí, quiero probarlo", en: "Yes, book a test drive" } },
        { de: "bot", hora: "03:13", tipo: "tarjeta",
          texto: { es: "Te agendé el primer horario libre:", en: "I've booked the first free slot:" },
          tarjeta: {
            emoji: "🚗",
            titulo: { es: "Test drive agendado", en: "Test drive booked" },
            lineas: { es: ["Sedán automático", "Jueves, 17:00", "Traé tu licencia de conducir"], en: ["Automatic sedan", "Thursday, 5:00 p.m.", "Bring your driver's license"] }
          },
          flujo: "accion" },
        { de: "bot", hora: "03:13", tipo: "ubicacion",
          texto: { es: "Te esperamos en el salón:", en: "We'll see you at the showroom:" },
          ubicacion: { nombre: { es: "Autos del Centro", en: "Downtown Motors" }, direccion: { es: "Av. Ejemplo 2020 (ficticia)", en: "2020 Sample Ave. (fictional)" } } },
        { de: "cliente", hora: "03:14", reaccion: "👍", texto: { es: "¿Toman mi auto como parte de pago?", en: "Do you take trade-ins?" } },
        { de: "bot", hora: "03:14", texto: { es: "Sí, pero la tasación la hace un asesor. Te paso con una persona.", en: "Yes, but an advisor does the appraisal. I'm passing you to a person." } },
        { de: "sistema", hora: "03:14", tipo: "handoff", texto: { es: "Derivada a Caro, del equipo. El test drive quedó en el panel.", en: "Handed off to Caro from the team. The test drive is in the dashboard." } },
        { de: "humano", hora: "03:15", texto: { es: "¡Hola! Soy Caro 👋 Traé tu auto el jueves y lo tasamos mientras probás el sedán.", en: "Hi! I'm Caro 👋 Bring your car on Thursday and we'll appraise it while you test the sedan." } }
      ]
    },

    /* ── 10 · Delivery (pedidos) ─────────────────────────── */
    {
      id: "delivery",
      emoji: "🍔",
      nombre: { es: "Delivery", en: "Delivery" },
      negocio: { es: "Burger Barrio", en: "Barrio Burgers" },
      humano: { nombre: "Caro", rol: { es: "equipo", en: "team" } },
      mensajes: [
        { de: "cliente", hora: "03:12", texto: { es: "Hola, ¿siguen tomando pedidos?", en: "Hi, are you still taking orders?" } },
        { de: "bot", hora: "03:12", tipo: "rapidas",
          texto: { es: "¡Hola! Sí, la cocina está abierta hasta las 4 🍔 ¿Qué te preparo?", en: "Hi! Yes, the kitchen's open until 4 a.m. 🍔 What can I get you?" },
          opciones: { es: ["Combo clásico", "Combo doble", "Ver la carta"], en: ["Classic combo", "Double combo", "See the menu"] } },
        { de: "cliente", hora: "03:12", elige: 1, texto: { es: "Combo doble", en: "Double combo" } },
        { de: "bot", hora: "03:13", texto: { es: "Buenísimo. ¿A dónde te lo mando?", en: "Nice. Where should we send it?" } },
        { de: "cliente", hora: "03:13", tipo: "ubicacion",
          texto: { es: "Acá:", en: "Here:" },
          ubicacion: { nombre: { es: "Mi casa", en: "Home" }, direccion: { es: "Calle Ejemplo 1500 (ficticia)", en: "1500 Sample St. (fictional)" } } },
        { de: "bot", hora: "03:13", tipo: "tarjeta",
          texto: { es: "Pedido en marcha ✅", en: "Order on its way ✅" },
          tarjeta: {
            emoji: "🍔",
            titulo: { es: "Pedido confirmado", en: "Order confirmed" },
            lineas: { es: ["Combo doble", "Envío a Calle Ejemplo 1500", "Llega en unos 35 minutos"], en: ["Double combo", "Delivery to 1500 Sample St.", "Arrives in about 35 minutes"] },
            precio: { es: "$16.500 (precio de ejemplo)", en: "$16,500 (sample price)" }
          },
          flujo: "accion" },
        { de: "cliente", hora: "03:14", texto: { es: "Una cosa: el pedido de ayer llegó frío.", en: "One thing: yesterday's order arrived cold." } },
        { de: "bot", hora: "03:14", texto: { es: "Perdón por eso. Te paso con una persona del equipo para resolverlo.", en: "Sorry about that. I'm passing you to a person on the team to sort it out." } },
        { de: "sistema", hora: "03:14", tipo: "handoff", texto: { es: "Derivada a Caro, del equipo. El pedido y el reclamo quedaron en el panel.", en: "Handed off to Caro from the team. The order and the complaint are in the dashboard." } },
        { de: "humano", hora: "03:15", texto: { es: "¡Hola! Soy Caro 👋 Lo de ayer corre por nuestra cuenta: hoy te sumamos unas papas de regalo.", en: "Hi! I'm Caro 👋 Yesterday's on us: we're adding free fries to tonight's order." } }
      ]
    },

    /* ── 11 · Taller mecánico (presupuestos) ─────────────── */
    {
      id: "taller",
      emoji: "🔧",
      nombre: { es: "Taller", en: "Garage" },
      negocio: { es: "Taller El Pistón", en: "Piston Garage" },
      humano: { nombre: "Caro", rol: { es: "equipo", en: "team" } },
      mensajes: [
        { de: "cliente", hora: "03:12", tipo: "voz",
          texto: { es: "Hola, el auto hace un ruido raro cuando freno. ¿Lo pueden ver?", en: "Hi, my car makes a weird noise when I brake. Can you take a look?" },
          voz: { segundos: 8, transcripcion: { es: "Hola, el auto hace un ruido raro cuando freno. ¿Lo pueden ver?", en: "Hi, my car makes a weird noise when I brake. Can you take a look?" } } },
        { de: "bot", hora: "03:12", tipo: "rapidas",
          texto: { es: "¡Hola! Sí, revisamos frenos 🔧 ¿Qué vehículo es?", en: "Hi! Yes, we check brakes 🔧 What kind of vehicle is it?" },
          opciones: { es: ["Auto chico", "Sedán", "Camioneta"], en: ["Small car", "Sedan", "Pickup or SUV"] } },
        { de: "cliente", hora: "03:13", elige: 1, texto: { es: "Sedán", en: "Sedan" } },
        { de: "bot", hora: "03:13", tipo: "tarjeta",
          texto: { es: "Te reservé un lugar para el diagnóstico:", en: "I've saved you a slot for a diagnosis:" },
          tarjeta: {
            emoji: "🔧",
            titulo: { es: "Diagnóstico de frenos", en: "Brake check" },
            lineas: { es: ["Sedán", "Lunes, 9:00", "Presupuesto antes de arreglar"], en: ["Sedan", "Monday, 9:00 a.m.", "Quote before any repair"] },
            precio: { es: "Diagnóstico $12.000 (precio de ejemplo)", en: "Diagnosis $12,000 (sample price)" }
          },
          flujo: "accion" },
        { de: "bot", hora: "03:13", tipo: "ubicacion",
          texto: { es: "Dejalo acá a las 9:", en: "Drop it off here at 9:" },
          ubicacion: { nombre: { es: "Taller El Pistón", en: "Piston Garage" }, direccion: { es: "Ruta Ejemplo km 5 (ficticia)", en: "Sample Route, km 5 (fictional)" } } },
        { de: "cliente", hora: "03:14", reaccion: "👍", texto: { es: "¿Me pueden pasar un presupuesto ya?", en: "Can you give me a quote now?" } },
        { de: "bot", hora: "03:14", texto: { es: "El presupuesto lo arma el mecánico cuando lo ve. Te paso con una persona.", en: "The mechanic puts the quote together after seeing it. I'm passing you to a person." } },
        { de: "sistema", hora: "03:14", tipo: "handoff", texto: { es: "Derivada a Caro, del equipo. El diagnóstico quedó en el panel.", en: "Handed off to Caro from the team. The brake check is in the dashboard." } },
        { de: "humano", hora: "03:15", texto: { es: "¡Hola! Soy Caro 👋 Por lo que contás suelen ser las pastillas. El lunes te confirmamos el precio exacto.", en: "Hi! I'm Caro 👋 From what you describe, it's usually the pads. We'll confirm the exact price on Monday." } }
      ]
    },

    /* ── 12 · Estudio contable (consultas y documentación) ─ */
    {
      id: "contable",
      emoji: "📊",
      nombre: { es: "Contable", en: "Accounting" },
      negocio: { es: "Estudio Contable Ábaco", en: "Abaco Accounting" },
      humano: { nombre: "Caro", rol: { es: "equipo", en: "team" } },
      mensajes: [
        { de: "cliente", hora: "03:12", texto: { es: "Hola, soy monotributista y no sé si me tengo que recategorizar.", en: "Hi, I'm self-employed and not sure if I need to move up a tax bracket." } },
        { de: "bot", hora: "03:12", tipo: "rapidas",
          texto: { es: "¡Hola! Te ayudo a ordenar la consulta. ¿Qué necesitás?", en: "Hi! Let me help you sort this out. What do you need?" },
          opciones: { es: ["Recategorización", "Facturación", "Otra consulta"], en: ["Tax bracket review", "Invoicing", "Something else"] } },
        { de: "cliente", hora: "03:13", elige: 0, texto: { es: "Recategorización", en: "Tax bracket review" } },
        { de: "bot", hora: "03:13", texto: { es: "Para revisarlo necesitamos tus ventas de los últimos 12 meses. Las podés mandar por acá cuando quieras.", en: "To check, we need your sales from the last 12 months. You can send them here whenever you like." } },
        { de: "cliente", hora: "03:13", tipo: "voz",
          texto: { es: "Las tengo en una planilla, te la mando mañana.", en: "I've got them in a spreadsheet, I'll send it tomorrow." },
          voz: { segundos: 5, transcripcion: { es: "Las tengo en una planilla, te la mando mañana.", en: "I've got them in a spreadsheet, I'll send it tomorrow." } } },
        { de: "bot", hora: "03:14", tipo: "tarjeta",
          texto: { es: "Perfecto. Te agendé la consulta 📅", en: "Perfect. Your consultation is booked 📅" },
          tarjeta: {
            emoji: "📊",
            titulo: { es: "Consulta agendada", en: "Consultation booked" },
            lineas: { es: ["Recategorización", "Martes, 11:00, por videollamada", "Antes: ventas de 12 meses"], en: ["Tax bracket review", "Tuesday, 11:00 a.m., video call", "Beforehand: 12 months of sales"] }
          },
          flujo: "accion" },
        { de: "cliente", hora: "03:14", texto: { es: "¿Cuánto cobran por llevarme todo el año?", en: "How much do you charge to handle the whole year?" } },
        { de: "bot", hora: "03:14", texto: { es: "Los honorarios los arma el estudio según tu caso. Te paso con una persona.", en: "The firm prices that based on your case. I'm passing you to a person." } },
        { de: "sistema", hora: "03:15", tipo: "handoff", texto: { es: "Derivada a Caro, del equipo. La consulta quedó en el panel.", en: "Handed off to Caro from the team. The consultation is in the dashboard." } },
        { de: "humano", hora: "03:15", texto: { es: "¡Hola! Soy Caro 👋 El martes vemos tu planilla y te paso una propuesta anual.", en: "Hi! I'm Caro 👋 On Tuesday we'll go over your spreadsheet and send you a yearly proposal." } }
      ]
    },

    /* ── 13 · Academia (inscripciones) ───────────────────── */
    {
      id: "academia",
      emoji: "🎓",
      nombre: { es: "Academia", en: "Academy" },
      negocio: { es: "Academia Puente", en: "Puente Academy" },
      humano: { nombre: "Caro", rol: { es: "equipo", en: "team" } },
      mensajes: [
        { de: "cliente", hora: "03:12", texto: { es: "Hola, ¿cuándo empieza el curso de portugués para adultos?", en: "Hi, when does the adult Portuguese course start?" } },
        { de: "bot", hora: "03:12", tipo: "rapidas",
          texto: { es: "¡Hola! 🎓 Arranca el lunes 3. ¿Qué nivel tenés?", en: "Hi! 🎓 It starts Monday the 3rd. What's your level?" },
          opciones: { es: ["Inicial", "Intermedio", "No sé"], en: ["Beginner", "Intermediate", "Not sure"] } },
        { de: "cliente", hora: "03:13", elige: 2, texto: { es: "No sé", en: "Not sure" } },
        { de: "bot", hora: "03:13", tipo: "tarjeta",
          texto: { es: "No pasa nada 😊 Hacés una prueba de nivel corta y listo. Te guardé el lugar:", en: "No problem 😊 You'll take a short placement test first. I've saved your spot:" },
          tarjeta: {
            emoji: "🎓",
            titulo: { es: "Inscripción iniciada", en: "Enrollment started" },
            lineas: { es: ["Portugués para adultos", "Prueba de nivel: viernes, 18:00", "Lugar reservado por 48 h"], en: ["Portuguese for adults", "Placement test: Friday, 6:00 p.m.", "Spot held for 48 hours"] },
            precio: { es: "$30.000 por mes (precio de ejemplo)", en: "$30,000 per month (sample price)" }
          },
          flujo: "accion" },
        { de: "bot", hora: "03:13", tipo: "ubicacion",
          texto: { es: "La prueba es en la sede:", en: "The test is at our campus:" },
          ubicacion: { nombre: { es: "Academia Puente", en: "Puente Academy" }, direccion: { es: "Av. Ejemplo 890, 1.º piso (ficticia)", en: "890 Sample Ave., 1st floor (fictional)" } } },
        { de: "cliente", hora: "03:14", reaccion: "🙌", texto: { es: "¿Hay descuento para estudiantes?", en: "Is there a student discount?" } },
        { de: "bot", hora: "03:14", texto: { es: "Las becas y descuentos los ve secretaría. Te paso con una persona.", en: "The front office handles scholarships and discounts. I'm passing you to a person." } },
        { de: "sistema", hora: "03:14", tipo: "handoff", texto: { es: "Derivada a Caro, del equipo. La inscripción quedó en el panel.", en: "Handed off to Caro from the team. The enrollment is in the dashboard." } },
        { de: "humano", hora: "03:15", texto: { es: "¡Hola! Soy Caro 👋 Con libreta de estudiante tenés 20 % menos. Traela el viernes.", en: "Hi! I'm Caro 👋 With a student ID you get 20% off. Bring it on Friday." } }
      ]
    }
  ]
};
