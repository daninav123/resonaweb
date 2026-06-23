# 📈 Publicidad y tracking de conversiones (Google Ads + Meta)

Guía para dejar **resonarent.com** y **resonaevents.com** listas para anunciar en
Google Ads y Meta (Facebook/Instagram) midiendo conversiones reales (ventas y leads).

> El código ya está implementado. Lo único que falta es **crear las cuentas/etiquetas
> y pegar unos IDs**. Esta guía explica dónde sacar cada ID y dónde pegarlo. No hace
> falta tocar código.

---

## 1. Qué mide cada web (ya implementado)

| Web | Conversión | Cuándo se dispara |
|-----|-----------|-------------------|
| Rent | **Compra** (`purchase`) | Página de pago completado (valor = total de la reserva) |
| Events | **Compra** (`purchase`) | Página "reserva confirmada" (señal pagada) |
| Events | **Lead** (`generate_lead`) | Envío del brief (valor = presupuesto estimado) |
| Ambas | **Lead** (`generate_lead`) | Envío del formulario de contacto |

Cada conversión se envía a la vez a **Google Analytics 4**, **Google Ads** y **Meta Pixel**
(estas dos últimas solo si has configurado sus IDs).

Google Analytics 4 (`G-4F522M345Z`) ya funciona sin configurar nada más.

---

## 2. Consentimiento de cookies (RGPD) — ya implementado

- Por defecto, todo el tracking de marketing está **denegado** hasta que el usuario
  acepta cookies (Consent Mode v2 de Google).
- Google Ads: si el usuario no acepta marketing, la conversión se registra de forma
  *modelada* (sin cookies).
- Meta Pixel: **solo se carga** si el usuario acepta cookies de marketing.

No hay que hacer nada aquí; queda documentado para auditorías.

---

## 3. Configurar Google Ads (paso a paso)

1. Entra en [Google Ads](https://ads.google.com/) con la cuenta del negocio.
2. Menú **Objetivos → Conversiones → + Acción de conversión → Sitio web**.
3. Crea **dos** acciones de conversión por cada web (o reutiliza entre webs si lo
   prefieres): una de tipo **Compra/Venta** y otra de tipo **Cliente potencial (Lead)**.
4. Al terminar, elige **"Etiqueta de Google" / configuración manual**. Verás un
   fragmento parecido a:

   ```js
   gtag('event', 'conversion', { 'send_to': 'AW-123456789/AbC-D_efGhIjKlMnOp' });
   ```

   - `AW-123456789` → es el **ID de conversión**.
   - `AbC-D_efGhIjKlMnOp` → es la **etiqueta (label)** de esa acción concreta.

5. Pega esos valores en el archivo `.env` de cada web (ver sección 5):
   - `VITE_GOOGLE_ADS_ID` = el `AW-...`
   - `VITE_GOOGLE_ADS_PURCHASE_LABEL` = el label de la acción de **compra**
   - `VITE_GOOGLE_ADS_LEAD_LABEL` = el label de la acción de **lead**

---

## 4. Configurar Meta Pixel (Facebook/Instagram) (paso a paso)

1. Entra en [Meta Events Manager](https://business.facebook.com/events_manager2/).
2. **Conectar orígenes de datos → Web → Meta Pixel → Conectar**.
3. Ponle nombre y copia el **ID del pixel** (un número largo, p. ej. `123456789012345`).
4. Pega ese número en `VITE_META_PIXEL_ID` del `.env` de cada web.

El código ya envía los eventos estándar `PageView`, `Purchase` y `Lead`.

---

## 5. Dónde pegar los IDs

Crea un archivo `.env` (copiando el `.env.example`) en cada app:

- `apps/rent/.env`
- `apps/events/.env`

Contenido:

```env
VITE_GOOGLE_ADS_ID="AW-123456789"
VITE_GOOGLE_ADS_PURCHASE_LABEL="AbC-D_efGhIjKlMnOp"
VITE_GOOGLE_ADS_LEAD_LABEL="XyZ-1_2345aBcDeFg"
VITE_META_PIXEL_ID="123456789012345"
```

> Si dejas una variable vacía, esa plataforma simplemente no recibe eventos (sin errores).
> Tras editar el `.env` hay que **volver a hacer build/deploy** de la web (las variables
> `VITE_` se incrustan en tiempo de compilación, no en runtime).

---

## 6. Cómo verificar que funciona

- **Google**: instala la extensión *Google Tag Assistant* y navega la web aceptando
  cookies; comprueba que se disparan `purchase` / `generate_lead` y la conversión de Ads.
- **Meta**: extensión *Meta Pixel Helper*; debe detectar el pixel y los eventos
  `PageView`, `Purchase`, `Lead`.
- En **GA4 → Tiempo real** verás los eventos sin necesidad de extensiones.

---

## 7. Limitaciones conocidas

- La conversión de **señal pagada de Events** (`reserva-confirmada`) se registra **sin
  importe**, porque la URL solo trae el id de sesión de Stripe. Para enviar el valor
  real habría que consultarlo al backend en esa página. Pendiente si se quiere ROAS exacto.

---

## Referencias de código

- [packages/utils/src/analytics.ts](../packages/utils/src/analytics.ts) — `trackPurchase`, `trackLead`, `initGoogleAds`, `initMetaPixel`.
- `apps/{rent,events}/index.html` — carga de gtag + Consent Mode v2.
- `apps/rent/src/components/CookieBanner.tsx` · `apps/events/src/components/CookieConsent.tsx` — consentimiento.
