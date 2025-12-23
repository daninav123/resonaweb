import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Package, X, Save, Calculator, Eye, EyeOff, Copy, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { ResponsiveTableWrapper } from '../../components/admin/ResponsiveTableWrapper';

// Helper para construir URLs completas de imágenes
const getFullImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const apiPath = baseUrl.replace('/api/v1', '');
  return `${apiPath}${imagePath}`;
};

// Helper para convertir URL completa a ruta relativa
const getRelativeImagePath = (fullUrl: string | null | undefined): string | undefined => {
  if (!fullUrl) return undefined;
  if (fullUrl.startsWith('/uploads/')) return fullUrl;
  const match = fullUrl.match(/\/uploads\/products\/.+$/);
  return match ? match[0] : undefined;
};

const MontajesManager = () => {
  const navigate = useNavigate();
  const [packs, setPacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPack, setEditingPack] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [montajeCategoryId, setMontajeCategoryId] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'BODAS' as 'BODAS' | 'EVENTOS_PRIVADOS' | 'CONCIERTOS' | 'EVENTOS_CORPORATIVOS' | 'CONFERENCIAS' | 'EXTRAS' | 'OTROS', // Categoría del montaje
    customFinalPrice: '',
    transportCost: '', // Coste de transporte e instalación
    includeShipping: true,
    includeInstallation: true,
    imageUrl: '',
    items: [] as Array<{
      productId: string;
      quantity: number;
      numberOfPeople?: number; // Para productos de personal
      hoursPerPerson?: number; // Para productos de personal
    }>,
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  const [productFilter, setProductFilter] = useState({
    categoryId: '',
    search: '',
  });

  const [packCategoryFilter, setPackCategoryFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'profit'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadPacks();
    loadCategories();
    loadProducts();
  }, []);

  const loadPacks = async () => {
    try {
      setLoading(true);
      // Incluir packs inactivos Y montajes en el admin
      const response: any = await api.get('/packs?includeInactive=true&includeMontajes=true');
      console.log('Respuesta de packs desde /packs (con montajes):', response);

      // El backend retorna { packs: [...] }
      const packsData = response?.packs || response || [];
      console.log('Packs procesados:', packsData);

      // Filtrar solo packs de categoría MONTAJE
      const montajePacks = Array.isArray(packsData)
        ? packsData.filter((pack: any) => {
            const categoryName = pack.categoryRef?.name?.toLowerCase() || pack.category?.toLowerCase() || '';
            return categoryName === 'montaje';
          })
        : [];

      console.log('Montajes filtrados:', montajePacks);
      setPacks(montajePacks);
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
      console.log('Respuesta de categorías:', response);

      // La respuesta puede ser un array directamente o un objeto con categorías
      let cats = [];
      if (Array.isArray(response)) {
        cats = response;
      } else if (response?.categories && Array.isArray(response.categories)) {
        cats = response.categories;
      } else if (response?.data && Array.isArray(response.data)) {
        cats = response.data;
      }

      console.log('Categorías procesadas:', cats);
      setCategories(cats);

      // Buscar categoría "Montaje"
      const montajeCategory = cats.find((cat: any) =>
        cat.name && cat.name.toLowerCase() === 'montaje'
      );
      if (montajeCategory) {
        setMontajeCategoryId(montajeCategory.id);
        console.log('Categoría Montaje encontrada:', montajeCategory.id, montajeCategory.name);
      } else {
        console.log('Categoría Montaje no encontrada. Categorías disponibles:', cats.map((c: any) => c.name));
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const loadProducts = async () => {
    try {
      // Cargar TODOS los productos sin límite - includeHidden=true para ver Personal, etc.
      const response: any = await api.get('/products?limit=1000&includeHidden=true');
      console.log('Respuesta de productos:', response);

      let prods = [];
      if (Array.isArray(response)) {
        prods = response;
      } else if (response?.products && Array.isArray(response.products)) {
        prods = response.products;
      } else if (response?.data && Array.isArray(response.data)) {
        prods = response.data;
      }

      console.log('Productos procesados:', prods.length, 'productos');
      setProducts(prods);
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  // Filtrar productos disponibles para agregar al pack
  const getAvailableProducts = () => {
    console.log('Total productos:', products.length);
    console.log('Productos con isPack:', products.filter(p => p.isPack).length);
    console.log('Productos SIN isPack:', products.filter(p => !p.isPack).length);

    let filtered = products.filter(p => !p.isPack);
    console.log('Después de filtrar packs:', filtered.length);

    if (filtered.length > 0) {
      console.log('Categorías de productos disponibles:', [...new Set(filtered.map(p => p.categoryId))]);
      console.log('Primeros 3 productos antes de filtrar:', filtered.slice(0, 3).map(p => ({ name: p.name, categoryId: p.categoryId })));
    }

    // Filtrar por categoría si hay una seleccionada
    if (productFilter.categoryId) {
      console.log('Filtrando por categoría:', productFilter.categoryId);
      const beforeCatFilter = filtered.length;
      filtered = filtered.filter(p => {
        const match = p.categoryId === productFilter.categoryId;
        if (!match && beforeCatFilter < 5) {
          console.log(`   Producto "${p.name}" tiene categoryId: ${p.categoryId}`);
        }
        return match;
      });
      console.log(`Después de filtro categoría: ${beforeCatFilter} -> ${filtered.length}`);
    }

    // Filtrar por búsqueda
    if (productFilter.search.trim()) {
      console.log('Filtrando por búsqueda:', productFilter.search);
      const beforeSearch = filtered.length;
      const search = productFilter.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(search) ||
        p.sku?.toLowerCase().includes(search)
      );
      console.log(`Después de búsqueda: ${beforeSearch} -> ${filtered.length}`);
    }

    console.log('Productos finales disponibles:', filtered.length);
    if (filtered.length > 0) {
      console.log('Primeros 3 productos finales:', filtered.slice(0, 3).map(p => ({ name: p.name, categoryId: p.categoryId })));
    }
    return filtered;
  };

  const handleCreate = () => {
    console.log('Abriendo modal de crear pack');
    console.log('Estado actual de filtros ANTES de resetear:', productFilter);
    setEditingPack(null);
    setFormData({
      name: '',
      description: '',
      category: 'BODAS', // Valor por defecto
      customFinalPrice: '',
      transportCost: '', // Añadir transportCost
      includeShipping: true,
      includeInstallation: true,
      imageUrl: '',
      items: [],
    });
    const newFilters = {
      categoryId: '',
      search: '',
    };
    setProductFilter(newFilters);
    console.log('Filtros reseteados a:', newFilters);
    setShowModal(true);
  };

  const handleEdit = (pack: any) => {
    setEditingPack(pack);
    
    // Mapear items del pack
    const mappedItems = (pack.items || []).map((item: any) => ({
      productId: item.productId || item.product?.id,
      quantity: item.quantity || 1,
      numberOfPeople: item.numberOfPeople,
      hoursPerPerson: item.hoursPerPerson
    }));
    
    console.log('✏️ Editando pack - CATEGORIA ORIGINAL:', pack.category);
    console.log('📷 URL de imagen recibida:', pack.imageUrl);
    
    // Convertir URL de imagen a URL completa usando helper
    const imageUrl = getFullImageUrl(pack.imageUrl);
    console.log('📷 URL de imagen completa:', imageUrl);
    
    setFormData({
      name: pack.name || '',
      description: pack.description || '',
      category: pack.category || 'OTROS', // Usar la categoría del pack, por defecto OTROS
      customFinalPrice: pack.customPriceEnabled ? String(pack.finalPrice || '') : '',
      transportCost: String(pack.transportCost || ''), // Añadir transportCost
      includeShipping: pack.includeShipping !== false,
      includeInstallation: pack.includeInstallation !== false,
      imageUrl: imageUrl,
      items: mappedItems
    });
    console.log('📝 FormData.category establecido a:', pack.category || 'OTROS');
    console.log('📦 Items del pack (detalle completo):');
    pack.items?.forEach((item: any, index: number) => {
      const product = products.find(p => p.id === (item.productId || item.product?.id));
      console.log(`  Item ${index}: ${product?.name}`, {
        productId: item.productId || item.product?.id,
        quantity: item.quantity,
        numberOfPeople: item.numberOfPeople,
        hoursPerPerson: item.hoursPerPerson,
        rawItem: item
      });
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      console.log('📤 Subiendo imagen...');
      const response: any = await api.post('/upload/image', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('📥 Respuesta completa del servidor:', response);
      console.log('📥 response.data:', response.data);
      console.log('📥 response.imageUrl:', response.imageUrl);
      
      // El backend puede responder directamente o con data
      const imageUrl = response.imageUrl || response.data?.imageUrl || response.data;
      
      if (!imageUrl) {
        console.error('❌ No se recibió imageUrl. Respuesta:', response);
        throw new Error('El servidor no devolvió la URL de la imagen');
      }
      
      console.log('✅ URL de imagen obtenida:', imageUrl);
      
      // Construir URL completa usando helper
      const fullImageUrl = getFullImageUrl(imageUrl);
      
      console.log('✅ URL completa de imagen:', fullImageUrl);
      setFormData(prev => ({ ...prev, imageUrl: fullImageUrl }));
      toast.success('Imagen subida correctamente');
    } catch (error: any) {
      console.error('❌ Error subiendo imagen:', error);
      console.error('❌ Error response:', error.response);
      toast.error(error.response?.data?.error || error.message || 'Error al subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDuplicate = async (pack: any) => {
    try {
      // Generar nombre para el duplicado
      let duplicateName = `${pack.name} (copia)`;
      let counter = 1;
      
      // Verificar si ya existe un montaje con ese nombre
      while (packs.some(p => p.name === duplicateName)) {
        counter++;
        duplicateName = `${pack.name} (copia ${counter})`;
      }

      // Preparar datos del montaje duplicado
      const packData = {
        name: duplicateName,
        description: pack.description || '',
        categoryId: montajeCategoryId,
        category: pack.category || 'OTROS', // Preservar la categoría del evento
        customFinalPrice: pack.customPriceEnabled ? Number(pack.finalPrice) : undefined,
        transportCost: Number(pack.transportCost || 0),
        items: pack.items?.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          numberOfPeople: item.numberOfPeople,
          hoursPerPerson: item.hoursPerPerson,
        })) || [],
        featured: false,
        imageUrl: pack.imageUrl || undefined,
      };

      // Crear el montaje duplicado
      await api.post('/packs', packData);
      toast.success(`Montaje "${duplicateName}" creado exitosamente`);
      loadPacks();
    } catch (error: any) {
      console.error('Error duplicando montaje:', error);
      toast.error(error.response?.data?.message || 'Error al duplicar el montaje');
    }
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

      console.log('💾 ANTES de mapear - formData.items:');
      formData.items.forEach((item, index) => {
        const product = products.find(p => p.id === item.productId);
        console.log(`  Item ${index}: ${product?.name}`, {
          productId: item.productId,
          quantity: item.quantity,
          numberOfPeople: item.numberOfPeople,
          hoursPerPerson: item.hoursPerPerson
        });
      });

      // Filtrar productos virtuales que no existen en la BD
      const validItems = formData.items.filter(item => {
        // Excluir productos virtuales como 'product-custom-event-virtual'
        if (item.productId && item.productId.includes('virtual')) {
          console.log(`⚠️ Filtrando producto virtual: ${item.productId}`);
          return false;
        }
        return true;
      });

      if (validItems.length === 0) {
        toast.error('Debes agregar al menos un producto real al pack');
        return;
      }

      console.log('📝 CATEGORIA ANTES DE GUARDAR:', formData.category);
      console.log('📝 montajeCategoryId:', montajeCategoryId);
      
      // Convertir URL completa de vuelta a ruta relativa para guardar en BD
      const imageUrlToSave = getRelativeImagePath(formData.imageUrl);
      console.log('📷 Guardando imagen como:', imageUrlToSave);
      
      const packData: any = {
        name: formData.name,
        description: formData.description,
        categoryId: montajeCategoryId, // ID de la categoría Montaje (esto identifica que es un montaje)
        category: formData.category, // Categoría del evento: BODAS, EXTRAS, etc.
        customFinalPrice: formData.customFinalPrice ? parseFloat(formData.customFinalPrice) : undefined,
        transportCost: formData.transportCost ? parseFloat(formData.transportCost) : 0, // Añadir transportCost
        includeShipping: formData.includeShipping,
        includeInstallation: formData.includeInstallation,
        imageUrl: imageUrlToSave,
        items: validItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          // IMPORTANTE: Asegurar que numberOfPeople y hoursPerPerson se envíen
          ...(item.numberOfPeople !== undefined && { numberOfPeople: item.numberOfPeople }),
          ...(item.hoursPerPerson !== undefined && { hoursPerPerson: item.hoursPerPerson })
        })),
        autoCalculate: true
      };
      
      console.log('📦 Items a guardar (detalle completo):');
      packData.items.forEach((item: any, index: number) => {
        const product = products.find(p => p.id === item.productId);
        console.log(`  Item ${index}: ${product?.name}`, {
          productId: item.productId,
          quantity: item.quantity,
          numberOfPeople: item.numberOfPeople,
          hoursPerPerson: item.hoursPerPerson
        });
      });

      console.log('📦 Guardando pack:', {
        isNew: !editingPack,
        packId: editingPack?.id,
        name: packData.name,
        itemsCount: packData.items.length
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
      console.error('❌ ============ ERROR GUARDANDO PACK ============');
      console.error('📋 Error completo:', error);
      console.error('📋 Mensaje:', error.message);
      console.error('📋 Response completa:', error.response);
      console.error('📋 Response.data:', error.response?.data);
      console.error('📋 Response.data.error:', error.response?.data?.error);
      console.error('📋 Response.data.message:', error.response?.data?.message);
      console.error('📋 Status:', error.response?.status);
      console.error('📋 Headers:', error.response?.headers);
      console.error('❌ ===============================================');
      
      // Mostrar mensaje de error más detallado
      const errorMsg = error.response?.data?.error?.message 
        || error.response?.data?.message 
        || error.message 
        || 'Error al guardar el pack';
      
      toast.error(errorMsg);
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

  // Calcular costes y beneficios para un pack (usado en la tabla)
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
          const effectiveQuantity = isPersonal
            ? (item.numberOfPeople || 1) * (item.hoursPerPerson || 1)
            : item.quantity;

          if (isPersonal) {
            costPersonal += Number(product.purchasePrice || 0) * effectiveQuantity;
          } else if (isConsumable) {
            // Consumible: coste total (se pierde el producto)
            costDepreciation += Number(product.purchasePrice || 0) * effectiveQuantity;
          } else {
            // Material: depreciación 5%
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

    // Al ser un pack, los costes de envío y montaje son la mitad (optimización)
    costShippingInstallation = costShippingInstallation / 2;

    const totalCost = costPersonal + costDepreciation + costShippingInstallation;
    // Incluir transportCost en el cálculo del beneficio
    const profit = finalPrice - totalCost - (pack.transportCost || 0);

    return { totalCost, profit };
  };

  // Calcular todos los totales del pack
  const calculatePackTotals = () => {
    let totalPricePerDay = 0;
    let totalShipping = 0;
    let totalInstallation = 0;
    
    // Costes separados
    let costMaterial = 0; // Coste directo de material (si lo hubiera)
    let costPersonal = 0; // Coste de personal (por hora)
    let costDepreciation = 0; // Amortización del material (5%)
    let costShippingInstallation = 0; // Envío + Montaje

    formData.items.forEach((item, index) => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        // Determinar si es personal o material
        const isPersonal = product.category?.name?.toLowerCase() === 'personal';
        
        // Calcular cantidad efectiva:
        // - Para personal: numberOfPeople × hoursPerPerson
        // - Para equipamiento: quantity
        const effectiveQuantity = isPersonal
          ? (item.numberOfPeople || 1) * (item.hoursPerPerson || 1)
          : item.quantity;

        // Detectar si es consumible para usar el precio correcto
        const isConsumable = (product as any).isConsumable;
        const unitPrice = isConsumable 
          ? Number((product as any).pricePerUnit || 0)
          : Number(product.pricePerDay || 0);
        const itemPrice = unitPrice * effectiveQuantity;
        
        if (isPersonal) {
          // PERSONAL: coste por hora trabajada
          const personalCost = Number(product.purchasePrice || 0) * effectiveQuantity;
          costPersonal += personalCost;
        } else if (isConsumable) {
          // CONSUMIBLE: coste por unidad vendida (se pierde el producto)
          const consumableCost = Number(product.purchasePrice || 0) * effectiveQuantity;
          costDepreciation += consumableCost;
        } else {
          // MATERIAL: depreciación (5% del precio de compra por día)
          const depreciationRate = 0.05;
          const depreciation = Number(product.purchasePrice || 0) * effectiveQuantity * depreciationRate;
          costDepreciation += depreciation;
        }

        // Calcular amortización para el log
        let itemAmortization = 0;
        if (isPersonal) {
          itemAmortization = Number(product.purchasePrice || 0) * effectiveQuantity;
        } else if (isConsumable) {
          itemAmortization = Number(product.purchasePrice || 0) * effectiveQuantity;
        } else {
          itemAmortization = Number(product.purchasePrice || 0) * effectiveQuantity * 0.05;
        }

        console.log(`📦 Item ${index}: ${product.name}`, {
          isPersonal,
          isConsumable,
          numberOfPeople: item.numberOfPeople,
          hoursPerPerson: item.hoursPerPerson,
          quantity: item.quantity,
          effectiveQuantity,
          purchasePrice: product.purchasePrice,
          pricePerDay: product.pricePerDay,
          itemPrice,
          amortizationCost: itemAmortization.toFixed(2)
        });

        totalPricePerDay += itemPrice;
        
        // Sumar precios y costes de envío e instalación
        if (formData.includeShipping) {
          const shippingPrice = Number(product.shippingCost || 0) * effectiveQuantity;
          totalShipping += shippingPrice;
          costShippingInstallation += shippingPrice;
        }
        if (formData.includeInstallation) {
          const installationPrice = Number(product.installationCost || 0) * effectiveQuantity;
          totalInstallation += installationPrice;
          costShippingInstallation += installationPrice;
        }
      }
    });

    // Al ser un pack, los costes de envío y montaje son la mitad (optimización)
    totalShipping = totalShipping / 2;
    totalInstallation = totalInstallation / 2;
    costShippingInstallation = costShippingInstallation / 2;

    const subtotal = totalPricePerDay + totalShipping + totalInstallation;
    const finalPrice = formData.customFinalPrice 
      ? Number(formData.customFinalPrice) 
      : subtotal;

    // Añadir coste de transporte manual
    const transportCostValue = formData.transportCost ? parseFloat(formData.transportCost) : 0;
    
    // Calcular costes totales (incluir transporte)
    const totalCost = costMaterial + costPersonal + costShippingInstallation + costDepreciation + transportCostValue;
    
    // Beneficio = Precio Final - Coste Total
    const profit = finalPrice - totalCost;
    
    // Margen % = (Beneficio / Precio Final) × 100
    const profitMargin = finalPrice > 0 ? (profit / finalPrice) * 100 : 0;

    console.log('💰 Análisis de Rentabilidad:', {
      'Precio Venta': finalPrice.toFixed(2),
      'Coste Material': costMaterial.toFixed(2),
      'Coste Personal': costPersonal.toFixed(2),
      'Coste Envío+Montaje': costShippingInstallation.toFixed(2),
      'Coste Amortización': costDepreciation.toFixed(2),
      'Coste Total': totalCost.toFixed(2),
      'Beneficio': profit.toFixed(2),
      'Margen': profitMargin.toFixed(1) + '%'
    });

    return {
      totalPricePerDay,
      totalShipping,
      totalInstallation,
      subtotal,
      finalPrice,
      // Costes detallados
      costMaterial,
      costPersonal,
      costShippingInstallation,
      costDepreciation,
      transportCost: transportCostValue,
      totalCost,
      profit,
      profitMargin
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-resona"></div>
      </div>
    );
  }

  // Mapeo de categorías a información visual
  const categoryInfo: Record<string, { emoji: string; label: string; color: string }> = {
    BODAS: { emoji: '💒', label: 'Bodas', color: 'bg-pink-100 text-pink-800' },
    EVENTOS_PRIVADOS: { emoji: '🎉', label: 'Eventos Privados', color: 'bg-purple-100 text-purple-800' },
    CONCIERTOS: { emoji: '🎵', label: 'Conciertos', color: 'bg-blue-100 text-blue-800' },
    EVENTOS_CORPORATIVOS: { emoji: '💼', label: 'Eventos Corporativos', color: 'bg-gray-100 text-gray-800' },
    CONFERENCIAS: { emoji: '🎤', label: 'Conferencias', color: 'bg-indigo-100 text-indigo-800' },
    EXTRAS: { emoji: '✨', label: 'Extras', color: 'bg-cyan-100 text-cyan-800' },
    OTROS: { emoji: '📅', label: 'Otros', color: 'bg-amber-100 text-amber-800' }
  };

  // Filtrar packs por categoría
  let filteredPacks = packCategoryFilter 
    ? packs.filter(pack => pack.category === packCategoryFilter)
    : packs;

  // Ordenar packs
  filteredPacks = [...filteredPacks].sort((a, b) => {
    let aValue: number | string = 0;
    let bValue: number | string = 0;

    if (sortBy === 'price') {
      aValue = Number(a.finalPrice || a.calculatedTotalPrice || 0);
      bValue = Number(b.finalPrice || b.calculatedTotalPrice || 0);
    } else if (sortBy === 'profit') {
      const aCost = calculatePackCostsAndProfit(a).totalCost;
      const aProfit = Number(a.finalPrice || a.calculatedTotalPrice || 0) - aCost;
      const bCost = calculatePackCostsAndProfit(b).totalCost;
      const bProfit = Number(b.finalPrice || b.calculatedTotalPrice || 0) - bCost;
      aValue = aProfit;
      bValue = bProfit;
    } else {
      aValue = a.name.toLowerCase();
      bValue = b.name.toLowerCase();
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Montajes</h1>
        <button
          data-testid="create-pack"
          onClick={handleCreate}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Crear Montaje
        </button>
      </div>

      {/* Estadísticas por categoría */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(categoryInfo).map(([key, info]) => {
          const count = packs.filter(p => p.category === key).length;
          const isSelected = packCategoryFilter === key;
          return (
            <button
              key={key}
              onClick={() => setPackCategoryFilter(isSelected ? '' : key)}
              className={`p-4 rounded-lg border-2 transition-all ${
                isSelected 
                  ? 'border-resona bg-resona/5 shadow-md' 
                  : 'border-gray-200 hover:border-resona/50 hover:shadow'
              }`}
            >
              <div className="text-3xl mb-2">{info.emoji}</div>
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-xs text-gray-600 mt-1">{info.label}</div>
            </button>
          );
        })}
      </div>

      {/* Filtro por categoría */}
      {packCategoryFilter && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-900">
                Mostrando: {categoryInfo[packCategoryFilter].emoji} {categoryInfo[packCategoryFilter].label}
              </span>
              <span className="px-2 py-1 bg-blue-200 text-blue-900 rounded-full text-xs font-semibold">
                {filteredPacks.length} {filteredPacks.length === 1 ? 'montaje' : 'montajes'}
              </span>
            </div>
            <button
              onClick={() => setPackCategoryFilter('')}
              className="text-sm text-blue-700 hover:text-blue-900 font-medium underline"
            >
              Ver todos los montajes
            </button>
          </div>
        </div>
      )}

      {filteredPacks.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">
            {packCategoryFilter ? `No hay montajes en la categoría seleccionada` : 'No hay montajes creados'}
          </p>
          <button
            data-testid="create-first-pack"
            onClick={handleCreate}
            className="px-4 py-2 bg-resona text-white rounded-lg hover:bg-resona-dark"
          >
            Crear primer montaje
          </button>
        </div>
      ) : (
        <ResponsiveTableWrapper>
        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full w-full" style={{ minWidth: '900px' }}>
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  <button
                    onClick={() => {
                      if (sortBy === 'name') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('name');
                        setSortOrder('asc');
                      }
                    }}
                    className="flex items-center gap-1 hover:text-resona"
                  >
                    Nombre
                    {sortBy === 'name' && (sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />)}
                    {sortBy !== 'name' && <ArrowUpDown className="w-4 h-4 text-gray-400" />}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Categoría</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Descripción</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  <button
                    onClick={() => {
                      if (sortBy === 'price') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('price');
                        setSortOrder('asc');
                      }
                    }}
                    className="flex items-center gap-1 hover:text-resona"
                  >
                    Precio/Día
                    {sortBy === 'price' && (sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />)}
                    {sortBy !== 'price' && <ArrowUpDown className="w-4 h-4 text-gray-400" />}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Gastos Esperados</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  <button
                    onClick={() => {
                      if (sortBy === 'profit') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('profit');
                        setSortOrder('asc');
                      }
                    }}
                    className="flex items-center gap-1 hover:text-resona"
                  >
                    Beneficio Esperado
                    {sortBy === 'profit' && (sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />)}
                    {sortBy !== 'profit' && <ArrowUpDown className="w-4 h-4 text-gray-400" />}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estado</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPacks.map((pack) => {
                const { totalCost, profit } = calculatePackCostsAndProfit(pack);
                const profitColor = profit >= 0 ? 'text-green-600' : 'text-red-600';
                const isActive = pack.isActive !== false; // Por defecto true si no existe el campo
                
                const category = pack.category || 'OTROS';
                const catInfo = categoryInfo[category] || categoryInfo.OTROS;
                
                return (
                  <tr key={pack.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{pack.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${catInfo.color}`}>
                        <span>{catInfo.emoji}</span>
                        {catInfo.label}
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
                      title={isActive ? 'Ocultar montaje' : 'Mostrar montaje'}
                    >
                      {isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => handleDuplicate(pack)}
                      className="text-purple-600 hover:text-purple-800"
                      title="Duplicar montaje"
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
                )
              })}
            </tbody>
          </table>
        </div>
        </ResponsiveTableWrapper>
      )}

      {/* Modal de Crear/Editar Pack */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingPack ? 'Editar Montaje' : 'Crear Nuevo Montaje'}
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
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                      >
                        <option value="BODAS">💒 Bodas</option>
                        <option value="EVENTOS_PRIVADOS">🎉 Eventos Privados</option>
                        <option value="CONCIERTOS">🎵 Conciertos</option>
                        <option value="EVENTOS_CORPORATIVOS">💼 Eventos Corporativos</option>
                        <option value="CONFERENCIAS">🎤 Conferencias</option>
                        <option value="EXTRAS">✨ Extras</option>
                        <option value="OTROS">📅 Otros</option>
                      </select>
                    </div>

                    {/* Imagen del montaje */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Imagen del Montaje
                      </label>
                      <div className="space-y-2">
                        {formData.imageUrl && (
                          <div className="relative w-full rounded-lg overflow-hidden border border-gray-300 bg-gray-50">
                            <img
                              src={formData.imageUrl}
                              alt="Preview"
                              className="w-full h-auto max-h-64 object-contain"
                            />
                            <button
                              onClick={() => setFormData({ ...formData, imageUrl: '' })}
                              className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 shadow-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                        />
                        {uploadingImage && (
                          <p className="text-sm text-gray-500">Subiendo imagen...</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Productos del Pack - Layout 60/40 */}
                <div className="grid grid-cols-3 gap-3">
                  {/* IZQUIERDA: Buscar y Agregar Productos (60%) */}
                  <div className="col-span-2 space-y-2">
                    <h3 className="text-sm font-bold flex items-center gap-1 text-gray-900">
                      <Package className="w-4 h-4 text-blue-600" />
                      Buscar y Añadir Productos
                    </h3>

                    {/* Filtros */}
                    <div className="flex gap-1">
                      <select
                        value={productFilter.categoryId}
                        onChange={(e) => setProductFilter({ ...productFilter, categoryId: e.target.value })}
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 bg-white"
                      >
                        <option value="">📁 Todas</option>
                        {categories.filter(c => !c.name?.toLowerCase().includes('pack')).map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={productFilter.search}
                        onChange={(e) => setProductFilter({ ...productFilter, search: e.target.value })}
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        placeholder="🔍 Buscar..."
                      />
                    </div>

                    {/* Lista de productos disponibles */}
                    <div className="bg-white border border-gray-300 rounded max-h-[500px] overflow-y-auto">
                      {getAvailableProducts().length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <Package className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs">No hay productos</p>
                          <button
                            onClick={() => setProductFilter({ categoryId: '', search: '' })}
                            className="mt-1 text-xs text-blue-600 hover:underline"
                          >
                            Limpiar
                          </button>
                        </div>
                      ) : (
                        <div className="divide-y">
                          {getAvailableProducts().map((product) => {
                            const isAdded = formData.items.some(item => item.productId === product.id);
                            const isPerson = isPersonalProduct(product);
                            const isConsumable = (product as any).isConsumable;
                            const price = isConsumable ? (product as any).pricePerUnit : product.pricePerDay;
                            const unit = isPerson ? 'hora' : isConsumable ? 'unidad' : 'día';
                            
                            return (
                              <div key={product.id} className="flex items-center justify-between px-2 py-1 hover:bg-gray-50">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1">
                                    <span className={`inline-flex px-1 py-0.5 rounded text-xs font-bold ${
                                      isPerson ? 'bg-purple-600 text-white' : isConsumable ? 'bg-orange-600 text-white' : 'bg-green-600 text-white'
                                    }`}>
                                      {isPerson ? '👤' : isConsumable ? '🔥' : '📦'}
                                    </span>
                                    <span className="font-medium text-gray-900 text-xs truncate">{product.name}</span>
                                    <span className={`text-xs font-semibold ml-auto ${
                                      isPerson ? 'text-purple-700' : isConsumable ? 'text-orange-700' : 'text-green-700'
                                    }`}>
                                      €{price}/{unit}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => addProductToList(product.id)}
                                  disabled={isAdded}
                                  className={`px-2 py-0.5 rounded text-xs font-medium ml-2 ${
                                    isAdded
                                      ? 'bg-gray-200 text-gray-500'
                                      : 'bg-blue-600 text-white hover:bg-blue-700'
                                  }`}
                                >
                                  {isAdded ? '✓' : '+'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* DERECHA: Productos en el Pack (40%) */}
                  <div className="col-span-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-900">En el Pack</h3>
                      <span className="bg-green-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                        {formData.items.length}
                      </span>
                    </div>

                    {formData.items.length === 0 ? (
                      <div className="text-center py-6 text-gray-500 bg-gray-50 rounded border border-dashed border-gray-300">
                        <Package className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                        <p className="text-xs">Sin productos</p>
                      </div>
                    ) : (
                      <div className="bg-white border border-gray-300 rounded max-h-[500px] overflow-y-auto divide-y divide-gray-200">
                        {formData.items.map((item, index) => {
                          const product = products.find(p => p.id === item.productId);
                          if (!product) return null;
                          
                          const isPerson = isPersonalProduct(product);
                          const isConsumable = (product as any).isConsumable;
                          const effectiveQuantity = (item.numberOfPeople && item.hoursPerPerson)
                            ? item.numberOfPeople * item.hoursPerPerson
                            : item.quantity;
                          const unitPrice = isConsumable 
                            ? Number((product as any).pricePerUnit || 0)
                            : Number(product.pricePerDay || 0);
                          const subtotal = unitPrice * effectiveQuantity;
                          
                          return (
                            <div key={index} className="p-1.5">
                              {/* Header */}
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1">
                                    <span className={`inline-flex px-1 py-0.5 rounded text-xs font-bold ${
                                      isPerson ? 'bg-purple-600 text-white' : isConsumable ? 'bg-orange-600 text-white' : 'bg-green-600 text-white'
                                    }`}>
                                      {isPerson ? '👤' : isConsumable ? '🔥' : '📦'}
                                    </span>
                                    <span className="font-medium text-xs text-gray-900 truncate">{product.name}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className={`font-bold text-sm ${
                                    isPerson ? 'text-purple-700' : isConsumable ? 'text-orange-700' : 'text-green-700'
                                  }`}>
                                    €{subtotal.toFixed(2)}
                                  </div>
                                  <button onClick={() => removeProduct(index)} className="text-red-600 text-xs">🗑️</button>
                                </div>
                              </div>
                              
                              {/* Controles */}
                              {isPerson ? (
                                <div className="flex items-center gap-1 text-xs">
                                  <span className="text-gray-600">P:</span>
                                  <button onClick={() => updatePersonalDetails(index, Math.max(1, (item.numberOfPeople || 1) - 1), item.hoursPerPerson || 1)} className="px-1 py-0.5 bg-gray-200 hover:bg-gray-300 rounded">-</button>
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.numberOfPeople || 1}
                                    onChange={(e) => updatePersonalDetails(index, parseInt(e.target.value) || 1, item.hoursPerPerson || 1)}
                                    className="w-10 px-1 py-0.5 border border-gray-300 rounded text-xs text-center"
                                  />
                                  <button onClick={() => updatePersonalDetails(index, (item.numberOfPeople || 1) + 1, item.hoursPerPerson || 1)} className="px-1 py-0.5 bg-gray-200 hover:bg-gray-300 rounded">+</button>
                                  <span className="text-gray-600 ml-1">H:</span>
                                  <button onClick={() => updatePersonalDetails(index, item.numberOfPeople || 1, Math.max(0.5, (item.hoursPerPerson || 1) - 0.5))} className="px-1 py-0.5 bg-gray-200 hover:bg-gray-300 rounded">-</button>
                                  <input
                                    type="number"
                                    min="0.5"
                                    step="0.5"
                                    value={item.hoursPerPerson || 1}
                                    onChange={(e) => updatePersonalDetails(index, item.numberOfPeople || 1, parseFloat(e.target.value) || 1)}
                                    className="w-10 px-1 py-0.5 border border-gray-300 rounded text-xs text-center"
                                  />
                                  <button onClick={() => updatePersonalDetails(index, item.numberOfPeople || 1, (item.hoursPerPerson || 1) + 0.5)} className="px-1 py-0.5 bg-gray-200 hover:bg-gray-300 rounded">+</button>
                                  <span className="text-purple-700 font-medium ml-auto text-xs">=&nbsp;{effectiveQuantity.toFixed(1)}h</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-xs">
                                  <span className="text-gray-600">Cant:</span>
                                  <button onClick={() => updateQuantity(index, Math.max(1, item.quantity - 1))} className="px-1 py-0.5 bg-gray-200 hover:bg-gray-300 rounded">-</button>
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                                    className="w-10 px-1 py-0.5 border border-gray-300 rounded text-xs text-center"
                                  />
                                  <button onClick={() => updateQuantity(index, item.quantity + 1)} className="px-1 py-0.5 bg-gray-200 hover:bg-gray-300 rounded">+</button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Total */}
                    {formData.items.length > 0 && (() => {
                      const total = formData.items.reduce((sum, item) => {
                        const product = products.find(p => p.id === item.productId);
                        if (!product) return sum;
                        const isPerson = isPersonalProduct(product);
                        const isConsumable = (product as any).isConsumable;
                        const effectiveQuantity = (item.numberOfPeople && item.hoursPerPerson)
                          ? item.numberOfPeople * item.hoursPerPerson
                          : item.quantity;
                        const unitPrice = isConsumable 
                          ? Number((product as any).pricePerUnit || 0)
                          : Number(product.pricePerDay || 0);
                        return sum + (unitPrice * effectiveQuantity);
                      }, 0);
                      
                      return (
                        <div className="mt-2 pt-2 border-t border-gray-300 px-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xs text-gray-900">TOTAL:</span>
                            <span className="font-bold text-lg text-green-600">€{total.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })()}
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

                        {/* Precio Final */}
                        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-lg font-bold text-green-800">Precio Final</h4>
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
                            {/* Costes Detallados */}
                            <div className="border-t border-blue-200 pt-3 mt-2">
                              <div className="text-xs font-bold text-blue-800 mb-2 uppercase">Costes:</div>
                              <div className="space-y-1.5 text-sm">
                                {totals.costMaterial > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-blue-700">Total costes material:</span>
                                    <span className="font-medium text-blue-900">€{totals.costMaterial.toFixed(2)}</span>
                                  </div>
                                )}
                                {totals.costPersonal > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-blue-700">Total costes personal:</span>
                                    <span className="font-medium text-blue-900">€{totals.costPersonal.toFixed(2)}</span>
                                  </div>
                                )}
                                {totals.costShippingInstallation > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-blue-700">Total coste envío+montaje:</span>
                                    <span className="font-medium text-blue-900">€{totals.costShippingInstallation.toFixed(2)}</span>
                                  </div>
                                )}
                                {totals.costDepreciation > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-blue-700">Total coste amortización:</span>
                                    <span className="font-medium text-blue-900">€{totals.costDepreciation.toFixed(2)}</span>
                                  </div>
                                )}
                                {totals.transportCost > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-amber-700">🚚 Coste transporte:</span>
                                    <span className="font-medium text-amber-900">€{totals.transportCost.toFixed(2)}</span>
                                  </div>
                                )}
                                
                                <div className="border-t-2 border-blue-300 pt-2 mt-2">
                                  <div className="flex justify-between font-semibold">
                                    <span className="text-blue-800">Coste Total:</span>
                                    <span className="text-blue-900">€{totals.totalCost.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between font-semibold mt-2">
                                    <span className="text-blue-800">Precio Venta:</span>
                                    <span className="text-blue-900">€{totals.finalPrice.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs text-blue-600 mt-2 italic">
                                * Amortización: 5% del valor | Personal: coste/hora
                              </div>
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
                                ⚠️ Beneficio negativo: El precio de venta (€{totals.finalPrice.toFixed(2)}) es menor que los costes totales (€{totals.totalCost.toFixed(2)}). 
                                Aumenta el precio final o reduce costes.
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
                                💡 Tip: Añade el "Precio de Compra" a los productos para calcular costes:
                              </p>
                              <p className="text-xs text-yellow-600 mt-1">
                                • Personal: Coste por hora trabajada<br/>
                                • Material: Valor del equipo (se calcula 5% depreciación)
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Coste de Transporte */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <label className="block text-sm font-medium text-amber-900 mb-2">
                            🚚 Coste de Transporte e Instalación (€)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.transportCost}
                            onChange={(e) => setFormData({ ...formData, transportCost: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                            placeholder="Ej: 50.00"
                          />
                          <p className="text-xs text-amber-700 mt-2">
                            Coste manual del transporte e instalación para este montaje
                          </p>
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
                    {editingPack ? 'Actualizar Montaje' : 'Crear Montaje'}
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

export default MontajesManager;
