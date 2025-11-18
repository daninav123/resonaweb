import { Router } from 'express';
import { orderNoteController } from '../controllers/orderNote.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Crear nota en un pedido
router.post(
  '/orders/:orderId/notes',
  orderNoteController.createNote
);

// Obtener notas de un pedido
router.get(
  '/orders/:orderId/notes',
  orderNoteController.getNotesByOrder
);

// Actualizar una nota
router.put(
  '/notes/:noteId',
  orderNoteController.updateNote
);

// Eliminar una nota
router.delete(
  '/notes/:noteId',
  orderNoteController.deleteNote
);

export { router as orderNoteRouter };
