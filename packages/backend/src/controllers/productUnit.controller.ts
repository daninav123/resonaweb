import { Request, Response, NextFunction } from 'express';
import { productUnitService } from '../services/productUnit.service';
import { UnitStatus, UnitCondition } from '@prisma/client';

const getPerformer = (req: Request) => ({
  id: (req as any).user?.id,
  name: (req as any).user ? `${(req as any).user.firstName} ${(req as any).user.lastName}`.trim() : undefined,
});

export const productUnitController = {
  async createUnits(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const { quantity = 1, ...data } = req.body;
      const { id, name } = getPerformer(req);
      const units = await productUnitService.createUnits(productId, Number(quantity), data, id, name);
      res.status(201).json({ success: true, data: units, count: units.length });
    } catch (err) { next(err); }
  },

  async getUnitsByProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const units = await productUnitService.getUnitsByProduct(productId);
      res.json({ success: true, data: units });
    } catch (err) { next(err); }
  },

  async listUnits(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId, status, condition, search, page, limit } = req.query as any;
      const result = await productUnitService.listUnits({
        productId, status, condition, search,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 50,
      });
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  },

  async getUnitByBarcode(req: Request, res: Response, next: NextFunction) {
    try {
      const { barcode } = req.params;
      const unit = await productUnitService.getUnitByBarcode(decodeURIComponent(barcode));
      res.json({ success: true, data: unit });
    } catch (err) { next(err); }
  },

  async getUnitById(req: Request, res: Response, next: NextFunction) {
    try {
      const { unitId } = req.params;
      const unit = await productUnitService.getUnitById(unitId);
      res.json({ success: true, data: unit });
    } catch (err) { next(err); }
  },

  async updateUnit(req: Request, res: Response, next: NextFunction) {
    try {
      const { unitId } = req.params;
      const { id, name } = getPerformer(req);
      const unit = await productUnitService.updateUnit(unitId, req.body, id, name);
      res.json({ success: true, data: unit });
    } catch (err) { next(err); }
  },

  async markBroken(req: Request, res: Response, next: NextFunction) {
    try {
      const { unitId } = req.params;
      const { description } = req.body;
      const { id, name } = getPerformer(req);
      const unit = await productUnitService.markBroken(unitId, description, id, name);
      res.json({ success: true, data: unit });
    } catch (err) { next(err); }
  },

  async sendToRepair(req: Request, res: Response, next: NextFunction) {
    try {
      const { unitId } = req.params;
      const { id, name } = getPerformer(req);
      const unit = await productUnitService.sendToRepair(unitId, req.body, id, name);
      res.json({ success: true, data: unit });
    } catch (err) { next(err); }
  },

  async returnFromRepair(req: Request, res: Response, next: NextFunction) {
    try {
      const { unitId } = req.params;
      const { id, name } = getPerformer(req);
      const unit = await productUnitService.returnFromRepair(unitId, req.body, id, name);
      res.json({ success: true, data: unit });
    } catch (err) { next(err); }
  },

  async markAvailable(req: Request, res: Response, next: NextFunction) {
    try {
      const { unitId } = req.params;
      const { description } = req.body;
      const { id, name } = getPerformer(req);
      const unit = await productUnitService.markAvailable(unitId, description, id, name);
      res.json({ success: true, data: unit });
    } catch (err) { next(err); }
  },

  async retireUnit(req: Request, res: Response, next: NextFunction) {
    try {
      const { unitId } = req.params;
      const { description } = req.body;
      const { id, name } = getPerformer(req);
      const unit = await productUnitService.retireUnit(unitId, description, id, name);
      res.json({ success: true, data: unit });
    } catch (err) { next(err); }
  },

  async addNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { unitId } = req.params;
      const { note } = req.body;
      const { id, name } = getPerformer(req);
      const event = await productUnitService.addNote(unitId, note, id, name);
      res.json({ success: true, data: event });
    } catch (err) { next(err); }
  },

  async checkOut(req: Request, res: Response, next: NextFunction) {
    try {
      const { unitId } = req.params;
      const { orderId, orderNumber } = req.body;
      const { id, name } = getPerformer(req);
      const unit = await productUnitService.checkOut(unitId, orderId, orderNumber, id, name);
      res.json({ success: true, data: unit });
    } catch (err) { next(err); }
  },

  async checkIn(req: Request, res: Response, next: NextFunction) {
    try {
      const { unitId } = req.params;
      const { id, name } = getPerformer(req);
      const unit = await productUnitService.checkIn(unitId, req.body, id, name);
      res.json({ success: true, data: unit });
    } catch (err) { next(err); }
  },

  async getInventorySummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await productUnitService.getInventorySummary();
      res.json({ success: true, data: summary });
    } catch (err) { next(err); }
  },
};
