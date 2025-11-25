import { Router } from 'express';
import { billingController } from '../controllers/billing.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All billing routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/billing
 * @desc    Get billing data for current user
 * @access  Private
 */
router.get('/', (req, res, next) => billingController.getBillingData(req, res, next));

/**
 * @route   POST /api/v1/billing
 * @desc    Create or update billing data
 * @access  Private
 */
router.post('/', (req, res, next) => billingController.upsertBillingData(req, res, next));

/**
 * @route   PUT /api/v1/billing
 * @desc    Update billing data
 * @access  Private
 */
router.put('/', (req, res, next) => billingController.upsertBillingData(req, res, next));

/**
 * @route   DELETE /api/v1/billing
 * @desc    Delete billing data
 * @access  Private
 */
router.delete('/', (req, res, next) => billingController.deleteBillingData(req, res, next));

/**
 * @route   POST /api/v1/billing/validate-tax-id
 * @desc    Validate Spanish tax ID (NIF/CIF/NIE)
 * @access  Private
 */
router.post('/validate-tax-id', (req, res, next) => billingController.validateTaxId(req, res, next));

export default router;
