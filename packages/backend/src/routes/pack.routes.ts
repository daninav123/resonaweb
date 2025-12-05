import { Router } from 'express';
import { packController } from '../controllers/pack.controller';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth.middleware';

const router = Router();

// Rutas públicas (sin autenticación requerida)
router.get('/', optionalAuthenticate, packController.getPacks.bind(packController));
router.get('/:id', optionalAuthenticate, packController.getPackById.bind(packController));
router.post('/:id/check-availability', optionalAuthenticate, packController.checkAvailability.bind(packController));
router.get('/:id/max-availability', optionalAuthenticate, packController.getMaxAvailability.bind(packController));

// Rutas admin
router.post('/', authenticate, authorize('ADMIN', 'SUPERADMIN'), packController.createPack.bind(packController));
router.put('/:id', authenticate, authorize('ADMIN', 'SUPERADMIN'), packController.updatePack.bind(packController));
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPERADMIN'), packController.deletePack.bind(packController));

export default router;

// NOTE: GET /packs usa optionalAuthenticate para permitir acceso sin login
// Updated: 2025-12-03 17:51 - Forzar recompilación
