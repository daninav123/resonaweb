import { prisma } from '../index';
import { logger } from '../utils/logger';

export class EmailCampaignService {
  async list(filters?: { status?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const where: any = {};
    if (filters?.status) where.status = filters.status;

    const [data, total] = await Promise.all([
      prisma.emailCampaign.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.emailCampaign.count({ where }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async create(data: { name: string; subject: string; body: string; targetAudience?: string }) {
    return prisma.emailCampaign.create({ data: { ...data, status: 'draft' } });
  }

  async update(id: string, data: any) {
    return prisma.emailCampaign.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.emailCampaign.delete({ where: { id } });
  }

  async send(id: string) {
    const campaign = await prisma.emailCampaign.findUnique({ where: { id } });
    if (!campaign) throw new Error('Campaña no encontrada');

    // Contar destinatarios según audiencia
    let recipientCount = 0;
    try {
      if (campaign.targetAudience === 'all') {
        recipientCount = await prisma.user.count({ where: { role: 'CLIENT' } });
      } else {
        recipientCount = await prisma.user.count({ where: { role: 'CLIENT' } });
      }
    } catch {
      recipientCount = 0;
    }

    // TODO: Integrar con servicio de email real (SendGrid, SES, etc.)
    logger.info(`[EmailCampaign] Enviando campaña "${campaign.name}" a ${recipientCount} destinatarios`);

    const updated = await prisma.emailCampaign.update({
      where: { id },
      data: { status: 'sent', recipients: recipientCount, sentAt: new Date() },
    });

    return updated;
  }

  async getStats() {
    const [total, sent, draft] = await Promise.all([
      prisma.emailCampaign.count(),
      prisma.emailCampaign.count({ where: { status: 'sent' } }),
      prisma.emailCampaign.count({ where: { status: 'draft' } }),
    ]);
    const totalRecipients = await prisma.emailCampaign.aggregate({ _sum: { recipients: true } });
    return { total, sent, draft, totalRecipients: totalRecipients._sum.recipients || 0 };
  }
}

export const emailCampaignService = new EmailCampaignService();
