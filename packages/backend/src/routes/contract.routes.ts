import { Router } from 'express';
import { contractController } from '../controllers/contract.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Generar contrato (solo admins)
router.get('/:orderId', authenticate, authorize('ADMIN', 'SUPERADMIN'), contractController.generateContract.bind(contractController));

export default router;
