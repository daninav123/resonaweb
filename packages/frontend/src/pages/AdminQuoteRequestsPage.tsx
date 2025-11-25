import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Package, 
  Sparkles,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  MessageSquare,
  DollarSign,
  Filter,
  RefreshCw,
  TrendingUp
} from 'lucide-react';

interface QuoteRequest {
  id: string;
  customerName?: string;
  customerEmail: string;
  customerPhone?: string;
  eventType: string;
  attendees: number;
  duration: number;
  durationType: string;
  eventDate?: string;
  eventLocation?: string;
  selectedPack?: string;
  selectedExtras: Record<string, number>;
  estimatedTotal?: number;
  status: 'PENDING' | 'CONTACTED' | 'QUOTED' | 'CONVERTED' | 'REJECTED';
  notes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  CONTACTED: 'bg-blue-100 text-blue-800 border-blue-300',
  QUOTED: 'bg-resona/10 text-resona border-resona/30',
  CONVERTED: 'bg-green-100 text-green-800 border-green-300',
  REJECTED: 'bg-red-100 text-red-800 border-red-300',
};

const statusLabels = {
  PENDING: '🟡 Pendiente',
  CONTACTED: '🔵 Contactado',
  QUOTED: '🟣 Presupuesto Enviado',
  CONVERTED: '🟢 Convertido',
  REJECTED: '🔴 Rechazado',
};

