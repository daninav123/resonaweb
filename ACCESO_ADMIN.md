# 🔐 CREDENCIALES Y ACCESO AL PANEL DE ADMINISTRACIÓN

## 📧 CREDENCIALES DE ACCESO

### 👑 Usuario Administrador
```
Email:    admin@resona.com
Password: Admin123!
Rol:      ADMIN
```

### 👤 Usuario Cliente de Prueba
```
Email:    cliente@test.com
Password: User123!
Rol:      CLIENT
```

---

## 🌐 URLs DE ACCESO

### Frontend
- **Login:** http://localhost:3000/login
- **Home:** http://localhost:3000
- **Productos:** http://localhost:3000/productos
- **Panel Admin:** http://localhost:3000/dashboard (después de login como admin)

### Backend API
- **API Base:** http://localhost:3001/api/v1
- **Health Check:** http://localhost:3001/health
- **Login:** POST http://localhost:3001/api/v1/auth/login

### Base de Datos
- **Adminer:** http://localhost:8080
  - Sistema: PostgreSQL
  - Servidor: db
  - Usuario: postgres
  - Contraseña: postgres
  - Base de datos: resona

---

## 📋 CÓMO ACCEDER AL PANEL DE ADMIN

### Opción 1: Desde el Navegador

1. **Abrir el navegador** en: http://localhost:3000

2. **Ir a Login:**
   - Clic en el botón "Iniciar Sesión" en el header
   - O ir directamente a: http://localhost:3000/login

3. **Ingresar credenciales:**
   ```
   Email:    admin@resona.com
   Password: Admin123!
   ```

4. **Acceder al Dashboard:**
   - Después del login, ir a: http://localhost:3000/dashboard
   - O hacer clic en "Panel de Control" si aparece en el menú

### Opción 2: Usando cURL (API)

```bash
# 1. Login y obtener token
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@resona.com",
    "password": "Admin123!"
  }'

# Respuesta:
# {
#   "user": {...},
#   "accessToken": "eyJhbGc...",
#   "refreshToken": "..."
# }

# 2. Usar el token para peticiones protegidas
curl http://localhost:3001/api/v1/users \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

---

## 📊 DATOS CREADOS EN LA BASE DE DATOS

### Usuarios
- **1 Administrador:** admin@resona.com
- **1 Cliente:** cliente@test.com

### Categorías (5)
1. **Fotografía y Video** - Equipos profesionales de fotografía y video
2. **Iluminación** - Equipos de iluminación profesional
3. **Sonido** - Sistemas de sonido profesional
4. **Decoración** - Elementos decorativos para bodas
5. **Mobiliario** - Mesas, sillas y mobiliario

### Productos (15)

#### Fotografía y Video
- **Cámara Sony A7 III** - €85/día
- **Objetivo Canon 50mm f/1.2** - €45/día
- **Drone DJI Mavic 3 Pro** - €120/día

#### Iluminación
- **Panel LED 1000W Profesional** - €35/día
- **Flash Godox AD600 Pro** - €40/día
- **Foco RGB LED Inteligente** - €25/día

#### Sonido
- **Altavoz JBL PRX815W** - €60/día
- **Micrófono Shure SM58** - €15/día
- **Mesa de Mezclas Yamaha MG16XU** - €50/día

#### Decoración
- **Arco Ceremonial con Flores** - €80/día
- **Letras Luminosas LOVE** - €70/día
- **Fondo Photocall Blanco 3x2m** - €45/día

#### Mobiliario
- **Silla Chiavari Dorada (Pack 10)** - €40/día
- **Mesa Imperial 3m x 1m** - €55/día
- **Mesa Cocktail Alta (Pack 5)** - €30/día

### Reviews
- **5 reviews de 5 estrellas** en los primeros productos

---

## 🔧 COMANDOS ÚTILES

### Ver la base de datos
```bash
# Abrir Prisma Studio (GUI visual)
npm run db:studio --workspace=backend

# Acceder vía Adminer (navegador)
http://localhost:8080
```

### Re-poblar la base de datos
```bash
# Si quieres limpiar y volver a crear los datos
npm run db:seed --workspace=backend
```

### Verificar productos creados
```bash
# Ver todos los productos
curl http://localhost:3001/api/v1/products

# Ver productos destacados
curl http://localhost:3001/api/v1/products/featured

# Ver categorías
curl http://localhost:3001/api/v1/products/categories
```

---

## 🎯 FUNCIONALIDADES DEL PANEL DE ADMIN

### Lo que DEBERÍA funcionar (según el código):

1. **Dashboard**
   - Estadísticas generales
   - Gráficos de ventas
   - Productos más alquilados

2. **Gestión de Productos**
   - Ver todos los productos
   - Crear nuevo producto
   - Editar producto
   - Eliminar producto
   - Actualizar stock

3. **Gestión de Categorías**
   - Ver categorías
   - Crear categoría
   - Editar categoría
   - Eliminar categoría

4. **Gestión de Usuarios**
   - Ver todos los usuarios
   - Ver detalles de usuario
   - Desactivar usuario

### ⚠️ Nota Importante:

Algunas funcionalidades del panel de admin pueden NO funcionar completamente porque:
- El frontend no ha sido testeado con el backend
- Falta implementar servicios (carrito, pedidos, pagos)
- Posibles bugs de integración

**Recomendación:** Usa primero la API directamente con cURL o Postman para verificar que todo funciona.

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "No se puede conectar"
```bash
# Verificar que los servidores estén corriendo
# Backend debería estar en puerto 3001
curl http://localhost:3001/health

# Frontend debería estar en puerto 3000
curl http://localhost:3000
```

### Error: "Credenciales inválidas"
Las credenciales correctas son:
- Email: **admin@resona.com** (no admin@admin.com)
- Password: **Admin123!** (con mayúscula y signo de exclamación)

### Error: "No hay productos"
Re-ejecutar el seed:
```bash
npm run db:seed --workspace=backend
```

---

## 📱 TESTING RÁPIDO

### Test 1: Login como Admin
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@resona.com","password":"Admin123!"}'
```

### Test 2: Ver productos
```bash
curl http://localhost:3001/api/v1/products
```

### Test 3: Ver categorías
```bash
curl http://localhost:3001/api/v1/products/categories
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

- [ ] Backend corriendo en puerto 3001
- [ ] Frontend corriendo en puerto 3000
- [ ] Base de datos tiene 15 productos
- [ ] Puedo hacer login con admin@resona.com
- [ ] La API responde en /api/v1/products
- [ ] Puedo ver productos en el frontend

---

**¡Todo listo para explorar el proyecto!** 🚀

Si encuentras problemas, revisa los logs del backend o usa Adminer para ver directamente la base de datos.
