import { Router } from 'express';
import { customerController } from '../controllers/customer.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All customer routes require authentication
router.use(authenticate);

// Customer self-service routes
router.get('/profile', customerController.getCustomerProfile);
router.get('/history', customerController.getCustomerHistory);
router.get('/stats', customerController.getCustomerStats);
router.get('/documents', customerController.getCustomerDocuments);
router.get('/export', customerController.exportCustomerData);

// Admin routes
router.get(
  '/search',
  authorize('ADMIN', 'SUPERADMIN'),
  customerController.searchCustomers
);

// Customer management (admin)
router.get('/:id/profile', customerController.getCustomerProfile);
router.get('/:id/history', customerController.getCustomerHistory);
router.get('/:id/stats', customerController.getCustomerStats);
router.get('/:id/documents', customerController.getCustomerDocuments);
router.get('/:id/export', customerController.exportCustomerData);

router.post(
  '/:id/notes',
  authorize('ADMIN', 'SUPERADMIN'),
  customerController.addCustomerNote
);

router.get(
  '/:id/notes',
  authorize('ADMIN', 'SUPERADMIN'),
  customerController.getCustomerNotes
);

router.patch(
  '/:id/status',
  authorize('ADMIN', 'SUPERADMIN'),
  customerController.setCustomerStatus
);

export { router as customerRouter };
