import { api } from './api';

export interface OrderNote {
  id: string;
  orderId: string;
  userId: string;
  content: string;
  isInternal: boolean;
  attachments?: any;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

class OrderNoteService {
  /**
   * Crear una nota en un pedido
   */
  async createNote(
    orderId: string,
    content: string,
    isInternal: boolean = false,
    attachments?: any
  ): Promise<{ message: string; note: OrderNote }> {
    return api.post(`/orders/${orderId}/notes`, {
      content,
      isInternal,
      attachments,
    });
  }

  /**
   * Obtener notas de un pedido
   */
  async getNotesByOrder(orderId: string): Promise<{ notes: OrderNote[]; total: number }> {
    return api.get(`/orders/${orderId}/notes`);
  }

  /**
   * Actualizar una nota
   */
  async updateNote(noteId: string, content: string): Promise<{ message: string; note: OrderNote }> {
    return api.put(`/notes/${noteId}`, { content });
  }

  /**
   * Eliminar una nota
   */
  async deleteNote(noteId: string): Promise<{ message: string }> {
    return api.delete(`/notes/${noteId}`);
  }
}

export const orderNoteService = new OrderNoteService();
