import { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, Search, X, Save, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { ProductImageManager } from '../../components/admin/ProductImageManager';

interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  pricePerDay: number;
  stock: number;
  realStock?: number;
  stockStatus?: string;
  leadTimeDays?: number;
  category?: {
    name: string;
  };
  images?: string[];
  shippingCost?: number;
  installationCost?: number;
  installationTimeMinutes?: number;
  requiresInstallation?: boolean;
  installationComplexity?: number;
}

const ProductsManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null); // ID del producto que se está eliminando
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showImageManager, setShowImageManager] = useState(false);
  const [imageProduct, setImageProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    categoryId: '',
    pricePerDay: 0,
    stock: 1,
    realStock: 1,
    stockStatus: 'IN_STOCK',
    leadTimeDays: 0,
    shippingCost: 0,
    installationCost: 0,
    installationTimeMinutes: 0,
    requiresInstallation: false,
    installationComplexity: 1,
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response: any = await api.get('/products');
      setProducts(response.data || []);
    } catch (error: any) {
      console.error('Error cargando productos:', error);
      toast.error('Error al cargar productos');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response: any = await api.get('/products/categories');
      setCategories(response.data || []);
    } catch (error: any) {
      console.error('Error cargando categorías:', error);
      toast.error('Error al cargar categorías');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.sku.trim()) {
      toast.error('Nombre y SKU son obligatorios');
      return;
    }

    if (!formData.categoryId) {
      toast.error('Debes seleccionar una categoría');
      return;
    }

    try {
      // Calcular precios automáticamente
      const productData = {
        ...formData,
        pricePerWeekend: formData.pricePerDay * 1.5, // 1.5x para fin de semana
        pricePerWeek: formData.pricePerDay * 5, // 5x para semana completa
      };
      
      await api.post('/products', productData);
      toast.success('Producto creado exitosamente');
      setShowCreateModal(false);
      resetForm();
      loadProducts();
    } catch (error: any) {
      console.error('Error creando producto:', error);
      toast.error(error.response?.data?.message || 'Error al crear producto');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) return;

    try {
      // Calcular precios automáticamente
      const productData = {
        ...formData,
        pricePerWeekend: formData.pricePerDay * 1.5,
        pricePerWeek: formData.pricePerDay * 5,
      };
      
      await api.put(`/products/${selectedProduct.id}`, productData);
      toast.success('Producto actualizado exitosamente');
      setShowEditModal(false);
      setSelectedProduct(null);
      resetForm();
      loadProducts();
    } catch (error: any) {
      console.error('Error actualizando producto:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar producto');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    // Prevenir eliminaciones múltiples simultáneas
    if (deleting) {
      toast.error('Ya hay una eliminación en progreso. Por favor, espera.');
      return;
    }
    
    if (!window.confirm(`¿Estás seguro de eliminar "${name}"?`)) return;

    setDeleting(id);
    try {
      const response: any = await api.delete(`/products/${id}`);
      toast.success(response.data?.message || 'Producto eliminado exitosamente');
      
      // Esperar un momento antes de recargar para asegurar que la DB se actualizó
      await new Promise(resolve => setTimeout(resolve, 300));
      await loadProducts();
    } catch (error: any) {
      console.error('Error eliminando producto:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Error al eliminar producto';
      toast.error(errorMsg);
    } finally {
      setDeleting(null);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || '',
      sku: product.sku || '',
      description: product.description || '',
      categoryId: (product as any).categoryId || '',
      pricePerDay: product.pricePerDay || 0,
      stock: product.stock || 1,
      realStock: product.realStock || 1,
      stockStatus: product.stockStatus || 'IN_STOCK',
      leadTimeDays: product.leadTimeDays || 0,
      shippingCost: product.shippingCost || 0,
      installationCost: product.installationCost || 0,
      installationTimeMinutes: product.installationTimeMinutes || 0,
      requiresInstallation: product.requiresInstallation || false,
      installationComplexity: product.installationComplexity || 1,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      description: '',
      categoryId: '',
      pricePerDay: 0,
      stock: 1,
      realStock: 1,
      stockStatus: 'IN_STOCK',
      leadTimeDays: 0,
      shippingCost: 0,
      installationCost: 0,
      installationTimeMinutes: 0,
      requiresInstallation: false,
      installationComplexity: 1,
    });
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-resona"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/admin" className="text-resona hover:text-resona-dark mb-4 inline-block">
            ← Volver al Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
            <div className="flex gap-2">
              <Link
                to="/admin/on-demand"
                className="border border-yellow-500 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-500 hover:text-white transition-colors flex items-center gap-2"
              >
                📦 Catálogo Virtual
              </Link>
              <Link
                to="/admin/categories"
                className="border border-resona text-resona px-4 py-2 rounded-lg hover:bg-resona hover:text-white transition-colors flex items-center gap-2"
              >
                Gestionar Categorías
              </Link>
              <button 
                onClick={openCreateModal}
                className="bg-resona text-white px-4 py-2 rounded-lg hover:bg-resona-dark transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nuevo Producto
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Productos</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
              <Package className="w-10 h-10 text-resona" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div>
              <p className="text-sm text-gray-600">Stock Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.reduce((acc, p) => acc + (p.stock || 0), 0)} unidades
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div>
              <p className="text-sm text-gray-600">Valor Promedio</p>
              <p className="text-2xl font-bold text-gray-900">
                €{products.length > 0 ? Math.round(products.reduce((acc, p) => acc + p.pricePerDay, 0) / products.length) : 0}/día
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div>
              <p className="text-sm text-gray-600">Categorías</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(products.map(p => p.category?.name).filter(Boolean)).size}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar productos por nombre o SKU..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio/día
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? 'No se encontraron productos' : 'No hay productos. Crea el primero.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      {product.category && (
                        <div className="text-xs text-gray-500">{product.category.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      €{product.pricePerDay}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stock} uds
                      {product.stockStatus === 'ON_DEMAND' && (
                        <span className="ml-2 text-xs text-yellow-600">(Bajo Demanda)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => {
                          setImageProduct(product);
                          setShowImageManager(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Editar Imágenes"
                      >
                        <ImageIcon className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => openEditModal(product)}
                        className="text-resona hover:text-resona-dark mr-3"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={deleting === product.id || !!deleting}
                        className={`${
                          deleting === product.id 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : deleting 
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-red-600 hover:text-red-900'
                        }`}
                        title={deleting === product.id ? 'Eliminando...' : deleting ? 'Espera a que termine la eliminación actual' : 'Eliminar'}
                      >
                        <Trash2 className={`w-5 h-5 ${deleting === product.id ? 'animate-pulse' : ''}`} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Nuevo Producto</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                    required
                  >
                    <option value="">Seleccionar categoría...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {categories.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      No hay categorías. <Link to="/admin/categories" className="text-resona">Crear una</Link>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio por Día (€)
                    </label>
                    <input
                      type="number"
                      value={formData.pricePerDay}
                      onChange={(e) => setFormData({...formData, pricePerDay: Number(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                      min="0"
                    />
                  </div>
                </div>

                {/* Sección de Envío e Instalación */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">🚚 Envío e Instalación</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Coste de Envío (€)
                      </label>
                      <input
                        type="number"
                        value={formData.shippingCost}
                        onChange={(e) => setFormData({...formData, shippingCost: Number(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                        min="0"
                        step="0.01"
                      />
                      <p className="text-xs text-gray-500 mt-1">Coste adicional por unidad</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Coste de Instalación (€)
                      </label>
                      <input
                        type="number"
                        value={formData.installationCost}
                        onChange={(e) => setFormData({...formData, installationCost: Number(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                        min="0"
                        step="0.01"
                      />
                      <p className="text-xs text-gray-500 mt-1">Coste por montaje/unidad</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tiempo de Instalación (min)
                      </label>
                      <input
                        type="number"
                        value={formData.installationTimeMinutes}
                        onChange={(e) => setFormData({...formData, installationTimeMinutes: Number(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Complejidad (1-4)
                      </label>
                      <select
                        value={formData.installationComplexity}
                        onChange={(e) => setFormData({...formData, installationComplexity: Number(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                      >
                        <option value={1}>1 - Simple</option>
                        <option value={2}>2 - Medio</option>
                        <option value={3}>3 - Complejo</option>
                        <option value={4}>4 - Avanzado</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.requiresInstallation}
                        onChange={(e) => setFormData({...formData, requiresInstallation: e.target.checked})}
                        className="w-4 h-4 text-resona rounded focus:ring-resona"
                      />
                      <span className="text-sm text-gray-700">Requiere instalación obligatoria</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-resona text-white rounded-lg hover:bg-resona-dark flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Crear Producto
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Editar Producto</h2>
                <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                    required
                  >
                    <option value="">Seleccionar categoría...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio por Día (€)
                    </label>
                    <input
                      type="number"
                      value={formData.pricePerDay}
                      onChange={(e) => setFormData({...formData, pricePerDay: Number(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                      min="0"
                    />
                  </div>
                </div>

                {/* Sección de Envío e Instalación */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">🚚 Envío e Instalación</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Coste de Envío (€)
                      </label>
                      <input
                        type="number"
                        value={formData.shippingCost}
                        onChange={(e) => setFormData({...formData, shippingCost: Number(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                        min="0"
                        step="0.01"
                      />
                      <p className="text-xs text-gray-500 mt-1">Coste adicional por unidad</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Coste de Instalación (€)
                      </label>
                      <input
                        type="number"
                        value={formData.installationCost}
                        onChange={(e) => setFormData({...formData, installationCost: Number(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                        min="0"
                        step="0.01"
                      />
                      <p className="text-xs text-gray-500 mt-1">Coste por montaje/unidad</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tiempo de Instalación (min)
                      </label>
                      <input
                        type="number"
                        value={formData.installationTimeMinutes}
                        onChange={(e) => setFormData({...formData, installationTimeMinutes: Number(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Complejidad (1-4)
                      </label>
                      <select
                        value={formData.installationComplexity}
                        onChange={(e) => setFormData({...formData, installationComplexity: Number(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                      >
                        <option value={1}>1 - Simple</option>
                        <option value={2}>2 - Medio</option>
                        <option value={3}>3 - Complejo</option>
                        <option value={4}>4 - Avanzado</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.requiresInstallation}
                        onChange={(e) => setFormData({...formData, requiresInstallation: e.target.checked})}
                        className="w-4 h-4 text-resona rounded focus:ring-resona"
                      />
                      <span className="text-sm text-gray-700">Requiere instalación obligatoria</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-resona text-white rounded-lg hover:bg-resona-dark flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Image Manager Modal */}
      {imageProduct && (
        <ProductImageManager
          product={imageProduct}
          isOpen={showImageManager}
          onClose={() => {
            setShowImageManager(false);
            setImageProduct(null);
          }}
          onSuccess={() => {
            loadProducts();
          }}
        />
      )}
    </div>
  );
};

export default ProductsManager;
