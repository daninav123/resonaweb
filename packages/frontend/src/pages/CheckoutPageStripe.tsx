import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { CheckoutForm } from '../components/checkout/CheckoutForm';
import { paymentService } from '../services/payment.service';
import { Loader2, Package, MapPin, Calendar, CreditCard } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const CheckoutPageStripe = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<any>(null);

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

      // Cargar Stripe
      const stripe = await paymentService.getStripe();
      setStripePromise(Promise.resolve(stripe));

      // Obtener información del pedido
      const orderData = await api.get(`/orders/${orderId}`);
      setOrder(orderData);

      // Crear Payment Intent
      const paymentData: any = await paymentService.createPaymentIntent(orderId);
      setClientSecret(paymentData.clientSecret);

    } catch (error: any) {
      console.error('Error loading checkout:', error);
      toast.error(error.message || 'Error al cargar el checkout');
      navigate('/mis-pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    toast.success('¡Pago realizado con éxito!');
    
    // Esperar un momento para que se procese en el backend
    setTimeout(() => {
      navigate(`/checkout/success?orderId=${orderId}`);
    }, 1000);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    toast.error('Error en el pago');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-resona mx-auto mb-4" />
          <p className="text-gray-600">Cargando checkout...</p>
        </div>
      </div>
    );
  }

  if (!order || !clientSecret || !stripePromise) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">Error al cargar el checkout</p>
          <button
            onClick={() => navigate('/mis-pedidos')}
            className="mt-4 text-resona hover:underline"
          >
            Volver a pedidos
          </button>
        </div>
      </div>
    );
  }

  const options: any = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#5ebbff',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
    // Métodos de pago habilitados: Tarjeta, PayPal, Transferencia SEPA
    paymentMethodOrder: [
      'card',        // Tarjeta de crédito/débito
      'paypal',      // PayPal
      'sepa_debit',  // Transferencia bancaria SEPA
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Finalizar Pago</h1>
          <p className="text-gray-600 mt-2">Pedido #{order.orderNumber}</p>
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
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>€{Number(order.subtotal).toFixed(2)}</span>
                </div>

                {order.shippingCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Envío</span>
                    <span>€{Number(order.shippingCost).toFixed(2)}</span>
                  </div>
                )}

                {order.taxAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">IVA</span>
                    <span>€{Number(order.taxAmount).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-resona">€{Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de pago */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <CreditCard className="w-6 h-6 text-resona mr-2" />
                <h2 className="text-xl font-semibold">Método de Pago</h2>
              </div>

              {/* Mensaje sobre métodos de pago */}
              <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                <p className="text-sm text-blue-900">
                  💳 <strong>Aceptamos múltiples métodos de pago:</strong> Tarjeta de crédito/débito, PayPal, Transferencia bancaria (SEPA/Bizum) y más.
                </p>
              </div>

              <Elements stripe={stripePromise} options={options}>
                <CheckoutForm
                  clientSecret={clientSecret}
                  amount={Number(order.total)}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPageStripe;
