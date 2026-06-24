import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { contractMgmtService } from '../services/contractMgmt.service';
import { recurringExpenseService } from '../services/recurring.service';
import { vehicleService } from '../services/vehicle.service';
import { warehouseService } from '../services/warehouse.service';
import { eventTemplateService } from '../services/eventTemplate.service';
import { supplierService } from '../services/supplier.service';
import { maintenanceService } from '../services/maintenance.service';
import { commissionService } from '../services/commission.service';
import { subcontractService } from '../services/subcontract.service';
import { clientPortalService } from '../services/clientPortal.service';
import { emailCampaignService } from '../services/emailCampaign.service';
import { portfolioService } from '../services/portfolio.service';

const router = Router();
interface AuthRequest extends Request { user?: any; }

// ============= CONTRATOS =============
const contracts = Router();
contracts.use(authenticate); contracts.use(authorize('ADMIN', 'SUPERADMIN'));
contracts.get('/stats', async (_r, res, next) => { try { res.json(await contractMgmtService.getStats()); } catch (e) { next(e); } });
contracts.get('/', async (req, res, next) => { try { res.json(await contractMgmtService.list({ status: req.query.status as string, search: req.query.search as string, page: parseInt(req.query.page as string) || 1 })); } catch (e) { next(e); } });
contracts.post('/', async (req, res, next) => { try { res.status(201).json(await contractMgmtService.create(req.body)); } catch (e) { next(e); } });
contracts.post('/from-order/:orderId', async (req, res, next) => { try { res.status(201).json(await contractMgmtService.createFromOrder(req.params.orderId)); } catch (e) { next(e); } });
contracts.get('/:id', async (req, res, next) => { try { res.json(await contractMgmtService.getById(req.params.id)); } catch (e) { next(e); } });
contracts.patch('/:id', async (req, res, next) => { try { res.json(await contractMgmtService.update(req.params.id, req.body)); } catch (e) { next(e); } });
contracts.delete('/:id', async (req, res, next) => { try { await contractMgmtService.delete(req.params.id); res.json({ success: true }); } catch (e) { next(e); } });
contracts.post('/:id/send', async (req, res, next) => { try { res.json(await contractMgmtService.send(req.params.id)); } catch (e) { next(e); } });
contracts.post('/:id/duplicate', async (req, res, next) => { try { res.status(201).json(await contractMgmtService.duplicate(req.params.id)); } catch (e) { next(e); } });
contracts.get('/:id/pdf', async (req, res, next) => { try { const pdf = await contractMgmtService.generatePDF(req.params.id); res.setHeader('Content-Type', 'application/pdf'); res.setHeader('Content-Disposition', `attachment; filename=contrato-${req.params.id}.pdf`); res.send(pdf); } catch (e) { next(e); } });
contracts.get('/:id/order-pdf/:orderId', async (req, res, next) => { try { const pdf = await contractMgmtService.generateOrderContractPDF(req.params.orderId); res.setHeader('Content-Type', 'application/pdf'); res.send(pdf); } catch (e) { next(e); } });

// Ruta publica para ver/firmar contrato
const contractPublic = Router();
contractPublic.get('/view/:token', async (req, res, next) => { try { res.json(await contractMgmtService.getByToken(req.params.token)); } catch (e) { next(e); } });
contractPublic.post('/sign/:token', async (req, res, next) => { try { res.json(await contractMgmtService.sign(req.params.token, { ...req.body, signedByIp: req.ip })); } catch (e) { next(e); } });

// ============= GASTOS RECURRENTES =============
const expenses = Router();
expenses.use(authenticate); expenses.use(authorize('ADMIN', 'SUPERADMIN'));
expenses.get('/stats', async (_r, res, next) => { try { res.json(await recurringExpenseService.getStats()); } catch (e) { next(e); } });
expenses.get('/payment-history', async (_r, res, next) => { try { res.json(await recurringExpenseService.getPaymentHistory()); } catch (e) { next(e); } });
expenses.get('/projections/:months', async (req, res, next) => { try { res.json(await recurringExpenseService.getProjections(parseInt(req.params.months) || 12)); } catch (e) { next(e); } });
expenses.get('/', async (req, res, next) => { try { res.json(await recurringExpenseService.list({ category: req.query.category as string, page: parseInt(req.query.page as string) || 1 })); } catch (e) { next(e); } });
expenses.post('/', async (req, res, next) => { try { res.status(201).json(await recurringExpenseService.create(req.body)); } catch (e) { next(e); } });
expenses.patch('/:id', async (req, res, next) => { try { res.json(await recurringExpenseService.update(req.params.id, req.body)); } catch (e) { next(e); } });
expenses.delete('/:id', async (req, res, next) => { try { await recurringExpenseService.delete(req.params.id); res.json({ success: true }); } catch (e) { next(e); } });
expenses.post('/:id/mark-paid', async (req, res, next) => { try { res.json(await recurringExpenseService.markPaid(req.params.id)); } catch (e) { next(e); } });

