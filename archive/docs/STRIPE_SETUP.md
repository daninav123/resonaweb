# 💳 Configuración de Stripe - ReSona Events

**Guía completa para integrar Stripe en el sistema de pagos**

---

## 📋 ÍNDICE

1. [Requisitos Previos](#requisitos-previos)
2. [Obtener Claves de Stripe](#obtener-claves-de-stripe)
3. [Configurar Backend](#configurar-backend)
4. [Configurar Frontend](#configurar-frontend)
5. [Configurar Webhooks](#configurar-webhooks)
6. [Probar en Desarrollo](#probar-en-desarrollo)
7. [Desplegar a Producción](#desplegar-a-producción)
8. [Solución de Problemas](#solución-de-problemas)

---

## 1️⃣ REQUISITOS PREVIOS

✅ Cuenta en Stripe (https://stripe.com)  
✅ Backend corriendo en puerto 3001  
✅ Frontend corriendo en puerto 3000  
✅ Base de datos actualizada con migraciones

---

## 2️⃣ OBTENER CLAVES DE STRIPE

### Paso 1: Crear cuenta en Stripe

1. Ve a https://stripe.com y regístrate
2. Completa la verificación de tu cuenta
3. Activa el modo de pruebas (Test Mode)

### Paso 2: Obtener API Keys

1. En el dashboard de Stripe, ve a **Developers → API keys**
2. Verás dos claves:
   - **Publishable key** (comienza con `pk_test_...`)
   - **Secret key** (comienza con `sk_test_...`)

📝 **IMPORTANTE**: NUNCA compartas tu Secret Key públicamente

### Paso 3: Copiar las claves

```
Publishable key: pk_test_51xxxxxxxxxxxxxxxxxxxxx
Secret key: sk_test_51xxxxxxxxxxxxxxxxxxxxx
```

---

## 3️⃣ CONFIGURAR BACKEND

### Actualizar archivo `.env`

Abre `packages/backend/.env` y añade:

```env
# Stripe Payment Gateway
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

### Reiniciar el servidor backend

```bash
cd packages/backend
npm run dev
```

Deberías ver en la consola:
```
✅ Stripe service initialized
```

---

## 4️⃣ CONFIGURAR FRONTEND

### Verificar instalación

Las dependencias ya están instaladas:
- ✅ `@stripe/stripe-js`
- ✅ `@stripe/react-stripe-js`
- ✅ `canvas-confetti`

### Configuración automática

El frontend obtiene automáticamente la configuración del backend a través del endpoint:
```
GET /api/v1/payment/config
```

No necesitas configurar nada manualmente en el frontend.

---

## 5️⃣ CONFIGURAR WEBHOOKS

Los webhooks permiten que Stripe notifique a tu backend sobre eventos de pago.

### En Desarrollo (Local)

#### Opción 1: Usar Stripe CLI (Recomendado)

1. Instalar Stripe CLI:
   ```bash
   # Windows (con Scoop)
   scoop install stripe
   
   # O descarga desde: https://stripe.com/docs/stripe-cli
   ```

2. Login en Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks a tu localhost:
   ```bash
   stripe listen --forward-to localhost:3001/api/v1/payment/webhook
   ```

4. Copia el **webhook secret** que aparece (comienza con `whsec_...`)

5. Añade el secret a tu `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
   ```

#### Opción 2: Usar ngrok (Alternativa)

Si no quieres usar Stripe CLI:

1. Instala ngrok: https://ngrok.com
2. Ejecuta: `ngrok http 3001`
3. Copia la URL pública (ej: `https://abc123.ngrok.io`)
4. En Stripe Dashboard → Webhooks → Add endpoint
5. URL: `https://abc123.ngrok.io/api/v1/payment/webhook`

### En Producción

1. Ve a **Stripe Dashboard → Developers → Webhooks**
2. Click en **Add endpoint**
3. URL del webhook: `https://tu-dominio.com/api/v1/payment/webhook`
4. Selecciona estos eventos:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `payment_intent.canceled`
   - ✅ `charge.refunded`
   - ✅ `charge.dispute.created`
5. Copia el **Signing secret**
6. Añádelo a las variables de entorno de producción

---

## 6️⃣ PROBAR EN DESARROLLO

### Tarjetas de Prueba de Stripe

Usa estas tarjetas para probar diferentes escenarios:

#### ✅ Pago Exitoso
```
Número: 4242 4242 4242 4242
Fecha: Cualquier fecha futura (ej: 12/25)
CVC: Cualquier 3 dígitos (ej: 123)
```

#### ❌ Pago Rechazado
```
Número: 4000 0000 0000 0002
```

#### ⚠️ Requiere Autenticación
```
Número: 4000 0025 0000 3155
```

#### 💰 Fondos Insuficientes
```
Número: 4000 0000 0000 9995
```

### Flujo Completo de Prueba

1. **Crear un pedido:**
   - Login en http://localhost:3000
   - Añade productos al carrito
   - Procede al checkout
   - Completa la información del pedido

2. **Ir al checkout de Stripe:**
   - Después de crear el pedido, serás redirigido a `/checkout/stripe?orderId=xxx`
   - O puedes ir manualmente con el ID del pedido

3. **Realizar el pago:**
   - Usa una tarjeta de prueba (ej: 4242 4242 4242 4242)
   - Completa el formulario
   - Click en "Pagar"

4. **Verificar:**
   - Deberías ver la página de éxito
   - Revisa el webhook en la terminal
   - Verifica el estado del pedido en `/admin/orders`

---

## 7️⃣ DESPLEGAR A PRODUCCIÓN

### Checklist Pre-Producción

- [ ] Cambiar a claves de producción en Stripe
- [ ] Configurar webhook de producción
- [ ] Actualizar STRIPE_SECRET_KEY en servidor
- [ ] Actualizar STRIPE_PUBLISHABLE_KEY en servidor
- [ ] Actualizar STRIPE_WEBHOOK_SECRET en servidor
- [ ] Probar con tarjetas reales en pequeñas cantidades
- [ ] Configurar alertas de Stripe
- [ ] Revisar configuración de reembolsos
- [ ] Habilitar logs de auditoría

### Claves de Producción

1. En Stripe Dashboard, desactiva el **Test Mode**
2. Ve a **Developers → API keys**
3. Copia las claves de producción (comienzan con `pk_live_...` y `sk_live_...`)
4. Actualiza las variables de entorno en tu servidor

### Variables de Entorno en Producción

```env
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

---

## 8️⃣ SOLUCIÓN DE PROBLEMAS

### ❌ Error: "Stripe secret key not configured"

**Causa**: La variable `STRIPE_SECRET_KEY` no está configurada

**Solución**:
1. Verifica que existe en `.env`
2. Reinicia el servidor backend
3. Verifica que no haya espacios extra en la clave

### ❌ Error: "Webhook signature verification failed"

**Causa**: El `STRIPE_WEBHOOK_SECRET` es incorrecto

**Solución**:
1. Si usas Stripe CLI, copia el secret que aparece al ejecutar `stripe listen`
2. Si usas webhook manual, copia el secret desde el dashboard
3. Actualiza `.env` y reinicia el servidor

### ❌ Error: "Payment intent not found"

**Causa**: El pedido no tiene un payment intent asociado

**Solución**:
1. Verifica que el pedido existe
2. Intenta crear un nuevo payment intent para el pedido
3. Revisa los logs del backend para más detalles

### ❌ La página de checkout no carga

**Causa**: Problema con las claves de Stripe o la red

**Solución**:
1. Abre la consola del navegador (F12)
2. Busca errores en la pestaña Console
3. Verifica que el endpoint `/api/v1/payment/config` responde correctamente
4. Verifica tu conexión a internet

### ❌ El webhook no se ejecuta

**Causa**: Stripe CLI no está corriendo o URL incorrecta

**Solución**:
1. Verifica que `stripe listen` esté corriendo
2. Verifica que el puerto sea el correcto (3001)
3. Revisa los logs del backend
4. Prueba manualmente el webhook desde el dashboard de Stripe

---

## 📊 MONITOREO Y LOGS

### Ver Logs de Stripe

En el backend verás logs como:
```
✅ Stripe service initialized
📝 Payment Intent created: pi_xxx for order ORD-001
✅ Payment succeeded for order ORD-001
📧 Confirmation email sent
```

### Dashboard de Stripe

Monitorea tus pagos en:
- **Payments**: Ver todos los pagos
- **Events**: Ver todos los eventos y webhooks
- **Logs**: Ver logs de API
- **Disputes**: Gestionar disputas

---

## 🎯 ENDPOINTS DISPONIBLES

### Backend Endpoints

```
GET  /api/v1/payment/config
     → Obtener configuración pública de Stripe

POST /api/v1/payment/create-intent
     → Crear Payment Intent para un pedido
     Body: { orderId: string }

POST /api/v1/payment/confirm
     → Confirmar pago manualmente
     Body: { paymentIntentId: string }

POST /api/v1/payment/cancel
     → Cancelar Payment Intent
     Body: { paymentIntentId: string }

GET  /api/v1/payment/details/:paymentIntentId
     → Obtener detalles de un pago

POST /api/v1/payment/refund (Admin)
     → Procesar reembolso
     Body: { orderId: string, amount?: number, reason?: string }

POST /api/v1/payment/webhook
     → Webhook de Stripe (POST automático de Stripe)
```

### Frontend Routes

```
/checkout/stripe?orderId=xxx
  → Checkout con Stripe Elements

/checkout/success?orderId=xxx
  → Página de pago exitoso

/checkout/error?orderId=xxx&error=mensaje
  → Página de error en el pago
```

---

## 🔐 SEGURIDAD

### Mejores Prácticas

✅ Nunca expongas las Secret Keys en el frontend  
✅ Usa HTTPS en producción  
✅ Valida webhooks con la firma de Stripe  
✅ Implementa límites de reintentos  
✅ Log todos los eventos de pago  
✅ Monitorea transacciones sospechosas  
✅ Implementa 3D Secure para mayor seguridad  

---

## 📚 RECURSOS ADICIONALES

- [Documentación de Stripe](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Webhook Events](https://stripe.com/docs/webhooks)
- [Payment Intents API](https://stripe.com/docs/payments/payment-intents)
- [Stripe Dashboard](https://dashboard.stripe.com)

---

## ✅ CHECKLIST FINAL

Antes de considerar completada la integración:

- [ ] Backend configurado con claves de Stripe
- [ ] Frontend cargando correctamente Stripe Elements
- [ ] Webhook configurado y funcionando
- [ ] Probado con tarjetas de prueba exitosas
- [ ] Probado con tarjetas de prueba fallidas
- [ ] Página de éxito funcionando
- [ ] Página de error funcionando
- [ ] Emails de confirmación enviándose
- [ ] Facturas generándose automáticamente
- [ ] Admin puede ver pagos en dashboard
- [ ] Reembolsos funcionando (admin)
- [ ] Logs de auditoría activos

---

**🎉 ¡Sistema de Pagos con Stripe Completamente Implementado!**

**Desarrollado con ❤️ por el equipo ReSona Events**

**Última actualización**: 18/11/2025 04:10 AM
