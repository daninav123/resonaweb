import { Request, Response, NextFunction } from 'express';
import { roleDefinitionService } from '../services/roleDefinition.service';

class RoleDefinitionController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await roleDefinitionService.getAll();
      res.json(roles);
    } catch (error) {
      next(error);
    }
  }

  async getAllAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await roleDefinitionService.getAllAdmin();
      res.json(roles);
    } catch (error) {
      next(error);
    }
  }

  async getAvailablePaths(req: Request, res: Response, next: NextFunction) {
    try {
      const paths = roleDefinitionService.getAvailableAdminPaths();
      res.json(paths);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await roleDefinitionService.create(req.body);
      res.status(201).json(role);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await roleDefinitionService.update(req.params.id, req.body);
      res.json(role);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await roleDefinitionService.delete(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async seed(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await roleDefinitionService.seedSystemRoles();
      res.json({ message: `${count} roles del sistema creados`, count });
    } catch (error) {
      next(error);
    }
  }
}

export const roleDefinitionController = new RoleDefinitionController();
