import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Package, X, Save, Calculator, Eye, EyeOff, Search } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    customFinalPrice: '',
    includeShipping: true,
    includeInstallation: true,
    items: [] as Array<{ 
      productId: string; 
      quantity: number;
      numberOfPeople?: number;
      hoursPerPerson?: number;
    }>
  });
  
  const [productFilter, setProductFilter] = useState({
    categoryId: '',
    search: ''
  });

  useEffect(() => {
    loadPacks();
    loadCategories();
    loadProducts();
  }, []);

  const loadPacks = async () => {
    try {
      setLoading(true);
      const response: any = await api.get('/packs?includeInactive=true');
      const packsData = response?.packs || response || [];
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
      const response: any = await api.get('/products/categories');
      let cats = [];
      if (Array.isArray(response)) {
        cats = response;
      } else if (response?.categories && Array.isArray(response.categories)) {
        cats = response.categories;
      } else if (response?.data && Array.isArray(response.data)) {
        cats = response.data;
      }
      setCategories(cats);
      const packsCategory = cats.find((cat: any) => 
        cat.name && cat.name.toLowerCase().includes('pack')
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
      const response: any = await api.get('/products?limit=1000');
      let prods = [];
      if (Array.isArray(response)) {
        prods = response;
      } else if (response?.products && Array.isArray(response.products)) {
        prods = response.products;
      } else if (response?.data && Array.isArray(response.data)) {
        prods = response.data;
      }
      setProducts(prods);
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  // Filtrar packs por búsqueda y categoría
  const filteredPacks = packs.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getAvailableProducts = () => {
    let filtered = products.filter(p => !p.isPack);
    
    if (productFilter.categoryId) {
      filtered = filtered.filter(p => p.categoryId === productFilter.categoryId);
    }
    
    if (productFilter.search.trim()) {
      const search = productFilter.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(search) ||
        p.sku?.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  };

  const handleCreate = () => {
    setEditingPack(null);
    setFormData({
      name: '',
      description: '',
      categoryId: '',
      customFinalPrice: '',
      includeShipping: true,
      includeInstallation: true,
      items: [],
    });
    setProductFilter({ categoryId: '', search: '' });
    setShowModal(true);
  };

  const handleEdit = (pack: any) => {
    setEditingPack(pack);
    setFormData({
      name: pack.name || '',
      description: pack.description || '',
      categoryId: pack.categoryId || '',
      customFinalPrice: pack.customPriceEnabled ? String(pack.finalPrice || '') : '',
      includeShipping: pack.includeShipping !== false,
      includeInstallation: pack.includeInstallation !== false,
      items: pack.items?.map((item: any) => ({
        productId: item.productId || item.product?.id,
        quantity: item.quantity,
        ...(item.numberOfPeople !== undefined && { numberOfPeople: item.numberOfPeople }),
        ...(item.hoursPerPerson !== undefined && { hoursPerPerson: item.hoursPerPerson })
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

      const packData: any = {
        name: formData.name,
        description: formData.description,
        category: 'OTROS',
        customFinalPrice: formData.customFinalPrice ? parseFloat(formData.customFinalPrice) : undefined,
        includeShipping: formData.includeShipping,
        includeInstallation: formData.includeInstallation,
        items: formData.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          ...(item.numberOfPeople !== undefined && { numberOfPeople: item.numberOfPeople }),
          ...(item.hoursPerPerson !== undefined && { hoursPerPerson: item.hoursPerPerson })
        })),
        autoCalculate: true
      };

      if (editingPack) {
        await api.put(`/packs/${editingPack.id}`, packData);
        toast.success('Pack actualizado correctamente');
      } else {
        await api.post('/packs', packData);
        toast.success('Pack creado correctamente');
      }

      setShowModal(false);
      await loadPacks();
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
      await api.delete(`/packs/${pack.id}`);
      toast.success('Pack eliminado');
      loadPacks();
    } catch (error: any) {
      console.error('Error eliminando pack:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar el pack');
    }
  };

  const toggleActive = async (pack: any) => {
    try {
      const newStatus = !pack.isActive;
      await api.put(`/packs/${pack.id}`, { isActive: newStatus });
      toast.success(newStatus ? 'Pack activado' : 'Pack ocultado');
      loadPacks();
    } catch (error: any) {
      console.error('Error cambiando estado del pack:', error);
      toast.error(error.response?.data?.message || 'Error al cambiar estado del pack');
    }
  };

  const isPersonalProduct = (product: any) => {
    return product?.category?.name?.toLowerCase() === 'personal';
  };

  const addProductToList = (productId: string) => {
    const existing = formData.items.find(item => item.productId === productId);
    if (existing) {
      toast.error('Este producto ya está en el pack');
      return;
    }
    
    const product = products.find(p => p.id === productId);
    const isPerson = product && isPersonalProduct(product);
    
    setFormData({
      ...formData,
      items: [...formData.items, { 
        productId, 
        quantity: 1,
        ...(isPerson && { numberOfPeople: 1, hoursPerPerson: 1 })
      }]
    });
    toast.success('Producto añadido al pack');
  };

  const removeProduct = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const updateQuantity = (index: number, quantity: number) => {
    const newItems = [...formData.items];
    newItems[index].quantity = quantity;
    setFormData({ ...formData, items: newItems });
  };

  const updatePersonalDetails = (index: number, numberOfPeople: number, hoursPerPerson: number) => {
    const newItems = [...formData.items];
    newItems[index].numberOfPeople = numberOfPeople;
    newItems[index].hoursPerPerson = hoursPerPerson;
    setFormData({ ...formData, items: newItems });
  };

  const calculatePackCostsAndProfit = (pack: any) => {
    let costPersonal = 0;
    let costDepreciation = 0;
    let costShippingInstallation = 0;
    let finalPrice = Number(pack.finalPrice || pack.calculatedTotalPrice || 0);

    if (pack.items) {
      pack.items.forEach((item: any) => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const isPersonal = product.category?.name?.toLowerCase() === 'personal';
          const isConsumable = (product as any).isConsumable;
          const effectiveQuantity = (item.numberOfPeople && item.hoursPerPerson)
            ? item.numberOfPeople * item.hoursPerPerson
            : item.quantity;

          if (isPersonal) {
            costPersonal += Number(product.purchasePrice || 0) * effectiveQuantity;
          } else if (isConsumable) {
            costDepreciation += Number(product.purchasePrice || 0) * effectiveQuantity;
          } else {
            costDepreciation += Number(product.purchasePrice || 0) * effectiveQuantity * 0.05;
          }

          if (pack.includeShipping !== false) {
            costShippingInstallation += Number(product.shippingCost || 0) * effectiveQuantity;
          }
          if (pack.includeInstallation !== false) {
            costShippingInstallation += Number(product.installationCost || 0) * effectiveQuantity;
          }
        }
      });
    }

    costShippingInstallation = costShippingInstallation / 2;
    const totalCost = costPersonal + costDepreciation + costShippingInstallation;
    const profit = finalPrice - totalCost;

    return { totalCost, profit };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
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
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Gestión de Packs</h1>
            <button
              data-testid="create-pack"
              onClick={handleCreate}
              className="bg-resona text-white px-4 py-2 rounded-lg hover:bg-resona-dark transition-colors flex items-center gap-2 w-fit"
            >
              <Plus className="w-5 h-5" />
              Crear Pack
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Packs</p>
                <p className="text-2xl font-bold text-gray-900">{packs.length}</p>
                <p className="text-xs text-gray-500 mt-1">Todos los packs</p>
              </div>
              <Package className="w-8 h-8 text-resona" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div>
              <p className="text-sm text-gray-600">Packs Activos</p>
              <p className="text-2xl font-bold text-green-600">
                {packs.filter(p => p.isActive !== false).length}
              </p>
              <p className="text-xs text-gray-500 mt-1">Visibles en catálogo</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div>
              <p className="text-sm text-gray-600">Categorías</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(packs.map(p => p.category).filter(Boolean)).size}
              </p>
              <p className="text-xs text-gray-500 mt-1">Tipos de packs</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div>
              <p className="text-sm text-gray-600">Ingresos Potenciales</p>
              <p className="text-2xl font-bold text-blue-600">
                €{packs.reduce((acc, p) => acc + (Number(p.finalPrice) || 0), 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Suma de precios finales</p>
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
                placeholder="Buscar packs por nombre o descripción..."
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
                {['BODAS', 'EVENTOS_PRIVADOS', 'CONCIERTOS', 'EVENTOS_CORPORATIVOS', 'CONFERENCIAS', 'MONTAJE', 'OTROS'].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, ' ')}
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
              Mostrando {filteredPacks.length} de {packs.length} packs
              {searchTerm && ` • Búsqueda: "${searchTerm}"`}
              {selectedCategory && ` • Categoría: ${selectedCategory.replace(/_/g, ' ')}`}
            </p>
          </div>
        </div>

        {/* Packs Table */}
        {filteredPacks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory ? 'No hay packs con los filtros aplicados' : 'No hay packs creados'}
            </p>
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
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Categoría</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Descripción</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Precio/Día</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Gastos Esperados</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Beneficio Esperado</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estado</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPacks.map((pack) => {
                  const { totalCost, profit } = calculatePackCostsAndProfit(pack);
                  const profitColor = profit >= 0 ? 'text-green-600' : 'text-red-600';
                  const isActive = pack.isActive !== false;
                  
                  return (
                    <tr key={pack.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{pack.name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {pack.category || 'OTROS'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{pack.description || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-semibold">€{Number(pack.finalPrice || pack.calculatedTotalPrice || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">€{totalCost.toFixed(2)}</td>
                      <td className={`px-6 py-4 text-sm font-semibold ${profitColor}`}>€{profit.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {isActive ? (
                            <>
                              <Eye className="w-3 h-3" />
                              Visible
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              Oculto
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button 
                          onClick={() => toggleActive(pack)}
                          className={`${isActive ? 'text-gray-600 hover:text-gray-800' : 'text-green-600 hover:text-green-800'}`}
                          title={isActive ? 'Ocultar pack' : 'Mostrar pack'}
                        >
                          {isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
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
                  );
                })}
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
    </div>
  );
};

export default PacksManager;
