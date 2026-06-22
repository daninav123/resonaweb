import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@resona/api-client';
import { invoiceService } from '../../services/invoice.service';
import { useAuthStore } from '@resona/api-client';
import { OrderNotes } from '../../components/orders/OrderNotes';
import { Package, User, Calendar, MapPin, CreditCard, Truck, ArrowLeft, Download, Loader2, FileText, Edit, X, QrCode, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { canDownloadInvoice, getDocumentAction } from '../../utils/invoiceHelper';
import { QRCodeSVG } from 'qrcode.react';
import { StatusModal, EditModal, CancelModal, ReturnModal, DepositModal, QRModal } from '../../components/orders/OrderDetailModals';

const OrderDetailPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [loadingFacturae, setLoadingFacturae] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAction, setDepositAction] = useState<'capture' | 'release'>('capture');
  const [depositNotes, setDepositNotes] = useState('');
  const [depositRetainedAmount, setDepositRetainedAmount] = useState(0);
  const [showQRModal, setShowQRModal] = useState(false);
  const [paymentLinkQR, setPaymentLinkQR] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [editData, setEditData] = useState<any>({});
  const [returnNotes, setReturnNotes] = useState('');
  const [returnCondition, setReturnCondition] = useState<'PERFECT' | 'GOOD' | 'DAMAGED'>('GOOD');
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [creatingContract, setCreatingContract] = useState(false);
  const navigate = useNavigate();

  const handleCreateEvent = async () => {
    if (!id) return;
    try {
      setCreatingEvent(true);
      const res: any = await api.post(`/events/from-order/${id}`);
      const eventId = res?.id || res?.data?.id;
      toast.success('Evento creado desde pedido');
      if (eventId) navigate(`/admin/events/${eventId}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al crear evento');
    } finally {
      setCreatingEvent(false);
    }
  };

  const handleCreateContract = async () => {
    if (!id) return;
    try {
      setCreatingContract(true);
      await api.post(`/contracts-mgmt/from-order/${id}`);
      queryClient.invalidateQueries({ queryKey: ['order-contract', id] });
      toast.success('Contrato generado. Ve a Documentos > Contratos para revisarlo.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al crear contrato');
    } finally {
      setCreatingContract(false);
    }
  };

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['admin-order-detail', id],
    queryFn: async () => {
      const response: any = await api.get(`/orders/${id}`);
      return response;
    },
  });

  // Buscar contrato vinculado
  const { data: linkedContract } = useQuery({
    queryKey: ['order-contract', id, order?.orderNumber],
    queryFn: async () => {
      const res: any = await api.get('/contracts-mgmt?limit=200');
      const contracts = res?.data || [];
      return contracts.find((c: any) => c.orderId === id || c.budgetRef === order?.orderNumber) || null;
    },
    enabled: !!order,
  });

  // Función auxiliar para cerrar modal de estado
  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setNewStatus('');
  };

  // Mutation para cambiar estado
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      return await api.patch(`/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order-detail', id] });
      toast.success('Estado actualizado correctamente');
      handleCloseStatusModal();
    },
    onError: (error: any) => {
      console.error('❌ Error al actualizar estado:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar estado';
      toast.error(errorMessage);
    },
  });

  // Mutation para cancelar pedido
  const cancelOrderMutation = useMutation({
    mutationFn: async () => {
      return await api.post(`/orders/${id}/cancel`, { reason: cancelReason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order-detail', id] });
      toast.success('Pedido cancelado');
    },
    onError: () => {
      toast.error('Error al cancelar pedido');
    },
  });

  // Mutation para marcar como devuelto
  const markAsReturnedMutation = useMutation({
    mutationFn: async () => {
      return await api.post(`/orders/${id}/returned`, {
        notes: returnNotes,
        condition: returnCondition,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order-detail', id] });
      toast.success('Pedido marcado como devuelto');
      setShowReturnModal(false);
      setReturnNotes('');
      setReturnCondition('GOOD');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al marcar devolución');
    },
  });

  // Mutation para gestionar fianza (solo devolver, cobrar se hace desde POS)
  const depositMutation = useMutation({
    mutationFn: async () => {
      if (depositAction === 'capture') {
        // No llamar al backend, solo mostrar el QR
        return Promise.resolve({ success: true });
      } else {
        return await api.post(`/orders/${id}/deposit/release`, {
          retainedAmount: depositRetainedAmount,
          notes: depositNotes,
        });
      }
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-order-detail', id] });
      
      if (depositAction === 'capture') {
        // Generar URL del POS para Tap to Pay
        const posURL = `${window.location.origin}/pos/${id}`;
        
        // Guardar el link para el QR
        setPaymentLinkQR(posURL);
        
        // Copiar al portapapeles
        navigator.clipboard.writeText(posURL);
        
        // Mostrar modal con QR
        setShowQRModal(true);
        
        toast.success('Terminal de cobro listo');
      } else if (depositAction === 'release') {
        toast.success('Fianza devuelta correctamente');
      }
      
      setShowDepositModal(false);
      setDepositNotes('');
      setDepositRetainedAmount(0);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al gestionar fianza');
    },
  });

  const handleDownloadContract = async () => {
    try {
      toast.loading('Generando contrato...');
      const response = await api.get(`/contracts/${id}`, { responseType: 'blob' });
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(new Blob([response as any]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `contrato-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success('Contrato descargado correctamente');
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Error al descargar el contrato');
    }
  };

  const handleMarkAsReturned = () => {
    if (!returnNotes.trim()) {
      toast.error('Por favor añade notas sobre la devolución');
      return;
    }
    markAsReturnedMutation.mutate();
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;
    
    try {
      setLoadingInvoice(true);
      toast.loading('Generando factura...');
      
      // Generate invoice
      const response: any = await invoiceService.generateInvoice(id!);
      // Extraer el invoice de la respuesta
      const invoice = response?.invoice || response;
      
      if (!invoice || !invoice.id) {
        throw new Error('No se pudo generar la factura');
      }
      
      // Download PDF
      const blob = await invoiceService.downloadInvoice(invoice.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura-${invoice.invoiceNumber || invoice.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success('Factura descargada correctamente');
    } catch (error: any) {
      toast.dismiss();
      toast.error(error?.message || 'Error al descargar la factura');
      console.error('Error completo:', error);
    } finally {
      setLoadingInvoice(false);
    }
  };

  const handleGenerateFacturae = async () => {
    try {
      setLoadingFacturae(true);
      toast.loading('Generando Facturae XML...');
      
      // Primero generar factura si no existe
      const invoiceResponse: any = await invoiceService.generateInvoice(id!);
      const invoice = invoiceResponse.invoice || invoiceResponse.data?.invoice || invoiceResponse;
      
      if (!invoice || !invoice.id) {
        throw new Error('No se pudo generar la factura');
      }
      
      // Generar Facturae XML
      const response: any = await api.post(`/invoices/${invoice.id}/facturae`);
      
      toast.dismiss();
      toast.success('Facturae XML generado correctamente');
      queryClient.invalidateQueries({ queryKey: ['admin-order-detail', id] });
    } catch (error: any) {
      toast.dismiss();
      toast.error(error?.response?.data?.error || 'Error al generar Facturae XML');
      console.error('Error:', error);
    } finally {
      setLoadingFacturae(false);
    }
  };

  const handleDownloadFacturae = async () => {
    try {
      setLoadingFacturae(true);
      toast.loading('Descargando Facturae XML...');
      
      // Obtener factura
      const invoiceResponse: any = await invoiceService.generateInvoice(id!);
      const invoice = invoiceResponse.invoice || invoiceResponse.data?.invoice || invoiceResponse;
      
      if (!invoice || !invoice.id) {
        throw new Error('No se pudo obtener la factura');
      }
      
      // Descargar XML
      const response = await api.get(`/invoices/${invoice.id}/facturae/download`, {
        responseType: 'blob'
      });
      
      // Create download link
      const blob = new Blob([response as BlobPart], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura_${invoice.invoiceNumber}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success('Facturae XML descargado correctamente');
    } catch (error: any) {
      toast.dismiss();
      toast.error(error?.response?.data?.error || 'Error al descargar Facturae XML');
      console.error('Error:', error);
    } finally {
      setLoadingFacturae(false);
    }
  };

  const handleCancelOrder = () => {
    if (!cancelReason.trim()) {
      toast.error('Por favor indica el motivo de la cancelación');
      return;
    }
    cancelOrderMutation.mutate();
    setShowCancelModal(false);
    setCancelReason('');
  };

  const handleSaveEdit = async () => {
    try {
      await api.put(`/orders/${id}`, editData);
      toast.success('Pedido actualizado correctamente');
      queryClient.invalidateQueries({ queryKey: ['admin-order-detail', id] });
      setShowEditModal(false);
      setEditData({});
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Error al actualizar el pedido');
    }
  };

  const handleChangeStatus = () => {
    if (newStatus) {
      updateStatusMutation.mutate(newStatus);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
      IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'En Proceso' },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completado' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' },
    };
    return badges[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-semibold mb-2">Error al cargar pedido</h3>
            <p className="text-red-600">{(error as Error)?.message || 'Pedido no encontrado'}</p>
            <Link to="/admin/orders" className="text-blue-600 hover:underline mt-4 inline-block">
              ← Volver a pedidos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const badge = getStatusBadge(order.status);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/admin/orders"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Pedidos
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Pedido #{order.orderNumber}
              </h1>
              <p className="text-gray-600 mt-1">
                Creado el {formatDate(order.createdAt)}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
              {badge.label}
            </span>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {/* 1. Estado (Desplegable) */}
            <select
              value={order.status}
              onChange={(e) => {
                setNewStatus(e.target.value);
                setShowStatusModal(true);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm font-medium"
            >
              <option value={order.status}>Estado: {getStatusBadge(order.status).label}</option>
              <option value="">──────────</option>
              <option value="PENDING">Pendiente</option>
              <option value="IN_PROGRESS">En Proceso</option>
              <option value="COMPLETED">Completado</option>
              <option value="CANCELLED">Cancelado</option>
            </select>

            {/* 2. Descargar Contrato */}
            <button 
              onClick={handleDownloadContract}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2 text-sm font-medium"
              title="Descargar Contrato"
            >
              <FileText className="w-4 h-4" />
              Contrato
            </button>

            {/* 3. Descargar Factura */}
            <button 
              onClick={handleDownloadInvoice}
              disabled={loadingInvoice}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              title="Descargar Factura"
            >
              {loadingInvoice ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              Factura
            </button>

            {/* 4. Cobrar Fianza */}
            {order.depositAmount > 0 && (order.depositStatus === 'PENDING' || order.depositStatus === 'AUTHORIZED') && (
              <button 
                onClick={() => {
                  setDepositAction('capture');
                  setShowDepositModal(true);
                }}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition flex items-center justify-center gap-2 text-sm font-medium"
                title="Cobrar Fianza"
              >
                💰 Cobrar {order.depositStatus === 'AUTHORIZED' && '(Autorizada)'}
              </button>
            )}

            {/* 5. Devolver Fianza */}
            {order.depositAmount > 0 && (order.depositStatus === 'CAPTURED' || order.depositStatus === 'AUTHORIZED') && (
              <button 
                onClick={() => {
                  setDepositAction('release');
                  setDepositRetainedAmount(0);
                  setShowDepositModal(true);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm font-medium"
                title="Devolver Fianza"
              >
                ↩️ Devolver
              </button>
            )}

            {/* 6. Editar Pedido */}
            <button 
              onClick={() => {
                setEditData({
                  notes: order.notes || '',
                  internalNotes: order.internalNotes || ''
                });
                setShowEditModal(true);
              }}
              disabled={order.status === 'COMPLETED'}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
              title="Editar Pedido"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>

            {/* 7. Cancelar Pedido */}
            <button 
              data-testid="cancel-order"
              onClick={() => setShowCancelModal(true)}
              disabled={cancelOrderMutation.isPending || order.status === 'CANCELLED' || order.status === 'COMPLETED'}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
              title="Cancelar Pedido"
            >
              <X className="w-4 h-4" />
              {cancelOrderMutation.isPending ? 'Cancelando...' : 'Cancelar'}
            </button>
          </div>

          {/* Flujo integrado: Conversiones */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Flujo integrado</p>
            <div className="flex flex-wrap gap-2">
              {order.event ? (
                <Link
                  to={`/admin/events/${order.event.id}`}
                  className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition flex items-center gap-2 text-sm font-medium"
                >
                  <Calendar className="w-4 h-4" />
                  Ver Evento {order.event.eventNumber}
                </Link>
              ) : (
                <button
                  onClick={handleCreateEvent}
                  disabled={creatingEvent || order.status === 'CANCELLED'}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                >
                  {creatingEvent ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                  Crear Evento
                </button>
              )}
              {linkedContract ? (
                <Link
                  to="/admin/contracts"
                  className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition flex items-center gap-2 text-sm font-medium"
                >
                  <FileText className="w-4 h-4" />
                  Ver Contrato {linkedContract.contractNumber}
                </Link>
              ) : (
                <button
                  onClick={handleCreateContract}
                  disabled={creatingContract || order.status === 'CANCELLED'}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                >
                  {creatingContract ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  Generar Contrato
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Información del Cliente
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="font-medium">{order.user?.firstName} {order.user?.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{order.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="font-medium">{order.contactPhone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contacto</p>
                  <p className="font-medium">{order.contactPerson || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Productos ({order.items?.length || 0})
              </h2>
              <div className="space-y-4">
                {order.items?.map((item: any) => {
                  return (
                  <div key={item.id} className="border-b pb-4 last:border-0">
                    {/* Información básica del item */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.product?.name || 'Producto'}</h3>
                        <p className="text-sm text-gray-600">SKU: {item.product?.sku}</p>
                        <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(item.startDate).toLocaleDateString('es-ES')} - {new Date(item.endDate).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">€{Number(item.totalPrice).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">€{Number(item.pricePerUnit).toFixed(2)}/unidad</p>
                      </div>
                    </div>

                    {/* Detalles del evento si existe eventMetadata */}
                    {item.eventMetadata && (
                      <div className="mt-3 p-4 bg-purple-50 border-l-4 border-purple-500 rounded-r-lg space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">🎉</span>
                          <h4 className="font-semibold text-purple-900">Detalles del Evento</h4>
                        </div>
                        
                        {/* Información básica del evento */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {item.eventMetadata.eventType && (
                            <div>
                              <span className="text-purple-700 font-medium">Tipo:</span>
                              <span className="ml-2">{item.eventMetadata.eventType}</span>
                            </div>
                          )}
                          {item.eventMetadata.attendees && (
                            <div>
                              <span className="text-purple-700 font-medium">Asistentes:</span>
                              <span className="ml-2">{item.eventMetadata.attendees}</span>
                            </div>
                          )}
                          {item.eventMetadata.duration && (
                            <div>
                              <span className="text-purple-700 font-medium">Duración:</span>
                              <span className="ml-2">{item.eventMetadata.duration} {item.eventMetadata.durationType === 'hours' ? 'horas' : 'días'}</span>
                            </div>
                          )}
                          {item.eventMetadata.startTime && (
                            <div>
                              <span className="text-purple-700 font-medium">Hora inicio:</span>
                              <span className="ml-2">{item.eventMetadata.startTime}</span>
                            </div>
                          )}
                          {item.eventMetadata.eventDate && (
                            <div>
                              <span className="text-purple-700 font-medium">Fecha:</span>
                              <span className="ml-2">{new Date(item.eventMetadata.eventDate).toLocaleDateString('es-ES')}</span>
                            </div>
                          )}
                          {item.eventMetadata.eventLocation && (
                            <div className="col-span-2">
                              <span className="text-purple-700 font-medium">📍 Ubicación:</span>
                              <span className="ml-2">{item.eventMetadata.eventLocation}</span>
                            </div>
                          )}
                        </div>

                        {/* Partes del evento */}
                        {item.eventMetadata.selectedParts && item.eventMetadata.selectedParts.length > 0 && (
                          <div>
                            <h5 className="font-medium text-purple-900 mb-2">📦 Partes del Evento:</h5>
                            <ul className="space-y-1 text-sm ml-4">
                              {item.eventMetadata.selectedParts.map((part: any, idx: number) => (
                                <li key={idx} className="flex justify-between">
                                  <span>• {part.name}</span>
                                  {part.price > 0 && <span className="font-medium">€{Number(part.price).toFixed(2)}</span>}
                                </li>
                              ))}
                            </ul>
                            {item.eventMetadata.partsTotal > 0 && (
                              <p className="text-sm font-semibold mt-2 text-purple-900">
                                Subtotal Partes: €{Number(item.eventMetadata.partsTotal).toFixed(2)}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Extras del evento */}
                        {item.eventMetadata.selectedExtras && item.eventMetadata.selectedExtras.length > 0 && (
                          <div>
                            <h5 className="font-medium text-purple-900 mb-2">✨ Extras:</h5>
                            <ul className="space-y-1 text-sm ml-4">
                              {item.eventMetadata.selectedExtras.map((extra: any, idx: number) => (
                                <li key={idx} className="flex justify-between">
                                  <span>• {extra.name} {extra.quantity > 1 && `(x${extra.quantity})`}</span>
                                  {extra.total > 0 && <span className="font-medium">€{Number(extra.total).toFixed(2)}</span>}
                                </li>
                              ))}
                            </ul>
                            {item.eventMetadata.extrasTotal > 0 && (
                              <p className="text-sm font-semibold mt-2 text-purple-900">
                                Subtotal Extras: €{Number(item.eventMetadata.extrasTotal).toFixed(2)}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Total del evento */}
                        {(item.eventMetadata.partsTotal || item.eventMetadata.extrasTotal) && (
                          <div className="pt-2 border-t border-purple-200">
                            <p className="text-sm font-bold text-purple-900">
                              💰 Total Evento: €{(
                                (Number(item.eventMetadata.partsTotal) || 0) + 
                                (Number(item.eventMetadata.extrasTotal) || 0)
                              ).toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>

            {/* Notas del Pedido con Detalles del Evento */}
            {order.notes && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">📋</span>
                  Detalles del Evento
                </h2>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {order.notes}
                  </pre>
                </div>
              </div>
            )}

            {/* Order Notes - Sistema de comentarios */}
            {user && id && (
              <OrderNotes orderId={id} userRole={user.role} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Delivery Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Entrega
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Tipo</p>
                  <p className="font-medium">
                    {order.deliveryType === 'PICKUP' ? 'Recogida en tienda' : 'Entrega a domicilio'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha de entrega</p>
                  <p className="font-medium">{formatDate(order.deliveryDate)}</p>
                </div>
                {/* Para eventos, mostrar ubicación del evento. Para alquileres, dirección de entrega */}
                {order.items?.some((item: any) => item.eventMetadata) ? (
                  <div>
                    <p className="text-sm text-gray-600">Ubicación del Evento</p>
                    <p className="font-medium">
                      {(() => {
                        // Intentar obtener de eventMetadata primero
                        const eventLoc = order.items?.find((item: any) => item.eventMetadata)?.eventMetadata?.eventLocation;
                        if (eventLoc) return eventLoc;
                        
                        // Fallback a order.eventLocation
                        if (typeof order.eventLocation === 'string') return order.eventLocation;
                        if (order.eventLocation?.address) return order.eventLocation.address;
                        
                        return 'No especificada';
                      })()}
                    </p>
                  </div>
                ) : order.deliveryAddress && (
                  <div>
                    <p className="text-sm text-gray-600">Dirección</p>
                    <p className="font-medium">
                      {typeof order.deliveryAddress === 'string' 
                        ? order.deliveryAddress 
                        : `${order.deliveryAddress.address || ''}, ${order.deliveryAddress.city || ''}, ${order.deliveryAddress.postalCode || ''}, ${order.deliveryAddress.country || ''}`.replace(/, ,/g, ',').replace(/^,|,$/g, '')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Fechas del Evento
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Inicio</p>
                  <p className="font-medium">{formatDate(order.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fin</p>
                  <p className="font-medium">{formatDate(order.endDate)}</p>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Resumen de Pago
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">€{Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IVA (21%)</span>
                  <span className="font-medium">€{Number(order.taxAmount || order.tax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío</span>
                  <span className="font-medium">€{Number(order.shippingCost || order.deliveryFee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Depósito</span>
                  <span className="font-medium">€{Number(order.depositAmount).toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>€{Number(order.totalAmount || order.total).toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">Estado de pago</p>
                <p className="font-medium capitalize">{order.paymentStatus?.toLowerCase() || 'Pendiente'}</p>
              </div>
            </div>

            {/* Installments - Pagos a Plazos */}
            {order.eligibleForInstallments && order.installments && order.installments.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Pagos a Plazos (3 Cuotas)
                </h2>
                <div className="space-y-3">
                  {order.installments.map((installment: any, index: number) => (
                    <div 
                      key={installment.id}
                      className={`flex justify-between items-center p-3 rounded-lg border ${
                        installment.status === 'COMPLETED' 
                          ? 'bg-green-50 border-green-200' 
                          : installment.status === 'FAILED'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          Cuota {installment.installmentNumber}/3 ({installment.percentage}%)
                        </p>
                        <p className="text-sm text-gray-600">
                          Vencimiento: {new Date(installment.dueDate).toLocaleDateString('es-ES')}
                        </p>
                        {installment.paidDate && (
                          <p className="text-sm text-green-600">
                            ✓ Pagado: {new Date(installment.paidDate).toLocaleDateString('es-ES')}
                          </p>
                        )}
                        {installment.errorMessage && (
                          <p className="text-sm text-red-600">
                            ✗ Error: {installment.errorMessage}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">
                          €{Number(installment.amount).toFixed(2)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          installment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          installment.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                          installment.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {installment.status === 'COMPLETED' ? 'PAGADO' :
                           installment.status === 'FAILED' ? 'FALLIDO' :
                           installment.status === 'PROCESSING' ? 'PROCESANDO' :
                           'PENDIENTE'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Pagado:</span>
                    <span className="font-semibold text-green-600">
                      €{order.installments
                        .filter((i: any) => i.status === 'COMPLETED')
                        .reduce((sum: number, i: any) => sum + Number(i.amount), 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Total Pendiente:</span>
                    <span className="font-semibold text-orange-600">
                      €{order.installments
                        .filter((i: any) => i.status === 'PENDING' || i.status === 'FAILED')
                        .reduce((sum: number, i: any) => sum + Number(i.amount), 0)
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            {/* Resumen de Fianza */}
            {order.depositAmount > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Estado de la Fianza</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monto:</span>
                    <span className="font-semibold text-lg">€{Number(order.depositAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Estado:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.depositStatus === 'RELEASED' ? 'bg-green-100 text-green-800' :
                      order.depositStatus === 'CAPTURED' ? 'bg-yellow-100 text-yellow-800' :
                      order.depositStatus === 'PENDING' ? 'bg-gray-100 text-gray-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {order.depositStatus === 'RELEASED' ? 'Devuelta' :
                       order.depositStatus === 'CAPTURED' ? 'Cobrada' :
                       order.depositStatus === 'PENDING' ? 'Pendiente' :
                       order.depositStatus === 'AUTHORIZED' ? 'Autorizada' :
                       'Parcialmente Retenida'}
                    </span>
                  </div>
                  {order.depositRetainedAmount > 0 && (
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-gray-600">Retenido:</span>
                      <span className="font-semibold text-orange-600">€{Number(order.depositRetainedAmount).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <StatusModal
          show={showStatusModal}
          newStatus={newStatus}
          setNewStatus={setNewStatus}
          onClose={handleCloseStatusModal}
          onConfirm={handleChangeStatus}
          isPending={updateStatusMutation.isPending}
        />

        <EditModal
          show={showEditModal}
          editData={editData}
          setEditData={setEditData}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
        />

        <CancelModal
          show={showCancelModal}
          cancelReason={cancelReason}
          setCancelReason={setCancelReason}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelOrder}
          isPending={cancelOrderMutation.isPending}
        />

        <ReturnModal
          show={showReturnModal}
          returnNotes={returnNotes}
          setReturnNotes={setReturnNotes}
          returnCondition={returnCondition}
          setReturnCondition={setReturnCondition}
          onClose={() => setShowReturnModal(false)}
          onConfirm={handleMarkAsReturned}
          isPending={markAsReturnedMutation.isPending}
        />

        <DepositModal
          show={showDepositModal}
          depositAction={depositAction}
          depositAmount={Number(order.depositAmount)}
          depositRetainedAmount={depositRetainedAmount}
          setDepositRetainedAmount={setDepositRetainedAmount}
          depositNotes={depositNotes}
          setDepositNotes={setDepositNotes}
          onClose={() => setShowDepositModal(false)}
          onConfirm={() => depositMutation.mutate()}
          isPending={depositMutation.isPending}
        />

        <QRModal
          show={showQRModal}
          paymentLinkQR={paymentLinkQR}
          onClose={() => setShowQRModal(false)}
        />
      </div>
    </div>
  );
};

export default OrderDetailPage;
