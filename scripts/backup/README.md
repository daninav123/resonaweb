# 💾 Scripts de Backup - Guía Rápida

## 🚀 **Inicio Rápido**

### **1. Primera Vez - Configurar**
```powershell
# Verificar que todo está OK
.\test-backup.ps1

# Programar backups automáticos (como Administrador)
.\setup-scheduled-backup.ps1
```

### **2. Crear Backup Manual**
```powershell
.\backup-database.ps1
```

### **3. Restaurar Backup**
```powershell
.\restore-database.ps1 -BackupFile "..\..\backups\database\resona_backup_20251121_020500.sql.gz"
```

---

## 📁 **Scripts Disponibles**

| Script | Descripción | Uso |
|--------|-------------|-----|
| `backup-database.ps1` | Crear backup | `.\backup-database.ps1` |
| `restore-database.ps1` | Restaurar backup | `.\restore-database.ps1 -BackupFile "path"` |
| `setup-scheduled-backup.ps1` | Programar automático | `.\setup-scheduled-backup.ps1` |
| `test-backup.ps1` | Verificar sistema | `.\test-backup.ps1` |

---

## 📊 **Comandos Útiles**

```powershell
# Ver backups existentes
Get-ChildItem ..\..\backups\database -Filter "*.gz" | Format-Table Name, Length, LastWriteTime

# Ver tarea programada
Get-ScheduledTask -TaskName "ReSona-DatabaseBackup"

# Ejecutar backup ahora
Start-ScheduledTask -TaskName "ReSona-DatabaseBackup"

# Ver logs
Get-Content ..\..\logs\backups\backup_$(Get-Date -Format 'yyyyMMdd').log
```

---

## ⚙️ **Configuración (.env)**

```bash
BACKUP_DIR=./backups/database
BACKUP_RETENTION_DAYS=30
BACKUP_ERROR_EMAIL=admin@resona.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

---

## 📖 **Documentación Completa**

Ver: `../../SISTEMA_BACKUPS_AUTOMATICOS.md`

---

## 🆘 **Ayuda Rápida**

### **Problema: "pg_dump not found"**
Instalar PostgreSQL Client Tools:
https://www.postgresql.org/download/windows/

### **Problema: "DATABASE_URL not configured"**
Verificar que `.env` tiene `DATABASE_URL=postgresql://...`

### **Problema: Tarea no se ejecuta**
Ejecutar `setup-scheduled-backup.ps1` como Administrador

---

**Más info:** SISTEMA_BACKUPS_AUTOMATICOS.md
