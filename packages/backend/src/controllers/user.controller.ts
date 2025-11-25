import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { AppError } from '../middleware/error.middleware';

export class UserController {
  /**
   * Get all users (admin only)
   */
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const result = await userService.getAllUsers({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);

      res.json({ data: user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create user (admin only)
   */
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.createUser(req.body);

      res.status(201).json({
        message: 'Usuario creado exitosamente',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user
   */
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      // Check if user is updating their own profile or is admin
      const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPERADMIN';
      const isOwnProfile = req.user?.id === id;

      if (!isAdmin && !isOwnProfile) {
        throw new AppError(403, 'No tienes permisos para actualizar este usuario', 'FORBIDDEN');
      }

      const user = await userService.updateUser(id, req.body, isAdmin);

      res.json({
        message: 'Usuario actualizado exitosamente',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user (soft delete, admin only)
   */
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await userService.deleteUser(id);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user level (VIP status) - Admin only
   */
  async updateUserLevel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { userLevel } = req.body;

      if (!['STANDARD', 'VIP', 'VIP_PLUS'].includes(userLevel)) {
        throw new AppError(400, 'Nivel de usuario inválido', 'INVALID_USER_LEVEL');
      }

      const user = await userService.updateUserLevel(id, userLevel);

      res.json({
        message: `Usuario actualizado a nivel ${userLevel}`,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user orders
   */
  async getUserOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Check permissions
      const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPERADMIN';
      const isOwnProfile = req.user?.id === id;

      if (!isAdmin && !isOwnProfile) {
        throw new AppError(403, 'No tienes permisos para ver estos pedidos', 'FORBIDDEN');
      }

      const result = await userService.getUserOrders(id, { skip, take: limit });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user reviews
   */
  async getUserReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Check permissions
      const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPERADMIN';
      const isOwnProfile = req.user?.id === id;

      if (!isAdmin && !isOwnProfile) {
        throw new AppError(403, 'No tienes permisos para ver estas reseñas', 'FORBIDDEN');
      }

      const reviews = await userService.getUserReviews(id);

      res.json({ data: reviews });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user favorites
   */
  async getUserFavorites(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Check permissions
      const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPERADMIN';
      const isOwnProfile = req.user?.id === id;

      if (!isAdmin && !isOwnProfile) {
        throw new AppError(403, 'No tienes permisos para ver estos favoritos', 'FORBIDDEN');
      }

      const favorites = await userService.getUserFavorites(id);

      res.json({ data: favorites });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add to favorites
   */
  async addToFavorites(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { productId } = req.body;
      const result = await userService.addToFavorites(req.user.id, productId);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove from favorites
   */
  async removeFromFavorites(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { productId } = req.params;
      const result = await userService.removeFromFavorites(req.user.id, productId);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
