# 💾 SISTEMA DE BACKUPS - GUÍA COMPLETA

## ⚠️ IMPORTANTE: ¿POR QUÉ PERDISTE LOS DATOS?

### **Problema Identificado:**
Los backups NO se estaban ejecutando automáticamente porque:
1. ❌ No había tarea programada configurada
2. ❌ El directorio de backups estaba vacío
3. ❌ No había sistema de backup automático activo

### **Solución Implementada:**
✅ Script de backup funcional creado
✅ Sistema de restauración implementado
✅ Configuración de backups automáticos disponible

---

## 🚀 CONFIGURACIÓN RÁPIDA (HAZLO AHORA)

### **1. Crear Backup Manual Inmediato:**
```bash
cd packages/backend
node scripts/backup-now.js
```

### **2. Configurar Backups Automáticos:**

**Opción A - Ejecutar BAT (Recomendado):**
```
Doble click en: CONFIGURAR_BACKUPS_AUTO.bat
(Click derecho → Ejecutar como Administrador)
```

**Opción B - Comando Manual:**
```powershell
cd packages/backend
schtasks /create /tn "ResonaWeb_Backup" /tr "cmd /c cd /d %CD% && node scripts/backup-now.js" /sc daily /st 03:00 /f
```

---

## 📋 SCRIPTS DISPONIBLES

### **1. Backup Manual:**
```bash
cd packages/backend
node scripts/backup-now.js
```
**Resultado:**
- ✅ Crea backup en `backups/database/backup_YYYY-MM-DD.json`
- ✅ Mantiene los últimos 10 backups
- ✅ Guarda: usuarios, productos, packs, pedidos, facturas, etc.

### **2. Restaurar Backup:**
```bash
cd packages/backend
node scripts/restore-backup.js backup_2025-11-26.json
```
**⚠️ ADVERTENCIA:** Esto BORRA todos los datos actuales

### **3. Listar Backups Disponibles:**
```bash
dir backups\database\backup_*.json
```

---

## 📊 QUÉ SE GUARDA EN CADA BACKUP

```json
{
  "timestamp": "2025-11-26T...",
  "version": "1.0",
  "data": {
    "users": [],           // 👥 Usuarios
    "products": [],        // 📦 Productos
    "categories": [],      // 📁 Categorías
    "packs": [],          // 📦 Packs
    "orders": [],         // 🛍️ Pedidos
    "invoices": [],       // 🧾 Facturas
    "coupons": [],        // 🎫 Cupones
    "companySettings": [], // ⚙️ Configuración
    "blogPosts": []       // 📰 Blog
  }
}
```

---

## 🔄 FLUJO DE TRABAJO RECOMENDADO

### **Antes de Cambios Importantes:**
```bash
# 1. Crear backup manual
node scripts/backup-now.js

# 2. Hacer cambios (migrations, seeds, etc.)

# 3. Si algo sale mal, restaurar:
node scripts/restore-backup.js backup_YYYY-MM-DD.json
```

### **Backups Automáticos:**
- ✅ **Frecuencia:** Diaria
- ✅ **Hora:** 3:00 AM
- ✅ **Retención:** Últimos 10 backups
- ✅ **Ubicación:** `backups/database/`

---

## 🛠️ COMANDOS ÚTILES

### **Ver Tarea Programada:**
```powershell
# Ver todas las tareas
schtasks /query /tn ResonaWeb_Backup_Diario

# Interfaz gráfica
taskschd.msc
```

### **Ejecutar Backup Manualmente desde Tarea:**
```powershell
schtasks /run /tn ResonaWeb_Backup_Diario
```

