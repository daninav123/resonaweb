# 📧 Configuración Email Profesional @resonaevents.com

**Fecha:** 15 Diciembre 2025  
**Emails a configurar:**
- info@resonaevents.com
- resonaevents@resonaevents.com

---

## 🎯 SOLUCIÓN RECOMENDADA: Zoho Mail (GRATIS)

**Por qué Zoho:**
- ✅ GRATIS hasta 5 usuarios
- ✅ 5 GB por usuario
- ✅ Compatible 100% con Mail iOS
- ✅ Sin publicidad
- ✅ Profesional y confiable
- ✅ Excelente antispam

**Alternativa:** Google Workspace (6€/mes/usuario) - Si prefieres Gmail

---

## 📋 PASO A PASO: Configurar Zoho Mail

### **FASE 1: Crear Cuenta en Zoho (10 min)**

1. **Ve a:** https://www.zoho.com/es-xl/mail/zohomail-pricing.html

2. **Click en:** "Probar GRATIS" (plan Forever Free - hasta 5 usuarios)

3. **Registrarse:**
   ```
   Email: [tu email personal actual]
   Password: [contraseña segura]
   Nombre: Daniel Navarro
   Empresa: ReSona Events
   Tamaño empresa: 1-5 empleados
   ```

4. **Confirmar email** (revisa bandeja de entrada)

---

### **FASE 2: Añadir Tu Dominio (5 min)**

1. **En Zoho Control Panel:**
   - Click "Add Domain"
   - Introduce: `resonaevents.com`
   - Click "Add"

2. **Selecciona método de verificación:**
   - Recomendado: **TXT Record** (más fácil)
   - Alternativa: HTML File Upload

3. **Zoho te dará un código de verificación:**
   ```
   Ejemplo: zb12345678
   ```
   **GUARDA ESTE CÓDIGO** - Lo necesitas en el siguiente paso

---

### **FASE 3: Verificar Dominio con DNS (15 min)**

#### **A. Obtén acceso a tu DNS**

**¿Dónde está tu dominio registrado?**

Si no sabes, busca en tu email "resonaevents.com registration" o "domain registration".

**Proveedores comunes:**

##### **1. GoDaddy**
- Ve a: https://dcc.godaddy.com/manage/
- DNS → Manage Zones → resonaevents.com
- Add → TXT Record

##### **2. Namecheap**
- Ve a: https://ap.www.namecheap.com/domains/list/
- Manage → Advanced DNS
- Add New Record → TXT Record

##### **3. Cloudflare**
- Ve a: https://dash.cloudflare.com
- resonaevents.com → DNS → Records
- Add record → TXT

##### **4. Hostinger**
- Ve a: https://hpanel.hostinger.com
- Domains → Manage → DNS / Name Servers
- Add Record → TXT

##### **5. Google Domains / Squarespace**
- Ve a: https://domains.google.com/registrar
- resonaevents.com → DNS
- Custom records → Create new record → TXT

---

#### **B. Añade el Registro TXT de Verificación**

**En tu panel DNS, añade:**

```
Tipo: TXT
Host: @ (o resonaevents.com, o déjalo vacío)
Valor: zb12345678 (el código que te dio Zoho)
TTL: 3600 (o Auto, o Default)
```

**Ejemplo visual:**
```
┌──────────┬─────────────────────┬──────────────────┬──────┐
│ Tipo     │ Host                │ Valor            │ TTL  │
├──────────┼─────────────────────┼──────────────────┼──────┤
│ TXT      │ @                   │ zb12345678       │ 3600 │
└──────────┴─────────────────────┴──────────────────┴──────┘
```

**Guarda los cambios.**

---

#### **C. Espera y Verifica (10-60 min)**

1. **Vuelve a Zoho Control Panel**
2. **Click:** "Verify" o "Check Verification"
3. **Si aparece error:**
   - Espera 10-30 minutos más
   - Los DNS tardan en propagarse
   - Reintenta

**Cuando funcione:**
```
✅ Domain Verified Successfully
```

---

### **FASE 4: Configurar Registros MX (15 min)**

**Los registros MX indican dónde recibir emails.**

#### **A. Elimina MX Records Antiguos (Importante)**

