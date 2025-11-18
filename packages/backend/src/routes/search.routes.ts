import { Router } from 'express';
import { searchController } from '../controllers/search.controller';

const router = Router();

// Búsqueda principal
router.get('/', searchController.searchProducts);

// Búsqueda rápida (autocompletado)
router.get('/quick', searchController.quickSearch);

// Sugerencias
router.get('/suggestions', searchController.getSuggestions);

// Productos relacionados
router.get('/related/:id', searchController.getRelatedProducts);

// Productos populares
router.get('/popular', searchController.getPopularProducts);

export { router as searchRouter };
