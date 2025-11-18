import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';

export class NotificationController {
  /**
   * Get user notifications
   */
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { unread } = req.query;

      if (!userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const where: any = { userId };
      if (unread === 'true') {
        where.read = false;
      }

      const notifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      res.json({ notifications });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.json({ count: 0 });
      }

      const count = await prisma.notification.count({
        where: {
          userId,
          read: false,
        },
      });

      res.json({ count });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      await prisma.notification.update({
        where: {
          id,
          userId, // Ensure user owns this notification
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      res.json({ message: 'Notificación marcada como leída' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      await prisma.notification.updateMany({
        where: {
          userId,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      res.json({ message: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      await prisma.notification.delete({
        where: {
          id,
          userId,
        },
      });

      res.json({ message: 'Notificación eliminada' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create notification (internal use)
   */
  async createNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, type, title, message, metadata } = req.body;

      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          data: metadata || undefined,
        },
      });

      res.status(201).json({ notification });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
