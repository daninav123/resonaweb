import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { backupController } from '../controllers/backup.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Asegurar que existe la carpeta temp
const tempDir = path.join(__dirname, '../../../../backups/temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configurar multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Solo permitir JSON y ZIP
    if (file.originalname.endsWith('.json') || file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se aceptan archivos JSON o ZIP'));
    }
  },
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB máximo
  }
});

// Rutas con autenticación de ADMIN
router.get('/', authenticate, authorize('ADMIN', 'SUPERADMIN'), backupController.listBackups.bind(backupController));
router.post('/create', authenticate, authorize('ADMIN', 'SUPERADMIN'), backupController.createBackup.bind(backupController));
router.post('/restore', authenticate, authorize('ADMIN', 'SUPERADMIN'), backupController.restoreBackup.bind(backupController));
router.get('/download/:filename', authenticate, authorize('ADMIN', 'SUPERADMIN'), backupController.downloadBackup.bind(backupController));

// Upload con multer primero, luego autenticación
router.post('/upload', upload.single('file'), authenticate, authorize('ADMIN', 'SUPERADMIN'), backupController.uploadBackup.bind(backupController));

export default router;
