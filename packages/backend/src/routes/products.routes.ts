import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { ProductController } from '../controllers/product.controller';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth.middleware';

const router = Router();
const productController = new ProductController();

// ===== PUBLIC ROUTES - CATEGORIES =====
router.get('/categories', optionalAuthenticate, categoryController.getAllCategories);
router.get('/categories/tree', optionalAuthenticate, categoryController.getCategoryTree);
// Rutas específicas ANTES de las genéricas
router.get('/categories/slug/:slug', categoryController.getCategoryBySlug);
router.get('/categories/:id', categoryController.getCategoryById);

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

// Check availability endpoint (BEFORE :id routes to avoid conflicts)
router.post('/check-availability', productController.checkAvailability);

// Pack routes (BEFORE generic :id routes) - Con optionalAuthenticate para permitir acceso sin login (Updated 2025-12-03 17:51)
router.get('/packs', optionalAuthenticate, productController.getAllPacks);
router.get('/:id/pack-details', productController.getPackWithComponents);
router.post('/:id/check-pack-availability', productController.checkPackAvailability);
router.get('/:id/max-pack-availability', productController.getPackMaxAvailability);

// Rutas específicas ANTES de las genéricas
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id/related', productController.getRelatedProducts);
// Ruta genérica al final
router.get('/:id', productController.getProductById);

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

// Pack management (ADMIN)
router.post(
  '/:id/components',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  productController.addComponentsToPack
);

export { router as productsRouter };
