import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface CheckoutFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
  billingDetails?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export const CheckoutForm = ({ clientSecret, amount, onSuccess, onError, billingDetails }: CheckoutFormProps) => {
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
      console.log('💳 Confirmando pago con Stripe...');
      
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
          payment_method_data: {
            billing_details: {
              name: billingDetails?.name || 'Cliente',
              email: billingDetails?.email || undefined,
              phone: billingDetails?.phone || undefined,
            }
          }
        },
        redirect: 'if_required',
      });

      console.log('💳 Respuesta de Stripe:', { error, paymentIntent });

      if (error) {
        console.error('❌ Error de Stripe:', error);
        toast.error(error.message || 'Error al procesar el pago');
        onError(error.message || 'Error desconocido');
      } else if (paymentIntent) {
        console.log('✅ Payment Intent status:', paymentIntent.status);
        
        if (paymentIntent.status === 'succeeded') {
          console.log('✅ Pago completado exitosamente');
          toast.success('¡Pago realizado con éxito!');
          onSuccess();
        } else if (paymentIntent.status === 'processing') {
          console.log('⏳ Pago en procesamiento...');
          toast.info('El pago está siendo procesado');
          onSuccess(); // También llamar onSuccess para procesar el pago
        } else if (paymentIntent.status === 'requires_payment_method') {
          console.warn('⚠️ Se requiere método de pago');
          toast.error('Por favor, verifica tu método de pago');
          onError('Se requiere método de pago');
        } else {
          console.warn('⚠️ Estado desconocido:', paymentIntent.status);
          toast.warning(`Estado del pago: ${paymentIntent.status}`);
        }
      } else {
        console.error('❌ No hay error ni paymentIntent');
        toast.error('Respuesta inesperada de Stripe');
        onError('Respuesta inesperada');
      }
    } catch (err: any) {
      console.error('❌ Excepción al confirmar pago:', err);
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
            fields: {
              billingDetails: {
                email: 'never',
                phone: 'never',
                name: 'never',
              }
            },
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
