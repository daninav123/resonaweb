import { Router } from 'express';
import { contactController } from '../controllers/contact.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   POST /api/v1/contact
 * @desc    Enviar mensaje de contacto (Público)
 * @access  Public
 */
router.post('/', contactController.sendContactMessage.bind(contactController));

/**
 * @route   GET /api/v1/contact/messages
 * @desc    Obtener mensajes de contacto (Admin)
 * @access  Admin
 */
router.get('/messages', authenticate, authorize('ADMIN', 'SUPERADMIN'), contactController.getContactMessages.bind(contactController));

/**
 * @route   PATCH /api/v1/contact/messages/:id
 * @desc    Actualizar estado de mensaje (Admin)
 * @access  Admin
 */
router.patch('/messages/:id', authenticate, authorize('ADMIN', 'SUPERADMIN'), contactController.updateContactStatus.bind(contactController));

export default router;