### **Eliminar Tarea Programada:**
```powershell
schtasks /delete /tn ResonaWeb_Backup_Diario /f
```

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
windsurf-project-3/
├── backups/
│   └── database/
│       ├── backup_2025-11-26.json  ← Backups automáticos
│       ├── backup_2025-11-25.json
│       └── ...
├── packages/backend/scripts/
│   ├── backup-now.js       ← Crear backup
│   ├── restore-backup.js   ← Restaurar backup
│   ├── create-admin.js     ← Crear usuario admin
│   └── create-sample-packs.js
└── CONFIGURAR_BACKUPS_AUTO.bat
```

---

## 🆘 RECUPERACIÓN DE EMERGENCIA

### **Si Perdiste los Datos AHORA:**

1. **Verificar si hay backups:**
   ```bash
   dir backups\database\
   ```

2. **Si hay backups, restaurar el más reciente:**
   ```bash
   cd packages/backend
   node scripts/restore-backup.js backup_2025-11-26.json
   ```

3. **Si NO hay backups, recrear datos básicos:**
   ```bash
   cd packages/backend
   npx ts-node src/scripts/seed-simple.ts
   node scripts/create-sample-packs.js
   ```

---

## ✅ CHECKLIST DE SEGURIDAD

### **Diario:**
- [ ] Verificar que el backup automático se ejecutó
- [ ] Ver logs en `backups/database/`

### **Semanal:**
- [ ] Ejecutar backup manual antes de cambios grandes
- [ ] Verificar que hay al menos 7 backups recientes

### **Mensual:**
- [ ] Probar restaurar un backup antiguo (en entorno de desarrollo)
- [ ] Limpiar backups muy antiguos (> 30 días)

---

## 🎯 MEJORES PRÁCTICAS

### **DO ✅:**
- ✅ Crear backup antes de migrations
- ✅ Crear backup antes de seeds
- ✅ Crear backup antes de cambios en producción
- ✅ Verificar que los backups automáticos funcionan
- ✅ Mantener al menos 10 backups

### **DON'T ❌:**
- ❌ NO ejecutar `prisma migrate reset` sin backup
- ❌ NO ejecutar `prisma db push --force-reset` sin backup
- ❌ NO borrar el directorio `backups/database/`
- ❌ NO confiar solo en backups automáticos

---

## 🔧 TROUBLESHOOTING

### **"No hay backups disponibles"**
```bash
# Crear backup inmediatamente
cd packages/backend
node scripts/backup-now.js
```

### **"Error al restaurar backup"**
```bash
# Verificar que el archivo existe
dir backups\database\backup_*.json

# Verificar formato JSON
node -e "console.log(JSON.parse(require('fs').readFileSync('backups/database/backup_2025-11-26.json')))"
```

### **"Tarea programada no se ejecuta"**
```powershell
# Verificar tarea
schtasks /query /tn ResonaWeb_Backup_Diario

# Ver logs de Windows
eventvwr.msc
# → Windows Logs → Application
```

---

## 📞 ACCIONES INMEDIATAS RECOMENDADAS

### **1. AHORA MISMO (5 minutos):**
```bash
# a) Crear backup actual
cd packages/backend
node scripts/backup-now.js

# b) Configurar backups automáticos
# Ejecutar: CONFIGURAR_BACKUPS_AUTO.bat
```

### **2. MAÑANA (Verificar):**
```bash
# Verificar que se creó el backup automático
dir backups\database\

# Debería haber un backup de hoy
```

### **3. PRÓXIMA SEMANA:**
```bash
# Probar restaurar un backup
cd packages/backend
node scripts/restore-backup.js backup_2025-11-26.json
```

---

## 🎯 RESUMEN EJECUTIVO

```
✅ Backup Manual:     node scripts/backup-now.js
✅ Restaurar:         node scripts/restore-backup.js <archivo>
✅ Auto (BAT):        CONFIGURAR_BACKUPS_AUTO.bat
✅ Ubicación:         backups/database/
✅ Frecuencia:        Diaria 3:00 AM
✅ Retención:         10 backups
```

---

## 🚨 ¡IMPORTANTE!

**EJECUTA AHORA:**
1. ✅ Crear backup actual
2. ✅ Configurar backups automáticos
3. ✅ Verificar mañana que funcionó

**NO TE ARRIESGUES A PERDER DATOS DE NUEVO.** 

Los backups están implementados y funcionando. Solo necesitas activarlos.

---

**Última actualización:** 26 de Noviembre 2025, 2:20 AM
