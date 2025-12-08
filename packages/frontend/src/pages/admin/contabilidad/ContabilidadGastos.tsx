import { useState, useEffect } from 'react';
import { DollarSign, Plus, Edit, Save, X, Trash2 } from 'lucide-react';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';

interface Gasto {
  id: string;
  concept: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
}

const CATEGORIAS_GASTO = [
  'Transporte',
  'Personal',
  'Mantenimiento',
  'Marketing',
  'Oficina',
  'Servicios',
  'Varios'
];

const ContabilidadGastos = () => {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Gasto>>({
    concept: '',
    amount: 0,
    category: 'Varios',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    loadGastos();
  }, [filterCategory]);

  const loadGastos = async () => {
    try {
      setLoading(true);
      const response: any = await api.get('/contabilidad/gastos', {
        params: { category: filterCategory !== 'all' ? filterCategory : undefined }
      });
      setGastos(response);
    } catch (error) {
      console.error('Error cargando gastos:', error);
      toast.error('Error al cargar gastos');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.concept || !formData.amount) {
        toast.error('Completa todos los campos obligatorios');
        return;
      }

      if (editingId) {
        await api.put(`/contabilidad/gastos/${editingId}`, formData);
        toast.success('Gasto actualizado');
      } else {
        await api.post('/contabilidad/gastos', formData);
        toast.success('Gasto registrado');
      }

      setShowModal(false);
      setEditingId(null);
      setFormData({
        concept: '',
        amount: 0,
        category: 'Varios',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      loadGastos();
    } catch (error) {
      console.error('Error guardando gasto:', error);
      toast.error('Error al guardar gasto');
    }
  };

  const handleEdit = (gasto: Gasto) => {
    setFormData(gasto);
    setEditingId(gasto.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este gasto?')) return;

    try {
      await api.delete(`/contabilidad/gastos/${id}`);
      toast.success('Gasto eliminado');
      loadGastos();
    } catch (error) {
      console.error('Error eliminando gasto:', error);
      toast.error('Error al eliminar gasto');
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const totalGastos = gastos.reduce((sum, g) => sum + g.amount, 0);
  const gastosPorCategoria = CATEGORIAS_GASTO.map(cat => ({
    category: cat,
    total: gastos.filter(g => g.category === cat).reduce((sum, g) => sum + g.amount, 0)
  })).filter(item => item.total > 0);

  return (
    <div className="space-y-6">
      {/* Header con stats */}
      <div className="flex justify-between items-start">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Total Gastos</p>
            <p className="text-2xl font-bold text-gray-900">{gastos.length}</p>
          </div>
          <div className="bg-orange-50 rounded-lg shadow-md p-4">
            <p className="text-sm text-orange-700">Monto Total</p>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalGastos)}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-md p-4">
            <p className="text-sm text-blue-700">Promedio por Gasto</p>
            <p className="text-2xl font-bold text-blue-600">
              {gastos.length > 0 ? formatCurrency(totalGastos / gastos.length) : '€0.00'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setFormData({
              concept: '',
              amount: 0,
              category: 'Varios',
              date: new Date().toISOString().split('T')[0],
              notes: ''
            });
            setEditingId(null);
            setShowModal(true);
          }}
          className="ml-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Gasto
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterCategory === 'all'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Todos
        </button>
        {CATEGORIAS_GASTO.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterCategory === cat
                ? 'bg-orange-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Desglose por categoría */}
      {gastosPorCategoria.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gastos por Categoría</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gastosPorCategoria.map((item) => (
              <div key={item.category} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">{item.category}</p>
                <p className="text-lg font-bold text-orange-600">{formatCurrency(item.total)}</p>
                <p className="text-xs text-gray-500">
                  {((item.total / totalGastos) * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla de gastos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-orange-50 px-6 py-4 border-b border-orange-200">
          <h3 className="text-lg font-semibold text-orange-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Registro de Gastos Operativos
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Concepto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notas</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {gastos.map((gasto) => (
                <tr key={gasto.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(gasto.date)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {gasto.concept}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                      {gasto.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-orange-600">
                    {formatCurrency(gasto.amount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                    {gasto.notes || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(gasto)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(gasto.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para crear/editar gasto */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Editar Gasto' : 'Nuevo Gasto'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Concepto *
                </label>
                <input
                  type="text"
                  value={formData.concept}
                  onChange={(e) => setFormData({...formData, concept: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Ej: Gasolina furgoneta"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto (€) *
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  {CATEGORIAS_GASTO.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  rows={3}
                  placeholder="Detalles adicionales..."
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContabilidadGastos;
