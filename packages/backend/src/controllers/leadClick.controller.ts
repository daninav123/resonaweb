import { Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { prisma } from '../index';

const REF_PATTERN = /^[REre]-[A-Za-z]{2,4}-[a-z0-9]{3,6}$/;

const registerSchema = z.object({
  ref: z.string().regex(REF_PATTERN),
  app: z.enum(['rent', 'events']),
  section: z.string().max(60),
  path: z.string().max(300),
  channel: z.enum(['whatsapp', 'telefono', 'email']),
  referrer: z.string().max(300).optional(),
  utmSource: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(),
  utmCampaign: z.string().max(120).optional(),
  gclid: z.string().max(200).optional(),
  device: z.enum(['movil', 'escritorio']).optional(),
});

export class LeadClickController {
  /**
   * Registrar un clic en un enlace de contacto directo. Público y best-effort:
   * cualquier fallo se traga con 204 para no romper nunca la salida hacia WhatsApp.
   */
  async register(req: Request, res: Response) {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(204).send();
      }

      const d = parsed.data;
      await prisma.leadClick.create({
        data: {
          ref: d.ref,
          app: d.app,
          section: d.section,
          path: d.path,
          channel: d.channel,
          referrer: d.referrer ?? null,
          utmSource: d.utmSource ?? null,
          utmMedium: d.utmMedium ?? null,
          utmCampaign: d.utmCampaign ?? null,
          gclid: d.gclid ?? null,
          device: d.device ?? null,
        },
      });
      return res.status(204).send();
    } catch (error: any) {
      // P2002 = ref duplicado: colisión del sufijo aleatorio, irrelevante.
      if (error?.code !== 'P2002') {
        logger.warn('No se pudo registrar el clic de lead:', { message: error?.message });
      }
      return res.status(204).send();
    }
  }

  /**
   * Buscar el origen de una conversación por su código de referencia.
   */
  async getByRef(req: Request, res: Response) {
    try {
      const ref = String(req.params.ref || '').trim();
      const click = await prisma.leadClick.findFirst({
        where: { ref: { equals: ref, mode: 'insensitive' } },
      });

      if (!click) {
        return res.status(404).json({ error: 'Referencia no encontrada' });
      }

      return res.json({ data: click });
    } catch (error: any) {
      logger.error('Error al buscar referencia de lead:', { message: error?.message });
      return res.status(500).json({ error: 'Error al buscar la referencia' });
    }
  }

  /**
   * Listado con filtros para el panel: qué páginas generan contactos y en qué volumen.
   */
  async list(req: Request, res: Response) {
    try {
      const { app, channel, from, to } = req.query as Record<string, string | undefined>;
      const take = Math.min(Number(req.query.limit) || 200, 1000);

      const where: Record<string, unknown> = {};
      if (app === 'rent' || app === 'events') where.app = app;
      if (channel) where.channel = channel;
      if (from || to) {
        where.createdAt = {
          ...(from ? { gte: new Date(from) } : {}),
          ...(to ? { lte: new Date(to) } : {}),
        };
      }

      const [clicks, total] = await Promise.all([
        prisma.leadClick.findMany({ where, orderBy: { createdAt: 'desc' }, take }),
        prisma.leadClick.count({ where }),
      ]);

      const bySection = clicks.reduce<Record<string, number>>((acc, c) => {
        const key = `${c.app}/${c.section}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      return res.json({ data: clicks, total, bySection });
    } catch (error: any) {
      logger.error('Error al listar clics de lead:', { message: error?.message });
      return res.status(500).json({ error: 'Error al listar los clics' });
    }
  }
}

export const leadClickController = new LeadClickController();