En tu panel DNS:
1. **Busca registros tipo "MX"**
2. **Elimina TODOS los existentes** (si los hay)
3. **Guarda cambios**

**Por qué:** Solo puede haber un servidor de correo.

---

#### **B. Añade los MX de Zoho**

**Zoho te dará estos registros:**

```
Prioridad 10: mx.zoho.com
Prioridad 20: mx2.zoho.com
Prioridad 50: mx3.zoho.com
```

**En tu panel DNS, añade 3 registros MX:**

**MX Record 1:**
```
Tipo: MX
Host: @ (o resonaevents.com, o déjalo vacío)
Valor: mx.zoho.com
Prioridad: 10
TTL: 3600
```

**MX Record 2:**
```
Tipo: MX
Host: @ (o resonaevents.com, o déjalo vacío)
Valor: mx2.zoho.com
Prioridad: 20
TTL: 3600
```

**MX Record 3:**
```
Tipo: MX
Host: @ (o resonaevents.com, o déjalo vacío)
Valor: mx3.zoho.com
Prioridad: 50
TTL: 3600
```

**Ejemplo visual:**
```
┌──────┬──────────────────┬──────────────────┬───────────┬──────┐
│ Tipo │ Host             │ Valor            │ Prioridad │ TTL  │
├──────┼──────────────────┼──────────────────┼───────────┼──────┤
│ MX   │ @                │ mx.zoho.com      │ 10        │ 3600 │
│ MX   │ @                │ mx2.zoho.com     │ 20        │ 3600 │
│ MX   │ @                │ mx3.zoho.com     │ 50        │ 3600 │
└──────┴──────────────────┴──────────────────┴───────────┴──────┘
```

**Guarda los cambios.**

---

#### **C. Configurar SPF y DKIM (Opcional pero Recomendado)**

**Para evitar que tus emails vayan a spam:**

##### **1. SPF Record (TXT)**

```
Tipo: TXT
Host: @ (o resonaevents.com)
Valor: v=spf1 include:zoho.com ~all
TTL: 3600
```

##### **2. DKIM Record (TXT)**

**Zoho te dará algo como:**
```
Host: zoho._domainkey
Valor: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNA...
```

**Añádelo exactamente como te lo da Zoho.**

---

### **FASE 5: Crear Cuentas de Email (5 min)**

1. **En Zoho Control Panel:**
   - Email Accounts → Add User

2. **Crear primera cuenta:**
   ```
   Email: info@resonaevents.com
   Nombre: ReSona Events Info
   Password: [contraseña segura - guárdala]
   ```

3. **Crear segunda cuenta:**
   ```
   Email: resonaevents@resonaevents.com
   Nombre: ReSona Events
   Password: [contraseña segura - guárdala]
   ```

4. **Click:** "Add User"

**Resultado:**
```
✅ info@resonaevents.com creado
✅ resonaevents@resonaevents.com creado
```

---

### **FASE 6: Configurar en Mail de iOS (10 min)**

#### **A. Obtener Configuración IMAP/SMTP**

**Configuración de Zoho Mail:**

**IMAP (Recibir emails):**
```
Servidor: imap.zoho.com
Puerto: 993
Seguridad: SSL/TLS
Usuario: info@resonaevents.com (email completo)
Contraseña: [tu contraseña]
```

**SMTP (Enviar emails):**
```
Servidor: smtp.zoho.com
Puerto: 465
Seguridad: SSL/TLS
Usuario: info@resonaevents.com (email completo)
Contraseña: [tu contraseña]
```

---

#### **B. Añadir Cuenta en iPhone/iPad**

**Pasos en iOS:**

1. **Abre:** Ajustes (Settings)

2. **Ve a:** Mail → Cuentas → Añadir cuenta

3. **Selecciona:** "Otra" (Other)

4. **Click:** "Añadir cuenta de Mail"

5. **Rellena:**
   ```
   Nombre: ReSona Events
   Email: info@resonaevents.com
   Contraseña: [tu contraseña]
   Descripción: ReSona Info
   ```

6. **Click:** Siguiente (Next)

7. **Selecciona:** IMAP (no POP)

