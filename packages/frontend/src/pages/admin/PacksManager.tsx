import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, DollarSign, Package, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  pricePerDay: number;
  sku?: string;
}

interface PackItem {
  productId: string;
  quantity: number;
  product?: Product;
}

interface Pack {
  id: string;
  name: string;
  description: string;
  slug: string;
  basePrice: number;
  priceExtra: number;
  discount: number;
  pricePerDay: number;
  autoCalculate: boolean;
  isActive: boolean;
  featured: boolean;
  imageUrl?: string;
  items: PackItem[];
}

export default function PacksManager() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPack, setEditingPack] = useState<Pack | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priceExtra: 0,
    discount: 0,
    autoCalculate: true,
    featured: false,
    isActive: true,
    items: [] as PackItem[]
  });

  useEffect(() => {
    loadPacks();
    loadProducts();
  }, []);

  const loadPacks = async () => {
    try {
      const response = await api.get('/packs');
      setPacks(response.data.packs || response.data);
    } catch (error) {
      toast.error('Error al cargar packs');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.data || response.data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const calculateBasePrice = (items: PackItem[]) => {
    return items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return sum;
      return sum + (Number(product.pricePerDay) * item.quantity);
    }, 0);
  };

  const calculateFinalPrice = () => {
    const basePrice = calculateBasePrice(formData.items);
    const priceBeforeDiscount = basePrice + Number(formData.priceExtra);
    const discountAmount = priceBeforeDiscount * (Number(formData.discount) / 100);
    return priceBeforeDiscount - discountAmount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      toast.error('Añade al menos un producto al pack');
      return;
    }

    try {
      const packData = {
        ...formData,
        priceExtra: Number(formData.priceExtra),
        discount: Number(formData.discount)
      };

      if (editingPack) {
        await api.put(`/packs/${editingPack.id}`, packData);
        toast.success('Pack actualizado');
      } else {
        await api.post('/packs', packData);
        toast.success('Pack creado');
      }

      setShowModal(false);
      resetForm();
      loadPacks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar pack');
    }
  };

  const handleEdit = (pack: Pack) => {
    setEditingPack(pack);
    setFormData({
      name: pack.name,
      description: pack.description,
      priceExtra: Number(pack.priceExtra),
      discount: Number(pack.discount),
      autoCalculate: pack.autoCalculate,
      featured: pack.featured,
      isActive: pack.isActive,
      items: pack.items.map(item => ({
        productId: item.productId || item.product!.id,
        quantity: item.quantity
      }))
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este pack?')) return;

    try {
      await api.delete(`/packs/${id}`);
      toast.success('Pack eliminado');
      loadPacks();
    } catch (error) {
      toast.error('Error al eliminar pack');
    }
  };

  const resetForm = () => {
    setEditingPack(null);
    setFormData({
      name: '',
      description: '',
      priceExtra: 0,
      discount: 0,
      autoCalculate: true,
      featured: false,
      isActive: true,
      items: []
    });
  };

  const addProduct = () => {
    if (products.length === 0) return;
    setFormData({
      ...formData,
      items: [...formData.items, { productId: products[0].id, quantity: 1 }]
    });
  };

  const updateItem = (index: number, field: keyof PackItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const basePrice = calculateBasePrice(formData.items);
  const finalPrice = calculateFinalPrice();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Packs</h1>
          <p className="text-gray-600">Administra packs de productos</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Nuevo Pack
        </button>
      </div>

      {/* Lista de packs */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packs.map((pack) => (
          <div key={pack.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{pack.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{pack.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(pack)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(pack.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Productos:</span>
                <span className="font-semibold">{pack.items.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Base:</span>
                <span className="font-semibold">€{Number(pack.basePrice).toFixed(2)}</span>
              </div>
              {Number(pack.priceExtra) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Extra:</span>
                  <span className="font-semibold text-green-600">+€{Number(pack.priceExtra).toFixed(2)}</span>
                </div>
              )}
              {Number(pack.discount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Descuento:</span>
                  <span className="font-semibold text-red-600">-{Number(pack.discount)}%</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  €{Number(pack.pricePerDay).toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">por día</div>
              </div>
              <div className="flex gap-2">
                {pack.autoCalculate && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    Auto
                  </span>
                )}
                {pack.featured && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                    Destacado
                  </span>
                )}
                {!pack.isActive && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                    Inactivo
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de formulario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {editingPack ? 'Editar Pack' : 'Nuevo Pack'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Información básica */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg">Información Básica</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Pack *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    required
                  />
                </div>
              </div>

              {/* Productos */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">Productos del Pack *</h3>
                  <button
                    type="button"
                    onClick={addProduct}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    + Añadir Producto
                  </button>
                </div>

                {formData.items.length === 0 && (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Añade productos al pack</p>
                  </div>
                )}

                {formData.items.map((item, index) => {
                  const product = products.find(p => p.id === item.productId);
                  const itemPrice = product ? Number(product.pricePerDay) * item.quantity : 0;

                  return (
                    <div key={index} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg">
                      <select
                        value={item.productId}
                        onChange={(e) => updateItem(index, 'productId', e.target.value)}
                        className="flex-1 px-3 py-2 border rounded"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} (€{Number(p.pricePerDay).toFixed(2)}/día)
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                        className="w-20 px-3 py-2 border rounded"
                      />

                      <div className="w-24 text-right font-semibold">
                        €{itemPrice.toFixed(2)}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Precios */}
              <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Cálculo de Precios
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio Base (automático)
                    </label>
                    <input
                      type="text"
                      value={`€${basePrice.toFixed(2)}`}
                      className="w-full px-3 py-2 bg-gray-100 border rounded-lg"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Suma de todos los productos
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio Extra
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.priceExtra}
                      onChange={(e) => setFormData({ ...formData, priceExtra: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ej: gastos de montaje, transporte
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descuento (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Descuento sobre el precio total
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio Final (automático)
                    </label>
                    <input
                      type="text"
                      value={`€${finalPrice.toFixed(2)}`}
                      className="w-full px-3 py-2 bg-gray-100 border rounded-lg font-bold text-blue-600"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      (Base + Extra) - Descuento
                    </p>
                  </div>
                </div>

                {/* Fórmula */}
                <div className="bg-white p-3 rounded border border-blue-200">
                  <div className="text-sm text-gray-600 mb-1">Cálculo:</div>
                  <div className="font-mono text-xs">
                    ({basePrice.toFixed(2)} + {Number(formData.priceExtra).toFixed(2)}) × (1 - {Number(formData.discount)}÷100) = {finalPrice.toFixed(2)}
                  </div>
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.autoCalculate}
                    onChange={(e) => setFormData({ ...formData, autoCalculate: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Calcular precio automáticamente</span>
                </label>
              </div>

              {/* Opciones */}
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Pack destacado</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Pack activo</span>
                </label>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingPack ? 'Actualizar' : 'Crear'} Pack
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
