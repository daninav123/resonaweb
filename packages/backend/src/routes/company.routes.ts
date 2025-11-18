import { Router } from 'express';
import { companyController } from '../controllers/company.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Get company settings (public for invoices)
router.get(
  '/settings',
  companyController.getSettings
);

// Update company settings (admin only)
router.put(
  '/settings',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  companyController.updateSettings
);

export { router as companyRouter };
