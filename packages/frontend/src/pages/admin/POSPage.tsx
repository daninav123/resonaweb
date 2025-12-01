import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripeTerminal } from '@stripe/terminal-js';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';
import { Smartphone, CheckCircle2, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import './POSPage.css';

export const POSPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [terminal, setTerminal] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState('Inicializando...');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId && token) {
      loadOrder();
      initTerminal();
    }
  }, [orderId, token]);

  const loadOrder = async () => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response);
    } catch (error: any) {
      console.error('Error cargando pedido:', error);
      setError('No se pudo cargar el pedido');
    }
  };

  const initTerminal = async () => {
    try {
      const term = await loadStripeTerminal({
        onFetchConnectionToken: async () => {
          const response = await api.post('/terminal/connection-token');
          return response.secret;
        },
        onUnexpectedReaderDisconnect: () => {
          setStatus('⚠️ Lector desconectado');
          toast.error('El lector se desconectó');
        },
      });

      setTerminal(term);
      setStatus('✅ Listo para cobrar');
      toast.success('Terminal conectado');
    } catch (error) {
      console.error('Error inicializando terminal:', error);
      setStatus('❌ Error al conectar');
      setError('No se pudo inicializar el terminal. Asegúrate de que NFC esté activado.');
    }
  };

  const collectDeposit = async () => {
    if (!terminal || !order) {
      toast.error('Terminal no está listo');
      return;
    }

    setProcessing(true);
    setStatus(`💰 Cobrando €${Number(order.depositAmount).toFixed(2)}...`);
    setError('');

    try {
      // 1. Crear Payment Intent para Terminal
      const paymentIntentResponse = await api.post('/terminal/deposit-payment-intent', {
        orderId: order.id,
      });

      const { clientSecret, paymentIntentId } = paymentIntentResponse.data;

      // 2. Cobrar con Tap to Pay
      setStatus('👋 Acerca la tarjeta al teléfono...');
      
      const collectResult = await terminal.collectPaymentMethod(clientSecret);

      if (collectResult.error) {
        throw new Error(collectResult.error.message);
      }

      // 3. Procesar el pago
      setStatus('🔄 Procesando pago...');
      
      const processResult = await terminal.processPayment(collectResult.paymentIntent);

      if (processResult.error) {
        throw new Error(processResult.error.message);
      }

      if (processResult.paymentIntent.status === 'succeeded') {
        // 4. Confirmar en el backend
        await api.post('/terminal/confirm-payment', {
          paymentIntentId,
          orderId: order.id,
        });

        setStatus('✅ ¡Fianza cobrada!');
        setSuccess(true);
        toast.success(`Fianza cobrada: €${Number(order.depositAmount).toFixed(2)}`);

        // Vibrar si es posible
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
      }
    } catch (error: any) {
      console.error('Error cobrando fianza:', error);
      setStatus('❌ Error en el cobro');
      setError(error.message || 'Error al cobrar la fianza');
      toast.error(error.message || 'Error al cobrar la fianza');
    } finally {
      setProcessing(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
          <p className="text-gray-600">Debes iniciar sesión para usar el terminal</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="mb-8 animate-bounce-once">
            <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-3">¡Cobrado!</h1>
            <p className="text-2xl font-bold text-green-600">
              €{Number(order.depositAmount).toFixed(2)}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-5 mb-8 text-left space-y-2">
            <p className="text-base text-gray-700">
              <strong className="font-semibold">Pedido:</strong> {order.orderNumber}
            </p>
            <p className="text-base text-gray-700">
              <strong className="font-semibold">Cliente:</strong> {order.user?.firstName} {order.user?.lastName}
            </p>
          </div>

          <button
            onClick={() => navigate('/admin/orders')}
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-98 transition-all font-semibold text-lg shadow-lg"
          >
            Volver a Pedidos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 pb-safe">
      <div className="max-w-md mx-auto pt-safe pt-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver</span>
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Terminal de Cobro</h1>
              <p className="text-sm text-gray-600">{status}</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex gap-2">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Información del Pedido */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Pedido</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Pedido:</span>
              <span className="font-semibold">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cliente:</span>
              <span className="font-semibold">
                {order.user?.firstName} {order.user?.lastName}
              </span>
            </div>
            {order.user?.phone && (
              <div className="flex justify-between">
                <span className="text-gray-600">Teléfono:</span>
                <span className="font-semibold">{order.user.phone}</span>
              </div>
            )}
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Fianza:</span>
                <span className="text-3xl font-bold text-blue-600">
                  €{Number(order.depositAmount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de Cobro */}
        <button
          onClick={collectDeposit}
          disabled={processing || !terminal || success}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-6 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 touch-manipulation"
        >
          {processing ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Smartphone className="w-6 h-6" />
              Cobrar con Tap to Pay
            </>
          )}
        </button>

        {/* Instrucciones */}
        {!processing && !success && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-5">
            <p className="text-base text-gray-700 text-center leading-relaxed">
              💡 <span className="font-medium">Tap en el botón</span> y pide al cliente que acerque su tarjeta o móvil
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default POSPage;
