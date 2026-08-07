import { Router } from 'express';
import { leadClickController } from '../controllers/leadClick.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   POST /api/v1/lead-clicks
 * @desc    Registrar clic en enlace de contacto directo (Público)
 * @access  Public
 */
router.post('/', leadClickController.register.bind(leadClickController));

/**
 * @route   GET /api/v1/lead-clicks/ref/:ref
 * @desc    Buscar el origen de una conversación por su código (Admin)
 * @access  Admin
 */
router.get('/ref/:ref', authenticate, authorize('ADMIN', 'SUPERADMIN'), leadClickController.getByRef.bind(leadClickController));

/**
 * @route   GET /api/v1/lead-clicks
 * @desc    Listar clics con filtros y agregado por sección (Admin)
 * @access  Admin
 */
router.get('/', authenticate, authorize('ADMIN', 'SUPERADMIN'), leadClickController.list.bind(leadClickController));

export default router;
