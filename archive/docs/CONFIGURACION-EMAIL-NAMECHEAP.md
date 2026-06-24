# 📧 Email Profesional con Namecheap (GRATIS)

**Dominio:** resonaevents.com (en Namecheap)  
**Emails:** info@resonaevents.com, resonaevents@resonaevents.com  
**Solución:** Email Forwarding + Gmail (100% GRATIS)

---

## 🎯 SOLUCIÓN: Forwarding + Gmail

**Cómo funciona:**
```
1. Emails a info@resonaevents.com → Se reenvían a tu Gmail
2. Respondes desde Gmail pero aparece como info@resonaevents.com
3. Todo visible en Mail iOS
```

**Ventajas:**
- ✅ 100% GRATIS
- ✅ Sin límites de almacenamiento (usa tu Gmail)
- ✅ Funciona en Mail iOS perfectamente
- ✅ Profesional
- ✅ Sin software adicional

**Tiempo:** 20-30 minutos

---

## 📋 PASO 1: Configurar Forwarding en Namecheap (5 min)

### **A. Acceder a Namecheap**

1. **Ve a:** https://ap.www.namecheap.com/

2. **Login** con tus credenciales

3. **Domain List** → Click en `resonaevents.com`

4. **Advanced DNS** (pestaña superior)

---

### **B. Añadir Registros MX para Forwarding**

**Namecheap tiene 2 opciones para email:**

#### **Opción A: Email Forwarding Gratis de Namecheap**

1. En la página de tu dominio, ve a la pestaña **"Email Forwarding"**

2. **Añade forwards:**
   ```
   Mailbox: info
   Forward To: tu.email.personal@gmail.com
   ```
   
3. **Añade segundo:**
   ```
   Mailbox: resonaevents
   Forward To: tu.email.personal@gmail.com
   ```

4. **Activar:** Click en el icono de "Enable"

**Resultado:**
```
✅ info@resonaevents.com → tu Gmail
✅ resonaevents@resonaevents.com → tu Gmail
```

---

#### **Opción B: Usar Improvmx.com (Más flexible)**

**Si Namecheap no tiene forwarding gratis:**

1. **Ve a:** https://improvmx.com/

2. **Añade tu dominio:** resonaevents.com

3. **ImprovMX te dará registros MX:**
   ```
   Prioridad 10: mx1.improvmx.com
   Prioridad 20: mx2.improvmx.com
   ```

4. **Ve a Namecheap → resonaevents.com → Advanced DNS**

5. **Busca sección "Mail Settings" o "MX Record"**

6. **Cambia de "Automatic" a "Custom MX"**

7. **Elimina cualquier MX existente**

8. **Añade los 2 MX de ImprovMX:**
   ```
   MX Record 1:
   Host: @
   Value: mx1.improvmx.com
   Priority: 10
   TTL: Automatic
   
   MX Record 2:
   Host: @
   Value: mx2.improvmx.com
   Priority: 20
   TTL: Automatic
   ```

9. **Save All Changes**

10. **Vuelve a ImprovMX → Dashboard**

11. **Añade forwards:**
    ```
    info@resonaevents.com → tu.gmail@gmail.com
    resonaevents@resonaevents.com → tu.gmail@gmail.com
    ```

**Resultado:**
```
✅ Emails se reenvían a tu Gmail
⏰ Espera 1-2 horas para propagación DNS
```

---

## 📋 PASO 2: Configurar Gmail para ENVIAR como @resonaevents.com (10 min)

**Ahora configuras Gmail para responder desde info@resonaevents.com**

### **A. Activar "Enviar como" en Gmail**

1. **Abre Gmail** en navegador (no app)

2. **Configuración** (⚙️ arriba derecha) → "Ver toda la configuración"

3. **Pestaña "Cuentas e importación"**

4. **Busca:** "Enviar correo como:"

5. **Click:** "Añadir otra dirección de correo electrónico"

6. **Ventana emergente:**
   ```
   Nombre: ReSona Events
   Dirección de correo: info@resonaevents.com
   ```
   
7. **Desmarcar:** "Considerar como un alias" (importante)

8. **Click:** Siguiente paso

---

### **B. Configurar SMTP**

**Google necesita saber CÓMO enviar desde tu dominio.**

**OPCIÓN 1: Sin servidor SMTP (más fácil)**

1. En la ventana que aparece, selecciona:
   - **"Enviar a través de los servidores de Gmail"**

2. **Click:** Añadir cuenta

3. **Gmail enviará email de verificación a info@resonaevents.com**

