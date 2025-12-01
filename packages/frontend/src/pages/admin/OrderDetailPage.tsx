import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { invoiceService } from '../../services/invoice.service';
import { useAuthStore } from '../../stores/authStore';
import { OrderNotes } from '../../components/orders/OrderNotes';
import { Package, User, Calendar, MapPin, CreditCard, Truck, ArrowLeft, Download, Loader2, FileText, Edit, X, QrCode, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { canDownloadInvoice, getDocumentAction } from '../../utils/invoiceHelper';
import { QRCodeSVG } from 'qrcode.react';

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

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['admin-order-detail', id],
    queryFn: async () => {
      const response: any = await api.get(`/orders/${id}`);
      return response;
    },
  });

  // Mutation para cambiar estado
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      return await api.patch(`/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order-detail', id] });
      toast.success('Estado actualizado correctamente');
      setShowStatusModal(false);
    },
    onError: () => {
      toast.error('Error al actualizar estado');
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
      console.log('📄 Respuesta de generar factura:', response);
      
      // Extraer el invoice de la respuesta
      const invoice = response?.invoice || response;
      
      if (!invoice || !invoice.id) {
        throw new Error('No se pudo generar la factura');
      }
      
      console.log('📄 Factura ID:', invoice.id);
      
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

  // Debug: Ver el estado de la fianza
  console.log('🔍 Estado de Fianza:', {
    depositAmount: order.depositAmount,
    depositStatus: order.depositStatus,
    showCobrarButton: order.depositAmount > 0 && (order.depositStatus === 'PENDING' || order.depositStatus === 'AUTHORIZED'),
    showDevolverButton: order.depositAmount > 0 && (order.depositStatus === 'CAPTURED' || order.depositStatus === 'AUTHORIZED')
  });

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
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-start border-b pb-4 last:border-0">
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
                ))}
              </div>
            </div>

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
                {order.deliveryAddress && (
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

        {/* Modal para cambiar estado */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">Cambiar Estado del Pedido</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nuevo Estado
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecciona un estado</option>
                  <option value="PENDING">Pendiente</option>
                  <option value="IN_PROGRESS">En Proceso</option>
                  <option value="COMPLETED">Completado</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleChangeStatus}
                  disabled={!newStatus || updateStatusMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateStatusMutation.isPending ? 'Actualizando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para editar pedido */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Editar Pedido</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas del Cliente
                  </label>
                  <textarea
                    value={editData.notes || ''}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Notas visibles para el cliente..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas Internas (Admin)
                  </label>
                  <textarea
                    value={editData.internalNotes || ''}
                    onChange={(e) => setEditData({ ...editData, internalNotes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Notas internas solo para administradores..."
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditData({});
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para cancelar pedido con razón */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4 text-red-600">Cancelar Pedido</h3>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Esta acción <strong>no se puede deshacer</strong>. Por favor indica el motivo de la cancelación.
                </p>
                
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo de Cancelación <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Ej: Cliente solicitó cancelación, Error en el pedido, etc."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Volver
                </button>
                <button
                  data-testid="confirm-cancel"
                  onClick={handleCancelOrder}
                  disabled={!cancelReason.trim() || cancelOrderMutation.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelOrderMutation.isPending ? 'Cancelando...' : 'Confirmar Cancelación'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para marcar como devuelto */}
        {showReturnModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4 text-teal-600">Marcar Devolución</h3>
              
              <div className="mb-6 space-y-4">
                <p className="text-gray-600">
                  Confirma la devolución del material. El stock se actualizará automáticamente.
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado del Material <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={returnCondition}
                    onChange={(e) => setReturnCondition(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="PERFECT">Perfecto Estado</option>
                    <option value="GOOD">Buen Estado (normal)</option>
                    <option value="DAMAGED">Dañado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas de Devolución <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    rows={4}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="Describe el estado del material, observaciones, etc..."
                  />
                </div>

                {returnCondition === 'DAMAGED' && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                    <p className="text-sm text-red-800">
                      ⚠️ Material dañado: La fianza podría retenerse parcial o totalmente.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowReturnModal(false);
                    setReturnNotes('');
                    setReturnCondition('GOOD');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleMarkAsReturned}
                  disabled={!returnNotes.trim() || markAsReturnedMutation.isPending}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {markAsReturnedMutation.isPending ? 'Procesando...' : 'Confirmar Devolución'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para gestionar fianza */}
        {showDepositModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4 text-yellow-600">
                {depositAction === 'capture' ? '💰 Cobrar Fianza' : '↩️ Devolver Fianza'}
              </h3>
              
              <div className="mb-6 space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Importe de la fianza:</strong> €{Number(order.depositAmount).toFixed(2)}
                  </p>
                </div>

                {depositAction === 'release' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Importe Retenido (opcional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={Number(order.depositAmount)}
                      step="0.01"
                      value={depositRetainedAmount}
                      onChange={(e) => setDepositRetainedAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Dejar en 0 para devolver la fianza completa
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas (opcional)
                  </label>
                  <textarea
                    value={depositNotes}
                    onChange={(e) => setDepositNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    placeholder={
                      depositAction === 'capture' 
                        ? 'Motivo del cobro de fianza (opcional)...' 
                        : 'Describe el estado del material, daños si aplica...'
                    }
                  />
                </div>

                {depositAction === 'release' && depositRetainedAmount > 0 && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
                    <p className="text-sm text-yellow-800">
                      <strong>⚠️ Retención parcial:</strong><br/>
                      Retenido: €{depositRetainedAmount.toFixed(2)}<br/>
                      A devolver: €{(Number(order.depositAmount) - depositRetainedAmount).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDepositModal(false);
                    setDepositNotes('');
                    setDepositRetainedAmount(0);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => depositMutation.mutate()}
                  disabled={depositMutation.isPending}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    depositAction === 'capture' 
                      ? 'bg-yellow-600 hover:bg-yellow-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {depositMutation.isPending ? 'Procesando...' : 
                    depositAction === 'capture' ? 'Generar Terminal de Cobro' : 'Confirmar Devolución'
                  }
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Código QR */}
        {showQRModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowQRModal(false)}
          >
            <div 
              className="bg-white rounded-lg max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Terminal de Cobro
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Escanea para usar Tap to Pay
                  </p>
                </div>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Código QR */}
              <div className="flex justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
                <QRCodeSVG 
                  value={paymentLinkQR} 
                  size={280}
                  level="H"
                  includeMargin={true}
                />
              </div>

              {/* Instrucciones */}
              <div className="mt-6 space-y-3">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>📱 Paso 1:</strong> Escanea el QR con tu móvil
                  </p>
                </div>
                <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                  <p className="text-sm text-green-800">
                    <strong>🔓 Paso 2:</strong> Inicia sesión si pide
                  </p>
                </div>
                <div className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded">
                  <p className="text-sm text-purple-800">
                    <strong>💳 Paso 3:</strong> Tap en "Cobrar con Tap to Pay"
                  </p>
                </div>
                <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded">
                  <p className="text-sm text-orange-800">
                    <strong>👋 Paso 4:</strong> Cliente acerca su tarjeta → ✅ Cobrado
                  </p>
                </div>
              </div>

              {/* Botón para abrir en el navegador */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => window.open(paymentLinkQR, '_blank')}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  Abrir en Nueva Pestaña
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(paymentLinkQR);
                    toast.success('Link copiado al portapapeles');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                >
                  Copiar Link
                </button>
              </div>

              {/* Nota sobre Tap to Pay */}
              <p className="text-xs text-gray-500 mt-4 text-center">
                💡 Asegúrate de tener NFC activado en tu móvil para usar Tap to Pay
              </p>

              {/* Botón de cerrar */}
              <button
                onClick={() => setShowQRModal(false)}
                className="w-full mt-4 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailPage;
