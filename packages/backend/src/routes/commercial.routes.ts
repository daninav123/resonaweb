import { Router } from 'express';
import { commercialController } from '../controllers/commercial.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación y rol COMMERCIAL
router.use(authenticate);
router.use(authorize('COMMERCIAL', 'ADMIN', 'SUPERADMIN'));

// Dashboard
router.get('/dashboard', commercialController.getDashboard);

// Presupuestos
router.get('/quotes', commercialController.getQuotes);
router.post('/quotes', commercialController.createQuote);
router.put('/quotes/:id', commercialController.updateQuote);
router.delete('/quotes/:id', commercialController.deleteQuote);

// Comisiones
router.get('/commissions', commercialController.getCommissions);
router.get('/commissions/summary', commercialController.getCommissionsSummary);

// Leads
router.get('/leads', commercialController.getLeads);
router.get('/leads/stats', commercialController.getLeadsStats);
router.get('/leads/pending-followups', commercialController.getPendingFollowUps);
router.get('/leads/:id', commercialController.getLeadById);
router.post('/leads', commercialController.createLead);
router.put('/leads/:id', commercialController.updateLead);
router.delete('/leads/:id', commercialController.deleteLead);
router.post('/leads/:id/convert', commercialController.convertLead);

export default router;
