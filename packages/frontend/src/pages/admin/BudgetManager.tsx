import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, Plus, Search, Filter, Eye, Edit, Trash2, Copy, 
  Send, CheckCircle, XCircle, Clock, Archive, Download, Mail
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

interface Budget {
  id: string;
  budgetNumber: string;
  title: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  eventType?: string;
  eventDate?: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED';
  total: string;
  createdAt: string;
  sentAt?: string;
}

const BudgetManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  // Cargar presupuestos
  const { data: budgetsData, isLoading } = useQuery({
    queryKey: ['budgets', statusFilter, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await api.get(`/budgets?${params.toString()}`);
      return response.data;
    },
  });

  const budgets = budgetsData || [];

  // Eliminar presupuesto
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/budgets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Presupuesto eliminado');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al eliminar');
    },
  });

  // Duplicar presupuesto
  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/budgets/${id}/duplicate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Presupuesto duplicado');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al duplicar');
    },
  });

  // Estados
  const statusConfig = {
    DRAFT: { label: 'Borrador', color: 'bg-gray-100 text-gray-800', icon: Edit },
    SENT: { label: 'Enviado', color: 'bg-blue-100 text-blue-800', icon: Send },
    ACCEPTED: { label: 'Aceptado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    REJECTED: { label: 'Rechazado', color: 'bg-red-100 text-red-800', icon: XCircle },
    EXPIRED: { label: 'Caducado', color: 'bg-orange-100 text-orange-800', icon: Clock },
    CONVERTED: { label: 'Convertido', color: 'bg-purple-100 text-purple-800', icon: Archive },
  };

  // Estadísticas
  const stats = {
    total: budgets.length,
    draft: budgets.filter((b: Budget) => b.status === 'DRAFT').length,
    sent: budgets.filter((b: Budget) => b.status === 'SENT').length,
    accepted: budgets.filter((b: Budget) => b.status === 'ACCEPTED').length,
    totalAmount: budgets.reduce((sum: number, b: Budget) => sum + parseFloat(b.total || '0'), 0),
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este presupuesto?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleDuplicate = (id: string) => {
    duplicateMutation.mutate(id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Presupuestos</h1>
            <p className="text-sm text-gray-600 mt-1">
              Gestiona presupuestos profesionales para clientes
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Nuevo Presupuesto
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-600">Total</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-600">Borradores</div>
            <div className="text-2xl font-bold text-gray-600 mt-1">{stats.draft}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-600">Enviados</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">{stats.sent}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-600">Aceptados</div>
            <div className="text-2xl font-bold text-green-600 mt-1">{stats.accepted}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-600">Valor Total</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              €{stats.totalAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por número, título, cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                <option value="DRAFT">Borradores</option>
                <option value="SENT">Enviados</option>
                <option value="ACCEPTED">Aceptados</option>
                <option value="REJECTED">Rechazados</option>
                <option value="EXPIRED">Caducados</option>
                <option value="CONVERTED">Convertidos</option>
              </select>
            </div>
            {(searchTerm || statusFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Cargando presupuestos...</div>
          ) : budgets.length === 0 ? (
            <div className="p-8 text-center">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay presupuestos
              </h3>
              <p className="text-gray-600 mb-4">
                Crea tu primer presupuesto profesional
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Crear Presupuesto
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Número
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Título / Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Evento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {budgets.map((budget: Budget) => {
                    const StatusIcon = statusConfig[budget.status].icon;
                    return (
                      <tr key={budget.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-blue-600">
                            {budget.budgetNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {budget.title}
                            </div>
                            <div className="text-sm text-gray-600">
                              {budget.clientName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {budget.eventType || '-'}
                          </div>
                          {budget.eventDate && (
                            <div className="text-xs text-gray-500">
                              {new Date(budget.eventDate).toLocaleDateString('es-ES')}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            €{parseFloat(budget.total).toLocaleString('es-ES', {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              statusConfig[budget.status].color
                            }`}
                          >
                            <StatusIcon size={14} />
                            {statusConfig[budget.status].label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(budget.createdAt).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => window.location.href = `/admin/budgets/${budget.id}`}
                              className="text-blue-600 hover:text-blue-900"
                              title="Ver/Editar"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleDuplicate(budget.id)}
                              className="text-gray-600 hover:text-gray-900"
                              title="Duplicar"
                            >
                              <Copy size={18} />
                            </button>
                            <button
                              className="text-purple-600 hover:text-purple-900"
                              title="Descargar PDF"
                            >
                              <Download size={18} />
                            </button>
                            <button
                              className="text-green-600 hover:text-green-900"
                              title="Enviar por email"
                            >
                              <Mail size={18} />
                            </button>
                            {budget.status === 'DRAFT' && (
                              <button
                                onClick={() => handleDelete(budget.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Eliminar"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear (placeholder) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Crear Presupuesto</h2>
            <p className="text-gray-600 mb-4">
              Esta funcionalidad redirigirá a la página de creación de presupuesto.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  window.location.href = '/admin/budgets/new';
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetManager;
