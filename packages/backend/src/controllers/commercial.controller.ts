import { Request, Response } from 'express';
import { prisma } from '../index';
import { commercialService } from '../services/commercial.service';
import { commissionService } from '../services/commission.service';
import { leadService } from '../services/lead.service';
import { CommissionStatus, LeadStatus, QuoteStatus } from '@prisma/client';

export class CommercialController {
  /**
   * GET /api/v1/commercial/dashboard
   * Obtener dashboard del comercial
   */
  async getDashboard(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const dashboard = await commercialService.getDashboard(userId);
      res.json(dashboard);
    } catch (error) {
      console.error('Error obteniendo dashboard comercial:', error);
      res.status(500).json({ error: 'Error al obtener dashboard' });
    }
  }

  /**
   * GET /api/v1/commercial/quotes
   * Obtener presupuestos del comercial
   */
  async getQuotes(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { status, search, startDate, endDate } = req.query;

      const filters: any = {};
      if (status) filters.status = status as QuoteStatus;
      if (search) filters.search = search as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const quotes = await commercialService.getQuotes(userId, filters);
      res.json(quotes);
    } catch (error) {
      console.error('Error obteniendo presupuestos:', error);
      res.status(500).json({ error: 'Error al obtener presupuestos' });
    }
  }

  /**
   * POST /api/v1/commercial/quotes
   * Crear presupuesto asignado al comercial
   */
  async createQuote(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const {
        customerName,
        customerEmail,
        customerPhone,
        eventType,
        attendees,
        duration,
        durationType,
        eventDate,
        eventLocation,
        selectedPack,
        selectedExtras,
        estimatedTotal,
        notes,
        adminNotes,
        status,
      } = req.body;

      if (!customerEmail && !customerPhone) {
        return res.status(400).json({ error: 'Se requiere al menos email o teléfono del cliente' });
      }

      if (!eventType || !attendees || !duration) {
        return res.status(400).json({ error: 'Información del evento incompleta' });
      }

      const quote = await prisma.quoteRequest.create({
        data: {
          customerName: customerName || null,
          customerEmail: customerEmail || null,
          customerPhone: customerPhone || null,
          eventType,
          attendees: Number(attendees),
          duration: Number(duration),
          durationType: durationType || 'hours',
          eventDate: eventDate || null,
          eventLocation: eventLocation || null,
          selectedPack: selectedPack || null,
          selectedExtras: selectedExtras || {},
          estimatedTotal: estimatedTotal !== undefined && estimatedTotal !== null ? Number(estimatedTotal) : null,
          notes: notes || null,
          adminNotes: adminNotes || null,
          status: (status as QuoteStatus) || QuoteStatus.PENDING,
          userId,
        },
      });

      const total = Number(quote.estimatedTotal || 0);
      if (total > 0) {
        await commissionService.createCommission(userId, quote.id, total);
      }

      res.status(201).json(quote);
    } catch (error) {
      console.error('Error creando presupuesto comercial:', error);
      res.status(500).json({ error: 'Error al crear presupuesto' });
    }
  }

  /**
   * PUT /api/v1/commercial/quotes/:id
   * Actualizar presupuesto del comercial
   */
  async updateQuote(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const role = req.user!.role;
      const { id } = req.params;

      const {
        status,
        adminNotes,
        notes,
        estimatedTotal,
        selectedPack,
        selectedExtras,
        customerName,
        customerEmail,
        customerPhone,
        eventType,
        attendees,
        duration,
        durationType,
        eventDate,
        eventLocation,
      } = req.body;

      const where: any = { id };
      if (role === 'COMMERCIAL') {
        where.userId = userId;
      }

      const existing = await prisma.quoteRequest.findFirst({ where });
      if (!existing) {
        return res.status(404).json({ error: 'Presupuesto no encontrado' });
      }

      const updated = await prisma.quoteRequest.update({
        where: { id },
        data: {
          ...(status && { status: status as QuoteStatus }),
          ...(adminNotes !== undefined && { adminNotes }),
          ...(notes !== undefined && { notes }),
          ...(estimatedTotal !== undefined && { estimatedTotal: estimatedTotal === null ? null : Number(estimatedTotal) }),
          ...(selectedPack !== undefined && { selectedPack: selectedPack || null }),
          ...(selectedExtras !== undefined && { selectedExtras: selectedExtras || {} }),
          ...(customerName !== undefined && { customerName: customerName || null }),
          ...(customerEmail !== undefined && { customerEmail: customerEmail || null }),
          ...(customerPhone !== undefined && { customerPhone: customerPhone || null }),
          ...(eventType !== undefined && { eventType }),
          ...(attendees !== undefined && { attendees: Number(attendees) }),
          ...(duration !== undefined && { duration: Number(duration) }),
          ...(durationType !== undefined && { durationType }),
          ...(eventDate !== undefined && { eventDate: eventDate || null }),
          ...(eventLocation !== undefined && { eventLocation: eventLocation || null }),
        },
      });

      const newTotal = Number(updated.estimatedTotal || 0);
      if (estimatedTotal !== undefined) {
        await prisma.commission.updateMany({
          where: { quoteRequestId: id },
          data: {
            quoteValue: newTotal,
            commissionValue: (newTotal * 10) / 100,
          },
        });
      }

      if (status === 'CONVERTED') {
        await commissionService.markAsGenerated(id);
      }

      if (status === 'REJECTED') {
        await commissionService.markAsLost(id);
      }

      res.json(updated);
    } catch (error) {
      console.error('Error actualizando presupuesto comercial:', error);
      res.status(500).json({ error: 'Error al actualizar presupuesto' });
    }
  }

  /**
   * DELETE /api/v1/commercial/quotes/:id
   * Eliminar presupuesto del comercial
   */
  async deleteQuote(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const role = req.user!.role;
      const { id } = req.params;

      const where: any = { id };
      if (role === 'COMMERCIAL') {
        where.userId = userId;
      }

      const existing = await prisma.quoteRequest.findFirst({ where });
      if (!existing) {
        return res.status(404).json({ error: 'Presupuesto no encontrado' });
      }

      await prisma.quoteRequest.delete({ where: { id } });
      res.json({ message: 'Presupuesto eliminado correctamente' });
    } catch (error) {
      console.error('Error eliminando presupuesto comercial:', error);
      res.status(500).json({ error: 'Error al eliminar presupuesto' });
    }
  }

  /**
   * GET /api/v1/commercial/commissions
   * Obtener comisiones del comercial
   */
  async getCommissions(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { status, startDate, endDate } = req.query;

      const filters: any = {};
      if (status) filters.status = status as CommissionStatus;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const commissions = await commissionService.getCommissionsByUser(userId, filters);
      res.json(commissions);
    } catch (error) {
      console.error('Error obteniendo comisiones:', error);
      res.status(500).json({ error: 'Error al obtener comisiones' });
    }
  }

  /**
   * GET /api/v1/commercial/commissions/summary
   * Obtener resumen de comisiones
   */
  async getCommissionsSummary(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const summary = await commissionService.getCommissionsSummary(userId);
      res.json(summary);
    } catch (error) {
      console.error('Error obteniendo resumen de comisiones:', error);
      res.status(500).json({ error: 'Error al obtener resumen' });
    }
  }

  /**
   * GET /api/v1/commercial/leads
   * Obtener leads del comercial
   */
  async getLeads(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { status, search } = req.query;

      const filters: any = {};
      if (status) filters.status = status as LeadStatus;
      if (search) filters.search = search as string;

      const leads = await leadService.getLeadsByUser(userId, filters);
      res.json(leads);
    } catch (error) {
      console.error('Error obteniendo leads:', error);
      res.status(500).json({ error: 'Error al obtener leads' });
    }
  }

  /**
   * POST /api/v1/commercial/leads
   * Crear un nuevo lead
   */
  async createLead(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const lead = await leadService.createLead(userId, req.body);
      res.status(201).json(lead);
    } catch (error) {
      console.error('Error creando lead:', error);
      res.status(500).json({ error: 'Error al crear lead' });
    }
  }

  /**
   * PUT /api/v1/commercial/leads/:id
   * Actualizar un lead
   */
  async updateLead(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const lead = await leadService.updateLead(id, userId, req.body);
      res.json(lead);
    } catch (error) {
      console.error('Error actualizando lead:', error);
      res.status(500).json({ error: 'Error al actualizar lead' });
    }
  }

  /**
   * DELETE /api/v1/commercial/leads/:id
   * Eliminar un lead
   */
  async deleteLead(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      await leadService.deleteLead(id, userId);
      res.json({ message: 'Lead eliminado correctamente' });
    } catch (error) {
      console.error('Error eliminando lead:', error);
      res.status(500).json({ error: 'Error al eliminar lead' });
    }
  }

  /**
   * GET /api/v1/commercial/leads/:id
   * Obtener un lead específico
   */
  async getLeadById(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const lead = await leadService.getLeadById(id, userId);
      
      if (!lead) {
        return res.status(404).json({ error: 'Lead no encontrado' });
      }

      res.json(lead);
    } catch (error) {
      console.error('Error obteniendo lead:', error);
      res.status(500).json({ error: 'Error al obtener lead' });
    }
  }

  /**
   * GET /api/v1/commercial/leads/pending-followups
   * Obtener leads con seguimiento pendiente
   */
  async getPendingFollowUps(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const leads = await leadService.getPendingFollowUps(userId);
      res.json(leads);
    } catch (error) {
      console.error('Error obteniendo seguimientos pendientes:', error);
      res.status(500).json({ error: 'Error al obtener seguimientos' });
    }
  }

  /**
   * GET /api/v1/commercial/leads/stats
   * Obtener estadísticas de leads
   */
  async getLeadsStats(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const stats = await leadService.getLeadsStats(userId);
      res.json(stats);
    } catch (error) {
      console.error('Error obteniendo estadísticas de leads:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  }

  /**
   * POST /api/v1/commercial/leads/:id/convert
   * Marcar lead como convertido
   */
  async convertLead(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { quoteRequestId } = req.body;

      if (!quoteRequestId) {
        return res.status(400).json({ error: 'quoteRequestId es requerido' });
      }

      const lead = await leadService.markAsConverted(id, userId, quoteRequestId);
      res.json(lead);
    } catch (error) {
      console.error('Error convirtiendo lead:', error);
      res.status(500).json({ error: 'Error al convertir lead' });
    }
  }
}

export const commercialController = new CommercialController();
