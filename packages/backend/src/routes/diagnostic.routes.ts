import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { diagnosticController } from '../controllers/diagnostic.controller';

const prisma = new PrismaClient();

const router = Router();

/**
 * GET /api/v1/diagnostic/montajes
 * Endpoint de diagnóstico para verificar montajes en la BD (SIN autenticación)
 */
router.get('/montajes', async (req: Request, res: Response) => {
  try {
    // Buscar categoría Montaje
    const montajeCategory = await prisma.category.findFirst({
      where: {
        name: {
          contains: 'Montaje',
          mode: 'insensitive'
        }
      }
    });

    // Contar packs con categoría Montaje
    const montajePacks = await prisma.pack.findMany({
      where: {
        categoryRef: {
          name: {
            contains: 'Montaje',
            mode: 'insensitive'
          }
        }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        finalPrice: true,
        isActive: true,
        categoryRef: {
          select: {
            name: true
          }
        }
      }
    });

    // Contar todos los packs
    const allPacks = await prisma.pack.findMany({
      select: {
        categoryRef: {
          select: {
            name: true
          }
        }
      }
    });

    const byCategory: Record<string, number> = {};
    allPacks.forEach(pack => {
      const catName = pack.categoryRef?.name || 'Sin categoría';
      byCategory[catName] = (byCategory[catName] || 0) + 1;
    });

    res.json({
      montajeCategory: montajeCategory ? { id: montajeCategory.id, name: montajeCategory.name } : null,
      montajePacks: {
        count: montajePacks.length,
        items: montajePacks
      },
      totalPacks: allPacks.length,
      byCategory
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

/**
 * GET /api/v1/diagnostic/calculator-config
 * Diagnóstico de configuración de calculadora (SIN autenticación)
 */
router.get('/calculator-config', diagnosticController.checkCalculatorConfig.bind(diagnosticController));

/**
 * POST /api/v1/diagnostic/init-calculator-config
 * Inicializar configuración de calculadora si no existe (SIN autenticación)
 */
router.post('/init-calculator-config', diagnosticController.initCalculatorConfig.bind(diagnosticController));

export default router;
