import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../utils/validation';
import { paginationSchema } from '../utils/validation';

const router = Router();

// Admin routes
router.get(
  '/',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  validate(paginationSchema),
  userController.getAllUsers
);

router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  userController.createUser
);

// Protected routes (self or admin)
router.get(
  '/:id',
  authenticate,
  userController.getUserById
);

router.put(
  '/:id',
  authenticate,
  userController.updateUser
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  userController.deleteUser
);

// User related data
router.get(
  '/:id/orders',
  authenticate,
  validate(paginationSchema),
  userController.getUserOrders
);

router.get(
  '/:id/reviews',
  authenticate,
  userController.getUserReviews
);

router.get(
  '/:id/favorites',
  authenticate,
  userController.getUserFavorites
);

// Favorites management
router.post(
  '/favorites',
  authenticate,
  userController.addToFavorites
);

router.delete(
  '/favorites/:productId',
  authenticate,
  userController.removeFromFavorites
);

export { router as usersRouter };
