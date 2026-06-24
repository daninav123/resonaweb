import { Router } from 'express';
import { availabilityController } from '../controllers/availability.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);
router.use(authorize('ADMIN', 'SUPERADMIN'));

router.get('/global', availabilityController.getGlobal);
router.get('/popular-dates', availabilityController.getPopularDates);
router.get('/:productId/calendar', availabilityController.getCalendar);
router.get('/:productId/summary', availabilityController.getSummary);
router.get('/:productId/check', availabilityController.check);

export { router as availabilityRouter };
