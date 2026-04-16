import { Router } from 'express';
import { crmController } from '../controllers/crm.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN', 'SUPERADMIN'));

// Clientes
router.get('/stats', crmController.getStats);
router.get('/tags', crmController.getTags);
router.get('/customers', crmController.listCustomers);
router.get('/customers/:id', crmController.getCustomerProfile);
router.patch('/customers/:id/crm', crmController.updateCRM);
router.post('/customers/:id/recalculate-scoring', crmController.recalculateScoring);

// Comunicaciones
router.get('/customers/:id/communications', crmController.getCommunications);
router.post('/customers/:id/communications', crmController.addCommunication);

// Tareas
router.post('/customers/:id/tasks', crmController.addTask);
router.patch('/customers/:id/tasks/:taskId/toggle', crmController.toggleTask);
router.delete('/customers/:id/tasks/:taskId', crmController.deleteTask);

export { router as crmRouter };
