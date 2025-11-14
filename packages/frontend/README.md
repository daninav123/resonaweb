# 🎉 RESONA EVENTS - Frontend

Aplicación web para alquiler de equipos de eventos (fotografía, video, sonido, iluminación).

---

## 🚀 INICIO RÁPIDO

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview
```

---

## 📦 STACK TECNOLÓGICO

- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **TailwindCSS** - Styling
- **React Router** - Routing
- **React Query** - Server State
- **Zustand** - Client State
- **Axios** - HTTP Client
- **React Hook Form** - Forms
- **Zod** - Validation
- **Lucide React** - Icons

---

## 🎯 CARACTERÍSTICAS

✅ **Catálogo de Productos**
- Grid responsive
- Búsqueda y filtros
- Categorías
- Detalles de producto

✅ **Carrito de Compras**
- Carrito lateral animado
- Contador dinámico
- Funciona sin login
- Fechas globales + personalizadas

✅ **Sistema de Fechas**
- Fechas globales para todo el pedido
- Opción de personalizar por producto
- Cálculo automático de precios

✅ **Autenticación**
- Login / Register
- JWT tokens
- Rutas protegidas

✅ **Responsive Design**
- Mobile-first
- Tablet optimizado
- Desktop completo

---

## 🗂️ ESTRUCTURA

```
src/
├── components/        # Componentes reutilizables
│   ├── Layout/       # Header, Footer, Layout
│   ├── CartSidebar.tsx
│   └── ...
├── pages/            # Páginas principales
│   ├── HomePage.tsx
│   ├── ProductsPage.tsx
│   ├── ProductDetailPage.tsx
│   ├── CartPage.tsx
│   ├── CheckoutPage.tsx
│   └── auth/
├── services/         # API calls
│   └── api.ts
├── stores/           # Zustand stores
│   └── authStore.ts
├── hooks/            # Custom hooks
│   └── useCartCount.ts
├── utils/            # Utilities
│   └── guestCart.ts  # LocalStorage cart
└── App.tsx           # Main app component
```

---

## 🔧 CONFIGURACIÓN

### **Variables de Entorno**

Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita `.env`:

```env
VITE_API_URL=http://localhost:3001/api/v1
```

---

## 🚀 DESPLIEGUE

### **Opción 1: Script Automático**

```bash
# Windows
deploy.bat

# Linux/Mac
npm run build
```

### **Opción 2: Netlify CLI**

```bash
# Instalar CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --dir=dist --prod
```

### **Opción 3: GitHub + Netlify**

1. Push a GitHub
2. Conecta en Netlify
3. Autodeploy en cada push

Ver **`DESPLIEGUE.md`** para guía completa.

---

## 📝 SCRIPTS DISPONIBLES

```bash
# Desarrollo
npm run dev              # Servidor dev en http://localhost:5173

# Build
npm run build            # Build de producción
npm run preview          # Preview del build

# Testing
npm test                 # Run tests
npm run test:ui          # Tests con UI
npm run test:coverage    # Coverage report

# Linting
npm run lint             # Check linting
npm run lint:fix         # Fix linting

# Limpieza
npm run clean            # Limpiar dist y node_modules
```

---

## 🎨 PERSONALIZACIÓN

### **Colores (TailwindCSS)**

Edita `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      resona: '#5ebbff',
      'resona-dark': '#4a9dd6',
    }
  }
}
```

### **Logo**

Reemplaza:
- `public/logo-resona.svg`
- `public/favicon.ico`

---

## 📊 CARACTERÍSTICAS DEL CARRITO

### **Sin Login:**
- ✅ Añadir productos
- ✅ Modificar cantidad
- ✅ Seleccionar fechas
- ✅ Ver precios
- ⚠️ Requiere login para checkout

### **Con Login:**
- ✅ Todo lo anterior
- ✅ Proceder a checkout
- ✅ Historial de pedidos
- ✅ Favoritos

### **Fechas Globales:**
- Una selección para todos los productos
- Opción de personalizar productos específicos
- Cálculo automático de días y precios

---

## 🐛 TROUBLESHOOTING

### **Error: Cannot connect to API**

Verifica que el backend está corriendo:
```bash
# En packages/backend
npm run dev
```

### **Error: Module not found**

Reinstala dependencias:
```bash
rm -rf node_modules
npm install
```

### **Error en Build**

Limpia y reconstruye:
```bash
npm run clean
npm install
npm run build
```

---

## 📱 RESPONSIVE BREAKPOINTS

```css
sm:  640px   /* Tablet pequeña */
md:  768px   /* Tablet */
lg:  1024px  /* Desktop */
xl:  1280px  /* Desktop grande */
2xl: 1536px  /* Desktop XL */
```

---

## 🔐 SEGURIDAD

- ✅ HTTPS en producción
- ✅ Headers de seguridad configurados
- ✅ CORS configurado
- ✅ JWT tokens
- ✅ Input sanitization
- ✅ XSS protection

---

## 📈 RENDIMIENTO

- ✅ Code splitting
- ✅ Lazy loading de rutas
- ✅ Optimización de imágenes
- ✅ Caching con React Query
- ✅ Build optimizado con Vite

---

## 🤝 CONTRIBUIR

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/nueva-feature`
3. Commit: `git commit -m 'Add nueva feature'`
4. Push: `git push origin feature/nueva-feature`
5. Pull Request

---

## 📄 LICENCIA

Privado - Todos los derechos reservados

---

## 👥 AUTORES

- Daniel Navarro Campos
- GitHub: [@Daniel-Navarro-Campos](https://github.com/Daniel-Navarro-Campos)
- Repo: [mywed360](https://github.com/Daniel-Navarro-Campos/mywed360)

---

## 📞 SOPORTE

- Email: info@resona.com
- Teléfono: +34 600 123 456

---

## ✅ TODO

- [x] Carrito funcional
- [x] Fechas globales
- [x] Carrito lateral
- [x] Contador dinámico
- [ ] Persistencia backend del carrito
- [ ] Sistema de pagos
- [ ] Notificaciones email
- [ ] Panel de administración
- [ ] Analytics

---

**¡Aplicación lista para producción!** 🚀

**Estado:** ✅ MVP Completo  
**Versión:** 1.0.0  
**Última actualización:** 13 Nov 2025
