import { prisma } from '../index';

export class PortfolioService {
  async list(filters?: { published?: boolean; featured?: boolean; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const where: any = {};
    if (filters?.published !== undefined) where.published = filters.published;
    if (filters?.featured !== undefined) where.featured = filters.featured;

    const [data, total] = await Promise.all([
      prisma.portfolioItem.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.portfolioItem.count({ where }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getById(id: string) {
    return prisma.portfolioItem.findUnique({ where: { id } });
  }

  async create(data: { title: string; description?: string; eventType?: string; eventDate?: string; venue?: string; images?: string[]; featured?: boolean; published?: boolean }) {
    return prisma.portfolioItem.create({
      data: {
        title: data.title,
        description: data.description,
        eventType: data.eventType,
        eventDate: data.eventDate ? new Date(data.eventDate) : null,
        venue: data.venue,
        images: data.images || [],
        featured: data.featured || false,
        published: data.published || false,
      },
    });
  }

  async update(id: string, data: any) {
    if (data.eventDate) data.eventDate = new Date(data.eventDate);
    return prisma.portfolioItem.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.portfolioItem.delete({ where: { id } });
  }

  async getStats() {
    const [total, published, featured] = await Promise.all([
      prisma.portfolioItem.count(),
      prisma.portfolioItem.count({ where: { published: true } }),
      prisma.portfolioItem.count({ where: { featured: true } }),
    ]);
    return { total, published, featured };
  }
}

export const portfolioService = new PortfolioService();
