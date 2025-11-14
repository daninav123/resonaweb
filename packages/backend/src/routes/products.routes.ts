import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { ProductController } from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const productController = new ProductController();

// ===== PUBLIC ROUTES - CATEGORIES =====
router.get('/categories', categoryController.getAllCategories);
router.get('/categories/tree', categoryController.getCategoryTree);
router.get('/categories/:id', categoryController.getCategoryById);
router.get('/categories/slug/:slug', categoryController.getCategoryBySlug);

// ===== ADMIN ROUTES - CATEGORIES =====
router.post(
  '/categories',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  categoryController.createCategory
);

router.put(
  '/categories/:id',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  categoryController.updateCategory
);

router.delete(
  '/categories/:id',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  categoryController.deleteCategory
);

router.post(
  '/categories/reorder',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  categoryController.reorderCategories
);

// ===== PUBLIC ROUTES - PRODUCTS =====
router.get('/', productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/search', productController.searchProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id/related', productController.getRelatedProducts);

// ===== ADMIN ROUTES - PRODUCTS =====
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  productController.createProduct
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  productController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  productController.deleteProduct
);

router.patch(
  '/:id/stock',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  productController.updateStock
);

router.post(
  '/bulk-price-update',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  productController.bulkUpdatePrices
);

export { router as productsRouter };
