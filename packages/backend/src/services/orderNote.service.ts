import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';

export class OrderNoteService {
  /**
   * Crear una nota en un pedido
   */
  async createNote(
    orderId: string,
    userId: string,
    content: string,
    isInternal: boolean = false,
    attachments?: any
  ) {
    // Verificar que el pedido existe
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      throw new AppError(404, 'Pedido no encontrado', 'ORDER_NOT_FOUND');
    }

    // Verificar permisos
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, 'Usuario no encontrado', 'USER_NOT_FOUND');
    }

    // Solo admin puede crear notas internas
    if (isInternal && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
      throw new AppError(403, 'No autorizado para crear notas internas', 'FORBIDDEN');
    }

    // Cliente solo puede añadir notas a sus propios pedidos
    if (user.role === 'CLIENT' && order.userId !== userId) {
      throw new AppError(403, 'No autorizado', 'FORBIDDEN');
    }

    // Crear la nota
    const note = await prisma.orderNote.create({
      data: {
        orderId,
        userId,
        content,
        isInternal,
        attachments: attachments || null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return note;
  }

  /**
   * Obtener todas las notas de un pedido
   */
  async getNotesByOrder(orderId: string, userId: string, userRole: string) {
    // Verificar que el pedido existe
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new AppError(404, 'Pedido no encontrado', 'ORDER_NOT_FOUND');
    }

    // Cliente solo puede ver notas de sus propios pedidos
    if (userRole === 'CLIENT' && order.userId !== userId) {
      throw new AppError(403, 'No autorizado', 'FORBIDDEN');
    }

    // Determinar qué notas puede ver
    const where: any = { orderId };

    // Cliente no puede ver notas internas
    if (userRole === 'CLIENT') {
      where.isInternal = false;
    }

    const notes = await prisma.orderNote.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return notes;
  }

  /**
   * Actualizar una nota
   */
  async updateNote(
    noteId: string,
    userId: string,
    userRole: string,
    content: string
  ) {
    const note = await prisma.orderNote.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new AppError(404, 'Nota no encontrada', 'NOTE_NOT_FOUND');
    }

    // Solo el creador o un admin puede editar
    if (note.userId !== userId && userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
      throw new AppError(403, 'No autorizado', 'FORBIDDEN');
    }

    const updatedNote = await prisma.orderNote.update({
      where: { id: noteId },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return updatedNote;
  }

  /**
   * Eliminar una nota
   */
  async deleteNote(noteId: string, userId: string, userRole: string) {
    const note = await prisma.orderNote.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new AppError(404, 'Nota no encontrada', 'NOTE_NOT_FOUND');
    }

    // Solo el creador o un admin puede eliminar
    if (note.userId !== userId && userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
      throw new AppError(403, 'No autorizado', 'FORBIDDEN');
    }

    await prisma.orderNote.delete({
      where: { id: noteId },
    });

    return { success: true };
  }
}

export const orderNoteService = new OrderNoteService();
