import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@resona/api-client';
import { decodeHTMLEntities } from '../utils/htmlDecode';
import { invoiceService } from '../services/invoice.service';
import { orderModificationService } from '../services/orderModification.service';
import { Package, Calendar, MapPin, CreditCard, Download, ArrowLeft, Loader2, Edit, XCircle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { EditOrderModal } from '../components/orders/EditOrderModal';
import { InstallmentPayment } from '../components/InstallmentPayment';
import { formatPrice } from '../utils/cartCalculations';

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
      const orderData = response.data || response;
      
      console.log('📦 ORDEN CARGADA:', {
        id: orderData.id,
        orderNumber: orderData.orderNumber,
        eligibleForInstallments: orderData.eligibleForInstallments,
        isCalculatorEvent: orderData.isCalculatorEvent,
        hasInstallments: !!orderData.installments,
        installmentsCount: orderData.installments?.length || 0,
        installments: orderData.installments
      });
      
      return orderData;
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
    
    try {
      setLoadingInvoice(true);
      const loadingToast = toast.loading('Generando factura...');
      
      const response: any = await invoiceService.generateInvoice(id!);
      
      // Extract invoice from response
      const invoice = response?.invoice || response;
      
      if (!invoice || !invoice.id) {
        throw new Error('No se pudo generar la factura');
      }
      
      const blob = await invoiceService.downloadInvoice(invoice.id);
      
      if (!blob || blob.size === 0) {
        throw new Error('El archivo PDF está vacío');
      }
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura-${invoice.invoiceNumber || id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.dismiss(loadingToast);
      toast.success('Factura descargada correctamente');
    } catch (error: any) {
      toast.dismiss();
      
      // Manejar caso especial: sistema de facturas no disponible
      if (error.response?.status === 423 || error.response?.data?.code === 'INVOICE_SYSTEM_NOT_AVAILABLE') {
        toast.error(
          'Facturas automáticas disponibles desde el 1 de enero de 2026. Recibirás tu factura por email.',
          { duration: 6000 }
        );
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Error al descargar la factura';
        toast.error(errorMessage);
      }
    } finally {
      setLoadingInvoice(false);
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
        <Loader2 className="w-8 h-8 animate-spin text-resona-light" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-500/10 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">No se encontró el pedido</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-amber-300', label: 'Pendiente' },
      IN_PROGRESS: { bg: 'bg-resona/15', text: 'text-resona-light', label: 'En Proceso' },
      COMPLETED: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', label: 'Completado' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' },
    };
    return badges[status] || { bg: 'bg-ink-800', text: 'text-cream/90', label: status };
  };

  const statusBadge = getStatusBadge(order.status);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/mis-pedidos')}
          className="flex items-center gap-2 text-cream/65 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Mis Pedidos
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-cream">Pedido #{order.orderNumber}</h1>
            <p className="text-cream/65 mt-1">
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
        {/* Botón para descargar factura */}
        <button
          onClick={handleDownloadInvoice}
          disabled={loadingInvoice}
          className="flex items-center gap-2 px-4 py-2 bg-resona hover:bg-resona-dark text-white rounded-lg transition disabled:opacity-50"
        >
          {loadingInvoice ? (
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

        {/* Botones de Modificación */}
        {modificationCheck?.canModify && order.status !== 'CANCELLED' && (
          <>
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-ink-800 border-2 border-green-600 text-emerald-400 rounded-lg hover:bg-green-50 transition"
            >
              <Edit className="w-4 h-4" />
              Editar Pedido
            </button>
            
            <button
              onClick={handleCancelOrder}
              className="flex items-center gap-2 px-4 py-2 bg-ink-800 border-2 border-red-600 text-red-400 rounded-lg hover:bg-red-50 transition"
            >
              <XCircle className="w-4 h-4" />
              Cancelar Pedido
            </button>
          </>
        )}
        
        {!modificationCheck?.canModify && modificationCheck?.reason && order.status !== 'CANCELLED' && (
          <div className="text-sm text-cream/65 bg-ink px-4 py-2 rounded-lg border">
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
        <div className="bg-ink-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Información del Pedido
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-cream/75">
              <Calendar className="w-5 h-5 text-cream/45" />
              <div>
                <p className="text-sm text-cream/50">Fecha del Evento</p>
                <p className="font-medium">
                  {new Date(order.startDate).toLocaleDateString('es-ES')} - {new Date(order.endDate).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>

            {/* Para eventos personalizados, mostrar el lugar. Para alquileres, el método de entrega */}
            {order.items?.some((item: any) => item.eventMetadata) ? (
              <div className="flex items-center gap-3 text-cream/75">
                <MapPin className="w-5 h-5 text-cream/45" />
                <div>
                  <p className="text-sm text-cream/50">Lugar del Evento</p>
                  <p className="font-medium">
                    {(() => {
                      // eventLocation puede ser string o objeto
                      const eventLoc = order.items?.find((item: any) => item.eventMetadata)?.eventMetadata?.eventLocation;
                      if (eventLoc) return eventLoc;
                      
                      // Fallback a order.eventLocation
                      if (typeof order.eventLocation === 'string') return order.eventLocation;
                      if (order.eventLocation?.address) return order.eventLocation.address;
                      
                      // Último fallback
                      return order.deliveryAddress?.address || 'Por confirmar';
                    })()}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 text-cream/75">
                  <MapPin className="w-5 h-5 text-cream/45" />
                  <div>
                    <p className="text-sm text-cream/50">Método de Entrega</p>
                    <p className="font-medium">
                      {order.deliveryType === 'PICKUP' ? 'Recogida en tienda' : 'Envío a domicilio'}
                    </p>
                  </div>
                </div>

                {order.deliveryType === 'DELIVERY' && order.deliveryAddress && (
                  <div className="pl-8">
                    <p className="text-sm text-cream/65">{order.deliveryAddress.address}</p>
                  </div>
                )}
              </>
            )}

            <div className="flex items-center gap-3 text-cream/75">
              <CreditCard className="w-5 h-5 text-cream/45" />
              <div>
                <p className="text-sm text-cream/50">Total</p>
                <p className="font-bold text-lg text-resona-light">{formatPrice(Number(order.total || 0))}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen de Pago y Fianza */}
        <div className="bg-ink-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Resumen de Pago</h2>
          
          <div className="space-y-3">
            {/* Subtotal */}
            <div className="flex justify-between text-cream/75">
              <span>Subtotal:</span>
              <span>{formatPrice(Number(order.subtotal || 0))}</span>
            </div>

            {/* Envío */}
            {order.shippingCost > 0 && (
              <div className="flex justify-between text-cream/75">
                <span>Envío/Montaje:</span>
                <span>{formatPrice(Number(order.shippingCost || 0))}</span>
              </div>
            )}

            {/* IVA */}
            <div className="flex justify-between text-cream/75">
              <span>IVA (21%):</span>
              <span>{formatPrice(Number(order.taxAmount || 0))}</span>
            </div>

            {/* Total */}
            <div className="flex justify-between text-lg font-bold text-cream pt-3 border-t">
              <span>Total:</span>
              <span className="text-resona-light">{formatPrice(Number(order.total || 0))}</span>
            </div>

            {/* Fianza - Solo para alquileres, NO para eventos personalizados */}
            {order.depositAmount > 0 && !order.items?.some((item: any) => item.product?.id === 'product-custom-event-virtual') && (
              <>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-amber-400">💰 Fianza (reembolsable):</span>
                    <span className="font-bold text-amber-400">{formatPrice(Number(order.depositAmount))}</span>
                  </div>
                  
                  {/* Estado de la fianza */}
                  <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    {order.depositStatus === 'PENDING' && (
                      <div className="text-sm text-amber-300">
                        <p className="font-medium mb-1">⏳ Fianza Pendiente</p>
                        <p>La fianza se cobrará antes de la entrega del material.</p>
                      </div>
                    )}
                    {order.depositStatus === 'CAPTURED' && (
                      <div className="text-sm text-resona-light">
                        <p className="font-medium mb-1">✓ Fianza Cobrada</p>
                        <p>Cobrada el {order.depositPaidAt ? new Date(order.depositPaidAt).toLocaleDateString('es-ES') : '-'}</p>
                        <p className="mt-1 text-xs">Se devolverá en 7 días tras la devolución satisfactoria del material.</p>
                      </div>
                    )}
                    {order.depositStatus === 'RELEASED' && (
                      <div className="text-sm text-emerald-300">
                        <p className="font-medium mb-1">✓ Fianza Devuelta</p>
                        <p>Devuelta el {order.depositReleasedAt ? new Date(order.depositReleasedAt).toLocaleDateString('es-ES') : '-'}</p>
                      </div>
                    )}
                    {order.depositStatus === 'PARTIALLY_RETAINED' && (
                      <div className="text-sm text-orange-800">
                        <p className="font-medium mb-1">⚠️ Fianza Parcialmente Retenida</p>
                        {order.depositRetainedAmount > 0 && (
                          <>
                            <p>Retenido: {formatPrice(Number(order.depositRetainedAmount))}</p>
                            <p>Devuelto: {formatPrice((Number(order.depositAmount) - Number(order.depositRetainedAmount)))}</p>
                          </>
                        )}
                        {order.depositNotes && (
                          <p className="mt-2 text-xs italic">Motivo: {order.depositNotes}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Información adicional sobre la fianza */}
                  {(order.depositStatus === 'PENDING' || order.depositStatus === 'CAPTURED') && (
                    <div className="mt-3 text-xs text-cream/65 bg-ink p-2 rounded">
                      <p className="font-medium">ℹ️ Sobre la fianza:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Cubre posibles daños o pérdidas del material</li>
                        <li>Se devuelve en 7 días hábiles tras la devolución</li>
                        <li>Si hay daños, se descontará del importe de la fianza</li>
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Pagos en Plazos - Solo para eventos de calculadora > 500€ */}
        {(() => {
          const shouldShow = order.eligibleForInstallments && order.isCalculatorEvent;
          console.log('💳 Renderizando InstallmentPayment?', {
            shouldShow,
            eligibleForInstallments: order.eligibleForInstallments,
            isCalculatorEvent: order.isCalculatorEvent
          });
          return shouldShow ? (
            <div className="mt-6">
              <InstallmentPayment 
                orderId={order.id}
                onPaymentComplete={() => {
                  // Recargar los datos del pedido
                  queryClient.invalidateQueries({ queryKey: ['order', id] });
                }}
              />
            </div>
          ) : null;
        })()}

        {/* Productos */}
        <div className="bg-ink-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Productos</h2>
          <div className="space-y-4">
            {order.items?.map((item: any) => (
              <div key={item.id} className="border-b pb-4 last:border-0">
                {/* Información básica del item */}
                <div className="flex gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-cream">{item.product?.name || 'Producto'}</h3>
                    <p className="text-sm text-cream/50">Cantidad: {item.quantity}</p>
                    <p className="text-sm text-cream/50">
                      {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-cream">{formatPrice(Number(item.subtotal || item.totalPrice || 0))}</p>
                    <p className="text-xs text-cream/50">{formatPrice(Number(item.pricePerDay || item.pricePerUnit || 0))}/día</p>
                  </div>
                </div>

                {/* Detalles del evento si existe eventMetadata */}
                {item.eventMetadata && (
                  <div className="mt-3 p-4 bg-resona/10 border-l-4 border-blue-500 rounded-r-lg space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🎉</span>
                      <h4 className="font-semibold text-cream">Detalles de tu Evento</h4>
                    </div>
                    
                    {/* Información básica del evento */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {item.eventMetadata.eventType && (
                        <div>
                          <span className="text-resona-light font-medium">Tipo:</span>
                          <span className="ml-2">{item.eventMetadata.eventType}</span>
                        </div>
                      )}
                      {item.eventMetadata.attendees && (
                        <div>
                          <span className="text-resona-light font-medium">Asistentes:</span>
                          <span className="ml-2">{item.eventMetadata.attendees}</span>
                        </div>
                      )}
                      {item.eventMetadata.duration && (
                        <div>
                          <span className="text-resona-light font-medium">Duración:</span>
                          <span className="ml-2">{item.eventMetadata.duration} {item.eventMetadata.durationType === 'hours' ? 'horas' : 'días'}</span>
                        </div>
                      )}
                      {item.eventMetadata.startTime && (
                        <div>
                          <span className="text-resona-light font-medium">Hora inicio:</span>
                          <span className="ml-2">{item.eventMetadata.startTime}</span>
                        </div>
                      )}
                      {item.eventMetadata.eventDate && (
                        <div>
                          <span className="text-resona-light font-medium">Fecha:</span>
                          <span className="ml-2">{new Date(item.eventMetadata.eventDate).toLocaleDateString('es-ES')}</span>
                        </div>
                      )}
                      {item.eventMetadata.eventLocation && (
                        <div className="col-span-2">
                          <span className="text-resona-light font-medium">📍 Ubicación:</span>
                          <span className="ml-2">{item.eventMetadata.eventLocation}</span>
                        </div>
                      )}
                    </div>

                    {/* Partes del evento */}
                    {item.eventMetadata.selectedParts && item.eventMetadata.selectedParts.length > 0 && (
                      <div>
                        <h5 className="font-medium text-cream mb-2">📦 Partes del Evento:</h5>
                        <ul className="space-y-1 text-sm ml-4">
                          {item.eventMetadata.selectedParts.map((part: any, idx: number) => (
                            <li key={idx} className="flex justify-between">
                              <span>• {decodeHTMLEntities(part.name)}</span>
                              {part.price > 0 && <span className="font-medium">{formatPrice(Number(part.price))}</span>}
                            </li>
                          ))}
                        </ul>
                        {item.eventMetadata.partsTotal > 0 && (
                          <p className="text-sm font-semibold mt-2 text-cream">
                            Subtotal Partes: {formatPrice(Number(item.eventMetadata.partsTotal))}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Extras del evento */}
                    {item.eventMetadata.selectedExtras && item.eventMetadata.selectedExtras.length > 0 && (
                      <div>
                        <h5 className="font-medium text-cream mb-2">✨ Extras:</h5>
                        <ul className="space-y-1 text-sm ml-4">
                          {item.eventMetadata.selectedExtras.map((extra: any, idx: number) => (
                            <li key={idx} className="flex justify-between">
                              <span>• {extra.name} {extra.quantity > 1 && `(x${extra.quantity})`}</span>
                              {extra.total > 0 && <span className="font-medium">{formatPrice(Number(extra.total))}</span>}
                            </li>
                          ))}
                        </ul>
                        {item.eventMetadata.extrasTotal > 0 && (
                          <p className="text-sm font-semibold mt-2 text-cream">
                            Subtotal Extras: {formatPrice(Number(item.eventMetadata.extrasTotal))}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Total del evento */}
                    {(item.eventMetadata.partsTotal || item.eventMetadata.extrasTotal) && (
                      <div className="pt-2 border-t border-resona/30">
                        <p className="text-sm font-bold text-cream">
                          💰 Total Evento: {formatPrice((
                            (Number(item.eventMetadata.partsTotal) || 0) + 
                            (Number(item.eventMetadata.extrasTotal) || 0)
                          ))}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Detalles del Evento / Notas */}
        {order.notes && (
          <div className="bg-ink-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📋 Detalles del Evento</h2>
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-cream/75 font-sans bg-ink p-4 rounded-lg border border-cream/10">
                {/* Decodificar HTML entities como &#x2F; */}
                {order.notes.replace(/&#x2F;/g, '/').replace(/&#x([0-9A-Fa-f]+);/g, (match: string, hex: string) => String.fromCharCode(parseInt(hex, 16)))}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailUserPage;