4. **Revisa tu Gmail** (el email se habrá reenviado ahí)

5. **Click en el enlace de confirmación**

**Resultado:**
```
✅ Puedes enviar desde info@resonaevents.com
✅ Emails aparecen profesionales
⚠️ Puede ir a spam (no tienes SPF configurado)
```

---

**OPCIÓN 2: Con SMTP de Namecheap (más profesional)**

**Solo si Namecheap te dio hosting/email:**

```
Servidor SMTP: mail.privateemail.com (o mail.resonaevents.com)
Puerto: 587
Seguridad: TLS
Usuario: info@resonaevents.com
Contraseña: [la que creaste en Namecheap]
```

**Si ImprovMX (no tiene SMTP):**
- Usa OPCIÓN 1 (servidores Gmail)
- O configura SPF (ver más abajo)

---

### **C. Configurar como Predeterminado**

1. **En Gmail → Configuración → Cuentas e importación**

2. **"Enviar correo como:"**
   - Verás: tu Gmail y info@resonaevents.com

3. **Click:** "Predeterminar" junto a info@resonaevents.com

**Resultado:**
```
✅ Por defecto envías desde info@resonaevents.com
✅ Puedes cambiar manualmente si quieres
```

---

### **D. Repetir para Segunda Cuenta**

Repite pasos A-C con:
```
resonaevents@resonaevents.com
```

---

## 📋 PASO 3: Configurar Mail en iOS (15 min)

### **Opción A: Añadir Gmail en Mail iOS (Recomendado)**

**Si ya usas Mail iOS con Gmail:**

1. **Mail iOS ya muestra los emails reenviados** (llegan a tu Gmail)

2. **Para enviar como info@:**
   - Al componer email
   - Toca tu email (arriba)
   - Selecciona: info@resonaevents.com

**Listo. No necesitas más.**

---

### **Opción B: Configurar Cuenta Separada en Mail iOS**

**Si quieres ver info@ como cuenta separada:**

1. **Ajustes → Mail → Cuentas → Añadir cuenta**

2. **Google** (no "Otra")

3. **Login** con tu cuenta de Gmail

4. **Permite acceso**

5. **Activa:** Mail

**Resultado:**
```
✅ Ves emails en Mail iOS
✅ Puedes enviar desde info@ o tu Gmail
```

---

## 📋 PASO 4: Configurar SPF para Evitar Spam (10 min)

**SPF le dice a otros servidores que Gmail puede enviar desde tu dominio.**

### **A. Añadir Registro SPF en Namecheap**

1. **Namecheap → resonaevents.com → Advanced DNS**

2. **Busca sección "Host Records" o "DNS Records"**

3. **Add New Record:**
   ```
   Type: TXT Record
   Host: @ (o déjalo vacío)
   Value: v=spf1 include:_spf.google.com include:_spf.improvmx.com ~all
   TTL: Automatic (o 3600)
   ```

4. **Save Changes**

**Explicación:**
```
v=spf1 → Versión SPF
include:_spf.google.com → Gmail puede enviar
include:_spf.improvmx.com → ImprovMX puede recibir
~all → Todo lo demás es sospechoso
```

**Si usas solo forwarding de Namecheap (sin ImprovMX):**
```
v=spf1 include:_spf.google.com ~all
```

---

### **B. Verificar SPF (Después de 1 hora)**

1. **Ve a:** https://mxtoolbox.com/spf.aspx

2. **Introduce:** resonaevents.com

3. **Click:** SPF Record Lookup

**Resultado esperado:**
```
✅ SPF Record Found
✅ include:_spf.google.com detected
```

---

## 📋 PASO 5: Configurar DKIM (Opcional, 15 min)

**DKIM firma digitalmente tus emails.**

### **A. Generar DKIM en Gmail (Solo si tienes Google Workspace)**

**Si usas Gmail gratis, NO puedes configurar DKIM.**

**Alternativa:** Confía en el SPF (suficiente para la mayoría de casos)

---

### **B. Si usas ImprovMX:**

1. **ImprovMX Dashboard → DKIM**

2. **Copia el registro TXT que te dan**

3. **Namecheap → Advanced DNS → Add TXT Record**

**Ejemplo:**
```
Host: improvmx._domainkey
Value: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3...
TTL: Automatic
```

---

## 🧪 PASO 6: Probar Todo (5 min)

### **Test 1: Recibir Email**

1. **Desde tu email personal** (otro diferente a Gmail si es posible)

