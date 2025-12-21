import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Package, X, Save, Calculator, Eye, EyeOff, Search, Copy } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { useTableSort } from '../../hooks/useTableSort';
import { SortableTableHeader } from '../../components/admin/SortableTableHeader';
import { ResponsiveTableWrapper } from '../../components/admin/ResponsiveTableWrapper';

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
      
      // Filtrar para excluir montajes (solo mostrar packs reales)
      const filteredPacks = Array.isArray(packsData) 
        ? packsData.filter((pack: any) => {
            const categoryName = pack.categoryRef?.name?.toLowerCase() || pack.category?.toLowerCase() || '';
            return categoryName !== 'montaje';
          }).map((pack: any) => ({
            ...pack,
            // Normalizar finalPrice a número para que el ordenamiento funcione
            finalPrice: Number(pack.finalPrice || pack.calculatedTotalPrice || 0)
          }))
        : [];
      
      setPacks(filteredPacks);
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
    const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Ordenamiento de tabla
  const { sortedItems, requestSort, getSortIcon } = useTableSort(filteredPacks, {
    field: 'name',
    direction: 'asc'
  });

  const getAvailableProducts = () => {
    // Excluir packs y montajes
    const montajeCategory = categories.find((c: any) => c.name?.toLowerCase() === 'montaje');
    let filtered = products.filter(p => 
      !p.isPack && 
      p.categoryId !== montajeCategory?.id
    );
    
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

  const handleDuplicate = async (pack: any) => {
    try {
      // Generar nombre para el duplicado
      let duplicateName = `${pack.name} (copia)`;
      let counter = 1;
      
      // Verificar si ya existe un pack con ese nombre
      while (packs.some(p => p.name === duplicateName)) {
        counter++;
        duplicateName = `${pack.name} (copia ${counter})`;
      }

      // Preparar datos del pack duplicado
      const packData = {
        name: duplicateName,
        description: pack.description || '',
        categoryId: pack.categoryId || packsCategoryId,
        category: pack.category || 'OTROS',
        customFinalPrice: pack.customPriceEnabled ? Number(pack.finalPrice) : undefined,
        items: pack.items?.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          numberOfPeople: item.numberOfPeople,
          hoursPerPerson: item.hoursPerPerson,
        })) || [],
        featured: false, // El duplicado no es destacado por defecto
        imageUrl: pack.imageUrl || undefined,
      };

      // Crear el pack duplicado
      await api.post('/packs', packData);
      toast.success(`Pack "${duplicateName}" creado exitosamente`);
      loadPacks();
    } catch (error: any) {
      console.error('Error duplicando pack:', error);
      toast.error(error.response?.data?.message || 'Error al duplicar el pack');
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('El nombre es obligatorio');
        return;
      }

      if (!formData.categoryId) {
        toast.error('Debes seleccionar una categoría');
        return;
      }

      if (formData.items.length === 0) {
        toast.error('Debes agregar al menos un producto al pack');
        return;
      }

      // Obtener el nombre de la categoría seleccionada para el enum
      const selectedCategory = categories.find((c: any) => c.id === formData.categoryId);
      
      // Mapear nombres de categorías a valores válidos del enum PackCategory
      const categoryNameMap: Record<string, string> = {
        'sonido': 'OTROS',
        'iluminacion': 'OTROS',
        'iluminación': 'OTROS',
        'fotografía/video': 'OTROS',
        'fotografia/video': 'OTROS',
        'estructuras': 'OTROS',
        'mobiliario': 'OTROS',
        'bodas': 'BODAS',
        'eventos privados': 'EVENTOS_PRIVADOS',
        'conciertos': 'CONCIERTOS',
        'eventos corporativos': 'EVENTOS_CORPORATIVOS',
        'conferencias': 'CONFERENCIAS',
        'montaje': 'MONTAJE',
        'extras': 'EXTRAS',
      };
      
      const categoryName = selectedCategory?.name?.toLowerCase() || '';
      const categoryEnum = categoryNameMap[categoryName] || 'OTROS';
      
      console.log('📦 Guardando pack con categoría:', {
        categoryId: formData.categoryId,
        categoryName: selectedCategory?.name,
        categoryEnum: categoryEnum
      });
      
      const packData: any = {
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId,
        category: categoryEnum, // Agregar el enum de categoría
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
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
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
              Mostrando {filteredPacks.length} de {packs.length} packs
              {searchTerm && ` • Búsqueda: "${searchTerm}"`}
              {selectedCategory && ` • Categoría: ${categories.find((c: any) => c.id === selectedCategory)?.name || selectedCategory}`}
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
          <ResponsiveTableWrapper>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <SortableTableHeader
                    label="Nombre"
                    field="name"
                    sortIcon={getSortIcon('name')}
                    onSort={requestSort}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                  />
                  <SortableTableHeader
                    label="Categoría"
                    field="category"
                    sortIcon={getSortIcon('category')}
                    onSort={requestSort}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                  />
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Descripción</th>
                  <SortableTableHeader
                    label="Precio/Día"
                    field="finalPrice"
                    sortIcon={getSortIcon('finalPrice')}
                    onSort={requestSort}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                  />
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Gastos Esperados</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Beneficio Esperado</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estado</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedItems.map((pack) => {
                  const { totalCost, profit } = calculatePackCostsAndProfit(pack);
                  const profitColor = profit >= 0 ? 'text-green-600' : 'text-red-600';
                  const isActive = pack.isActive !== false;
                  
                  return (
                    <tr key={pack.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{pack.name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {pack.categoryRef?.name || categories.find(c => c.id === pack.categoryId)?.name || 'OTROS'}
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
                          onClick={() => handleDuplicate(pack)}
                          className="text-purple-600 hover:text-purple-800"
                          title="Duplicar pack"
                        >
                          <Copy className="w-4 h-4" />
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
          </ResponsiveTableWrapper>
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Categoría *
                        </label>
                        <select
                          value={formData.categoryId}
                          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                        >
                          <option value="">Selecciona una categoría</option>
                          {categories.map((cat: any) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Productos del Pack */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Productos del Pack</h3>
                    
                    {/* Agregar Productos */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Buscar productos
                          </label>
                          <input
                            type="text"
                            placeholder="Buscar por nombre o SKU..."
                            value={productFilter.search}
                            onChange={(e) => setProductFilter({ ...productFilter, search: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filtrar por categoría
                          </label>
                          <select
                            value={productFilter.categoryId}
                            onChange={(e) => setProductFilter({ ...productFilter, categoryId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona text-sm"
                          >
                            <option value="">Todas las categorías</option>
                            {categories
                              .filter((cat: any) => cat.name?.toLowerCase() !== 'montaje')
                              .map((cat: any) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Lista de productos disponibles */}
                      <div className="mt-4 max-h-48 overflow-y-auto border border-gray-300 rounded-lg">
                        {getAvailableProducts().map((product: any) => (
                          <div key={product.id} className="p-3 border-b border-gray-200 hover:bg-gray-100 flex justify-between items-center">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{product.name}</p>
                              <p className="text-xs text-gray-600">{product.sku} • €{Number(product.pricePerDay).toFixed(2)}/día</p>
                            </div>
                            <button
                              onClick={() => {
                                const newItem = {
                                  productId: product.id,
                                  quantity: 1,
                                  ...(product.isPack === false && product.categoryId === categories.find((c: any) => c.name?.toLowerCase() === 'personal')?.id && {
                                    numberOfPeople: 1,
                                    hoursPerPerson: 1
                                  })
                                };
                                setFormData({
                                  ...formData,
                                  items: [...formData.items, newItem]
                                });
                              }}
                              className="px-3 py-1 bg-resona text-white rounded text-sm hover:bg-resona-dark"
                            >
                              Añadir
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Productos agregados */}
                    {formData.items.length > 0 && (
                      <div className="space-y-3 mb-6">
                        <h4 className="font-medium text-gray-900">Productos en el pack ({formData.items.length})</h4>
                        {formData.items.map((item: any, idx: number) => {
                          const product = products.find(p => p.id === item.productId);
                          const isPersonal = product?.categoryId === categories.find((c: any) => c.name?.toLowerCase() === 'personal')?.id;
                          const isConsumable = (product as any)?.isConsumable;
                          const quantity = isPersonal ? (item.numberOfPeople || 1) * (item.hoursPerPerson || 1) : item.quantity;
                          
                          // Calcular coste de amortización: Personal y consumibles 100%, productos normales 5%
                          let cost = 0;
                          if (isPersonal || isConsumable) {
                            cost = Number(product?.purchasePrice || 0) * quantity;
                          } else {
                            cost = Number(product?.purchasePrice || 0) * quantity * 0.05;
                          }
                          
                          const price = Number(product?.pricePerDay || 0) * quantity;

                          return (
                            <div key={idx} className={`p-3 rounded-lg border-2 ${isPersonal ? 'border-purple-300 bg-purple-50' : 'border-green-300 bg-green-50'}`}>
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-medium text-sm">{product?.name}</p>
                                  <p className="text-xs text-gray-600">{product?.sku}</p>
                                </div>
                                <button
                                  onClick={() => setFormData({
                                    ...formData,
                                    items: formData.items.filter((_: any, i: number) => i !== idx)
                                  })}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {isPersonal ? (
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <label className="text-xs text-gray-600">Personas</label>
                                    <input
                                      type="number"
                                      min="1"
                                      value={item.numberOfPeople || 1}
                                      onChange={(e) => {
                                        const newItems = [...formData.items];
                                        newItems[idx].numberOfPeople = parseInt(e.target.value) || 1;
                                        setFormData({ ...formData, items: newItems });
                                      }}
                                      className="w-full px-2 py-1 border border-gray-300 rounded"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-gray-600">Horas c/u</label>
                                    <input
                                      type="number"
                                      min="0.5"
                                      step="0.5"
                                      value={item.hoursPerPerson || 1}
                                      onChange={(e) => {
                                        const newItems = [...formData.items];
                                        newItems[idx].hoursPerPerson = parseFloat(e.target.value) || 1;
                                        setFormData({ ...formData, items: newItems });
                                      }}
                                      className="w-full px-2 py-1 border border-gray-300 rounded"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <label className="text-xs text-gray-600">Cantidad</label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => {
                                      const newItems = [...formData.items];
                                      newItems[idx].quantity = parseInt(e.target.value) || 1;
                                      setFormData({ ...formData, items: newItems });
                                    }}
                                    className="w-full px-2 py-1 border border-gray-300 rounded"
                                  />
                                </div>
                              )}

                              <div className="mt-2 pt-2 border-t border-gray-300 text-xs">
                                <p>Coste: €{cost.toFixed(2)} • Precio: €{price.toFixed(2)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Análisis de Rentabilidad */}
                    {formData.items.length > 0 && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-6">
                        <h4 className="font-medium text-gray-900 mb-3">Análisis de Rentabilidad</h4>
                        {(() => {
                          const totalCost = formData.items.reduce((acc: number, item: any) => {
                            const product = products.find(p => p.id === item.productId);
                            const isPersonal = product?.categoryId === categories.find((c: any) => c.name?.toLowerCase() === 'personal')?.id;
                            const isConsumable = (product as any)?.isConsumable;
                            const quantity = isPersonal ? (item.numberOfPeople || 1) * (item.hoursPerPerson || 1) : item.quantity;
                            
                            // Calcular coste de amortización: Personal y consumibles 100%, productos normales 5%
                            let itemCost = 0;
                            if (isPersonal || isConsumable) {
                              itemCost = Number(product?.purchasePrice || 0) * quantity;
                            } else {
                              itemCost = Number(product?.purchasePrice || 0) * quantity * 0.05;
                            }
                            
                            return acc + itemCost;
                          }, 0);

                          const totalPrice = formData.items.reduce((acc: number, item: any) => {
                            const product = products.find(p => p.id === item.productId);
                            const isPersonal = product?.categoryId === categories.find((c: any) => c.name?.toLowerCase() === 'personal')?.id;
                            const quantity = isPersonal ? (item.numberOfPeople || 1) * (item.hoursPerPerson || 1) : item.quantity;
                            return acc + (Number(product?.pricePerDay || 0) * quantity);
                          }, 0);

                          const finalPrice = formData.customFinalPrice ? parseFloat(formData.customFinalPrice) : totalPrice;
                          const benefit = finalPrice - totalCost;
                          const margin = finalPrice > 0 ? (benefit / finalPrice) * 100 : 0;

                          return (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Coste Amortización</p>
                                <p className="text-lg font-bold text-red-600">€{totalCost.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Precio Venta</p>
                                <p className="text-lg font-bold text-blue-600">€{finalPrice.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Beneficio</p>
                                <p className={`text-lg font-bold ${benefit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  €{benefit.toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Margen</p>
                                <p className={`text-lg font-bold ${margin >= 30 ? 'text-green-600' : margin >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {margin.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Precio Final Personalizado */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precio Final Personalizado (opcional)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.customFinalPrice}
                        onChange={(e) => setFormData({ ...formData, customFinalPrice: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                        placeholder="Dejar vacío para usar precio calculado"
                      />
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
