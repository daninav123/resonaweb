import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface OnDemandProduct {
  id: string;
  name: string;
  sku: string;
  realStock: number;
  stock: number;
  leadTimeDays: number;
  markedForPurchase: boolean;
  purchaseNotes?: string;
  purchasePriority?: number;
  pricePerDay: number;
  upcomingReservations?: Array<{
    id: string;
    startDate: string;
    endDate: string;
    customerName: string;
    total: number;
    daysUntilReservation: number;
  }>;
}

const OnDemandDashboard = () => {
  const [products, setProducts] = useState<OnDemandProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOnDemand: 0,
    withReservations: 0,
    markedForPurchase: 0,
    totalInvestment: 0,
  });

  useEffect(() => {
    loadOnDemandProducts();
  }, []);

  const loadOnDemandProducts = async () => {
    try {
      setLoading(true);
      const response: any = await api.get('/products', {
        params: {
          stockStatus: 'ON_DEMAND',
          limit: 100
        }
      });
      
      const productsData = response?.data?.data || response?.data || [];
      
      setProducts(productsData);
      
      // Calcular estadísticas
      const totalInvestment = productsData.reduce((sum: number, p: OnDemandProduct) => {
        // Estimar inversión basada en precio por día * 30
        return sum + (p.pricePerDay * 30);
      }, 0);
      
      setStats({
        totalOnDemand: productsData.length,
        withReservations: productsData.filter((p: OnDemandProduct) => 
          p.upcomingReservations && p.upcomingReservations.length > 0
        ).length,
        markedForPurchase: productsData.filter((p: OnDemandProduct) => 
          p.markedForPurchase
        ).length,
        totalInvestment,
      });
    } catch (error: any) {
      console.error('Error cargando productos bajo demanda:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const markAsPurchased = async (productId: string) => {
    try {
      await api.put(`/products/${productId}`, {
        realStock: 1,
        stockStatus: 'IN_STOCK',
        markedForPurchase: false,
      });
      toast.success('Producto marcado como comprado');
      loadOnDemandProducts();
    } catch (error: any) {
      toast.error('Error al actualizar producto');
    }
  };

  const togglePurchaseMark = async (productId: string, currentValue: boolean) => {
    try {
      await api.put(`/products/${productId}`, {
        markedForPurchase: !currentValue,
      });
      toast.success(!currentValue ? 'Marcado para compra' : 'Desmarcado');
      loadOnDemandProducts();
    } catch (error: any) {
      toast.error('Error al actualizar producto');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-resona"></div>
      </div>
    );
  }

  const productsWithReservations = products.filter(p => 
    p.upcomingReservations && p.upcomingReservations.length > 0
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/admin" className="text-resona hover:text-resona-dark mb-4 inline-block">
            ← Volver al Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Catálogo Virtual</h1>
              <p className="text-gray-600 mt-2">Gestión de productos bajo demanda</p>
            </div>
            <Link
              to="/admin/products"
              className="bg-resona text-white px-4 py-2 rounded-lg hover:bg-resona-dark transition-colors"
            >
              Ver Todos los Productos
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Productos Virtuales</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOnDemand}</p>
              </div>
              <Package className="w-10 h-10 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Con Reservas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.withReservations}</p>
              </div>
              <ShoppingCart className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes Compra</p>
                <p className="text-2xl font-bold text-gray-900">{stats.markedForPurchase}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-orange-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inversión Estimada</p>
                <p className="text-2xl font-bold text-gray-900">€{stats.totalInvestment}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500" />
            </div>
          </div>
        </div>

        {/* Productos con Reservas URGENTES */}
        {productsWithReservations.length > 0 && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-6 mb-8 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-orange-500 mr-3 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-900 mb-4">
                  ⚠️ Productos con Reservas Activas - Acción Requerida
                </h3>
                
                <div className="space-y-4">
                  {productsWithReservations.map(product => (
                    <div key={product.id} className="bg-white p-4 rounded-lg border border-orange-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{product.name}</h4>
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              {product.leadTimeDays} días lead time
                            </span>
                          </div>
                          
                          {product.upcomingReservations?.map((reservation, idx) => (
                            <div key={idx} className="mt-2 p-3 bg-gray-50 rounded">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-900">
                                    <span className="font-medium">Cliente:</span> {reservation.customerName}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Fechas:</span>{' '}
                                    {new Date(reservation.startDate).toLocaleDateString('es-ES')} -{' '}
                                    {new Date(reservation.endDate).toLocaleDateString('es-ES')}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Total:</span> €{reservation.total}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className={`text-2xl font-bold ${
                                    reservation.daysUntilReservation <= 7 ? 'text-red-600' :
                                    reservation.daysUntilReservation <= 15 ? 'text-orange-600' :
                                    'text-green-600'
                                  }`}>
                                    {reservation.daysUntilReservation}
                                  </div>
                                  <p className="text-xs text-gray-500">días restantes</p>
                                </div>
                              </div>
                            </div>
                          ))}

                          {product.purchaseNotes && (
                            <div className="mt-2 text-sm text-gray-600">
                              <span className="font-medium">Notas:</span> {product.purchaseNotes}
                            </div>
                          )}
                        </div>

                        <div className="ml-4 flex flex-col gap-2">
                          <button
                            onClick={() => markAsPurchased(product.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Ya Comprado
                          </button>
                          <button
                            onClick={() => togglePurchaseMark(product.id, product.markedForPurchase)}
                            className={`px-4 py-2 rounded transition-colors text-sm ${
                              product.markedForPurchase
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {product.markedForPurchase ? '⭐ Marcado' : 'Marcar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Todos los Productos Bajo Demanda */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Todos los Productos Bajo Demanda ({products.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Lead Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Precio/Día
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No hay productos bajo demanda configurados
                    </td>
                  </tr>
                ) : (
                  products.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.sku}</div>
                          {product.purchaseNotes && (
                            <div className="text-xs text-gray-400 mt-1 italic">
                              {product.purchaseNotes.substring(0, 50)}...
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <span className={`font-medium ${
                            product.realStock === 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            Real: {product.realStock}
                          </span>
                          <span className="text-gray-500 ml-2">
                            / Mostrado: {product.stock}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {product.leadTimeDays} días
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        €{product.pricePerDay}/día
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {product.markedForPurchase && (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              ⭐ Comprar
                            </span>
                          )}
                          {product.upcomingReservations && product.upcomingReservations.length > 0 ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                              {product.upcomingReservations.length} reserva(s)
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              Sin reservas
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/admin/products/${product.id}`}
                          className="text-resona hover:text-resona-dark text-sm font-medium"
                        >
                          Ver Detalles →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Package className="w-6 h-6 text-blue-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-900">
                ℹ️ Sobre el Catálogo Virtual
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Productos con <strong>Stock Real = 0</strong> no están en tu inventario físico</li>
                  <li>Los clientes solo pueden reservar con <strong>{products[0]?.leadTimeDays || 30} días de anticipación</strong></li>
                  <li>Cuando hay una reserva, tienes ese tiempo para comprar el producto</li>
                  <li>Una vez comprado, actualiza el <strong>Stock Real a 1+</strong> para disponibilidad inmediata</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnDemandDashboard;
