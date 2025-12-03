import { useState, useEffect } from 'react';
import { Truck, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface Montaje {
  id: string;
  name: string;
  slug: string;
  description: string;
  finalPrice: number;
  isActive: boolean;
  featured: boolean;
  category: string;
  createdAt: string;
  updatedAt: string;
}

const MontajesManager = () => {
  const [montajes, setMontajes] = useState<Montaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    finalPrice: 0,
    isActive: true,
    featured: false,
  });

  useEffect(() => {
    loadMontajes();
  }, []);

  const loadMontajes = async () => {
    try {
      setLoading(true);
      const response: any = await api.get('/packs');
      const allPacks = response?.packs || response || [];
      
      // Filtrar solo packs de categoría MONTAJE
      const montajePacks = allPacks.filter((pack: any) => pack.category === 'MONTAJE');
      
      console.log('🚚 Montajes cargados:', montajePacks);
      setMontajes(montajePacks);
    } catch (error) {
      console.error('Error cargando montajes:', error);
      toast.error('Error al cargar montajes');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.finalPrice) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      const slug = formData.slug || generateSlug(formData.name);
      
      const packData = {
        name: formData.name,
        slug: slug,
        description: formData.description,
        category: 'MONTAJE', // Forzar categoría MONTAJE
        finalPrice: formData.finalPrice,
        calculatedTotalPrice: formData.finalPrice,
        basePricePerDay: formData.finalPrice,
        isActive: formData.isActive,
        featured: formData.featured,
        autoCalculate: false,
        customPriceEnabled: true,
      };

      console.log('📦 Creando montaje:', packData);
      await api.post('/packs', packData);
      
      toast.success('Servicio de montaje creado exitosamente');
      setShowCreateModal(false);
      resetForm();
      loadMontajes();
    } catch (error: any) {
      console.error('Error creando montaje:', error);
      toast.error(error?.response?.data?.message || 'Error al crear montaje');
    }
  };

  const handleUpdate = async (montaje: Montaje) => {
    try {
      const packData = {
        name: montaje.name,
        slug: montaje.slug,
        description: montaje.description,
        category: 'MONTAJE', // Mantener categoría MONTAJE
        finalPrice: montaje.finalPrice,
        calculatedTotalPrice: montaje.finalPrice,
        basePricePerDay: montaje.finalPrice,
        isActive: montaje.isActive,
        featured: montaje.featured,
        autoCalculate: false,
        customPriceEnabled: true,
      };

      await api.put(`/packs/${montaje.id}`, packData);
      toast.success('Montaje actualizado');
      setEditingId(null);
      loadMontajes();
    } catch (error: any) {
      console.error('Error actualizando montaje:', error);
      toast.error('Error al actualizar montaje');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar el servicio "${name}"?`)) return;

    try {
      await api.delete(`/packs/${id}`);
      toast.success('Montaje eliminado');
      loadMontajes();
    } catch (error) {
      console.error('Error eliminando montaje:', error);
      toast.error('Error al eliminar montaje');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      finalPrice: 0,
      isActive: true,
      featured: false,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link to="/admin" className="text-purple-600 hover:text-purple-800 mb-4 inline-block">
            ← Volver al Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Truck className="w-8 h-8 text-purple-600" />
                Servicios de Montaje
              </h1>
              <p className="text-gray-600 mt-1">
                Gestiona los servicios de transporte e instalación. <strong>Precio único por evento.</strong>
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nuevo Servicio
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Servicios</p>
                <p className="text-2xl font-bold text-purple-600">{montajes.length}</p>
              </div>
              <Truck className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div>
              <p className="text-sm text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-green-600">
                {montajes.filter(m => m.isActive).length}
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div>
              <p className="text-sm text-gray-600">Precio Promedio</p>
              <p className="text-2xl font-bold text-gray-900">
                €{montajes.length > 0 
                  ? (montajes.reduce((sum, m) => sum + m.finalPrice, 0) / montajes.length).toFixed(2)
                  : '0.00'}
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-purple-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-purple-900 uppercase">Servicio</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-purple-900 uppercase">Descripción</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-purple-900 uppercase">Precio</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-purple-900 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-purple-900 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {montajes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    <Truck className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p>No hay servicios de montaje aún</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="text-purple-600 hover:underline mt-2"
                    >
                      Crear el primero
                    </button>
                  </td>
                </tr>
              ) : (
                montajes.map((montaje) => (
                  <tr key={montaje.id} className="hover:bg-gray-50">
                    {editingId === montaje.id ? (
                      <>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={montaje.name}
                            onChange={(e) => {
                              const updated = montajes.map(m =>
                                m.id === montaje.id ? { ...m, name: e.target.value } : m
                              );
                              setMontajes(updated);
                            }}
                            className="w-full px-2 py-1 border rounded"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <textarea
                            value={montaje.description}
                            onChange={(e) => {
                              const updated = montajes.map(m =>
                                m.id === montaje.id ? { ...m, description: e.target.value } : m
                              );
                              setMontajes(updated);
                            }}
                            className="w-full px-2 py-1 border rounded"
                            rows={2}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={montaje.finalPrice}
                            onChange={(e) => {
                              const updated = montajes.map(m =>
                                m.id === montaje.id ? { ...m, finalPrice: Number(e.target.value) } : m
                              );
                              setMontajes(updated);
                            }}
                            className="w-24 px-2 py-1 border rounded"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={montaje.isActive}
                              onChange={(e) => {
                                const updated = montajes.map(m =>
                                  m.id === montaje.id ? { ...m, isActive: e.target.checked } : m
                                );
                                setMontajes(updated);
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">Activo</span>
                          </label>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdate(montaje)}
                              className="text-green-600 hover:text-green-800"
                              title="Guardar"
                            >
                              <Save className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                loadMontajes(); // Recargar para cancelar cambios
                              }}
                              className="text-gray-600 hover:text-gray-800"
                              title="Cancelar"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{montaje.name}</div>
                          <div className="text-xs text-gray-500">{montaje.slug}</div>
                          {montaje.featured && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                              ⭐ Destacado
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-600 line-clamp-2">{montaje.description}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-lg font-bold text-purple-600">€{montaje.finalPrice.toFixed(2)}</span>
                          <p className="text-xs text-gray-500">precio único</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            montaje.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {montaje.isActive ? '✓ Activo' : '○ Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingId(montaje.id)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Editar"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(montaje.id, montaje.name)}
                              className="text-red-600 hover:text-red-800"
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

        {/* Info Box */}
        <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-2">ℹ️ Acerca de los Montajes</h3>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Los servicios de montaje tienen un <strong>precio único por evento</strong> (no se multiplican por días)</li>
            <li>• Aparecen en la calculadora de eventos en la sección "🚚 Servicio de Montaje"</li>
            <li>• Los clientes pueden elegir entre "Sin montaje (Recogida)" o seleccionar un servicio</li>
            <li>• Los servicios "Destacados" aparecen primero en la lista</li>
          </ul>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-purple-900">Nuevo Servicio de Montaje</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Servicio *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Ej: Transporte Zona Norte"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="Incluye transporte e instalación completa..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio (€) *
                  </label>
                  <input
                    type="number"
                    value={formData.finalPrice}
                    onChange={(e) => setFormData({ ...formData, finalPrice: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    min="0"
                    step="0.01"
                    placeholder="150.00"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Precio único por evento (no se multiplica por días)</p>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Servicio activo</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">⭐ Destacado (aparece primero)</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Crear Servicio
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MontajesManager;
