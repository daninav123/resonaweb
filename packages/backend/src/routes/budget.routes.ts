import { Router } from 'express';
import { budgetController } from '../controllers/budget.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación de admin
router.use(authenticate, authorize('ADMIN', 'SUPERADMIN'));

/**
 * @route   POST /api/v1/budgets
 * @desc    Crear nuevo presupuesto
 * @access  Admin
 */
router.post('/', budgetController.createBudget.bind(budgetController));

/**
 * @route   GET /api/v1/budgets
 * @desc    Listar presupuestos
 * @access  Admin
 */
router.get('/', budgetController.listBudgets.bind(budgetController));

/**
 * @route   GET /api/v1/budgets/:id
 * @desc    Obtener presupuesto por ID
 * @access  Admin
 */
router.get('/:id', budgetController.getBudgetById.bind(budgetController));

/**
 * @route   PUT /api/v1/budgets/:id
 * @desc    Actualizar presupuesto
 * @access  Admin
 */
router.put('/:id', budgetController.updateBudget.bind(budgetController));

/**
 * @route   DELETE /api/v1/budgets/:id
 * @desc    Eliminar presupuesto (solo DRAFT)
 * @access  Admin
 */
router.delete('/:id', budgetController.deleteBudget.bind(budgetController));

/**
 * @route   POST /api/v1/budgets/:id/sections
 * @desc    Agregar sección al presupuesto
 * @access  Admin
 */
router.post('/:id/sections', budgetController.addSection.bind(budgetController));

/**
 * @route   PUT /api/v1/budgets/sections/:sectionId
 * @desc    Actualizar sección
 * @access  Admin
 */
router.put('/sections/:sectionId', budgetController.updateSection.bind(budgetController));

/**
 * @route   DELETE /api/v1/budgets/sections/:sectionId
 * @desc    Eliminar sección
 * @access  Admin
 */
router.delete('/sections/:sectionId', budgetController.deleteSection.bind(budgetController));

/**
 * @route   POST /api/v1/budgets/sections/:sectionId/items
 * @desc    Agregar item a sección
 * @access  Admin
 */
router.post('/sections/:sectionId/items', budgetController.addItem.bind(budgetController));

/**
 * @route   PUT /api/v1/budgets/items/:itemId
 * @desc    Actualizar item
 * @access  Admin
 */
router.put('/items/:itemId', budgetController.updateItem.bind(budgetController));

/**
 * @route   DELETE /api/v1/budgets/items/:itemId
 * @desc    Eliminar item
 * @access  Admin
 */
router.delete('/items/:itemId', budgetController.deleteItem.bind(budgetController));

/**
 * @route   PATCH /api/v1/budgets/:id/status
 * @desc    Cambiar estado del presupuesto
 * @access  Admin
 */
router.patch('/:id/status', budgetController.changeStatus.bind(budgetController));

/**
 * @route   POST /api/v1/budgets/:id/duplicate
 * @desc    Duplicar presupuesto
 * @access  Admin
 */
router.post('/:id/duplicate', budgetController.duplicateBudget.bind(budgetController));

export default router;
