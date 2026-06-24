import { Router } from 'express';
import { roleDefinitionController } from '../controllers/roleDefinition.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Ruta pública para obtener roles activos (el frontend lo necesita al cargar el menú)
router.get('/', roleDefinitionController.getAll);

// Rutas de administración - solo ADMIN y SUPERADMIN
router.get('/admin', authenticate, authorize('ADMIN', 'SUPERADMIN'), roleDefinitionController.getAllAdmin);
router.get('/available-paths', authenticate, authorize('ADMIN', 'SUPERADMIN'), roleDefinitionController.getAvailablePaths);
router.post('/', authenticate, authorize('ADMIN', 'SUPERADMIN'), roleDefinitionController.create);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPERADMIN'), roleDefinitionController.update);
router.delete('/:id', authenticate, authorize('SUPERADMIN'), roleDefinitionController.delete);
router.post('/seed', authenticate, authorize('SUPERADMIN'), roleDefinitionController.seed);

export { router as roleDefinitionRouter };
