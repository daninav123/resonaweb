import { Router } from 'express';
import { orderNoteController } from '../controllers/orderNote.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Auth por-ruta (no global): este router se monta en la raíz /api/v1, así que un
// router.use(authenticate) global interceptaría con 401 cualquier ruta pública
// montada después (p.ej. /quote-requests/public). Las 4 rutas siguen autenticadas.

// Crear nota en un pedido
router.post(
  '/orders/:orderId/notes',
  authenticate,
  orderNoteController.createNote
);

// Obtener notas de un pedido
router.get(
  '/orders/:orderId/notes',
  authenticate,
  orderNoteController.getNotesByOrder
);

// Actualizar una nota
router.put(
  '/notes/:noteId',
  authenticate,
  orderNoteController.updateNote
);

// Eliminar una nota
router.delete(
  '/notes/:noteId',
  authenticate,
  orderNoteController.deleteNote
);

export { router as orderNoteRouter };