// ============= VEHICULOS =============
const vehicles = Router();
vehicles.use(authenticate); vehicles.use(authorize('ADMIN', 'SUPERADMIN'));
vehicles.get('/alerts', async (_r, res, next) => { try { res.json(await vehicleService.getAlerts()); } catch (e) { next(e); } });
vehicles.get('/calendar/range', async (req, res, next) => { try { res.json(await vehicleService.getCalendar(req.query.start as string, req.query.end as string)); } catch (e) { next(e); } });
vehicles.get('/assignments', async (req, res, next) => { try { res.json(await vehicleService.listAssignments({ vehicleId: req.query.vehicleId as string, startDate: req.query.start as string, endDate: req.query.end as string, eventId: req.query.eventId as string })); } catch (e) { next(e); } });
vehicles.post('/assignments', async (req, res, next) => { try { res.status(201).json(await vehicleService.createAssignment(req.body)); } catch (e) { next(e); } });
vehicles.patch('/assignments/:id', async (req, res, next) => { try { res.json(await vehicleService.updateAssignment(req.params.id, req.body)); } catch (e) { next(e); } });
vehicles.delete('/assignments/:id', async (req, res, next) => { try { await vehicleService.deleteAssignment(req.params.id); res.json({ success: true }); } catch (e) { next(e); } });
vehicles.get('/', async (req, res, next) => { try { res.json(await vehicleService.list({ status: req.query.status as string })); } catch (e) { next(e); } });
vehicles.post('/', async (req, res, next) => { try { res.status(201).json(await vehicleService.create(req.body)); } catch (e) { next(e); } });
vehicles.get('/:id', async (req, res, next) => { try { res.json(await vehicleService.getById(req.params.id)); } catch (e) { next(e); } });
vehicles.patch('/:id', async (req, res, next) => { try { res.json(await vehicleService.update(req.params.id, req.body)); } catch (e) { next(e); } });
vehicles.delete('/:id', async (req, res, next) => { try { await vehicleService.delete(req.params.id); res.json({ success: true }); } catch (e) { next(e); } });

// ============= ALMACEN =============
const warehouse = Router();
warehouse.use(authenticate); warehouse.use(authorize('ADMIN', 'SUPERADMIN'));
warehouse.get('/locations', async (_r, res, next) => { try { res.json(await warehouseService.listLocations()); } catch (e) { next(e); } });
warehouse.post('/locations', async (req, res, next) => { try { res.status(201).json(await warehouseService.createLocation(req.body)); } catch (e) { next(e); } });
warehouse.patch('/locations/:id', async (req, res, next) => { try { res.json(await warehouseService.updateLocation(req.params.id, req.body)); } catch (e) { next(e); } });
warehouse.delete('/locations/:id', async (req, res, next) => { try { await warehouseService.deleteLocation(req.params.id); res.json({ success: true }); } catch (e) { next(e); } });
warehouse.get('/stats', async (_r, res, next) => { try { res.json(await warehouseService.getStats()); } catch (e) { next(e); } });
warehouse.get('/empty', async (_r, res, next) => { try { res.json(await warehouseService.getEmptyLocations()); } catch (e) { next(e); } });
warehouse.get('/zone/:zone', async (req, res, next) => { try { res.json(await warehouseService.getByZone(req.params.zone)); } catch (e) { next(e); } });
warehouse.post('/locations/:id/update-items', async (req, res, next) => { try { res.json(await warehouseService.updateItems(req.params.id, req.body.currentItems)); } catch (e) { next(e); } });
warehouse.post('/locations/:id/clear', async (req, res, next) => { try { res.json(await warehouseService.clearLocation(req.params.id)); } catch (e) { next(e); } });
warehouse.get('/locations-with-items', async (_r, res, next) => { try { res.json(await warehouseService.listLocationsWithItems()); } catch (e) { next(e); } });
warehouse.get('/locations/:id/items', async (req, res, next) => { try { res.json(await warehouseService.getLocationItems(req.params.id)); } catch (e) { next(e); } });
warehouse.post('/locations/:id/items', async (req, res, next) => { try { res.status(201).json(await warehouseService.addItem(req.params.id, req.body)); } catch (e) { next(e); } });
warehouse.patch('/items/:id', async (req, res, next) => { try { res.json(await warehouseService.updateItem(req.params.id, req.body)); } catch (e) { next(e); } });
warehouse.delete('/items/:id', async (req, res, next) => { try { await warehouseService.removeItem(req.params.id); res.json({ success: true }); } catch (e) { next(e); } });
warehouse.get('/find-product/:productId', async (req, res, next) => { try { res.json(await warehouseService.findProductLocation(req.params.productId)); } catch (e) { next(e); } });

