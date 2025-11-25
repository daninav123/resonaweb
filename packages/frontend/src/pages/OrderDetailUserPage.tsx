import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { invoiceService } from '../services/invoice.service';
import { orderModificationService } from '../services/orderModification.service';
import { Package, Calendar, MapPin, CreditCard, Download, Mail, ArrowLeft, Loader2, Edit, XCircle, FileText } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { EditOrderModal } from '../components/orders/EditOrderModal';
import { canDownloadInvoice, getDocumentLabel, getDocumentAction } from '../utils/invoiceHelper';

const OrderDetailUserPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [canModify, setCanModify] = useState<any>(null);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const response: any = await api.get(`/orders/${id}`);
      return response.data || response;
    },
  });

  // Verificar si se puede modificar
  const { data: modificationCheck } = useQuery({
    queryKey: ['can-modify', id],
    queryFn: () => orderModificationService.canModify(id!),
    enabled: !!id && order?.status !== 'CANCELLED' && order?.status !== 'COMPLETED',
  });

  const handleDownloadInvoice = async () => {
    if (!order) return;
    
    const docType = getDocumentLabel(order.startDate);
    const docTypeLower = docType.toLowerCase();
    
    try {
      setLoadingInvoice(true);
      const loadingToast = toast.loading(`Generando ${docTypeLower}...`);
      
      const response: any = await invoiceService.generateInvoice(id!);
      
      // Extract invoice from response
      const invoice = response?.invoice || response;
      
      if (!invoice || !invoice.id) {
        throw new Error(`No se pudo generar el ${docTypeLower}`);
      }
      
      const blob = await invoiceService.downloadInvoice(invoice.id);
      
      if (!blob || blob.size === 0) {
        throw new Error('El archivo PDF está vacío');
      }
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${docTypeLower}-${invoice.invoiceNumber || id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.dismiss(loadingToast);
      toast.success(`${docType} descargado correctamente`);
    } catch (error: any) {
      toast.dismiss();
      const errorMessage = error.response?.data?.message || error.message || `Error al descargar el ${docTypeLower}`;
      toast.error(errorMessage);
    } finally {
      setLoadingInvoice(false);
    }
  };

  const handleSendInvoiceEmail = async () => {
    if (!order) return;
    
    const docType = getDocumentLabel(order.startDate);
    const docTypeLower = docType.toLowerCase();
    
    try {
      toast.loading(`Enviando ${docTypeLower} por email...`);
      const response: any = await invoiceService.generateInvoice(id!);
      const invoice = response?.invoice || response;
      await invoiceService.sendInvoiceEmail(invoice.id);
      toast.dismiss();
      toast.success(`${docType} enviado por email`);
    } catch (error) {
      toast.dismiss();
      toast.error(`Error al enviar el ${docTypeLower}`);
    }
  };

  const handleCancelOrder = async () => {
    const reason = prompt('¿Por qué quieres cancelar este pedido? (opcional)');
    
    if (reason === null) return; // Usuario canceló el prompt
    
    const confirmation = confirm(
      `¿Estás seguro de que quieres cancelar este pedido?\n\n` +
      `Política de reembolso:\n` +
      `- 7+ días antes: Reembolso 100%\n` +
      `- 1-7 días antes: Reembolso 50%\n` +
      `- Menos de 24h: Sin reembolso`
    );
    
    if (!confirmation) return;
    
    try {
      const loadingToast = toast.loading('Cancelando pedido...');
      await orderModificationService.cancelWithRefund(id!, reason || undefined);
      toast.dismiss(loadingToast);
      toast.success('Pedido cancelado correctamente');
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Error al cancelar el pedido');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">No se encontró el pedido</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
      CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmado' },
      PREPARING: { bg: 'bg-resona/10', text: 'text-resona', label: 'Preparando' },
      READY: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Listo' },
      IN_TRANSIT: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'En tránsito' },
      DELIVERED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Entregado' },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completado' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' },
    };
    return badges[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
  };

  const statusBadge = getStatusBadge(order.status);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/mis-pedidos')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Mis Pedidos
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pedido #{order.orderNumber}</h1>
            <p className="text-gray-600 mt-1">
              Realizado el {new Date(order.createdAt).toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusBadge.bg} ${statusBadge.text}`}>
            {statusBadge.label}
          </span>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Botón de Pagar Ahora - Solo si está PENDING */}
        {order.paymentStatus === 'PENDING' && order.status !== 'CANCELLED' && (
          <button
            onClick={() => navigate('/checkout/stripe', { state: { orderId: order.id } })}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition shadow-lg hover:shadow-xl"
          >
            <CreditCard className="w-5 h-5" />
            💳 Pagar Ahora
          </button>
        )}
        
        {/* Botón para descargar factura/presupuesto */}
        <button
          onClick={handleDownloadInvoice}
          disabled={loadingInvoice}
          className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition disabled:opacity-50 ${
            canDownloadInvoice(order.startDate) 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-600 hover:bg-gray-700'
          }`}
        >
          {loadingInvoice ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              {canDownloadInvoice(order.startDate) ? (
                <Download className="w-4 h-4" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              {getDocumentAction(order.startDate)}
            </>
          )}
        </button>

        {canDownloadInvoice(order.startDate) && (
          <button
            onClick={handleSendInvoiceEmail}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
          >
            <Mail className="w-4 h-4" />
            Enviar por Email
          </button>
        )}

        {/* Botones de Modificación */}
        {modificationCheck?.canModify && order.status !== 'CANCELLED' && (
          <>
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition"
            >
              <Edit className="w-4 h-4" />
              Editar Pedido
            </button>
            
            <button
              onClick={handleCancelOrder}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition"
            >
              <XCircle className="w-4 h-4" />
              Cancelar Pedido
            </button>
          </>
        )}
        
        {!modificationCheck?.canModify && modificationCheck?.reason && order.status !== 'CANCELLED' && (
          <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border">
            ⏰ {modificationCheck.reason}
          </div>
        )}
      </div>

      {/* Modal de Edición */}
      {showEditModal && (
        <EditOrderModal
          orderId={id!}
          currentItems={order.items || []}
          orderDates={{
            startDate: order.startDate,
            endDate: order.endDate,
          }}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['order', id] });
          }}
        />
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Información del Pedido */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Información del Pedido
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-700">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Fecha del Evento</p>
                <p className="font-medium">
                  {new Date(order.startDate).toLocaleDateString('es-ES')} - {new Date(order.endDate).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Método de Entrega</p>
                <p className="font-medium">
                  {order.deliveryType === 'PICKUP' ? 'Recogida en tienda' : 'Envío a domicilio'}
                </p>
              </div>
            </div>

            {order.deliveryType === 'DELIVERY' && order.deliveryAddress && (
              <div className="pl-8">
                <p className="text-sm text-gray-600">{order.deliveryAddress.address}</p>
              </div>
            )}

            <div className="flex items-center gap-3 text-gray-700">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="font-bold text-lg text-blue-600">€{Number(order.total || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Productos</h2>
          <div className="space-y-4">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex gap-4 border-b pb-4 last:border-0">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.product?.name || 'Producto'}</h3>
                  <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">€{Number(item.totalPrice || 0).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">€{Number(item.pricePerUnit || 0).toFixed(2)}/día</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailUserPage;
