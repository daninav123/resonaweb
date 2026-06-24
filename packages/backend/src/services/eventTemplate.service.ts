import { prisma } from '../index';
import { logger } from '../utils/logger';

export class EventTemplateService {
  async list(filters: { eventType?: string; search?: string; page?: number; limit?: number }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const where: any = { isActive: true };
    if (filters.eventType) where.eventType = filters.eventType;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      prisma.eventTemplate.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { name: 'asc' } }),
      prisma.eventTemplate.count({ where }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getById(id: string) {
    return prisma.eventTemplate.findUnique({ where: { id } });
  }

  async create(data: any) {
    return prisma.eventTemplate.create({ data });
  }

  async update(id: string, data: any) {
    return prisma.eventTemplate.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.eventTemplate.update({ where: { id }, data: { isActive: false } });
  }

  async createEventFromTemplate(templateId: string, eventData: { eventDate: string; clientName: string; clientEmail?: string; clientPhone?: string; venueName?: string; venueAddress?: string; attendees?: number; briefing?: string }) {
    const template = await prisma.eventTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw new Error('Plantilla no encontrada');

    // Generar número de evento
    const year = new Date().getFullYear();
    const count = await prisma.event.count({ where: { eventNumber: { startsWith: `EVT-${year}` } } });
    const eventNumber = `EVT-${year}-${String(count + 1).padStart(4, '0')}`;

    // Crear evento con datos de la plantilla
    const event = await prisma.event.create({
      data: {
        eventNumber,
        name: `${template.name} - ${eventData.clientName}`,
        eventType: template.eventType,
        priority: 'MEDIUM',
        eventDate: new Date(eventData.eventDate),
        venueName: eventData.venueName,
        venueAddress: eventData.venueAddress,
        clientName: eventData.clientName,
        clientEmail: eventData.clientEmail,
        clientPhone: eventData.clientPhone,
        attendees: eventData.attendees,
        briefing: eventData.briefing,
        estimatedCost: template.estimatedCost,
        phase: 'PLANNING',
      },
    });

    // Crear equipos desde plantilla
    const equipment = template.defaultEquipment as any[];
    if (equipment?.length) {
      await prisma.eventEquipment.createMany({
        data: equipment.map((eq: any) => ({
          eventId: event.id,
          productName: eq.productName,
          productId: eq.productId || null,
          quantity: eq.quantity || 1,
          notes: eq.notes || null,
        })),
      });
    }

    // Crear checklist desde plantilla
    const checklist = template.defaultChecklist as any[];
    if (checklist?.length) {
      await prisma.eventChecklistItem.createMany({
        data: checklist.map((item: any, idx: number) => ({
          eventId: event.id,
          text: item.text,
          category: item.category || 'general',
          isRequired: item.isRequired ?? false,
          sortOrder: idx,
        })),
      });
    }

    // Crear timeline desde plantilla
    const timeline = template.defaultTimeline as any[];
    if (timeline?.length) {
      await prisma.eventTimelineItem.createMany({
        data: timeline.map((item: any, idx: number) => ({
          eventId: event.id,
          time: item.time,
          endTime: item.endTime || null,
          title: item.title,
          description: item.description || null,
          sortOrder: idx,
        })),
      });
    }

    logger.info(`Event ${eventNumber} created from template ${template.name}`);
    return prisma.event.findUnique({
      where: { id: event.id },
      include: {
        timeline: { orderBy: { sortOrder: 'asc' } },
        checklist: { orderBy: { sortOrder: 'asc' } },
        equipment: true,
        staff: true,
        notes: true,
        incidents: true,
        documents: true,
      },
    });
  }
}

export const eventTemplateService = new EventTemplateService();
