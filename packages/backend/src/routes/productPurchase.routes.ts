import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { productPurchaseController } from '../controllers/productPurchase.controller';

const router = express.Router();

// All routes require authentication and admin role

// Create a new purchase lot
router.post('/', authenticate, productPurchaseController.createPurchaseLot.bind(productPurchaseController));

// Get all purchase lots
router.get('/', authenticate, productPurchaseController.getAllPurchaseLots.bind(productPurchaseController));

// Get all purchase lots for a product
router.get('/product/:productId', authenticate, productPurchaseController.getProductPurchaseLots.bind(productPurchaseController));

// Update a purchase lot
router.put('/:lotId', authenticate, productPurchaseController.updatePurchaseLot.bind(productPurchaseController));

// Delete a purchase lot
router.delete('/:lotId', authenticate, productPurchaseController.deletePurchaseLot.bind(productPurchaseController));

export { router as productPurchaseRouter };
