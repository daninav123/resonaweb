import { Router } from 'express';
import { packController } from '../controllers/pack.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Rutas públicas
router.get('/', packController.getPacks.bind(packController));
router.get('/:id', packController.getPackById.bind(packController));
router.post('/:id/check-availability', packController.checkAvailability.bind(packController));
router.get('/:id/max-availability', packController.getMaxAvailability.bind(packController));

// Rutas admin
router.post('/', authenticate, authorize('ADMIN', 'SUPERADMIN'), packController.createPack.bind(packController));
router.put('/:id', authenticate, authorize('ADMIN', 'SUPERADMIN'), packController.updatePack.bind(packController));
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPERADMIN'), packController.deletePack.bind(packController));

export default router;
