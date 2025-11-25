import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Phone, Building2, CreditCard, CheckCircle, Copy, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ManualPaymentInstructionsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [copied, setCopied] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response: any = await api.get(`/orders/${orderId}`);
      return response.data || response;
    },
    enabled: !!orderId,
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copiado al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">No se encontró el pedido</p>
          <button
            onClick={() => navigate('/mis-pedidos')}
            className="mt-4 text-blue-600 hover:underline"
          >
            Volver a mis pedidos
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pedido Creado!</h1>
          <p className="text-gray-600">Pedido #{order?.orderNumber}</p>
          <p className="text-lg font-semibold text-blue-600 mt-2">
            Total a pagar: €{Number(order?.total || 0).toFixed(2)}
          </p>
        </div>

        {/* Payment Instructions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Instrucciones de Pago
          </h2>

          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <p className="text-sm text-blue-900">
              <strong>⏰ Importante:</strong> Debes realizar el pago en las próximas <strong>24 horas</strong>. 
              Incluye la referencia del pedido para que podamos identificar tu pago.
            </p>
          </div>

          {/* Bizum Option */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-600" />
              Opción 1: Bizum
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Teléfono:</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-mono font-semibold text-gray-900">+34 613 881 414</p>
                    <button
                      onClick={() => handleCopy('+34 613 881 414')}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Copy className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Importe:</p>
                  <p className="text-lg font-semibold text-green-600">€{Number(order?.total || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Concepto:</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-mono font-semibold text-gray-900">PEDIDO-{order?.orderNumber}</p>
                    <button
                      onClick={() => handleCopy(`PEDIDO-${order?.orderNumber}`)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Copy className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Transfer Option */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Opción 2: Transferencia Bancaria
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Titular:</p>
                  <p className="font-semibold text-gray-900">ReSona Events S.L.</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">IBAN:</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-mono font-semibold text-gray-900">ES00 0000 0000 0000 0000 0000</p>
                    <button
                      onClick={() => handleCopy('ES00 0000 0000 0000 0000 0000')}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Copy className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">BIC/SWIFT:</p>
                  <p className="font-mono font-semibold text-gray-900">CAIXESBBXXX</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Importe:</p>
                  <p className="text-lg font-semibold text-green-600">€{Number(order?.total || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Concepto:</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-mono font-semibold text-gray-900">PEDIDO-{order?.orderNumber}</p>
                    <button
                      onClick={() => handleCopy(`PEDIDO-${order?.orderNumber}`)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Copy className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Importante</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Realiza el pago en las próximas <strong>24 horas</strong></li>
              <li>• Incluye siempre la referencia: <strong>PEDIDO-{order?.orderNumber}</strong></li>
              <li>• Confirmaremos tu pedido cuando recibamos el pago</li>
              <li>• Recibirás un email de confirmación</li>
            </ul>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Pedido</h3>
          
          {order?.items && order.items.length > 0 && (
            <div className="space-y-2 mb-4">
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
          )}

          <div className="border-t pt-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-blue-600">€{Number(order?.total || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/mis-pedidos')}
            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Ver Mis Pedidos
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            Volver al Inicio
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Contact Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Tienes dudas? Contáctanos en{' '}
            <a href="mailto:info@resonaevents.com" className="text-blue-600 hover:underline">
              info@resonaevents.com
            </a>
            {' '}o llámanos al{' '}
            <a href="tel:+34613881414" className="text-blue-600 hover:underline">
              +34 613 881 414
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManualPaymentInstructionsPage;
