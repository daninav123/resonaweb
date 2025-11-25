import { Router, Request, Response } from 'express';
import { register } from '../utils/metrics';

const router = Router();

/**
 * GET /api/v1/metrics
 * Endpoint para Prometheus
 * Devuelve todas las métricas en formato Prometheus
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Establecer el content-type que Prometheus espera
    res.set('Content-Type', register.contentType);
    
    // Devolver las métricas
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    res.status(500).end(error);
  }
});

export { router as metricsRouter };