2. **Envía a:** info@resonaevents.com

3. **Revisa tu Gmail:**
   ```
   ✅ Debe llegar en 1-2 minutos
   ✅ "To: info@resonaevents.com"
   ```

---

### **Test 2: Enviar Email desde Gmail Web**

1. **Gmail → Redactar**

2. **De:** Selecciona "info@resonaevents.com"

3. **Para:** Tu email personal

4. **Asunto:** "Test desde info@resonaevents.com"

5. **Enviar**

6. **Revisa tu email personal:**
   ```
   ✅ Remitente: info@resonaevents.com
   ✅ NO aparece tu Gmail personal
   ```

---

### **Test 3: Enviar desde Mail iOS**

1. **Abre Mail en iPhone**

2. **Redactar**

3. **Toca tu email (arriba)** → Selecciona info@resonaevents.com

4. **Para:** Tu email personal

5. **Enviar**

**Verifica:**
```
✅ Enviado correctamente
✅ Remitente: info@resonaevents.com
```

---

### **Test 4: Verificar No va a Spam**

1. **Revisa el email de prueba en tu personal**

2. **Click:** Mostrar original (o Ver detalles)

3. **Busca:** "SPF" y "PASS"

**Debe decir:**
```
✅ SPF: PASS
✅ DKIM: PASS (si configuraste)
```

**Si dice "SPAM" o "FAIL":**
- Espera 2-4 horas (propagación DNS)
- Verifica SPF correcto
- Envía de nuevo

---

## 📊 RESUMEN CONFIGURACIÓN

**Configuración DNS en Namecheap:**

```
Tipo    Host                        Value                           TTL
──────────────────────────────────────────────────────────────────────────
MX      @                           mx1.improvmx.com                10
MX      @                           mx2.improvmx.com                20
TXT     @                           v=spf1 include:_spf.google.com include:_spf.improvmx.com ~all
TXT     improvmx._domainkey         v=DKIM1; k=rsa; p=... (si configuras DKIM)
```

**Forwards (en ImprovMX o Namecheap):**
```
info@resonaevents.com → tu.gmail@gmail.com
resonaevents@resonaevents.com → tu.gmail@gmail.com
```

**Gmail configurado:**
```
✅ Enviar como: info@resonaevents.com
✅ Enviar como: resonaevents@resonaevents.com
✅ Predeterminado: info@resonaevents.com
```

---

## ⏰ TIMELINE

| Paso | Tiempo | Cuando |
|------|--------|--------|
| Configurar MX en Namecheap | 5 min | Ahora |
| Configurar forwards | 5 min | Ahora |
| Propagación DNS | 1-4 horas | Automático |
| Configurar Gmail "Enviar como" | 10 min | Después de 1h |
| Verificar email | 5 min | Después de 2h |
| Configurar SPF | 10 min | Cuando quieras |
| Configurar Mail iOS | 5 min | Cuando quieras |

**Total activo:** 35-40 minutos  
**Espera DNS:** 1-4 horas

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### **Error: No llegan emails a info@**

**Causas:**
1. MX no configurados correctamente
2. DNS no propagado (espera 2-4h)
3. Forward mal configurado

**Solución:**
1. **Verifica MX:** https://mxtoolbox.com/SuperTool.aspx?action=mx%3aresonaevents.com
   - Debe mostrar: mx1.improvmx.com y mx2.improvmx.com

2. **Verifica forward en ImprovMX:**
   - Dashboard → Aliases
   - Debe aparecer: info@ → tu Gmail

3. **Espera 4 horas desde cambios DNS**

---

### **Error: Emails van a spam**

**Causas:**
1. SPF no configurado
2. Sin DKIM
3. IP de Gmail nueva sin reputación

**Solución:**
1. **Configura SPF** (ver PASO 4)
2. **Verifica SPF:** https://mxtoolbox.com/spf.aspx
3. **Pide a destinatarios** marcar "No es spam"
4. **Empieza enviando a conocidos** para construir reputación

---

### **Error: No puedo enviar desde info@ en Gmail**

**Causas:**
1. No confirmaste el email de verificación
2. SMTP mal configurado

**Solución:**
1. **Revisa tu Gmail** (bandeja principal)
2. **Busca email de:** no-reply@accounts.google.com
3. **Click en enlace de confirmación**
4. **Si no lo encuentras:**
   - Gmail → Configuración → Cuentas
   - Junto a info@ → "Reenviar enlace de confirmación"

---

### **Error: Mail iOS no sincroniza**

