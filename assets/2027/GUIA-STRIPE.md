## Stripe

### Cómo funciona

- El sitio es estático (GitHub Pages, también abre por `file://`): no hay servidor. Cada producto de la tienda cobra con un **Payment Link** de Stripe (checkout alojado por Stripe).
- En el repo **no hay claves**. Las claves de Stripe viven fuera del repo y nunca se commitean. El sitio solo guarda la URL pública de cada link (`https://buy.stripe.com/...`).
- **Cada link cobra solo el anticipo para arrancar**: 50 % en los productos 01–06 y 30 % en los "desde" (07–09). El saldo se abona al terminar. Las mensualidades (02, 04, 07) **no** se cobran online: empiezan con la entrega.
- El sitio no puede verificar pagos. La confirmación para el cliente es el recibo que le manda Stripe.

### Montos de cada link

Anticipo = `Math.round(precio * pct / 100)`, igual que `LD_ANTICIPO` en `productos.js`.

| ID | Producto | Precio (USD) | Mensual | % | Anticipo del link (USD) |
|---|---|---|---|---|---|
| 01 | Landing Express | 290 | — | 50 | **145** |
| 02 | Bot WhatsApp Starter | 350 | 39 (no online) | 50 | **175** |
| 03 | Chequeo de Seguridad Web | 190 | — | 50 | **95** |
| 04 | Chatbot WhatsApp IA Pro 24/7 | 890 | 79 (no online) | 50 | **445** |
| 05 | Sitio Profesional + Reservas | 1200 | — | 50 | **600** |
| 06 | Tienda Online | 1600 | — | 50 | **800** |
| 07 | Ecosistema WhatsApp + Web + CRM | desde 3500 | 149 (no online) | 30 | **1050** |
| 08 | Sistema Backend a Medida | desde 4500 | — | 30 | **1350** |
| 09 | Pentest + Hardening Empresarial | desde 2800 | — | 30 | **840** |

### Objetos creados en Stripe LIVE (30/10/2026)

Los IDs `prod_` / `price_` / `plink_` no son secretos. Todos llevan `metadata[lautarodev_id]` = `NN` (product, price y link).

| ID | Product | Price (one-time USD) | Payment Link | URL pública | Estado |
|---|---|---|---|---|---|
| 01 | `prod_VXKZOOtmIgIHeP` | `price_1UWFueQWysVLn2UWEnRswRvT` · 145 | `plink_1UWFufQWysVLn2UWAEgusOwM` | https://buy.stripe.com/00w14pfy99GZguTeTFfAc04 | Activo |
| 02 | `prod_VXKZ4GdMf1HWbU` | `price_1UWFugQWysVLn2UWRICUSON1` · 175 | `plink_1UWFuhQWysVLn2UW8M6J6VUX` | https://buy.stripe.com/8x2aEZdq13iB1zZeTFfAc05 | Activo |
| 03 | `prod_VXKZFChI6aLo1b` | `price_1UWFuiQWysVLn2UWbiGQcJNC` · 95 | `plink_1UWFuiQWysVLn2UWr8VgzLDN` | https://buy.stripe.com/fZudRbfy9dXf3I78vhfAc06 | Activo |
| 04 | `prod_VXKZUkKIDUzzVt` | `price_1UWFukQWysVLn2UWOdQlw2rY` · 445 | `plink_1UWFukQWysVLn2UW8E3fwhPu` | https://buy.stripe.com/7sY7sNeu51at1zZ5j5fAc07 | Activo |
| 05 | `prod_VXKZvmCmEcJXIY` | `price_1UWFumQWysVLn2UWofZsg2v5` · 600 | `plink_1UWFumQWysVLn2UWTQkmlFeA` | https://buy.stripe.com/aFa5kFdq1dXf5QfeTFfAc08 | Activo |
| 06 | `prod_VXKZP6D2CubJpQ` | `price_1UWFuoQWysVLn2UWCHo17wkJ` · 800 | `plink_1UWFuoQWysVLn2UWJvFWxD4w` | https://buy.stripe.com/6oU14p2Ln2ex3I7eTFfAc09 | Activo |
| 07 | `prod_VXKWYKVTEneYGR` | `price_1UWFrRQWysVLn2UWwG0BqMPU` · 1050 | `plink_1UWFrSQWysVLn2UWkx0SKN7y` | https://buy.stripe.com/4gM7sN2LncTb2E3cLxfAc01 | Activo |
| 08 | `prod_VXKWE9e5FAXx3v` | `price_1UWFrTQWysVLn2UWXYmBfaBy` · 1350 | `plink_1UWFrTQWysVLn2UWHagSNPyc` | https://buy.stripe.com/aFa3cx99LcTb92r8vhfAc02 | Activo |
| 09 | `prod_VXKWtglFi5PNEv` | `price_1UWFrVQWysVLn2UWIIvD8VGg` · 840 | `plink_1UWFrVQWysVLn2UWf6iJl4Wr` | https://buy.stripe.com/28E00ladPaL3ceD6n9fAc03 | Activo |

Todos los links son **pago único** (ninguno crea suscripción): cantidad fija 1, sin códigos promocionales, dirección de facturación "auto", redirect a `https://ositojur.github.io/portafolio/gracias.html?producto=NN`. El Product usa el nombre y la bajada de `productos.js`.

