import { useState, useEffect } from 'react';
import { blogService, BlogPost, BlogCategory } from '../../services/blog.service';
import { PenSquare, Trash2, Eye, Calendar, Send, Plus, Save, X, Clock, CheckCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { ResponsiveTableWrapper } from '../../components/admin/ResponsiveTableWrapper';

const BlogManager = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [generatingAI, setGeneratingAI] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    categoryId: '',
    tags: [] as string[],
    status: 'DRAFT' as 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED',
    scheduledFor: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [postsData, categoriesData, statsData] = await Promise.all([
        blogService.getPosts(),
        blogService.getCategories(),
        blogService.getStats(),
      ]);
      
      console.log('Posts data:', postsData);
      console.log('Categories data:', categoriesData);
      console.log('Stats data:', statsData);
      
      // El backend devuelve { posts, pagination }, no { data }
      const posts = (postsData as any).posts || [];
      setPosts(posts);
      setCategories((categoriesData as any) || []);
      setStats(statsData || null);
    } catch (error: any) {
      console.error('Error cargando datos del blog:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Error desconocido';
      toast.error(`Error al cargar datos del blog: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
      metaTitle: title.length <= 60 ? title : title.substring(0, 60),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Filtrar ARCHIVED si existe, ya que no es válido para crear/actualizar
      const dataToSend = {
        ...formData,
        status: formData.status === 'ARCHIVED' ? 'DRAFT' : formData.status as 'DRAFT' | 'SCHEDULED' | 'PUBLISHED'
      };
      
      if (editingPost) {
        await blogService.updatePost(editingPost.id, dataToSend);
        toast.success('Artículo actualizado');
      } else {
        await blogService.createPost(dataToSend);
        toast.success('Artículo creado');
      }
      
      setShowEditor(false);
      setEditingPost(null);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al guardar artículo');
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      metaTitle: post.metaTitle || '',
      metaDescription: post.metaDescription || '',
      metaKeywords: post.metaKeywords || '',
      categoryId: post.categoryId || '',
      tags: post.tags.map(t => t.name),
      status: post.status,
      scheduledFor: post.scheduledFor || '',
    });
    setShowEditor(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este artículo?')) return;
    
    try {
      await blogService.deletePost(id);
      toast.success('Artículo eliminado');
      loadData();
    } catch (error) {
      toast.error('Error al eliminar artículo');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await blogService.publishPost(id);
      toast.success('Artículo publicado');
      loadData();
    } catch (error) {
      toast.error('Error al publicar artículo');
    }
  };

  const handleGenerateAI = async () => {
    setGeneratingAI(true);
    const loadingToast = toast.loading('IA generando artículo profesional... (30-60 seg)');
    
    try {
      const result = await blogService.generateWithAI() as any;
      toast.dismiss(loadingToast);
      
      if (result && result.post) {
        toast.success(`✨ ¡Artículo creado con IA! "${result.post.title}"`);
        loadData();
      } else {
        toast.error('El artículo no se pudo generar correctamente');
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error('Error generando artículo:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Error al generar artículo con IA';
      toast.error(String(errorMessage));
    } finally {
      setGeneratingAI(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      categoryId: '',
      tags: [],
      status: 'DRAFT',
      scheduledFor: '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return <CheckCircle className="w-4 h-4" />;
      case 'SCHEDULED': return <Clock className="w-4 h-4" />;
      default: return <PenSquare className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-resona"></div>
    </div>;
  }

  return (
    <div className="p-6">
      {/* Header con Estadísticas */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Blog</h1>
          <div className="flex gap-3">
            <button
              onClick={handleGenerateAI}
              disabled={generatingAI}
              className="flex items-center gap-2 bg-resona text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-5 h-5" />
              {generatingAI ? 'Generando...' : 'Generar con IA'}
            </button>
            <button
              onClick={() => {
                setShowEditor(true);
                setEditingPost(null);
                resetForm();
              }}
              className="flex items-center gap-2 bg-resona text-white px-4 py-2 rounded-lg hover:bg-resona-dark transition"
            >
              <Plus className="w-5 h-5" />
              Nuevo Artículo
            </button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Total Artículos</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalPosts}</div>
            </div>
            <div className="bg-green-50 rounded-lg shadow p-4">
              <div className="text-sm text-green-600">Publicados</div>
              <div className="text-2xl font-bold text-green-900">{stats.published}</div>
            </div>
            <div className="bg-blue-50 rounded-lg shadow p-4">
              <div className="text-sm text-blue-600">Programados</div>
              <div className="text-2xl font-bold text-blue-900">{stats.scheduled}</div>
            </div>
            <div className="bg-gray-50 rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Total Vistas</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</div>
            </div>
          </div>
        )}

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full my-8">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">
                {editingPost ? 'Editar Artículo' : 'Nuevo Artículo'}
              </h2>
              <button
                onClick={() => {
                  setShowEditor(false);
                  setEditingPost(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona bg-gray-50"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL: /blog/{formData.slug}
                </p>
              </div>

              {/* Extracto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Extracto *
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                  required
                />
              </div>

              {/* Contenido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenido (Markdown) *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={15}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona font-mono text-sm"
                  required
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                >
                  <option value="">Sin categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* SEO */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">SEO</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Title ({formData.metaTitle.length}/60)
                    </label>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      maxLength={60}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Description ({formData.metaDescription.length}/155)
                    </label>
                    <textarea
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      maxLength={155}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Keywords (separadas por coma)
                    </label>
                    <input
                      type="text"
                      value={formData.metaKeywords}
                      onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                    />
                  </div>
                </div>
              </div>

              {/* Estado y Programación */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Publicación</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                    >
                      <option value="DRAFT">Borrador</option>
                      <option value="SCHEDULED">Programado</option>
                      <option value="PUBLISHED">Publicado</option>
                    </select>
                  </div>

                  {formData.status === 'SCHEDULED' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de publicación
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.scheduledFor}
                        onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-resona text-white px-6 py-3 rounded-lg hover:bg-resona-dark transition font-semibold"
                >
                  <Save className="w-5 h-5" />
                  {editingPost ? 'Actualizar' : 'Crear'} Artículo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditor(false);
                    setEditingPost(null);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Artículos */}
      <ResponsiveTableWrapper>
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vistas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{post.title}</div>
                      <div className="text-xs text-gray-500">
                        {post.aiGenerated && <span className="text-purple-600">🤖 IA</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {post.category?.name || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                      {getStatusIcon(post.status)}
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.views}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {post.publishedAt 
                      ? new Date(post.publishedAt).toLocaleDateString('es-ES')
                      : post.scheduledFor
                      ? `📅 ${new Date(post.scheduledFor).toLocaleDateString('es-ES')}`
                      : new Date(post.createdAt).toLocaleDateString('es-ES')
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      {post.status !== 'PUBLISHED' && (
                        <button
                          onClick={() => handlePublish(post.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Publicar ahora"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(post)}
                        className="text-resona hover:text-resona-dark"
                        title="Editar"
                      >
                        <PenSquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </ResponsiveTableWrapper>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay artículos todavía</p>
            <button
              onClick={() => {
                setShowEditor(true);
                setEditingPost(null);
                resetForm();
              }}
              className="mt-4 text-resona hover:text-resona-dark font-medium"
            >
              Crear el primer artículo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogManager;
