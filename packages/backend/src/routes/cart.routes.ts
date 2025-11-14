import { Router } from 'express';
import { cartController } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

// Get current cart
router.get('/', cartController.getCart);

// Add item to cart
router.post('/items', cartController.addToCart);

// Update item quantity
router.patch('/items/:productId', cartController.updateCartItem);

// Update item dates
router.put('/items/:itemId/dates', cartController.updateCartItemDates);

// Remove item from cart
router.delete('/items/:productId', cartController.removeFromCart);

// Clear entire cart
router.delete('/clear', cartController.clearCart);

// Calculate totals
router.post('/calculate', cartController.calculateTotals);

// Validate cart before checkout
router.post('/validate', cartController.validateCart);

export { router as cartRouter };