// ============= PLANTILLAS DE EVENTO =============
const templates = Router();
templates.use(authenticate); templates.use(authorize('ADMIN', 'SUPERADMIN'));
templates.get('/', async (req, res, next) => { try { res.json(await eventTemplateService.list({ eventType: req.query.eventType as string, search: req.query.search as string, page: parseInt(req.query.page as string) || 1 })); } catch (e) { next(e); } });
templates.post('/', async (req, res, next) => { try { res.status(201).json(await eventTemplateService.create(req.body)); } catch (e) { next(e); } });
templates.post('/create-event/:id', async (req, res, next) => { try { res.status(201).json(await eventTemplateService.createEventFromTemplate(req.params.id, req.body)); } catch (e) { next(e); } });
templates.get('/:id', async (req, res, next) => { try { res.json(await eventTemplateService.getById(req.params.id)); } catch (e) { next(e); } });
templates.patch('/:id', async (req, res, next) => { try { res.json(await eventTemplateService.update(req.params.id, req.body)); } catch (e) { next(e); } });
templates.delete('/:id', async (req, res, next) => { try { await eventTemplateService.delete(req.params.id); res.json({ success: true }); } catch (e) { next(e); } });

// ============= PROVEEDORES =============
const suppliers = Router();
suppliers.use(authenticate); suppliers.use(authorize('ADMIN', 'SUPERADMIN'));
suppliers.get('/stats', async (_r, res, next) => { try { res.json(await supplierService.getStats()); } catch (e) { next(e); } });
suppliers.get('/', async (req, res, next) => { try { res.json(await supplierService.list({ category: req.query.category as string, search: req.query.search as string, page: parseInt(req.query.page as string) || 1 })); } catch (e) { next(e); } });
suppliers.post('/', async (req, res, next) => { try { res.status(201).json(await supplierService.create(req.body)); } catch (e) { next(e); } });
suppliers.get('/:id', async (req, res, next) => { try { res.json(await supplierService.getById(req.params.id)); } catch (e) { next(e); } });
suppliers.get('/:id/purchases', async (req, res, next) => { try { res.json(await supplierService.getPurchases(req.params.id)); } catch (e) { next(e); } });
suppliers.post('/:id/purchases', async (req, res, next) => { try { res.status(201).json(await supplierService.addPurchase(req.params.id, req.body)); } catch (e) { next(e); } });
suppliers.patch('/:id', async (req, res, next) => { try { res.json(await supplierService.update(req.params.id, req.body)); } catch (e) { next(e); } });
suppliers.delete('/:id', async (req, res, next) => { try { await supplierService.delete(req.params.id); res.json({ success: true }); } catch (e) { next(e); } });

// ============= MANTENIMIENTO =============
const maintenance = Router();
maintenance.use(authenticate); maintenance.use(authorize('ADMIN', 'SUPERADMIN'));
maintenance.get('/stats', async (_r, res, next) => { try { res.json(await maintenanceService.getStats()); } catch (e) { next(e); } });
maintenance.get('/', async (req, res, next) => { try { res.json(await maintenanceService.list({ status: req.query.status as string, type: req.query.type as string, search: req.query.search as string, page: parseInt(req.query.page as string) || 1 })); } catch (e) { next(e); } });
maintenance.post('/', async (req, res, next) => { try { res.status(201).json(await maintenanceService.create(req.body)); } catch (e) { next(e); } });
maintenance.get('/:id', async (req, res, next) => { try { res.json(await maintenanceService.getById(req.params.id)); } catch (e) { next(e); } });
maintenance.patch('/:id', async (req, res, next) => { try { res.json(await maintenanceService.update(req.params.id, req.body)); } catch (e) { next(e); } });
maintenance.delete('/:id', async (req, res, next) => { try { await maintenanceService.delete(req.params.id); res.json({ success: true }); } catch (e) { next(e); } });

// ============= COMISIONES (Admin) =============
const commissions = Router();
commissions.use(authenticate); commissions.use(authorize('ADMIN', 'SUPERADMIN'));
commissions.get('/', async (req, res, next) => { try { const filters: any = {}; if (req.query.status) filters.status = req.query.status; if (req.query.userId) filters.userId = req.query.userId; res.json(await commissionService.getAllCommissions(filters)); } catch (e) { next(e); } });
commissions.post('/:id/pay', async (req, res, next) => { try { res.json(await commissionService.markAsPaid(req.params.id, (req as any).user?.email || 'admin', req.body.paymentMethod || 'transferencia', req.body.paymentNotes)); } catch (e) { next(e); } });

