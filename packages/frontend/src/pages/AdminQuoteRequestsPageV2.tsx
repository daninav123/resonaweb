import { useState } from 'react';
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
  DollarSign,
  CheckCircle,
  XCircle,
  RefreshCw,
  X
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

const AdminQuoteRequestsPageV2 = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch todas las solicitudes
  const { data: allRequests = [], isLoading, refetch } = useQuery({
    queryKey: ['quoteRequests'],
    queryFn: async () => {
      const { token, accessToken } = useAuthStore.getState();
      const authToken = accessToken || token || localStorage.getItem('token');
      
      if (!authToken) throw new Error('No hay token');
      
      const response = await fetch(`${API_URL}/quote-requests`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      
      if (!response.ok) throw new Error('Error al cargar');
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
      
      if (!authToken) throw new Error('No hay token');
      
      const response = await fetch(`${API_URL}/quote-requests/stats`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      
      if (!response.ok) throw new Error('Error');
      const result = await response.json();
      return result.data;
    },
  });

  // Mutation para aceptar (crear pedido)
  const acceptMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      const { token, accessToken } = useAuthStore.getState();
      const authToken = accessToken || token || localStorage.getItem('token');
      
      if (!authToken) throw new Error('No hay token');
      
      // Llamar al nuevo endpoint que crea el pedido
      const response = await fetch(`${API_URL}/quote-requests/${quoteId}/convert-to-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al crear pedido');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quoteRequests'] });
      queryClient.invalidateQueries({ queryKey: ['quoteStats'] });
      setShowModal(false);
      setSelectedRequest(null);
      
      // Mostrar mensaje de éxito con ID del pedido
      alert(`✅ Pedido creado exitosamente!\n\nID del pedido: ${data.data.order.id}\n\nPuedes verlo en la sección de Pedidos.`);
    },
    onError: (error: any) => {
      alert(`❌ Error: ${error.message}`);
    },
  });

  // Mutation para rechazar (eliminar)
  const rejectMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      const { token, accessToken } = useAuthStore.getState();
      const authToken = accessToken || token || localStorage.getItem('token');
      
      if (!authToken) throw new Error('No hay token');
      
      const response = await fetch(`${API_URL}/quote-requests/${quoteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      
      if (!response.ok) throw new Error('Error al rechazar');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quoteRequests'] });
      queryClient.invalidateQueries({ queryKey: ['quoteStats'] });
      setShowModal(false);
      setSelectedRequest(null);
    },
  });

  // Filtrar solicitudes
  const activeRequests = allRequests.filter((r: QuoteRequest) => 
    ['PENDING', 'CONTACTED', 'QUOTED'].includes(r.status)
  );
  
  const pastRequests = allRequests.filter((r: QuoteRequest) => 
    ['CONVERTED', 'REJECTED'].includes(r.status)
  );

  const currentRequests = activeTab === 'active' ? activeRequests : pastRequests;

  const handleAccept = () => {
    if (selectedRequest && confirm('¿Crear pedido y marcar como aceptado?')) {
      acceptMutation.mutate(selectedRequest.id);
    }
  };

  const handleReject = () => {
    if (selectedRequest && confirm('¿Seguro que quieres rechazar y eliminar esta solicitud?')) {
      rejectMutation.mutate(selectedRequest.id);
    }
  };

  const openModal = (request: QuoteRequest) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Solicitudes de Presupuesto
          </h1>
          <p className="text-gray-600">
            Gestiona las solicitudes activas y pasadas
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg shadow border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-800">{activeRequests.length}</div>
              <div className="text-sm text-yellow-700">Activas</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
              <div className="text-2xl font-bold text-green-800">{stats.byStatus.converted}</div>
              <div className="text-sm text-green-700">Aceptadas</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg shadow border border-red-200">
              <div className="text-2xl font-bold text-red-800">{stats.byStatus.rejected || 0}</div>
              <div className="text-sm text-red-700">Rechazadas</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'active'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Presupuestos Activos ({activeRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'past'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Presupuestos Pasados ({pastRequests.length})
              </button>
              <div className="ml-auto p-4">
                <button
                  onClick={() => refetch()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualizar
                </button>
              </div>
            </nav>
          </div>

          {/* Lista */}
          <div className="p-6">
            {currentRequests.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No hay solicitudes {activeTab === 'active' ? 'activas' : 'pasadas'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentRequests.map((request: QuoteRequest) => (
                  <button
                    key={request.id}
                    onClick={() => openModal(request)}
                    className="text-left bg-white border-2 border-gray-200 hover:border-blue-500 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 mb-1">{request.customerEmail}</div>
                        <div className="text-sm text-gray-600">{request.eventType}</div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'CONTACTED' ? 'bg-blue-100 text-blue-800' :
                        request.status === 'QUOTED' ? 'bg-resona/10 text-resona' :
                        request.status === 'CONVERTED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status === 'PENDING' ? 'Pendiente' :
                         request.status === 'CONTACTED' ? 'Contactado' :
                         request.status === 'QUOTED' ? 'Presupuestado' :
                         request.status === 'CONVERTED' ? 'Aceptado' : 'Rechazado'}
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{request.attendees} personas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{request.duration} {request.durationType === 'hours' ? 'horas' : 'días'}</span>
                      </div>
                    </div>
                    
                    {request.estimatedTotal && (
                      <div className="flex items-center gap-1 text-lg font-bold text-green-600">
                        <DollarSign className="w-5 h-5" />
                        €{Number(request.estimatedTotal).toFixed(2)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">Detalle de Solicitud</h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Cliente */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Cliente
                </h3>
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
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
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
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
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">ID: {selectedRequest.selectedPack}</div>
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
                  <div className="space-y-1 bg-gray-50 p-4 rounded-lg">
                    {Object.entries(selectedRequest.selectedExtras).map(([id, qty]) => (
                      <div key={id} className="text-gray-600">
                        {qty}x {id}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Precio */}
              {selectedRequest.estimatedTotal && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                  <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Precio Estimado
                  </h3>
                  <div className="text-4xl font-bold text-green-600">
                    €{Number(selectedRequest.estimatedTotal).toFixed(2)}
                  </div>
                </div>
              )}

              {/* Notas */}
              {selectedRequest.notes && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Notas del Cliente</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    {selectedRequest.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer - Botones de acción */}
            {activeTab === 'active' && (
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-4">
                <button
                  onClick={handleReject}
                  disabled={rejectMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                >
                  <XCircle className="w-6 h-6" />
                  {rejectMutation.isPending ? 'Rechazando...' : 'Rechazar'}
                </button>
                <button
                  onClick={handleAccept}
                  disabled={acceptMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                >
                  <CheckCircle className="w-6 h-6" />
                  {acceptMutation.isPending ? 'Aceptando...' : 'Aceptar y Crear Pedido'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuoteRequestsPageV2;
