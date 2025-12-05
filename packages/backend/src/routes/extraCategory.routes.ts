import { Router } from 'express';
import { extraCategoryController } from '../controllers/extraCategory.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Rutas públicas
router.get('/', extraCategoryController.getAllCategories);
router.get('/:id', extraCategoryController.getCategoryById);

// Rutas protegidas (solo admin)
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  extraCategoryController.createCategory
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  extraCategoryController.updateCategory
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  extraCategoryController.deleteCategory
);

router.post(
  '/reorder',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  extraCategoryController.reorderCategories
);

router.post(
  '/assign-products',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  extraCategoryController.assignCategoryToProducts
);

router.get(
  '/uncategorized/products',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  extraCategoryController.getUncategorizedProducts
);

export default router;
