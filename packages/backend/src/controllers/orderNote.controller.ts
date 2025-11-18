import { Request, Response, NextFunction } from 'express';
import { orderNoteService } from '../services/orderNote.service';
import { AppError } from '../middleware/error.middleware';

interface AuthRequest extends Request {
  user?: any;
}

export class OrderNoteController {
  /**
   * Crear una nota en un pedido
   */
  async createNote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { orderId } = req.params;
      const { content, isInternal, attachments } = req.body;

      if (!content || content.trim().length === 0) {
        throw new AppError(400, 'El contenido de la nota es requerido', 'CONTENT_REQUIRED');
      }

      const note = await orderNoteService.createNote(
        orderId,
        req.user.id,
        content,
        isInternal || false,
        attachments
      );

      res.status(201).json({
        message: 'Nota creada correctamente',
        note,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener notas de un pedido
   */
  async getNotesByOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { orderId } = req.params;

      const notes = await orderNoteService.getNotesByOrder(
        orderId,
        req.user.id,
        req.user.role
      );

      res.json({
        notes,
        total: notes.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar una nota
   */
  async updateNote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { noteId } = req.params;
      const { content } = req.body;

      if (!content || content.trim().length === 0) {
        throw new AppError(400, 'El contenido de la nota es requerido', 'CONTENT_REQUIRED');
      }

      const note = await orderNoteService.updateNote(
        noteId,
        req.user.id,
        req.user.role,
        content
      );

      res.json({
        message: 'Nota actualizada correctamente',
        note,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar una nota
   */
  async deleteNote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { noteId } = req.params;

      await orderNoteService.deleteNote(
        noteId,
        req.user.id,
        req.user.role
      );

      res.json({
        message: 'Nota eliminada correctamente',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const orderNoteController = new OrderNoteController();
