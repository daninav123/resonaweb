import { Router } from 'express';
import { invoiceController } from '../controllers/invoice.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All invoice routes require authentication
router.use(authenticate);

// Generate invoice for order
router.post(
  '/generate/:orderId',
  invoiceController.generateInvoice
);

// Get invoice by ID
router.get(
  '/:id',
  invoiceController.getInvoice
);

// Download invoice PDF
router.get(
  '/download/:id',
  invoiceController.downloadInvoice
);

// Send invoice by email
router.post(
  '/:id/send',
  invoiceController.sendInvoice
);

// Mark invoice as paid (admin only)
router.patch(
  '/:id/mark-paid',
  authorize('ADMIN', 'SUPERADMIN'),
  invoiceController.markAsPaid
);

export { router as invoiceRouter };
