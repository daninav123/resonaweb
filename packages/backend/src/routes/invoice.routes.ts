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

// Get all invoices (admin only)
router.get(
  '/',
  authorize('ADMIN', 'SUPERADMIN'),
  invoiceController.getAllInvoices
);

// Generate Facturae XML (admin only)
router.post(
  '/:id/facturae',
  authorize('ADMIN', 'SUPERADMIN'),
  invoiceController.generateFacturae
);

// Download Facturae XML (admin only)
router.get(
  '/:id/facturae/download',
  authorize('ADMIN', 'SUPERADMIN'),
  invoiceController.downloadFacturae
);

// Create manual invoice (admin only - for non-web events)
router.post(
  '/manual',
  authorize('ADMIN', 'SUPERADMIN'),
  invoiceController.createManualInvoice
);

// Download all invoices as ZIP (admin only)
router.get(
  '/download-all',
  authorize('ADMIN', 'SUPERADMIN'),
  invoiceController.downloadAllInvoices
);

// Delete invoice (admin only)
router.delete(
  '/:id',
  authorize('ADMIN', 'SUPERADMIN'),
  invoiceController.deleteInvoice
);

export { router as invoiceRouter };
