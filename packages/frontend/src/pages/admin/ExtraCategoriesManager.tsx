import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Plus, Edit2, Trash2, Save, X, GripVertical, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface ExtraCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description?: string;
  order: number;
  isActive: boolean;
  _count?: { products: number };
}

const AVAILABLE_COLORS = [
  { name: 'Púrpura', value: 'purple', class: 'bg-purple-500' },
  { name: 'Azul', value: 'blue', class: 'bg-blue-500' },
  { name: 'Rosa', value: 'pink', class: 'bg-pink-500' },
  { name: 'Amarillo', value: 'yellow', class: 'bg-yellow-500' },
  { name: 'Gris', value: 'gray', class: 'bg-gray-500' },
  { name: 'Índigo', value: 'indigo', class: 'bg-indigo-500' },
  { name: 'Verde', value: 'green', class: 'bg-green-500' },
  { name: 'Rojo', value: 'red', class: 'bg-red-500' },
  { name: 'Naranja', value: 'orange', class: 'bg-orange-500' },
  { name: 'Pizarra', value: 'slate', class: 'bg-slate-500' },
];

const POPULAR_ICONS = [
  '🎵', '✨', '🎨', '💡', '🏗️', '📺', '📦',
  '🎭', '🎪', '🎬', '🎤', '🎧', '🎸', '🎹',
  '🎺', '🎻', '🥁', '🎙️', '🎚️', '🎛️', '📷',
  '📹', '💐', '🌸', '🌺', '🌻', '🌹', '🎀',
  '🎈', '🎉', '🎊', '🕯️', '💫', '⭐', '🌟',
  '🔥', '❄️', '💧', '🌈', '☁️', '⛅', '🌤️'
];

const ExtraCategoriesManager = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '📦',
    color: 'purple',
    description: '',
    order: 0,
    isActive: true
  });

  // Cargar categorías
  const { data: categories, isLoading } = useQuery<ExtraCategory[]>({
    queryKey: ['extra-categories-admin'],
    queryFn: async () => {
      const response: any = await api.get('/extra-categories?includeInactive=true');
      return response.categories || [];
    }
  });

  // Crear categoría
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await api.post('/extra-categories', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extra-categories-admin'] });
      toast.success('Categoría creada correctamente');
      setShowModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear categoría');
    }
  });

  // Actualizar categoría
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await api.put(`/extra-categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extra-categories-admin'] });
      toast.success('Categoría actualizada correctamente');
      setEditingId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar categoría');
    }
  });

  // Eliminar categoría
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/extra-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extra-categories-admin'] });
      toast.success('Categoría eliminada correctamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar categoría');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      icon: '📦',
      color: 'purple',
      description: '',
      order: 0,
      isActive: true
    });
  };

  const handleCreate = () => {
    setShowModal(true);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.name || !formData.slug) {
      toast.error('Nombre y slug son obligatorios');
      return;
    }
    
    createMutation.mutate(formData);
  };

  const handleUpdate = (category: ExtraCategory) => {
    const updates = {
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      color: category.color,
      description: category.description,
      order: category.order,
      isActive: category.isActive
    };
    
    updateMutation.mutate({ id: category.id, data: updates });
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar la categoría "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/admin"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Dashboard
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categorías de Extras</h1>
            <p className="text-gray-600 mt-1">
              Organiza los extras de la calculadora en pestañas temáticas
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva Categoría
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Categorías</div>
          <div className="text-2xl font-bold text-gray-900">{categories?.length || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Activas</div>
          <div className="text-2xl font-bold text-green-600">
            {categories?.filter(c => c.isActive).length || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Inactivas</div>
          <div className="text-2xl font-bold text-gray-400">
            {categories?.filter(c => !c.isActive).length || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Productos</div>
          <div className="text-2xl font-bold text-purple-600">
            {categories?.reduce((acc, c) => acc + (c._count?.products || 0), 0) || 0}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-purple-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Orden
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Icono
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Color
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Productos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories?.sort((a, b) => a.order - b.order).map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === category.id ? (
                    <input
                      type="number"
                      value={category.order}
                      onChange={(e) => {
                        const updated = categories.map(c =>
                          c.id === category.id ? { ...c, order: parseInt(e.target.value) } : c
                        );
                        queryClient.setQueryData(['extra-categories-admin'], updated);
                      }}
                      className="w-20 px-2 py-1 border rounded"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{category.order}</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === category.id ? (
                    <button
                      onClick={() => setShowIconPicker(true)}
                      className="text-3xl hover:scale-110 transition-transform"
                    >
                      {category.icon}
                    </button>
                  ) : (
                    <span className="text-3xl">{category.icon}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === category.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={category.name}
                        onChange={(e) => {
                          const updated = categories.map(c =>
                            c.id === category.id ? { ...c, name: e.target.value } : c
                          );
                          queryClient.setQueryData(['extra-categories-admin'], updated);
                        }}
                        className="w-full px-2 py-1 border rounded"
                        placeholder="Nombre"
                      />
                      <input
                        type="text"
                        value={category.slug}
                        onChange={(e) => {
                          const updated = categories.map(c =>
                            c.id === category.id ? { ...c, slug: e.target.value } : c
                          );
                          queryClient.setQueryData(['extra-categories-admin'], updated);
                        }}
                        className="w-full px-2 py-1 border rounded text-sm"
                        placeholder="slug"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium text-gray-900">{category.name}</div>
                      <div className="text-sm text-gray-500">{category.slug}</div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === category.id ? (
                    <select
                      value={category.color}
                      onChange={(e) => {
                        const updated = categories.map(c =>
                          c.id === category.id ? { ...c, color: e.target.value } : c
                        );
                        queryClient.setQueryData(['extra-categories-admin'], updated);
                      }}
                      className="px-2 py-1 border rounded"
                    >
                      {AVAILABLE_COLORS.map(color => (
                        <option key={color.value} value={color.value}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded ${AVAILABLE_COLORS.find(c => c.value === category.color)?.class}`} />
                      <span className="text-sm capitalize">{category.color}</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    {category._count?.products || 0}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === category.id ? (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={category.isActive}
                        onChange={(e) => {
                          const updated = categories.map(c =>
                            c.id === category.id ? { ...c, isActive: e.target.checked } : c
                          );
                          queryClient.setQueryData(['extra-categories-admin'], updated);
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">Activa</span>
                    </label>
                  ) : (
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      category.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {category.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === category.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleUpdate(category)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingId(category.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id, category.name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Crear */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Nueva Categoría de Extra</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icono
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="text-4xl hover:scale-110 transition-transform"
                  >
                    {formData.icon}
                  </button>
                  <span className="text-sm text-gray-500">Haz clic para cambiar</span>
                </div>
                {showIconPicker && (
                  <div className="mt-2 p-3 border rounded-lg bg-gray-50 grid grid-cols-10 gap-2 max-h-48 overflow-y-auto">
                    {POPULAR_ICONS.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, icon });
                          setShowIconPicker(false);
                        }}
                        className="text-2xl hover:scale-125 transition-transform"
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({
                      ...formData,
                      name,
                      slug: generateSlug(name)
                    });
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AVAILABLE_COLORS.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`h-10 rounded-lg ${color.class} ${
                        formData.color === color.value ? 'ring-4 ring-offset-2 ring-gray-400' : ''
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orden
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Categoría activa
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creando...' : 'Crear Categoría'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtraCategoriesManager;
