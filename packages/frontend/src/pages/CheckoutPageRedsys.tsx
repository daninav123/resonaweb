import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Loader2, Package, MapPin, Calendar, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const CheckoutPageRedsys = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const formRef = useRef<HTMLFormElement>(null);

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    loadOrderAndPayment();
  }, [orderId]);

  const loadOrderAndPayment = async () => {
    if (!orderId) {
      toast.error('No se especificó un pedido');
      navigate('/mis-pedidos');
      return;
    }

    try {
      setLoading(true);

      // Obtener información del pedido
      const orderData = await api.get(`/orders/${orderId}`);
      setOrder(orderData);

      // Crear formulario de pago con Redsys
      const redsysData: any = await api.post(`/redsys/payment/${orderId}`, {});
      setPaymentData(redsysData);

      console.log('💳 Datos de pago Redsys:', redsysData);

      // Auto-submit del formulario después de un momento
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.submit();
        }
      }, 1000);

    } catch (error: any) {
      console.error('Error loading checkout:', error);
      toast.error(error.message || 'Error al cargar el checkout');
      navigate('/mis-pedidos');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Preparando pago seguro...</p>
          <p className="text-sm text-gray-500">Serás redirigido a Redsys</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Finalizar Pago</h1>
          <p className="text-gray-600 mt-2">Pedido #{order?.orderNumber}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Resumen del Pedido</h2>

              {/* Información del evento */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Fecha del evento</p>
                    <p className="font-medium">
                      {new Date(order.startDate).toLocaleDateString('es-ES')} - 
                      {new Date(order.endDate).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Entrega</p>
                    <p className="font-medium">{order.deliveryType}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Package className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Productos</p>
                    <p className="font-medium">{order.items?.length || 0} items</p>
                  </div>
                </div>
              </div>

              {/* Productos */}
              {order.items && order.items.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Artículos</h3>
                  <div className="space-y-2">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.product?.name || 'Producto'} x{item.quantity}
                        </span>
                        <span className="font-medium">
                          €{Number(item.totalPrice).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Totales */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-blue-600">€{Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de redirección a Redsys */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <CreditCard className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold">Pago Seguro</h2>
              </div>

              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                <p className="text-sm text-blue-900">
                  <strong>🔒 Pago 100% Seguro:</strong> Serás redirigido a la pasarela de pago segura de Redsys.
                </p>
                <p className="text-sm text-blue-800 mt-2">
                  Puedes pagar con:
                </p>
                <ul className="text-sm text-blue-800 mt-1 ml-4 list-disc">
                  <li>📱 <strong>Bizum</strong></li>
                  <li>💳 <strong>Tarjeta de crédito/débito</strong></li>
                  <li>🏦 <strong>Otros métodos</strong></li>
                </ul>
              </div>

              {/* Formulario oculto que se enviará automáticamente */}
              <form
                ref={formRef}
                method="POST"
                action={paymentData.url}
                className="hidden"
              >
                <input type="hidden" name="Ds_SignatureVersion" value={paymentData.params.Ds_SignatureVersion} />
                <input type="hidden" name="Ds_MerchantParameters" value={paymentData.params.Ds_MerchantParameters} />
                <input type="hidden" name="Ds_Signature" value={paymentData.params.Ds_Signature} />
              </form>

              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Redirigiendo a Redsys...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPageRedsys;
