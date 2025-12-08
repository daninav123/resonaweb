import { useState, useEffect } from 'react';
import { Calendar, Edit, Save, X, TrendingUp } from 'lucide-react';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  realCost: number;
  profit: number;
  margin: number;
  status: string;
}

const ContabilidadAlquileres = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{realCost: number}>({realCost: 0});
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadOrders();
  }, [filterStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response: any = await api.get('/contabilidad/alquileres', {
        params: { status: filterStatus !== 'all' ? filterStatus : undefined }
      });
      setOrders(response);
    } catch (error) {
      console.error('Error cargando alquileres:', error);
      toast.error('Error al cargar alquileres');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (order: Order) => {
    setEditingId(order.id);
    setEditValues({ realCost: order.realCost });
  };

  const handleSave = async (orderId: string) => {
    try {
      await api.put(`/contabilidad/alquileres/${orderId}/gastos`, editValues);
      toast.success('Gastos actualizados');
      setEditingId(null);
      loadOrders();
    } catch (error) {
      console.error('Error actualizando gastos:', error);
      toast.error('Error al actualizar gastos');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const totalIngresos = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalGastos = orders.reduce((sum, o) => sum + o.realCost, 0);
  const totalBeneficio = totalIngresos - totalGastos;
  const margenGlobal = totalIngresos > 0 ? (totalBeneficio / totalIngresos) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header con stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Total Alquileres</p>
          <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow-md p-4">
          <p className="text-sm text-green-700">Ingresos Totales</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIngresos)}</p>
        </div>
        <div className="bg-red-50 rounded-lg shadow-md p-4">
          <p className="text-sm text-red-700">Gastos Totales</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalGastos)}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow-md p-4">
          <p className="text-sm text-blue-700">Beneficio Neto</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalBeneficio)}</p>
          <p className="text-xs text-blue-500 mt-1">Margen: {margenGlobal.toFixed(1)}%</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {['all', 'COMPLETED', 'IN_PROGRESS', 'PENDING'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === status
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status === 'all' ? 'Todos' : status}
          </button>
        ))}
      </div>

      {/* Tabla de alquileres */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedido</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fechas</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gastos Reales</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beneficio</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Margen</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    #{order.orderNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{order.customerName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(order.startDate)} - {formatDate(order.endDate)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-green-600">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {editingId === order.id ? (
                      <input
                        type="number"
                        value={editValues.realCost}
                        onChange={(e) => setEditValues({realCost: parseFloat(e.target.value) || 0})}
                        className="w-24 px-2 py-1 border rounded"
                        step="0.01"
                      />
                    ) : (
                      <span className="font-semibold text-red-600">
                        {formatCurrency(order.realCost)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                    {formatCurrency(order.totalAmount - (editingId === order.id ? editValues.realCost : order.realCost))}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`font-bold ${
                      order.margin >= 30 ? 'text-green-600' :
                      order.margin >= 15 ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {order.margin.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {editingId === order.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(order.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(order)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContabilidadAlquileres;
