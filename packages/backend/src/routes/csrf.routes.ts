import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getCsrfToken } from '../middleware/csrf.middleware';

const router = Router();

/**
 * GET /api/v1/csrf-token
 * Obtener un token CSRF válido
 * Requiere autenticación
 */
router.get('/csrf-token', authenticate, getCsrfToken);

export default router;
