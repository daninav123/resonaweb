import React, { useState, useEffect } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

interface ModificationCheckoutFormProps {
  orderId: string;
  modificationId: string;
  amount: number;
  onSuccess: () => void;
}

export const ModificationCheckoutForm: React.FC<ModificationCheckoutFormProps> = ({
  orderId,
  modificationId,
  amount,
  onSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/mis-pedidos/${orderId}?payment=success`,
          payment_method_data: {
            billing_details: {
              name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Cliente',
              email: user?.email || undefined,
              phone: user?.phone || undefined,
            }
          }
        },
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message || 'Error al procesar el pago');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Pago exitoso
        toast.success('Pago procesado correctamente');
        onSuccess();
      }
    } catch (error: any) {
      toast.error('Error al procesar el pago');
      console.error('Payment error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          💳 Método de pago: Tarjeta de crédito/débito
        </p>
      </div>

      <PaymentElement 
        options={{
          fields: {
            billingDetails: {
              email: 'never',
              phone: 'never',
              name: 'never',
            }
          },
        }}
      />
      
      <button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Procesando...
          </>
        ) : (
          `Pagar €${amount.toFixed(2)}`
        )}
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        El pago se procesará de forma segura mediante Stripe
      </p>
    </form>
  );
};
