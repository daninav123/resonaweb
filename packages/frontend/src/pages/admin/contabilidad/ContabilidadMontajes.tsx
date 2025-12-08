import { useState, useEffect } from 'react';
import { Wrench, Edit, Save, X, Calendar } from 'lucide-react';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';

interface Montaje {
  id: string;
  name: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  date: string;
  estimatedCost: number;
  realCost: number;
  price: number;
  profit: number;
  margin: number;
}

const ContabilidadMontajes = () => {
  const [montajes, setMontajes] = useState<Montaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{realCost: number}>({realCost: 0});

  useEffect(() => {
    loadMontajes();
  }, []);

  const loadMontajes = async () => {
    try {
      setLoading(true);
      const response: any = await api.get('/contabilidad/montajes');
      setMontajes(response);
    } catch (error) {
      console.error('Error cargando montajes:', error);
      toast.error('Error al cargar montajes');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (montaje: Montaje) => {
    setEditingId(montaje.id);
    setEditValues({ realCost: montaje.realCost });
  };

  const handleSave = async (montajeId: string) => {
    try {
      await api.put(`/contabilidad/montajes/${montajeId}/gastos`, editValues);
      toast.success('Gastos de montaje actualizados');
      setEditingId(null);
      loadMontajes();
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const totalEstimado = montajes.reduce((sum, m) => sum + m.estimatedCost, 0);
  const totalReal = montajes.reduce((sum, m) => sum + m.realCost, 0);
  const totalIngresos = montajes.reduce((sum, m) => sum + m.price, 0);
  const totalBeneficio = totalIngresos - totalReal;
  const desviacion = totalReal - totalEstimado;

  return (
    <div className="space-y-6">
      {/* Header con stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Total Montajes</p>
          <p className="text-2xl font-bold text-gray-900">{montajes.length}</p>
        </div>
        <div className="bg-purple-50 rounded-lg shadow-md p-4">
          <p className="text-sm text-purple-700">Coste Estimado</p>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalEstimado)}</p>
        </div>
        <div className="bg-red-50 rounded-lg shadow-md p-4">
          <p className="text-sm text-red-700">Coste Real</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalReal)}</p>
          <p className={`text-xs mt-1 ${desviacion > 0 ? 'text-red-500' : 'text-green-500'}`}>
            {desviacion > 0 ? '+' : ''}{formatCurrency(desviacion)} vs estimado
          </p>
        </div>
        <div className="bg-green-50 rounded-lg shadow-md p-4">
          <p className="text-sm text-green-700">Ingresos</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIngresos)}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow-md p-4">
          <p className="text-sm text-blue-700">Beneficio</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalBeneficio)}</p>
        </div>
      </div>

      {/* Tabla de montajes */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-purple-50 px-6 py-4 border-b border-purple-200">
          <h3 className="text-lg font-semibold text-purple-900 flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Gestión de Costes de Montajes
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montaje</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedido</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coste Estimado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coste Real</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beneficio</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Margen</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {montajes.map((montaje) => {
                const currentRealCost = editingId === montaje.id ? editValues.realCost : montaje.realCost;
                const currentProfit = montaje.price - currentRealCost;
                const currentMargin = montaje.price > 0 ? (currentProfit / montaje.price) * 100 : 0;
                const desviacionItem = currentRealCost - montaje.estimatedCost;

                return (
                  <tr key={montaje.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {montaje.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      #{montaje.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{montaje.customerName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(montaje.date)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-purple-600">
                      {formatCurrency(montaje.estimatedCost)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {editingId === montaje.id ? (
                        <div className="space-y-1">
                          <input
                            type="number"
                            value={editValues.realCost}
                            onChange={(e) => setEditValues({realCost: parseFloat(e.target.value) || 0})}
                            className="w-24 px-2 py-1 border rounded"
                            step="0.01"
                          />
                          <p className={`text-xs ${desviacionItem > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {desviacionItem > 0 ? '+' : ''}{formatCurrency(desviacionItem)}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="font-semibold text-red-600">
                            {formatCurrency(montaje.realCost)}
                          </span>
                          <p className={`text-xs ${desviacionItem > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {desviacionItem > 0 ? '+' : ''}{formatCurrency(desviacionItem)}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">
                      {formatCurrency(montaje.price)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                      {formatCurrency(currentProfit)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`font-bold ${
                        currentMargin >= 30 ? 'text-green-600' :
                        currentMargin >= 15 ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {currentMargin.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {editingId === montaje.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave(montaje.id)}
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
                          onClick={() => handleEdit(montaje)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContabilidadMontajes;
