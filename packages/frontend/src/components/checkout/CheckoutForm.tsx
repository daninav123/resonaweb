import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface CheckoutFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export const CheckoutForm = ({ clientSecret, amount, onSuccess, onError }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message || 'Error al procesar el pago');
        onError(error.message || 'Error desconocido');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast.success('¡Pago realizado con éxito!');
        onSuccess();
      }
    } catch (err: any) {
      toast.error('Error al procesar el pago');
      onError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Información de Pago</h3>
        
        <PaymentElement 
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Total a pagar:</span>
          <span className="text-2xl font-bold text-resona">€{amount.toFixed(2)}</span>
        </div>

        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full bg-resona text-white py-3 px-6 rounded-lg font-semibold hover:bg-resona-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Procesando pago...
            </>
          ) : (
            `Pagar €${amount.toFixed(2)}`
          )}
        </button>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>🔒 Pago seguro procesado por Stripe</p>
        <p className="mt-1">Tus datos están protegidos con encriptación de nivel bancario</p>
      </div>
    </form>
  );
};