const AdminQuoteRequestsPage = () => {
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingNotes, setEditingNotes] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const queryClient = useQueryClient();

  // Fetch quote requests
  const { data: quoteRequests = [], isLoading, refetch } = useQuery({
    queryKey: ['quoteRequests', statusFilter],
    queryFn: async () => {
      // Obtener token del store de Zustand
      const { token, accessToken } = useAuthStore.getState();
      const authToken = accessToken || token || localStorage.getItem('token');
      
      if (!authToken) {
        throw new Error('No hay token de autenticación');
      }
      
      const url = statusFilter !== 'all' 
        ? `${API_URL}/quote-requests?status=${statusFilter}`
        : `${API_URL}/quote-requests`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (!response.ok) throw new Error('Error al cargar solicitudes');
      const result = await response.json();
      return result.data || [];
    },
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['quoteStats'],
    queryFn: async () => {
      const { token, accessToken } = useAuthStore.getState();
      const authToken = accessToken || token || localStorage.getItem('token');
      
      if (!authToken) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(`${API_URL}/quote-requests/stats`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (!response.ok) throw new Error('Error al cargar estadísticas');
      const result = await response.json();
      return result.data;
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { token, accessToken } = useAuthStore.getState();
      const authToken = accessToken || token || localStorage.getItem('token');
      
      if (!authToken) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(`${API_URL}/quote-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status, adminNotes: notes }),
      });
      
      if (!response.ok) throw new Error('Error al actualizar');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quoteRequests'] });
      queryClient.invalidateQueries({ queryKey: ['quoteStats'] });
      setEditingNotes(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { token, accessToken } = useAuthStore.getState();
      const authToken = accessToken || token || localStorage.getItem('token');
      
      if (!authToken) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(`${API_URL}/quote-requests/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (!response.ok) throw new Error('Error al eliminar');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quoteRequests'] });
      queryClient.invalidateQueries({ queryKey: ['quoteStats'] });
      setSelectedRequest(null);
    },
  });

  const handleStatusChange = (newStatus: string) => {
    if (selectedRequest) {
      updateStatusMutation.mutate({
        id: selectedRequest.id,
        status: newStatus,
        notes: selectedRequest.adminNotes,
      });
      setSelectedRequest({ ...selectedRequest, status: newStatus as any });
    }
  };

  const handleSaveNotes = () => {
    if (selectedRequest) {
      updateStatusMutation.mutate({
        id: selectedRequest.id,
        status: selectedRequest.status,
        notes: adminNotes,
      });
      setSelectedRequest({ ...selectedRequest, adminNotes });
    }
  };

  const handleDelete = () => {
    if (selectedRequest && confirm('¿Seguro que quieres eliminar esta solicitud?')) {
      deleteMutation.mutate(selectedRequest.id);
    }
  };

  useEffect(() => {
    if (selectedRequest) {
      setAdminNotes(selectedRequest.adminNotes || '');
    }
  }, [selectedRequest]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Cargando solicitudes...</p>
          <p className="text-gray-400 text-sm mt-2">Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header con animación */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-resona rounded-xl shadow-lg">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Solicitudes de Presupuesto
              </h1>
              <p className="text-gray-500 mt-1">
                Gestiona y responde a las solicitudes de tus clientes
              </p>
            </div>
          </div>
        </div>

        {/* Stats - Versión mejorada */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 animate-fade-in">
            {/* Total */}
            <div className="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:scale-105 group">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                  <Mail className="w-5 h-5 text-gray-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total</div>
            </div>
            
            {/* Pendientes */}
            <div className="bg-yellow-50 p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-yellow-200 hover:scale-105 group">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-yellow-200 rounded-lg group-hover:bg-yellow-300 transition-colors">
                  <Clock className="w-5 h-5 text-yellow-700" />
                </div>
              </div>
              <div className="text-3xl font-bold text-yellow-800 mb-1">{stats.byStatus.pending}</div>
              <div className="text-xs text-yellow-700 font-medium uppercase tracking-wide">Pendientes</div>
            </div>
            
            {/* Contactados */}
            <div className="bg-blue-50 p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200 hover:scale-105 group">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-200 rounded-lg group-hover:bg-blue-300 transition-colors">
                  <Phone className="w-5 h-5 text-blue-700" />
                </div>
              </div>
              <div className="text-3xl font-bold text-blue-800 mb-1">{stats.byStatus.contacted}</div>
              <div className="text-xs text-blue-700 font-medium uppercase tracking-wide">Contactados</div>
            </div>
            
            {/* Presupuestos */}
            <div className="bg-gradient-to-br from-resona/10 to-resona/20 p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-resona/30 hover:scale-105 group">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-resona/20 rounded-lg group-hover:bg-resona/30 transition-colors">
                  <DollarSign className="w-5 h-5 text-resona" />
                </div>
              </div>
              <div className="text-3xl font-bold text-resona mb-1">{stats.byStatus.quoted}</div>
              <div className="text-xs text-resona font-medium uppercase tracking-wide">Presupuestos</div>
            </div>
            
            {/* Convertidos */}
            <div className="bg-green-50 p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-200 hover:scale-105 group">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-200 rounded-lg group-hover:bg-green-300 transition-colors">
                  <CheckCircle className="w-5 h-5 text-green-700" />
                </div>
              </div>
              <div className="text-3xl font-bold text-green-800 mb-1">{stats.byStatus.converted}</div>
              <div className="text-xs text-green-700 font-medium uppercase tracking-wide">Convertidos</div>
            </div>
            
            {/* Conversión */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-200 hover:scale-105 group">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-indigo-200 rounded-lg group-hover:bg-indigo-300 transition-colors">
                  <TrendingUp className="w-5 h-5 text-indigo-700" />
                </div>
              </div>
              <div className="text-3xl font-bold text-indigo-800 mb-1">{stats.conversionRate}%</div>
              <div className="text-xs text-indigo-700 font-medium uppercase tracking-wide">Conversión</div>
            </div>
          </div>
        )}

        {/* Filtros mejorados */}
        <div className="bg-white p-5 rounded-xl shadow-lg mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Filter className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1 block">Filtrar por estado</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="all">📋 Todas las solicitudes</option>
                  <option value="PENDING">🟡 Pendientes</option>
                  <option value="CONTACTED">🔵 Contactados</option>
                  <option value="QUOTED">🟣 Presupuestos Enviados</option>
                  <option value="CONVERTED">🟢 Convertidos</option>
                  <option value="REJECTED">🔴 Rechazados</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="font-medium">Actualizar</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de solicitudes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Solicitudes
              </h2>
              <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                {quoteRequests.length}
              </span>
            </div>
            
            {quoteRequests.length === 0 ? (
              <div className="bg-white p-16 rounded-xl shadow-lg text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg font-medium">No hay solicitudes</p>
                <p className="text-gray-400 text-sm mt-2">Las nuevas solicitudes aparecerán aquí</p>
              </div>
            ) : (
              quoteRequests.map((request: QuoteRequest) => {
                const initials = request.customerEmail.substring(0, 2).toUpperCase();
                const avatarColors = [
                  'bg-blue-500', 'bg-resona', 'bg-green-500', 
                  'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500'
                ];
                const avatarColor = avatarColors[request.id.charCodeAt(0) % avatarColors.length];
                
                return (
                  <button
                    key={request.id}
                    onClick={() => setSelectedRequest(request)}
                    className={`w-full text-left bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 transform hover:scale-102 ${
                      selectedRequest?.id === request.id 
                        ? 'border-blue-500 ring-4 ring-blue-100' 
                        : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      {/* Avatar */}
                      <div className={`w-12 h-12 ${avatarColor} rounded-full flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <span className="text-white font-bold text-lg">{initials}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-900 text-lg truncate">
                              {request.customerEmail}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {request.customerName || 'Sin nombre'}
                            </div>
                          </div>
                          <span className={`text-xs px-3 py-1.5 rounded-full border-2 font-semibold whitespace-nowrap ${statusColors[request.status]}`}>
                            {statusLabels[request.status]}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                            <span className="font-medium">{request.eventType}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{request.attendees}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      {request.estimatedTotal && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <span className="font-bold text-green-600 text-lg">
                            €{Number(request.estimatedTotal).toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-sm text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(request.createdAt).toLocaleDateString('es-ES')}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Detalle de solicitud mejorado */}
          <div className="lg:sticky lg:top-6 h-fit">
            {selectedRequest ? (
              <div className="bg-white p-8 rounded-xl shadow-2xl space-y-6 border border-gray-100">
                <div className="flex items-center justify-between pb-6 border-b border-gray-200">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Detalles</h2>
                    <p className="text-sm text-gray-500 mt-1">Información completa de la solicitud</p>
                  </div>
                  <button
                    onClick={handleDelete}
                    className="p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>

                {/* Cliente */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Cliente
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href={`mailto:${selectedRequest.customerEmail}`} className="text-blue-600 hover:underline">
                        {selectedRequest.customerEmail}
                      </a>
                    </div>
                    {selectedRequest.customerPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a href={`tel:${selectedRequest.customerPhone}`} className="text-blue-600 hover:underline">
                          {selectedRequest.customerPhone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Evento */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">🎉 Evento</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Tipo:</strong> {selectedRequest.eventType}</div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{selectedRequest.attendees} personas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{selectedRequest.duration} {selectedRequest.durationType === 'hours' ? 'horas' : 'días'}</span>
                    </div>
                    {selectedRequest.eventDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{selectedRequest.eventDate}</span>
                      </div>
                    )}
                    {selectedRequest.eventLocation && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{selectedRequest.eventLocation}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pack */}
                {selectedRequest.selectedPack && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Pack Seleccionado
                    </h3>
                    <div className="text-sm text-gray-600">
                      ID: {selectedRequest.selectedPack}
                    </div>
                  </div>
                )}

                {/* Extras */}
                {Object.keys(selectedRequest.selectedExtras).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Extras
                    </h3>
                    <div className="space-y-1 text-sm">
                      {Object.entries(selectedRequest.selectedExtras).map(([id, qty]) => (
                        <div key={id} className="text-gray-600">
                          {qty}x {id}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Precio destacado */}
                {selectedRequest.estimatedTotal && (
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-6 shadow-lg">
                    <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                      <DollarSign className="w-5 h-5" />
                      Precio Estimado
                    </h3>
                    <div className="text-5xl font-bold text-green-700">
                      €{Number(selectedRequest.estimatedTotal).toFixed(2)}
                    </div>
                  </div>
                )}

                {/* Estado mejorado */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-gray-600" />
                    Estado de la Solicitud
                  </h3>
                  <select
                    value={selectedRequest.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-lg font-medium focus:border-blue-500 focus:outline-none transition-all"
                  >
                    <option value="PENDING">🟡 Pendiente</option>
                    <option value="CONTACTED">🔵 Contactado</option>
                    <option value="QUOTED">🟣 Presupuesto Enviado</option>
                    <option value="CONVERTED">🟢 Convertido</option>
                    <option value="REJECTED">🔴 Rechazado</option>
                  </select>
                </div>

                {/* Notas Admin */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Notas Internas
                    </h3>
                    <button
                      onClick={() => setEditingNotes(!editingNotes)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                  {editingNotes ? (
                    <div>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 mb-2"
                        rows={4}
                        placeholder="Añade notas internas..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveNotes}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Guardar
                        </button>
                        <button
                          onClick={() => {
                            setEditingNotes(false);
                            setAdminNotes(selectedRequest.adminNotes || '');
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {selectedRequest.adminNotes || 'Sin notas'}
                    </div>
                  )}
                </div>

                {/* Notas del cliente */}
                {selectedRequest.notes && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">Notas del Cliente</h3>
                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                      {selectedRequest.notes}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white p-16 rounded-xl shadow-lg text-center border border-gray-100">
                <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-16 h-16 text-gray-400" />
                </div>
                <p className="text-gray-700 text-xl font-bold mb-2">Ninguna solicitud seleccionada</p>
                <p className="text-gray-500">Haz click en una solicitud de la izquierda para ver sus detalles completos</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQuoteRequestsPage;
