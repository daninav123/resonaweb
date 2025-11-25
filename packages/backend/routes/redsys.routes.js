const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const redsysController = require('../controllers/redsys.controller');

// Crear formulario de pago
router.post('/payment/:orderId', auth, redsysController.createPaymentForm);

// Verificar resultado del pago
router.get('/verify/:orderId', auth, redsysController.verifyPayment);

// Webhook de notificación (NO requiere auth - viene de Redsys)
router.post('/notification', redsysController.handleNotification);

module.exports = router;