- **01–06** (anticipo 50 %): Price con apodo "Anticipo 50 % · <nombre>". Texto junto al botón de pago: "Anticipo del 50% para arrancar. Saldo de USD X al terminar." En 02 y 04 se agrega: "La mensualidad de USD 39/79 empieza con la entrega (no se cobra en este pago)."
- **07–09** (anticipo 30 %): Price con apodo "Anticipo 30 % · <nombre>". Texto: "Anticipo del 30% para arrancar (total desde USD X). El saldo se define con el alcance y se abona al terminar."
- Las mensualidades (02, 04, 07) se cobran aparte después de la entrega. No hay ningún Price recurrente creado.

**Dónde verlos en el Dashboard** (modo live, sin "Test mode"):
- Productos y precios: **Product catalog** → buscá por nombre (o filtrá por metadata `lautarodev_id`).
- Links: **Payment Links** (o Product catalog → producto → *Payment links*). Ahí se ve la URL, los pagos y el botón *Deactivate*.
- Pagos recibidos: **Payments** (cada pago muestra de qué Payment Link vino).

Por API (idempotente): `GET /v1/products/search?query=metadata['lautarodev_id']:'NN'`.

### Crear cada Payment Link (Dashboard)

1. **Product catalog → Add product.** Nombre: "Anticipo · <nombre del producto>". En *Metadata* agregá `lautarodev_id` = `NN` (ej. `04`).
2. **Price:** *One-time*, USD, el monto de la columna "Anticipo del link". Nada recurrente.
3. **Payment Links → New**, elegí ese producto, cantidad fija 1.
4. **After payment → Don't show confirmation page → Redirect customers to your website:**
   `https://ositojur.github.io/portafolio/gracias.html?producto=NN`
5. Creá el link y copiá la URL `https://buy.stripe.com/...`.

### Dónde pegar la URL

- En `assets/2027/productos.js`, campo `stripeLink` del producto correspondiente.
- Solo se acepta `https://buy.stripe.com/...` **sin query ni #**. `tienda.js` valida con
  `/^https:\/\/buy\.stripe\.com\/[A-Za-z0-9_\-/]+$/`; si no pasa, avisa en consola y usa el contacto.
- `tienda.js` agrega solo `?locale=es-419` (ES) o `?locale=en` (EN).

### Qué ve el cliente

- **Link vacío:** "Pago online próximamente" + botón de mail (o WhatsApp, cuando haya número en `config.js`) con el mensaje prellenado para pedir cómo abonar el anticipo.
- **Link lleno:** botón "Pagar anticipo · USD X", abre Stripe en la misma pestaña (`rel="noopener"`), y debajo la frase del saldo.

### Páginas de retorno

- `gracias.html?producto=NN` (y `en/gracias.html`): muestra producto, anticipo, saldo, próximos pasos y contacto prellenado. Sin `?producto` o con un ID inválido muestra un texto genérico.
- Un Payment Link tiene **un solo redirect**: va a la gracias en español. Al tocar "Pagar anticipo", `tienda.js` guarda el idioma en `localStorage["ld:lang"]`; si era inglés, `gracias.html` redirige sola a `en/gracias.html?producto=NN`. Además la página tiene un link de idioma que conserva `?producto`.
- Los Payment Links **no tienen URL de cancelación**: el botón de volver de Stripe regresa a la página anterior (la tienda). `pago-cancelado.html` (y `en/pago-cancelado.html`) queda para enlazarse a mano o para la fase futura con Checkout Sessions.

### Cambiar un precio

1. Actualizá `precio` (y si cambia, `anticipoPct`) en `productos.js` y esta tabla.
2. En Stripe creá un **Price nuevo** con el anticipo recalculado (un Price no se puede editar de monto) y un **Payment Link nuevo** con el mismo redirect, el mismo texto y `metadata[lautarodev_id]`. Los links no permiten cambiar el monto de un Price existente: siempre link nuevo.
3. **Desactivá** el link viejo (Payment Links → ... → Deactivate) para que nadie pague el monto anterior, y archivá el Price viejo (Product catalog → producto → precio → *Archive*).
4. Pegá la URL nueva en `stripeLink` y actualizá la tabla "Objetos creados" de esta guía.

### Recibos por mail

Activá **Settings → Customer emails → Successful payments**. Las páginas de gracias dicen "Stripe te manda el comprobante al mail que usaste": si esto está apagado, el texto miente.

### Antes de publicar

Escaneá el repo publicado; tiene que dar vacío:

```
git -C _publico grep -nE "sk_(live|test)_|rk_(live|test)_|whsec_[A-Za-z0-9]"
```

(El `[A-Za-z0-9]` después de `whsec_` evita que el escaneo se encuentre a sí mismo si esta guía o el LEEME se publican.)

### Fase futura

Checkout Sessions creadas por una función serverless (con la clave secreta como variable de entorno del proveedor, nunca en el repo) + webhook `checkout.session.completed` para confirmar el pago del lado del servidor. Eso habilita `cancel_url` (→ `pago-cancelado.html`), redirect según idioma y confirmación real en la página de gracias.
