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

// Mark invoice as paid (admin/accountant)
router.patch(
  '/:id/mark-paid',
  authorize('ADMIN', 'SUPERADMIN', 'ACCOUNTANT'),
  invoiceController.markAsPaid
);

// Get all invoices (admin/accountant)
router.get(
  '/',
  authorize('ADMIN', 'SUPERADMIN', 'ACCOUNTANT'),
  invoiceController.getAllInvoices
);

// Generate Facturae XML (admin/accountant)
router.post(
  '/:id/facturae',
  authorize('ADMIN', 'SUPERADMIN', 'ACCOUNTANT'),
  invoiceController.generateFacturae
);

// Download Facturae XML (admin/accountant)
router.get(
  '/:id/facturae/download',
  authorize('ADMIN', 'SUPERADMIN', 'ACCOUNTANT'),
  invoiceController.downloadFacturae
);

// Create manual invoice (admin/accountant)
router.post(
  '/manual',
  authorize('ADMIN', 'SUPERADMIN', 'ACCOUNTANT'),
  invoiceController.createManualInvoice
);

// Download all invoices as ZIP (admin/accountant)
router.get(
  '/download-all',
  authorize('ADMIN', 'SUPERADMIN', 'ACCOUNTANT'),
  invoiceController.downloadAllInvoices
);

// Delete invoice (admin only)
router.delete(
  '/:id',
  authorize('ADMIN', 'SUPERADMIN'),
  invoiceController.deleteInvoice
);

export { router as invoiceRouter };