8. **SERVIDOR DE RECEPCIÓN (IMAP):**
   ```
   Nombre del host: imap.zoho.com
   Nombre de usuario: info@resonaevents.com
   Contraseña: [tu contraseña]
   ```

9. **SERVIDOR DE ENVÍO (SMTP):**
   ```
   Nombre del host: smtp.zoho.com
   Nombre de usuario: info@resonaevents.com
   Contraseña: [tu contraseña]
   ```

10. **Click:** Siguiente → Guardar

**Resultado:**
```
✅ Cuenta añadida
✅ Sincronizando emails
```

---

#### **C. Repite para Segunda Cuenta**

Repite los pasos 1-10 con:
```
Email: resonaevents@resonaevents.com
Descripción: ReSona Principal
```

---

### **FASE 7: Configurar Ajustes Avanzados (Opcional)**

#### **En iPhone → Ajustes → Mail:**

1. **Cuenta por defecto:**
   - Selecciona: info@resonaevents.com (o la que prefieras)

2. **Firma:**
   ```
   --
   ReSona Events Valencia
   Alquiler de Sonido, Iluminación y Audiovisuales
   📧 info@resonaevents.com
   📱 613 88 14 14
   🌐 resonaevents.com
   ```

3. **Notificaciones:**
   - Activa push notifications
   - Configura sonidos

---

## 🧪 FASE 8: Probar que Funciona (5 min)

### **Test 1: Enviar Email**

1. **Abre Mail en iPhone**
2. **Nuevo mensaje**
3. **Para:** tu email personal
4. **Asunto:** "Test desde info@resonaevents.com"
5. **Enviar**

**Verifica:**
- ✅ Recibes el email en tu personal
- ✅ Remitente muestra: info@resonaevents.com

---

### **Test 2: Recibir Email**

1. **Desde tu email personal**
2. **Envía a:** info@resonaevents.com
3. **Asunto:** "Test recepción"

**Verifica en Mail iOS:**
- ✅ Recibes el email en 1-2 minutos
- ✅ Notificación push funciona

---

### **Test 3: Responder Email**

1. **Responde** al email de prueba
2. **Envía**

**Verifica:**
- ✅ Tu personal recibe la respuesta
- ✅ Remitente correcto

---

## 🎨 CONFIGURACIÓN AVANZADA

### **1. Alias de Email (Opcional)**

**Si quieres que varios emails vayan a la misma bandeja:**

En Zoho Control Panel:
1. Email Accounts → info@resonaevents.com
2. Email Aliases → Add
3. Añade: `contacto@resonaevents.com`, `hola@resonaevents.com`

**Resultado:**
- Todos los emails a estos alias llegan a info@

---

### **2. Forwarding Automático**

**Si quieres redirigir emails:**

1. Zoho → Email Accounts → info@
2. Email Forwarding → Enable
3. Forward to: tu.email.personal@gmail.com

---

### **3. Respuestas Automáticas**

**Para vacaciones o ausencias:**

1. Zoho → Email Accounts → info@
2. Vacation Responder → Enable
3. Mensaje: "Gracias por contactar ReSona Events..."

---

## 🔒 SEGURIDAD

### **1. Autenticación de Dos Factores (2FA)**

**Muy recomendado:**

1. Zoho Control Panel → Security
2. Two-Factor Authentication → Enable
3. Usa app: Google Authenticator o Microsoft Authenticator

---

### **2. Contraseñas Seguras**

**Requisitos:**
- Mínimo 12 caracteres
- Mayúsculas, minúsculas, números, símbolos
- NO uses la misma que otros servicios

**Ejemplo:**
```
ReSona2025!Email#Secure
```

---

### **3. App Passwords (Si 2FA Activado)**

Si activas 2FA, necesitas "App Passwords" para Mail iOS:

1. Zoho → Security → App Passwords
2. Generate → Mail iOS
3. Usa esta contraseña en iPhone (no la normal)

---

## 📱 APPS ALTERNATIVAS

### **Opción A: Zoho Mail App** (Recomendado si usas Zoho)

**Descarga:**
- https://apps.apple.com/app/zoho-mail/id909262651

**Ventajas:**
- ✅ Integración perfecta
- ✅ Más funciones
- ✅ Mejor gestión de carpetas

---

