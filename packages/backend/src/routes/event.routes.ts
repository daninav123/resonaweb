import { Router } from 'express';
import { eventController } from '../controllers/event.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All event routes require admin authentication
router.use(authenticate);
router.use(authorize('ADMIN', 'SUPERADMIN'));

// CRUD principal
router.get('/stats', eventController.getStats);
router.get('/', eventController.list);
router.post('/', eventController.create);
router.get('/:id', eventController.getById);
router.put('/:id', eventController.update);
router.delete('/:id', eventController.delete);
router.patch('/:id/phase', eventController.changePhase);

// Timeline
router.post('/:id/timeline', eventController.addTimelineItem);
router.put('/:id/timeline/:itemId', eventController.updateTimelineItem);
router.delete('/:id/timeline/:itemId', eventController.deleteTimelineItem);
router.patch('/:id/timeline/:itemId/toggle', eventController.toggleTimelineItem);

// Checklist
router.post('/:id/checklist', eventController.addChecklistItem);
router.patch('/:id/checklist/:itemId/toggle', eventController.toggleChecklistItem);
router.delete('/:id/checklist/:itemId', eventController.deleteChecklistItem);

// Staff
router.post('/:id/staff', eventController.addStaff);
router.put('/:id/staff/:itemId', eventController.updateStaff);
router.delete('/:id/staff/:itemId', eventController.removeStaff);

// Equipment
router.post('/:id/equipment', eventController.addEquipment);
router.put('/:id/equipment/:itemId', eventController.updateEquipment);
router.delete('/:id/equipment/:itemId', eventController.removeEquipment);

// Notes
router.post('/:id/notes', eventController.addNote);
router.delete('/:id/notes/:itemId', eventController.deleteNote);

// Incidents
router.post('/:id/incidents', eventController.addIncident);
router.patch('/:id/incidents/:itemId/resolve', eventController.resolveIncident);

// Documents
router.post('/:id/documents', eventController.addDocument);
router.delete('/:id/documents/:itemId', eventController.removeDocument);

export { router as eventRouter };
