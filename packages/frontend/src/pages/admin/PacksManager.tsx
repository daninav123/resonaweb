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
    discountAmount: 0, // Cambiado de porcentaje a valor en euros
    customFinalPrice: '',
    includeShipping: true, // Incluir transporte por defecto
    includeInstallation: true, // Incluir montaje por defecto
    items: [] as Array<{ 
      productId: string; 
      quantity: number;
      numberOfPeople?: number; // Para productos de personal
      hoursPerPerson?: number; // Para productos de personal
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
      // Usar la misma ruta que para crear: /packs
      const response: any = await api.get('/packs');
      console.log('📦 Respuesta de packs desde /packs:', response);
      
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
      const response: any = await api.get('/products/categories');
      console.log('📂 Respuesta de categorías:', response);
      
      // La respuesta puede ser un array directamente o un objeto con categorías
      let cats = [];
      if (Array.isArray(response)) {
        cats = response;
      } else if (response?.categories && Array.isArray(response.categories)) {
        cats = response.categories;
      } else if (response?.data && Array.isArray(response.data)) {
        cats = response.data;
      }
      
      console.log('📂 Categorías procesadas:', cats);
      setCategories(cats);
      
      // Buscar categoría "Packs"
      const packsCategory = cats.find((cat: any) => 
        cat.name && cat.name.toLowerCase().includes('pack')
      );
      if (packsCategory) {
        setPacksCategoryId(packsCategory.id);
        console.log('✅ Categoría Packs encontrada:', packsCategory.id, packsCategory.name);
      } else {
        console.log('⚠️ Categoría Packs no encontrada. Categorías disponibles:', cats.map((c: any) => c.name));
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const loadProducts = async () => {
    try {
      // Cargar TODOS los productos sin límite
      const response: any = await api.get('/products?limit=1000');
      console.log('📦 Respuesta de productos:', response);
      
      let prods = [];
      if (Array.isArray(response)) {
        prods = response;
      } else if (response?.products && Array.isArray(response.products)) {
        prods = response.products;
      } else if (response?.data && Array.isArray(response.data)) {
        prods = response.data;
      }
      
      console.log('📦 Productos procesados:', prods.length, 'productos');
      setProducts(prods);
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  // Filtrar productos disponibles para agregar al pack
  const getAvailableProducts = () => {
    console.log('🔍 Total productos:', products.length);
    console.log('🔍 Productos con isPack:', products.filter(p => p.isPack).length);
    console.log('🔍 Productos SIN isPack:', products.filter(p => !p.isPack).length);
    
    let filtered = products.filter(p => !p.isPack);
    console.log('🔍 Después de filtrar packs:', filtered.length);
    
    if (filtered.length > 0) {
      console.log('📋 Categorías de productos disponibles:', [...new Set(filtered.map(p => p.categoryId))]);
      console.log('📋 Primeros 3 productos antes de filtrar:', filtered.slice(0, 3).map(p => ({ name: p.name, categoryId: p.categoryId })));
    }
    
    // Filtrar por categoría si hay una seleccionada
    if (productFilter.categoryId) {
      console.log('🔍 Filtrando por categoría:', productFilter.categoryId);
      const beforeCatFilter = filtered.length;
      filtered = filtered.filter(p => {
        const match = p.categoryId === productFilter.categoryId;
        if (!match && beforeCatFilter < 5) {
          console.log(`   ❌ Producto "${p.name}" tiene categoryId: ${p.categoryId}`);
        }
        return match;
      });
      console.log(`🔍 Después de filtro categoría: ${beforeCatFilter} -> ${filtered.length}`);
    }
    
    // Filtrar por búsqueda
    if (productFilter.search.trim()) {
      console.log('🔍 Filtrando por búsqueda:', productFilter.search);
      const beforeSearch = filtered.length;
      const search = productFilter.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(search) ||
        p.sku?.toLowerCase().includes(search)
      );
      console.log(`🔍 Después de búsqueda: ${beforeSearch} -> ${filtered.length}`);
    }
    
    console.log('✅ Productos finales disponibles:', filtered.length);
    if (filtered.length > 0) {
      console.log('📋 Primeros 3 productos finales:', filtered.slice(0, 3).map(p => ({ name: p.name, categoryId: p.categoryId })));
    }
    return filtered;
  };

  const handleCreate = () => {
    console.log('🆕 Abriendo modal de crear pack');
    console.log('🔄 Estado actual de filtros ANTES de resetear:', productFilter);
    setEditingPack(null);
    setFormData({
      name: '',
      description: '',
      discountAmount: 0,
      customFinalPrice: '',
      includeShipping: true,
      includeInstallation: true,
      items: []
    });
    // Resetear filtros
    const newFilters = {
      categoryId: '',
      search: ''
    };
    setProductFilter(newFilters);
    console.log('✅ Filtros reseteados a:', newFilters);
    setShowModal(true);
  };

  const handleEdit = (pack: any) => {
    setEditingPack(pack);
    setFormData({
      name: pack.name || '',
      description: pack.description || '',
      discountAmount: Number(pack.discountAmount || 0),
      customFinalPrice: pack.customPriceEnabled ? String(pack.finalPrice || '') : '',
      includeShipping: pack.includeShipping !== false, // Por defecto true
      includeInstallation: pack.includeInstallation !== false, // Por defecto true
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

      const packData: any = {
        name: formData.name,
        description: formData.description,
        discountAmount: formData.discountAmount,
        customFinalPrice: formData.customFinalPrice ? parseFloat(formData.customFinalPrice) : undefined,
        includeShipping: formData.includeShipping,
        includeInstallation: formData.includeInstallation,
        items: formData.items,
        autoCalculate: true
      };

      // Solo agregar categoryId si es un pack nuevo
      if (!editingPack) {
        packData.categoryId = packsCategoryId;
      }

      console.log('📦 Guardando pack:', {
        isNew: !editingPack,
        packId: editingPack?.id,
        data: packData
      });

      if (editingPack) {
        console.log(`🔄 Actualizando pack ${editingPack.id}...`);
        const response = await api.put(`/packs/${editingPack.id}`, packData);
        console.log('✅ Pack actualizado:', response);
        toast.success('Pack actualizado correctamente');
      } else {
        console.log('🆕 Creando nuevo pack...');
        const response = await api.post('/packs', packData);
        console.log('✅ Pack creado:', response);
        toast.success('Pack creado correctamente');
      }

      setShowModal(false);
      await loadPacks();
    } catch (error: any) {
      console.error('❌ Error guardando pack:', error);
      console.error('   Response:', error.response?.data);
      console.error('   Status:', error.response?.status);
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

  // Detectar si un producto es de la categoría Personal
  const isPersonalProduct = (product: any) => {
    return product?.category?.name?.toLowerCase() === 'personal';
  };

  const addProductToList = (productId: string) => {
    // Verificar si ya está en la lista
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
        // Si es personal, inicializar con valores por defecto
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

  // Calcular todos los totales del pack
  const calculatePackTotals = () => {
    let totalPricePerDay = 0;
    let totalShipping = 0;
    let totalInstallation = 0;
    let totalCost = 0; // Nuevo: coste total basado en purchasePrice

    formData.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        // Calcular cantidad efectiva:
        // - Para personal: numberOfPeople × hoursPerPerson
        // - Para equipamiento: quantity
        const effectiveQuantity = (item.numberOfPeople && item.hoursPerPerson)
          ? item.numberOfPeople * item.hoursPerPerson
          : item.quantity;

        totalPricePerDay += Number(product.pricePerDay || 0) * effectiveQuantity;
        // Solo sumar si está marcado para incluir
        if (formData.includeShipping) {
          totalShipping += Number(product.shippingCost || 0) * effectiveQuantity;
        }
        if (formData.includeInstallation) {
          totalInstallation += Number(product.installationCost || 0) * effectiveQuantity;
        }
        // Nuevo: calcular coste basado en purchasePrice
        totalCost += Number(product.purchasePrice || 0) * effectiveQuantity;
      }
    });

    const subtotal = totalPricePerDay + totalShipping + totalInstallation;
    const discountAmount = Number(formData.discountAmount || 0);
    const finalPrice = formData.customFinalPrice 
      ? Number(formData.customFinalPrice) 
      : Math.max(0, subtotal - discountAmount);

    // Calcular margen de beneficio
    // Beneficio = Precio Final (lo que cobra al cliente) - Coste Total (lo que te cuesta)
    const profit = finalPrice - totalCost;
    // Margen % = (Beneficio / Precio Final) × 100
    // Si el precio final es 0, el margen es 0
    const profitMargin = finalPrice > 0 ? (profit / finalPrice) * 100 : 0;

    return {
      totalPricePerDay,
      totalShipping,
      totalInstallation,
      subtotal,
      discountAmount,
      finalPrice,
      totalCost, // Nuevo
      profit, // Nuevo
      profitMargin // Nuevo
    };
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
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {packs.map((pack) => (
                <tr key={pack.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{pack.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{pack.description || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-semibold">€{Number(pack.finalPrice || pack.calculatedTotalPrice || 0).toFixed(2)}</td>
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
                <div className="space-y-6">
                  {/* Sección: Buscar y Agregar Productos */}
                  <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      Buscar y Agregar Productos
                    </h3>

                    {/* Filtros */}
                    <div className="mb-3 grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Filtrar por categoría
                        </label>
                        <select
                          value={productFilter.categoryId}
                          onChange={(e) => setProductFilter({ ...productFilter, categoryId: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="">Todas las categorías</option>
                          {categories.filter(c => !c.name?.toLowerCase().includes('pack')).map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Buscar producto
                        </label>
                        <input
                          type="text"
                          value={productFilter.search}
                          onChange={(e) => setProductFilter({ ...productFilter, search: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="Nombre o SKU..."
                        />
                      </div>
                    </div>

                    {/* Lista de productos disponibles */}
                    <div className="bg-white border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
                      {getAvailableProducts().length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm">No hay productos disponibles con estos filtros</p>
                          <button
                            onClick={() => setProductFilter({ categoryId: '', search: '' })}
                            className="mt-2 text-xs text-blue-600 hover:underline"
                          >
                            Limpiar filtros
                          </button>
                        </div>
                      ) : (
                        <div className="divide-y">
                          {getAvailableProducts().map((product) => {
                            const isAdded = formData.items.some(item => item.productId === product.id);
                            const isPerson = isPersonalProduct(product);
                            return (
                              <div key={product.id} className={`flex items-center justify-between p-3 border-l-4 ${
                                isPerson ? 'border-l-purple-500 bg-purple-50 hover:bg-purple-100' : 'border-l-green-500 hover:bg-gray-50'
                              }`}>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                    {isPerson ? '👥' : '📦'} {product.name}
                                    {isPerson ? (
                                      <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded font-semibold">PERSONAL</span>
                                    ) : (
                                      <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded font-semibold">MATERIAL</span>
                                    )}
                                  </div>
                                  <div className={`text-xs font-medium mt-0.5 ${isPerson ? 'text-purple-700' : 'text-green-700'}`}>
                                    €{product.pricePerDay}/{isPerson ? 'hora' : 'día'}
                                    {!isPerson && product.shippingCost > 0 && ` + €${product.shippingCost} envío`}
                                    {!isPerson && product.installationCost > 0 && ` + €${product.installationCost} instalación`}
                                  </div>
                                </div>
                                <button
                                  onClick={() => addProductToList(product.id)}
                                  disabled={isAdded}
                                  className={`flex items-center gap-1 px-3 py-1 text-sm rounded transition-colors ${
                                    isAdded 
                                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                      : isPerson
                                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                                      : 'bg-green-600 text-white hover:bg-green-700'
                                  }`}
                                >
                                  {isAdded ? (
                                    <>✓ Añadido</>
                                  ) : (
                                    <><Plus className="w-4 h-4" /> Añadir</>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sección: Productos en el Pack */}
                  <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Package className="w-5 h-5 text-green-600" />
                      Productos en el Pack ({formData.items.length})
                    </h3>

                    {formData.items.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No hay productos en el pack aún</p>
                        <p className="text-xs mt-1">Usa el buscador de arriba para añadir productos</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {formData.items.map((item, index) => {
                          const product = products.find(p => p.id === item.productId);
                          if (!product) return null;
                          
                          const isPerson = isPersonalProduct(product);
                          const effectiveQuantity = (item.numberOfPeople && item.hoursPerPerson)
                            ? item.numberOfPeople * item.hoursPerPerson
                            : item.quantity;
                          const subtotal = Number(product.pricePerDay) * effectiveQuantity;
                          
                          return (
                            <div key={index} className={`bg-white p-3 rounded-lg border-2 ${
                              isPerson ? 'border-purple-300 bg-purple-50' : 'border-green-200'
                            }`}>
                              <div className="flex items-center gap-3 mb-2">
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                    {isPerson ? '👥' : '📦'} {product.name}
                                    {isPerson && <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded font-semibold">PERSONAL</span>}
                                    {!isPerson && <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded font-semibold">MATERIAL</span>}
                                  </div>
                                  <div className={`text-xs font-medium ${isPerson ? 'text-purple-700' : 'text-green-700'}`}>
                                    €{product.pricePerDay}/{isPerson ? 'hora' : 'día'} × {isPerson ? `${effectiveQuantity.toFixed(1)}h` : `${item.quantity} unid.`} = €{subtotal.toFixed(2)}
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeProduct(index)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              
                              {isPerson ? (
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                  <div>
                                    <label className="text-xs text-gray-600 block mb-1">Personas:</label>
                                    <input
                                      type="number"
                                      min="1"
                                      value={item.numberOfPeople || 1}
                                      onChange={(e) => updatePersonalDetails(index, parseInt(e.target.value) || 1, item.hoursPerPerson || 1)}
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-gray-600 block mb-1">Horas c/u:</label>
                                    <input
                                      type="number"
                                      min="0.5"
                                      step="0.5"
                                      value={item.hoursPerPerson || 1}
                                      onChange={(e) => updatePersonalDetails(index, item.numberOfPeople || 1, parseFloat(e.target.value) || 1)}
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                                    />
                                  </div>
                                  <div className="col-span-2 text-xs text-purple-700 font-medium">
                                    = {item.numberOfPeople || 1} persona{(item.numberOfPeople || 1) > 1 ? 's' : ''} × {item.hoursPerPerson || 1}h = {effectiveQuantity.toFixed(1)}h totales
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-2">
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-600">Cantidad:</label>
                                    <input
                                      type="number"
                                      min="1"
                                      value={item.quantity}
                                      onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sistema de Precios */}
                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calculator className="w-5 h-5 text-resona" />
                    <h3 className="text-lg font-semibold">Cálculo de Precios</h3>
                  </div>

                  {formData.items.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                      <p className="text-gray-500 text-sm">
                        Añade productos al pack para ver el cálculo de precios
                      </p>
                    </div>
                  ) : (() => {
                    const totals = calculatePackTotals();
                    return (
                      <div className="space-y-4">
                        {/* Opciones de Inclusión */}
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">¿Qué incluye este pack?</h4>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.includeShipping}
                                onChange={(e) => setFormData({ ...formData, includeShipping: e.target.checked })}
                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                              />
                              <span className="text-sm text-gray-700">
                                <strong>Incluir transporte</strong> en el precio
                              </span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.includeInstallation}
                                onChange={(e) => setFormData({ ...formData, includeInstallation: e.target.checked })}
                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                              />
                              <span className="text-sm text-gray-700">
                                <strong>Incluir montaje/instalación</strong> en el precio
                              </span>
                            </label>
                          </div>
                          <p className="text-xs text-gray-600 mt-3">
                            Desmarca las opciones para packs sin transporte o montaje
                          </p>
                        </div>

                        {/* Totales Calculados Automáticamente */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Totales Calculados</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Total Precio/Día:</span>
                              <span className="font-medium">€{totals.totalPricePerDay.toFixed(2)}</span>
                            </div>
                            <div className={`flex justify-between text-sm ${!formData.includeShipping ? 'opacity-50 line-through' : ''}`}>
                              <span className="text-gray-600">
                                Total Transporte:
                                {!formData.includeShipping && <span className="ml-2 text-xs text-red-600">(No incluido)</span>}
                              </span>
                              <span className="font-medium">€{totals.totalShipping.toFixed(2)}</span>
                            </div>
                            <div className={`flex justify-between text-sm ${!formData.includeInstallation ? 'opacity-50 line-through' : ''}`}>
                              <span className="text-gray-600">
                                Total Montaje/Instalación:
                                {!formData.includeInstallation && <span className="ml-2 text-xs text-red-600">(No incluido)</span>}
                              </span>
                              <span className="font-medium">€{totals.totalInstallation.toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                              <div className="flex justify-between text-base font-semibold">
                                <span>Subtotal:</span>
                                <span className="text-resona">€{totals.subtotal.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Campo Editable: Descuento */}
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Descuento del Pack (€)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.discountAmount}
                            onChange={(e) => setFormData({ ...formData, discountAmount: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            placeholder="0.00"
                          />
                          <p className="text-xs text-gray-600 mt-1">
                            Introduce el descuento que quieres aplicar en euros
                          </p>
                        </div>

                        {/* Precio Final */}
                        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-lg font-bold text-green-800">Precio Final</h4>
                              {totals.discountAmount > 0 && (
                                <p className="text-xs text-green-700 mt-1">
                                  Ahorro: €{totals.discountAmount.toFixed(2)}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold text-green-600">
                                €{totals.finalPrice.toFixed(2)}
                              </div>
                              <p className="text-xs text-green-700 mt-1">por día</p>
                            </div>
                          </div>
                        </div>

                        {/* 💰 Análisis de Costes y Margen */}
                        <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4">
                          <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                            <Calculator className="w-4 h-4" />
                            Análisis de Rentabilidad
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-blue-700">Subtotal (precios de venta):</span>
                              <span className="font-semibold text-blue-900">€{totals.subtotal.toFixed(2)}</span>
                            </div>
                            {totals.discountAmount > 0 && (
                              <div className="flex justify-between text-green-700">
                                <span>Descuento:</span>
                                <span className="font-semibold">-€{totals.discountAmount.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between border-t border-blue-200 pt-2 mt-2 font-semibold">
                              <span className="text-blue-800">Precio Final (lo que cobra):</span>
                              <span className="text-blue-900">€{totals.finalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                              <span className="text-blue-700">Coste Total (lo que cuesta):</span>
                              <span className="font-semibold text-blue-900">€{totals.totalCost.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-blue-200 pt-2 mt-2">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-blue-800">Beneficio:</span>
                                <span className={`text-lg font-bold ${totals.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  €{totals.profit.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <span className="font-semibold text-blue-800">Margen:</span>
                                <span className={`text-lg font-bold ${totals.profitMargin >= 30 ? 'text-green-600' : totals.profitMargin >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {totals.profitMargin.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                          {totals.profit < 0 && (
                            <div className="mt-3 bg-red-100 border border-red-300 rounded p-2">
                              <p className="text-xs text-red-700 font-medium">
                                ⚠️ Beneficio negativo: El precio de venta es menor que el coste. Aumenta el precio final.
                              </p>
                            </div>
                          )}
                          {totals.profit >= 0 && totals.profitMargin < 15 && totals.totalCost > 0 && (
                            <div className="mt-3 bg-yellow-100 border border-yellow-300 rounded p-2">
                              <p className="text-xs text-yellow-700 font-medium">
                                ⚠️ Margen bajo: considera aumentar el precio o reducir costes
                              </p>
                            </div>
                          )}
                          {totals.totalCost === 0 && (
                            <div className="mt-3 bg-yellow-100 border border-yellow-300 rounded p-2">
                              <p className="text-xs text-yellow-700 font-medium">
                                💡 Tip: Añade el "Precio de Compra" a los productos para ver el margen real
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Opción: Precio Personalizado */}
                        <details className="bg-blue-50 border border-blue-200 rounded-lg">
                          <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-blue-800 hover:bg-blue-100 rounded-lg">
                            Establecer Precio Final Personalizado (opcional)
                          </summary>
                          <div className="p-4 pt-2">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.customFinalPrice}
                              onChange={(e) => setFormData({ ...formData, customFinalPrice: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Dejar vacío para usar cálculo automático"
                            />
                            <p className="text-xs text-gray-600 mt-2">
                              Si introduces un valor aquí, se ignorará el cálculo automático y el descuento.
                            </p>
                          </div>
                        </details>
                      </div>
                    );
                  })()}
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