### **Opción B: Gmail App**

**Si usas Google Workspace:**
- https://apps.apple.com/app/gmail/id422689480

---

### **Opción C: Spark Mail**

**App terceros con buenas reviews:**
- https://apps.apple.com/app/spark-mail/id997102246

---

## ⏰ TIEMPOS DE PROPAGACIÓN DNS

**Después de configurar DNS:**

| Cambio | Tiempo |
|--------|--------|
| Registros TXT | 10-30 min |
| Registros MX | 1-4 horas |
| SPF/DKIM | 1-4 horas |
| Completamente funcional | 24 horas máximo |

**Si no funciona inmediatamente:**
- ⏰ Espera 1-2 horas
- ✅ Es completamente normal

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### **Error: "Cannot Connect to Server"**

**Causas:**
1. DNS aún propagándose (espera 1h)
2. Usuario/contraseña incorrectos
3. Puerto incorrecto

**Solución:**
- Verifica credenciales
- Usa estos puertos exactos:
  - IMAP: 993 con SSL
  - SMTP: 465 con SSL

---

### **Error: "Cannot Send Mail"**

**Causas:**
1. SMTP mal configurado
2. Autenticación SMTP desactivada

**Solución:**
- Verifica usuario SMTP = email completo
- Verifica contraseña
- En Zoho: Settings → Mail → SMTP → Enable

---

### **Emails van a Spam**

**Causas:**
1. SPF/DKIM no configurados
2. IP nueva sin reputación

**Solución:**
- Configura SPF y DKIM (ver FASE 4)
- Pide a destinatarios que marquen "No es spam"
- Envía primero a conocidos

---

## 📊 CHECKLIST FINAL

**Antes de terminar, verifica:**

- [ ] Dominio verificado en Zoho ✅
- [ ] Registros MX configurados (3 registros)
- [ ] Registro SPF añadido (TXT)
- [ ] Registro DKIM añadido (TXT)
- [ ] Cuentas creadas:
  - [ ] info@resonaevents.com
  - [ ] resonaevents@resonaevents.com
- [ ] Configurado en Mail iOS (ambas cuentas)
- [ ] Test envío funcionando ✅
- [ ] Test recepción funcionando ✅
- [ ] Firma profesional configurada
- [ ] 2FA activado (recomendado)

---

## 💡 CONSEJOS PRO

### **1. Usa info@ para Clientes**
```
info@resonaevents.com → Consultas públicas
resonaevents@resonaevents.com → Uso interno/personal
```

### **2. Crea Más Emails (Gratis hasta 5)**
```
ventas@resonaevents.com
soporte@resonaevents.com
admin@resonaevents.com
```

### **3. Configura Firma HTML**

En Zoho web:
- Settings → Mail → Compose → Signature
- Usa HTML para logo e imágenes

### **4. Integra con CRM**

Zoho tiene CRM gratis:
- https://www.zoho.com/es-xl/crm/

---

## 📞 SOPORTE

**Si tienes problemas:**

1. **Zoho Support:**
   - https://help.zoho.com/portal/en/home
   - Chat en vivo disponible

2. **Comunidad:**
   - https://help.zoho.com/portal/community

3. **Video Tutoriales:**
   - https://www.youtube.com/zoho

---

## ✅ RESUMEN RÁPIDO

**Tiempo total:** 60-90 minutos

**Pasos:**
1. Crear cuenta Zoho (10 min)
2. Verificar dominio DNS (15 min)
3. Configurar MX records (15 min)
4. Crear cuentas email (5 min)
5. Configurar Mail iOS (10 min x 2)
6. Probar (5 min)

**Costo:** GRATIS (Zoho Forever Free)

**Resultado:**
✅ 2 emails profesionales
✅ Funcionando en Mail iOS
✅ Listo para usar

---

## 🚀 SIGUIENTE NIVEL

**Una vez funcionando:**

1. **Personaliza firma** con logo
2. **Activa 2FA** para seguridad
3. **Crea alias** (contacto@, hola@, etc.)
4. **Integra con tu web** (formulario de contacto)
5. **Configura respuestas automáticas**

---

**¿Listo? Empieza por el PASO 1 y avísame si tienes dudas.** 📧