**Causas:**
1. Configuración incorrecta
2. Contraseña de app incorrecta

**Solución:**
- Usa la cuenta de Gmail directamente (no manual)
- Ajustes → Mail → Cuentas → Google
- Los emails llegarán igual (están en Gmail)

---

## 💡 CONSEJOS PRO

### **1. Organiza con Etiquetas en Gmail**

1. **Gmail → Configuración → Etiquetas**

2. **Crear etiqueta:** "ReSona - Info"

3. **Filtro automático:**
   - Para: info@resonaevents.com
   - Aplicar etiqueta: "ReSona - Info"

**Resultado:**
```
✅ Todos los emails a info@ en una carpeta
✅ Fácil de gestionar
```

---

### **2. Crea Más Alias Gratis**

**En ImprovMX (plan gratis):**
```
ventas@resonaevents.com → tu Gmail
soporte@resonaevents.com → tu Gmail
admin@resonaevents.com → tu Gmail
```

**Límite:** 25 alias gratis

---

### **3. Firma Profesional en Gmail**

1. **Gmail → Configuración → General**

2. **Firma:**
   ```
   --
   ReSona Events Valencia
   Alquiler de Sonido, Iluminación y Audiovisuales
   
   📧 info@resonaevents.com
   📱 613 88 14 14
   🌐 resonaevents.com
   ```

3. **Asocia con:** info@resonaevents.com

---

### **4. Respuestas Automáticas**

**En Gmail:**
1. Configuración → General → Respuesta automática
2. Activa para fechas específicas (vacaciones)
3. Mensaje: "Gracias por contactar ReSona Events..."

---

## ✅ CHECKLIST FINAL

**Antes de terminar:**

- [ ] MX Records configurados en Namecheap (2 registros)
- [ ] Email forwarding activo:
  - [ ] info@resonaevents.com → Gmail
  - [ ] resonaevents@resonaevents.com → Gmail
- [ ] Gmail configurado "Enviar como":
  - [ ] info@resonaevents.com añadido
  - [ ] resonaevents@resonaevents.com añadido
  - [ ] info@ como predeterminado
- [ ] SPF configurado (registro TXT)
- [ ] Test envío funcionando ✅
- [ ] Test recepción funcionando ✅
- [ ] No va a spam ✅
- [ ] Mail iOS configurado (opcional)
- [ ] Firma profesional configurada

---

## 🎯 VENTAJAS DE ESTA SOLUCIÓN

### **vs Email de Pago:**
```
✅ GRATIS para siempre
✅ Almacenamiento ilimitado (Gmail = 15GB)
✅ Mejor antispam (Gmail es excelente)
✅ Interfaz conocida
✅ Apps nativas (Gmail, Mail iOS)
```

### **vs Hosting Email:**
```
✅ No requiere hosting
✅ No requiere cPanel
✅ Más confiable (Gmail uptime 99.9%)
✅ Mejor búsqueda y organización
```

---

## 🔐 SEGURIDAD

### **1. Activa 2FA en Gmail**

**MUY IMPORTANTE:**

1. **Gmail → Cuenta de Google → Seguridad**
2. **Verificación en 2 pasos → Activar**
3. **Usa app:** Google Authenticator

**Por qué:**
- ✅ Si tu Gmail es comprometido, tu info@ también
- ✅ Proteges tu negocio

---

### **2. Contraseñas Seguras**

```
❌ MAL: resona2024
✅ BIEN: ReSona2025!Secure#Email
```

---

### **3. Revisa Accesos**

1. **Gmail → Cuenta → Seguridad**
2. **Dispositivos → Revisar**
3. **Elimina dispositivos desconocidos**

---

## 📞 RECURSOS

**Verificar DNS:**
- MX: https://mxtoolbox.com/SuperTool.aspx
- SPF: https://mxtoolbox.com/spf.aspx
- Propagación: https://dnschecker.org/

**ImprovMX:**
- Dashboard: https://improvmx.com/dashboard
- Docs: https://improvmx.com/guides/

**Gmail:**
- Soporte: https://support.google.com/mail

---

## ⏭️ PRÓXIMOS PASOS

**Una vez funcionando:**

1. **Integra formulario de contacto web**
   - Envía a: info@resonaevents.com

2. **Añade email a Google Business**
   - Mejora SEO local

3. **Crea respuestas automáticas**
   - Para consultas frecuentes

4. **Monitorea deliverability**
   - https://www.mail-tester.com

---

**LISTO. EMPIEZA POR EL PASO 1.** 📧
