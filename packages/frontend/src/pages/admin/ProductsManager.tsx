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
  const [selectedCategory, setSelectedCategory] = useState('');
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
    isPack: false,
  });

  const [packComponents, setPackComponents] = useState<Array<{componentId: string, quantity: number}>>([]);
  const [showAddComponent, setShowAddComponent] = useState(false);
  const [newComponent, setNewComponent] = useState({componentId: '', quantity: 1});

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Solicitar TODOS los productos sin límite de paginación
      const response: any = await api.get('/products?limit=1000');
      console.log(`📦 Productos cargados: ${response.data?.length || 0}`);
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
      
      console.log('📤 Enviando actualización de producto:', {
        id: selectedProduct.id,
        name: productData.name,
        stock: productData.stock,
        realStock: productData.realStock,
      });
      
      const response = await api.put(`/products/${selectedProduct.id}`, productData);
      console.log('✅ Producto actualizado:', response);
      
      // Si es un pack, guardar los componentes
      if (formData.isPack && packComponents.length > 0) {
        await api.post(`/products/${selectedProduct.id}/components`, {
          components: packComponents
        });
      }
      
      toast.success('Producto actualizado exitosamente');
      setShowEditModal(false);
      setSelectedProduct(null);
      resetForm();
      loadProducts();
    } catch (error: any) {
      console.error('❌ Error actualizando producto:', error);
      console.error('❌ Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Error al actualizar producto');
    }
  };

  const loadPackComponents = async (productId: string) => {
    try {
      const response: any = await api.get(`/products/${productId}/pack-details`);
      if (response.pack?.components) {
        const comps = response.pack.components.map((c: any) => ({
          componentId: c.component.id,
          quantity: c.quantity,
          componentName: c.component.name,
        }));
        setPackComponents(comps);
      }
    } catch (error) {
      console.error('Error loading pack components:', error);
    }
  };

  const addComponentToPack = () => {
    if (!newComponent.componentId || newComponent.quantity < 1) {
      toast.error('Selecciona un producto y cantidad válida');
      return;
    }

    const product = products.find(p => p.id === newComponent.componentId);
    if (!product) return;

    setPackComponents([...packComponents, {
      componentId: newComponent.componentId,
      quantity: newComponent.quantity,
      componentName: product.name,
    } as any]);

    setNewComponent({componentId: '', quantity: 1});
    setShowAddComponent(false);
  };

  const removeComponent = (componentId: string) => {
    setPackComponents(packComponents.filter(c => c.componentId !== componentId));
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

  const openEditModal = async (product: Product) => {
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
      isPack: (product as any).isPack || false,
    });
    
    // Si es un pack, cargar sus componentes
    if ((product as any).isPack) {
      await loadPackComponents(product.id);
    } else {
      setPackComponents([]);
    }
    
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
      isPack: false,
    });
    setPackComponents([]);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || p.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-resona"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4">
        {/* Header */}
        <div className="mb-6">
          <Link to="/admin" className="text-resona hover:text-resona-dark mb-4 inline-block text-sm">
            ← Volver al Dashboard
          </Link>
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Gestión de Productos</h1>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/admin/on-demand"
                className="border border-yellow-500 text-yellow-700 px-3 py-1.5 text-sm rounded-lg hover:bg-yellow-500 hover:text-white transition-colors flex items-center gap-1"
              >
                📦 Catálogo
              </Link>
              <Link
                to="/admin/categories"
                className="border border-resona text-resona px-3 py-1.5 text-sm rounded-lg hover:bg-resona hover:text-white transition-colors flex items-center gap-1"
              >
                Categorías
              </Link>
              <button 
                data-testid="new-product"
                onClick={openCreateModal}
                className="bg-resona text-white px-3 py-1.5 text-sm rounded-lg hover:bg-resona-dark transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Nuevo
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-3 mb-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Productos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => !(p as any).isPack).length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  (excl. {products.filter(p => (p as any).isPack).length} packs)
                </p>
              </div>
              <Package className="w-8 h-8 text-resona" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div>
              <p className="text-sm text-gray-600">Stock Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {products
                  .filter(p => !(p as any).isPack && (p.realStock || p.stock || 0) > 0)
                  .reduce((acc, p) => acc + (p.realStock || p.stock || 0), 0)} uds
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Solo con stock disponible
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div>
              <p className="text-sm text-gray-600">Categorías</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(products.map(p => p.category?.name).filter(Boolean)).size}
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-3 rounded-lg shadow mb-4">
          <div className="flex gap-3 mb-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar productos por nombre o SKU..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent text-sm"
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            {(searchTerm || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Limpiar filtros"
              >
                ✕ Limpiar
              </button>
            )}
          </div>
          <div className="flex justify-between items-center text-sm">
            <p className="text-gray-600">
              Mostrando {filteredProducts.length} de {products.length} productos
              {searchTerm && ` • Búsqueda: "${searchTerm}"`}
              {selectedCategory && ` • Categoría: ${selectedCategory}`}
            </p>
            {products.length > 0 && (
              <p className="text-gray-500 text-xs">
                ✓ {products.length} productos cargados
              </p>
            )}
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-auto" style={{ maxHeight: 'calc(100vh - 450px)', minHeight: '300px' }}>
          <table className="w-full table-auto">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  €/día
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || selectedCategory 
                      ? 'No se encontraron productos con los filtros aplicados' 
                      : 'No hay productos. Crea el primero.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                        {(product as any).isPack && (
                          <span className="ml-2 px-2 py-0.5 bg-resona/10 text-resona text-xs font-semibold rounded">
                            PACK
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {product.category ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {product.category.name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Sin categoría</span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                      {product.sku}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      €{product.pricePerDay}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {product.stock}
                      {product.stockStatus === 'ON_DEMAND' && (
                        <span className="ml-1 text-xs text-yellow-600">BD</span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => {
                          setImageProduct(product);
                          setShowImageManager(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                        title="Imágenes"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openEditModal(product)}
                        className="text-resona hover:text-resona-dark mr-2"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
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
                        title={deleting === product.id ? 'Eliminando...' : deleting ? 'Espera' : 'Eliminar'}
                      >
                        <Trash2 className={`w-4 h-4 ${deleting === product.id ? 'animate-pulse' : ''}`} />
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
                      Stock Real
                      <span className="text-xs text-gray-500 ml-2">(usado en alertas)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.realStock}
                      onChange={(e) => {
                        const newValue = Number(e.target.value);
                        console.log('🔄 Input Stock Real onChange:', {
                          oldValue: formData.realStock,
                          newValue: newValue,
                          inputValue: e.target.value,
                          isNaN: isNaN(newValue),
                        });
                        setFormData({...formData, realStock: newValue, stock: newValue});
                      }}
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
                    data-testid="submit"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8">
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
                      Stock Real
                      <span className="text-xs text-gray-500 ml-2">(usado en alertas)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.realStock}
                      onChange={(e) => {
                        const newValue = Number(e.target.value);
                        console.log('🔄 Input Stock Real onChange:', {
                          oldValue: formData.realStock,
                          newValue: newValue,
                          inputValue: e.target.value,
                          isNaN: isNaN(newValue),
                        });
                        setFormData({...formData, realStock: newValue, stock: newValue});
                      }}
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

                  <div className="mt-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isPack}
                        onChange={(e) => setFormData({...formData, isPack: e.target.checked})}
                        className="w-4 h-4 text-resona rounded focus:ring-resona"
                      />
                      <span className="text-sm text-gray-700 font-medium">🎁 Este producto es un Pack</span>
                    </label>
                  </div>

                  {/* Gestión de componentes del pack */}
                  {formData.isPack && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-3">Componentes del Pack</h4>
                      
                      {packComponents.length > 0 ? (
                        <div className="space-y-2 mb-3">
                          {packComponents.map((comp: any, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border">
                              <span className="text-sm">
                                <strong>{comp.quantity}x</strong> {comp.componentName || products.find(p => p.id === comp.componentId)?.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeComponent(comp.componentId)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 mb-3">No hay componentes añadidos</p>
                      )}

                      {showAddComponent ? (
                        <div className="bg-white p-3 rounded border space-y-2">
                          <select
                            value={newComponent.componentId}
                            onChange={(e) => setNewComponent({...newComponent, componentId: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="">Seleccionar producto...</option>
                            {products.filter(p => p.id !== selectedProduct?.id).map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min="1"
                            value={newComponent.quantity}
                            onChange={(e) => setNewComponent({...newComponent, quantity: parseInt(e.target.value) || 1})}
                            placeholder="Cantidad"
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={addComponentToPack}
                              className="flex-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Añadir
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowAddComponent(false)}
                              className="flex-1 px-3 py-1 border rounded hover:bg-gray-50"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowAddComponent(true)}
                          className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Añadir Componente
                        </button>
                      )}
                    </div>
                  )}
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
