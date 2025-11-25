import express from 'express';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

// Importar controlador (usaremos require temporalmente)
const redsysController = require('../../controllers/redsys.controller');

// Crear formulario de pago
router.post('/payment/:orderId', auth, redsysController.createPaymentForm);

// Verificar resultado del pago
router.get('/verify/:orderId', auth, redsysController.verifyPayment);

// Webhook de notificación (NO requiere auth - viene de Redsys)
router.post('/notification', redsysController.handleNotification);

export { router as redsysRouter };
