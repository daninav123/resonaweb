# Atribución de contactos directos (WhatsApp / teléfono / email)

## Por qué existe

El canal real de captación de Resona es WhatsApp, no los formularios. En la BD de
producción hay 0 `Order` y 0 `QuoteRequest` desde mayo de 2026, y apenas un puñado de
`ContactMessage` reales — mientras Google Ads reporta decenas de "conversiones", que en
realidad son **clics en los enlaces de WhatsApp y teléfono**, no solicitudes recibidas.

WhatsApp no envía ninguna metadata de origen: al móvil llega un número y un texto. Sin
una marca en el propio mensaje es imposible saber si una conversación viene de
`resonarent.com` o de `resonaevents.com`, ni de qué página o anuncio salió.

## Cómo funciona

1. Al pulsar un enlace de contacto se genera un código corto: `R-SON-4f2`
   (inicial de la app · tres letras de la sección · sufijo aleatorio).
2. El código se incrusta en el texto prellenado: `Hola, quería pedir presupuesto. (ref. R-SON-4f2)`.
3. En paralelo se envía un `POST /api/v1/lead-clicks` con app, sección, ruta, canal,
   referrer, UTMs, `gclid` y dispositivo.
4. Al llegar la conversación, se busca el código y se recupera el origen exacto.

El envío es **best-effort a propósito**: el `href` apunta directo a `wa.me` y el registro
sale con `sendBeacon`. Si el backend está frío (Render) o caído, el lead pasa igual — no
hay redirección intermedia que pueda bloquear la salida hacia WhatsApp.

En el canal `telefono` el código no puede viajar (una llamada no lleva texto): el clic
queda registrado para el agregado, pero esa conversación no se puede casar una a una.

## Piezas

| Pieza | Ruta |
|---|---|
| Lógica pura (código, beacon, URLs) | [packages/utils/src/leadTracking.ts](../packages/utils/src/leadTracking.ts) |
| Hooks de React | [packages/ui/src/useLeadLink.ts](../packages/ui/src/useLeadLink.ts) |
| Endpoint y consultas | [packages/backend/src/controllers/leadClick.controller.ts](../packages/backend/src/controllers/leadClick.controller.ts) |
| Modelo `LeadClick` | `packages/backend/prisma/schema.prisma` (tabla `lead_clicks`) |

## Uso

Enlace fijo dentro de una página concreta:

```tsx
const whatsapp = useLeadLink({
  app: 'events', section: 'bodas', channel: 'whatsapp',
  phone: '34613881414', message: 'Hola, nos casamos y queríamos pedir propuesta',
});

<a {...whatsapp}>WhatsApp</a>
```

Elementos globales (cabecera, pie, botón flotante), donde la sección solo se conoce al
pulsar porque el componente vive en todas las páginas:

```tsx
const whatsapp = useGlobalWhatsApp('events', '34613881414', 'Hola, me gustaría organizar un evento');
```

## Formularios: el origen va en el propio correo

Ambas apps postean al mismo `POST /api/v1/contact` y hasta 2026-08-06 los correos de Rent
y de Events llegaban idénticos al mismo buzón. Ahora las dos envían `app` y `sourcePath`, y
el aviso al equipo lleva:

- **Asunto**: `📨 [RENT] Alquiler altavoces` — se distingue sin abrirlo.
- **Cuerpo**: un bloque `🌐 Origen` con `resonarent.com · /catalogo/sonido`.
- **`ContactMessage.metadata`**: `app` y `sourcePath` (campo `Json` ya existente).

## Consultar el origen

- `GET /api/v1/lead-clicks/ref/:ref` — origen de una conversación concreta (admin).
- `GET /api/v1/lead-clicks?app=rent&from=2026-08-01` — listado y agregado por sección (admin).

## Límites conocidos

- Si la persona borra el texto prellenado antes de enviar, se pierde el código. El clic
  sigue contando en el agregado.
- El agregado cuenta **clics**, no conversaciones. Contrastarlo con los mensajes que
  llegan de verdad es justamente lo que permite saber cuánto inflan las conversiones
  que reporta Google Ads.
- Las páginas `HomePageV2`–`V14` son maquetas internas y no están instrumentadas.
