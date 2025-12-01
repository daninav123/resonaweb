import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Package, X, Save, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../services/api';

const PacksManager = () => {
  const navigate = useNavigate();
  const [packs, setPacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPack, setEditingPack] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [packsCategoryId, setPacksCategoryId] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountPercentage: 0,
    customFinalPrice: '',
    items: [] as Array<{ productId: string; quantity: number }>
  });

  useEffect(() => {
    loadPacks();
    loadCategories();
    loadProducts();
  }, []);

  const loadPacks = async () => {
    try {
      setLoading(true);
      const response: any = await api.get('/products/packs');
      console.log('📦 Respuesta de packs:', response);
      
      // El backend retorna { packs: [...] }
      const packsData = response?.packs || response || [];
      console.log('📦 Packs procesados:', packsData);
      
      setPacks(Array.isArray(packsData) ? packsData : []);
    } catch (error) {
      console.error('Error cargando packs:', error);
      toast.error('Error al cargar los packs');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response: any = await api.get('/categories');
      const cats = response?.categories || response || [];
      setCategories(Array.isArray(cats) ? cats : []);
      
      // Buscar categoría "Packs"
      const packsCategory = cats.find((cat: any) => 
        cat.name.toLowerCase().includes('pack')
      );
      if (packsCategory) {
        setPacksCategoryId(packsCategory.id);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response: any = await api.get('/products');
      const prods = response?.products || response || [];
      setProducts(Array.isArray(prods) ? prods : []);
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  const handleCreate = () => {
    setEditingPack(null);
    setFormData({
      name: '',
      description: '',
      discountPercentage: 0,
      customFinalPrice: '',
      items: []
    });
    setShowModal(true);
  };

  const handleEdit = (pack: any) => {
    setEditingPack(pack);
    setFormData({
      name: pack.name || '',
      description: pack.description || '',
      discountPercentage: Number(pack.discountPercentage || 0),
      customFinalPrice: pack.customPriceEnabled ? String(pack.finalPrice || '') : '',
      items: pack.items?.map((item: any) => ({
        productId: item.productId || item.product?.id,
        quantity: item.quantity
      })) || []
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('El nombre es obligatorio');
        return;
      }

      if (formData.items.length === 0) {
        toast.error('Debes agregar al menos un producto al pack');
        return;
      }

      const packData = {
        name: formData.name,
        description: formData.description,
        discountPercentage: formData.discountPercentage,
        customFinalPrice: formData.customFinalPrice ? parseFloat(formData.customFinalPrice) : undefined,
        items: formData.items,
        categoryId: packsCategoryId, // Predeterminar categoría Packs
        autoCalculate: true
      };

      if (editingPack) {
        await api.put(`/packs/${editingPack.id}`, packData);
        toast.success('Pack actualizado');
      } else {
        await api.post('/packs', packData);
        toast.success('Pack creado');
      }

      setShowModal(false);
      loadPacks();
    } catch (error: any) {
      console.error('Error guardando pack:', error);
      toast.error(error.response?.data?.message || 'Error al guardar el pack');
    }
  };

  const handleDelete = async (pack: any) => {
    if (!confirm(`¿Estás seguro de eliminar el pack "${pack.name}"?`)) {
      return;
    }
    
    try {
      await api.delete(`/products/${pack.id}`);
      toast.success('Pack eliminado');
      loadPacks();
    } catch (error: any) {
      console.error('Error eliminando pack:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar el pack');
    }
  };

  const addProduct = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: 1 }]
    });
  };

  const removeProduct = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const updateProduct = (index: number, field: 'productId' | 'quantity', value: any) => {
    const newItems = [...formData.items];
    if (field === 'quantity') {
      newItems[index].quantity = parseInt(value) || 1;
    } else {
      newItems[index].productId = value;
    }
    setFormData({ ...formData, items: newItems });
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Packs</h1>
        <button
          data-testid="create-pack"
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-resona text-white rounded-lg hover:bg-resona-dark"
        >
          <Plus className="w-5 h-5" />
          Crear Pack
        </button>
      </div>

      {packs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No hay packs creados</p>
          <button
            data-testid="create-first-pack"
            onClick={handleCreate}
            className="px-4 py-2 bg-resona text-white rounded-lg hover:bg-resona-dark"
          >
            Crear primer pack
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Descripción</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Precio/Día</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estado</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {packs.map((pack) => (
                <tr key={pack.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{pack.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{pack.description || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">€{Number(pack.pricePerDay || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      pack.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {pack.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button 
                      onClick={() => handleEdit(pack)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(pack)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Crear/Editar Pack */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editingPack ? 'Editar Pack' : 'Crear Pack'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Información Básica */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Información Básica</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Pack *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                        placeholder="Ej: Pack Sonido Completo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                        rows={3}
                        placeholder="Describe qué incluye este pack..."
                      />
                    </div>
                  </div>
                </div>

                {/* Productos del Pack */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Productos del Pack</h3>
                    <button
                      onClick={addProduct}
                      className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar Producto
                    </button>
                  </div>

                  {formData.items.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No hay productos agregados</p>
                      <button
                        onClick={addProduct}
                        className="mt-4 px-4 py-2 bg-resona text-white rounded hover:bg-resona-dark"
                      >
                        Agregar Primer Producto
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.items.map((item, index) => (
                        <div key={index} className="flex gap-3 items-end bg-gray-50 p-3 rounded">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Producto
                            </label>
                            <select
                              value={item.productId}
                              onChange={(e) => updateProduct(index, 'productId', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-resona"
                            >
                              <option value="">Seleccionar producto...</option>
                              {products.filter(p => !p.isPack).map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.name} - €{product.pricePerDay}/día
                                  {product.shippingCost > 0 && ` + €${product.shippingCost} envío`}
                                  {product.installationCost > 0 && ` + €${product.installationCost} instalación`}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="w-24">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Cantidad
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateProduct(index, 'quantity', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-resona"
                            />
                          </div>

                          <button
                            onClick={() => removeProduct(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sistema de Precios */}
                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calculator className="w-5 h-5 text-resona" />
                    <h3 className="text-lg font-semibold">Sistema de Precios</h3>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800 mb-2">
                      <strong>El precio se calcula automáticamente:</strong>
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1 ml-4">
                      <li>• Suma de precio/día de todos los productos</li>
                      <li>• + Suma de costes de envío</li>
                      <li>• + Suma de costes de instalación</li>
                      <li>• - Descuento aplicado (si hay)</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descuento del Pack (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.discountPercentage}
                        onChange={(e) => setFormData({ ...formData, discountPercentage: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Se aplicará sobre el total calculado
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio Final Personalizado (€)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.customFinalPrice}
                        onChange={(e) => setFormData({ ...formData, customFinalPrice: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                        placeholder="Dejar vacío para cálculo automático"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Opcional: establece un precio fijo manualmente
                      </p>
                    </div>
                  </div>

                  {formData.items.length > 0 && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800">
                        <strong>Vista previa:</strong> El cliente verá cuánto ahorra con el pack
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        Ejemplo: "¡Ahorras €50 (15%)!" se calculará automáticamente
                      </p>
                    </div>
                  )}
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2 bg-resona text-white rounded-lg hover:bg-resona-dark"
                  >
                    <Save className="w-5 h-5" />
                    {editingPack ? 'Actualizar Pack' : 'Crear Pack'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PacksManager;
