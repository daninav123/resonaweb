import { PrismaClient, BlogPostStatus } from '@prisma/client';
import { GoogleIndexingService } from './google-indexing.service';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface CreateBlogPostData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  featuredImage?: string;
  categoryId?: string;
  tags?: string[];
  status?: BlogPostStatus;
  publishedAt?: Date;
  scheduledFor?: Date;
  authorId: string;
  aiGenerated?: boolean;
  aiPrompt?: string;
}

export const blogService = {
  // Crear post
  async createPost(data: CreateBlogPostData) {
    const { tags, ...postData } = data;

    const post = await prisma.blogPost.create({
      data: {
        ...postData,
        tags: tags && tags.length > 0 ? {
          connectOrCreate: tags.map(tag => ({
            where: { name: tag },
            create: {
              name: tag,
              slug: tag.toLowerCase().replace(/\s+/g, '-'),
            },
          })),
        } : undefined,
      },
      include: {
        category: true,
        tags: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Indexar automáticamente si está publicado
    if (post.status === 'PUBLISHED' && post.publishedAt) {
      const postUrl = `https://resonaevents.com/blog/${post.slug}`;
      // Ejecutar en background sin esperar
      GoogleIndexingService.notifyGoogle(postUrl).catch(error => {
        logger.error(`❌ Error indexando blog post: ${error.message}`);
      });
    }

    return post;
  },

  // Obtener todos los posts (con filtros)
  async getPosts(filters: {
    status?: BlogPostStatus;
    categoryId?: string;
    tagId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      status,
      categoryId,
      tagId,
      search,
      page = 1,
      limit = 10,
    } = filters;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (tagId) {
      where.tags = {
        some: { id: tagId },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          category: true,
          tags: true,
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ]);

    return {
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Obtener posts publicados (para frontend público)
  async getPublishedPosts(filters: {
    categoryId?: string;
    tagId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    return this.getPosts({
      ...filters,
      status: BlogPostStatus.PUBLISHED,
    });
  },

  // Obtener post por slug
  async getPostBySlug(slug: string, includeViews = false) {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        category: true,
        tags: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Incrementar vistas
    if (post && includeViews) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { views: { increment: 1 } },
      });
    }

    return post;
  },

  // Obtener post por ID
  async getPostById(id: string) {
    return prisma.blogPost.findUnique({
      where: { id },
      include: {
        category: true,
        tags: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  },

  // Actualizar post
  async updatePost(id: string, data: Partial<CreateBlogPostData>) {
    const { tags, ...postData } = data;

    return prisma.blogPost.update({
      where: { id },
      data: {
        ...postData,
        ...(tags && {
          tags: {
            set: [],
            connectOrCreate: tags.map(tag => ({
              where: { name: tag },
              create: {
                name: tag,
                slug: tag.toLowerCase().replace(/\s+/g, '-'),
              },
            })),
          },
        }),
      },
      include: {
        category: true,
        tags: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  },

  // Eliminar post
  async deletePost(id: string) {
    return prisma.blogPost.delete({
      where: { id },
    });
  },

  // Publicar post inmediatamente
  async publishPost(id: string) {
    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        status: BlogPostStatus.PUBLISHED,
        publishedAt: new Date(),
        scheduledFor: null,
      },
    });

    // Indexar automáticamente en Google
    const postUrl = `https://resonaevents.com/blog/${post.slug}`;
    GoogleIndexingService.notifyGoogle(postUrl).catch(error => {
      logger.error(`❌ Error indexando blog post: ${error.message}`);
    });

    return post;
  },

  // Programar post para publicación futura
  async schedulePost(id: string, scheduledFor: Date) {
    return prisma.blogPost.update({
      where: { id },
      data: {
        status: BlogPostStatus.SCHEDULED,
        scheduledFor,
      },
    });
  },

  // Publicar posts programados (ejecutar con cron)
  async publishScheduledPosts() {
    const now = new Date();

    const scheduledPosts = await prisma.blogPost.findMany({
      where: {
        status: BlogPostStatus.SCHEDULED,
        scheduledFor: {
          lte: now,
        },
      },
    });

    const updates = scheduledPosts.map(post =>
      prisma.blogPost.update({
        where: { id: post.id },
        data: {
          status: BlogPostStatus.PUBLISHED,
          publishedAt: now,
        },
      })
    );

    await Promise.all(updates);

    return scheduledPosts.length;
  },

  // ========== CATEGORÍAS ==========

  async createCategory(data: { name: string; slug: string; description?: string; color?: string }) {
    return prisma.blogCategory.create({
      data,
    });
  },

  async getCategories() {
    return prisma.blogCategory.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  },

  async updateCategory(id: string, data: Partial<{ name: string; slug: string; description: string; color: string }>) {
    return prisma.blogCategory.update({
      where: { id },
      data,
    });
  },

  async deleteCategory(id: string) {
    return prisma.blogCategory.delete({
      where: { id },
    });
  },

  // ========== TAGS ==========

  async getTags() {
    return prisma.blogTag.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  },

  // ========== ESTADÍSTICAS ==========

  async getStats() {
    const [totalPosts, published, drafts, scheduled, totalViews] = await Promise.all([
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { status: BlogPostStatus.PUBLISHED } }),
      prisma.blogPost.count({ where: { status: BlogPostStatus.DRAFT } }),
      prisma.blogPost.count({ where: { status: BlogPostStatus.SCHEDULED } }),
      prisma.blogPost.aggregate({
        _sum: {
          views: true,
        },
      }),
    ]);

    return {
      totalPosts,
      published,
      drafts,
      scheduled,
      totalViews: totalViews._sum.views || 0,
    };
  },
};
