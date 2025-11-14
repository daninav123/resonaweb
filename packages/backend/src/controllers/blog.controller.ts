import { Request, Response } from 'express';
import { blogService } from '../services/blog.service';
import { BlogPostStatus } from '@prisma/client';

export const blogController = {
  // ========== POSTS ==========

  async createPost(req: Request, res: Response) {
    try {
      const post = await blogService.createPost({
        ...req.body,
        authorId: req.user.id,
      });

      res.status(201).json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getPosts(req: Request, res: Response) {
    try {
      const { status, categoryId, tagId, search, page, limit } = req.query;

      const result = await blogService.getPosts({
        status: status as BlogPostStatus,
        categoryId: categoryId as string,
        tagId: tagId as string,
        search: search as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getPublishedPosts(req: Request, res: Response) {
    try {
      const { categoryId, tagId, search, page, limit } = req.query;

      const result = await blogService.getPublishedPosts({
        categoryId: categoryId as string,
        tagId: tagId as string,
        search: search as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getPostBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const post = await blogService.getPostBySlug(slug, true);

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      res.json(post);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getPostById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const post = await blogService.getPostById(id);

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      res.json(post);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async updatePost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const post = await blogService.updatePost(id, req.body);

      res.json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async deletePost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await blogService.deletePost(id);

      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async publishPost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const post = await blogService.publishPost(id);

      res.json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async schedulePost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { scheduledFor } = req.body;

      const post = await blogService.schedulePost(id, new Date(scheduledFor));

      res.json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // ========== CATEGORÍAS ==========

  async createCategory(req: Request, res: Response) {
    try {
      const category = await blogService.createCategory(req.body);
      res.status(201).json(category);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getCategories(req: Request, res: Response) {
    try {
      const categories = await blogService.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const category = await blogService.updateCategory(id, req.body);
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await blogService.deleteCategory(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // ========== TAGS ==========

  async getTags(req: Request, res: Response) {
    try {
      const tags = await blogService.getTags();
      res.json(tags);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // ========== ESTADÍSTICAS ==========

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await blogService.getStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  },

  async generateWithAI(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      // Importar la función que publica inmediatamente
      const { generateArticleNow } = await import('../jobs/blog.job');
      
      const post = await generateArticleNow(userId);
      
      if (!post) {
        return res.status(409).json({ 
          error: 'El artículo ya existe',
          message: 'Ya existe un artículo con este título. Intenta de nuevo para generar uno diferente.'
        });
      }

      res.json({ 
        success: true, 
        message: 'Artículo generado con IA exitosamente',
        post 
      });
    } catch (error: any) {
      console.error('❌ Error en generateWithAI:', error);
      console.error('Stack:', error.stack);
      res.status(500).json({
        error: 'Error interno al generar artículo',
        message: error.message,
        details: error.stack
      });
    }
  },
};
