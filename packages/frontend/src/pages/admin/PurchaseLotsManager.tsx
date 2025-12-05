import { useState, useEffect } from 'react';
import { Plus, Package, Calendar, Euro, FileText, User, Edit2, Trash2, ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../services/api';

const PurchaseLotsManager = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [lots, setLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
    unitPrice: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    supplier: '',
    invoiceNumber: '',
    notes: '',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response: any = await api.get('/products?limit=1000');
      
      // Parsear la respuesta correctamente
      let prods = [];
      if (Array.isArray(response)) {
        prods = response;
      } else if (response?.products && Array.isArray(response.products)) {
        prods = response.products;
      } else if (response?.data && Array.isArray(response.data)) {
        prods = response.data;
      }
      
      console.log('Productos cargados:', prods.length);
      
      // Filtrar solo productos con precio de compra (excluir packs)
      const productsWithPurchase = prods.filter((p: any) => 
        !p.isPack && p.purchasePrice && p.isActive
      );
      
      console.log('Productos con precio de compra:', productsWithPurchase.length);
      
      setProducts(productsWithPurchase);
      
      // Cargar todos los lotes de todos los productos
      await loadAllLots();
    } catch (error) {
      console.error('Error cargando productos:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const loadAllLots = async () => {
    try {
      const response: any = await api.get('/product-purchases');
      const allLots = Array.isArray(response) ? response : response?.data || [];
      console.log('Lotes cargados:', allLots.length);
      setLots(allLots);
    } catch (error) {
      console.error('Error cargando lotes:', error);
      // No mostrar error si falla, solo continuar
    }
  };

  const loadProductLots = async (productId: string) => {
    try {
      const response: any = await api.get(`/product-purchases/product/${productId}`);
      setLots(response || []);
    } catch (error) {
      console.error('Error cargando lotes:', error);
      toast.error('Error al cargar lotes del producto');
    }
  };

  const handleSelectProduct = async (product: any) => {
    setSelectedProduct(product);
    await loadProductLots(product.id);
    setExpandedProduct(product.id);
  };

  const handleCreate = (product?: any) => {
    if (product) {
      setFormData({
        productId: product.id,
        quantity: 1,
        unitPrice: Number(product.purchasePrice || 0),
        purchaseDate: new Date().toISOString().split('T')[0],
        supplier: '',
        invoiceNumber: '',
        notes: '',
      });
    } else {
      setFormData({
        productId: '',
        quantity: 1,
        unitPrice: 0,
        purchaseDate: new Date().toISOString().split('T')[0],
        supplier: '',
        invoiceNumber: '',
        notes: '',
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.productId || !formData.quantity || !formData.unitPrice) {
        toast.error('Completa los campos requeridos');
        return;
      }

      console.log('📝 Enviando lote de compra:', {
        ...formData,
        quantity: Number(formData.quantity),
        unitPrice: Number(formData.unitPrice),
      });

      const response = await api.post('/product-purchases', {
        ...formData,
        quantity: Number(formData.quantity),
        unitPrice: Number(formData.unitPrice),
      });

      console.log('✅ Respuesta del servidor:', response);

      toast.success('Lote de compra creado exitosamente');
      setShowModal(false);
      setFormData({
        productId: '',
        quantity: 1,
        unitPrice: 0,
        purchaseDate: new Date().toISOString().split('T')[0],
        supplier: '',
        invoiceNumber: '',
        notes: '',
      });
      
      // Recargar lotes si hay un producto seleccionado
      if (selectedProduct) {
        await loadProductLots(selectedProduct.id);
      }
    } catch (error: any) {
      console.error('❌ Error creando lote:', error);
      console.error('Detalles del error:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.response?.data?.error,
        fullError: error.response?.data,
      });
      toast.error(error.response?.data?.message || error.message || 'Error al crear lote');
    }
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
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link to="/admin" className="text-resona hover:text-resona-dark mb-4 inline-block">
            ← Volver al Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-8 h-8 text-resona" />
                Gestión de Lotes de Compra
              </h1>
              <p className="text-gray-600 mt-1">
                Registra cada compra como un lote independiente para seguimiento preciso de amortización
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Productos con Compras</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lotes Totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.reduce((sum, p) => sum + (p.purchases?.length || 0), 0)}
                </p>
              </div>
              <FileText className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <button
              onClick={() => handleCreate()}
              className="w-full bg-resona text-white px-4 py-3 rounded-lg hover:bg-resona-dark transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Registrar Nueva Compra
            </button>
          </div>
        </div>

        {/* Grid de Lotes por Producto */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Lotes de Compra</h2>
            <div className="relative w-80">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por producto, SKU, proveedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-resona"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          
          {products.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No hay productos con precio de compra</p>
            </div>
          ) : (
            <div className="space-y-8">
              {products.map((product) => {
                const productLots = lots.filter((lot: any) => lot.productId === product.id);
                
                // Filtrar lotes según búsqueda
                const filteredLots = productLots.filter((lot: any) => {
                  const searchLower = searchTerm.toLowerCase();
                  return (
                    product.name.toLowerCase().includes(searchLower) ||
                    product.sku.toLowerCase().includes(searchLower) ||
                    (lot.supplier && lot.supplier.toLowerCase().includes(searchLower)) ||
                    (lot.invoiceNumber && lot.invoiceNumber.toLowerCase().includes(searchLower))
                  );
                });
                
                // No mostrar producto si no hay lotes que coincidan con la búsqueda
                if (searchTerm && filteredLots.length === 0) {
                  return null;
                }
                
                return (
                  <div key={product.id}>
                    {/* Header del Producto */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-resona/10 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-resona" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-500">{product.sku} • Stock: {product.stock} unidades</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCreate(product)}
                        className="px-4 py-2 bg-resona text-white rounded-lg hover:bg-resona-dark transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Nueva Compra
                      </button>
                    </div>

                    {/* Grid de Tarjetas de Lotes */}
                    {productLots.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No hay lotes registrados para este producto</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredLots.map((lot: any, index: number) => {
                          const totalCost = Number(lot.totalCost);
                          const totalGenerated = Number(lot.totalGenerated);
                          const amortizationPercentage = totalCost > 0 
                            ? Math.min((totalGenerated / totalCost) * 100, 100)
                            : 0;
                          const isAmortized = totalGenerated >= totalCost;
                          const remaining = totalCost - totalGenerated;
                          
                          return (
                            <div
                              key={lot.id}
                              className={`rounded-lg p-4 border-2 ${
                                isAmortized 
                                  ? 'bg-green-50 border-green-200' 
                                  : 'bg-white border-gray-200'
                              }`}
                            >
                              {/* Encabezado */}
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-bold text-gray-900">
                                    {product.name}
                                  </h4>
                                  <p className="text-xs text-gray-500">
                                    {new Date(lot.purchaseDate).toLocaleDateString('es-ES')}
                                  </p>
                                </div>
                                {isAmortized && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                    ✓ Amortizado
                                  </span>
                                )}
                              </div>

                              {/* Información Principal */}
                              <div className="space-y-2 mb-3 pb-3 border-b">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Precio Compra:</span>
                                  <span className="font-bold text-gray-900">€{totalCost.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Generado:</span>
                                  <span className="font-bold text-blue-600">€{totalGenerated.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    {isAmortized ? 'Beneficio:' : 'Falta:'}
                                  </span>
                                  <span className={`font-bold ${isAmortized ? 'text-green-600' : 'text-red-600'}`}>
                                    {isAmortized ? '+' : '-'}€{Math.abs(remaining).toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              {/* Barra de Amortización */}
                              <div className="mb-3">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-600">Amortización</span>
                                  <span className="font-bold">{amortizationPercentage.toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all ${
                                      isAmortized
                                        ? 'bg-green-500'
                                        : amortizationPercentage > 50
                                        ? 'bg-yellow-500'
                                        : 'bg-red-500'
                                    }`}
                                    style={{ width: `${Math.min(amortizationPercentage, 100)}%` }}
                                  />
                                </div>
                              </div>

                              {/* Detalles */}
                              <div className="text-xs text-gray-600 space-y-1">
                                <p>
                                  <span className="font-medium">Cantidad:</span> {lot.quantity} unidades
                                </p>
                                <p>
                                  <span className="font-medium">Precio Unit:</span> €{Number(lot.unitPrice).toLocaleString()}
                                </p>
                                {lot.supplier && (
                                  <p>
                                    <span className="font-medium">Proveedor:</span> {lot.supplier}
                                  </p>
                                )}
                                {lot.invoiceNumber && (
                                  <p>
                                    <span className="font-medium">Factura:</span> {lot.invoiceNumber}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal de Crear Lote */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Registrar Nueva Compra</h2>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                    <Plus className="w-6 h-6 rotate-45" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Producto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Producto <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.productId}
                      onChange={(e) => {
                        const product = products.find(p => p.id === e.target.value);
                        setFormData({
                          ...formData,
                          productId: e.target.value,
                          unitPrice: product ? Number(product.purchasePrice || 0) : 0,
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                    >
                      <option value="">Seleccionar producto...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) - Último precio: €{Number(p.purchasePrice).toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Cantidad */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cantidad <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                      />
                    </div>

                    {/* Precio Unitario */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precio Unitario (€) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.unitPrice}
                        onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                      />
                    </div>
                  </div>

                  {/* Coste Total Calculado */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-900 font-medium">
                      Coste Total: €{(formData.quantity * formData.unitPrice).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  {/* Fecha de Compra */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Compra
                    </label>
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Proveedor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Proveedor
                      </label>
                      <input
                        type="text"
                        value={formData.supplier}
                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                        placeholder="Nombre del proveedor"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                      />
                    </div>

                    {/* Número de Factura */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nº Factura
                      </label>
                      <input
                        type="text"
                        value={formData.invoiceNumber}
                        onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                        placeholder="FAC-2024-001"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                      />
                    </div>
                  </div>

                  {/* Notas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Notas adicionales sobre esta compra..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                    />
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-6 py-3 bg-resona text-white rounded-lg hover:bg-resona-dark"
                  >
                    Registrar Compra
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseLotsManager;
