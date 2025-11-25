import { useState, useEffect } from 'react';
import { AlertTriangle, ShoppingCart, Package, TrendingUp } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function StockAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalAlerts: 0, highPriority: 0, totalDeficit: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      console.log('🔍 Cargando alertas de stock...');
      const res = await api.get('/stock-alerts') as any;
      console.log('📦 Respuesta completa:', res);
      console.log('📊 Alerts:', res?.alerts);
      console.log('📊 Summary:', res?.summary);
      
      // api.get ya devuelve response.data, no response
      setAlerts(res?.alerts || []);
      setSummary(res?.summary || { totalAlerts: 0, highPriority: 0, totalDeficit: 0 });
      
      console.log(`✅ ${res?.alerts?.length || 0} alertas cargadas`);
    } catch (error: any) {
      console.error('❌ Error cargando alertas:', error);
      console.error('❌ Error response:', error?.response);
      toast.error('Error al cargar alertas');
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = filter === 'all' ? alerts : alerts.filter(a => a.priority === filter);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-resona"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold">🚨 Alertas de Stock</h1>
            <p className="text-gray-600 mt-1">Necesidades de compra para cubrir pedidos</p>
          </div>
          <button
            onClick={() => {
              setLoading(true);
              fetchAlerts();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-resona text-white rounded-lg hover:bg-resona-dark transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>
        <div className="mb-8"></div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Total Alertas</p>
                <p className="text-2xl font-bold">{summary.totalAlerts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Alta Prioridad</p>
                <p className="text-2xl font-bold text-red-600">{summary.highPriority}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Faltantes</p>
                <p className="text-2xl font-bold text-blue-600">{summary.totalDeficit}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex gap-2">
            <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-resona text-white' : 'bg-gray-100'}`}>
              Todas
            </button>
            <button onClick={() => setFilter('high')} className={`px-4 py-2 rounded ${filter === 'high' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}>
              Alta
            </button>
            <button onClick={() => setFilter('medium')} className={`px-4 py-2 rounded ${filter === 'medium' ? 'bg-yellow-600 text-white' : 'bg-gray-100'}`}>
              Media
            </button>
            <button onClick={() => setFilter('low')} className={`px-4 py-2 rounded ${filter === 'low' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
              Baja
            </button>
          </div>
        </div>

        {/* Alerts */}
        {filteredAlerts.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sin alertas</h3>
            <p className="text-gray-600">El stock actual cubre todos los pedidos</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert, i) => (
              <div key={i} className={`bg-white p-6 rounded-lg shadow border-l-4 ${
                alert.priority === 'high' ? 'border-red-500' : alert.priority === 'medium' ? 'border-yellow-500' : 'border-blue-500'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{alert.productName}</h3>
                    <p className="text-sm text-gray-600">SKU: {alert.sku}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    alert.priority === 'high' ? 'bg-red-100 text-red-700' : 
                    alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {alert.priority === 'high' ? 'Alta' : alert.priority === 'medium' ? 'Media' : 'Baja'}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600">Pedido</p>
                    <p className="font-semibold">{alert.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Fecha</p>
                    <p className="font-semibold">{format(new Date(alert.startDate), 'dd/MM/yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Disponible</p>
                    <p className="font-semibold">{alert.availableStock} uds</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Solicitado</p>
                    <p className="font-semibold">{alert.quantityRequested} uds</p>
                  </div>
                </div>

                <div className={`p-4 rounded ${
                  alert.priority === 'high' ? 'bg-red-50' : alert.priority === 'medium' ? 'bg-yellow-50' : 'bg-blue-50'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingCart className="w-5 h-5" />
                    <span className="font-semibold">Necesitas comprar: {alert.deficit} unidades</span>
                  </div>
                  {alert.affectedOrders && alert.affectedOrders.length > 1 && (
                    <div className="text-sm text-gray-600 mt-2">
                      <strong>Pedidos afectados:</strong> {alert.affectedOrders.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
