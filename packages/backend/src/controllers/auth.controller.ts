import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AppError } from '../middleware/error.middleware';

export class AuthController {
  /**
   * Register new user
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      
      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      
      res.json({
        message: 'Inicio de sesión exitoso',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      
      res.json({
        message: 'Token actualizado exitosamente',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const user = await authService.getCurrentUser(req.user.id);
      
      res.json({
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password
   */
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await authService.requestPasswordReset(email);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout (blacklists token)
   */
  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Get token from request (added by auth middleware)
      const token = req.token || req.headers.authorization?.substring(7);
      
      if (token) {
        // Calculate token expiration (default 24h)
        const tokenExpiry = 24 * 60 * 60; // 24 hours in seconds
        
        // Import the service
        const { tokenBlacklistService } = await import('../services/tokenBlacklist.service');
        
        // Add token to blacklist
        await tokenBlacklistService.addToken(token, tokenExpiry);
        
        res.json({
          message: 'Sesión cerrada exitosamente',
        });
      } else {
        res.json({
          message: 'No hay sesión activa',
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
