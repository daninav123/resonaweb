import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';

interface PersonalItem {
  id: string;
  name: string;
  sku: string;
  description?: string;
  purchasePrice: number;
  pricePerDay: number;
  stock: number;
  isActive: boolean;
  categoryId: string;
}

const PersonalManager = () => {
  const [personal, setPersonal] = useState<PersonalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [personalCategoryId, setPersonalCategoryId] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    purchasePrice: 0,
    pricePerDay: 0,
    stock: 1,
    isActive: true,
  });

  useEffect(() => {
    loadPersonalCategory();
  }, []);

  useEffect(() => {
    if (personalCategoryId) {
      loadPersonal();
    }
  }, [personalCategoryId]);

  const loadPersonalCategory = async () => {
    try {
      const response: any = await api.get('/products/categories?includeInactive=true&includeHidden=true');
      const categories = response.data || [];
      
      const personalCat = categories.find((cat: any) => 
        cat.name.toLowerCase() === 'personal'
      );
      
      if (personalCat) {
        setPersonalCategoryId(personalCat.id);
      } else {
        toast.error('No se encontró la categoría Personal');
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
      toast.error('Error al cargar categorías');
    }
  };

  const loadPersonal = async () => {
    try {
      setLoading(true);
      const response: any = await api.get(`/products?categoryId=${personalCategoryId}&limit=100`);
      const products = response.data || [];
      
      setPersonal(products);
    } catch (error) {
      console.error('Error cargando personal:', error);
      toast.error('Error al cargar el personal');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (!formData.name || !formData.purchasePrice || !formData.pricePerDay) {
        toast.error('Completa todos los campos obligatorios');
        return;
      }

      const sku = `PERS-${formData.name.toUpperCase().replace(/\s+/g, '-')}-${Date.now()}`;
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      await api.post('/products', {
        name: formData.name,
        sku,
        slug,
        description: formData.description,
        categoryId: personalCategoryId,
        purchasePrice: formData.purchasePrice,
        pricePerDay: formData.pricePerDay,
        pricePerWeekend: formData.pricePerDay,
        pricePerWeek: formData.pricePerDay,
        stock: formData.stock,
        realStock: formData.stock,
        availableStock: formData.stock,
        isActive: formData.isActive,
        status: 'AVAILABLE',
        stockStatus: 'IN_STOCK',
      });

      toast.success('Personal creado correctamente');
      setShowCreateForm(false);
      setFormData({
        name: '',
        description: '',
        purchasePrice: 0,
        pricePerDay: 0,
        stock: 1,
        isActive: true,
      });
      loadPersonal();
    } catch (error: any) {
      console.error('Error creando personal:', error);
      toast.error(error.response?.data?.message || 'Error al crear personal');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await api.put(`/products/${id}`, {
        name: formData.name,
        description: formData.description,
        purchasePrice: formData.purchasePrice,
        pricePerDay: formData.pricePerDay,
        pricePerWeekend: formData.pricePerDay,
        pricePerWeek: formData.pricePerDay,
        stock: formData.stock,
        realStock: formData.stock,
        availableStock: formData.stock,
        isActive: formData.isActive,
      });

      toast.success('Personal actualizado correctamente');
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        purchasePrice: 0,
        pricePerDay: 0,
        stock: 1,
        isActive: true,
      });
      loadPersonal();
    } catch (error: any) {
      console.error('Error actualizando personal:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar personal');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${name}"?`)) {
      return;
    }

    try {
      await api.delete(`/products/${id}`);
      toast.success('Personal eliminado');
      loadPersonal();
    } catch (error: any) {
      console.error('Error eliminando personal:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar');
    }
  };

  const startEdit = (item: PersonalItem) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      description: item.description || '',
      purchasePrice: Number(item.purchasePrice),
      pricePerDay: Number(item.pricePerDay),
      stock: item.stock,
      isActive: item.isActive,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      purchasePrice: 0,
      pricePerDay: 0,
      stock: 1,
      isActive: true,
    });
  };

  const calculateMargin = (cost: number, price: number) => {
    if (price === 0) return 0;
    return ((price - cost) / price * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-resona"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-purple-600" />
            Gestión de Personal
          </h1>
          <p className="text-gray-600 mt-1">
            Montadores, DJs, técnicos y demás personal. <strong>Precios por hora.</strong>
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Personal
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-purple-500">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Crear Nuevo Personal</h2>
            <button
              onClick={() => setShowCreateForm(false)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Puesto *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Ej: Montador, DJ, Técnico de Sonido"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                rows={2}
                placeholder="Ej: Montador profesional con experiencia en estructuras"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coste por Hora (€) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Lo que te cuesta"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio de Venta por Hora (€) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.pricePerDay}
                onChange={(e) => setFormData({ ...formData, pricePerDay: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Lo que cobras al cliente"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personas Disponibles
              </label>
              <input
                type="number"
                min="1"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-purple-600 focus:ring-purple-600 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Activo</label>
            </div>
          </div>

          {formData.purchasePrice > 0 && formData.pricePerDay > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Margen:</strong> {calculateMargin(formData.purchasePrice, formData.pricePerDay)}% 
                ({(formData.pricePerDay - formData.purchasePrice).toFixed(2)}€/hora)
              </p>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Crear Personal
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de Personal */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-purple-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-900 uppercase">Puesto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-900 uppercase">Descripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-900 uppercase">Coste/h</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-900 uppercase">Precio/h</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-900 uppercase">Margen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-900 uppercase">Disponibles</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-900 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-900 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {personal.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  No hay personal registrado. Crea el primero.
                </td>
              </tr>
            ) : (
              personal.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {editingId === item.id ? (
                    <>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          step="0.01"
                          value={formData.purchasePrice}
                          onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                          className="w-20 px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          step="0.01"
                          value={formData.pricePerDay}
                          onChange={(e) => setFormData({ ...formData, pricePerDay: parseFloat(e.target.value) || 0 })}
                          className="w-20 px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {calculateMargin(formData.purchasePrice, formData.pricePerDay)}%
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="1"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 1 })}
                          className="w-16 px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="w-4 h-4 text-purple-600"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdate(item.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Guardar"
                          >
                            <Save className="w-5 h-5" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-600 hover:text-gray-900"
                            title="Cancelar"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.sku}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {item.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        €{Number(item.purchasePrice).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                        €{Number(item.pricePerDay).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          Number(calculateMargin(Number(item.purchasePrice), Number(item.pricePerDay))) >= 30
                            ? 'bg-green-100 text-green-800'
                            : Number(calculateMargin(Number(item.purchasePrice), Number(item.pricePerDay))) >= 15
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {calculateMargin(Number(item.purchasePrice), Number(item.pricePerDay))}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.stock} persona{item.stock > 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          item.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(item)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Editar"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PersonalManager;
