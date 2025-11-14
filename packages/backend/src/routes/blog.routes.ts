import { Router } from 'express';
import { blogController } from '../controllers/blog.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// ========== RUTAS PÚBLICAS ==========

// Obtener posts publicados
router.get('/posts', blogController.getPublishedPosts);

// Obtener post por slug
router.get('/posts/slug/:slug', blogController.getPostBySlug);

// Obtener categorías
router.get('/categories', blogController.getCategories);

// Obtener tags
router.get('/tags', blogController.getTags);

// ========== RUTAS ADMIN (requieren autenticación y rol admin) ==========

// Posts
router.post('/admin/posts', authenticate, authorize('ADMIN', 'SUPERADMIN'), blogController.createPost);
router.get('/admin/posts', authenticate, authorize('ADMIN', 'SUPERADMIN'), blogController.getPosts);
router.get('/admin/posts/:id', authenticate, authorize('ADMIN', 'SUPERADMIN'), blogController.getPostById);
router.put('/admin/posts/:id', authenticate, authorize('ADMIN', 'SUPERADMIN'), blogController.updatePost);
router.delete('/admin/posts/:id', authenticate, authorize('ADMIN', 'SUPERADMIN'), blogController.deletePost);

// Acciones de publicación
router.post('/admin/posts/:id/publish', authenticate, authorize('ADMIN', 'SUPERADMIN'), blogController.publishPost);
router.post('/admin/posts/:id/schedule', authenticate, authorize('ADMIN', 'SUPERADMIN'), blogController.schedulePost);

// Categorías
router.post('/admin/categories', authenticate, authorize('ADMIN', 'SUPERADMIN'), blogController.createCategory);
router.put('/admin/categories/:id', authenticate, authorize('ADMIN', 'SUPERADMIN'), blogController.updateCategory);
router.delete('/admin/categories/:id', authenticate, authorize('ADMIN', 'SUPERADMIN'), blogController.deleteCategory);

// Estadísticas
router.get('/admin/stats', authenticate, authorize('ADMIN', 'SUPERADMIN'), blogController.getStats);

// Generar artículo con IA
router.post('/admin/generate-ai', authenticate, authorize('ADMIN', 'SUPERADMIN'), blogController.generateWithAI);

export default router;
