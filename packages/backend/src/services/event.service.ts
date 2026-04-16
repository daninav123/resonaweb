import { prisma } from '../index';
import { EventPhase, EventPriority, Prisma } from '@prisma/client';
import { logger } from '../utils/logger';

// ============= TYPES =============
interface CreateEventInput {
  name: string;
  eventType: string;
  priority?: EventPriority;
  eventDate: string;
  eventEndDate?: string;
  setupDate?: string;
  teardownDate?: string;
  venueName?: string;
  venueAddress?: string;
  venueContact?: string;
  venuePhone?: string;
  coordinates?: { lat: number; lng: number };
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientCompany?: string;
  attendees?: number;
  briefing?: string;
  technicalNotes?: string;
  estimatedRevenue?: number;
  estimatedCost?: number;
  orderId?: string;
  budgetId?: string;
}

interface UpdateEventInput extends Partial<CreateEventInput> {
  phase?: EventPhase;
  actualRevenue?: number;
  actualCost?: number;
}

interface EventFilters {
  phase?: EventPhase;
  eventType?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  priority?: EventPriority;
  page?: number;
  limit?: number;
}

// ============= SERVICE =============
export class EventService {
  /**
   * Generar numero de evento secuencial
   */
  private async generateEventNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const lastEvent = await prisma.event.findFirst({
      where: { eventNumber: { startsWith: `EVT-${year}` } },
      orderBy: { eventNumber: 'desc' },
    });

    let nextNum = 1;
    if (lastEvent) {
      const parts = lastEvent.eventNumber.split('-');
      nextNum = parseInt(parts[2] || '0') + 1;
    }

