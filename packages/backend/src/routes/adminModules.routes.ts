import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { contractMgmtService } from '../services/contractMgmt.service';
import { recurringExpenseService } from '../services/recurring.service';
import { vehicleService } from '../services/vehicle.service';
import { warehouseService } from '../services/warehouse.service';

const router = Router();
interface AuthRequest extends Request { user?: any; }

// ============= CONTRATOS =============
const contracts = Router();
contracts.use(authenticate); contracts.use(authorize('ADMIN', 'SUPERADMIN'));
contracts.get('/stats', async (_r, res, next) => { try { res.json(await contractMgmtService.getStats()); } catch (e) { next(e); } });
contracts.get('/', async (req, res, next) => { try { res.json(await contractMgmtService.list({ status: req.query.status as string, search: req.query.search as string, page: parseInt(req.query.page as string) || 1 })); } catch (e) { next(e); } });
contracts.post('/', async (req, res, next) => { try { res.status(201).json(await contractMgmtService.create(req.body)); } catch (e) { next(e); } });
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
expenses.get('/', async (req, res, next) => { try { res.json(await recurringExpenseService.list({ category: req.query.category as string, page: parseInt(req.query.page as string) || 1 })); } catch (e) { next(e); } });
expenses.post('/', async (req, res, next) => { try { res.status(201).json(await recurringExpenseService.create(req.body)); } catch (e) { next(e); } });
expenses.patch('/:id', async (req, res, next) => { try { res.json(await recurringExpenseService.update(req.params.id, req.body)); } catch (e) { next(e); } });
expenses.delete('/:id', async (req, res, next) => { try { await recurringExpenseService.delete(req.params.id); res.json({ success: true }); } catch (e) { next(e); } });
expenses.post('/:id/mark-paid', async (req, res, next) => { try { res.json(await recurringExpenseService.markPaid(req.params.id)); } catch (e) { next(e); } });

// ============= VEHICULOS =============
const vehicles = Router();
vehicles.use(authenticate); vehicles.use(authorize('ADMIN', 'SUPERADMIN'));
vehicles.get('/alerts', async (_r, res, next) => { try { res.json(await vehicleService.getAlerts()); } catch (e) { next(e); } });
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

export { contracts as contractsRouter, contractPublic as contractPublicRouter, expenses as expensesRouter, vehicles as vehiclesRouter, warehouse as warehouseRouter };
