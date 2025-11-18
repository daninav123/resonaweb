import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, AlertTriangle, Plus, Minus, History, Search, Filter } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import moment from 'moment';

interface Product {
  id: string;
  name: string;
  sku: string;
  realStock: number;
  availableStock: number;
  stockStatus: string;
  category: {
    name: string;
  };
  leadTimeDays: number;
  markedForPurchase: boolean;
  purchasePriority: number | null;
}

interface StockMovement {
  id: string;
  productId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}

const StockManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [stockHistory, setStockHistory] = useState<StockMovement[]>([]);
  
  const [adjustmentData, setAdjustmentData] = useState({
    quantity: 0,
    type: 'IN' as 'IN' | 'OUT' | 'ADJUSTMENT',
    reason: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response: any = await api.get('/products');
      setProducts(response.products || []);
    } catch (error) {
      toast.error('Error al cargar productos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async () => {
    if (!selectedProduct) return;
    
    try {
      let newStock = selectedProduct.realStock;
      
      if (adjustmentData.type === 'IN') {
        newStock += adjustmentData.quantity;
      } else if (adjustmentData.type === 'OUT') {
        newStock -= adjustmentData.quantity;
      } else {
        newStock = adjustmentData.quantity;
      }

      await api.put(`/products/${selectedProduct.id}`, {
        realStock: newStock,
        availableStock: newStock
      });

      toast.success('Stock actualizado');
      setShowAdjustModal(false);
      resetAdjustmentForm();
      loadProducts();
    } catch (error) {
      toast.error('Error al ajustar stock');
      console.error(error);
    }
  };

  const loadStockHistory = async (productId: string) => {
    try {
      // Por ahora simularemos el historial
      const mockHistory: StockMovement[] = [
        {
          id: '1',
          productId,
          type: 'IN',
          quantity: 10,
          reason: 'Compra inicial',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          user: { firstName: 'Admin', lastName: 'User' }
        },
        {
          id: '2',
          productId,
          type: 'OUT',
          quantity: 3,
          reason: 'Pedido #RES-2025-0001',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          user: { firstName: 'Sistema', lastName: '' }
        }
      ];
      setStockHistory(mockHistory);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const resetAdjustmentForm = () => {
    setAdjustmentData({
      quantity: 0,
      type: 'IN',
      reason: ''
    });
    setSelectedProduct(null);
  };

  const openAdjustModal = (product: Product) => {
    setSelectedProduct(product);
    setShowAdjustModal(true);
  };

  const openHistoryModal = async (product: Product) => {
    setSelectedProduct(product);
    await loadStockHistory(product.id);
    setShowHistoryModal(true);
  };

  const togglePurchasePriority = async (product: Product) => {
    try {
      await api.put(`/products/${product.id}`, {
        markedForPurchase: !product.markedForPurchase,
        purchasePriority: !product.markedForPurchase ? 1 : null
      });
      toast.success(product.markedForPurchase ? 'Desmarcado para compra' : 'Marcado para compra');
      loadProducts();
    } catch (error) {
      toast.error('Error al actualizar prioridad');
    }
  };

  const getStockStatusColor = (stock: number) => {
    if (stock === 0) return 'text-red-600 bg-red-50';
    if (stock <= 5) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getStockStatusLabel = (stock: number) => {
    if (stock === 0) return 'Sin Stock';
    if (stock <= 5) return 'Stock Bajo';
    return 'Disponible';
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterLowStock || product.realStock <= 5;
    return matchesSearch && matchesFilter;
  });

  const lowStockCount = products.filter(p => p.realStock <= 5).length;
  const outOfStockCount = products.filter(p => p.realStock === 0).length;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/admin" className="text-resona hover:text-resona-dark mb-4 inline-block">
            ← Volver al Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Stock</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Productos</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stock Total</p>
                <p className="text-2xl font-bold">
                  {products.reduce((sum, p) => sum + p.realStock, 0)}
                </p>
              </div>
              <Package className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stock Bajo</p>
                <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sin Stock</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar producto o SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-full"
                />
              </div>
            </div>
            <button
              onClick={() => setFilterLowStock(!filterLowStock)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                filterLowStock 
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-300' 
                  : 'bg-white border text-gray-700'
              } border`}
            >
              <Filter className="w-4 h-4" />
              Stock Bajo
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stock Real
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Disponible
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      Cargando...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      No se encontraron productos
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{product.sku}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{product.category?.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold ${
                          product.realStock === 0 ? 'text-red-600' :
                          product.realStock <= 5 ? 'text-yellow-600' :
                          'text-gray-900'
                        }`}>
                          {product.realStock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{product.availableStock}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStockStatusColor(product.realStock)}`}>
                          {getStockStatusLabel(product.realStock)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {product.markedForPurchase ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                            Prioridad {product.purchasePriority}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openAdjustModal(product)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ajustar Stock"
                          >
                            <Package className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openHistoryModal(product)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Ver Historial"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => togglePurchasePriority(product)}
                            className={`${
                              product.markedForPurchase 
                                ? 'text-purple-600' 
                                : 'text-gray-400 hover:text-purple-600'
                            }`}
                            title="Marcar para Compra"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Adjust Stock Modal */}
        {showAdjustModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">Ajustar Stock</h2>
                <p className="text-sm text-gray-600">{selectedProduct.name}</p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Stock Actual</label>
                  <p className="text-2xl font-bold text-gray-900">{selectedProduct.realStock}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Ajuste</label>
                  <select
                    value={adjustmentData.type}
                    onChange={(e) => setAdjustmentData({ ...adjustmentData, type: e.target.value as any })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="IN">Entrada (+)</option>
                    <option value="OUT">Salida (-)</option>
                    <option value="ADJUSTMENT">Ajuste Absoluto (=)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {adjustmentData.type === 'ADJUSTMENT' ? 'Nuevo Stock' : 'Cantidad'}
                  </label>
                  <input
                    type="number"
                    value={adjustmentData.quantity}
                    onChange={(e) => setAdjustmentData({ ...adjustmentData, quantity: Number(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Razón</label>
                  <input
                    type="text"
                    value={adjustmentData.reason}
                    onChange={(e) => setAdjustmentData({ ...adjustmentData, reason: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Ej: Compra, Devolución, Ajuste de inventario..."
                  />
                </div>

                {adjustmentData.type !== 'ADJUSTMENT' && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Nuevo stock: {' '}
                      <span className="font-bold">
                        {adjustmentData.type === 'IN' 
                          ? selectedProduct.realStock + adjustmentData.quantity
                          : Math.max(0, selectedProduct.realStock - adjustmentData.quantity)}
                      </span>
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowAdjustModal(false);
                      resetAdjustmentForm();
                    }}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAdjustStock}
                    className="flex-1 px-4 py-2 bg-resona text-white rounded-lg hover:bg-resona-dark"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Modal */}
        {showHistoryModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b sticky top-0 bg-white">
                <h2 className="text-xl font-bold">Historial de Stock</h2>
                <p className="text-sm text-gray-600">{selectedProduct.name}</p>
              </div>

              <div className="p-6">
                {stockHistory.length === 0 ? (
                  <p className="text-center text-gray-500">No hay movimientos registrados</p>
                ) : (
                  <div className="space-y-3">
                    {stockHistory.map((movement) => (
                      <div key={movement.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {movement.type === 'IN' ? (
                              <Plus className="w-4 h-4 text-green-600" />
                            ) : movement.type === 'OUT' ? (
                              <Minus className="w-4 h-4 text-red-600" />
                            ) : (
                              <Package className="w-4 h-4 text-blue-600" />
                            )}
                            <span className={`font-bold ${
                              movement.type === 'IN' ? 'text-green-600' :
                              movement.type === 'OUT' ? 'text-red-600' :
                              'text-blue-600'
                            }`}>
                              {movement.type === 'IN' ? '+' : movement.type === 'OUT' ? '-' : '='}{movement.quantity}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {moment(movement.createdAt).format('DD/MM/YYYY HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{movement.reason}</p>
                        {movement.user && (
                          <p className="text-xs text-gray-400 mt-1">
                            Por: {movement.user.firstName} {movement.user.lastName}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => {
                    setShowHistoryModal(false);
                    setSelectedProduct(null);
                    setStockHistory([]);
                  }}
                  className="w-full mt-6 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockManager;