    return `EVT-${year}-${String(nextNum).padStart(3, '0')}`;
  }

  /**
   * Crear evento
   */
  async create(data: CreateEventInput) {
    try {
      const eventNumber = await this.generateEventNumber();

      const event = await prisma.event.create({
        data: {
          eventNumber,
          name: data.name,
          eventType: data.eventType,
          priority: data.priority || 'MEDIUM',
          eventDate: new Date(data.eventDate),
          eventEndDate: data.eventEndDate ? new Date(data.eventEndDate) : null,
          setupDate: data.setupDate ? new Date(data.setupDate) : null,
          teardownDate: data.teardownDate ? new Date(data.teardownDate) : null,
          venueName: data.venueName,
          venueAddress: data.venueAddress,
          venueContact: data.venueContact,
          venuePhone: data.venuePhone,
          coordinates: data.coordinates as any,
          clientName: data.clientName,
          clientEmail: data.clientEmail,
          clientPhone: data.clientPhone,
          clientCompany: data.clientCompany,
          attendees: data.attendees,
          briefing: data.briefing,
          technicalNotes: data.technicalNotes,
          estimatedRevenue: data.estimatedRevenue,
          estimatedCost: data.estimatedCost,
          orderId: data.orderId,
          budgetId: data.budgetId,
        },
        include: this.fullInclude(),
      });

      // Crear checklist por defecto segun tipo de evento
      await this.createDefaultChecklist(event.id, data.eventType);

      return event;
    } catch (error) {
      logger.error('Error creating event:', error);
      throw error;
    }
  }

  /**
   * Obtener evento por ID
   */
  async getById(id: string) {
    try {
      const event = await prisma.event.findUnique({
        where: { id },
        include: this.fullInclude(),
      });

      if (!event) throw new Error('Evento no encontrado');
      return event;
    } catch (error) {
      logger.error('Error getting event:', error);
      throw error;
    }
  }

  /**
   * Listar eventos con filtros
   */
  async list(filters: EventFilters) {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      const where: Prisma.EventWhereInput = {};

      if (filters.phase) where.phase = filters.phase;
      if (filters.eventType) where.eventType = filters.eventType;
      if (filters.priority) where.priority = filters.priority;
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { eventNumber: { contains: filters.search, mode: 'insensitive' } },
          { clientName: { contains: filters.search, mode: 'insensitive' } },
          { clientEmail: { contains: filters.search, mode: 'insensitive' } },
          { venueName: { contains: filters.search, mode: 'insensitive' } },
        ];
      }
      if (filters.dateFrom || filters.dateTo) {
        where.eventDate = {};
        if (filters.dateFrom) where.eventDate.gte = new Date(filters.dateFrom);
        if (filters.dateTo) where.eventDate.lte = new Date(filters.dateTo);
      }

      const [events, total] = await Promise.all([
        prisma.event.findMany({
          where,
          skip,
          take: limit,
          orderBy: { eventDate: 'desc' },
          include: {
            staff: { select: { id: true, staffName: true, role: true, confirmed: true } },
            equipment: { select: { id: true, productName: true, quantity: true, pickedUp: true, returned: true } },
            checklist: { select: { id: true, completed: true } },
            incidents: { select: { id: true, resolved: true } },
            _count: {
              select: { timeline: true, notes: true, documents: true },
            },
          },
        }),
        prisma.event.count({ where }),
      ]);

      // Enriquecer con stats
      const enriched = events.map(event => {
        const totalChecklist = event.checklist.length;
        const completedChecklist = event.checklist.filter(c => c.completed).length;
        const openIncidents = event.incidents.filter(i => !i.resolved).length;

        return {
          ...event,
          checklistProgress: totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0,
          totalChecklist,
          completedChecklist,
          staffCount: event.staff.length,
          confirmedStaff: event.staff.filter(s => s.confirmed).length,
          equipmentCount: event.equipment.length,
          pickedUpCount: event.equipment.filter(e => e.pickedUp).length,
          openIncidents,
        };
      });

      return {
        data: enriched,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error listing events:', error);
      throw error;
    }
  }

  /**
   * Actualizar evento
   */
  async update(id: string, data: UpdateEventInput) {
    try {
      const updateData: any = { ...data };

      // Convertir fechas si vienen como string
      if (data.eventDate) updateData.eventDate = new Date(data.eventDate);
      if (data.eventEndDate) updateData.eventEndDate = new Date(data.eventEndDate);
      if (data.setupDate) updateData.setupDate = new Date(data.setupDate);
      if (data.teardownDate) updateData.teardownDate = new Date(data.teardownDate);
      if (data.coordinates) updateData.coordinates = data.coordinates as any;

      const event = await prisma.event.update({
        where: { id },
        data: updateData,
        include: this.fullInclude(),
      });

      return event;
    } catch (error) {
      logger.error('Error updating event:', error);
      throw error;
    }
  }

  /**
   * Cambiar fase del evento
   */
  async changePhase(id: string, phase: EventPhase) {
    try {
      const updateData: any = { phase };
      if (phase === 'CLOSED') {
        updateData.closedAt = new Date();
      }

      return await prisma.event.update({
        where: { id },
        data: updateData,
        include: this.fullInclude(),
      });
    } catch (error) {
      logger.error('Error changing event phase:', error);
      throw error;
    }
  }

  /**
   * Eliminar evento
   */
  async delete(id: string) {
    try {
      await prisma.event.delete({ where: { id } });
      return { success: true };
    } catch (error) {
      logger.error('Error deleting event:', error);
      throw error;
    }
  }

  // ============= TIMELINE =============
  async addTimelineItem(eventId: string, data: { time: string; endTime?: string; title: string; description?: string; responsible?: string }) {
    const maxOrder = await prisma.eventTimelineItem.aggregate({ where: { eventId }, _max: { sortOrder: true } });
    return prisma.eventTimelineItem.create({
      data: { eventId, ...data, sortOrder: (maxOrder._max.sortOrder || 0) + 1 },
    });
  }

  async updateTimelineItem(id: string, data: any) {
    return prisma.eventTimelineItem.update({ where: { id }, data });
  }

  async deleteTimelineItem(id: string) {
    return prisma.eventTimelineItem.delete({ where: { id } });
  }

  async toggleTimelineItem(id: string) {
    const item = await prisma.eventTimelineItem.findUnique({ where: { id } });
    if (!item) throw new Error('Item no encontrado');
    return prisma.eventTimelineItem.update({
      where: { id },
      data: { completed: !item.completed, completedAt: !item.completed ? new Date() : null },
    });
  }

  // ============= CHECKLIST =============
  async addChecklistItem(eventId: string, data: { text: string; category?: string; isRequired?: boolean }) {
    const maxOrder = await prisma.eventChecklistItem.aggregate({ where: { eventId }, _max: { sortOrder: true } });
    return prisma.eventChecklistItem.create({
      data: { eventId, ...data, sortOrder: (maxOrder._max.sortOrder || 0) + 1 },
    });
  }

  async toggleChecklistItem(id: string, completedBy?: string) {
    const item = await prisma.eventChecklistItem.findUnique({ where: { id } });
    if (!item) throw new Error('Item no encontrado');
    return prisma.eventChecklistItem.update({
      where: { id },
      data: { completed: !item.completed, completedAt: !item.completed ? new Date() : null, completedBy: !item.completed ? completedBy : null },
    });
  }

  async deleteChecklistItem(id: string) {
    return prisma.eventChecklistItem.delete({ where: { id } });
  }

  // ============= STAFF =============
  async addStaff(eventId: string, data: { staffName: string; staffPhone?: string; staffEmail?: string; role: string; startTime?: string; endTime?: string; hourlyRate?: number }) {
    return prisma.eventStaffAssignment.create({
      data: { eventId, ...data },
    });
  }

  async updateStaff(id: string, data: any) {
    return prisma.eventStaffAssignment.update({ where: { id }, data });
  }

  async removeStaff(id: string) {
    return prisma.eventStaffAssignment.delete({ where: { id } });
  }

  // ============= EQUIPMENT =============
  async addEquipment(eventId: string, data: { productName: string; productId?: string; quantity: number; notes?: string }) {
    return prisma.eventEquipment.create({ data: { eventId, ...data } });
  }

  async updateEquipment(id: string, data: any) {
    return prisma.eventEquipment.update({ where: { id }, data });
  }

  async removeEquipment(id: string) {
    return prisma.eventEquipment.delete({ where: { id } });
  }

  // ============= NOTES =============
  async addNote(eventId: string, data: { content: string; authorName: string; isInternal?: boolean }) {
    return prisma.eventNote.create({ data: { eventId, ...data } });
  }

  async deleteNote(id: string) {
    return prisma.eventNote.delete({ where: { id } });
  }

  // ============= INCIDENTS =============
  async addIncident(eventId: string, data: { title: string; description: string; severity?: string; category?: string; images?: string[] }) {
    return prisma.eventIncident.create({ data: { eventId, ...data } });
  }

  async resolveIncident(id: string, data: { resolution: string; resolvedBy: string; cost?: number }) {
    return prisma.eventIncident.update({
      where: { id },
      data: { ...data, resolved: true, resolvedAt: new Date() },
    });
  }

  // ============= DOCUMENTS =============
  async addDocument(eventId: string, data: { name: string; type: string; url: string; fileSize?: number; uploadedBy?: string }) {
    return prisma.eventDocument.create({ data: { eventId, ...data } });
  }

  async removeDocument(id: string) {
    return prisma.eventDocument.delete({ where: { id } });
  }

  // ============= STATS =============
  async getStats() {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        total,
        byPhase,
        thisMonth,
        openIncidents,
      ] = await Promise.all([
        prisma.event.count(),
        prisma.event.groupBy({ by: ['phase'], _count: true }),
        prisma.event.count({ where: { eventDate: { gte: startOfMonth } } }),
        prisma.eventIncident.count({ where: { resolved: false } }),
      ]);

      return {
        total,
        thisMonth,
        openIncidents,
        byPhase: Object.fromEntries(byPhase.map(p => [p.phase, p._count])),
      };
    } catch (error) {
      logger.error('Error getting event stats:', error);
      throw error;
    }
  }

  // ============= HELPERS =============
  private fullInclude() {
    return {
      timeline: { orderBy: { sortOrder: 'asc' as const } },
      checklist: { orderBy: { sortOrder: 'asc' as const } },
      staff: true,
      equipment: true,
      documents: { orderBy: { createdAt: 'desc' as const } },
      notes: { orderBy: { createdAt: 'desc' as const } },
      incidents: { orderBy: { createdAt: 'desc' as const } },
    };
  }

  private async createDefaultChecklist(eventId: string, eventType: string) {
    const baseItems = [
      { text: 'Confirmar datos del cliente', category: 'Pre-evento', isRequired: true, sortOrder: 1 },
      { text: 'Confirmar fecha y horarios', category: 'Pre-evento', isRequired: true, sortOrder: 2 },
      { text: 'Confirmar ubicación y accesos', category: 'Pre-evento', isRequired: true, sortOrder: 3 },
      { text: 'Asignar personal', category: 'Pre-evento', isRequired: false, sortOrder: 4 },
      { text: 'Preparar equipos (picking)', category: 'Preparación', isRequired: true, sortOrder: 5 },
      { text: 'Cargar vehículo', category: 'Preparación', isRequired: true, sortOrder: 6 },
      { text: 'Montaje completado', category: 'Montaje', isRequired: true, sortOrder: 7 },
      { text: 'Prueba de sonido / check técnico', category: 'Montaje', isRequired: true, sortOrder: 8 },
      { text: 'Desmontaje completado', category: 'Post-evento', isRequired: true, sortOrder: 9 },
      { text: 'Revisar estado de equipos', category: 'Post-evento', isRequired: true, sortOrder: 10 },
      { text: 'Devolver equipos al almacén', category: 'Post-evento', isRequired: true, sortOrder: 11 },
    ];

    // Añadir items extra segun tipo
    const extraItems: any[] = [];
    if (eventType.toLowerCase().includes('boda')) {
      extraItems.push(
        { text: 'Confirmar playlist con novios', category: 'Pre-evento', sortOrder: 12 },
        { text: 'Coordinar con wedding planner', category: 'Pre-evento', sortOrder: 13 },
        { text: 'Confirmar horarios de ceremonias', category: 'Pre-evento', sortOrder: 14 },
      );
    } else if (eventType.toLowerCase().includes('concierto') || eventType.toLowerCase().includes('festival')) {
      extraItems.push(
        { text: 'Recibir rider técnico del artista', category: 'Pre-evento', isRequired: true, sortOrder: 12 },
        { text: 'Coordinar backline', category: 'Pre-evento', sortOrder: 13 },
        { text: 'Verificar permisos y licencias', category: 'Pre-evento', isRequired: true, sortOrder: 14 },
      );
    } else if (eventType.toLowerCase().includes('corporativo')) {
      extraItems.push(
        { text: 'Confirmar presentaciones/contenido', category: 'Pre-evento', sortOrder: 12 },
        { text: 'Probar conectividad y proyección', category: 'Montaje', sortOrder: 13 },
      );
    }

    const allItems = [...baseItems, ...extraItems].map(item => ({
      eventId,
      ...item,
      completed: false,
      isRequired: item.isRequired || false,
    }));

    await prisma.eventChecklistItem.createMany({ data: allItems });
  }
}

export const eventService = new EventService();