// ============= SUBCONTRATACIONES =============
const subcontracts = Router();
subcontracts.use(authenticate); subcontracts.use(authorize('ADMIN', 'SUPERADMIN'));
subcontracts.get('/stats', async (_r, res, next) => { try { res.json(await subcontractService.getStats()); } catch (e) { next(e); } });
subcontracts.get('/', async (req, res, next) => { try { res.json(await subcontractService.list({ status: req.query.status as string, search: req.query.search as string, eventId: req.query.eventId as string, page: parseInt(req.query.page as string) || 1 })); } catch (e) { next(e); } });
subcontracts.post('/', async (req, res, next) => { try { res.status(201).json(await subcontractService.create(req.body)); } catch (e) { next(e); } });
subcontracts.get('/:id', async (req, res, next) => { try { res.json(await subcontractService.getById(req.params.id)); } catch (e) { next(e); } });
subcontracts.patch('/:id', async (req, res, next) => { try { res.json(await subcontractService.update(req.params.id, req.body)); } catch (e) { next(e); } });
subcontracts.delete('/:id', async (req, res, next) => { try { await subcontractService.delete(req.params.id); res.json({ success: true }); } catch (e) { next(e); } });

// ============= PORTAL CLIENTE (acceso autenticado) =============
const clientPortal = Router();
clientPortal.use(authenticate);
clientPortal.get('/my-data', async (req, res, next) => { try { const email = (req as any).user?.email; if (!email) return res.status(401).json({ error: 'No autenticado' }); res.json(await clientPortalService.getClientDataByEmail(email)); } catch (e) { next(e); } });
// Admin: consultar portal de cualquier cliente por email
const clientPortalAdmin = Router();
clientPortalAdmin.use(authenticate); clientPortalAdmin.use(authorize('ADMIN', 'SUPERADMIN'));
clientPortalAdmin.get('/:email', async (req, res, next) => { try { res.json(await clientPortalService.getClientDataByEmail(req.params.email)); } catch (e) { next(e); } });

// ============= EMAIL CAMPAIGNS =============
const emailCampaigns = Router();
emailCampaigns.use(authenticate); emailCampaigns.use(authorize('ADMIN', 'SUPERADMIN'));
emailCampaigns.get('/stats', async (_r, res, next) => { try { res.json(await emailCampaignService.getStats()); } catch (e) { next(e); } });
emailCampaigns.get('/', async (req, res, next) => { try { res.json(await emailCampaignService.list({ status: req.query.status as string, page: parseInt(req.query.page as string) || 1 })); } catch (e) { next(e); } });
emailCampaigns.post('/', async (req, res, next) => { try { res.status(201).json(await emailCampaignService.create(req.body)); } catch (e) { next(e); } });
emailCampaigns.patch('/:id', async (req, res, next) => { try { res.json(await emailCampaignService.update(req.params.id, req.body)); } catch (e) { next(e); } });
emailCampaigns.delete('/:id', async (req, res, next) => { try { await emailCampaignService.delete(req.params.id); res.json({ success: true }); } catch (e) { next(e); } });
emailCampaigns.post('/:id/send', async (req, res, next) => { try { res.json(await emailCampaignService.send(req.params.id)); } catch (e) { next(e); } });

// ============= PORTFOLIO =============
const portfolio = Router();
portfolio.use(authenticate); portfolio.use(authorize('ADMIN', 'SUPERADMIN'));
portfolio.get('/stats', async (_r, res, next) => { try { res.json(await portfolioService.getStats()); } catch (e) { next(e); } });
portfolio.get('/', async (req, res, next) => { try { res.json(await portfolioService.list({ published: req.query.published === 'true' ? true : req.query.published === 'false' ? false : undefined, featured: req.query.featured === 'true' ? true : undefined, page: parseInt(req.query.page as string) || 1 })); } catch (e) { next(e); } });
portfolio.post('/', async (req, res, next) => { try { res.status(201).json(await portfolioService.create(req.body)); } catch (e) { next(e); } });
portfolio.get('/:id', async (req, res, next) => { try { res.json(await portfolioService.getById(req.params.id)); } catch (e) { next(e); } });
portfolio.patch('/:id', async (req, res, next) => { try { res.json(await portfolioService.update(req.params.id, req.body)); } catch (e) { next(e); } });
portfolio.delete('/:id', async (req, res, next) => { try { await portfolioService.delete(req.params.id); res.json({ success: true }); } catch (e) { next(e); } });

export { contracts as contractsRouter, contractPublic as contractPublicRouter, expenses as expensesRouter, vehicles as vehiclesRouter, warehouse as warehouseRouter, templates as templatesRouter, suppliers as suppliersRouter, maintenance as maintenanceRouter, commissions as commissionsRouter, subcontracts as subcontractsRouter, clientPortal as clientPortalRouter, clientPortalAdmin as clientPortalAdminRouter, emailCampaigns as emailCampaignsRouter, portfolio as portfolioRouter };
