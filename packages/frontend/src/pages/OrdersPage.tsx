import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { invoiceService } from '../services/invoice.service';
import { Package, Download, Eye, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const OrdersPage = () => {
  const navigate = useNavigate();
  const [loadingInvoice, setLoadingInvoice] = useState<string | null>(null);

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const response: any = await api.get('/orders/my-orders');
      return response?.data || [];
    },
  });

  const orders = ordersData || [];

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
      IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'En Proceso' },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completado' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' },
    };
    return badges[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
  };

  const handleDownloadInvoice = async (order: any) => {
    try {
      setLoadingInvoice(order.id);
      const loadingToast = toast.loading('Generando factura...');
      
      console.log('📄 Generando factura para pedido:', order.id);
      
      // Generate invoice
      const response: any = await invoiceService.generateInvoice(order.id);
      console.log('✅ Factura generada:', response);
      
      // Extract invoice from response
      const invoice = response?.invoice || response;
      
      if (!invoice || !invoice.id) {
        throw new Error('No se pudo generar la factura');
      }
      
      // Download PDF
      console.log('📥 Descargando PDF de factura:', invoice.id);
      const blob = await invoiceService.downloadInvoice(invoice.id);
      console.log('✅ PDF descargado, tamaño:', blob.size);
      
      if (!blob || blob.size === 0) {
        throw new Error('El archivo PDF está vacío');
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura-${invoice.invoiceNumber || order.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.dismiss(loadingToast);
      toast.success('Factura descargada correctamente');
    } catch (error: any) {
      console.error('❌ Error al descargar la factura:', error);
      toast.dismiss();
      
      const errorMessage = error.response?.data?.message || error.message || 'Error al descargar la factura';
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setLoadingInvoice(null);
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-resona" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Package className="w-8 h-8 text-resona" />
          <h1 className="text-3xl font-bold text-gray-900">Mis Pedidos</h1>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No tienes pedidos aún</h2>
            <p className="text-gray-600">Los pedidos que realices aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => {
              const badge = getStatusBadge(order.status);
              return (
                <div key={order.id} data-testid="order-card" className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 data-testid="order-number" className="text-lg font-bold text-gray-900">
                        Pedido #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span data-testid="order-status" className={`px-3 py-1 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total:</p>
                        <p data-testid="order-total" className="text-xl font-bold text-gray-900">
                          €{Number(order.total).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Método de entrega:</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {order.deliveryMethod === 'pickup' ? '🏪 Recogida en tienda' : '🚚 Envío a domicilio'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      data-testid="download-invoice"
                      onClick={() => handleDownloadInvoice(order)}
                      disabled={loadingInvoice === order.id}
                      className="flex items-center gap-2 px-4 py-2 bg-resona text-white rounded-lg hover:bg-resona-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingInvoice === order.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Descargar Factura
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => navigate(`/mis-pedidos/${order.id}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Detalles
                    </button>
                  </div>

                  {/* Información adicional para recogida en tienda */}
                  {order.deliveryMethod === 'pickup' && (
                    <div className="mt-4 p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
                      <div className="flex items-start gap-2">
                        <FileText className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-semibold text-orange-900 mb-1">Recogida en tienda</p>
                          <p className="text-orange-800">
                            Recuerda traer tu DNI y la factura descargada. En tienda se cobrará el resto del importe y la fianza.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
