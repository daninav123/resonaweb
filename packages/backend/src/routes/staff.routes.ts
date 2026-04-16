import { Router } from 'express';
import { staffController } from '../controllers/staff.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);
router.use(authorize('ADMIN', 'SUPERADMIN'));

router.get('/stats', staffController.getStats);
router.get('/availability-calendar', staffController.getAvailabilityCalendar);
router.get('/available-for-event', staffController.getAvailableForEvent);
router.get('/expiring-documents', staffController.getExpiringDocuments);
router.get('/', staffController.list);
router.post('/', staffController.create);
router.get('/:id', staffController.getById);
router.patch('/:id', staffController.update);
router.delete('/:id', staffController.delete);
router.post('/:id/availability', staffController.addAvailability);
router.post('/:id/availability/bulk', staffController.bulkAddAvailability);
router.delete('/:id/availability/:availId', staffController.deleteAvailability);
router.post('/:id/work-logs', staffController.addWorkLog);
router.patch('/:id/work-logs/:logId/toggle-paid', staffController.toggleWorkLogPaid);
router.get('/:id/monthly-report', staffController.getMonthlyReport);

export { router as staffRouter };
