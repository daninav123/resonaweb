import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, Download, Mail } from 'lucide-react';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lanzar confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    if (!orderId) {
      navigate('/orders');
      return;
    }

    try {
      const orderData = await api.get(`/orders/${orderId}`);
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-resona mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Icono de éxito */}
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Pago Realizado con Éxito!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Tu pedido ha sido confirmado y procesado correctamente
          </p>

          {/* Información del pedido */}
          {order && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-sm text-gray-600">Número de pedido</p>
                  <p className="font-semibold text-lg">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total pagado</p>
                  <p className="font-semibold text-lg text-resona">
                    €{Number(order.total).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha del evento</p>
                  <p className="font-semibold">
                    {new Date(order.startDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <p className="font-semibold text-green-600">Confirmado</p>
                </div>
              </div>
            </div>
          )}

          {/* Próximos pasos */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-semibold text-gray-900 mb-3">📋 Próximos Pasos</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <Mail className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                <span>Recibirás un email de confirmación con todos los detalles</span>
              </li>
              <li className="flex items-start">
                <Package className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                <span>Te contactaremos para coordinar la entrega o recogida</span>
              </li>
              <li className="flex items-start">
                <Download className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                <span>Podrás descargar tu factura desde el panel de pedidos</span>
              </li>
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(`/orders/${orderId}`)}
              className="bg-resona text-white px-6 py-3 rounded-lg font-semibold hover:bg-resona-dark transition-colors"
            >
              Ver Detalles del Pedido
            </button>
            <button
              onClick={() => navigate('/products')}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Seguir Comprando
            </button>
          </div>

          {/* Información de contacto */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              ¿Tienes alguna pregunta? Contáctanos en{' '}
              <a href="mailto:info@resona.com" className="text-resona hover:underline">
                info@resona.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
