import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { CheckoutForm } from '../components/checkout/CheckoutForm';
import { paymentService } from '../services/payment.service';
import { Loader2, Package, MapPin, Calendar, CreditCard } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';

const CheckoutPageStripe = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    loadOrderAndPayment();
  }, [orderId]);

  const loadOrderAndPayment = async () => {
    try {
      setLoading(true);

      // Cargar Stripe
      const stripe = await paymentService.getStripe();
      setStripePromise(Promise.resolve(stripe));

      // Si hay orderId, es un pago de una orden existente
      if (orderId) {
        // Obtener información del pedido
        const orderDataResponse = await api.get(`/orders/${orderId}`);
        setOrder(orderDataResponse);

        // Crear Payment Intent
        const paymentData: any = await paymentService.createPaymentIntent(orderId);
        setClientSecret(paymentData.clientSecret);
      } else {
        // Es un pago inicial - recuperar datos de la orden desde sessionStorage
        const pendingOrderData = sessionStorage.getItem('pendingOrderData');
        if (!pendingOrderData) {
          toast.error('No hay datos de orden pendiente');
          navigate('/carrito');
          return;
        }

        const parsedOrderData = JSON.parse(pendingOrderData);
        setOrderData(parsedOrderData);

        // Crear un Payment Intent para pago inicial (sin orderId)
        const paymentData: any = await api.post('/payments/create-intent', {
          orderData: parsedOrderData,
        });
        setClientSecret(paymentData.clientSecret);

        // Mostrar resumen del pedido
        const subtotal = parsedOrderData.items.reduce((sum: number, item: any) => sum + item.totalPrice, 0);
        const shipping = parsedOrderData.shippingCost || 0;
        const tax = (subtotal + shipping) * 0.21;
        const total = subtotal + shipping + tax;

        setOrder({
          orderNumber: 'PENDIENTE',
          startDate: parsedOrderData.items[0]?.startDate,
          endDate: parsedOrderData.items[parsedOrderData.items.length - 1]?.endDate,
          deliveryType: parsedOrderData.deliveryType,
          items: parsedOrderData.items,
          subtotal,
          shippingCost: shipping,
          taxAmount: tax,
          total,
        });
      }
    } catch (error: any) {
      console.error('Error loading checkout:', error);
      
      // Si es error de autenticación, redirigir a login
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente');
        navigate('/login', { state: { from: '/checkout-stripe' } });
        return;
      }
      
      toast.error(error.response?.data?.message || error.message || 'Error al cargar el checkout');
      navigate('/carrito');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    toast.success('¡Pago realizado con éxito!');
    
    // Si es pago inicial (sin orderId), crear la orden ahora
    if (!orderId && orderData && user) {
      try {
        console.log('📦 Datos originales:', orderData);
        
        // Adaptar el formato al que espera el backend
        const firstItem = orderData.items[0];
        const lastItem = orderData.items[orderData.items.length - 1];
        
        // Parsear la dirección de entrega (viene como string)
        const addressParts = (orderData.deliveryAddress || '').split(',').map((s: string) => s.trim());
        
        const adaptedOrderData = {
          startDate: firstItem?.startDate || new Date().toISOString(),
          endDate: lastItem?.endDate || new Date().toISOString(),
          eventLocation: {
            street: addressParts[0] || 'N/A',
            city: addressParts[1] || 'N/A',
            postalCode: addressParts[2] || '00000',
            country: addressParts[addressParts.length - 1] || 'España',
          },
          contactPerson: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          contactPhone: user.phone || 'N/A',
          notes: orderData.notes || '',
          deliveryType: orderData.deliveryType || 'PICKUP',
          deliveryAddress: orderData.deliveryType === 'DELIVERY' ? {
            street: addressParts[0] || 'N/A',
            city: addressParts[1] || 'N/A',
            postalCode: addressParts[2] || '00000',
            country: addressParts[addressParts.length - 1] || 'España',
          } : undefined,
          paymentTerm: 'FULL_UPFRONT' as const,
          items: orderData.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity || 1,
          })),
        };
        
        console.log('📦 Datos adaptados para backend:', adaptedOrderData);
        
        const response: any = await api.post('/orders', adaptedOrderData);
        
        console.log('✅ Respuesta del servidor:', response);
        
        const createdOrder = response?.order || response;
        const createdOrderId = createdOrder?.id;
        
        if (!createdOrderId) {
          throw new Error('No se recibió ID de orden del servidor');
        }
        
        // Limpiar sessionStorage
        sessionStorage.removeItem('pendingOrderData');
        
        // Redirigir a página de éxito con el nuevo orderId
        setTimeout(() => {
          navigate(`/checkout/success?orderId=${createdOrderId}`);
        }, 1000);
      } catch (error: any) {
        console.error('❌ Error completo:', error);
        console.error('❌ Respuesta del servidor:', error.response?.data);
        console.error('❌ Detalles de validación:', JSON.stringify(error.response?.data?.error?.details, null, 2));
        console.error('❌ Status:', error.response?.status);
        
        const errorDetails = error.response?.data?.error?.details;
        const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Error al crear la orden';
        
        // Mostrar detalles de validación si existen
        if (errorDetails) {
          console.table(errorDetails);
        }
        
        toast.error(`Error al validar el pedido: ${errorMessage}`);
        
        // NO redirigir al carrito - mantener en la página para ver el error
        // navigate('/carrito');
      }
    } else {
      // Es un pago de una orden existente
      setTimeout(() => {
        navigate(`/checkout/success?orderId=${orderId}`);
      }, 1000);
    }
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
    clientSecret: clientSecret || '',
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
    // Métodos de pago habilitados: Tarjeta, Transferencia bancaria
    paymentMethodOrder: [
      'card',        // Tarjeta de crédito/débito
      'sepa_debit',  // Transferencia bancaria
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
                    {order.items.map((item: any, index: number) => (
                      <div key={item.id || `item-${index}`} className="flex justify-between text-sm">
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
                  💳 <strong>Método de pago:</strong> Tarjeta de crédito/débito
                </p>
              </div>

              <Elements stripe={stripePromise} options={options}>
                <CheckoutForm
                  clientSecret={clientSecret}
                  amount={Number(order.total)}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  billingDetails={{
                    name: order.contactPerson || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Cliente',
                    email: order.user?.email || user?.email,
                    phone: order.contactPhone || user?.phone,
                  }}
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
