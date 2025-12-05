import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Calendar, CreditCard, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface Installment {
  id: string;
  installmentNumber: number;
  percentage: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: string;
}

interface InstallmentPaymentProps {
  orderId: string;
  onPaymentComplete?: () => void;
}

const PaymentForm = ({ installmentId, amount, onSuccess }: { installmentId: string; amount: number; onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/my-orders`,
        },
        redirect: 'if_required'
      });

      if (error) {
        toast.error(error.message || 'Error al procesar el pago');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirmar el pago en el backend
        await api.post(`/installments/${installmentId}/confirm`, {
          paymentIntentId: paymentIntent.id,
          chargeId: paymentIntent.charges?.data[0]?.id
        });
        
        toast.success('Plazo pagado correctamente');
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error al pagar:', error);
      toast.error(error.response?.data?.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Procesando...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Pagar €{amount.toFixed(2)}
          </>
        )}
      </button>
    </form>
  );
};

export const InstallmentPayment = ({ orderId, onPaymentComplete }: InstallmentPaymentProps) => {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    loadInstallments();
  }, [orderId]);

  const loadInstallments = async () => {
    try {
      setLoading(true);
      const response: any = await api.get(`/installments/order/${orderId}`);
      setInstallments(response.installments || []);
      setSummary(response.summary || {});
    } catch (error) {
      console.error('Error al cargar plazos:', error);
      toast.error('Error al cargar los plazos de pago');
    } finally {
      setLoading(false);
    }
  };

  const handlePayInstallment = async (installment: Installment) => {
    try {
      setSelectedInstallment(installment);
      
      // Crear Payment Intent
      const response: any = await api.post(`/installments/${installment.id}/payment-intent`);
      setClientSecret(response.clientSecret);
    } catch (error: any) {
      console.error('Error al iniciar pago:', error);
      toast.error(error.response?.data?.message || 'Error al iniciar el pago');
      setSelectedInstallment(null);
    }
  };

  const handlePaymentSuccess = () => {
    setSelectedInstallment(null);
    setClientSecret(null);
    loadInstallments();
    onPaymentComplete?.();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Pagado
          </span>
        );
      case 'PENDING':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Pendiente
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Procesando
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const isDueSoon = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-resona border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!installments || installments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Resumen de plazos */}
      {summary && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen de Pagos en Plazos</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">€{Number(summary.total).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pagado</p>
              <p className="text-2xl font-bold text-green-600">€{Number(summary.paid).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pendiente</p>
              <p className="text-2xl font-bold text-orange-600">€{Number(summary.pending).toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de plazos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Calendario de Pagos</h3>
          
          {/* Botón Pagar Todo - Solo si hay plazos pendientes */}
          {summary && summary.pending > 0 && (
            <button
              onClick={() => {
                // TODO: Implementar pago de todos los plazos pendientes de una vez
                alert('Función en desarrollo: Pagar todos los plazos pendientes de una vez (€' + Number(summary.pending).toFixed(2) + ')');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm flex items-center gap-2 transition-all"
            >
              <CreditCard className="w-4 h-4" />
              Pagar Todo de Una Vez (€{Number(summary.pending).toFixed(2)})
            </button>
          )}
        </div>
        
        {installments.map((installment) => {
          const isPending = installment.status === 'PENDING';
          const isPaid = installment.status === 'COMPLETED';
          const dueSoon = isDueSoon(installment.dueDate);
          
          return (
            <div
              key={installment.id}
              className={`rounded-lg border-2 p-5 ${
                isPaid
                  ? 'bg-green-50 border-green-300'
                  : dueSoon
                  ? 'bg-orange-50 border-orange-300'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-bold text-gray-900">
                      Plazo {installment.installmentNumber}/3 ({installment.percentage}%)
                    </h4>
                    {getStatusBadge(installment.status)}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Vence: <span className="font-semibold">{formatDate(installment.dueDate)}</span>
                    </span>
                  </div>
                  
                  {isPaid && installment.paidDate && (
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      <span>Pagado el {formatDate(installment.paidDate)}</span>
                    </div>
                  )}
                  
                  {dueSoon && isPending && (
                    <div className="flex items-center gap-2 text-sm text-orange-700 font-medium mt-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>¡Vence pronto! Realiza el pago cuanto antes</span>
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">
                    €{Number(installment.amount).toFixed(2)}
                  </p>
                </div>
              </div>

              {isPending && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handlePayInstallment(installment)}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    Pagar Este Plazo
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal de pago */}
      {selectedInstallment && clientSecret && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-2">
              Pagar Plazo {selectedInstallment.installmentNumber}/3
            </h3>
            <p className="text-gray-600 mb-6">
              Monto a pagar: <span className="font-bold text-2xl text-gray-900">€{Number(selectedInstallment.amount).toFixed(2)}</span>
            </p>

            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#00B894',
                  }
                }
              }}
            >
              <PaymentForm
                installmentId={selectedInstallment.id}
                amount={Number(selectedInstallment.amount)}
                onSuccess={handlePaymentSuccess}
              />
            </Elements>

            <button
              onClick={() => {
                setSelectedInstallment(null);
                setClientSecret(null);
              }}
              className="w-full mt-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
