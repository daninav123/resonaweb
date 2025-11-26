import { Router } from 'express';
import { backupController } from '../controllers/backup.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación de ADMIN
router.use(authenticate);
router.use(authorize('ADMIN', 'SUPERADMIN'));

router.get('/', backupController.listBackups.bind(backupController));
router.post('/create', backupController.createBackup.bind(backupController));
router.post('/restore', backupController.restoreBackup.bind(backupController));
router.get('/download/:filename', backupController.downloadBackup.bind(backupController));

export default router;
