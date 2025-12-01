import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { CreditCard, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ModificationCheckoutForm } from '../components/payment/ModificationCheckoutForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const ModificationPaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const modificationId = searchParams.get('modificationId');
  const amount = searchParams.get('amount');
  const [clientSecret, setClientSecret] = useState('');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response: any = await api.get(`/orders/${orderId}`);
      return response.data || response;
    },
  });

  // Fetch payment intent
  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        const response: any = await api.get(
          `/order-modifications/${orderId}/payment-intent?modificationId=${modificationId}`
        );
        
        if (response.clientSecret) {
          setClientSecret(response.clientSecret);
        } else if (response.data?.clientSecret) {
          setClientSecret(response.data.clientSecret);
        }
      } catch (error: any) {
        console.error('Error fetching payment intent:', error);
        toast.error('Error al inicializar el pago');
      }
    };

    if (orderId && modificationId) {
      fetchPaymentIntent();
    }
  }, [orderId, modificationId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!order || !amount) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: No se encontró la información del pago</p>
        </div>
      </div>
    );
  }

  const stripeOptions: any = {
    clientSecret: clientSecret,
    appearance: {
      theme: 'stripe',
    },
    // Métodos de pago habilitados: Tarjeta, Transferencia bancaria
    paymentMethodOrder: [
      'card',        // Tarjeta de crédito/débito
      'paypal',      // PayPal
      'sepa_debit',  // Transferencia bancaria
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <button
          onClick={() => navigate(`/mis-pedidos/${orderId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Pedido
        </button>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold">Pago por Modificación</h1>
              <p className="text-gray-600">Pedido #{order.orderNumber}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Cargo adicional:</span>
              <span className="text-2xl font-bold text-blue-600">€{Number(amount).toFixed(2)}</span>
            </div>
            <p className="text-sm text-gray-500">
              Este cargo corresponde a los productos adicionales que has añadido al pedido
            </p>
          </div>
        </div>

        {/* Stripe Payment Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Información de Pago</h2>
          
          {clientSecret ? (
            <Elements stripe={stripePromise} options={stripeOptions}>
              <ModificationCheckoutForm
                orderId={orderId!}
                modificationId={modificationId || ''}
                amount={Number(amount)}
                onSuccess={() => {
                  // Invalidar el cache del pedido para que se actualice
                  queryClient.invalidateQueries({ queryKey: ['order', orderId] });
                  toast.success('Pago procesado correctamente');
                  navigate(`/mis-pedidos/${orderId}`);
                }}
              />
            </Elements>
          ) : (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModificationPaymentPage;
