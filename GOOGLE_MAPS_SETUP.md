# 🗺️ Configuración de Google Maps API

## 📋 GUÍA PASO A PASO

### 1️⃣ Crear Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea una cuenta si no tienes (puede requerir tarjeta, pero tiene $300 de crédito gratis)
3. Crea un nuevo proyecto o selecciona uno existente

### 2️⃣ Habilitar APIs Necesarias

Ve a **APIs & Services > Library** y habilita:

- ✅ **Maps JavaScript API**
- ✅ **Places API**
- ✅ **Distance Matrix API**
- ✅ **Geocoding API** (opcional, para mejorar precisión)

### 3️⃣ Crear API Key

1. Ve a **APIs & Services > Credentials**
2. Click en **+ CREATE CREDENTIALS**
3. Selecciona **API key**
4. Copia la API key generada

### 4️⃣ Configurar Restricciones (IMPORTANTE)

**Para desarrollo:**
1. Click en tu API key
2. En "Application restrictions" selecciona **HTTP referrers**
3. Añade:
   ```
   localhost:3000/*
   127.0.0.1:3000/*
   ```

**Para producción:**
1. Añade tu dominio:
   ```
   https://tudominio.com/*
   ```

**API restrictions:**
- Selecciona "Restrict key"
- Marca solo las APIs que habilitaste arriba

### 5️⃣ Configurar en el Proyecto

1. Copia el archivo `.env.example` a `.env`:
   ```bash
   cd packages/frontend
   copy .env.example .env
   ```

2. Edita `.env` y añade tu API key:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=TU_API_KEY_AQUI
   ```

3. Reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

### 6️⃣ Verificar Instalación

1. Ve al carrito con productos: `http://localhost:3000/carrito`
2. En el resumen, deberías ver el campo "Dirección de entrega"
3. Empieza a escribir una dirección
4. Debería aparecer el autocompletado de Google
5. Al seleccionar, se calculará la distancia automáticamente

---

## 🎯 FUNCIONALIDADES IMPLEMENTADAS

### ✅ Frontend (Carrito)
- Campo de autocompletado de direcciones
- Restricción a España
- Cálculo automático de distancia
- Opción de entrada manual
- Indicador visual de zona (Local, Regional, Ampliada, Personalizada)
- Aplicación automática de mínimos

### ✅ Backend
- Endpoint para obtener configuración
- Endpoint para actualizar configuración (Admin)
- Endpoint para calcular coste por distancia
- Aplicación de mínimos configurables

### ✅ Panel de Admin
- Página de configuración: `/admin/shipping-config`
- Editar tarifas por zona
- Configurar mínimos
- Ver ejemplos en tiempo real

---

## 💰 COSTES DE GOOGLE MAPS

**Crédito gratuito:**
- $300 USD de crédito al registrarte (válido 90 días)
- $200 USD mensuales de crédito recurrente

**Precios por cada 1000 llamadas:**
- Autocomplete: $2.83 USD
- Distance Matrix: $5 USD
- Geocoding: $5 USD

**Ejemplo de uso mensual:**
```
1000 pedidos/mes × 2 llamadas = 2000 llamadas
- Autocomplete: 2000 × $0.00283 = $5.66
- Distance Matrix: 2000 × $0.005 = $10

Total mensual: ~$16
Menos crédito gratis: $200 - $16 = GRATIS
```

**💡 Consejo:** Con el crédito mensual de $200, puedes procesar hasta **12,500 pedidos/mes GRATIS**

---

## 🔧 TROUBLESHOOTING

### Error: "API key no configurada"
- Verifica que el archivo `.env` existe en `packages/frontend/`
- Verifica que la variable es `VITE_GOOGLE_MAPS_API_KEY` (con el prefijo VITE_)
- Reinicia el servidor de desarrollo

### Error: "This API project is not authorized to use this API"
- Ve a Google Cloud Console
- Habilita las APIs necesarias (ver paso 2)
- Espera 1-2 minutos para que se propague

### El autocompletado no funciona
- Verifica las restricciones de la API key
- Revisa la consola del navegador (F12) para ver errores
- Verifica que Places API está habilitada

### "Google is not defined"
- El script de Google Maps puede tardar en cargar
- Refresca la página
- Verifica tu conexión a internet

---

## 🎨 PERSONALIZACIÓN

### Cambiar país de búsqueda
En `AddressAutocomplete.tsx`:
```typescript
componentRestrictions: { country: 'es' }, // Cambiar 'es' por tu código
```

### Cambiar dirección base
En `CartPage.tsx`:
```typescript
<AddressAutocomplete 
  baseAddress="Tu Ciudad, País"  // Cambiar aquí
/>
```

En `ShippingConfigPage.tsx`:
- Edita el campo "Dirección Base"

---

## 📞 SOPORTE

Si tienes problemas:
1. Revisa los logs del navegador (F12 > Console)
2. Verifica que todas las APIs están habilitadas
3. Verifica las restricciones de tu API key
4. Consulta la [documentación oficial](https://developers.google.com/maps/documentation)

---

**¡Listo para usar! 🚀**
