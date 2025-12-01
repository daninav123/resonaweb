import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { DollarSign, CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface PendingRefund {
  id: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  refundAmount: number;
  refundStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PARTIAL';
  refundPercentage: number;
  reason: string;
  createdAt: string;
  startDate: string;
  total: number;
}

const RefundsPage = () => {
  const queryClient = useQueryClient();
  const [selectedRefund, setSelectedRefund] = useState<string | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Obtener reembolsos pendientes
  const { data: refundsData, isLoading, error } = useQuery({
    queryKey: ['pending-refunds'],
    queryFn: async () => {
      const response: any = await api.get('/order-modifications/pending-refunds');
      const data = response.data || response || [];
      return Array.isArray(data) ? data : [];
    },
  });

  const refunds = Array.isArray(refundsData) ? refundsData : [];

  // Mutation para aprobar reembolso
  const approveMutation = useMutation({
    mutationFn: async (modificationId: string) => {
      return await api.post(`/order-modifications/approve-refund/${modificationId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-refunds'] });
      toast.success('Reembolso aprobado correctamente');
      setShowApproveModal(false);
      setSelectedRefund(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al aprobar reembolso');
    },
  });

  // Mutation para rechazar reembolso
  const rejectMutation = useMutation({
    mutationFn: async (modificationId: string) => {
      return await api.post(`/order-modifications/reject-refund/${modificationId}`, {
        reason: rejectReason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-refunds'] });
      toast.success('Reembolso rechazado');
      setShowRejectModal(false);
      setSelectedRefund(null);
      setRejectReason('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al rechazar reembolso');
    },
  });

  const currentRefund = refunds.find((r: PendingRefund) => r.id === selectedRefund);

  const getRefundBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Aprobado' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rechazado' },
      PARTIAL: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Parcial' },
    };
    return badges[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
  };

  const calculateDaysUntilEvent = (startDate: string) => {
    const eventDate = new Date(startDate);
    const now = new Date();
    const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin/orders"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Pedidos
          </Link>
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Reembolsos</h1>
          </div>
          <p className="text-gray-600 mt-2">
            {refunds.length} reembolso{refunds.length !== 1 ? 's' : ''} pendiente{refunds.length !== 1 ? 's' : ''} de aprobación
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">Error al cargar reembolsos</p>
          </div>
        )}

        {refunds.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay reembolsos pendientes</h3>
            <p className="text-gray-600">Todos los reembolsos han sido procesados</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {refunds.map((refund: PendingRefund) => {
              const badge = getRefundBadge(refund.refundStatus);
              const daysUntil = calculateDaysUntilEvent(refund.startDate);
              
              return (
                <div key={refund.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Pedido #{refund.orderNumber}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {refund.customerName} ({refund.customerEmail})
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        €{refund.refundAmount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {refund.refundPercentage}% de €{refund.total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Motivo</p>
                      <p className="font-medium text-gray-900">{refund.reason}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Días hasta evento</p>
                      <p className={`font-medium ${daysUntil >= 7 ? 'text-green-600' : daysUntil >= 1 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {daysUntil} día{daysUntil !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fecha del evento</p>
                      <p className="font-medium text-gray-900">
                        {new Date(refund.startDate).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Solicitado</p>
                      <p className="font-medium text-gray-900">
                        {new Date(refund.createdAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>

                  {refund.refundStatus === 'PENDING' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedRefund(refund.id);
                          setShowApproveModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Aprobar Reembolso
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRefund(refund.id);
                          setShowRejectModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        <XCircle className="w-4 h-4" />
                        Rechazar
                      </button>
                      <Link
                        to={`/admin/orders/${refund.orderId}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Ver Pedido
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de aprobación */}
        {showApproveModal && currentRefund && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4 text-green-600">Aprobar Reembolso</h3>
              
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Monto a reembolsar:</p>
                <p className="text-2xl font-bold text-green-600">
                  €{currentRefund.refundAmount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Pedido #{currentRefund.orderNumber} - {currentRefund.customerName}
                </p>
              </div>

              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que quieres aprobar este reembolso? Se procesará automáticamente en Stripe.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setSelectedRefund(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => approveMutation.mutate(currentRefund.id)}
                  disabled={approveMutation.isPending}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {approveMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Confirmar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de rechazo */}
        {showRejectModal && currentRefund && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4 text-red-600">Rechazar Reembolso</h3>
              
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Monto:</p>
                <p className="text-2xl font-bold text-red-600">
                  €{currentRefund.refundAmount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Pedido #{currentRefund.orderNumber}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo del rechazo <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Explica por qué se rechaza el reembolso..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedRefund(null);
                    setRejectReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => rejectMutation.mutate(currentRefund.id)}
                  disabled={!rejectReason.trim() || rejectMutation.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {rejectMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Rechazar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RefundsPage;
