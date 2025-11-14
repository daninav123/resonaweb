# 📂 ¿DÓNDE SE GUARDAN LOS DATOS?

## 🗄️ BASE DE DATOS: PostgreSQL

**Ubicación:** `localhost:5432`
**Nombre:** `resona_db`
**Usuario:** `resona_user`

---

## 📝 ENTRADAS DEL BLOG

### **Tabla: `BlogPost`**

```
Ubicación: Base de datos PostgreSQL resona_db
Tabla: BlogPost

Campos principales:
- id: ID único
- title: Título del artículo
- slug: URL amigable
- content: Contenido completo (Markdown)
- excerpt: Extracto/resumen
- status: PUBLISHED / SCHEDULED / DRAFT / ARCHIVED
- publishedAt: Fecha de publicación
- categoryId: ID de categoría
- authorId: ID del autor
- aiGenerated: true/false (generado por IA)
- views: Número de vistas
- likes: Número de likes
```

### **Ver entradas del blog:**

```bash
cd packages\backend
node check-blog-data.js
```

O desde el panel admin: http://localhost:3000/admin/blog

---

## 📦 PRODUCTOS

### **Tabla: `Product`**

```
Ubicación: Base de datos PostgreSQL resona_db
Tabla: Product

Campos principales:
- id: ID único
- name: Nombre del producto
- description: Descripción
- price: Precio
- category: Categoría
- images: Array de imágenes
- stock: Cantidad en stock
- featured: Destacado (true/false)
```

### **Ver productos:**

Panel admin → Productos
O consulta directa a la base de datos

---

## 🗂️ CATEGORÍAS DEL BLOG

### **Tabla: `BlogCategory`**

```
Ubicación: Base de datos PostgreSQL resona_db
Tabla: BlogCategory

Campos:
- id: ID único
- name: Nombre (ej: "Guías", "Consejos")
- slug: URL amigable
- description: Descripción
- color: Color hex (#5ebbff)
```

---

## 🏷️ TAGS DEL BLOG

### **Tabla: `BlogTag`**

```
Ubicación: Base de datos PostgreSQL resona_db
Tabla: BlogTag

Campos:
- id: ID único
- name: Nombre del tag
- slug: URL amigable
```

---

## 👤 USUARIOS Y AUTORES

### **Tabla: `User`**

```
Ubicación: Base de datos PostgreSQL resona_db
Tabla: User

Campos principales:
- id: ID único
- email: Email
- firstName: Nombre
- lastName: Apellido
- role: ADMIN / USER / SUPERADMIN
- isActive: Activo/Inactivo
```

**Usuario admin por defecto:**
- Email: `admin@resona.com`
- Password: `Admin123!`

---

## 🔍 CÓMO VERIFICAR LOS DATOS

### **Opción 1: Panel de Administración**

```
http://localhost:3000/admin/blog
```
→ Ver todos los artículos del blog

```
http://localhost:3000/admin/products
```
→ Ver todos los productos

### **Opción 2: Script de verificación**

```bash
cd packages\backend
node check-blog-data.js
```

### **Opción 3: Prisma Studio**

```bash
cd packages\backend
npx prisma studio
```
→ Abre interfaz visual en http://localhost:5555

### **Opción 4: Cliente PostgreSQL**

```bash
psql -U resona_user -d resona_db
```

Luego consultas SQL:
```sql
-- Ver todos los posts del blog
SELECT id, title, status, "publishedAt" FROM "BlogPost";

-- Contar posts
SELECT COUNT(*) FROM "BlogPost";

-- Ver productos
SELECT id, name, price FROM "Product";
```

---

## 📊 ESTADÍSTICAS ACTUALES

Ejecuta el script de verificación para ver:
- Total de artículos del blog
- Artículos publicados / programados / borradores
- Total de categorías
- Total de productos

```bash
node check-blog-data.js
```

---

## 🔧 SI VES "ERROR AL CARGAR DATOS DEL BLOG"

Puede ser por:

1. **No estás logueado** → Haz login primero
2. **Backend no está corriendo** → Ejecuta `start-quick.bat`
3. **Error de permisos** → Verifica que el usuario admin existe
4. **Base de datos no migrada** → Ejecuta las migraciones

### **Solución rápida:**

1. Cierra todo
2. Ejecuta `start-quick.bat`
3. Espera 30 segundos
4. Ve a http://localhost:3000/login
5. Login con admin@resona.com
6. Ve a Panel Admin → Blog

---

## 📁 ARCHIVOS DE CONFIGURACIÓN

**Backend .env:**
```
packages/backend/.env
```
→ Contiene la cadena de conexión a PostgreSQL

**Esquema Prisma:**
```
packages/backend/prisma/schema.prisma
```
→ Define todas las tablas de la base de datos

---

## ✅ RESUMEN

```
📝 Entradas del blog: PostgreSQL → BlogPost
📦 Productos: PostgreSQL → Product
🗂️ Categorías: PostgreSQL → BlogCategory
🏷️ Tags: PostgreSQL → BlogTag
👤 Usuarios: PostgreSQL → User

Todo se guarda en:
Base de datos: resona_db (PostgreSQL)
Puerto: 5432
Host: localhost
```

**NO se usa Firebase ni ningún otro servicio externo para guardar datos.**
**Todo está en PostgreSQL local.** 🎯
