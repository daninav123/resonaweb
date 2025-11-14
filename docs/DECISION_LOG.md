# 📋 Log de Decisiones Técnicas - ReSona

Registro de decisiones arquitectónicas y técnicas importantes tomadas durante el desarrollo.

## Formato

Cada decisión incluye:
- **Fecha**
- **Contexto** - ¿Por qué necesitamos tomar esta decisión?
- **Decisión** - ¿Qué decidimos?
- **Consecuencias** - ¿Qué impacto tiene?
- **Alternativas consideradas**

---

## [2024-12-10] Stack Frontend: React vs Vue

**Contexto:**  
Necesitamos elegir el framework frontend para la aplicación.

**Decisión:**  
Usar **React 18 con TypeScript**

**Razones:**
- Ecosistema maduro y amplio
- Mejor soporte de TypeScript
- Más recursos y desarrolladores disponibles
- shadcn/ui proporciona componentes de calidad
- React Query simplifica data fetching

**Alternativas:**
- Vue 3: Curva de aprendizaje menor, pero ecosistema más pequeño
- Svelte: Más rápido, pero menos maduro para proyectos enterprise

---

## [2024-12-10] ORM: Prisma vs TypeORM

**Contexto:**  
Necesitamos un ORM para gestionar PostgreSQL con TypeScript.

**Decisión:**  
Usar **Prisma**

**Razones:**
- Type-safety completo automático
- Migraciones declarativas simples
- Prisma Studio para debugging
- Mejor DX (Developer Experience)
- Query builder intuitivo

**Alternativas:**
- TypeORM: Más decorators, menos type-safe
- Sequelize: Más antiguo, peor soporte TypeScript

---

## [2024-12-10] Monorepo vs Multi-repo

**Contexto:**  
Frontend y backend están relacionados, compartirán tipos.

**Decisión:**  
Usar **Monorepo con npm workspaces**

**Razones:**
- Compartir schemas de validación (Zod)
- Versionado sincronizado
- Setup más simple para desarrollo
- No necesitamos complejidad de Nx/Turborepo aún

**Consecuencias:**
- Requiere disciplina en imports
- Build puede ser más lento (mitigable)

---

## [2024-12-10] State Management: Zustand vs Redux

**Contexto:**  
Necesitamos gestión de estado global (auth, carrito).

**Decisión:**  
Usar **Zustand**

**Razones:**
- Menos boilerplate que Redux
- API simple e intuitiva
- Buen soporte TypeScript
- Perfecto para estado UI simple
- React Query maneja estado del servidor

**Alternativas:**
- Redux Toolkit: Más robusto pero overkill para este caso
- Context API: No suficiente para estado complejo

---

## [2024-12-10] Autenticación: JWT vs Sessions

**Contexto:**  
La API será consumida por app externa, necesita ser stateless.

**Decisión:**  
Usar **JWT con refresh tokens**

**Razones:**
- Stateless, escalable horizontalmente
- Funciona bien con API pública
- Access token corto (15min) + refresh token (7d)
- Compatible con arquitecturas distribuidas

**Consecuencias:**
- Revocar tokens es complejo (mitigado con tokens cortos)
- Implementar blacklist con Redis en futuro si es necesario

---

## [2024-12-10] Generación PDFs: Puppeteer vs PDFKit

**Contexto:**  
Necesitamos generar facturas en PDF automáticamente.

**Decisión:**  
Usar **Puppeteer con Handlebars**

**Razones:**
- Render HTML/CSS como PDF (diseño flexible)
- Templates con Handlebars reutilizables
- CSS facilita diseño profesional
- Fácil previsualización en navegador

**Alternativas:**
- PDFKit: Más performante pero diseño más complejo
- Servicios externos: Costo adicional innecesario

---

## [2024-12-10] UI Components: Build Custom vs shadcn/ui

**Contexto:**  
Necesitamos componentes UI consistentes y accesibles.

**Decisión:**  
Usar **shadcn/ui + Tailwind CSS**

**Razones:**
- Componentes copiables, no librería npm
- Full control del código
- Basado en Radix UI (accesibilidad)
- Tailwind permite customización completa
- Excelente DX

**Alternativas:**
- Material UI: Más pesado, look genérico
- Ant Design: Demasiado opinionated
- Build from scratch: Mucho tiempo de desarrollo

---

## [2024-12-10] API Versioning: URL vs Headers

**Contexto:**  
API pública necesitará versionado para backward compatibility.

**Decisión:**  
Usar **versionado en URL** (`/api/v1/...`)

**Razones:**
- Más explícito y visible
- Fácil de cachear
- Compatible con todas las herramientas
- Estándar de la industria

**Consecuencias:**
- URL más largas
- Duplicación de código al mantener múltiples versiones

---

## [2024-12-10] Deployment: Docker vs PM2

**Contexto:**  
Necesitamos estrategia de deployment confiable.

**Decisión:**  
**Docker para producción, PM2 como alternativa**

**Razones:**
- Docker asegura environment consistente
- Fácil rollback
- Compatible con orquestadores (K8s futuro)
- PM2 como backup simple para servidores pequeños

---

## [2024-12-10] Email: SMTP vs Servicio (SendGrid)

**Contexto:**  
Sistema debe enviar emails (confirmaciones, facturas).

**Decisión:**  
Usar **SendGrid (o similar)** via SMTP

**Razones:**
- Deliverability superior vs SMTP propio
- Tracking de emails
- Templates visuales
- Logs y analytics incluidos
- Free tier suficiente para MVP

**Alternativas:**
- SMTP propio: Problemas de deliverability
- Mailgun: Similar a SendGrid
- AWS SES: Más complejo de configurar

---

## Próximas Decisiones Pendientes

- [ ] **Payments:** ¿Stripe vs PayPal vs Redsys?
- [ ] **Image storage:** ¿Local vs S3 vs Cloudinary?
- [ ] **Cache:** ¿Redis vs In-memory cuando escalemos?
- [ ] **Real-time:** ¿WebSockets vs Polling para tracking?
