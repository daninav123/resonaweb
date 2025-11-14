import api from './api';

const API_URL = '/blog';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  featuredImage?: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string;
  scheduledFor?: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
  views: number;
  likes: number;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  _count?: {
    posts: number;
  };
}

export interface CreateBlogPostData {
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
  status?: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';
  scheduledFor?: string;
}

export const blogService = {
  // Posts
  async getPosts(params?: {
    status?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
  }) {
    return await api.get(`${API_URL}/admin/posts`, { params });
  },

  async getPublishedPosts(params?: {
    categoryId?: string;
    page?: number;
    limit?: number;
  }) {
    return await api.get(`${API_URL}/posts`, { params });
  },

  async getPostById(id: string) {
    return await api.get(`${API_URL}/admin/posts/${id}`);
  },

  async getPostBySlug(slug: string) {
    return await api.get(`${API_URL}/posts/slug/${slug}`);
  },

  async createPost(data: CreateBlogPostData) {
    return await api.post(`${API_URL}/admin/posts`, data);
  },

  async updatePost(id: string, data: Partial<CreateBlogPostData>) {
    return await api.put(`${API_URL}/admin/posts/${id}`, data);
  },

  async deletePost(id: string) {
    return await api.delete(`${API_URL}/admin/posts/${id}`);
  },

  async publishPost(id: string) {
    return await api.post(`${API_URL}/admin/posts/${id}/publish`);
  },

  async schedulePost(id: string, scheduledFor: string) {
    return await api.post(`${API_URL}/admin/posts/${id}/schedule`, { scheduledFor });
  },

  // Categories
  async getCategories() {
    return await api.get(`${API_URL}/categories`);
  },

  async createCategory(data: { name: string; slug: string; description?: string; color?: string }) {
    return await api.post(`${API_URL}/admin/categories`, data);
  },

  // Stats
  async getStats() {
    return await api.get(`${API_URL}/admin/stats`);
  },

  // Generar artículo con IA
  async generateWithAI() {
    return await api.post(`${API_URL}/admin/generate-ai`);
  },
};
