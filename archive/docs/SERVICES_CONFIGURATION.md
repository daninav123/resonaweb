# 📋 CONFIGURACIÓN DE SERVICIOS EXTERNOS

## 1. SendGrid - Email Service

### Configuración Inicial
1. Crear cuenta en [SendGrid](https://signup.sendgrid.com/)
2. Verificar tu dominio (Settings > Sender Authentication)
3. Crear API Key (Settings > API Keys)
   - Nombre: "ReSona Production"
   - Permisos: Full Access
4. Copiar la API Key a `.env`: `SENDGRID_API_KEY`

### Templates de Email
Crear en SendGrid Dashboard > Email API > Dynamic Templates:

#### Template: Order Confirmation
```html
Subject: Confirmación de Pedido #{{orderNumber}}

Hola {{firstName}},

Tu pedido ha sido confirmado:
- Número de orden: {{orderNumber}}
- Total: €{{total}}
- Fecha de entrega: {{deliveryDate}}

Productos:
{{#each items}}
- {{name}} x{{quantity}} - €{{price}}
{{/each}}

Gracias por confiar en ReSona Events.
```

#### Template: Password Reset
```html
Subject: Restablecer Contraseña - ReSona

Hola {{firstName}},

Haz clic en el siguiente enlace para restablecer tu contraseña:
{{resetLink}}

Este enlace expirará en 1 hora.

Si no solicitaste este cambio, ignora este email.
```

### Código de Integración
```typescript
// backend/src/services/email.service.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const sendOrderConfirmation = async (to: string, data: any) => {
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL!,
    templateId: process.env.SENDGRID_ORDER_CONFIRMATION_TEMPLATE!,
    dynamicTemplateData: data,
  };
  
  await sgMail.send(msg);
};
```

---

## 2. Cloudinary - Image Storage

### Configuración Inicial
1. Crear cuenta en [Cloudinary](https://cloudinary.com/users/register/free)
2. Dashboard > Account Details:
   - Cloud Name → `.env`: `CLOUDINARY_CLOUD_NAME`
   - API Key → `.env`: `CLOUDINARY_API_KEY`
   - API Secret → `.env`: `CLOUDINARY_API_SECRET`

### Upload Presets
1. Settings > Upload > Upload presets
2. Crear preset "resona_products":
   - Unsigned
   - Folder: resona/products
   - Allowed formats: jpg, png, webp
   - Max file size: 5MB
   - Transformations:
     - Thumbnail: w_300,h_300,c_fill
     - Main: w_800,h_600,c_limit
     - Quality: auto

### Código de Integración
```typescript
// backend/src/services/cloudinary.service.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (file: Express.Multer.File) => {
  const result = await cloudinary.uploader.upload(file.path, {
    folder: 'resona/products',
    transformation: [
      { width: 800, height: 600, crop: 'limit' },
      { quality: 'auto' }
    ]
  });
  
  return {
    url: result.secure_url,
    publicId: result.public_id,
    thumbnail: cloudinary.url(result.public_id, {
      width: 300,
      height: 300,
      crop: 'fill'
    })
  };
};
```

---

## 3. Stripe - Payment Processing

### Configuración Inicial
1. Crear cuenta en [Stripe](https://dashboard.stripe.com/register)
2. Dashboard > Developers > API keys:
   - Publishable key → `.env`: `STRIPE_PUBLISHABLE_KEY`
   - Secret key → `.env`: `STRIPE_SECRET_KEY`

### Webhook Configuration
1. Dashboard > Developers > Webhooks
2. Add endpoint:
   - URL: `https://your-domain.com/api/v1/webhooks/stripe`
   - Events:
     - `payment_intent.succeeded`
     - `payment_intent.failed`
     - `checkout.session.completed`
3. Copiar Signing secret → `.env`: `STRIPE_WEBHOOK_SECRET`

### Código de Integración
```typescript
// backend/src/services/stripe.service.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const createPaymentIntent = async (
  amount: number,
  currency: string = 'eur'
) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    metadata: {
      integration_check: 'accept_a_payment',
    },
  });
  
  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
};

// Webhook handler
export const handleStripeWebhook = async (
  signature: string,
  rawBody: string
) => {
  const event = stripe.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      // Update order status to PAID
      break;
    case 'payment_intent.failed':
      // Handle failed payment
      break;
  }
};
```

### Frontend Integration
```typescript
// frontend/src/components/StripeCheckout.tsx
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export const StripeCheckout = ({ amount }: { amount: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      }
    );
    
    if (!error) {
      // Payment successful
    }
  };
  
  return (
    <Elements stripe={stripePromise}>
      <form onSubmit={handleSubmit}>
        <CardElement />
        <button type="submit" disabled={!stripe}>
          Pagar €{amount}
        </button>
      </form>
    </Elements>
  );
};
```

---

## 4. Google Analytics

### Configuración
1. Crear cuenta en [Google Analytics](https://analytics.google.com/)
2. Crear propiedad para resona.com
3. Obtener Measurement ID (G-XXXXXXXXXX)
4. Añadir a `.env`: `GOOGLE_ANALYTICS_ID`

### Integración Frontend
```typescript
// frontend/index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 5. Verificación de Servicios

### Script de Verificación
```bash
# backend/scripts/verify-services.ts
import 'dotenv/config';

const verifyServices = async () => {
  console.log('🔍 Verificando servicios externos...\n');
  
  // SendGrid
  if (process.env.SENDGRID_API_KEY) {
    console.log('✅ SendGrid configurado');
  } else {
    console.log('❌ SendGrid: Falta API key');
  }
  
  // Cloudinary
  if (process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_SECRET) {
    console.log('✅ Cloudinary configurado');
  } else {
    console.log('❌ Cloudinary: Faltan credenciales');
  }
  
  // Stripe
  if (process.env.STRIPE_SECRET_KEY && 
      process.env.STRIPE_WEBHOOK_SECRET) {
    console.log('✅ Stripe configurado');
  } else {
    console.log('❌ Stripe: Faltan credenciales');
  }
  
  console.log('\n📋 Resumen:');
  console.log('- Email: ' + (process.env.SENDGRID_API_KEY ? '✅' : '❌'));
  console.log('- Storage: ' + (process.env.CLOUDINARY_API_KEY ? '✅' : '❌'));
  console.log('- Payments: ' + (process.env.STRIPE_SECRET_KEY ? '✅' : '❌'));
};

verifyServices();
```

### Ejecutar Verificación
```bash
cd packages/backend
npx tsx scripts/verify-services.ts
```

---

## 6. Troubleshooting

### SendGrid
- **Error 401**: API Key inválida
- **Error 403**: Dominio no verificado
- **Emails no llegan**: Revisar spam, verificar dominio SPF/DKIM

### Cloudinary
- **Upload fails**: Verificar límites de cuenta gratuita
- **Images not showing**: Check CORS settings
- **Transformation errors**: Verificar preset configuration

### Stripe
- **Webhook 400**: Signature mismatch - verificar endpoint URL
- **Payment fails**: Verificar modo test/live
- **3D Secure**: Implementar confirmación adicional

---

## 📝 Checklist de Producción

- [ ] SendGrid: Dominio verificado con SPF/DKIM
- [ ] SendGrid: Templates creados y testeados
- [ ] Cloudinary: Presets configurados
- [ ] Cloudinary: Backup strategy definida
- [ ] Stripe: Cuenta en modo producción
- [ ] Stripe: Webhook HTTPS configurado
- [ ] Todas las API keys en variables de entorno
- [ ] No hay keys hardcodeadas en el código
- [ ] Logs configurados para tracking de errores
- [ ] Monitoring de servicios activo

---

_Última actualización: 18/11/2025_
