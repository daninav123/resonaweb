import { Router } from 'express';
import { calendarController } from '../controllers/calendar.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación de admin
router.use(authenticate);
router.use(authorize('ADMIN', 'SUPERADMIN'));

// Obtener eventos del calendario
router.get('/events', calendarController.getCalendarEvents);

// Obtener estadísticas del calendario
router.get('/stats', calendarController.getCalendarStats);

// Verificar disponibilidad de fechas
router.get('/availability', calendarController.getDateAvailability);

// Exportar calendario a formato iCalendar (.ics)
router.get('/export', calendarController.exportCalendar);

export { router as calendarRouter };
